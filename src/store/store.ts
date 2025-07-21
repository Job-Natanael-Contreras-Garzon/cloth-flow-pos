import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import cartReducer from './cartSlice';
import uiReducer from './uiSlice';
import salesReducer from './salesSlice';
import productsReducer from './productsSlice';
import inventoryUIReducer from '../slices/inventoryUISlice';

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  ui: uiReducer,
  sales: salesReducer,
  products: productsReducer,
  inventoryUI: inventoryUIReducer,
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'cart'], // Persistir auth y cart, pero no products (se refrescan desde la DB)
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorar estas rutas de acción para la comprobación de serialización de redux-persist
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        // Ignorar estas rutas en el estado
        ignoredPaths: ['_persist'],
      },
    }),
});

export const persistor = persistStore(store);

// Inferir los tipos `RootState` y `AppDispatch` del propio store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
