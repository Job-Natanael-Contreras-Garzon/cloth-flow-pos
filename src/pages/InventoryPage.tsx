import { Layout } from "@/components/Layout";
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setPageTitle } from '@/store/uiSlice';
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
import { openFormModal, closeFormModal, openDeleteDialog, closeDeleteDialog } from "@/slices/inventoryUISlice";
import { RootState } from "@/store/store";
import { useProducts } from "@/hooks/useProducts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProductForm } from "../components/ProductForm";
import { DeleteProductDialog } from "@/components/DeleteProductDialog";
import { useQueryClient } from "@tanstack/react-query";

export default function InventoryPage() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const { data: products = [], isLoading, isError } = useProducts();
  const { isFormOpen, isDeleteDialogOpen, selectedProduct } = useSelector((state: RootState) => state.inventoryUI);

  useEffect(() => {
    dispatch(setPageTitle('Inventario'));
  }, [dispatch]);

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { label: "Sin Stock", variant: "destructive" as const };
    if (stock <= minStock) return { label: "Stock Bajo", variant: "destructive" as const };
    if (stock <= minStock * 2) return { label: "Stock Medio", variant: "secondary" as const };
    return { label: "Stock Bueno", variant: "default" as const };
  };

  const filteredProducts = products.filter(product => {
    const term = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(term) ||
      (product.sku && product.sku.toLowerCase().includes(term)) ||
      (product.categories && product.categories.name.toLowerCase().includes(term))
    );
  });

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-4 text-lg">Cargando productos...</p>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex justify-center items-center py-12">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <p className="ml-4 text-lg text-destructive">No se pudieron cargar los productos.</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
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
              const stockStatus = getStockStatus(product.stock, product.min_stock);
              const margin = ((product.price - product.cost) / product.price * 100).toFixed(1);
              
              return (
                <tr key={product.id} className="border-b border-border hover:bg-secondary/30 transition-smooth">
                  <td className="py-4 px-2">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <div className="flex gap-1 mt-1">
                        {product.sizes.slice(0, 3).map(size => (
                          <Badge key={size} variant="outline" className="text-xs">{size}</Badge>
                        ))}
                        {product.sizes.length > 3 && (
                          <Badge variant="outline" className="text-xs">+{product.sizes.length - 3}</Badge>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <code className="text-sm bg-secondary px-2 py-1 rounded">{product.sku}</code>
                  </td>
                  <td className="py-4 px-2 text-sm">{product.categories?.name || 'N/A'}</td>
                  <td className="py-4 px-2 text-right">
                    <div>
                      <p className="font-bold text-primary">${product.price}</p>
                      <p className="text-xs text-success">+{margin}%</p>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-right">
                    <span className="text-sm text-muted-foreground">${product.cost}</span>
                  </td>
                  <td className="py-4 px-2 text-center">
                    <div>
                      <p className="font-bold text-lg">{product.stock}</p>
                      <p className="text-xs text-muted-foreground">Min: {product.min_stock}</p>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-center">
                    <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex justify-center gap-2">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => dispatch(openFormModal(product))}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => dispatch(openDeleteDialog(product))}>
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
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-end">
          <Dialog open={isFormOpen} onOpenChange={(isOpen) => !isOpen && dispatch(closeFormModal())}>
            <DialogTrigger asChild>
              <Button onClick={() => dispatch(openFormModal(null))}>
                <Plus className="-ml-1 mr-2 h-4 w-4" />
                Agregar Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[75vw] max-h-[79vh] md:max-w-4xl lg:max-w-[1200px] overflow-y-auto py-4">
              <DialogHeader>
                <DialogTitle>{selectedProduct ? "Editar Producto" : "Agregar Nuevo Producto"}</DialogTitle>
              </DialogHeader>
              <ProductForm product={selectedProduct} />
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="ml-2">
            <Filter className="-ml-1 mr-2 h-4 w-4" />
            Filtros
          </Button>
        </div>

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
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Productos ({filteredProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderContent()}
          </CardContent>
        </Card>
      </div>

      {selectedProduct && (
        <DeleteProductDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => dispatch(closeDeleteDialog())}
          productId={selectedProduct.id}
          productName={selectedProduct.name}
          onSuccess={() => {
            dispatch(closeDeleteDialog());
            queryClient.invalidateQueries({ queryKey: ['products'] });
          }}
        />
      )}
    </Layout>
  );
}