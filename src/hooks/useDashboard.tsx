import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  today_sales: number;
  total_products: number;
  low_stock_products: number;
  out_of_stock_products: number;
  total_sales_count: number;
  inventory_value: number;
}

interface StockAlert {
  id: string;
  name: string;
  sku: string;
  stock: number;
  min_stock: number;
  category_name?: string;
  severity: 'critical' | 'warning' | 'out_of_stock';
}

/**
 * Hook centralizado para manejar el dashboard sin bucles infinitos
 * Coordina la carga de estadísticas y alertas de stock de manera eficiente
 */
export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const { toast } = useToast();
  
  // Refs para evitar múltiples subscriptions
  const subscriptionRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const mountedRef = useRef(true);

  const calculateSeverity = useCallback((stock: number, minStock: number): StockAlert['severity'] => {
    if (stock === 0) return 'out_of_stock';
    if (stock <= minStock * 0.5) return 'critical';
    return 'warning';
  }, []);

  // Función optimizada para cargar estadísticas
  const loadStats = useCallback(async () => {
    if (!mountedRef.current) return;
    
    try {
      setStatsLoading(true);
      const { data, error } = await supabase.rpc('get_dashboard_stats');
      
      if (error) {
        console.error('Error loading dashboard stats:', error);
        return;
      }
      
      if (mountedRef.current) {
        setStats(data as DashboardStats);
      }
    } catch (error) {
      console.error('Error in loadStats:', error);
    } finally {
      if (mountedRef.current) {
        setStatsLoading(false);
      }
    }
  }, []);

  // Función optimizada para cargar alertas
  const loadAlerts = useCallback(async () => {
    if (!mountedRef.current) return;
    
    try {
      setAlertsLoading(true);
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

      if (error) {
        console.error('Error loading stock alerts:', error);
        return;
      }

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

      if (mountedRef.current) {
        setAlerts(alertsData);
      }
    } catch (error) {
      console.error('Error loading stock alerts:', error);
    } finally {
      if (mountedRef.current) {
        setAlertsLoading(false);
      }
    }
  }, [calculateSeverity]);

  // Función para mostrar notificaciones de stock
  const showStockAlert = useCallback((stock: number, name: string) => {
    toast({
      variant: stock === 0 ? "destructive" : "default",
      title: stock === 0 ? "⚠️ Producto sin stock" : "⚠️ Stock bajo",
      description: `${name} - Stock: ${stock}`,
    });
  }, [toast]);

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        await Promise.all([loadStats(), loadAlerts()]);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    loadInitialData();
  }, [loadStats, loadAlerts]);

  // Configurar subscription real-time UNA SOLA VEZ
  useEffect(() => {
    // Limpiar subscription anterior si existe
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    // Crear nueva subscription
    subscriptionRef.current = supabase
      .channel('dashboard_updates')
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
        
        // Verificar si el producto necesita alerta
        if (updatedProduct.stock === 0 || updatedProduct.stock <= updatedProduct.min_stock) {
          showStockAlert(updatedProduct.stock, updatedProduct.name);
        }
        
        // Recargar datos (debounced por la subscription)
        loadAlerts();
        loadStats();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sales'
      }, () => {
        // Actualizar stats cuando hay ventas
        loadStats();
      })
      .subscribe();

    // Cleanup
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [loadAlerts, loadStats, showStockAlert]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Funciones helper para categorizar alertas
  const getAlertsByType = useCallback(() => {
    const outOfStock = alerts.filter(alert => alert.severity === 'out_of_stock');
    const critical = alerts.filter(alert => alert.severity === 'critical');
    const warning = alerts.filter(alert => alert.severity === 'warning');

    return { outOfStock, critical, warning };
  }, [alerts]);

  // Función manual de recarga
  const refetch = useCallback(async () => {
    await Promise.all([loadStats(), loadAlerts()]);
  }, [loadStats, loadAlerts]);

  return {
    // Estados
    stats,
    alerts,
    loading,
    statsLoading,
    alertsLoading,
    
    // Funciones
    getAlertsByType,
    refetch,
    
    // Computed
    totalAlerts: alerts.length,
    isReady: !loading && stats !== null
  };
}
