import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface Category {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface CreateCategoryData {
  name: string
  description?: string
}

export interface UpdateCategoryData {
  id: string
  name: string
  description?: string
}

// Hook para obtener todas las categorías
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        console.error('Error al cargar categorías:', error)
        throw error
      }

      return data as Category[]
    },
  })
}

// Hook para obtener una categoría por ID
export function useCategory(id: string) {
  return useQuery({
    queryKey: ['category', id],
    queryFn: async () => {
      if (!id) return null
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error al cargar categoría:', error)
        throw error
      }

      return data as Category
    },
    enabled: !!id,
  })
}

// Hook para crear una nueva categoría
export function useCreateCategory() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (categoryData: CreateCategoryData) => {
      const { data, error } = await supabase
        .from('categories')
        .insert([categoryData])
        .select()
        .single()

      if (error) {
        console.error('Error al crear categoría:', error)
        throw error
      }
      
      return data as Category
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast({
        title: "Categoría creada",
        description: `La categoría "${data.name}" se ha creado correctamente.`,
      })
    },
    onError: (error: Error) => {
      console.error('Error en useCreateCategory:', error)
      
      let errorMessage = 'Error al crear la categoría'
      
      if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
        errorMessage = 'Ya existe una categoría con este nombre'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      })
    },
  })
}

// Hook para actualizar una categoría
export function useUpdateCategory() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (categoryData: UpdateCategoryData) => {
      const { id, ...updateData } = categoryData
      
      const { data, error } = await supabase
        .from('categories')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error al actualizar categoría:', error)
        throw error
      }
      
      return data as Category
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['category', data.id] })
      toast({
        title: "Categoría actualizada",
        description: `La categoría "${data.name}" se ha actualizado correctamente.`,
      })
    },
    onError: (error: Error) => {
      console.error('Error en useUpdateCategory:', error)
      
      let errorMessage = 'Error al actualizar la categoría'
      
      if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
        errorMessage = 'Ya existe una categoría con este nombre'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      })
    },
  })
}

// Hook para eliminar una categoría
export function useDeleteCategory() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (categoryId: string) => {
      // Primero verificar si hay productos asociados
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name')
        .eq('category_id', categoryId)
        .limit(1)

      if (productsError) {
        console.error('Error al verificar productos:', productsError)
        throw new Error('Error al verificar productos asociados')
      }

      if (products && products.length > 0) {
        throw new Error('No se puede eliminar la categoría porque tiene productos asociados')
      }

      // Si no hay productos, proceder con la eliminación
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)

      if (error) {
        console.error('Error al eliminar categoría:', error)
        throw error
      }
      
      return categoryId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast({
        title: "Categoría eliminada",
        description: "La categoría se ha eliminado correctamente.",
      })
    },
    onError: (error: Error) => {
      console.error('Error en useDeleteCategory:', error)
      
      let errorMessage = 'Error al eliminar la categoría'
      
      if (error.message?.includes('productos asociados')) {
        errorMessage = error.message
      } else if (error.message?.includes('foreign key')) {
        errorMessage = 'No se puede eliminar la categoría porque tiene productos asociados'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      })
    },
  })
}

// Hook para obtener estadísticas de categorías
export function useCategoriesStats() {
  return useQuery({
    queryKey: ['categories-stats'],
    queryFn: async () => {
      // Obtener categorías con conteo de productos
      const { data: categoriesWithProducts, error } = await supabase
        .from('categories')
        .select(`
          id,
          name,
          description,
          created_at,
          products:products(count)
        `)
        .order('name', { ascending: true })

      if (error) {
        console.error('Error al cargar estadísticas:', error)
        throw error
      }

      const totalCategories = categoriesWithProducts?.length || 0
      const categoriesWithProductsCount = categoriesWithProducts?.filter(
        cat => cat.products && cat.products[0]?.count > 0
      ).length || 0
      const emptyCategoriesCount = totalCategories - categoriesWithProductsCount

      return {
        totalCategories,
        categoriesWithProducts: categoriesWithProductsCount,
        emptyCategories: emptyCategoriesCount,
        categories: categoriesWithProducts || []
      }
    },
  })
}
