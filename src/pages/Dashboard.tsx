import { StatsCard } from "@/components/StatsCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DollarSign, 
  Package, 
  ShoppingCart, 
  TrendingUp,
  AlertTriangle,
  Plus,
  Eye
} from "lucide-react"

const statsData = [
  {
    title: "Ventas del Día",
    value: "$2,847",
    change: "+12% desde ayer",
    changeType: "positive" as const,
    icon: DollarSign,
    description: "23 transacciones"
  },
  {
    title: "Productos en Stock",
    value: "1,247",
    change: "8 productos bajo stock",
    changeType: "negative" as const,
    icon: Package,
    description: "En 127 categorías"
  },
  {
    title: "Ventas del Mes",
    value: "$43,201",
    change: "+18% vs mes anterior",
    changeType: "positive" as const,
    icon: TrendingUp,
    description: "456 transacciones"
  },
  {
    title: "Alertas Activas",
    value: "12",
    change: "4 nuevas hoy",
    changeType: "neutral" as const,
    icon: AlertTriangle,
    description: "Stock bajo y vencimientos"
  }
]

const recentSales = [
  { id: "V001", customer: "Cliente General", amount: "$89.99", items: "Vestido Negro M, Zapatos 38", time: "Hace 5 min" },
  { id: "V002", customer: "María González", amount: "$156.50", items: "Jeans L, Blusa S, Bolso", time: "Hace 12 min" },
  { id: "V003", customer: "Cliente General", amount: "$67.00", items: "Camiseta M, Calcetines", time: "Hace 18 min" },
  { id: "V004", customer: "Carlos Ruiz", amount: "$234.99", items: "Chaqueta L, Pantalón M", time: "Hace 25 min" },
]

const lowStockItems = [
  { name: "Vestido Negro", size: "M", stock: 2, category: "Vestidos" },
  { name: "Jeans Azul", size: "L", stock: 1, category: "Pantalones" },
  { name: "Blusa Blanca", size: "S", stock: 3, category: "Blusas" },
  { name: "Zapatos Negros", size: "38", stock: 1, category: "Calzado" },
]

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Resumen general de tu tienda de moda
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Ver Reportes
          </Button>
          <Button size="sm" className="bg-gradient-primary">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Venta
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Recent Sales & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Ventas Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-smooth">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {sale.id}
                      </Badge>
                      <span className="font-medium text-sm">{sale.customer}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{sale.items}</p>
                    <p className="text-xs text-muted-foreground">{sale.time}</p>
                  </div>
                  <span className="font-bold text-primary">{sale.amount}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Stock Bajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-warning/20 bg-warning/5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{item.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        Talla {item.size}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.category}</p>
                  </div>
                  <div className="text-center">
                    <span className="text-lg font-bold text-warning">{item.stock}</span>
                    <p className="text-xs text-muted-foreground">unidades</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}