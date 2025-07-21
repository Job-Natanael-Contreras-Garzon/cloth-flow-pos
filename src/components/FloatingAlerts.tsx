import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X, Eye, Package } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { useNavigate } from "react-router-dom";

export function FloatingAlerts() {
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const { totalAlerts, getAlertsByType } = useDashboard();
  const navigate = useNavigate();

  const { outOfStock, critical, warning } = getAlertsByType();

  // Auto-hide after 10 seconds if no critical alerts
  useEffect(() => {
    if (totalAlerts > 0 && critical.length === 0) {
      const timer = setTimeout(() => {
        setIsMinimized(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [totalAlerts, critical.length]);

  // Don't show if no alerts
  if (totalAlerts === 0 || !isVisible) {
    return null;
  }

  // Minimized view - just a small badge
  if (isMinimized) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          variant="outline"
          size="sm"
          className="bg-white shadow-lg border-orange-200 hover:border-orange-300"
        >
          <AlertTriangle className="h-4 w-4 text-orange-600 mr-2" />
          <span className="text-orange-800 font-medium">{totalAlerts}</span>
        </Button>
      </div>
    );
  }

  const getMostCriticalAlert = () => {
    if (outOfStock.length > 0) return outOfStock[0];
    if (critical.length > 0) return critical[0];
    if (warning.length > 0) return warning[0];
    return null;
  };

  const mostCritical = getMostCriticalAlert();
  const hasMultiple = totalAlerts > 1;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Card className="bg-white shadow-lg border-l-4 border-l-orange-500">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-gray-900">Alerta de Stock</span>
            </div>
            <div className="flex space-x-1">
              <Button
                onClick={() => setIsMinimized(true)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <Package className="h-3 w-3" />
              </Button>
              <Button
                onClick={() => setIsVisible(false)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {mostCritical && (
            <div className="mb-3">
              <p className="font-medium text-sm text-gray-900">{mostCritical.name}</p>
              <p className="text-xs text-gray-600">SKU: {mostCritical.sku}</p>
              <div className="flex items-center justify-between mt-2">
                <Badge 
                  className={
                    mostCritical.severity === 'out_of_stock' 
                      ? "bg-red-100 text-red-800" 
                      : mostCritical.severity === 'critical'
                      ? "bg-orange-100 text-orange-800"
                      : "bg-yellow-100 text-yellow-800"
                  }
                >
                  {mostCritical.severity === 'out_of_stock' 
                    ? 'Sin Stock' 
                    : mostCritical.severity === 'critical'
                    ? 'Crítico'
                    : 'Stock Bajo'
                  }
                </Badge>
                <span className="text-sm font-medium">
                  Stock: {mostCritical.stock}
                </span>
              </div>
            </div>
          )}

          {hasMultiple && (
            <p className="text-xs text-gray-600 mb-3">
              +{totalAlerts - 1} productos más con alertas
            </p>
          )}

          <div className="flex space-x-2">
            <Button
              onClick={() => navigate('/alerts')}
              size="sm"
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              <Eye className="h-3 w-3 mr-1" />
              Ver Todas
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
