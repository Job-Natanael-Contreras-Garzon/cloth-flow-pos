import { Layout } from "@/components/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Tag, 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  Grid3X3,
  Package
} from "lucide-react"
import { useState } from "react"

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const categories = [
    {
      id: "1",
      name: "Vestidos",
      description: "Vestidos elegantes y casuales para toda ocasión",
      productCount: 45,
      color: "bg-purple-100 text-purple-800",
      icon: "👗",
      subcategories: ["Vestidos de Noche", "Vestidos Casuales", "Vestidos de Oficina"]
    },
    {
      id: "2", 
      name: "Pantalones",
      description: "Jeans, pantalones formales y casuales",
      productCount: 67,
      color: "bg-blue-100 text-blue-800",
      icon: "👖",
      subcategories: ["Jeans", "Pantalones Formales", "Leggins"]
    },
    {
      id: "3",
      name: "Blusas",
      description: "Blusas y camisas para mujer",
      productCount: 38,
      color: "bg-pink-100 text-pink-800", 
      icon: "👚",
      subcategories: ["Blusas Formales", "Camisetas", "Tops"]
    },
    {
      id: "4",
      name: "Abrigos",
      description: "Chaquetas, abrigos y ropa de temporada",
      productCount: 23,
      color: "bg-orange-100 text-orange-800",
      icon: "🧥",
      subcategories: ["Chaquetas de Cuero", "Abrigos de Invierno", "Blazers"]
    },
    {
      id: "5",
      name: "Calzado",
      description: "Zapatos deportivos, formales y casuales",
      productCount: 89,
      color: "bg-green-100 text-green-800",
      icon: "👠",
      subcategories: ["Zapatos Deportivos", "Zapatos Formales", "Sandalias"]
    },
    {
      id: "6",
      name: "Faldas",
      description: "Faldas de diferentes estilos y largos",
      productCount: 32,
      color: "bg-indigo-100 text-indigo-800",
      icon: "👗",
      subcategories: ["Faldas Largas", "Faldas Cortas", "Faldas Plisadas"]
    },
    {
      id: "7",
      name: "Accesorios",
      description: "Bolsos, cinturones, joyería y más",
      productCount: 156,
      color: "bg-yellow-100 text-yellow-800",
      icon: "👜",
      subcategories: ["Bolsos", "Cinturones", "Joyería", "Bufandas"]
    },
    {
      id: "8",
      name: "Ropa Interior",
      description: "Lencería y ropa interior femenina",
      productCount: 41,
      color: "bg-red-100 text-red-800",
      icon: "🩲",
      subcategories: ["Brassieres", "Panties", "Pijamas"]
    }
  ]

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalProducts = categories.reduce((sum, category) => sum + category.productCount, 0)

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Categorías
            </h1>
            <p className="text-muted-foreground mt-1">
              Organización de productos por categorías
            </p>
          </div>
          <div className="flex gap-3">
            <Button size="sm" className="bg-gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Categoría
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Categorías
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {categories.length}
              </div>
              <p className="text-xs text-success mt-1">
                +2 este mes
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Productos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {totalProducts}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                En todas las categorías
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Promedio por Categoría
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {Math.round(totalProducts / categories.length)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                productos por categoría
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar categorías..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Categories Grid */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              Categorías ({filteredCategories.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCategories.map((category) => (
                <Card key={category.id} className="hover:shadow-hover transition-smooth border border-border/50">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="text-3xl">{category.icon}</div>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {category.description}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className={category.color}>
                        <Package className="h-3 w-3 mr-1" />
                        {category.productCount} productos
                      </Badge>
                    </div>
                    
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Subcategorías:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {category.subcategories.slice(0, 2).map((sub, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {sub}
                          </Badge>
                        ))}
                        {category.subcategories.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{category.subcategories.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm" className="w-full">
                      <Grid3X3 className="h-4 w-4 mr-2" />
                      Ver Productos
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}