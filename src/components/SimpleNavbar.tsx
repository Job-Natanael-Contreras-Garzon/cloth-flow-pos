import { Button } from '@/components/ui/button';
import { LogOut, Store } from 'lucide-react';
import { useAuth } from '@/hooks/useSimpleAuth';
import { Link, useLocation } from 'react-router-dom';

export function SimpleNavbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/pos', label: 'POS' },
    { path: '/inventory', label: 'Inventario' },
    { path: '/sales', label: 'Ventas' },
    { path: '/categories', label: 'Categorías' },
    { path: '/reports', label: 'Reportes' },
    { path: '/alerts', label: 'Alertas' },
    { path: '/purchases', label: 'Compras' },
    { path: '/settings', label: 'Configuración' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Store className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-purple-600">Cloth Flow POS</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-purple-100 text-purple-700 shadow-sm'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {user?.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
