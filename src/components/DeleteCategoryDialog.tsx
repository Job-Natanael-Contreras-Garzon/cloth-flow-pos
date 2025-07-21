import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteCategory, Category } from "@/hooks/useCategories";
import { Loader2, AlertTriangle } from "lucide-react";

interface DeleteCategoryDialogProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteCategoryDialog({ 
  category, 
  isOpen, 
  onClose 
}: DeleteCategoryDialogProps) {
  const deleteCategory = useDeleteCategory();

  const handleDelete = () => {
    if (category) {
      deleteCategory.mutate(category.id, {
        onSuccess: () => {
          onClose();
        }
      });
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            ¿Eliminar Categoría?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              ¿Estás seguro de que deseas eliminar la categoría{" "}
              <span className="font-semibold">"{category?.name}"</span>?
            </p>
            <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
              <strong>Nota:</strong> Solo se pueden eliminar categorías que no tengan productos asociados.
            </p>
            <p className="text-sm text-red-600">
              Esta acción no se puede deshacer.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteCategory.isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteCategory.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteCategory.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              "Eliminar"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
