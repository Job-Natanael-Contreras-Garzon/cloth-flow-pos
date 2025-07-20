import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { supabase } from "./lib/supabase";
import { login, logout } from "./store/authSlice";
import { RootState } from "./store/store";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import POSPage from "./pages/POSPage";
import InventoryPage from "./pages/InventoryPage";
import SalesPage from "./pages/SalesPage";
import PurchasesPage from "./pages/PurchasesPage";
import CategoriesPage from "./pages/CategoriesPage";
import AlertsPage from "./pages/AlertsPage";
import SettingsPage from "./pages/SettingsPage";
import AuthPage from "./pages/AuthPage";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  const dispatch = useDispatch();
  const { isSessionLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;

    // Función para resetear el timer de inactividad
    const resetInactivityTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        console.log('Sesión expirada por inactividad (30 min)');
        supabase.auth.signOut();
      }, 30 * 60 * 1000); // 30 minutos
    };

    // Eventos que resetean el timer de inactividad
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    const resetTimer = () => resetInactivityTimer();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session && session.user) {
          console.log('Sesión detectada, obteniendo perfil...');
          
          // Solo obtener perfil si la sesión es válida
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();

            if (profileError) {
              console.warn('No se pudo obtener el perfil, usando role por defecto:', profileError.message);
              dispatch(login({ user: session.user, role: 'user' }));
            } else {
              console.log('Perfil obtenido, role:', profile.role);
              dispatch(login({ user: session.user, role: profile.role }));
            }
          } catch (profileError) {
            console.warn('Error al obtener perfil, usando role por defecto:', profileError);
            dispatch(login({ user: session.user, role: 'user' }));
          }

          // Iniciar timer de inactividad
          resetInactivityTimer();
          events.forEach(event => document.addEventListener(event, resetTimer));
        } else {
          console.log('No hay sesión activa');
          dispatch(logout());
          
          // Limpiar timer de inactividad
          if (inactivityTimer) clearTimeout(inactivityTimer);
          events.forEach(event => document.removeEventListener(event, resetTimer));
        }
      } catch (error) {
        console.error("Error en el listener de autenticación:", error);
        dispatch(logout());
      }
    });

    // Verificar sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log('Sesión inicial encontrada');
        // El onAuthStateChange se encargará del resto
      } else {
        console.log('No hay sesión inicial');
        dispatch(logout());
      }
    });

    return () => {
      subscription.unsubscribe();
      if (inactivityTimer) clearTimeout(inactivityTimer);
      events.forEach(event => document.removeEventListener(event, resetTimer));
    };
  }, [dispatch]);

  if (isSessionLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public route for login */}
            <Route path="/login" element={<AuthPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Index />} />
              <Route path="/pos" element={<POSPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/sales" element={<SalesPage />} />
              <Route path="/purchases" element={<PurchasesPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
