import { Layout } from "@/components/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  X,
  CreditCard,
  DollarSign,
  Calculator
} from "lucide-react"
import { useEffect, useState } from 'react';
import { setPageTitle } from '@/store/uiSlice';
import { useProducts, Product, useCategories } from "@/hooks/useProducts";
import { useCreateSale } from '@/hooks/useSales';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from "@/hooks/use-toast";
import { addToCart, updateQuantity, removeFromCart, clearCart, selectCart } from "@/store/cartSlice";

interface CartItem extends Product {
  quantity: number;
}

export default function POSPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle('Punto de Venta'));
  }, [dispatch]);
  const { items: cart, subtotal, tax, total } = useSelector(selectCart);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const { data: products = [], isLoading, isError } = useProducts();
  const { data: categories = [] } = useCategories();
  const { mutate: createSale, isPending: isProcessingSale } = useCreateSale();
  const { toast } = useToast();

  const handleAddToCart = (product: Product) => {
    const cartItem = cart.find(item => item.id === product.id);
    const quantityInCart = cartItem ? cartItem.quantity : 0;

    if ((product.stock ?? 0) > quantityInCart) {
      dispatch(addToCart(product));
    } else {
      toast({
        variant: "destructive",
        title: "Stock insuficiente",
        description: `No quedan más unidades de ${product.name}.`,
      });
    }
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity > 0) {
      dispatch(updateQuantity({ id, quantity }));
    } else {
      dispatch(removeFromCart(id));
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm]);

  const handleProcessPayment = () => {
    if (cart.length === 0) return;

    const saleData = {
      customer_name: customerName,
      customer_email: customerEmail,
      subtotal,
      tax,
      total,
      payment_method: paymentMethod,
      items: cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        size: item.size,
        color: item.color,
      }))
    };

    createSale(saleData, {
      onSuccess: () => {
        dispatch(clearCart());
        setCustomerName('');
        setCustomerEmail('');
      }
    });
  };

  const filteredProducts = products
    .filter(product => {
      if (selectedCategory === 'all') return true;
      return product.category_id === selectedCategory;
    })
    .filter(product => {
      const term = searchTerm.toLowerCase();
      return (
        product.name.toLowerCase().includes(term) ||
        (product.sku && product.sku.toLowerCase().includes(term))
      );
    });

  const PRODUCTS_PER_PAGE = 8;
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  Productos
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background/50"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                  >
                    Todos
                  </Button>
                  {categories.map(category => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>

                {isLoading && <p>Cargando productos...</p>}
                {isError && <p>Error al cargar los productos.</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {paginatedProducts.map((product) => {
                    const quantityInCart = cart.find(item => item.id === product.id)?.quantity ?? 0;
                    const isOutOfStock = quantityInCart >= (product.stock ?? 0);
                    const categoryName = categories.find(cat => cat.id === product.category_id)?.name || 'Sin categoría';
                    
                    return (
                      <Card 
                        key={product.id} 
                        className={`relative overflow-hidden transition-all h-64 group cursor-pointer ${
                          isOutOfStock ? 'opacity-60' : 'hover:shadow-xl hover:scale-105'
                        }`}
                      >
                        {/* Imagen de fondo */}
                        <div 
                          className="absolute inset-0 bg-cover bg-center bg-gray-100"
                          style={{
                            backgroundImage: product.image_url 
                              ? `url(${product.image_url})` 
                              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          }}
                        >
                          {/* Overlay gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          
                          {/* Placeholder icon si no hay imagen */}
                          {!product.image_url && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-white/30">
                                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>

                        <CardContent className="relative h-full p-4 flex flex-col justify-between text-white">
                          {/* Header con stock badge */}
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <Badge 
                                variant={product.stock > 0 ? "secondary" : "destructive"}
                                className="mb-2 bg-white/20 text-white border-white/30"
                              >
                                Stock: {product.stock}
                              </Badge>
                            </div>
                            {isOutOfStock && (
                              <Badge variant="destructive" className="bg-red-500/80">
                                Agotado
                              </Badge>
                            )}
                          </div>

                          {/* Contenido principal */}
                          <div className="flex-1 flex flex-col justify-center">
                            <h3 className="font-bold text-lg mb-1 text-shadow-sm line-clamp-2">
                              {product.name}
                            </h3>
                            <p className="text-sm text-white/80 mb-1">{categoryName}</p>
                            <p className="text-xs text-white/60 font-mono">SKU: {product.sku}</p>
                          </div>

                          {/* Footer con precio y botón */}
                          <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                              <span className="text-2xl font-bold text-shadow-sm">
                                ${product.price}
                              </span>
                              {quantityInCart > 0 && (
                                <span className="text-xs text-green-300">
                                  {quantityInCart} en carrito
                                </span>
                              )}
                            </div>
                            <Button 
                              variant="secondary"
                              size="icon" 
                              className={`h-10 w-10 rounded-full transition-all ${
                                isOutOfStock 
                                  ? 'bg-gray-500/50 cursor-not-allowed' 
                                  : 'bg-white/90 hover:bg-white text-gray-900 hover:scale-110 shadow-lg'
                              }`}
                              onClick={() => handleAddToCart(product)}
                              disabled={isOutOfStock}
                            >
                              <Plus className="h-5 w-5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-4 pt-6">
                    <Button onClick={handlePrevPage} disabled={currentPage === 1} variant="outline">
                      Anterior
                    </Button>
                    <span className="text-sm font-medium">
                      Página {currentPage} de {totalPages}
                    </span>
                    <Button onClick={handleNextPage} disabled={currentPage === totalPages} variant="outline">
                      Siguiente
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Cart */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  Carrito ({cart.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Carrito vacío
                  </p>
                ) : (
                  <>
                    {cart.map((item) => (
                      <div key={item.id} className="p-3 border border-border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => dispatch(removeFromCart(item.id))}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-6 w-6"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-6 w-6"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= (item.stock ?? 0)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <span className="font-bold text-primary">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>IVA (16%):</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                      <Separator />
                                            <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-primary">${total.toFixed(2)}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-medium text-sm">Información del Cliente (Opcional)</h4>
                      <div className="space-y-2">
                        <Label htmlFor="customer-name">Nombre</Label>
                        <Input id="customer-name" placeholder="Nombre del cliente" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customer-email">Email</Label>
                        <Input id="customer-email" type="email" placeholder="email@ejemplo.com" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Método de Pago</Label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar método" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Efectivo</SelectItem>
                            <SelectItem value="card">Tarjeta</SelectItem>
                            <SelectItem value="transfer">Transferencia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button 
                        className="w-full bg-gradient-primary" 
                        size="lg"
                        onClick={handleProcessPayment}
                        disabled={isProcessingSale || cart.length === 0}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        {isProcessingSale ? 'Procesando...' : 'Procesar Pago'}
                      </Button>
                      <Button variant="outline" className="w-full" size="lg">
                        <Calculator className="h-4 w-4 mr-2" />
                        Calcular Cambio
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}