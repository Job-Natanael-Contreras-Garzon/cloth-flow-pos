import { SimpleLayout } from "@/components/SimpleLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  ShoppingCart,
  Users,
  Calendar,
  BarChart3
} from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";

export default function OptimizedDashboard() {
  const { 
    stats, 
    alerts, 
    loading, 
    getAlertsByType, 
    totalAlerts,
    isReady 
  } = useDashboard();

  if (loading) {
    return (
      <SimpleLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </SimpleLayout>
    );
  }

  if (!isReady) {
    return (
      <SimpleLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Cargando datos del dashboard...</p>
        </div>
      </SimpleLayout>
    );
  }

  const { outOfStock, critical, warning } = getAlertsByType();

  return (
    <SimpleLayout title="Dashboard">
      <div className="space-y-6">
        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ventas de Hoy</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${stats?.today_sales?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Productos</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats?.total_products || 0}
                  </p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ventas Totales</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats?.total_sales_count || 0}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Alertas de Stock</p>
                  <p className="text-2xl font-bold text-red-600">
                    {totalAlerts}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertas de inventario */}
        {totalAlerts > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {outOfStock.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-800 flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Sin Stock ({outOfStock.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {outOfStock.slice(0, 3).map((product) => (
                      <div key={product.id} className="text-sm">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-gray-600">{product.sku}</p>
                      </div>
                    ))}
                    {outOfStock.length > 3 && (
                      <p className="text-sm text-red-600">
                        +{outOfStock.length - 3} más
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {critical.length > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="text-orange-800 flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Stock Crítico ({critical.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {critical.slice(0, 3).map((product) => (
                      <div key={product.id} className="text-sm">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-gray-600">Stock: {product.stock}</p>
                      </div>
                    ))}
                    {critical.length > 3 && (
                      <p className="text-sm text-orange-600">
                        +{critical.length - 3} más
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {warning.length > 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-yellow-800 flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Stock Bajo ({warning.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {warning.slice(0, 3).map((product) => (
                      <div key={product.id} className="text-sm">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-gray-600">Stock: {product.stock}</p>
                      </div>
                    ))}
                    {warning.length > 3 && (
                      <p className="text-sm text-yellow-600">
                        +{warning.length - 3} más
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Métricas adicionales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Valor del Inventario</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600 mb-2">
                  ${stats?.inventory_value?.toFixed(2) || '0.00'}
                </p>
                <p className="text-sm text-gray-600">
                  Valor total del inventario en costo
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Estado del Sistema</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Base de datos:</span>
                  <Badge className="bg-green-100 text-green-800">Conectado</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tiempo real:</span>
                  <Badge className="bg-green-100 text-green-800">Activo</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Última actualización:</span>
                  <span className="text-sm text-gray-600">
                    {new Date().toLocaleTimeString('es-ES')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estado sin alertas */}
        {totalAlerts === 0 && (
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <Package className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-green-600 mb-2">
                  ¡Todo está en orden!
                </h3>
                <p className="text-gray-600">
                  No hay alertas de inventario en este momento.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </SimpleLayout>
  );
}
