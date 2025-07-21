import { useState } from 'react';
import { useReduxSales } from '@/hooks/useReduxSales';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface SaleFormProps {
  onClose?: () => void;
}

export function CreateSaleForm({ onClose }: SaleFormProps) {
  const { createNewSale, loading } = useReduxSales();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    payment_method: 'cash',
    items: [
      {
        product_id: '', // En una implementación real, esto vendría de un selector de productos
        quantity: 1,
        unit_price: 0,
        total_price: 0,
        size: '',
        color: ''
      }
    ]
  });

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.total_price, 0);
    const tax = subtotal * 0.16; // 16% IVA
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { subtotal, tax, total } = calculateTotals();
      
      await createNewSale({
        customer_name: formData.customer_name || undefined,
        customer_email: formData.customer_email || undefined,
        subtotal,
        tax,
        total,
        payment_method: formData.payment_method,
        items: formData.items.filter(item => item.product_id && item.quantity > 0)
      });

      toast({
        title: 'Venta creada',
        description: 'La venta se ha procesado correctamente.',
      });

      if (onClose) onClose();
    } catch (error) {
      console.error('Error creating sale:', error);
    }
  };

  const { subtotal, tax, total } = calculateTotals();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Crear Nueva Venta</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del Cliente */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Información del Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer_name">Nombre del Cliente</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                  placeholder="Nombre completo (opcional)"
                />
              </div>
              <div>
                <Label htmlFor="customer_email">Email del Cliente</Label>
                <Input
                  id="customer_email"
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
                  placeholder="email@ejemplo.com (opcional)"
                />
              </div>
            </div>
          </div>

          {/* Método de Pago */}
          <div>
            <Label htmlFor="payment_method">Método de Pago</Label>
            <Select
              value={formData.payment_method}
              onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar método de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Efectivo</SelectItem>
                <SelectItem value="card">Tarjeta</SelectItem>
                <SelectItem value="transfer">Transferencia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Items de la Venta */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Productos</h3>
            {formData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                <div>
                  <Label>Producto ID</Label>
                  <Input
                    value={item.product_id}
                    onChange={(e) => {
                      const newItems = [...formData.items];
                      newItems[index].product_id = e.target.value;
                      setFormData(prev => ({ ...prev, items: newItems }));
                    }}
                    placeholder="ID del producto"
                  />
                </div>
                <div>
                  <Label>Cantidad</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => {
                      const newItems = [...formData.items];
                      newItems[index].quantity = parseInt(e.target.value) || 1;
                      newItems[index].total_price = newItems[index].quantity * newItems[index].unit_price;
                      setFormData(prev => ({ ...prev, items: newItems }));
                    }}
                  />
                </div>
                <div>
                  <Label>Precio Unitario</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unit_price}
                    onChange={(e) => {
                      const newItems = [...formData.items];
                      newItems[index].unit_price = parseFloat(e.target.value) || 0;
                      newItems[index].total_price = newItems[index].quantity * newItems[index].unit_price;
                      setFormData(prev => ({ ...prev, items: newItems }));
                    }}
                  />
                </div>
                <div>
                  <Label>Total</Label>
                  <Input
                    value={`$${item.total_price.toFixed(2)}`}
                    disabled
                  />
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  items: [...prev.items, {
                    product_id: '',
                    quantity: 1,
                    unit_price: 0,
                    total_price: 0,
                    size: '',
                    color: ''
                  }]
                }));
              }}
            >
              Agregar Producto
            </Button>
          </div>

          {/* Totales */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>IVA (16%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <Button type="submit" disabled={loading || formData.items.every(item => !item.product_id)}>
              {loading ? 'Procesando...' : 'Crear Venta'}
            </Button>
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
