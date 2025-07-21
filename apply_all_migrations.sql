-- INSTRUCCIONES PARA APLICAR LAS MIGRACIONES A SUPABASE REMOTO
--
-- 1. Ve a tu proyecto en Supabase Dashboard: https://supabase.com/dashboard
-- 2. Navega a "SQL Editor" en el panel lateral
-- 3. Copia y pega este script completo
-- 4. Ejecuta el script haciendo clic en "Run"
--
-- Este script aplicará todas las migraciones necesarias para tu sistema de POS

-- ============================================================================
-- APLICAR MIGRACIÓN INICIAL - 20250720044015_initial_schema.sql
-- ============================================================================

-- Crear tabla de categorías
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de productos
CREATE TABLE IF NOT EXISTS public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  description TEXT,
  category_id UUID REFERENCES public.categories(id),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  cost DECIMAL(10,2) NOT NULL CHECK (cost >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  min_stock INTEGER NOT NULL DEFAULT 0 CHECK (min_stock >= 0),
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de ventas
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_number TEXT NOT NULL UNIQUE,
  customer_name TEXT,
  customer_email TEXT,
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  tax DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (tax >= 0),
  total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  payment_method TEXT NOT NULL DEFAULT 'cash',
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de items de venta
CREATE TABLE IF NOT EXISTS public.sale_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
  size TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de compras/purchases
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_number TEXT NOT NULL UNIQUE,
  supplier_name TEXT NOT NULL,
  supplier_email TEXT,
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  tax DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (tax >= 0),
  total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  status TEXT NOT NULL DEFAULT 'pending',
  delivery_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de items de compra
CREATE TABLE IF NOT EXISTS public.purchase_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_cost DECIMAL(10,2) NOT NULL CHECK (unit_cost >= 0),
  total_cost DECIMAL(10,2) NOT NULL CHECK (total_cost >= 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de alertas
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL, -- 'low_stock', 'expired', 'general'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  product_id UUID REFERENCES public.products(id),
  is_read BOOLEAN NOT NULL DEFAULT false,
  priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================================
-- CONFIGURACIÓN DE AUTENTICACIÓN Y PERFILES
-- ============================================================================

-- Crear tipo de rol de usuario
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('admin', 'seller');
    END IF;
END $$;

-- Crear tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role NOT NULL DEFAULT 'seller',
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Función para crear un perfil cuando se crea un nuevo usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para la función anterior
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Función para obtener el rol de un usuario
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS public.user_role AS $$
DECLARE
  user_role public.user_role;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = user_id;
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CONFIGURACIÓN DE ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can view categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can view sales" ON public.sales;
DROP POLICY IF EXISTS "Authenticated users can view sale_items" ON public.sale_items;
DROP POLICY IF EXISTS "Authenticated users can view purchases" ON public.purchases;
DROP POLICY IF EXISTS "Authenticated users can view purchase_items" ON public.purchase_items;
DROP POLICY IF EXISTS "Authenticated users can view alerts" ON public.alerts;

-- Políticas RLS para perfiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (public.get_user_role(auth.uid()) = 'admin');

-- Políticas para otras tablas - permitir acceso a usuarios autenticados
CREATE POLICY "Authenticated users can view products" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage products" ON public.products FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view categories" ON public.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage categories" ON public.categories FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view sales" ON public.sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage sales" ON public.sales FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view sale_items" ON public.sale_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage sale_items" ON public.sale_items FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view purchases" ON public.purchases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage purchases" ON public.purchases FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view purchase_items" ON public.purchase_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage purchase_items" ON public.purchase_items FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view alerts" ON public.alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage alerts" ON public.alerts FOR ALL TO authenticated USING (true);

-- ============================================================================
-- FUNCIONES DE UTILIDAD
-- ============================================================================

-- Función para actualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar timestamps automáticamente
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_sales_updated_at ON public.sales;
CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_purchases_updated_at ON public.purchases;
CREATE TRIGGER update_purchases_updated_at
  BEFORE UPDATE ON public.purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_alerts_updated_at ON public.alerts;
CREATE TRIGGER update_alerts_updated_at
  BEFORE UPDATE ON public.alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Función para generar números únicos de venta
CREATE OR REPLACE FUNCTION public.generate_sale_number()
RETURNS TEXT AS $$
DECLARE
  sale_num TEXT;
  counter INTEGER := 1;
BEGIN
  LOOP
    sale_num := 'V' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || LPAD(counter::TEXT, 4, '0');
    
    IF NOT EXISTS (SELECT 1 FROM public.sales WHERE sale_number = sale_num) THEN
      RETURN sale_num;
    END IF;
    
    counter := counter + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Función para generar números únicos de compra
CREATE OR REPLACE FUNCTION public.generate_purchase_number()
RETURNS TEXT AS $$
DECLARE
  purchase_num TEXT;
  counter INTEGER := 1;
BEGIN
  LOOP
    purchase_num := 'C' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || LPAD(counter::TEXT, 4, '0');
    
    IF NOT EXISTS (SELECT 1 FROM public.purchases WHERE purchase_number = purchase_num) THEN
      RETURN purchase_num;
    END IF;
    
    counter := counter + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- DATOS DE EJEMPLO
-- ============================================================================

-- Insertar categorías de ejemplo (solo si no existen)
INSERT INTO public.categories (name, description) 
SELECT name, description FROM (VALUES
  ('Vestidos', 'Vestidos elegantes y casuales'),
  ('Pantalones', 'Pantalones y jeans'),
  ('Blusas', 'Blusas y camisas'),
  ('Abrigos', 'Chaquetas y abrigos'),
  ('Calzado', 'Zapatos y zapatillas'),
  ('Faldas', 'Faldas de diferentes estilos'),
  ('Accesorios', 'Bolsos, cinturones y accesorios')
) AS new_categories(name, description)
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE categories.name = new_categories.name);

-- Crear perfiles para usuarios existentes que no tengan perfil
INSERT INTO public.profiles (id, full_name, role)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email) as full_name,
  'seller' as role
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

-- Verificar que todas las tablas fueron creadas
SELECT 
  schemaname,
  tablename,
  'Tabla creada correctamente' as status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('categories', 'products', 'sales', 'sale_items', 'purchases', 'purchase_items', 'alerts', 'profiles')
ORDER BY tablename;

-- Mostrar estadísticas de la base de datos
SELECT 
  'Configuración completada exitosamente' as message,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles,
  (SELECT COUNT(*) FROM public.categories) as total_categories,
  (SELECT COUNT(*) FROM auth.users) as total_users;
