import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { supabase } from "./lib/supabase";
import { login, logout, setSessionLoading, setInitialized } from "./store/authSlice";
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
import ReportsPage from "./pages/ReportsPage";
import AuthPage from "./pages/AuthPage";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  const dispatch = useDispatch();
  const { isSessionLoading, isInitialized } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;

    const resetInactivityTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        console.log('Sesión expirada por inactividad (30 min)');
        supabase.auth.signOut();
      }, 30 * 60 * 1000); // 30 minutos
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    const resetTimer = () => resetInactivityTimer();

    const initializeAuth = async () => {
      try {
        dispatch(setSessionLoading(true));
        
        // Verificar sesión actual
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error al obtener la sesión:', error);
          dispatch(logout());
          return;
        }

        if (session?.user) {
          console.log('Sesión existente encontrada, obteniendo perfil...');
          
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error al obtener el perfil:', profileError);
            dispatch(logout());
          } else if (profile) {
            console.log('Perfil obtenido, rol:', profile.role);
            dispatch(login({ user: session.user, role: profile.role }));
            resetInactivityTimer();
            events.forEach(event => document.addEventListener(event, resetTimer));
          } else {
            console.warn('Usuario autenticado pero sin perfil en la base de datos.');
            dispatch(logout());
          }
        } else {
          console.log('No hay sesión activa.');
          dispatch(logout());
        }
      } catch (error) {
        console.error("Error al inicializar autenticación:", error);
        dispatch(logout());
      }
    };

    // Inicializar auth solo si no está inicializado
    if (!isInitialized) {
      initializeAuth();
    }

    // Configurar listener para cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        console.log('Auth state change:', event, session?.user?.id);
        
        if (event === 'SIGNED_OUT' || !session?.user) {
          console.log('Usuario desconectado');
          dispatch(logout());
          if (inactivityTimer) clearTimeout(inactivityTimer);
          events.forEach(event => document.removeEventListener(event, resetTimer));
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('Usuario conectado o token actualizado');
          
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            console.error('Error al obtener el perfil:', error);
            dispatch(logout());
          } else if (profile) {
            console.log('Perfil obtenido, rol:', profile.role);
            dispatch(login({ user: session.user, role: profile.role }));
            resetInactivityTimer();
            events.forEach(event => document.addEventListener(event, resetTimer));
          } else {
            console.warn('Usuario autenticado pero sin perfil en la base de datos.');
            dispatch(logout());
          }
        }
      } catch (error) {
        console.error("Error en el listener de autenticación:", error);
        dispatch(logout());
      }
    });

    return () => {
      subscription.unsubscribe();
      if (inactivityTimer) clearTimeout(inactivityTimer);
      events.forEach(event => document.removeEventListener(event, resetTimer));
    };
  }, [dispatch, isInitialized]);

  // Mostrar loading solo durante la carga inicial
  if (!isInitialized && isSessionLoading) {
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
              <Route path="/reports" element={<ReportsPage />} />
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
