import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store/store";

import { AuthProvider } from "./hooks/useSimpleAuth";
import { AuthGuard } from "./components/AuthGuard";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import POSPage from "./pages/POSPage";
import InventoryPage from "./pages/InventoryPage";
import SalesPage from "./pages/SalesPage";
import PurchasesPage from "./pages/PurchasesPage";
import CategoriesPage from "./pages/CategoriesPage";
import AlertsPage from "./pages/AlertsPage";
import SettingsPage from "./pages/SettingsPage";
import ReportsPage from "./pages/ReportsPage";
import LoginPage from "./pages/LoginPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

const queryClient = new QueryClient();

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
            <Routes>
              {/* Rutas públicas */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              
              {/* Rutas protegidas */}
              <Route path="/" element={
                <AuthGuard>
                  <Index />
                </AuthGuard>
              } />
              
              <Route path="/pos" element={
                <AuthGuard>
                  <POSPage />
                </AuthGuard>
              } />
              
              <Route path="/inventory" element={
                <AuthGuard>
                  <InventoryPage />
                </AuthGuard>
              } />
              
              <Route path="/sales" element={
                <AuthGuard>
                  <SalesPage />
                </AuthGuard>
              } />
              
              <Route path="/purchases" element={
                <AuthGuard>
                  <PurchasesPage />
                </AuthGuard>
              } />
              
              <Route path="/categories" element={
                <AuthGuard>
                  <CategoriesPage />
                </AuthGuard>
              } />
              
              <Route path="/reports" element={
                <AuthGuard>
                  <ReportsPage />
                </AuthGuard>
              } />
              
              <Route path="/alerts" element={
                <AuthGuard>
                  <AlertsPage />
                </AuthGuard>
              } />
              
              <Route path="/settings" element={
                <AuthGuard>
                  <SettingsPage />
                </AuthGuard>
              } />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
