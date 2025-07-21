import { SimpleLayout } from "@/components/SimpleLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  AlertTriangle, 
  Package, 
  Clock, 
  RefreshCw,
  Bell,
  CheckCircle
} from "lucide-react"
import { useDashboard } from "@/hooks/useDashboard";

export default function AlertsPage() {
  const { 
    alerts, 
    loading, 
    getAlertsByType, 
    totalAlerts,
    refetch 
  } = useDashboard();

  if (loading) {
    return (
      <SimpleLayout title="Alertas de Stock">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </SimpleLayout>
    );
  }

  const { outOfStock, critical, warning } = getAlertsByType();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'out_of_stock':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'critical':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'out_of_stock':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'warning':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  return (
    <SimpleLayout title="Alertas de Stock">
      <div className="space-y-6">
        {/* Header con estadísticas */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-6 w-6 text-purple-600" />
              <span className="text-lg font-semibold">
                {totalAlerts} alertas activas
              </span>
            </div>
          </div>
          <Button 
            onClick={refetch}
            variant="outline" 
            size="sm"
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualizar</span>
          </Button>
        </div>

        {/* Estadísticas de alertas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Sin Stock</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">{outOfStock.length}</p>
              <p className="text-sm text-red-600">Productos agotados</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800 flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Stock Crítico</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">{critical.length}</p>
              <p className="text-sm text-orange-600">Requieren atención inmediata</p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800 flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Stock Bajo</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-600">{warning.length}</p>
              <p className="text-sm text-yellow-600">Monitorear de cerca</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de alertas */}
        {totalAlerts === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¡Todo está en orden!
              </h3>
              <p className="text-gray-600">
                No hay alertas de stock en este momento.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card key={alert.id} className={`border ${getSeverityColor(alert.severity)}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {getSeverityIcon(alert.severity)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {alert.name}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {alert.sku}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            Stock actual: <span className="font-semibold">{alert.stock}</span>
                          </p>
                          <p className="text-sm text-gray-600">
                            Stock mínimo: <span className="font-semibold">{alert.min_stock}</span>
                          </p>
                          {alert.category_name && (
                            <p className="text-sm text-gray-600">
                              Categoría: <span className="font-semibold">{alert.category_name}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={getSeverityColor(alert.severity)}
                    >
                      {alert.severity === 'out_of_stock' && 'Sin Stock'}
                      {alert.severity === 'critical' && 'Crítico'}
                      {alert.severity === 'warning' && 'Bajo'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </SimpleLayout>
  );
}
