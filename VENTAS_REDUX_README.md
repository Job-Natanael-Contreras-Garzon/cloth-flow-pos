# Sistema de Ventas con Redux

## Descripción

El sistema de ventas ha sido actualizado para usar Redux Toolkit en lugar de datos hardcodeados. Esto proporciona un estado global centralizado, persistencia automática y una mejor gestión de datos.

## Componentes Principales

### 1. Redux Store - `src/store/salesSlice.ts`

El slice de ventas maneja todo el estado relacionado con las ventas:

```typescript
// Estado principal
interface SalesState {
  sales: Sale[];           // Ventas cargadas
  loading: boolean;        // Estado de carga
  error: string | null;    // Errores
  totalSales: number;      // Total de ventas en dinero
  totalTransactions: number; // Cantidad de transacciones
  averageTicket: number;   // Ticket promedio
  dailyStats: {...};       // Estadísticas del día
  searchTerm: string;      // Término de búsqueda actual
  filters: {...};          // Filtros aplicados
}
```

### 2. Hook Personalizado - `src/hooks/useReduxSales.tsx`

Proporciona una interfaz simple para interactuar con el estado de ventas:

```typescript
const {
  sales,              // Ventas filtradas
  loading,            // Estado de carga
  error,             // Errores
  totalSales,        // Total en dinero
  totalTransactions, // Cantidad de ventas
  averageTicket,     // Promedio por venta
  dailyStats,        // Estadísticas del día
  refreshData,       // Recargar datos
  updateSearchTerm,  // Actualizar búsqueda
  createNewSale,     // Crear nueva venta
} = useReduxSales();
```

### 3. Página de Ventas - `src/pages/SalesPage.tsx`

La página principal que muestra:
- Tarjetas de estadísticas en tiempo real
- Búsqueda y filtros
- Tabla de ventas con datos de la base de datos
- Estados de carga y error

## Funcionalidades Implementadas

### ✅ Carga de Datos Reales
- Conecta con Supabase usando los hooks existentes
- Carga automática al montar la página
- Manejo de estados de carga y error

### ✅ Búsqueda y Filtros
- Búsqueda por número de venta, cliente o producto
- Filtros por fecha, método de pago, estado
- Búsqueda en tiempo real sin llamadas a la API

### ✅ Estadísticas en Tiempo Real
- Total de ventas en dinero
- Cantidad de transacciones
- Ticket promedio
- Estadísticas diarias

### ✅ Gestión de Estado Centralizada
- Estado global con Redux Toolkit
- Acciones y reducers tipados
- Selectores optimizados

### ✅ Interfaz Responsive
- Tabla responsive con scroll horizontal
- Indicadores de carga
- Manejo de estados vacíos

## Uso del Sistema

### Cargar Ventas en una Página

```typescript
import { useReduxSales } from '@/hooks/useReduxSales';

function MiPagina() {
  const { sales, loading, refreshData } = useReduxSales();
  
  useEffect(() => {
    refreshData(100); // Cargar últimas 100 ventas
  }, []);
  
  if (loading) return <div>Cargando...</div>;
  
  return (
    <div>
      {sales.map(sale => (
        <div key={sale.id}>{sale.sale_number}</div>
      ))}
    </div>
  );
}
```

### Crear una Nueva Venta

```typescript
const { createNewSale } = useReduxSales();

const nuevaVenta = {
  customer_name: "Juan Pérez",
  customer_email: "juan@email.com",
  subtotal: 100.00,
  tax: 16.00,
  total: 116.00,
  payment_method: "cash",
  items: [
    {
      product_id: "product-uuid",
      quantity: 2,
      unit_price: 50.00,
      total_price: 100.00
    }
  ]
};

await createNewSale(nuevaVenta);
```

### Aplicar Filtros y Búsqueda

```typescript
const { updateSearchTerm, updateFilters } = useReduxSales();

// Buscar por término
updateSearchTerm("Juan");

// Aplicar filtros
updateFilters({
  dateFrom: "2025-01-01",
  dateTo: "2025-01-31",
  paymentMethod: "cash",
  status: "completed"
});
```

## Estructura de Datos

### Sale (Venta)
```typescript
interface Sale {
  id: string;
  sale_number: string;
  customer_name?: string;
  customer_email?: string;
  subtotal: number;
  tax: number;
  total: number;
  payment_method: string;
  status: string;
  created_at: string;
  updated_at: string;
  sale_items?: SaleItem[];
}
```

### SaleItem (Item de Venta)
```typescript
interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  size?: string;
  color?: string;
  created_at: string;
  products?: {
    id: string;
    name: string;
    sku: string;
  };
}
```

## Componentes Adicionales

### CreateSaleForm
Un formulario completo para crear nuevas ventas:
- Información del cliente
- Selección de productos
- Cálculo automático de totales
- Validación de datos

## Próximas Mejoras

1. **Filtros Avanzados**: Implementar un panel de filtros más completo
2. **Exportación**: Añadir funcionalidad de exportación a Excel/PDF
3. **Paginación**: Implementar paginación para grandes volúmenes de datos
4. **Cache Inteligente**: Optimizar las consultas con cache
5. **Tiempo Real**: Actualización automática de datos

## Migración desde Datos Hardcodeados

El sistema anterior usaba un array estático de ventas. El nuevo sistema:

1. **Antes**: Datos hardcodeados en el componente
2. **Ahora**: Datos dinámicos desde Supabase via Redux
3. **Beneficios**: 
   - Datos siempre actualizados
   - Estado compartido entre componentes
   - Mejor rendimiento con cache
   - Facilita testing y mantenimiento

## Testing

Para probar el sistema:

1. Asegúrate de que Supabase esté configurado
2. Ejecuta `npm run dev`
3. Navega a la página de Ventas
4. Las ventas se cargarán automáticamente desde la base de datos
5. Prueba la búsqueda y filtros

## Soporte

Si encuentras algún problema:
1. Verifica la conexión a Supabase
2. Revisa la consola del navegador por errores
3. Confirma que las tablas de ventas existen en la base de datos
