import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Eye, EyeOff, Store, Mail, UserPlus, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useSimpleAuth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

type AuthMode = 'login' | 'register' | 'forgot';

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, completa todos los campos');
      return;
    }

    setError('');
    setLoading(true);
    
    const result = await signIn(email, password);
    
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Error al iniciar sesión');
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword || !fullName) {
      setError('Por favor, completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "✅ Registro exitoso",
          description: "Revisa tu email para confirmar tu cuenta",
        });
        setMode('login');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFullName('');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Por favor, ingresa tu email');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      toast({
        title: "✅ Email enviado",
        description: "Revisa tu email para restablecer tu contraseña",
      });
      setMode('login');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al enviar email de recuperación');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setError('');
    setEmail(mode === 'login' ? 'admin@gmail.com' : '');
    setPassword(mode === 'login' ? 'admin123' : '');
    setConfirmPassword('');
    setFullName('');
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center space-y-2 mb-8">
          <div className="flex justify-center">
            <div className="h-12 w-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <Store className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-purple-600">Cloth Flow POS</h1>
          <p className="text-gray-600">
            {mode === 'login' && 'Acceso al sistema'}
            {mode === 'register' && 'Crear nueva cuenta'}
            {mode === 'forgot' && 'Recuperar contraseña'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              {mode !== 'login' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => switchMode('login')}
                  className="p-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div>
                <CardTitle>
                  {mode === 'login' && 'Iniciar Sesión'}
                  {mode === 'register' && 'Crear Cuenta'}
                  {mode === 'forgot' && 'Recuperar Contraseña'}
                </CardTitle>
                <CardDescription>
                  {mode === 'login' && 'Ingresa tus credenciales para acceder al sistema'}
                  {mode === 'register' && 'Completa los datos para crear tu cuenta'}
                  {mode === 'forgot' && 'Te enviaremos un email para restablecer tu contraseña'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={
              mode === 'login' ? handleLogin : 
              mode === 'register' ? handleRegister : 
              handleForgotPassword
            } className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {mode === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre Completo</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Tu nombre completo"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                />
              </div>

              {mode !== 'forgot' && (
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {mode === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  'Procesando...'
                ) : (
                  <>
                    {mode === 'login' && 'Iniciar Sesión'}
                    {mode === 'register' && (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Crear Cuenta
                      </>
                    )}
                    {mode === 'forgot' && (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Enviar Email
                      </>
                    )}
                  </>
                )}
              </Button>
            </form>

            {mode === 'login' && (
              <div className="mt-6 space-y-4">
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => switchMode('register')}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Crear nueva cuenta
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full text-sm" 
                    onClick={() => switchMode('forgot')}
                  >
                    ¿Olvidaste tu contraseña?
                  </Button>
                </div>
                
                <div className="mt-4 text-sm text-gray-500 text-center border-t pt-4">
                  <p className="font-medium">Cuenta de prueba:</p>
                  <p>Email: admin@gmail.com</p>
                  <p>Contraseña: admin123</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
