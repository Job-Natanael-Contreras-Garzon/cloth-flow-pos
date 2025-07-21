import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import type { RootState, AppDispatch } from '@/store/store';
import {
  fetchProducts,
  fetchCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  setSearchTerm,
  setSelectedCategory,
  setCurrentPage,
  clearError,
  resetFilters,
  selectProducts,
  selectCategories,
  selectProductsLoading,
  selectProductsError,
  selectSearchTerm,
  selectSelectedCategory,
  selectCurrentPage,
  selectFilteredProducts,
  selectShouldRefreshProducts,
  type Product,
  type Category,
} from '@/store/productsSlice';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook personalizado para manejar productos con Redux
 * Encapsula toda la lógica de productos y proporciona una interfaz simple
 */
export function useProductsRedux() {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();

  // Selectors
  const products = useSelector(selectProducts);
  const categories = useSelector(selectCategories);
  const filteredProducts = useSelector(selectFilteredProducts);
  const loading = useSelector(selectProductsLoading);
  const error = useSelector(selectProductsError);
  const searchTerm = useSelector(selectSearchTerm);
  const selectedCategory = useSelector(selectSelectedCategory);
  const currentPage = useSelector(selectCurrentPage);
  const shouldRefresh = useSelector(selectShouldRefreshProducts);

  // Auto-load data on mount or when refresh is needed
  useEffect(() => {
    const loadInitialData = async () => {
      console.log('useProductsRedux: Checking initial data load', {
        productsLength: products.length,
        categoriesLength: categories.length,
        loading
      });
      
      // Siempre cargar productos si están vacíos
      if (products.length === 0 && !loading) {
        console.log('useProductsRedux: Loading products...');
        try {
          await dispatch(fetchProducts()).unwrap();
          console.log('useProductsRedux: Products loaded successfully');
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "Error al cargar productos";
          console.error('useProductsRedux: Error loading products:', errorMessage);
          toast({
            variant: "destructive",
            title: "Error",
            description: errorMessage,
          });
        }
      }
      
      // Siempre cargar categorías si están vacías
      if (categories.length === 0 && !loading) {
        console.log('useProductsRedux: Loading categories...');
        try {
          await dispatch(fetchCategories()).unwrap();
          console.log('useProductsRedux: Categories loaded successfully');
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "Error al cargar categorías";
          console.error('useProductsRedux: Error loading categories:', errorMessage);
          toast({
            variant: "destructive",
            title: "Error",
            description: errorMessage,
          });
        }
      }
    };

    loadInitialData();
  }, [products.length, categories.length, loading, dispatch, toast]);

  // Actions
  const loadProducts = async () => {
    try {
      await dispatch(fetchProducts()).unwrap();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error al cargar productos";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  const loadCategories = async () => {
    try {
      await dispatch(fetchCategories()).unwrap();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error al cargar categorías";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'categories'>) => {
    try {
      await dispatch(createProduct(productData)).unwrap();
      toast({
        title: "Producto creado",
        description: "El producto se ha creado correctamente.",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error al crear el producto";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
      throw error;
    }
  };

  const editProduct = async (id: string, updates: Partial<Product>) => {
    try {
      await dispatch(updateProduct({ id, ...updates })).unwrap();
      toast({
        title: "Producto actualizado",
        description: "El producto se ha actualizado correctamente.",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error al actualizar el producto";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
      throw error;
    }
  };

  const removeProduct = async (id: string) => {
    try {
      await dispatch(deleteProduct(id)).unwrap();
      toast({
        title: "Producto eliminado",
        description: "El producto se ha eliminado correctamente.",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error al eliminar el producto";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
      throw error;
    }
  };

  const adjustStock = async (stockUpdates: { product_id: string; quantity_change: number }[]) => {
    try {
      await dispatch(updateStock(stockUpdates)).unwrap();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error al actualizar el stock";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
      throw error;
    }
  };

  // Filter actions
  const updateSearchTerm = (term: string) => {
    dispatch(setSearchTerm(term));
  };

  const updateSelectedCategory = (categoryId: string | null) => {
    dispatch(setSelectedCategory(categoryId));
  };

  const updateCurrentPage = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  const clearFilters = () => {
    dispatch(resetFilters());
  };

  const clearErrorState = () => {
    dispatch(clearError());
  };

  // Utility functions
  const getProductById = (id: string) => {
    return products.find(product => product.id === id);
  };

  const getProductsByCategory = (categoryId: string) => {
    return products.filter(product => product.category_id === categoryId);
  };

  const getLowStockProducts = () => {
    return products.filter(product => product.stock <= product.min_stock);
  };

  const getCategoryById = (id: string) => {
    return categories.find(category => category.id === id);
  };

  // Pagination logic
  const ITEMS_PER_PAGE = 12;
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return {
    // Data
    products,
    categories,
    filteredProducts,
    paginatedProducts,
    
    // State
    loading,
    error,
    searchTerm,
    selectedCategory,
    currentPage,
    totalPages,
    
    // Actions
    loadProducts,
    loadCategories,
    addProduct,
    editProduct,
    removeProduct,
    adjustStock,
    
    // Filters
    updateSearchTerm,
    updateSelectedCategory,
    updateCurrentPage,
    clearFilters,
    clearErrorState,
    
    // Utilities
    getProductById,
    getProductsByCategory,
    getLowStockProducts,
    getCategoryById,
    
    // Stats
    totalProducts: products.length,
    filteredCount: filteredProducts.length,
    lowStockCount: getLowStockProducts().length,
  };
}

// Export types for convenience
export type { Product, Category };
