import { SimpleLayout } from "@/components/SimpleLayout";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Receipt, 
  Search, 
  DollarSign,
  TrendingUp,
  Calendar,
  Eye,
  Filter,
  X
} from "lucide-react";
import { useSales } from "@/hooks/useSales";

export default function SalesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const { data: sales = [], isLoading, isError } = useSales();

  const filteredSales = sales.filter((sale: any) => {
    const matchesSearch = sale.sale_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (sale.customer_name && sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPayment = paymentFilter === 'all' || sale.payment_method === paymentFilter;
    
    const matchesDate = (() => {
      if (dateFilter === 'all') return true;
      
      const saleDate = new Date(sale.created_at);
      const today = new Date();
      
      switch (dateFilter) {
        case 'today':
          return saleDate.toDateString() === today.toDateString();
        case 'week': {
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          return saleDate >= weekAgo;
        }
        case 'month': {
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          return saleDate >= monthAgo;
        }
        default:
          return true;
      }
    })();
    
    return matchesSearch && matchesPayment && matchesDate;
  });

  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum: number, sale: any) => sum + (sale.total || sale.total_amount || 0), 0);
  const todaySales = sales.filter((sale: any) => {
    const today = new Date().toDateString();
    return new Date(sale.created_at).toDateString() === today;
  }).length;
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash': return 'bg-green-100 text-green-800';
      case 'card': return 'bg-blue-100 text-blue-800';
      case 'transfer': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash': return 'Efectivo';
      case 'card': return 'Tarjeta';
      case 'transfer': return 'Transferencia';
      default: return method;
    }
  };

  return (
    <SimpleLayout title="Ventas">
      <div className="space-y-6">
        {/* KPIs de ventas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Receipt className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Ventas</p>
                  <p className="text-2xl font-bold">{totalSales}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                  <p className="text-2xl font-bold">${(totalRevenue || 0).toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ventas Hoy</p>
                  <p className="text-2xl font-bold">{todaySales}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ticket Promedio</p>
                  <p className="text-2xl font-bold">${(averageTicket || 0).toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de ventas */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Historial de Ventas ({filteredSales.length})
              </CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar ventas..."
                    className="pl-9 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Método de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los métodos</SelectItem>
                    <SelectItem value="cash">Efectivo</SelectItem>
                    <SelectItem value="card">Tarjeta</SelectItem>
                    <SelectItem value="transfer">Transferencia</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="today">Hoy</SelectItem>
                    <SelectItem value="week">Esta semana</SelectItem>
                    <SelectItem value="month">Este mes</SelectItem>
                  </SelectContent>
                </Select>
                {(searchTerm || paymentFilter !== 'all' || dateFilter !== 'all') && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setSearchTerm('');
                      setPaymentFilter('all');
                      setDateFilter('all');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Cargando ventas...</div>
            ) : isError ? (
              <div className="text-center py-8 text-red-600">
                Error al cargar ventas
              </div>
            ) : filteredSales.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No se encontraron ventas' : 'No hay ventas registradas'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Número</th>
                      <th className="text-left py-3 px-4 font-medium">Fecha</th>
                      <th className="text-left py-3 px-4 font-medium">Cliente</th>
                      <th className="text-left py-3 px-4 font-medium">Método de Pago</th>
                      <th className="text-left py-3 px-4 font-medium">Total</th>
                      <th className="text-center py-3 px-4 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.map((sale: any) => (
                      <tr key={sale.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{sale.sale_number}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(sale.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-3 px-4">
                          {sale.customer_name || <span className="text-gray-400">Sin cliente</span>}
                        </td>
                        <td className="py-3 px-4">
                          <Badge 
                            variant="secondary"
                            className={getPaymentMethodColor(sale.payment_method)}
                          >
                            {getPaymentMethodLabel(sale.payment_method)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-bold text-green-600">
                          ${(sale.total || sale.total_amount || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => {
                                setSelectedSale(sale);
                                setIsDetailsOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de detalles de venta */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de Venta {selectedSale?.sale_number}</DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-6">
              {/* Información general */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Fecha</p>
                  <p className="font-medium">
                    {new Date(selectedSale.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Cliente</p>
                  <p className="font-medium">{selectedSale.customer_name || 'Sin cliente'}</p>
                  {selectedSale.customer_email && (
                    <p className="text-sm text-gray-500">{selectedSale.customer_email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Método de Pago</p>
                  <Badge 
                    variant="secondary"
                    className={getPaymentMethodColor(selectedSale.payment_method)}
                  >
                    {getPaymentMethodLabel(selectedSale.payment_method)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Estado</p>
                  <Badge variant="default">
                    {selectedSale.status || 'Completada'}
                  </Badge>
                </div>
              </div>

              {/* Items de la venta */}
              {selectedSale.sale_items && selectedSale.sale_items.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Productos vendidos</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-2 px-3 text-sm font-medium">Producto</th>
                          <th className="text-center py-2 px-3 text-sm font-medium">Cantidad</th>
                          <th className="text-right py-2 px-3 text-sm font-medium">Precio Unit.</th>
                          <th className="text-right py-2 px-3 text-sm font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedSale.sale_items.map((item: any, index: number) => (
                          <tr key={item.id || index} className="border-t">
                            <td className="py-2 px-3">
                              <div>
                                <p className="font-medium">{item.products?.name || `Producto ${item.product_id}`}</p>
                                <p className="text-xs text-gray-500">SKU: {item.products?.sku || 'N/A'}</p>
                                {(item.size || item.color) && (
                                  <p className="text-xs text-gray-500">
                                    {item.size && `Talla: ${item.size}`}
                                    {item.size && item.color && ' - '}
                                    {item.color && `Color: ${item.color}`}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="py-2 px-3 text-center">{item.quantity}</td>
                            <td className="py-2 px-3 text-right">${(item.unit_price || 0).toFixed(2)}</td>
                            <td className="py-2 px-3 text-right font-medium">${(item.total_price || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Resumen de totales */}
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${(selectedSale.subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Impuestos:</span>
                    <span>${(selectedSale.tax || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span className="text-green-600">${(selectedSale.total || selectedSale.total_amount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SimpleLayout>
  );
}
