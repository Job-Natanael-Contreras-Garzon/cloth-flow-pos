import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface Sale {
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
  updated_at: string
  sale_items?: SaleItem[]
}

export interface SaleItem {
  id: string
  sale_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  size?: string
  color?: string
  created_at: string
  products?: {
    id: string
    name: string
    sku: string
  }
}

export interface CreateSaleData {
  customer_name?: string
  customer_email?: string
  subtotal: number
  tax: number
  total: number
  payment_method: string
  items: {
    product_id: string
    quantity: number
    unit_price: number
    total_price: number
    size?: string
    color?: string
  }[]
}

export function useSales(limit?: number) {
  return useQuery({
    queryKey: ['sales', limit],
    queryFn: async () => {
      let query = supabase
        .from('sales')
        .select(`
          *,
          sale_items (
            *,
            products (
              id,
              name,
              sku
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) throw error
      return data as Sale[]
    },
  })
}

export function useCreateSale() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (saleData: CreateSaleData) => {
      // Generate sale number
      const { data: saleNumber, error: numberError } = await supabase
        .rpc('generate_sale_number')

      if (numberError) throw numberError

      // Create sale
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert([{
          sale_number: saleNumber,
          customer_name: saleData.customer_name,
          customer_email: saleData.customer_email,
          subtotal: saleData.subtotal,
          tax: saleData.tax,
          total: saleData.total,
          payment_method: saleData.payment_method,
        }])
        .select()
        .single()

      if (saleError) throw saleError

      // Create sale items
      const saleItems = saleData.items.map(item => ({
        ...item,
        sale_id: sale.id,
      }))

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems)

      if (itemsError) throw itemsError

      // Update product stock
      for (const item of saleData.items) {
        const { error: stockError } = await supabase
          .rpc('update_product_stock', {
            product_id: item.product_id,
            quantity_sold: item.quantity
          })

        if (stockError) {
          console.error('Error updating stock:', stockError)
          // Don't throw here to avoid rolling back the sale
        }
      }

      return sale
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast({
        title: "Venta procesada",
        description: "La venta se ha procesado correctamente.",
      })
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error al procesar la venta",
      })
    },
  })
}

export function useDailySalesStats() {
  return useQuery({
    queryKey: ['daily-sales-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('sales')
        .select('total, created_at')
        .gte('created_at', today)
        .eq('status', 'completed')

      if (error) throw error

      const totalSales = data.reduce((sum, sale) => sum + Number(sale.total), 0)
      const salesCount = data.length

      return {
        total: totalSales,
        count: salesCount,
      }
    },
  })
}