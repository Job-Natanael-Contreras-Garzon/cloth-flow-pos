import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, Upload } from 'lucide-react';

interface TestResult {
  step: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: unknown;
}

export function ImageUploadTester() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const addResult = (step: string, status: 'pending' | 'success' | 'error', message: string, details?: unknown) => {
    setResults(prev => [...prev, { step, status, message, details }]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const runTest = async () => {
    setIsRunning(true);
    clearResults();

    try {
      // 1. Verificar autenticación
      addResult('Autenticación', 'pending', 'Verificando usuario...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        addResult('Autenticación', 'error', 'Usuario no autenticado', authError);
        return;
      }
      
      addResult('Autenticación', 'success', `Usuario: ${user.email}`, { userId: user.id });

      // 2. Verificar buckets
      addResult('Configuración', 'pending', 'Verificando buckets...');
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        addResult('Configuración', 'error', 'Error al verificar buckets', bucketsError);
        return;
      }

      const imagesBucket = buckets?.find(bucket => bucket.id === 'images');
      if (!imagesBucket) {
        addResult('Configuración', 'error', 'Bucket "images" no encontrado', { buckets });
        return;
      }

      addResult('Configuración', 'success', 'Bucket "images" encontrado', imagesBucket);

      // 3. Crear archivo de prueba
      addResult('Archivo', 'pending', 'Creando archivo de prueba...');
      const testFile = await createTestFile();
      addResult('Archivo', 'success', 'Archivo de prueba creado', {
        name: testFile.name,
        size: `${(testFile.size / 1024).toFixed(2)} KB`,
        type: testFile.type
      });

      // 4. Probar subida
      addResult('Subida', 'pending', 'Subiendo archivo...');
      const fileName = `products/${user.id}/test-${Date.now()}.png`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, testFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        addResult('Subida', 'error', 'Error en la subida', uploadError);
        return;
      }

      addResult('Subida', 'success', 'Archivo subido exitosamente', uploadData);

      // 5. Obtener URL pública
      addResult('URL Pública', 'pending', 'Generando URL pública...');
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      if (!urlData.publicUrl) {
        addResult('URL Pública', 'error', 'No se pudo generar URL pública', urlData);
        return;
      }

      addResult('URL Pública', 'success', 'URL generada', { url: urlData.publicUrl });

      // 6. Probar acceso a la URL
      addResult('Acceso URL', 'pending', 'Probando acceso a la imagen...');
      try {
        const response = await fetch(urlData.publicUrl, { method: 'HEAD' });
        if (response.ok) {
          addResult('Acceso URL', 'success', `URL accesible (${response.status})`, { status: response.status });
        } else {
          addResult('Acceso URL', 'error', `URL no accesible (${response.status})`, { status: response.status });
        }
      } catch (fetchError) {
        addResult('Acceso URL', 'error', 'Error al acceder a la URL', fetchError);
      }

      // 7. Limpiar archivo de prueba
      addResult('Limpieza', 'pending', 'Eliminando archivo de prueba...');
      const { error: deleteError } = await supabase.storage
        .from('images')
        .remove([fileName]);

      if (deleteError) {
        addResult('Limpieza', 'error', 'Error al eliminar archivo', deleteError);
      } else {
        addResult('Limpieza', 'success', 'Archivo eliminado correctamente');
      }

    } catch (error) {
      addResult('Error General', 'error', 'Error inesperado', error);
    } finally {
      setIsRunning(false);
    }
  };

  const createTestFile = (): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext('2d')!;

      // Crear gradiente
      const gradient = ctx.createLinearGradient(0, 0, 200, 200);
      gradient.addColorStop(0, '#3b82f6');
      gradient.addColorStop(1, '#1d4ed8');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 200, 200);
      
      // Añadir texto
      ctx.fillStyle = 'white';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('TEST', 100, 90);
      ctx.fillText('IMAGE', 100, 120);
      
      canvas.toBlob((blob) => {
        const file = new File([blob!], 'test-image.png', { type: 'image/png' });
        resolve(file);
      }, 'image/png');
    });
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Éxito</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'pending':
        return <Badge variant="secondary">Procesando...</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Probador de Subida de Imágenes
          </CardTitle>
          <CardDescription>
            Esta herramienta prueba cada paso del proceso de subida de imágenes para identificar problemas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runTest} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ejecutando Pruebas...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Ejecutar Prueba de Subida
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados de la Prueba</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0 mt-0.5">
                    {getStatusIcon(result.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{result.step}</h4>
                      {getStatusBadge(result.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {result.message}
                    </p>
                    {result.details && (
                      <details className="mt-2">
                        <summary className="text-xs text-muted-foreground cursor-pointer">
                          Ver detalles
                        </summary>
                        <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
