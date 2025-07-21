import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Package } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { CreatePurchaseData, CreatePurchaseItemData } from "@/hooks/usePurchases";

interface CreatePurchaseFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePurchaseData) => Promise<void>;
  isLoading?: boolean;
}

export function CreatePurchaseForm({ open, onClose, onSubmit, isLoading = false }: CreatePurchaseFormProps) {
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const [formData, setFormData] = useState({
    supplier_name: '',
    supplier_email: '',
    delivery_date: '',
  });
  const [items, setItems] = useState<CreatePurchaseItemData[]>([]);
  const [currentItem, setCurrentItem] = useState<CreatePurchaseItemData>({
    quantity: 1,
    unit_cost: 0,
  });
  const [isNewProduct, setIsNewProduct] = useState(false);

  const resetForm = () => {
    setFormData({ supplier_name: '', supplier_email: '', delivery_date: '' });
    setItems([]);
    setCurrentItem({ quantity: 1, unit_cost: 0 });
    setIsNewProduct(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const addItem = () => {
    if (isNewProduct) {
      if (!currentItem.product_name || !currentItem.sku || currentItem.unit_cost <= 0) {
        return;
      }
    } else {
      if (!currentItem.product_id || currentItem.unit_cost <= 0) {
        return;
      }
    }

    setItems([...items, { ...currentItem }]);
    setCurrentItem({ quantity: 1, unit_cost: 0 });
    setIsNewProduct(false);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? `${product.name} (${product.sku})` : '';
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : '';
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);
  const tax = 0; // Puedes agregar lógica de impuestos
  const total = subtotal + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.supplier_name || items.length === 0) {
      return;
    }

    try {
      await onSubmit({
        ...formData,
        delivery_date: formData.delivery_date || undefined,
        items
      });
      handleClose();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Compra</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del proveedor */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del Proveedor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplier_name">Nombre del Proveedor *</Label>
                  <Input
                    id="supplier_name"
                    value={formData.supplier_name}
                    onChange={(e) => setFormData({...formData, supplier_name: e.target.value})}
                    placeholder="Ej: Distribuidora ABC"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="supplier_email">Email del Proveedor</Label>
                  <Input
                    id="supplier_email"
                    type="email"
                    value={formData.supplier_email}
                    onChange={(e) => setFormData({...formData, supplier_email: e.target.value})}
                    placeholder="proveedor@email.com"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="delivery_date">Fecha de Entrega Esperada</Label>
                <Input
                  id="delivery_date"
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) => setFormData({...formData, delivery_date: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Agregar productos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Agregar Productos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={!isNewProduct ? "default" : "outline"}
                  onClick={() => setIsNewProduct(false)}
                >
                  Producto Existente
                </Button>
                <Button
                  type="button"
                  variant={isNewProduct ? "default" : "outline"}
                  onClick={() => setIsNewProduct(true)}
                >
                  Nuevo Producto
                </Button>
              </div>

              {isNewProduct ? (
                // Formulario para nuevo producto
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label>Nombre del Producto *</Label>
                    <Input
                      value={currentItem.product_name || ''}
                      onChange={(e) => setCurrentItem({...currentItem, product_name: e.target.value})}
                      placeholder="Nombre del producto"
                    />
                  </div>
                  <div>
                    <Label>SKU *</Label>
                    <Input
                      value={currentItem.sku || ''}
                      onChange={(e) => setCurrentItem({...currentItem, sku: e.target.value})}
                      placeholder="SKU único"
                    />
                  </div>
                  <div>
                    <Label>Categoría</Label>
                    <Select 
                      value={currentItem.category_id || ''} 
                      onValueChange={(value) => setCurrentItem({...currentItem, category_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Precio de Venta</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={currentItem.price || ''}
                      onChange={(e) => setCurrentItem({...currentItem, price: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Cantidad *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={currentItem.quantity}
                      onChange={(e) => setCurrentItem({...currentItem, quantity: parseInt(e.target.value) || 1})}
                    />
                  </div>
                  <div>
                    <Label>Costo Unitario *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={currentItem.unit_cost}
                      onChange={(e) => setCurrentItem({...currentItem, unit_cost: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <Label>Descripción</Label>
                    <Textarea
                      value={currentItem.description || ''}
                      onChange={(e) => setCurrentItem({...currentItem, description: e.target.value})}
                      placeholder="Descripción del producto"
                      rows={2}
                    />
                  </div>
                </div>
              ) : (
                // Formulario para producto existente
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Producto *</Label>
                    <Select 
                      value={currentItem.product_id || ''} 
                      onValueChange={(value) => setCurrentItem({...currentItem, product_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar producto" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} ({product.sku}) - Stock: {product.stock}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Cantidad *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={currentItem.quantity}
                      onChange={(e) => setCurrentItem({...currentItem, quantity: parseInt(e.target.value) || 1})}
                    />
                  </div>
                  <div>
                    <Label>Costo Unitario *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={currentItem.unit_cost}
                      onChange={(e) => setCurrentItem({...currentItem, unit_cost: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              )}

              <Button type="button" onClick={addItem} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Producto
              </Button>
            </CardContent>
          </Card>

          {/* Lista de productos agregados */}
          {items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Productos Agregados ({items.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">
                          {item.product_id ? getProductName(item.product_id) : item.product_name}
                          {!item.product_id && (
                            <Badge variant="secondary" className="ml-2">Nuevo</Badge>
                          )}
                        </div>
                        {!item.product_id && item.sku && (
                          <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                        )}
                        {!item.product_id && item.category_id && (
                          <div className="text-sm text-gray-500">
                            Categoría: {getCategoryName(item.category_id)}
                          </div>
                        )}
                        <div className="text-sm text-gray-600">
                          {item.quantity} x ${item.unit_cost.toFixed(2)} = ${(item.quantity * item.unit_cost).toFixed(2)}
                        </div>
                      </div>
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Resumen */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Impuestos:</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.supplier_name || items.length === 0 || isLoading}
            >
              {isLoading ? "Creando..." : "Crear Compra"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
