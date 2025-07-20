import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { toast } from "@/hooks/use-toast";
import { Product } from '@/hooks/useProducts';
import { RootState } from './store';

export interface CartItem extends Product {
  quantity: number;
  size?: string;
  color?: string;
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
}

const initialState: CartState = {
  items: [],
  subtotal: 0,
  tax: 0,
  total: 0,
};

const TAX_RATE = 0.16; // 16% IVA

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Helper function to recalculate totals, not exported as an action
    _recalculateTotals: (state) => {
      const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      state.subtotal = subtotal;
      state.tax = subtotal * TAX_RATE;
      state.total = subtotal + state.tax;
    },

    addToCart: (state, action: PayloadAction<Product>) => {
      const product = action.payload;
      // TODO: Allow selecting specific size/color, for now we just check by ID
      const existingItem = state.items.find(item => item.id === product.id);

      if (existingItem) {
        if (existingItem.quantity < (product.stock ?? 0)) {
          existingItem.quantity++;
        } else {
          toast({
            variant: "destructive",
            title: "Stock insuficiente",
            description: `No puedes añadir más de ${product.name}.`,
          })
        }
      } else {
        const newCartItem: CartItem = {
          ...product,
          quantity: 1,
          size: product.sizes?.[0] || 'Unitalla',
          color: product.colors?.[0] || 'Varios',
        };
        state.items.push(newCartItem);
      }
      cartSlice.caseReducers._recalculateTotals(state);
    },

    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => item.id === id);
      if (item) {
        const stock = item.stock ?? 0;
        if (quantity > stock) {
          item.quantity = stock;
          toast({
            variant: "destructive",
            title: "Stock limitado",
            description: `Solo quedan ${stock} unidades de ${item.name}.`,
          })
        } else if (quantity < 1) {
          item.quantity = 1;
        } else {
          item.quantity = quantity;
        }
      }
      cartSlice.caseReducers._recalculateTotals(state);
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      cartSlice.caseReducers._recalculateTotals(state);
    },

    clearCart: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.tax = 0;
      state.total = 0;
    },
  },
});

export const { addToCart, updateQuantity, removeFromCart, clearCart } = cartSlice.actions;

export const selectCart = (state: RootState) => state.cart;

export default cartSlice.reducer;
