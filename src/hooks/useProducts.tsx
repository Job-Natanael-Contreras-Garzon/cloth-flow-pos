import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface Product {
  id: string
  name: string
  sku: string
  description?: string
  category_id?: string
  price: number
  cost: number
  stock: number
  min_stock: number
  sizes: string[]
  colors: string[]
  image_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
  categories?: {
    id: string
    name: string
    description?: string
  }
}

export interface Category {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            description
          )
        `)
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data as Product[]
    },
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'categories'>) => {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast({
        title: "Producto creado",
        description: "El producto se ha creado correctamente.",
      })
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error al crear el producto",
      })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ id, ...product }: Partial<Product> & { id: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast({
        title: "Producto actualizado",
        description: "El producto se ha actualizado correctamente.",
      })
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error al actualizar el producto",
      })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast({
        title: "Producto eliminado",
        description: "El producto se ha eliminado correctamente.",
      })
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error al eliminar el producto",
      })
    },
  })
}