import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  category_id?: string;
  price: number;
  cost: number;
  stock: number;
  min_stock: number;
  sizes: string[];
  colors: string[];
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Relación con categorías (para joins)
  categories?: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface ProductsState {
  products: Product[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
  searchTerm: string;
  selectedCategory: string | null;
  currentPage: number;
}

const initialState: ProductsState = {
  products: [],
  categories: [],
  loading: false,
  error: null,
  lastFetch: null,
  searchTerm: '',
  selectedCategory: null,
  currentPage: 1,
};

// Thunks asincrónicos
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      console.log('productsSlice: Fetching products from Supabase...');
      const { data, error, status } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            description
          )
        `)
        .eq('is_active', true)
        .order('name');

      console.log('productsSlice: Supabase response', { data, error, status });

      if (error) {
        console.error('productsSlice: Error fetching products:', error);
        return rejectWithValue({ message: error.message, details: error.details });
      }

      if (!data) {
        console.warn('productsSlice: No data returned for products.');
        return [];
      }
      
      console.log(`productsSlice: Successfully fetched ${data.length} products.`);
      return data as Product[];
    } catch (e: any) {
      console.error('productsSlice: Uncaught exception in fetchProducts:', e);
      return rejectWithValue({ message: e.message || 'An unexpected error occurred' });
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data as Category[];
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'categories'>) => {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, ...updates }: Partial<Product> & { id: string }) => {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id: string) => {
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
    return id;
  }
);

export const updateStock = createAsyncThunk(
  'products/updateStock',
  async (stockUpdates: { product_id: string; quantity_change: number }[]) => {
    const updates = stockUpdates.map(async ({ product_id, quantity_change }) => {
      // Primero obtener el stock actual
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('stock')
        .eq('id', product_id)
        .single();

      if (fetchError) throw fetchError;

      // Calcular nuevo stock
      const newStock = product.stock + quantity_change;
      
      // Actualizar stock
      const { data, error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', product_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    });

    const results = await Promise.all(updates);
    return results;
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.currentPage = 1;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
      state.currentPage = 1;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetFilters: (state) => {
      state.searchTerm = '';
      state.selectedCategory = null;
      state.currentPage = 1;
    },
  },
  extraReducers: (builder) => {
    // Fetch Products
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
        state.lastFetch = Date.now();
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar productos';
      })

    // Fetch Categories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar categorías';
      })

    // Create Product
    builder
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.push(action.payload);
      })

    // Update Product
    builder
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = { ...state.products[index], ...action.payload };
        }
      })

    // Delete Product
    builder
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(p => p.id !== action.payload);
      })

    // Update Stock
    builder
      .addCase(updateStock.fulfilled, (state, action) => {
        action.payload.forEach(updatedProduct => {
          const index = state.products.findIndex(p => p.id === updatedProduct.id);
          if (index !== -1) {
            state.products[index] = { ...state.products[index], ...updatedProduct };
          }
        });
      });
  },
});

export const {
  setSearchTerm,
  setSelectedCategory,
  setCurrentPage,
  clearError,
  resetFilters,
} = productsSlice.actions;

// Selectors básicos
const selectProductsState = (state: { products: ProductsState }) => state.products;

export const selectProducts = createSelector(
  [selectProductsState],
  (productsState) => productsState.products
);

export const selectCategories = createSelector(
  [selectProductsState],
  (productsState) => productsState.categories
);

export const selectProductsLoading = createSelector(
  [selectProductsState],
  (productsState) => productsState.loading
);

export const selectProductsError = createSelector(
  [selectProductsState],
  (productsState) => productsState.error
);

export const selectSearchTerm = createSelector(
  [selectProductsState],
  (productsState) => productsState.searchTerm
);

export const selectSelectedCategory = createSelector(
  [selectProductsState],
  (productsState) => productsState.selectedCategory
);

export const selectCurrentPage = createSelector(
  [selectProductsState],
  (productsState) => productsState.currentPage
);

// Selector para productos filtrados con memoización
export const selectFilteredProducts = createSelector(
  [selectProducts, selectSearchTerm, selectSelectedCategory],
  (products, searchTerm, selectedCategory) => {
    return products.filter(product => {
      const matchesSearch = !searchTerm || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !selectedCategory || 
        selectedCategory === 'all' || 
        product.category_id === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }
);

// Selector para verificar si necesita actualizar (cache de 5 minutos)
export const selectShouldRefreshProducts = createSelector(
  [selectProductsState],
  (productsState) => {
    const { lastFetch } = productsState;
    if (!lastFetch) return true;
    
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
    return Date.now() - lastFetch > CACHE_DURATION;
  }
);

export default productsSlice.reducer;
