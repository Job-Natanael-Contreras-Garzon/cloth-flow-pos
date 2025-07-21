import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { supabase } from '@/integrations/supabase/client';
import type { Sale, SaleItem } from '@/hooks/useSales';

// Estado inicial
interface SalesState {
  sales: Sale[];
  loading: boolean;
  error: string | null;
  totalSales: number;
  totalTransactions: number;
  averageTicket: number;
  dailyStats: {
    total: number;
    count: number;
  } | null;
  searchTerm: string;
  filters: {
    dateFrom?: string;
    dateTo?: string;
    paymentMethod?: string;
    status?: string;
  };
}

const initialState: SalesState = {
  sales: [],
  loading: false,
  error: null,
  totalSales: 0,
  totalTransactions: 0,
  averageTicket: 0,
  dailyStats: null,
  searchTerm: '',
  filters: {},
};

// Thunks asincrónicos
export const fetchSales = createAsyncThunk(
  'sales/fetchSales',
  async (limit?: number) => {
    let query = supabase
      .from('sales')
      .select(`
        *,
        sale_items (
          *,
          products (
            id,
            name,
            sku
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as Sale[];
  }
);

export const fetchDailySalesStats = createAsyncThunk(
  'sales/fetchDailySalesStats',
  async () => {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('sales')
      .select('total, created_at')
      .gte('created_at', today)
      .eq('status', 'completed');

    if (error) throw error;

    const totalSales = data.reduce((sum, sale) => sum + Number(sale.total), 0);
    const salesCount = data.length;

    return {
      total: totalSales,
      count: salesCount,
    };
  }
);

export const createSale = createAsyncThunk(
  'sales/createSale',
  async (saleData: {
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
  }, { dispatch }) => {
    try {
      // Llamar a la función RPC que maneja la venta y actualización de stock
      const { error } = await supabase.rpc('create_sale_and_update_stock', {
        p_customer_name: saleData.customer_name,
        p_customer_email: saleData.customer_email,
        p_subtotal: saleData.subtotal,
        p_tax: saleData.tax,
        p_total: saleData.total,
        p_payment_method: saleData.payment_method,
        p_items: saleData.items,
      });

      if (error) {
        console.error('Error creating sale:', error);
        throw new Error(`Error al procesar la venta: ${error.message}`);
      }

      // Actualizar el stock en el estado de productos
      const stockUpdates = saleData.items.map(item => ({
        product_id: item.product_id,
        quantity_change: -item.quantity, // Restar del stock
      }));

      // Despachar acción para actualizar stock en productos
      dispatch({ type: 'products/updateStock/fulfilled', payload: stockUpdates });

      return saleData;
    } catch (error) {
      console.error('Error creating sale:', error);
      throw error;
    }
  }
);

// Slice
const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
      state.searchTerm = '';
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch sales
      .addCase(fetchSales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSales.fulfilled, (state, action) => {
        state.loading = false;
        state.sales = action.payload;
        
        // Calcular estadísticas
        state.totalSales = action.payload.reduce((sum, sale) => sum + Number(sale.total), 0);
        state.totalTransactions = action.payload.length;
        state.averageTicket = state.totalTransactions > 0 ? state.totalSales / state.totalTransactions : 0;
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar las ventas';
      })
      // Fetch daily stats
      .addCase(fetchDailySalesStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDailySalesStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dailyStats = action.payload;
      })
      .addCase(fetchDailySalesStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar estadísticas diarias';
      })
      // Create sale
      .addCase(createSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSale.fulfilled, (state) => {
        state.loading = false;
        // Las ventas se recargarán automáticamente después de crear una nueva
      })
      .addCase(createSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al crear la venta';
      });
  },
});

export const { setSearchTerm, setFilters, clearFilters, clearError } = salesSlice.actions;

// Selectores básicos
const selectSalesState = (state: { sales: SalesState }) => state.sales;

export const selectSales = createSelector(
  [selectSalesState],
  (salesState) => salesState.sales
);

export const selectSalesLoading = createSelector(
  [selectSalesState],
  (salesState) => salesState.loading
);

export const selectSalesError = createSelector(
  [selectSalesState],
  (salesState) => salesState.error
);

export const selectTotalSales = createSelector(
  [selectSalesState],
  (salesState) => salesState.totalSales
);

export const selectTotalTransactions = createSelector(
  [selectSalesState],
  (salesState) => salesState.totalTransactions
);

export const selectAverageTicket = createSelector(
  [selectSalesState],
  (salesState) => salesState.averageTicket
);

export const selectDailySalesStats = createSelector(
  [selectSalesState],
  (salesState) => salesState.dailyStats
);

export const selectSearchTerm = createSelector(
  [selectSalesState],
  (salesState) => salesState.searchTerm
);

export const selectFilters = createSelector(
  [selectSalesState],
  (salesState) => salesState.filters
);

// Selector con filtros aplicados memoizado
export const selectFilteredSales = createSelector(
  [selectSales, selectSearchTerm, selectFilters],
  (sales, searchTerm, filters) => {
    return sales.filter(sale => {
      // Filtro de búsqueda
      const matchesSearch = !searchTerm || 
        sale.sale_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sale.customer_name && sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sale.sale_items && sale.sale_items.some(item => 
          item.products?.name.toLowerCase().includes(searchTerm.toLowerCase())
        ));

      // Filtros adicionales
      const matchesPaymentMethod = !filters.paymentMethod || sale.payment_method === filters.paymentMethod;
      const matchesStatus = !filters.status || sale.status === filters.status;
      
      // Filtros de fecha
      let matchesDateRange = true;
      if (filters.dateFrom || filters.dateTo) {
        const saleDate = new Date(sale.created_at).toISOString().split('T')[0];
        if (filters.dateFrom && saleDate < filters.dateFrom) matchesDateRange = false;
        if (filters.dateTo && saleDate > filters.dateTo) matchesDateRange = false;
      }

      return matchesSearch && matchesPaymentMethod && matchesStatus && matchesDateRange;
    });
  }
);

export default salesSlice.reducer;
