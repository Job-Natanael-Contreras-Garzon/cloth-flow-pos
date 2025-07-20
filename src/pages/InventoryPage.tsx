import { Layout } from "@/components/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Package, 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  Filter,
  Download,
  Upload
} from "lucide-react"
import { useState } from "react"

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const products = [
    { 
      id: "1", 
      name: "Vestido Negro Elegante", 
      sku: "VNE001", 
      category: "Vestidos", 
      price: 89.99, 
      cost: 45.00,
      stock: 5, 
      minStock: 3,
      sizes: ["S", "M", "L"],
      colors: ["Negro", "Azul"],
      lastUpdated: "2024-01-15"
    },
    { 
      id: "2", 
      name: "Jeans Azul Clásico", 
      sku: "JAC002", 
      category: "Pantalones", 
      price: 65.50, 
      cost: 32.75,
      stock: 12, 
      minStock: 5,
      sizes: ["28", "30", "32", "34"],
      colors: ["Azul", "Negro"],
      lastUpdated: "2024-01-14"
    },
    { 
      id: "3", 
      name: "Blusa Blanca Casual", 
      sku: "BBC003", 
      category: "Blusas", 
      price: 34.99, 
      cost: 17.50,
      stock: 2, 
      minStock: 4,
      sizes: ["S", "M", "L", "XL"],
      colors: ["Blanco", "Crema"],
      lastUpdated: "2024-01-13"
    },
    { 
      id: "4", 
      name: "Chaqueta de Cuero", 
      sku: "CDC004", 
      category: "Abrigos", 
      price: 156.00, 
      cost: 78.00,
      stock: 3, 
      minStock: 2,
      sizes: ["M", "L", "XL"],
      colors: ["Negro", "Marrón"],
      lastUpdated: "2024-01-12"
    },
    { 
      id: "5", 
      name: "Zapatos Deportivos", 
      sku: "ZD005", 
      category: "Calzado", 
      price: 78.99, 
      cost: 39.50,
      stock: 15, 
      minStock: 8,
      sizes: ["36", "37", "38", "39", "40"],
      colors: ["Blanco", "Negro"],
      lastUpdated: "2024-01-11"
    }
  ]

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { label: "Sin Stock", variant: "destructive" as const }
    if (stock <= minStock) return { label: "Stock Bajo", variant: "destructive" as const }
    if (stock <= minStock * 2) return { label: "Stock Medio", variant: "secondary" as const }
    return { label: "Stock Bueno", variant: "default" as const }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Inventario
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestión completa de productos y stock
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Importar
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button size="sm" className="bg-gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, SKU o categoría..."
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

        {/* Products Table */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Productos ({filteredProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Producto</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">SKU</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Categoría</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Precio</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Costo</th>
                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">Stock</th>
                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">Estado</th>
                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product.stock, product.minStock)
                    const margin = ((product.price - product.cost) / product.price * 100).toFixed(1)
                    
                    return (
                      <tr key={product.id} className="border-b border-border hover:bg-secondary/30 transition-smooth">
                        <td className="py-4 px-2">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <div className="flex gap-1 mt-1">
                              {product.sizes.slice(0, 3).map(size => (
                                <Badge key={size} variant="outline" className="text-xs">
                                  {size}
                                </Badge>
                              ))}
                              {product.sizes.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{product.sizes.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <code className="text-sm bg-secondary px-2 py-1 rounded">
                            {product.sku}
                          </code>
                        </td>
                        <td className="py-4 px-2 text-sm">{product.category}</td>
                        <td className="py-4 px-2 text-right">
                          <div>
                            <p className="font-bold text-primary">${product.price}</p>
                            <p className="text-xs text-success">+{margin}%</p>
                          </div>
                        </td>
                        <td className="py-4 px-2 text-right">
                          <span className="text-sm text-muted-foreground">
                            ${product.cost}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-center">
                          <div>
                            <p className="font-bold text-lg">{product.stock}</p>
                            <p className="text-xs text-muted-foreground">
                              Min: {product.minStock}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-2 text-center">
                          <Badge variant={stockStatus.variant}>
                            {stockStatus.label}
                          </Badge>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex justify-center gap-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}