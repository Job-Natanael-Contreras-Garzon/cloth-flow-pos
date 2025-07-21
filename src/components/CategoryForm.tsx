import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  useCreateCategory, 
  useUpdateCategory, 
  Category,
  CreateCategoryData,
  UpdateCategoryData 
} from "@/hooks/useCategories";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100, "El nombre es muy largo"),
  description: z.string().optional(),
});

export type CategoryFormValues = z.infer<typeof formSchema>;

interface CategoryFormProps {
  category?: Category | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CategoryForm({ category, isOpen, onClose }: CategoryFormProps) {
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Resetear el formulario cuando cambie la categoría o se abra/cierre el modal
  useEffect(() => {
    if (isOpen) {
      if (category) {
        // Modo edición: cargar datos de la categoría
        form.reset({
          name: category.name,
          description: category.description || "",
        });
      } else {
        // Modo creación: resetear formulario
        form.reset({
          name: "",
          description: "",
        });
      }
    }
  }, [category, isOpen, form]);

  const onSuccessCallback = () => {
    onClose();
    form.reset();
  };

  const onSubmit = async (data: CategoryFormValues) => {
    const mutationOptions = {
      onSuccess: onSuccessCallback,
    };

    if (category?.id) {
      // Actualizar categoría existente
      const updateData: UpdateCategoryData = {
        id: category.id,
        name: data.name,
        description: data.description || undefined,
      };
      updateCategoryMutation.mutate(updateData, mutationOptions);
    } else {
      // Crear nueva categoría
      const createData: CreateCategoryData = {
        name: data.name,
        description: data.description || undefined,
      };
      createCategoryMutation.mutate(createData, mutationOptions);
    }
  };

  const isLoading = createCategoryMutation.isPending || updateCategoryMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {category ? "Editar Categoría" : "Nueva Categoría"}
          </DialogTitle>
          <DialogDescription>
            {category 
              ? "Modifica los datos de la categoría." 
              : "Completa los datos para crear una nueva categoría."
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Categoría</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ej: Camisas, Pantalones, Accesorios" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción de la categoría..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {category ? "Guardando..." : "Creando..."}
                  </>
                ) : (
                  category ? "Guardar Cambios" : "Crear Categoría"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
