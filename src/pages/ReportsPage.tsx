import { SimpleLayout } from "@/components/SimpleLayout";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileDown,
  FileUp,
  FileSpreadsheet,
  TrendingUp,
  Package,
  FolderOpen,
  ShoppingCart,
  Calendar,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";
import {
  useSalesReport,
  useProductsReport,
  useInventoryReport,
  useCategoriesReport,
  useExcelExport
} from "@/hooks/useReports";
import { useExcelImport } from "@/hooks/useExcelImport";
import { useDropzone } from "react-dropzone";
import { useCallback } from "react";
import { MetricCard } from "@/components/MetricCard";
import { ExportButtons } from "@/components/ExportButtons";

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [selectedReport, setSelectedReport] = useState<string>('');

  // Hooks de datos
  const { data: salesData, isLoading: salesLoading } = useSalesReport(
    dateRange.startDate || undefined,
    dateRange.endDate || undefined
  );
  const { data: productsData, isLoading: productsLoading } = useProductsReport();
  const { data: inventoryData, isLoading: inventoryLoading } = useInventoryReport();
  const { data: categoriesData, isLoading: categoriesLoading } = useCategoriesReport();

  // Hooks de exportación e importación
  const {
    exportSalesToExcel,
    exportProductsToExcel,
    exportInventoryToExcel,
    exportCategoriesToExcel,
    downloadProductTemplate
  } = useExcelExport();
  const { importProducts, isImporting } = useExcelImport();

  // Configuración del dropzone para importar
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      importProducts(file);
    }
  }, [importProducts]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    disabled: isImporting
  });

  // Calcular estadísticas
  const salesStats = salesData ? {
    totalSales: salesData.length,
    totalRevenue: salesData.reduce((sum, sale) => sum + sale.total, 0),
    averageOrderValue: salesData.length > 0 ? 
      salesData.reduce((sum, sale) => sum + sale.total, 0) / salesData.length : 0,
    totalItems: salesData.reduce((sum, sale) => sum + sale.items.length, 0)
  } : null;

  const inventoryStats = inventoryData ? {
    totalProducts: inventoryData.length,
    activeProducts: inventoryData.filter(p => p.is_active).length,
    lowStockProducts: inventoryData.filter(p => p.stock_status === 'low').length,
    outOfStockProducts: inventoryData.filter(p => p.stock_status === 'out').length,
    totalInventoryValue: inventoryData.reduce((sum, p) => sum + p.stock_value, 0)
  } : null;

  const handleExport = (type: string) => {
    const timestamp = new Date().toISOString().split('T')[0];
    
    switch (type) {
      case 'sales':
        if (salesData) {
          exportSalesToExcel(salesData, `reporte-ventas-${timestamp}`);
        }
        break;
      case 'products':
        if (productsData) {
          exportProductsToExcel(productsData, `reporte-productos-${timestamp}`);
        }
        break;
      case 'inventory':
        if (inventoryData) {
          exportInventoryToExcel(inventoryData, `reporte-inventario-${timestamp}`);
        }
        break;
      case 'categories':
        if (categoriesData) {
          exportCategoriesToExcel(categoriesData, `reporte-categorias-${timestamp}`);
        }
        break;
    }
  };

  return (
    <SimpleLayout title="Reportes y Análisis">
      <div className="space-y-6">
        {/* Panel de control rápido */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Ventas Totales"
            value={salesStats?.totalSales || 0}
            icon={ShoppingCart}
            variant="success"
            isLoading={salesLoading}
          />
          <MetricCard
            title="Ingresos"
            value={`$${salesStats?.totalRevenue.toLocaleString('es-MX') || '0'}`}
            icon={TrendingUp}
            variant="success"
            isLoading={salesLoading}
          />
          <MetricCard
            title="Productos Activos"
            value={inventoryStats?.activeProducts || 0}
            icon={Package}
            variant="default"
            isLoading={inventoryLoading}
          />
          <MetricCard
            title="Stock Bajo"
            value={inventoryStats?.lowStockProducts || 0}
            icon={AlertCircle}
            variant="warning"
            isLoading={inventoryLoading}
          />
        </div>

        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Reportes
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <FileDown className="h-4 w-4" />
              Exportar
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <FileUp className="h-4 w-4" />
              Importar
            </TabsTrigger>
          </TabsList>

          {/* Pestaña de Reportes */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Filtros de Reporte
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="startDate">Fecha Inicio</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">Fecha Fin</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Tipo de Reporte</Label>
                    <Select value={selectedReport} onValueChange={setSelectedReport}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales">Ventas</SelectItem>
                        <SelectItem value="products">Productos</SelectItem>
                        <SelectItem value="inventory">Inventario</SelectItem>
                        <SelectItem value="categories">Categorías</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vista de reportes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Reporte de Ventas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Reporte de Ventas
                    </div>
                    <Badge variant="outline">
                      {salesLoading ? 'Cargando...' : `${salesData?.length || 0} registros`}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {salesStats && (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Total de ventas:</span>
                        <span className="font-semibold">{salesStats.totalSales}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ingresos totales:</span>
                        <span className="font-semibold text-green-600">
                          ${salesStats.totalRevenue.toLocaleString('es-MX')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Promedio por venta:</span>
                        <span className="font-semibold">
                          ${salesStats.averageOrderValue.toLocaleString('es-MX')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Items vendidos:</span>
                        <span className="font-semibold">{salesStats.totalItems}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Reporte de Inventario */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Reporte de Inventario
                    </div>
                    <Badge variant="outline">
                      {inventoryLoading ? 'Cargando...' : `${inventoryData?.length || 0} productos`}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {inventoryStats && (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Total productos:</span>
                        <span className="font-semibold">{inventoryStats.totalProducts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Productos activos:</span>
                        <span className="font-semibold text-green-600">{inventoryStats.activeProducts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Stock bajo:</span>
                        <span className="font-semibold text-yellow-600">{inventoryStats.lowStockProducts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Agotados:</span>
                        <span className="font-semibold text-red-600">{inventoryStats.outOfStockProducts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Valor inventario:</span>
                        <span className="font-semibold text-blue-600">
                          ${inventoryStats.totalInventoryValue.toLocaleString('es-MX')}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Pestaña de Exportación */}
          <TabsContent value="export" className="space-y-6">
            <ExportButtons
              onExport={handleExport}
              salesCount={salesData?.length}
              productsCount={productsData?.length}
              categoriesCount={categoriesData?.length}
              salesLoading={salesLoading}
              productsLoading={productsLoading}
              categoriesLoading={categoriesLoading}
            />
          </TabsContent>

          {/* Pestaña de Importación */}
          <TabsContent value="import" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileUp className="h-5 w-5" />
                  Importar Productos desde Excel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Botón para descargar plantilla */}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-blue-900">Plantilla de Excel</h3>
                      <p className="text-sm text-blue-600">
                        Descarga la plantilla con el formato correcto
                      </p>
                    </div>
                  </div>
                  <Button onClick={downloadProductTemplate} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar Plantilla
                  </Button>
                </div>

                {/* Zona de drop para subir archivo */}
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : isImporting
                      ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                      : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50 cursor-pointer'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="space-y-4">
                    <Upload className={`h-12 w-12 mx-auto ${
                      isDragActive ? 'text-blue-500' : 'text-gray-400'
                    }`} />
                    
                    {isImporting ? (
                      <div>
                        <p className="text-lg font-medium text-gray-600">
                          Importando productos...
                        </p>
                        <p className="text-sm text-gray-500">
                          Por favor espera mientras procesamos el archivo
                        </p>
                      </div>
                    ) : isDragActive ? (
                      <p className="text-lg font-medium text-blue-600">
                        Suelta el archivo aquí
                      </p>
                    ) : (
                      <div>
                        <p className="text-lg font-medium text-gray-600">
                          Arrastra un archivo Excel aquí o haz clic para seleccionar
                        </p>
                        <p className="text-sm text-gray-500">
                          Solo archivos .xlsx y .xls (máximo 5MB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Instrucciones */}
                <div className="bg-amber-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-amber-900 mb-2">Instrucciones:</h3>
                  <ul className="text-sm text-amber-800 space-y-1">
                    <li>• Descarga primero la plantilla de Excel</li>
                    <li>• Completa los datos siguiendo el formato de la plantilla</li>
                    <li>• Las columnas Nombre, SKU, Precio, Costo y Stock son obligatorias</li>
                    <li>• Los productos existentes (mismo SKU) serán actualizados</li>
                    <li>• Los productos nuevos serán creados automáticamente</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SimpleLayout>
  );
}
