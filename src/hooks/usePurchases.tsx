import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export interface Purchase {
  id: string;
  purchase_number: string;
  supplier_name: string;
  supplier_email?: string;
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'received';
  delivery_date?: string;
  created_at: string;
  updated_at: string;
  purchase_items?: PurchaseItem[];
}

export interface PurchaseItem {
  id: string;
  purchase_id: string;
  product_id: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  product?: {
    id: string;
    name: string;
    sku: string;
    stock: number;
  };
}

export interface CreatePurchaseData {
  supplier_name: string;
  supplier_email?: string;
  delivery_date?: string;
  items: CreatePurchaseItemData[];
}

export interface CreatePurchaseItemData {
  product_id?: string; // Optional para productos nuevos
  product_name?: string; // Para productos nuevos
  sku?: string; // Para productos nuevos
  description?: string; // Para productos nuevos
  category_id?: string; // Para productos nuevos
  price?: number; // Para productos nuevos
  quantity: number;
  unit_cost: number;
}

export function usePurchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchPurchases = async () => {
    try {
      setIsLoading(true);
      setIsError(false);

      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          purchase_items (
            *,
            product:products (
              id,
              name,
              sku,
              stock
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPurchases(data || []);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      setIsError(true);
      toast({
        title: "Error",
        description: "No se pudieron cargar las compras",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createPurchase = async (purchaseData: CreatePurchaseData) => {
    try {
      // Calcular totales
      const subtotal = purchaseData.items.reduce((sum, item) => 
        sum + (item.quantity * item.unit_cost), 0);
      const tax = 0; // Puedes agregar lógica de impuestos aquí
      const total = subtotal + tax;

      // Llamar a la función de la base de datos que maneja la lógica completa
      const { data, error } = await supabase.rpc('create_purchase_with_items', {
        p_supplier_name: purchaseData.supplier_name,
        p_subtotal: subtotal,
        p_tax: tax,
        p_total: total,
        p_items: purchaseData.items.map(item => ({
          product_id: item.product_id || null,
          product_name: item.product_name || null,
          sku: item.sku || null,
          description: item.description || null,
          category_id: item.category_id || null,
          price: item.price || 0,
          quantity: item.quantity,
          unit_cost: item.unit_cost
        })),
        p_supplier_email: purchaseData.supplier_email || null,
        p_delivery_date: purchaseData.delivery_date || null
      });

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Compra creada correctamente",
      });

      // Recargar compras
      await fetchPurchases();
      
      return data;
    } catch (error) {
      console.error('Error creating purchase:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la compra",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updatePurchaseStatus = async (purchaseId: string, status: 'pending' | 'received') => {
    try {
      const { error } = await supabase
        .from('purchases')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', purchaseId);

      if (error) throw error;

      // Si se marca como recibida, actualizar stock
      if (status === 'received') {
        const { error: stockError } = await supabase.rpc('update_stock_from_purchase', {
          p_purchase_id: purchaseId
        });

        if (stockError) throw stockError;
      }

      toast({
        title: "Éxito",
        description: `Compra ${status === 'received' ? 'recibida' : 'actualizada'} correctamente`,
      });

      // Recargar compras
      await fetchPurchases();
    } catch (error) {
      console.error('Error updating purchase status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la compra",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deletePurchase = async (purchaseId: string) => {
    try {
      const { error } = await supabase
        .from('purchases')
        .delete()
        .eq('id', purchaseId);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Compra eliminada correctamente",
      });

      // Recargar compras
      await fetchPurchases();
    } catch (error) {
      console.error('Error deleting purchase:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la compra",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  return {
    purchases,
    isLoading,
    isError,
    createPurchase,
    updatePurchaseStatus,
    deletePurchase,
    refetch: fetchPurchases
  };
}
