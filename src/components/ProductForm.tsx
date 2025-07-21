import React, { useCallback, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateProduct, useUpdateProduct, Product } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useDispatch, useSelector } from 'react-redux';
import { closeFormModal } from '@/slices/inventoryUISlice';
import { useToast } from '@/hooks/use-toast';
import { RootState } from '@/store/store';
import { useAuth } from '@/hooks/useSimpleAuth';

// 🚫 CONFIGURACIÓN: Deshabilitar subida de imágenes
const IMAGE_UPLOAD_ENABLED = false;

// Helper para transformar string a array
const stringToArray = z.preprocess((val) => {
  if (typeof val === 'string') {
    return val.split(',').map(item => item.trim()).filter(Boolean);
  }
  return val;
}, z.array(z.string()).default([]));

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  sku: z.string().min(1, "El SKU es requerido"),
  description: z.string().optional(),
  category_id: z.string().optional(),
  price: z.number().min(0, "El precio debe ser mayor a 0"),
  cost: z.number().min(0, "El costo debe ser mayor a 0"),
  stock: z.number().int().min(0, "El stock debe ser mayor o igual a 0"),
  min_stock: z.number().int().min(0, "El stock mínimo debe ser mayor o igual a 0"),
  sizes: z.string().optional(),
  colors: z.string().optional(),
  image_url: z.string().optional(),
  is_active: z.boolean().default(true),
});

export type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  product?: Product | null;
  onClose?: () => void;
}

export function ProductForm({ product, onClose }: ProductFormProps) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const { data: categories = [] } = useCategories();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image_url || null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: product ? {
      ...product,
      category_id: product.category_id || undefined,
      sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : '',
      colors: Array.isArray(product.colors) ? product.colors.join(', ') : '',
      image_url: product.image_url || undefined,
    } : {
      name: "",
      sku: "",
      description: "",
      price: 0,
      cost: 0,
      stock: 0,
      min_stock: 0,
      is_active: true,
      sizes: '',
      colors: '',
    },
  });

  useEffect(() => {
    if (product) {
      // Si hay un producto, cargar sus datos
      const defaultValues = {
        ...product,
        category_id: product.category_id || undefined,
        sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : '',
        colors: Array.isArray(product.colors) ? product.colors.join(', ') : '',
        image_url: product.image_url || undefined,
      };
      form.reset(defaultValues);
      setImagePreview(product.image_url || null);
    } else {
      // Si no hay producto, resetear el formulario
      form.reset({
        name: '',
        sku: '',
        description: '',
        category_id: undefined,
        price: 0,
        cost: 0,
        stock: 0,
        min_stock: 0,
        sizes: '',
        colors: '',
        image_url: undefined,
        is_active: true
      });
      setImagePreview(null);
      setImageFile(null);
    }
  }, [product, form]);

  const uploadImage = async (file: File): Promise<string | null> => {
    console.log('🔍 Iniciando uploadImage con:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      isAuthenticated,
      hasUser: !!user
    });

    if (!isAuthenticated || !user) {
      console.error('❌ Error de autenticación:', { isAuthenticated, user: !!user });
      toast({ 
        title: "Error de autenticación", 
        description: "Debes iniciar sesión para subir una imagen.", 
        variant: "destructive" 
      });
      return null;
    }

    setIsUploading(true);
    try {
      // Validar el archivo
      console.log('🔍 Validando archivo...');
      if (file.size > 5 * 1024 * 1024) { // 5MB límite
        const errorMsg = 'El archivo es demasiado grande. Máximo 5MB.';
        console.error('❌ Error de tamaño:', errorMsg);
        throw new Error(errorMsg);
      }
      console.log('✅ Validación de tamaño: OK');

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        const errorMsg = 'Tipo de archivo no válido. Solo se permiten: JPG, PNG, WebP';
        console.error('❌ Error de tipo:', errorMsg);
        throw new Error(errorMsg);
      }
      console.log('✅ Validación de tipo: OK');

      // Generar nombre único del archivo (como en el ejemplo)
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `products/${fileName}`;
      const bucketName = 'images';

      console.log('📤 Configuración de subida:', { 
        fileName: filePath, 
        bucketName, 
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        fileType: file.type,
        userId: user.id
      });

      // Subir el archivo directamente (simplificado como en el ejemplo)
      console.log('� Iniciando subida del archivo...');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (uploadError) {
        console.error('❌ Error al subir archivo:', uploadError);
        console.error('🔍 Detalles completos del error:', {
          message: uploadError.message,
          details: uploadError
        });
        
        // Crear el bucket si no existe (fallback)
        if (uploadError.message.includes('not found') || uploadError.message.includes('does not exist')) {
          console.log('🏗️ Intentando crear bucket automáticamente...');
          
          // Intentar con service role para crear bucket
          const serviceClient = supabase;
          const { error: createError } = await serviceClient.storage.createBucket(bucketName, {
            public: true,
            allowedMimeTypes: ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'],
            fileSizeLimit: 5242880 // 5MB
          });
          
          if (!createError) {
            console.log('✅ Bucket creado, reintentando subida...');
            // Reintentar la subida
            const { data: retryData, error: retryError } = await supabase.storage
              .from(bucketName)
              .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
                contentType: file.type
              });
            
            if (retryError) {
              throw new Error(`Error en reintento: ${retryError.message}`);
            }
            
            console.log('✅ Archivo subido en reintento:', retryData);
          } else {
            console.error('❌ No se pudo crear bucket:', createError);
            throw new Error('El bucket de imágenes no existe. Por favor, créalo manualmente en el Dashboard de Supabase.');
          }
        } else {
          // Manejar otros errores específicos
          if (uploadError.message.includes('Duplicate')) {
            throw new Error('Ya existe un archivo con este nombre. Inténtalo de nuevo.');
          } else if (uploadError.message.includes('Policy') || uploadError.message.includes('row-level security')) {
            throw new Error('Sin permisos para subir imágenes. Verifica las políticas de storage en Supabase.');
          } else {
            throw new Error(`Error de subida: ${uploadError.message}`);
          }
        }
      }

      console.log('✅ Archivo subido exitosamente:', uploadData);

      // Obtener la URL pública (método actualizado)
      console.log('🔗 Obteniendo URL pública...');
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        const errorMsg = 'No se pudo obtener la URL pública de la imagen';
        console.error('❌ Error de URL:', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('✅ URL pública generada:', urlData.publicUrl);

      toast({ 
        title: "✅ Imagen subida", 
        description: "La imagen se ha subido correctamente." 
      });
      
      return urlData.publicUrl;

    } catch (error) {
      console.error("💥 Error detallado al subir la imagen:", error);
      
      let errorMessage = 'Error desconocido al subir la imagen';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        variant: "destructive",
        title: "Error al subir imagen",
        description: errorMessage,
      });
      
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // 🚫 FUNCIONALIDAD DESHABILITADA: Solo permite preview local
    if (!IMAGE_UPLOAD_ENABLED) {
      console.log('⚠️ Dropzone deshabilitado - solo preview local');
      return;
    }
    
    const file = acceptedFiles[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    disabled: !IMAGE_UPLOAD_ENABLED // 🚫 Deshabilitar dropzone
  });

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    form.setValue('image_url', '');
  };

  const onSuccessCallback = (data: Product) => {
    console.log('✅ Producto guardado exitosamente:', data);
    
    const successMessage = product 
      ? "Producto actualizado correctamente" 
      : "Producto creado correctamente";
    
    toast({
      title: product ? "Producto actualizado" : "Producto creado",
      description: successMessage,
    });

    // Limpiar el formulario después del éxito
    if (onClose) {
      onClose();
    } else {
      dispatch(closeFormModal());
    }
  };

  const onErrorCallback = (error: Error) => {
    console.error('❌ Error al guardar producto:', error);
    console.error('🔍 Detalles del error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    let errorMessage = error.message || 'Error desconocido';
    
    // Manejar errores específicos
    if (error.message.includes('duplicate') || error.message.includes('unique')) {
      errorMessage = 'Ya existe un producto con este SKU. Por favor, usa un SKU diferente.';
    } else if (error.message.includes('foreign key')) {
      errorMessage = 'La categoría seleccionada no es válida. Por favor, selecciona otra categoría.';
    } else if (error.message.includes('check constraint')) {
      errorMessage = 'Los valores ingresados no son válidos. Verifica que los precios y cantidades sean positivos.';
    }
    
    toast({
      variant: "destructive",
      title: `Error al ${product ? 'actualizar' : 'crear'} producto`,
      description: errorMessage,
    });
  };

  const onSubmit = async (data: ProductFormValues) => {
    console.log('🚀 Iniciando envío del formulario...');
    console.log('📝 Datos del formulario:', data);
    console.log('🖼️ Archivo de imagen:', imageFile);
    console.log('🔗 Imagen actual:', product?.image_url);
    
    setIsUploading(true);
    try {
      let finalImageUrl = product?.image_url || null;

      // Solo subir imagen si hay un archivo nuevo
      if (imageFile) {
        console.log('📤 Intentando subir nueva imagen...');
        console.log('🔍 Detalles del archivo a subir:', {
          name: imageFile.name,
          size: imageFile.size,
          type: imageFile.type,
          lastModified: new Date(imageFile.lastModified).toISOString()
        });
        
        const uploadedUrl = await uploadImage(imageFile);
        console.log('🔄 Resultado de uploadImage:', uploadedUrl);
        
        // 🚫 CAMBIO: No fallar si uploadImage retorna null
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
          console.log('✅ Imagen subida exitosamente:', finalImageUrl);
        } else {
          console.log('⚠️ Subida de imagen omitida (funcionalidad deshabilitada)');
          // Mantener la imagen actual o null, sin mostrar error
        }
      } else {
        console.log('ℹ️ No hay imagen nueva para subir, usando imagen actual:', finalImageUrl);
      }

      // Preparar datos del producto
      const productData = {
        ...data,
        image_url: finalImageUrl,
        sizes: data.sizes ? data.sizes.split(',').map(s => s.trim()).filter(Boolean) : [],
        colors: data.colors ? data.colors.split(',').map(c => c.trim()).filter(Boolean) : [],
      };

      console.log('💾 Datos finales del producto:', productData);

      const mutationOptions = {
        onSuccess: onSuccessCallback,
        onError: onErrorCallback,
      };

      if (product?.id) {
        console.log('🔄 Actualizando producto existente...');
        updateProductMutation.mutate({ ...productData, id: product.id }, mutationOptions);
      } else {
        console.log('➕ Creando nuevo producto...');
        createProductMutation.mutate(productData as Omit<Product, 'id' | 'created_at' | 'updated_at' | 'categories'>, mutationOptions);
      }
    } catch (error) {
        console.error('💥 Error inesperado en onSubmit:', error);
        toast({
          variant: "destructive",
          title: "Error Inesperado",
          description: error instanceof Error ? error.message : "Ocurrió un error al procesar el formulario.",
        });
    } finally {
      setIsUploading(false);
    }
  };

  const isLoading = createProductMutation.isPending || updateProductMutation.isPending || isUploading;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Izquierda y Central: Campos de texto */}
          <div className="lg:col-span-2 space-y-6">
            {/* Fila 1: Nombre y SKU */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex flex-col h-full">
                    <FormLabel>Nombre del Producto</FormLabel>
                    <FormControl className="flex-1">
                      <Input placeholder="Ej: Camisa de Lino" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem className="flex flex-col h-full">
                    <FormLabel>SKU</FormLabel>
                    <FormControl className="flex-1">
                      <Input placeholder="Ej: CAM-LIN-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Fila 2: Descripción y Categoría */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="flex flex-col h-full">
                    <FormLabel>Descripción</FormLabel>
                    <FormControl className="flex-1">
                      <Textarea
                        placeholder="Descripción detallada del producto"
                        className="resize-none min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col h-full">
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl className="flex-1">
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Fila 3: Precios y Stock */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem className="flex flex-col h-full">
                    <FormLabel>Precio</FormLabel>
                    <FormControl className="flex-1">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input type="number" step="0.01" placeholder="0.00" className="pl-8" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem className="flex flex-col h-full">
                    <FormLabel>Costo</FormLabel>
                    <FormControl className="flex-1">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input type="number" step="0.01" placeholder="0.00" className="pl-8" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem className="flex flex-col h-full">
                    <FormLabel>Stock Actual</FormLabel>
                    <FormControl className="flex-1">
                      <Input type="number" placeholder="0" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="min_stock"
                render={({ field }) => (
                  <FormItem className="flex flex-col h-full">
                    <FormLabel>Stock Mínimo</FormLabel>
                    <FormControl className="flex-1">
                      <Input type="number" placeholder="0" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Fila 4: Tallas y Colores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="sizes"
                render={({ field }) => (
                  <FormItem className="flex flex-col h-full">
                    <FormLabel>Tallas</FormLabel>
                    <FormControl className="flex-1">
                      <Input placeholder="S, M, L, XL" {...field} />
                    </FormControl>
                    <FormDescription>Separadas por comas.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="colors"
                render={({ field }) => (
                  <FormItem className="flex flex-col h-full">
                    <FormLabel>Colores</FormLabel>
                    <FormControl className="flex-1">
                      <Input placeholder="Rojo, Verde, Azul" {...field} />
                    </FormControl>
                    <FormDescription>Separadas por comas.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Columna Derecha: Imagen y Estado */}
          <div className="lg:col-span-1 space-y-6 flex flex-col h-full">
            <div className="flex-1">
              <FormLabel className="text-sm font-medium">Imagen del Producto</FormLabel>
              <div {...getRootProps()} className="mt-2 w-full h-64 border-2 border-dashed rounded-lg flex items-center justify-center text-center relative group bg-muted/20 opacity-50 cursor-not-allowed">
                <input {...getInputProps()} disabled />
                {imagePreview ? (
                  <div className="relative w-full h-full">
                    <img src={imagePreview} alt="Vista previa" className="w-full h-full object-cover rounded-md" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                      <Button type="button" variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); removeImage(); }}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2 h-full p-4">
                    <div className="p-3 bg-muted rounded-full">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium">Subida de imágenes deshabilitada</p>
                      <p className="text-xs text-muted-foreground">Temporalmente no disponible</p>
                    </div>
                  </div>
                )}
              </div>
              <FormDescription className="text-center mt-2 text-xs">
                La funcionalidad de imagen está temporalmente deshabilitada.
              </FormDescription>
            </div>
            
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-background">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-medium">Producto Activo</FormLabel>
                    <FormDescription className="text-xs">Disponible para la venta.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="flex justify-end pt-6 border-t">
          <Button type="submit" disabled={isLoading} className="min-w-[150px]">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {product ? "Guardando..." : "Creando..."}
              </>
            ) : (
              product ? "Guardar Cambios" : "Crear Producto"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
