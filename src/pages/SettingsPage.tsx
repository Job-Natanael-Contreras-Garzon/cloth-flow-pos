import { SimpleLayout } from "@/components/SimpleLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRealTimeStockAlerts } from "@/hooks/useRealTimeStockAlerts"
import { useSelector } from "react-redux"
import { RootState } from "@/store/store"
import { supabase } from "@/lib/supabase"
import { 
  Bell, 
  Shield, 
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Save,
  Loader2
} from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { alerts, loading, getAlertsByType, totalAlerts } = useRealTimeStockAlerts();
  const { user, role } = useSelector((state: RootState) => state.auth);
  const [stockAlertsEnabled, setStockAlertsEnabled] = useState(true);
  const [sessionTimeoutEnabled, setSessionTimeoutEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState({
    full_name: '',
    phone: '',
    email: user?.email || ''
  });
  const { toast } = useToast();

  const { outOfStock, critical, warning } = getAlertsByType();

  // Cargar perfil del usuario al iniciar
  const loadUserProfile = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }

      if (data) {
        setUserProfile(prev => ({
          ...prev,
          full_name: data.full_name || '',
          phone: data.phone || ''
        }));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  const handleSaveProfile = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: userProfile.full_name,
          phone: userProfile.phone
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "✅ Perfil actualizado",
        description: "Tu información se ha guardado correctamente",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "❌ Error al guardar",
        description: "No se pudo actualizar tu perfil. Inténtalo de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStockAlertsToggle = (enabled: boolean) => {
    setStockAlertsEnabled(enabled);
    toast({
      title: enabled ? "Alertas activadas" : "Alertas desactivadas",
      description: enabled 
        ? "Recibirás notificaciones cuando el stock esté bajo" 
        : "Ya no recibirás alertas de stock bajo",
    });
  };

  const handleSessionTimeoutToggle = (enabled: boolean) => {
    setSessionTimeoutEnabled(enabled);
    toast({
      title: enabled ? "Timeout de sesión activado" : "Timeout de sesión desactivado",
      description: enabled 
        ? "La sesión se cerrará automáticamente por inactividad" 
        : "La sesión permanecerá activa hasta cerrarla manualmente",
    });
  };

  return (
    <SimpleLayout title="Configuración">
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Profile Information */}
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Información del Usuario
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email (solo lectura)</Label>
                  <Input 
                    id="email" 
                    value={user?.email || ''} 
                    disabled 
                    className="bg-muted"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nombre Completo</Label>
                  <Input 
                    id="full_name" 
                    value={userProfile.full_name}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Ingresa tu nombre completo"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input 
                    id="phone" 
                    value={userProfile.phone}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Ej: +1 (555) 123-4567"
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">Rol:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    role === 'admin' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {role === 'admin' ? 'Administrador' : 'Vendedor'}
                  </span>
                </div>
                
                <Button 
                  onClick={handleSaveProfile} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Configuración de Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-base font-medium">Timeout de Sesión</span>
                  <p className="text-sm text-muted-foreground">
                    Cerrar sesión automáticamente por inactividad
                  </p>
                </div>
                <Switch 
                  checked={sessionTimeoutEnabled}
                  onCheckedChange={handleSessionTimeoutToggle}
                />
              </div>
              <Separator />
              <div className="text-sm text-muted-foreground">
                <p><strong>Nota:</strong> Para cambiar tu contraseña, usa la función "Olvidé mi contraseña" en la pantalla de login.</p>
              </div>
            </CardContent>
          </Card>

          {/* Stock Alerts Settings */}
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Alertas de Stock
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-base font-medium">Alertas de Stock Bajo</span>
                  <p className="text-sm text-muted-foreground">
                    Recibir notificaciones cuando el stock esté bajo
                  </p>
                </div>
                <Switch 
                  checked={stockAlertsEnabled}
                  onCheckedChange={handleStockAlertsToggle}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium">Estado actual de alertas:</p>
                {loading ? (
                  <p className="text-sm text-muted-foreground">Cargando alertas...</p>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Sin stock: {outOfStock.length} productos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">Stock crítico: {critical.length} productos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Stock bajo: {warning.length} productos</span>
                    </div>
                    {totalAlerts === 0 && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Todo el stock está en niveles normales</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Información del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Base de datos:</span>
                  <span className="text-green-600 text-sm">Conectada (Supabase)</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Autenticación:</span>
                  <span className="text-green-600 text-sm">Activa</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Storage:</span>
                  <span className="text-green-600 text-sm">Disponible</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Actualizaciones en tiempo real:</span>
                  <span className="text-green-600 text-sm">Habilitadas</span>
                </div>
              </div>
              <Separator />
              <div className="text-sm text-muted-foreground">
                <p><strong>Respaldos:</strong> Los datos se respaldan automáticamente en la nube cada 24 horas con Supabase.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stock Alerts Summary */}
        {stockAlertsEnabled && totalAlerts > 0 && (
          <Card className="bg-gradient-card shadow-card border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Resumen de Alertas de Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{outOfStock.length}</div>
                  <div className="text-sm text-muted-foreground">Sin stock</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{critical.length}</div>
                  <div className="text-sm text-muted-foreground">Stock crítico</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{warning.length}</div>
                  <div className="text-sm text-muted-foreground">Stock bajo</div>
                </div>
              </div>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => window.location.href = '/alerts'}
                >
                  Ver todas las alertas
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </SimpleLayout>
  )
}