import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { useToast } from '@/hooks/use-toast'

// Interfaces para los datos de reportes
export interface SalesReport {
  id: string
  sale_number: string
  customer_name?: string
  customer_email?: string
  subtotal: number
  tax: number
  total: number
  payment_method: string
  status: string
  created_at: string
  items: SaleItem[]
}

export interface SaleItem {
  id: string
  product_name: string
  sku: string
  category_name?: string
  quantity: number
  unit_price: number
  total_price: number
  size?: string
  color?: string
}

export interface ProductReport {
  id: string
  name: string
  sku: string
  description?: string
  category_name?: string
  price: number
  cost: number
  stock: number
  min_stock: number
  sizes: string[]
  colors: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface InventoryReport extends ProductReport {
  stock_value: number
  margin: number
  margin_percentage: number
  stock_status: 'low' | 'normal' | 'out'
}

export interface CategoryReport {
  id: string
  name: string
  description?: string
  products_count: number
  total_stock: number
  total_value: number
  created_at: string
}

// Hook para obtener reporte de ventas
export function useSalesReport(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['sales-report', startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('sales')
        .select(`
          *,
          sale_items (
            id,
            quantity,
            unit_price,
            total_price,
            size,
            color,
            products (
              name,
              sku,
              categories (
                name
              )
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (startDate) {
        query = query.gte('created_at', startDate)
      }
      if (endDate) {
        query = query.lte('created_at', endDate)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error al cargar reporte de ventas:', error)
        throw error
      }

      return data?.map(sale => ({
        ...sale,
        items: sale.sale_items?.map(item => ({
          id: item.id,
          product_name: item.products?.name || 'Producto eliminado',
          sku: item.products?.sku || 'N/A',
          category_name: item.products?.categories?.name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          size: item.size,
          color: item.color,
        })) || []
      })) as SalesReport[]
    },
  })
}

// Hook para obtener reporte de productos
export function useProductsReport() {
  return useQuery({
    queryKey: ['products-report'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name
          )
        `)
        .order('name')

      if (error) {
        console.error('Error al cargar reporte de productos:', error)
        throw error
      }

      return data?.map(product => ({
        ...product,
        category_name: product.categories?.name,
      })) as ProductReport[]
    },
  })
}

// Hook para obtener reporte de inventario
export function useInventoryReport() {
  return useQuery({
    queryKey: ['inventory-report'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name
          )
        `)
        .order('name')

      if (error) {
        console.error('Error al cargar reporte de inventario:', error)
        throw error
      }

      return data?.map(product => {
        const stockValue = product.stock * product.price
        const margin = product.price - product.cost
        const marginPercentage = product.price > 0 ? (margin / product.price) * 100 : 0
        const stockStatus: 'low' | 'normal' | 'out' = 
          product.stock === 0 ? 'out' :
          product.stock <= product.min_stock ? 'low' : 'normal'

        return {
          ...product,
          category_name: product.categories?.name,
          stock_value: stockValue,
          margin,
          margin_percentage: marginPercentage,
          stock_status: stockStatus,
        }
      }) as InventoryReport[]
    },
  })
}

// Hook para obtener reporte de categorías
export function useCategoriesReport() {
  return useQuery({
    queryKey: ['categories-report'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          products (
            id,
            stock,
            price
          )
        `)
        .order('name')

      if (error) {
        console.error('Error al cargar reporte de categorías:', error)
        throw error
      }

      return data?.map(category => {
        const products = category.products || []
        const productsCount = products.length
        const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0)
        const totalValue = products.reduce((sum, p) => sum + ((p.stock || 0) * (p.price || 0)), 0)

        return {
          id: category.id,
          name: category.name,
          description: category.description,
          products_count: productsCount,
          total_stock: totalStock,
          total_value: totalValue,
          created_at: category.created_at,
        }
      }) as CategoryReport[]
    },
  })
}

// Funciones de exportación a Excel
export function useExcelExport() {
  const { toast } = useToast()

  const exportSalesToExcel = (salesData: SalesReport[], filename = 'reporte-ventas') => {
    try {
      // Hoja de ventas
      const salesSheet = salesData.map(sale => ({
        'Número de Venta': sale.sale_number,
        'Cliente': sale.customer_name || 'Cliente anónimo',
        'Email': sale.customer_email || '',
        'Subtotal': sale.subtotal,
        'Impuestos': sale.tax,
        'Total': sale.total,
        'Método de Pago': sale.payment_method,
        'Estado': sale.status,
        'Fecha': new Date(sale.created_at).toLocaleDateString('es-ES'),
        'Cantidad de Items': sale.items.length,
      }))

      // Hoja de items detallados
      const itemsSheet = salesData.flatMap(sale => 
        sale.items.map(item => ({
          'Número de Venta': sale.sale_number,
          'Producto': item.product_name,
          'SKU': item.sku,
          'Categoría': item.category_name || '',
          'Cantidad': item.quantity,
          'Precio Unitario': item.unit_price,
          'Total': item.total_price,
          'Talla': item.size || '',
          'Color': item.color || '',
          'Fecha Venta': new Date(sale.created_at).toLocaleDateString('es-ES'),
        }))
      )

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(salesSheet), 'Ventas')
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(itemsSheet), 'Detalle Items')
      
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      saveAs(data, `${filename}.xlsx`)

      toast({
        title: "Exportación exitosa",
        description: "El reporte de ventas se ha exportado correctamente.",
      })
    } catch (error) {
      console.error('Error al exportar ventas:', error)
      toast({
        variant: "destructive",
        title: "Error de exportación",
        description: "No se pudo exportar el reporte de ventas.",
      })
    }
  }

  const exportProductsToExcel = (productsData: ProductReport[], filename = 'reporte-productos') => {
    try {
      const worksheet = productsData.map(product => ({
        'Nombre': product.name,
        'SKU': product.sku,
        'Descripción': product.description || '',
        'Categoría': product.category_name || '',
        'Precio': product.price,
        'Costo': product.cost,
        'Stock': product.stock,
        'Stock Mínimo': product.min_stock,
        'Tallas': Array.isArray(product.sizes) ? product.sizes.join(', ') : '',
        'Colores': Array.isArray(product.colors) ? product.colors.join(', ') : '',
        'Activo': product.is_active ? 'Sí' : 'No',
        'Fecha Creación': new Date(product.created_at).toLocaleDateString('es-ES'),
      }))

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(worksheet), 'Productos')
      
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      saveAs(data, `${filename}.xlsx`)

      toast({
        title: "Exportación exitosa",
        description: "El reporte de productos se ha exportado correctamente.",
      })
    } catch (error) {
      console.error('Error al exportar productos:', error)
      toast({
        variant: "destructive",
        title: "Error de exportación",
        description: "No se pudo exportar el reporte de productos.",
      })
    }
  }

  const exportInventoryToExcel = (inventoryData: InventoryReport[], filename = 'reporte-inventario') => {
    try {
      const worksheet = inventoryData.map(item => ({
        'Nombre': item.name,
        'SKU': item.sku,
        'Categoría': item.category_name || '',
        'Precio': item.price,
        'Costo': item.cost,
        'Margen': item.margin,
        'Margen %': `${item.margin_percentage.toFixed(2)}%`,
        'Stock': item.stock,
        'Stock Mínimo': item.min_stock,
        'Valor Inventario': item.stock_value,
        'Estado Stock': item.stock_status === 'out' ? 'Agotado' : 
                        item.stock_status === 'low' ? 'Bajo' : 'Normal',
        'Activo': item.is_active ? 'Sí' : 'No',
      }))

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(worksheet), 'Inventario')
      
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      saveAs(data, `${filename}.xlsx`)

      toast({
        title: "Exportación exitosa",
        description: "El reporte de inventario se ha exportado correctamente.",
      })
    } catch (error) {
      console.error('Error al exportar inventario:', error)
      toast({
        variant: "destructive",
        title: "Error de exportación",
        description: "No se pudo exportar el reporte de inventario.",
      })
    }
  }

  const exportCategoriesToExcel = (categoriesData: CategoryReport[], filename = 'reporte-categorias') => {
    try {
      const worksheet = categoriesData.map(category => ({
        'Nombre': category.name,
        'Descripción': category.description || '',
        'Cantidad Productos': category.products_count,
        'Stock Total': category.total_stock,
        'Valor Total': category.total_value,
        'Fecha Creación': new Date(category.created_at).toLocaleDateString('es-ES'),
      }))

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(worksheet), 'Categorías')
      
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      saveAs(data, `${filename}.xlsx`)

      toast({
        title: "Exportación exitosa",
        description: "El reporte de categorías se ha exportado correctamente.",
      })
    } catch (error) {
      console.error('Error al exportar categorías:', error)
      toast({
        variant: "destructive",
        title: "Error de exportación",
        description: "No se pudo exportar el reporte de categorías.",
      })
    }
  }

  // Función para generar plantilla de productos
  const downloadProductTemplate = () => {
    try {
      const template = [
        {
          'Nombre': 'Ejemplo Camisa',
          'SKU': 'CAM-001',
          'Descripción': 'Camisa de algodón',
          'Categoría': 'Camisas',
          'Precio': 899.00,
          'Costo': 450.00,
          'Stock': 10,
          'Stock Mínimo': 5,
          'Tallas': 'S, M, L, XL',
          'Colores': 'Blanco, Azul',
          'Activo': 'Sí',
        }
      ]

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(template), 'Plantilla Productos')
      
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      saveAs(data, 'plantilla-productos.xlsx')

      toast({
        title: "Plantilla descargada",
        description: "La plantilla de productos se ha descargado correctamente.",
      })
    } catch (error) {
      console.error('Error al descargar plantilla:', error)
      toast({
        variant: "destructive",
        title: "Error de descarga",
        description: "No se pudo descargar la plantilla.",
      })
    }
  }

  return {
    exportSalesToExcel,
    exportProductsToExcel,
    exportInventoryToExcel,
    exportCategoriesToExcel,
    downloadProductTemplate,
  }
}
