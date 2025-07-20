import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@supabase/supabase-js';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  role: string | null;
  isSessionLoading: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  role: null,
  isSessionLoading: true,
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
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.role = null;
      state.isSessionLoading = false;
    },
    setRole(state, action: PayloadAction<string>) {
      state.role = action.payload;
    },
    setSessionLoading(state, action: PayloadAction<boolean>) {
      state.isSessionLoading = action.payload;
    },
  },
});

export const { login, logout, setRole, setSessionLoading } = authSlice.actions;
export default authSlice.reducer;
