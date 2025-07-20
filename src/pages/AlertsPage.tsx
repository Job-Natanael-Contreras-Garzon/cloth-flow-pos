import { Layout } from "@/components/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  AlertTriangle, 
  Package, 
  Clock, 
  TrendingDown,
  CheckCircle,
  X,
  Bell,
  Settings
} from "lucide-react"

export default function AlertsPage() {
  const alerts = [
    {
      id: "1",
      type: "stock_low",
      priority: "high",
      title: "Stock Bajo - Vestido Negro Elegante",
      description: "Solo quedan 2 unidades en inventario (mínimo: 3)",
      product: "Vestido Negro Elegante",
      sku: "VNE001",
      currentStock: 2,
      minStock: 3,
      timestamp: "2024-01-15 09:30",
      status: "active"
    },
    {
      id: "2",
      type: "stock_out",
      priority: "critical",
      title: "Producto Agotado - Blusa Blanca Casual",
      description: "Producto completamente agotado en inventario",
      product: "Blusa Blanca Casual",
      sku: "BBC003",
      currentStock: 0,
      minStock: 4,
      timestamp: "2024-01-15 08:15",
      status: "active"
    },
    {
      id: "3",
      type: "sales_drop",
      priority: "medium",
      title: "Baja en Ventas - Chaqueta de Cuero",
      description: "Las ventas han disminuido 40% en las últimas 2 semanas",
      product: "Chaqueta de Cuero",
      sku: "CDC004",
      timestamp: "2024-01-15 07:45",
      status: "active"
    },
    {
      id: "4",
      type: "reorder_point",
      priority: "medium",
      title: "Punto de Reorden - Zapatos Deportivos",
      description: "Es momento de reordenar este producto",
      product: "Zapatos Deportivos",
      sku: "ZD005",
      currentStock: 8,
      minStock: 8,
      timestamp: "2024-01-14 16:20",
      status: "active"
    },
    {
      id: "5",
      type: "stock_low",
      priority: "low",
      title: "Stock Bajo - Falda Plisada",
      description: "Stock por debajo del mínimo recomendado",
      product: "Falda Plisada",
      sku: "FP006",
      currentStock: 3,
      minStock: 5,
      timestamp: "2024-01-14 14:10",
      status: "resolved"
    }
  ]

  const activeAlerts = alerts.filter(alert => alert.status === "active")
  const resolvedAlerts = alerts.filter(alert => alert.status === "resolved")

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-destructive/10 text-destructive border-destructive/20"
      case "high": return "bg-warning/10 text-warning border-warning/20"
      case "medium": return "bg-blue-100 text-blue-800 border-blue-200"
      case "low": return "bg-gray-100 text-gray-800 border-gray-200"
      default: return "bg-muted/10 text-muted-foreground border-border"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "stock_low": return Package
      case "stock_out": return AlertTriangle
      case "sales_drop": return TrendingDown
      case "reorder_point": return Clock
      default: return Bell
    }
  }

  const getTypeName = (type: string) => {
    switch (type) {
      case "stock_low": return "Stock Bajo"
      case "stock_out": return "Sin Stock"
      case "sales_drop": return "Baja Ventas"
      case "reorder_point": return "Reorden"
      default: return "Alerta"
    }
  }

  const criticalAlerts = activeAlerts.filter(a => a.priority === "critical").length
  const highAlerts = activeAlerts.filter(a => a.priority === "high").length
  const totalActive = activeAlerts.length

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Alertas
            </h1>
            <p className="text-muted-foreground mt-1">
              Notificaciones y alertas del sistema
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configurar
            </Button>
            <Button variant="outline" size="sm">
              <CheckCircle className="h-4 w-4 mr-2" />
              Marcar Todas Leídas
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Alertas Activas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {totalActive}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Requieren atención
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card border-destructive/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-destructive">
                Críticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {criticalAlerts}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Acción inmediata
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card border-warning/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-warning">
                Alta Prioridad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {highAlerts}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Atender pronto
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Resueltas Hoy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {resolvedAlerts.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Problemas solucionados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Active Alerts */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Alertas Activas ({activeAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeAlerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success" />
                  <p>¡No hay alertas activas!</p>
                  <p className="text-sm">Todo está funcionando correctamente.</p>
                </div>
              ) : (
                activeAlerts.map((alert) => {
                  const IconComponent = getTypeIcon(alert.type)
                  return (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border ${getPriorityColor(alert.priority)} hover:shadow-card transition-smooth`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                          <div className="p-2 rounded-full bg-current/10">
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">{alert.title}</h3>
                              <Badge variant="outline" className="text-xs">
                                {getTypeName(alert.type)}
                              </Badge>
                              <Badge variant="outline" className={`text-xs ${getPriorityColor(alert.priority).split(' ').slice(1, 2).join(' ')}`}>
                                {alert.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {alert.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>SKU: {alert.sku}</span>
                              {alert.currentStock !== undefined && (
                                <span>Stock actual: {alert.currentStock}</span>
                              )}
                              {alert.minStock && (
                                <span>Mínimo: {alert.minStock}</span>
                              )}
                              <span>{alert.timestamp}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Ver Producto
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resolved Alerts */}
        {resolvedAlerts.length > 0 && (
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                Alertas Resueltas ({resolvedAlerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {resolvedAlerts.map((alert) => {
                  const IconComponent = getTypeIcon(alert.type)
                  return (
                    <div
                      key={alert.id}
                      className="p-3 rounded-lg bg-success/5 border border-success/20 opacity-75"
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-4 w-4 text-success" />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{alert.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            Resuelto el {alert.timestamp}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs bg-success/10 text-success">
                          Resuelto
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}