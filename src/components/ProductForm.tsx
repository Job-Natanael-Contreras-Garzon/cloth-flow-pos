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
import { useCreateProduct, useUpdateProduct, useCategories, Product } from "@/hooks/useProducts";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDispatch, useSelector } from 'react-redux';
import { closeFormModal } from '@/slices/inventoryUISlice';
import { useToast } from '@/hooks/use-toast';
import { RootState } from '@/store/store';

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
}

export function ProductForm({ product }: ProductFormProps) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
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
      const defaultValues = {
        ...product,
        category_id: product.category_id || undefined,
        sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : '',
        colors: Array.isArray(product.colors) ? product.colors.join(', ') : '',
        image_url: product.image_url || undefined,
      };
      form.reset(defaultValues);
      setImagePreview(product.image_url || null);
    }
  }, [product, form]);

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = fileName; // Simplificar la ruta - sin subcarpeta
      const bucketName = 'images';

      console.log('📦 Intentando subir imagen...');
      console.log('📝 Detalles:');
      console.log('  - Bucket:', bucketName);
      console.log('  - Archivo:', file.name);
      console.log('  - Tamaño:', file.size, 'bytes');
      console.log('  - Tipo:', file.type);
      console.log('  - Ruta final:', filePath);
      
      // Verificar autenticación usando el estado de Redux
      if (!isAuthenticated || !user) {
        console.warn('⚠️ Usuario no autenticado en Redux. Continuando sin imagen.');
        console.log('💡 Para subir imágenes, asegúrate de estar autenticado');
        return null;
      }
      
      console.log('✅ Usuario autenticado detectado');
      console.log('👤 Usuario:', user.email || 'Usuario autenticado');
      console.log('🔑 ID de usuario:', user.id);

      // Intentar subir la imagen con configuración mínima
      console.log('📤 Iniciando subida...');
      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          upsert: true
        });

      if (uploadError) {
        console.error('❌ Error detallado de subida:', {
          message: uploadError.message,
          error: uploadError
        });
        return null;
      }

      if (!data) {
        console.error('❌ No se recibió data de la subida');
        return null;
      }

      console.log('✅ Imagen subida exitosamente:', data);
      
      // Obtener la URL pública
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      console.log(`🔗 URL pública generada: ${publicUrl}`);
      return publicUrl;
      
    } catch (error) {
      console.error('💥 Error inesperado al subir imagen:', error);
      return null;
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
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
    maxFiles: 1
  });

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    form.setValue('image_url', '');
  };

  const onSubmit = async (data: ProductFormValues) => {
    console.log('🚀 Iniciando onSubmit con data:', data);
    console.log('📁 imageFile:', imageFile);
    setIsUploading(true);
    
    try {
      let imageUrl = data.image_url;
      let imageUploadWarning = false;
      
      if (imageFile) {
        console.log('📤 Subiendo imagen...');
        const uploadResult = await uploadImage(imageFile);
        console.log('📤 Resultado de subida:', uploadResult);
        
        if (uploadResult) {
          imageUrl = uploadResult;
          console.log('✅ Imagen subida exitosamente. URL:', imageUrl);
        } else {
          imageUploadWarning = true;
          imageUrl = null;
          console.log('❌ Fallo en subida de imagen');
        }
      } else {
        console.log('📷 No hay imagen para subir');
      }

      // Transformar strings de tallas y colores a arrays
      const sizesArray = data.sizes ? data.sizes.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];
      const colorsArray = data.colors ? data.colors.split(',').map(c => c.trim()).filter(c => c.length > 0) : [];

      const submissionData = {
        ...data,
        category_id: data.category_id || null,
        image_url: imageUrl,
        sizes: sizesArray,
        colors: colorsArray,
      };
      
      console.log('💾 Datos finales para enviar:', submissionData);
      console.log('🖼️ URL de imagen final:', submissionData.image_url);

      const onSuccessCallback = (result: any) => {
        console.log('✅ Producto guardado exitosamente:', result);
        dispatch(closeFormModal());
        form.reset();
        setImageFile(null);
        setImagePreview(null);
        
        let successMessage = product 
          ? "El producto se ha actualizado correctamente." 
          : "El producto se ha creado correctamente.";
        
        if (imageUploadWarning) {
          successMessage += " (La imagen no se pudo subir, pero el producto se guardó sin imagen)";
        } else if (imageUrl) {
          successMessage += " La imagen se guardó correctamente.";
        }
        
        toast({
          title: product ? "Producto actualizado" : "Producto creado",
          description: successMessage,
        });
      };

      const onErrorCallback = (error: any) => {
        console.error('❌ Error al guardar producto:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || `Error al ${product ? 'actualizar' : 'crear'} el producto`,
        });
      };

      if (product) {
        console.log('🔄 Actualizando producto existente...');
        updateProductMutation.mutate(
          { ...submissionData, id: product.id }, 
          { 
            onSuccess: onSuccessCallback,
            onError: onErrorCallback
          }
        );
      } else {
        console.log('🆕 Creando nuevo producto...');
        createProductMutation.mutate(
          submissionData as Omit<Product, 'id' | 'created_at' | 'updated_at' | 'categories'>, 
          { 
            onSuccess: onSuccessCallback,
            onError: onErrorCallback
          }
        );
      }
    } catch (error) {
      console.error('💥 Error inesperado en onSubmit:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Error inesperado",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const isLoading = createProductMutation.isPending || updateProductMutation.isPending || isUploading;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Izquierda y Central: Campos de texto */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Producto</FormLabel>
                    <FormControl>
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
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: CAM-LIN-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descripción detallada del producto"
                        className="resize-none h-full"
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
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
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
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input type="number" placeholder="0.00" className="pl-8" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
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
                  <FormItem>
                    <FormLabel>Costo</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input type="number" placeholder="0.00" className="pl-8" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
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
                  <FormItem>
                    <FormLabel>Stock Actual</FormLabel>
                    <FormControl>
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
                  <FormItem>
                    <FormLabel>Stock Mínimo</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="sizes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tallas</FormLabel>
                    <FormControl>
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
                  <FormItem>
                    <FormLabel>Colores</FormLabel>
                    <FormControl>
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
          <div className="lg:col-span-1 space-y-6">
            <div>
              <FormLabel>Imagen del Producto</FormLabel>
              <div {...getRootProps()} className="mt-2 w-full h-64 border-2 border-dashed rounded-lg flex items-center justify-center text-center cursor-pointer hover:border-primary transition-colors relative group">
                <input {...getInputProps()} />
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
                  <div className="flex flex-col items-center justify-center space-y-2 h-full">
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                      {isDragActive ? <Upload className="h-6 w-6 text-primary" /> : <ImageIcon className="h-6 w-6 text-gray-400" />}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {isDragActive ? <p>Suelta la imagen aquí</p> : <><p className="font-medium">Arrastra una imagen o haz clic</p><p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, WEBP hasta 10MB</p></>}
                    </div>
                  </div>
                )}
              </div>
              <FormDescription className="text-center mt-2">
                La imagen se actualizará al guardar el producto.
              </FormDescription>
            </div>
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Producto Activo</FormLabel>
                    <FormDescription>Disponible para la venta.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="flex justify-end mt-8">
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
