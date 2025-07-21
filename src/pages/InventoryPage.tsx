import { SimpleLayout } from "@/components/SimpleLayout";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  Filter,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { useProducts, Product } from "@/hooks/useProducts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ProductForm } from "../components/ProductForm";
import { DeleteProductDialog } from "@/components/DeleteProductDialog";

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const { data: products = [], isLoading, isError } = useProducts();

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { label: "Sin Stock", variant: "destructive" as const };
    if (stock <= minStock) return { label: "Bajo Stock", variant: "secondary" as const };
    return { label: "En Stock", variant: "default" as const };
  };

  const getStockColor = (stock: number, minStock: number) => {
    if (stock === 0) return "text-red-600";
    if (stock <= minStock) return "text-yellow-600";
    return "text-green-600";
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleNewProduct = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedProduct(null);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.is_active).length;
  const lowStockProducts = products.filter(p => p.stock <= p.min_stock && p.stock > 0).length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;

  return (
    <SimpleLayout title="Inventario">
      <div className="space-y-6">
        {/* KPIs del inventario */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Productos</p>
                  <p className="text-2xl font-bold">{totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Productos Activos</p>
                  <p className="text-2xl font-bold">{activeProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Bajo Stock</p>
                  <p className="text-2xl font-bold">{lowStockProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Sin Stock</p>
                  <p className="text-2xl font-bold">{outOfStockProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de productos */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Lista de Productos ({filteredProducts.length})
              </CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar productos..."
                    className="pl-9 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button onClick={handleNewProduct}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Producto
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Cargando productos...</span>
              </div>
            ) : isError ? (
              <div className="text-center py-8 text-red-600">
                Error al cargar productos
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No se encontraron productos' : 'No hay productos registrados'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Producto</th>
                      <th className="text-left py-3 px-4 font-medium">SKU</th>
                      <th className="text-left py-3 px-4 font-medium">Precio</th>
                      <th className="text-left py-3 px-4 font-medium">Stock</th>
                      <th className="text-left py-3 px-4 font-medium">Estado</th>
                      <th className="text-center py-3 px-4 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => {
                      const stockStatus = getStockStatus(product.stock, product.min_stock);
                      return (
                        <tr key={product.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              {!product.is_active && (
                                <p className="text-sm text-gray-500">Inactivo</p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{product.sku}</td>
                          <td className="py-3 px-4">${product.price.toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <span className={`font-medium ${getStockColor(product.stock, product.min_stock)}`}>
                              {product.stock}
                            </span>
                            <span className="text-gray-500 text-sm ml-1">/ {product.min_stock}</span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={stockStatus.variant}>
                              {stockStatus.label}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-center gap-2">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => handleEditProduct(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => handleDeleteProduct(product)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal del formulario */}
      <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </DialogTitle>
            <DialogDescription>
              {selectedProduct 
                ? 'Modifica los datos del producto seleccionado.'
                : 'Completa la información para crear un nuevo producto.'
              }
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            product={selectedProduct}
            onClose={handleCloseForm}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación de eliminación */}
      <DeleteProductDialog
        productId={selectedProduct?.id}
        productName={selectedProduct?.name}
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onSuccess={() => {
          setIsDeleteDialogOpen(false);
          setSelectedProduct(null);
        }}
      />
    </SimpleLayout>
  );
}