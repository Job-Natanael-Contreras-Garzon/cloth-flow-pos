import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  isLoading?: boolean;
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  changeLabel,
  icon: Icon, 
  variant = 'default',
  isLoading = false 
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (change === undefined) return null;
    if (change > 0) return <TrendingUp className="h-4 w-4" />;
    if (change < 0) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getTrendColor = () => {
    if (change === undefined) return '';
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getIconColor = () => {
    switch (variant) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'danger': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toLocaleString('es-MX');
    }
    return val;
  };

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
              {isLoading ? (
                <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <p className="text-2xl font-bold">{formatValue(value)}</p>
              )}
              {change !== undefined && !isLoading && (
                <div className={`flex items-center gap-1 ${getTrendColor()}`}>
                  {getTrendIcon()}
                  <span className="text-sm font-medium">
                    {Math.abs(change)}%
                  </span>
                  {changeLabel && (
                    <span className="text-xs text-gray-500">{changeLabel}</span>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className={`flex-shrink-0 ${getIconColor()}`}>
            <Icon className="h-8 w-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
