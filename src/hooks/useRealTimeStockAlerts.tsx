import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface StockAlert {
  id: string;
  name: string;
  sku: string;
  stock: number;
  min_stock: number;
  category_name?: string;
  severity: 'critical' | 'warning' | 'out_of_stock';
}

export function useRealTimeStockAlerts() {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const calculateSeverity = (stock: number, minStock: number): StockAlert['severity'] => {
    if (stock === 0) return 'out_of_stock';
    if (stock <= minStock * 0.5) return 'critical';
    return 'warning';
  };

  const loadStockAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          sku,
          stock,
          min_stock,
          categories (name)
        `)
        .eq('is_active', true)
        .order('stock');

      if (error) throw error;

      // Filtrar productos con alertas (sin stock o stock bajo)
      const alertsData: StockAlert[] = (data || [])
        .filter(product => product.stock === 0 || product.stock <= product.min_stock)
        .map(product => ({
          id: product.id,
          name: product.name,
          sku: product.sku,
          stock: product.stock,
          min_stock: product.min_stock,
          category_name: product.categories?.[0]?.name,
          severity: calculateSeverity(product.stock, product.min_stock)
        }));

      setAlerts(alertsData);
    } catch (error) {
      console.error('Error loading stock alerts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const showToast = useCallback((stock: number, name: string) => {
    toast({
      variant: stock === 0 ? "destructive" : "default",
      title: stock === 0 ? "⚠️ Producto sin stock" : "⚠️ Stock bajo",
      description: `${name} - Stock: ${stock}`,
    });
  }, [toast]);

  useEffect(() => {
    loadStockAlerts();

    // Real-time subscription para cambios en productos
    const subscription = supabase
      .channel('stock_alerts')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'products',
        filter: 'is_active=eq.true'
      }, (payload) => {
        const updatedProduct = payload.new as {
          id: string;
          name: string;
          stock: number;
          min_stock: number;
        };
        
        // Verificar si el producto actualizado necesita alerta
        if (updatedProduct.stock === 0 || updatedProduct.stock <= updatedProduct.min_stock) {
          showToast(updatedProduct.stock, updatedProduct.name);
          
          // Recargar alertas
          loadStockAlerts();
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [loadStockAlerts, showToast]);

  const getAlertsByType = () => {
    const outOfStock = alerts.filter(alert => alert.severity === 'out_of_stock');
    const critical = alerts.filter(alert => alert.severity === 'critical');
    const warning = alerts.filter(alert => alert.severity === 'warning');

    return { outOfStock, critical, warning };
  };

  return {
    alerts,
    loading,
    getAlertsByType,
    refetch: loadStockAlerts,
    totalAlerts: alerts.length
  };
}
