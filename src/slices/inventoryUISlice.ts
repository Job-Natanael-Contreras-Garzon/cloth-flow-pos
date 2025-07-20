import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '@/hooks/useProducts';

interface InventoryUIState {
  isFormOpen: boolean;
  isDeleteDialogOpen: boolean;
  selectedProduct: Product | null;
}

const initialState: InventoryUIState = {
  isFormOpen: false,
  isDeleteDialogOpen: false,
  selectedProduct: null,
};

const inventoryUISlice = createSlice({
  name: 'inventoryUI',
  initialState,
  reducers: {
    openFormModal: (state, action: PayloadAction<Product | null>) => {
      state.isFormOpen = true;
      state.selectedProduct = action.payload;
    },
    closeFormModal: (state) => {
      state.isFormOpen = false;
      state.selectedProduct = null;
    },
    openDeleteDialog: (state, action: PayloadAction<Product>) => {
      state.isDeleteDialogOpen = true;
      state.selectedProduct = action.payload;
    },
    closeDeleteDialog: (state) => {
      state.isDeleteDialogOpen = false;
      state.selectedProduct = null;
    },
  },
});

export const {
  openFormModal,
  closeFormModal,
  openDeleteDialog,
  closeDeleteDialog,
} = inventoryUISlice.actions;

export default inventoryUISlice.reducer;
