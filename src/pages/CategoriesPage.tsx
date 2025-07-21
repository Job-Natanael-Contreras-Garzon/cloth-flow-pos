import { SimpleLayout } from "@/components/SimpleLayout";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  FolderOpen, 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  Package,
  AlertCircle
} from "lucide-react";
import { useCategories, useCategoriesStats, Category } from "@/hooks/useCategories";
import { CategoryForm } from "@/components/CategoryForm";
import { DeleteCategoryDialog } from "@/components/DeleteCategoryDialog";

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  const { data: categories = [], isLoading, isError } = useCategories();
  const { data: stats } = useCategoriesStats();

  const filteredCategories = categories.filter((category) =>
    category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setIsFormOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedCategory(null);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedCategory(null);
  };

  if (isLoading) {
    return (
      <SimpleLayout title="Categorías">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando categorías...</p>
          </div>
        </div>
      </SimpleLayout>
    );
  }

  if (isError) {
    return (
      <SimpleLayout title="Categorías">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium">Error al cargar categorías</p>
            <p className="text-gray-600 mt-2">Por favor, inténtalo de nuevo más tarde.</p>
          </div>
        </div>
      </SimpleLayout>
    );
  }

  return (
    <SimpleLayout title="Categorías">
      <div className="space-y-6">
        {/* KPIs de categorías */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FolderOpen className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Categorías</p>
                  <p className="text-2xl font-bold">{stats?.totalCategories || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Categorías con Productos</p>
                  <p className="text-2xl font-bold">{stats?.categoriesWithProducts || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FolderOpen className="h-8 w-8 text-gray-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Categorías Vacías</p>
                  <p className="text-2xl font-bold">{stats?.emptyCategories || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de categorías */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Lista de Categorías ({filteredCategories.length})
              </CardTitle>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar categorías..."
                    className="pl-9 w-full sm:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button onClick={handleCreateCategory} className="whitespace-nowrap">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Categoría
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No se encontraron categorías' : 'No hay categorías registradas'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm 
                    ? 'Intenta con un término de búsqueda diferente.' 
                    : 'Comienza creando tu primera categoría para organizar tus productos.'
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={handleCreateCategory}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primera Categoría
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.map((category) => (
                  <Card key={category.id} className="hover:shadow-md transition-all duration-200 border-l-4 border-l-purple-500">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg truncate">{category.name}</h3>
                            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                              Activa
                            </Badge>
                          </div>
                          {category.description && (
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {category.description}
                            </p>
                          )}
                          <div className="text-sm text-gray-500">
                            <p>Creada: {new Date(category.created_at).toLocaleDateString('es-ES')}</p>
                            {category.updated_at !== category.created_at && (
                              <p>Actualizada: {new Date(category.updated_at).toLocaleDateString('es-ES')}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1 ml-4 flex-shrink-0">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleEditCategory(category)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDeleteCategory(category)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Formulario de categoría */}
      <CategoryForm
        category={selectedCategory}
        isOpen={isFormOpen}
        onClose={closeForm}
      />

      {/* Dialog de confirmación de eliminación */}
      <DeleteCategoryDialog
        category={selectedCategory}
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
      />
    </SimpleLayout>
  );
}
