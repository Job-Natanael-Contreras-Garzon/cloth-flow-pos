import { Layout } from "@/components/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  History, 
  Search, 
  Plus, 
  Eye,
  Filter,
  Download,
  Calendar
} from "lucide-react"
import { useState } from "react"

export default function PurchasesPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const purchases = [
    {
      id: "C001",
      date: "2024-01-10",
      supplier: "Distribuidora Fashion S.A.",
      items: [
        { name: "Vestidos Varios", quantity: 20, cost: 45.00 },
        { name: "Blusas Varias", quantity: 15, cost: 17.50 }
      ],
      subtotal: 1162.50,
      tax: 186.00,
      total: 1348.50,
      status: "Recibida",
      paymentStatus: "Pagada"
    },
    {
      id: "C002", 
      date: "2024-01-08",
      supplier: "Moda Europea Import",
      items: [
        { name: "Chaquetas de Cuero", quantity: 10, cost: 78.00 },
        { name: "Pantalones Jeans", quantity: 25, cost: 32.75 }
      ],
      subtotal: 1598.75,
      tax: 255.80,
      total: 1854.55,
      status: "Recibida",
      paymentStatus: "Pagada"
    },
    {
      id: "C003",
      date: "2024-01-05",
      supplier: "Calzado Premium Ltd.",
      items: [
        { name: "Zapatos Deportivos", quantity: 30, cost: 39.50 },
        { name: "Zapatos Formales", quantity: 20, cost: 55.00 }
      ],
      subtotal: 2285.00,
      tax: 365.60,
      total: 2650.60,
      status: "Pendiente",
      paymentStatus: "Pendiente"
    },
    {
      id: "C004",
      date: "2024-01-03",
      supplier: "Textiles La Rosa",
      items: [
        { name: "Faldas Plisadas", quantity: 18, cost: 21.25 },
        { name: "Accesorios Varios", quantity: 50, cost: 8.50 }
      ],
      subtotal: 807.50,
      tax: 129.20,
      total: 936.70,
      status: "Recibida",
      paymentStatus: "Pendiente"
    }
  ]

  const filteredPurchases = purchases.filter(purchase =>
    purchase.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Recibida": return "bg-success/10 text-success"
      case "Pendiente": return "bg-warning/10 text-warning"
      case "Cancelada": return "bg-destructive/10 text-destructive"
      default: return "bg-muted/10 text-muted-foreground"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Pagada": return "bg-success/10 text-success"
      case "Pendiente": return "bg-warning/10 text-warning"
      case "Vencida": return "bg-destructive/10 text-destructive"
      default: return "bg-muted/10 text-muted-foreground"
    }
  }

  const totalPurchases = filteredPurchases.reduce((sum, purchase) => sum + purchase.total, 0)
  const pendingPayments = filteredPurchases
    .filter(p => p.paymentStatus === "Pendiente")
    .reduce((sum, purchase) => sum + purchase.total, 0)

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Compras
            </h1>
            <p className="text-muted-foreground mt-1">
              Registro de compras y restock de inventario
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Filtrar Fechas
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button size="sm" className="bg-gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Compra
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Compras Totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                ${totalPurchases.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {filteredPurchases.length} órdenes
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pagos Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                ${pendingPayments.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {filteredPurchases.filter(p => p.paymentStatus === "Pendiente").length} facturas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Proveedores Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {new Set(filteredPurchases.map(p => p.supplier)).size}
              </div>
              <p className="text-xs text-success mt-1">
                +2 este mes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por ID, proveedor o producto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Purchases Table */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Historial de Compras ({filteredPurchases.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">ID</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Fecha</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Proveedor</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Productos</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Total</th>
                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">Estado</th>
                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">Pago</th>
                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPurchases.map((purchase) => (
                    <tr key={purchase.id} className="border-b border-border hover:bg-secondary/30 transition-smooth">
                      <td className="py-4 px-2">
                        <code className="text-sm bg-secondary px-2 py-1 rounded font-mono">
                          {purchase.id}
                        </code>
                      </td>
                      <td className="py-4 px-2">
                        <p className="text-sm font-medium">{purchase.date}</p>
                      </td>
                      <td className="py-4 px-2">
                        <p className="text-sm font-medium">{purchase.supplier}</p>
                      </td>
                      <td className="py-4 px-2">
                        <div className="space-y-1">
                          {purchase.items.map((item, index) => (
                            <div key={index} className="text-xs">
                              <span className="font-medium">{item.quantity}x</span> {item.name}
                              <span className="text-muted-foreground ml-1">
                                (${item.cost})
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-2 text-right">
                        <div>
                          <p className="font-bold text-primary text-lg">
                            ${purchase.total.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            +${purchase.tax.toFixed(2)} IVA
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-center">
                        <Badge className={getStatusColor(purchase.status)}>
                          {purchase.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-2 text-center">
                        <Badge className={getPaymentStatusColor(purchase.paymentStatus)}>
                          {purchase.paymentStatus}
                        </Badge>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex justify-center">
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}