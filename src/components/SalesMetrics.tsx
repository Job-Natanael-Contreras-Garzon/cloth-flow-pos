import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface SalesComparison {
  today: number;
  yesterday: number;
  thisWeek: number;
  lastWeek: number;
  thisMonth: number;
  lastMonth: number;
}

export function SalesMetrics() {
  const [metrics, setMetrics] = useState<SalesComparison | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const { data, error } = await supabase.rpc('get_sales_comparison');
        
        if (error) {
          console.error('Error loading sales metrics:', error);
          return;
        }

        setMetrics(data);
      } catch (error) {
        console.error('Error in loadMetrics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, []);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3" />;
    if (change < 0) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return "text-green-600 bg-green-50 border-green-200";
    if (change < 0) return "text-red-600 bg-red-50 border-red-200";
    return "text-gray-600 bg-gray-50 border-gray-200";
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return null;
  }

  const todayChange = getPercentageChange(metrics.today, metrics.yesterday);
  const weekChange = getPercentageChange(metrics.thisWeek, metrics.lastWeek);
  const monthChange = getPercentageChange(metrics.thisMonth, metrics.lastMonth);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Tendencias de Ventas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Comparación diaria */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hoy vs Ayer</p>
              <p className="font-semibold">{formatCurrency(metrics.today)}</p>
            </div>
            <Badge className={`${getTrendColor(todayChange)} flex items-center space-x-1`}>
              {getTrendIcon(todayChange)}
              <span>{todayChange > 0 ? '+' : ''}{todayChange}%</span>
            </Badge>
          </div>

          {/* Comparación semanal */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Esta Semana</p>
              <p className="font-semibold">{formatCurrency(metrics.thisWeek)}</p>
            </div>
            <Badge className={`${getTrendColor(weekChange)} flex items-center space-x-1`}>
              {getTrendIcon(weekChange)}
              <span>{weekChange > 0 ? '+' : ''}{weekChange}%</span>
            </Badge>
          </div>

          {/* Comparación mensual */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Este Mes</p>
              <p className="font-semibold">{formatCurrency(metrics.thisMonth)}</p>
            </div>
            <Badge className={`${getTrendColor(monthChange)} flex items-center space-x-1`}>
              {getTrendIcon(monthChange)}
              <span>{monthChange > 0 ? '+' : ''}{monthChange}%</span>
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
