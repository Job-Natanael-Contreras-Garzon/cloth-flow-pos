import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Package, 
  BarChart3, 
  FolderOpen,
  Download,
  Loader2,
  LucideIcon
} from "lucide-react";

interface ExportOption {
  key: string;
  title: string;
  description: string;
  icon: LucideIcon;
  count?: number;
  isLoading?: boolean;
  disabled?: boolean;
}

interface ExportButtonsProps {
  onExport: (type: string) => void;
  salesCount?: number;
  productsCount?: number;
  categoriesCount?: number;
  salesLoading?: boolean;
  productsLoading?: boolean;
  categoriesLoading?: boolean;
}

export function ExportButtons({
  onExport,
  salesCount = 0,
  productsCount = 0,
  categoriesCount = 0,
  salesLoading = false,
  productsLoading = false,
  categoriesLoading = false,
}: ExportButtonsProps) {
  const exportOptions: ExportOption[] = [
    {
      key: 'sales',
      title: 'Ventas',
      description: 'Reporte completo de ventas con detalles',
      icon: ShoppingCart,
      count: salesCount,
      isLoading: salesLoading,
      disabled: salesLoading || salesCount === 0
    },
    {
      key: 'products',
      title: 'Productos',
      description: 'Catálogo completo de productos',
      icon: Package,
      count: productsCount,
      isLoading: productsLoading,
      disabled: productsLoading || productsCount === 0
    },
    {
      key: 'inventory',
      title: 'Inventario',
      description: 'Valorización y estado del inventario',
      icon: BarChart3,
      count: productsCount,
      isLoading: productsLoading,
      disabled: productsLoading || productsCount === 0
    },
    {
      key: 'categories',
      title: 'Categorías',
      description: 'Resumen de categorías con estadísticas',
      icon: FolderOpen,
      count: categoriesCount,
      isLoading: categoriesLoading,
      disabled: categoriesLoading || categoriesCount === 0
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Exportar Reportes a Excel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exportOptions.map((option) => (
            <Button
              key={option.key}
              onClick={() => onExport(option.key)}
              disabled={option.disabled}
              variant="outline"
              className="h-auto p-6 flex flex-col items-center gap-3 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between w-full">
                <option.icon className="h-8 w-8 text-blue-600" />
                {option.count !== undefined && (
                  <Badge variant="secondary" className="ml-2">
                    {option.isLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      option.count
                    )}
                  </Badge>
                )}
              </div>
              
              <div className="text-center">
                <div className="font-semibold text-gray-900">{option.title}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {option.description}
                </div>
              </div>

              {option.disabled && !option.isLoading && (
                <div className="text-xs text-red-500">
                  {option.count === 0 ? 'Sin datos para exportar' : 'No disponible'}
                </div>
              )}
            </Button>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-3">
            <Download className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">
                Información sobre exportación:
              </p>
              <ul className="text-blue-700 space-y-1">
                <li>• Los archivos se descargan en formato Excel (.xlsx)</li>
                <li>• Las ventas incluyen una hoja adicional con el detalle de items</li>
                <li>• El inventario incluye valorización y análisis de márgenes</li>
                <li>• Los datos reflejan la información actual de la base de datos</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
