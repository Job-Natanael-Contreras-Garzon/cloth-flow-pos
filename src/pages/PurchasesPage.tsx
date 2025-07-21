import { SimpleLayout } from "@/components/SimpleLayout";
import { CreatePurchaseForm } from "@/components/CreatePurchaseForm";
import { usePurchases } from "@/hooks/usePurchases";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Eye,
  DollarSign,
  Package,
  Calendar,
  TrendingDown,
  CheckCircle,
  Clock,
  X,
  User,
  Hash
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PurchasesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const { 
    purchases, 
    isLoading, 
    isError, 
    createPurchase, 
    updatePurchaseStatus 
  } = usePurchases();

  const filteredPurchases = purchases.filter((purchase) =>
    purchase.purchase_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPurchases = purchases.length;
  const totalCost = purchases.reduce((sum, purchase) => sum + purchase.total, 0);
  const todayPurchases = purchases.filter((purchase) => {
    const today = new Date().toDateString();
    return new Date(purchase.created_at).toDateString() === today;
  }).length;
  const averagePurchase = totalPurchases > 0 ? totalCost / totalPurchases : 0;

  const handleViewDetails = (purchase) => {
    setSelectedPurchase(purchase);
    setShowDetailsModal(true);
  };

  return (
    <SimpleLayout title="Compras">
      <div className="space-y-6">
        {/* KPIs de compras */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <ShoppingCart className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Compras</p>
                  <p className="text-2xl font-bold">{totalPurchases}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingDown className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Costo Total</p>
                  <p className="text-2xl font-bold">${totalCost.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Compras Hoy</p>
                  <p className="text-2xl font-bold">{todayPurchases}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Compra Promedio</p>
                  <p className="text-2xl font-bold">${averagePurchase.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de compras */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Historial de Compras ({filteredPurchases.length})
              </CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar compras..."
                    className="pl-9 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Compra
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Cargando compras...</div>
            ) : isError ? (
              <div className="text-center py-8 text-red-600">
                Error al cargar compras
              </div>
            ) : filteredPurchases.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No hay compras registradas</h3>
                <p className="text-sm text-gray-400 mb-4">
                  {searchTerm ? 'No se encontraron compras con esos criterios' : 'Comienza registrando tu primera compra'}
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Primera Compra
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Número</th>
                      <th className="text-left py-3 px-4 font-medium">Fecha</th>
                      <th className="text-left py-3 px-4 font-medium">Proveedor</th>
                      <th className="text-left py-3 px-4 font-medium">Estado</th>
                      <th className="text-left py-3 px-4 font-medium">Total</th>
                      <th className="text-center py-3 px-4 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPurchases.map((purchase) => (
                      <tr key={purchase.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{purchase.purchase_number}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(purchase.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="py-3 px-4">{purchase.supplier_name}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={purchase.status === 'received' ? 'default' : 'secondary'}
                              className="flex items-center gap-1"
                            >
                              {purchase.status === 'received' ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : (
                                <Clock className="h-3 w-3" />
                              )}
                              {purchase.status === 'received' ? 'Recibida' : 'Pendiente'}
                            </Badge>
                            {purchase.status === 'pending' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updatePurchaseStatus(purchase.id, 'received')}
                              >
                                Marcar Recibida
                              </Button>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-bold text-red-600">
                          ${purchase.total.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center">
                            <Button size="sm" variant="ghost" onClick={() => handleViewDetails(purchase)}>
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

      {/* Formulario de nueva compra */}
      <CreatePurchaseForm
        open={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={createPurchase}
        isLoading={isLoading}
      />

      {/* Modal de detalles de compra */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Detalles de Compra
            </DialogTitle>
          </DialogHeader>
          
          {selectedPurchase && (
            <div className="space-y-6">
              {/* Información general */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Hash className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Información General</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-500">Número de Compra:</span>
                        <p className="font-medium">{selectedPurchase.purchase_number}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Fecha:</span>
                        <p className="font-medium">
                          {new Date(selectedPurchase.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Estado:</span>
                        <div className="mt-1">
                          <Badge 
                            variant={selectedPurchase.status === 'received' ? 'default' : 'secondary'}
                            className="flex items-center gap-1 w-fit"
                          >
                            {selectedPurchase.status === 'received' ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : (
                              <Clock className="h-3 w-3" />
                            )}
                            {selectedPurchase.status === 'received' ? 'Recibida' : 'Pendiente'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Proveedor</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-500">Nombre:</span>
                        <p className="font-medium">{selectedPurchase.supplier_name}</p>
                      </div>
                      {selectedPurchase.supplier_email && (
                        <div>
                          <span className="text-sm text-gray-500">Email:</span>
                          <p className="font-medium">{selectedPurchase.supplier_email}</p>
                        </div>
                      )}
                      {selectedPurchase.delivery_date && (
                        <div>
                          <span className="text-sm text-gray-500">Fecha de Entrega:</span>
                          <p className="font-medium">
                            {new Date(selectedPurchase.delivery_date).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Productos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Productos ({selectedPurchase.purchase_items?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedPurchase.purchase_items && selectedPurchase.purchase_items.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-3 font-medium text-sm">Producto</th>
                            <th className="text-center py-2 px-3 font-medium text-sm">Cantidad</th>
                            <th className="text-right py-2 px-3 font-medium text-sm">Precio Unit.</th>
                            <th className="text-right py-2 px-3 font-medium text-sm">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedPurchase.purchase_items.map((item) => (
                            <tr key={item.id} className="border-b">
                              <td className="py-2 px-3">
                                <div>
                                  <p className="font-medium">{item.product?.name || 'Producto desconocido'}</p>
                                  {item.product?.sku && (
                                    <p className="text-xs text-gray-500">SKU: {item.product.sku}</p>
                                  )}
                                </div>
                              </td>
                              <td className="py-2 px-3 text-center">{item.quantity}</td>
                              <td className="py-2 px-3 text-right">${item.unit_cost?.toFixed(2) || '0.00'}</td>
                              <td className="py-2 px-3 text-right font-medium">
                                ${item.total_cost?.toFixed(2) || '0.00'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No hay productos registrados en esta compra
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Resumen financiero */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Resumen Financiero</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">
                        ${(selectedPurchase.subtotal || 0).toFixed(2)}
                      </span>
                    </div>
                    {selectedPurchase.tax > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Impuestos:</span>
                        <span className="font-medium">
                          ${(selectedPurchase.tax || 0).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="font-medium text-lg">Total:</span>
                      <span className="font-bold text-lg text-red-600">
                        ${(selectedPurchase.total || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Acciones */}
              {selectedPurchase.status === 'pending' && (
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button 
                    onClick={() => {
                      updatePurchaseStatus(selectedPurchase.id, 'received');
                      setShowDetailsModal(false);
                    }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Marcar como Recibida
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SimpleLayout>
  );
}
