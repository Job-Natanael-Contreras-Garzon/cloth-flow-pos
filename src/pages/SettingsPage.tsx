import { Layout } from "@/components/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { 
  Settings, 
  Store, 
  Bell, 
  Shield, 
  Palette,
  Database,
  Printer,
  Globe,
  Save
} from "lucide-react"

export default function SettingsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Configuración
            </h1>
            <p className="text-muted-foreground mt-1">
              Personaliza tu sistema POS
            </p>
          </div>
          <Button className="bg-gradient-primary">
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Navigation */}
          <div className="space-y-4">
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Configuraciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  <Store className="h-4 w-4 mr-2" />
                  Información de Tienda
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Bell className="h-4 w-4 mr-2" />
                  Notificaciones
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Seguridad
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Palette className="h-4 w-4 mr-2" />
                  Apariencia
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Database className="h-4 w-4 mr-2" />
                  Respaldos
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Printer className="h-4 w-4 mr-2" />
                  Impresión
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Globe className="h-4 w-4 mr-2" />
                  Localización
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Store Information */}
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-primary" />
                  Información de la Tienda
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="store-name">Nombre de la Tienda</Label>
                    <Input id="store-name" defaultValue="Fashion Store" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store-phone">Teléfono</Label>
                    <Input id="store-phone" defaultValue="+1 (555) 123-4567" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-address">Dirección</Label>
                  <Input id="store-address" defaultValue="123 Fashion St, Ciudad de Moda" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-email">Email</Label>
                  <Input id="store-email" type="email" defaultValue="info@fashionstore.com" />
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Notificaciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="stock-alerts" className="text-base">Alertas de Stock Bajo</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibir notificaciones cuando el stock esté bajo
                    </p>
                  </div>
                  <Switch id="stock-alerts" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sales-reports" className="text-base">Reportes de Ventas</Label>
                    <p className="text-sm text-muted-foreground">
                      Reportes diarios automáticos por email
                    </p>
                  </div>
                  <Switch id="sales-reports" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="new-purchases" className="text-base">Nuevas Compras</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificar cuando se agreguen nuevos productos
                    </p>
                  </div>
                  <Switch id="new-purchases" />
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Seguridad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Contraseña Actual</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nueva Contraseña</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="session-timeout" className="text-base">Tiempo de Sesión</Label>
                    <p className="text-sm text-muted-foreground">
                      Cerrar sesión automáticamente por inactividad
                    </p>
                  </div>
                  <Switch id="session-timeout" defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Apariencia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dark-mode" className="text-base">Modo Oscuro</Label>
                    <p className="text-sm text-muted-foreground">
                      Cambiar a tema oscuro
                    </p>
                  </div>
                  <Switch id="dark-mode" />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="currency">Moneda</Label>
                  <Input id="currency" defaultValue="USD ($)" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax-rate">Tasa de Impuesto (%)</Label>
                  <Input id="tax-rate" type="number" defaultValue="16" />
                </div>
              </CardContent>
            </Card>

            {/* Backup & Data */}
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Respaldos y Datos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Respaldo Automático</Label>
                    <p className="text-sm text-muted-foreground">
                      Respaldar datos automáticamente cada 24 horas
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex gap-3">
                  <Button variant="outline">
                    <Database className="h-4 w-4 mr-2" />
                    Crear Respaldo
                  </Button>
                  <Button variant="outline">
                    <Database className="h-4 w-4 mr-2" />
                    Restaurar Datos
                  </Button>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Último respaldo: 15 de Enero, 2024 a las 3:00 AM
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}