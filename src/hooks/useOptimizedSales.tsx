import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Sale {
  id: string;
  sale_number: string;
  customer_name?: string;
  customer_email?: string;
  total_amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  sale_items: Array<{
    quantity: number;
    unit_price: number;
    total_price: number;
    products: {
      name: string;
      sku: string;
    };
  }>;
}

interface SaleData {
  customer_name?: string;
  customer_email?: string;
  total_amount: number;
  payment_method: string;
}

interface SaleItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface SaleResult {
  success: boolean;
  sale_id?: string;
  sale_number?: string;
  error?: string;
  message: string;
}

export function useOptimizedSales() {
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const processSale = async (saleData: SaleData, items: SaleItem[]): Promise<SaleResult> => {
    if (items.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No hay productos en el carrito",
      });
      return { success: false, message: "No hay productos en el carrito" };
    }

    setProcessing(true);
    
    try {
      // Llamar a la función de Supabase para procesar la venta
      const { data, error } = await supabase.rpc('process_complete_sale', {
        sale_data: saleData,
        sale_items: items
      });

      if (error) {
        console.error('Error processing sale:', error);
        toast({
          variant: "destructive",
          title: "Error al procesar venta",
          description: error.message,
        });
        return { success: false, message: error.message };
      }

      const result = data as SaleResult;
      
      if (result.success) {
        toast({
          title: "¡Venta procesada!",
          description: `Venta ${result.sale_number} por $${saleData.total_amount.toFixed(2)}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error en la venta",
          description: result.error || result.message,
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error inesperado';
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
      return { success: false, message: errorMessage };
    } finally {
      setProcessing(false);
    }
  };

  // Hook para obtener estadísticas del dashboard
  const getDashboardStats = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_dashboard_stats');
      
      if (error) {
        console.error('Error getting dashboard stats:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error in getDashboardStats:', error);
      return null;
    }
  }, []);

  // Hook para obtener ventas recientes con real-time
  const useRealtimeSales = () => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);

    const loadSales = useCallback(async () => {
      try {
        const { data, error } = await supabase
          .from('sales')
          .select(`
            id,
            sale_number,
            customer_name,
            customer_email,
            total_amount,
            payment_method,
            status,
            created_at,
            sale_items (
              quantity,
              unit_price,
              total_price,
              products (name, sku)
            )
          `)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        setSales(data as unknown as Sale[] || []);
      } catch (error) {
        console.error('Error loading sales:', error);
      } finally {
        setLoading(false);
      }
    }, []);

    // ❌ REMOVIDO: useState mal usado que causaba el bucle infinito
    // ✅ CORREGIDO: useEffect apropiado será implementado en el componente que lo use

    return { sales, loading, refetch: loadSales };
  };

  return {
    processSale,
    processing,
    getDashboardStats,
    useRealtimeSales
  };
}
