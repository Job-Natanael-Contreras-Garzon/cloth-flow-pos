import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@supabase/supabase-js';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  role: string | null;
  isSessionLoading: boolean;
  isInitialized: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  role: null,
  isSessionLoading: true,
  isInitialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<{ user: User; role: string }>) {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.role = action.payload.role;
      state.isSessionLoading = false;
      state.isInitialized = true;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.role = null;
      state.isSessionLoading = false;
      state.isInitialized = true;
    },
    setRole(state, action: PayloadAction<string>) {
      state.role = action.payload;
    },
    setSessionLoading(state, action: PayloadAction<boolean>) {
      state.isSessionLoading = action.payload;
    },
    setInitialized(state, action: PayloadAction<boolean>) {
      state.isInitialized = action.payload;
    },
    resetAuth() {
      return initialState;
    },
  },
});

export const { login, logout, setRole, setSessionLoading, setInitialized, resetAuth } = authSlice.actions;
export default authSlice.reducer;
