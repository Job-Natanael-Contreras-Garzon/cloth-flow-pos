import { SimpleLayout } from "@/components/SimpleLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Search,
  ShoppingCart,
  Plus,
  Minus,
  X,
  CreditCard,
  DollarSign,
  Calculator,
  Package
} from "lucide-react"
import { useState } from 'react';
import { useProducts, Product } from "@/hooks/useProducts";
import { useCategories, Category } from "@/hooks/useCategories";
import { useOptimizedSales } from '@/hooks/useOptimizedSales';
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sku: string;
  stock: number;
}

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const { processSale } = useOptimizedSales();
  const { toast } = useToast();

  // Cálculos del carrito
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.16; // 16% de impuesto
  const total = subtotal + tax;

  // Agregar producto al carrito
  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        toast({
          variant: "destructive",
          title: "Stock insuficiente",
          description: `Solo hay ${product.stock} unidades disponibles`,
        });
      }
    } else {
      if (product.stock > 0) {
        setCart([...cart, {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          sku: product.sku,
          stock: product.stock
        }]);
      } else {
        toast({
          variant: "destructive",
          title: "Producto sin stock",
          description: "Este producto no está disponible",
        });
      }
    }
  };

  // Actualizar cantidad
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    const item = cart.find(item => item.id === id);
    if (item && quantity <= item.stock) {
      setCart(cart.map(item => 
        item.id === id 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  // Remover del carrito
  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // Limpiar carrito
  const clearCart = () => {
    setCart([]);
    setCustomerName('');
    setCustomerEmail('');
    setPaymentMethod('cash');
  };

  // Procesar venta
  const handleProcessSale = async () => {
    if (cart.length === 0) {
      toast({
        variant: "destructive",
        title: "Carrito vacío",
        description: "Agrega productos al carrito para procesar la venta",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const saleData = {
        customer_name: customerName || undefined,
        customer_email: customerEmail || undefined,
        total_amount: total,
        payment_method: paymentMethod
      };

      const saleItems = cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }));

      const result = await processSale(saleData, saleItems);
      
      if (result.success) {
        clearCart();
        toast({
          title: "¡Venta completada!",
          description: `Venta ${result.sale_number} procesada exitosamente`,
        });
      }
    } catch (error) {
      console.error('Error processing sale:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Filtrar productos
  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory && product.is_active;
  });

  return (
    <SimpleLayout title="Punto de Venta">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
        {/* Panel de productos */}
        <div className="lg:col-span-2 flex flex-col">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Productos
              </CardTitle>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar por nombre o SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="w-48">
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      {(categories || []).map((category: Category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              {isLoading ? (
                <div className="text-center py-8">Cargando productos...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredProducts.map((product: Product) => (
                    <Card 
                      key={product.id} 
                      className={`cursor-pointer transition-all duration-200 overflow-hidden ${
                        product.stock === 0 
                          ? 'opacity-60 grayscale cursor-not-allowed' 
                          : 'hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1'
                      }`}
                      onClick={() => product.stock > 0 && addToCart(product)}
                    >
                      <div 
                        className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200 group overflow-hidden"
                      >
                        {/* Imagen de fondo */}
                        {product.image_url && (
                          <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-200 group-hover:scale-110"
                            style={{
                              backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6)), url(${product.image_url})`
                            }}
                          />
                        )}
                        
                        {/* Fallback para productos sin imagen */}
                        {!product.image_url && (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-white/80 text-xs font-medium text-center">
                                <Package className="h-6 w-6 mx-auto mb-1" />
                                <div>{product.name.split(' ')[0]}</div>
                              </div>
                            </div>
                          </>
                        )}
                        
                        {/* Badge de stock en la esquina superior derecha */}
                        <div className="absolute top-2 right-2 z-10">
                          <Badge 
                            variant={product.stock > 10 ? "default" : product.stock > 0 ? "secondary" : "destructive"}
                            className="shadow-lg text-xs border-0"
                          >
                            {product.stock}
                          </Badge>
                        </div>
                        
                        {/* Precio prominente en la parte inferior */}
                        <div className="absolute bottom-2 left-2 z-10">
                          <div className="bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 shadow-lg border border-white/20">
                            <span className="font-bold text-sm text-gray-900">
                              ${product.price.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Botón de agregar en la esquina inferior derecha */}
                        {product.stock > 0 && (
                          <div className="absolute bottom-2 right-2 z-10">
                            <Button 
                              size="sm" 
                              className="rounded-full w-7 h-7 p-0 bg-white/95 hover:bg-white text-gray-900 shadow-lg border border-white/20 transition-all hover:scale-110 active:scale-95"
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(product);
                              }}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        )}

                        {/* Overlay de hover */}
                        {product.stock > 0 && (
                          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        )}

                        {/* Overlay para productos sin stock */}
                        {product.stock === 0 && (
                          <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
                            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                              Sin Stock
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <CardContent className="p-3">
                        <div className="space-y-1">
                          <h3 className="font-medium text-sm line-clamp-2 text-gray-900 leading-tight">
                            {product.name}
                          </h3>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                              {product.sku}
                            </p>
                            {product.categories && (
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                {product.categories.name}
                              </Badge>
                            )}
                          </div>
                          {product.stock === 0 && (
                            <div className="text-xs text-red-600 font-medium flex items-center gap-1">
                              <X className="h-3 w-3" />
                              Sin stock
                            </div>
                          )}
                          {product.stock > 0 && product.stock <= 5 && (
                            <div className="text-xs text-amber-600 font-medium flex items-center gap-1">
                              <div className="h-2 w-2 bg-amber-400 rounded-full" />
                              Stock bajo
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panel del carrito */}
        <div className="flex flex-col">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Carrito ({cart.length})
                </div>
                {cart.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearCart}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Items del carrito */}
              <div className="flex-1 overflow-auto space-y-3 mb-4">
                {cart.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    Carrito vacío
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-xs text-gray-600">${item.price.toFixed(2)} c/u</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="w-16 text-right font-medium text-sm">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Información del cliente */}
              <div className="space-y-3 mb-4">
                <div>
                  <Label htmlFor="customerName">Cliente (opcional)</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nombre del cliente"
                  />
                </div>
                <div>
                  <Label htmlFor="customerEmail">Email (opcional)</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="email@ejemplo.com"
                  />
                </div>
                <div>
                  <Label htmlFor="paymentMethod">Método de pago</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Efectivo</SelectItem>
                      <SelectItem value="card">Tarjeta</SelectItem>
                      <SelectItem value="transfer">Transferencia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Resumen de totales */}
              {cart.length > 0 && (
                <div className="space-y-2 mb-4">
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Impuestos (16%):</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Botón de procesar venta */}
              <Button
                onClick={handleProcessSale}
                disabled={cart.length === 0 || isProcessing}
                className="w-full"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {isProcessing ? 'Procesando...' : 'Procesar Venta'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
    </SimpleLayout>
  );
}
