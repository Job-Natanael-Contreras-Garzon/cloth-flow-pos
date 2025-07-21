import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import type { RootState, AppDispatch } from '@/store/store';
import {
  fetchSales,
  fetchDailySalesStats,
  createSale,
  setSearchTerm,
  setFilters,
  clearFilters,
  clearError,
  selectFilteredSales,
  selectSalesLoading,
  selectSalesError,
  selectTotalSales,
  selectTotalTransactions,
  selectAverageTicket,
  selectDailySalesStats,
  selectSearchTerm,
  selectFilters,
} from '@/store/salesSlice';

/**
 * Hook personalizado para manejar el estado de ventas con Redux
 * Este hook encapsula toda la lógica de ventas y proporciona una interfaz simple
 */
export function useReduxSales() {
  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const sales = useSelector(selectFilteredSales);
  const allSales = useSelector((state: RootState) => state.sales.sales);
  const loading = useSelector(selectSalesLoading);
  const error = useSelector(selectSalesError);
  const totalSales = useSelector(selectTotalSales);
  const totalTransactions = useSelector(selectTotalTransactions);
  const averageTicket = useSelector(selectAverageTicket);
  const dailyStats = useSelector(selectDailySalesStats);
  const searchTerm = useSelector(selectSearchTerm);
  const filters = useSelector(selectFilters);

  // Actions
  const loadSales = (limit?: number) => {
    dispatch(fetchSales(limit));
  };

  const loadDailyStats = () => {
    dispatch(fetchDailySalesStats());
  };

  const createNewSale = (saleData: {
    customer_name?: string;
    customer_email?: string;
    subtotal: number;
    tax: number;
    total: number;
    payment_method: string;
    items: {
      product_id: string;
      quantity: number;
      unit_price: number;
      total_price: number;
      size?: string;
      color?: string;
    }[];
  }) => {
    return dispatch(createSale(saleData));
  };

  const updateSearchTerm = (term: string) => {
    dispatch(setSearchTerm(term));
  };

  const updateFilters = (newFilters: Partial<{
    dateFrom?: string;
    dateTo?: string;
    paymentMethod?: string;
    status?: string;
  }>) => {
    dispatch(setFilters(newFilters));
  };

  const resetFilters = () => {
    dispatch(clearFilters());
  };

  const resetError = () => {
    dispatch(clearError());
  };

  const refreshData = (limit = 100) => {
    loadSales(limit);
    loadDailyStats();
  };

  return {
    // Data
    sales,
    allSales,
    totalSales,
    totalTransactions,
    averageTicket,
    dailyStats,
    searchTerm,
    filters,
    
    // State
    loading,
    error,
    
    // Actions
    loadSales,
    loadDailyStats,
    createNewSale,
    updateSearchTerm,
    updateFilters,
    resetFilters,
    resetError,
    refreshData,
  };
}

/**
 * Hook para cargar datos iniciales de ventas
 * Útil para páginas que necesitan cargar ventas al montarse
 */
export function useSalesInitialLoad(limit = 100) {
  const { loadSales, loadDailyStats } = useReduxSales();

  useEffect(() => {
    loadSales(limit);
    loadDailyStats();
  }, [loadSales, loadDailyStats, limit]);
}

export default useReduxSales;
