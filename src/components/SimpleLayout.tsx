import { SimpleNavbar } from './SimpleNavbar';

interface SimpleLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function SimpleLayout({ children, title }: SimpleLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleNavbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {title && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
