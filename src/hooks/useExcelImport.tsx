import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import * as XLSX from 'xlsx'
import { useToast } from '@/hooks/use-toast'
import { useCategories } from '@/hooks/useCategories'

interface ImportProductRow {
  Nombre: string
  SKU: string
  Descripción?: string
  Categoría?: string
  Precio: number
  Costo: number
  Stock: number
  'Stock Mínimo': number
  Tallas?: string
  Colores?: string
  Activo: string
}

export function useExcelImport() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { data: categories = [] } = useCategories()

  const importProductsMutation = useMutation({
    mutationFn: async (file: File) => {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData: ImportProductRow[] = XLSX.utils.sheet_to_json(worksheet)

      if (!jsonData || jsonData.length === 0) {
        throw new Error('El archivo está vacío o no tiene el formato correcto')
      }

      // Validar estructura del archivo
      const requiredColumns = ['Nombre', 'SKU', 'Precio', 'Costo', 'Stock', 'Stock Mínimo']
      const firstRow = jsonData[0]
      const missingColumns = requiredColumns.filter(col => !(col in firstRow))
      
      if (missingColumns.length > 0) {
        throw new Error(`Faltan las siguientes columnas requeridas: ${missingColumns.join(', ')}`)
      }

      // Procesar cada fila
      const results = {
        created: 0,
        updated: 0,
        errors: [] as string[]
      }

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i]
        const rowNumber = i + 2 // +2 porque Excel empieza en 1 y la primera fila son headers

        try {
          // Validar datos requeridos
          if (!row.Nombre || !row.SKU) {
            results.errors.push(`Fila ${rowNumber}: Nombre y SKU son requeridos`)
            continue
          }

          if (typeof row.Precio !== 'number' || row.Precio < 0) {
            results.errors.push(`Fila ${rowNumber}: Precio debe ser un número mayor o igual a 0`)
            continue
          }

          if (typeof row.Costo !== 'number' || row.Costo < 0) {
            results.errors.push(`Fila ${rowNumber}: Costo debe ser un número mayor o igual a 0`)
            continue
          }

          if (typeof row.Stock !== 'number' || row.Stock < 0) {
            results.errors.push(`Fila ${rowNumber}: Stock debe ser un número mayor o igual a 0`)
            continue
          }

          // Buscar categoría si se especifica
          let categoryId: string | undefined = undefined
          if (row.Categoría) {
            const category = categories.find(cat => 
              cat.name.toLowerCase() === row.Categoría?.toLowerCase()
            )
            if (category) {
              categoryId = category.id
            } else {
              results.errors.push(`Fila ${rowNumber}: Categoría "${row.Categoría}" no encontrada`)
              continue
            }
          }

          // Procesar tallas y colores
          const sizes = row.Tallas ? 
            row.Tallas.split(',').map(s => s.trim()).filter(Boolean) : []
          const colors = row.Colores ? 
            row.Colores.split(',').map(c => c.trim()).filter(Boolean) : []

          // Determinar si el producto está activo
          const isActive = row.Activo?.toLowerCase() === 'sí' || 
                          row.Activo?.toLowerCase() === 'si' || 
                          row.Activo?.toLowerCase() === 'yes' ||
                          row.Activo?.toLowerCase() === 'true' ||
                          row.Activo === '1'

          const productData = {
            name: row.Nombre,
            sku: row.SKU,
            description: row.Descripción || undefined,
            category_id: categoryId,
            price: row.Precio,
            cost: row.Costo,
            stock: row.Stock,
            min_stock: row['Stock Mínimo'] || 0,
            sizes,
            colors,
            is_active: isActive,
          }

          // Verificar si el producto ya existe
          const { data: existingProduct } = await supabase
            .from('products')
            .select('id')
            .eq('sku', row.SKU)
            .single()

          if (existingProduct) {
            // Actualizar producto existente
            const { error } = await supabase
              .from('products')
              .update({
                ...productData,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingProduct.id)

            if (error) {
              results.errors.push(`Fila ${rowNumber}: Error al actualizar - ${error.message}`)
            } else {
              results.updated++
            }
          } else {
            // Crear nuevo producto
            const { error } = await supabase
              .from('products')
              .insert([productData])

            if (error) {
              results.errors.push(`Fila ${rowNumber}: Error al crear - ${error.message}`)
            } else {
              results.created++
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
          results.errors.push(`Fila ${rowNumber}: ${errorMessage}`)
        }
      }

      return results
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['products-report'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-report'] })

      let message = `Importación completada. `
      if (results.created > 0) message += `${results.created} productos creados. `
      if (results.updated > 0) message += `${results.updated} productos actualizados. `
      if (results.errors.length > 0) message += `${results.errors.length} errores encontrados.`

      toast({
        title: "Importación completada",
        description: message,
        variant: results.errors.length > 0 ? "destructive" : "default"
      })

      // Mostrar errores si los hay
      if (results.errors.length > 0) {
        console.error('Errores de importación:', results.errors)
      }
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error de importación",
        description: error.message || "No se pudo importar el archivo",
      })
    },
  })

  const importProducts = (file: File) => {
    // Validar tipo de archivo
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Tipo de archivo no válido",
        description: "Solo se permiten archivos Excel (.xlsx, .xls)",
      })
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Archivo muy grande",
        description: "El archivo no puede superar los 5MB",
      })
      return
    }

    importProductsMutation.mutate(file)
  }

  return {
    importProducts,
    isImporting: importProductsMutation.isPending,
  }
}
