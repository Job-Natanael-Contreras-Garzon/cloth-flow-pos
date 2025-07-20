import { Layout } from "@/components/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  Search, 
  Calendar, 
  Download,
  Eye,
  Filter
} from "lucide-react"
import { useState } from "react"

export default function SalesPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const sales = [
    {
      id: "V001",
      date: "2024-01-15",
      time: "14:30",
      customer: "María González",
      items: [
        { name: "Vestido Negro", quantity: 1, price: 89.99 },
        { name: "Zapatos Negros", quantity: 1, price: 78.99 }
      ],
      subtotal: 168.98,
      tax: 27.04,
      total: 196.02,
      paymentMethod: "Tarjeta",
      status: "Completada"
    },
    {
      id: "V002", 
      date: "2024-01-15",
      time: "13:15",
      customer: "Cliente General",
      items: [
        { name: "Jeans Azul", quantity: 2, price: 65.50 },
        { name: "Blusa Blanca", quantity: 1, price: 34.99 }
      ],
      subtotal: 165.99,
      tax: 26.56,
      total: 192.55,
      paymentMethod: "Efectivo",
      status: "Completada"
    },
    {
      id: "V003",
      date: "2024-01-15", 
      time: "12:45",
      customer: "Carlos Ruiz",
      items: [
        { name: "Chaqueta de Cuero", quantity: 1, price: 156.00 }
      ],
      subtotal: 156.00,
      tax: 24.96,
      total: 180.96,
      paymentMethod: "Transferencia",
      status: "Completada"
    },
    {
      id: "V004",
      date: "2024-01-14",
      time: "16:20",
      customer: "Ana Martín",
      items: [
        { name: "Falda Plisada", quantity: 1, price: 42.50 },
        { name: "Blusa Blanca", quantity: 1, price: 34.99 }
      ],
      subtotal: 77.49,
      tax: 12.40,
      total: 89.89,
      paymentMethod: "Tarjeta",
      status: "Completada"
    }
  ]

  const filteredSales = sales.filter(sale =>
    sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case "Efectivo": return "bg-success/10 text-success"
      case "Tarjeta": return "bg-primary/10 text-primary"
      case "Transferencia": return "bg-accent/10 text-accent"
      default: return "bg-muted/10 text-muted-foreground"
    }
  }

  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0)
  const totalTransactions = filteredSales.length

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Ventas
            </h1>
            <p className="text-muted-foreground mt-1">
              Historial y análisis de ventas realizadas
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
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ventas Totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                ${totalSales.toFixed(2)}
              </div>
              <p className="text-xs text-success mt-1">
                +12% vs período anterior
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Transacciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {totalTransactions}
              </div>
              <p className="text-xs text-success mt-1">
                +8% vs período anterior
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ticket Promedio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                ${totalTransactions > 0 ? (totalSales / totalTransactions).toFixed(2) : '0.00'}
              </div>
              <p className="text-xs text-success mt-1">
                +4% vs período anterior
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
                  placeholder="Buscar por ID, cliente o producto..."
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

        {/* Sales Table */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Historial de Ventas ({filteredSales.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">ID</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Fecha/Hora</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Cliente</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Productos</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Total</th>
                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">Pago</th>
                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">Estado</th>
                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="border-b border-border hover:bg-secondary/30 transition-smooth">
                      <td className="py-4 px-2">
                        <code className="text-sm bg-secondary px-2 py-1 rounded font-mono">
                          {sale.id}
                        </code>
                      </td>
                      <td className="py-4 px-2">
                        <div>
                          <p className="text-sm font-medium">{sale.date}</p>
                          <p className="text-xs text-muted-foreground">{sale.time}</p>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <p className="text-sm font-medium">{sale.customer}</p>
                      </td>
                      <td className="py-4 px-2">
                        <div className="space-y-1">
                          {sale.items.map((item, index) => (
                            <div key={index} className="text-xs">
                              <span className="font-medium">{item.quantity}x</span> {item.name}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-2 text-right">
                        <div>
                          <p className="font-bold text-primary text-lg">
                            ${sale.total.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            +${sale.tax.toFixed(2)} IVA
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-center">
                        <Badge className={getPaymentMethodColor(sale.paymentMethod)}>
                          {sale.paymentMethod}
                        </Badge>
                      </td>
                      <td className="py-4 px-2 text-center">
                        <Badge variant="default" className="bg-success/10 text-success">
                          {sale.status}
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