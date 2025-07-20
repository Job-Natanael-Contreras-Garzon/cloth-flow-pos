-- Crear tabla de categorías
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de productos
CREATE TABLE public.products (
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
CREATE TABLE public.sales (
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
CREATE TABLE public.sale_items (
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
CREATE TABLE public.purchases (
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
CREATE TABLE public.purchase_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_cost DECIMAL(10,2) NOT NULL CHECK (unit_cost >= 0),
  total_cost DECIMAL(10,2) NOT NULL CHECK (total_cost >= 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de alertas
CREATE TABLE public.alerts (
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

-- Crear tipo de rol de usuario
CREATE TYPE public.user_role AS ENUM ('admin', 'seller');

-- Crear tabla de perfiles de usuario
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role NOT NULL DEFAULT 'seller',
  full_name TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
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
$$ LANGUAGE plpgsql;

-- Habilitar RLS en todas las tablas
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS basadas en roles
-- Perfiles: Los usuarios pueden ver su propio perfil. Los admins pueden ver todos.
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

-- Productos: Cualquier usuario autenticado puede verlos.
CREATE POLICY "Authenticated users can view products" ON public.products FOR SELECT TO authenticated USING (true);

-- Función para crear un usuario con rol de admin (solo para desarrollo)
CREATE OR REPLACE FUNCTION public.create_user_with_admin_role(email TEXT, password TEXT)
RETURNS void AS $$
DECLARE
  user_id UUID;
BEGIN
  -- 1. Crear el usuario en auth.users. El trigger on_auth_user_created creará su perfil automáticamente.
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES (uuid_generate_v4(), uuid_generate_v4(), 'authenticated', 'authenticated', email, crypt(password, gen_salt('bf')), now(), now(), now()) RETURNING id INTO user_id;

  -- 2. Actualizar el perfil recién creado para asignarle el rol de 'admin'.
  UPDATE public.profiles
  SET role = 'admin'
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para actualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar timestamps automáticamente
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at
  BEFORE UPDATE ON public.purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at
  BEFORE UPDATE ON public.alerts
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

-- Insertar categorías de ejemplo
INSERT INTO public.categories (name, description) VALUES
  ('Vestidos', 'Vestidos elegantes y casuales'),
  ('Pantalones', 'Pantalones y jeans'),
  ('Blusas', 'Blusas y camisas'),
  ('Abrigos', 'Chaquetas y abrigos'),
  ('Calzado', 'Zapatos y zapatillas'),
  ('Faldas', 'Faldas de diferentes estilos'),
  ('Accesorios', 'Bolsos, cinturones y accesorios');

-- Insertar productos de ejemplo
INSERT INTO public.products (name, sku, category_id, price, cost, stock, min_stock, sizes, colors) VALUES
  ('Vestido Negro Elegante', 'VNE001', (SELECT id FROM public.categories WHERE name = 'Vestidos'), 89.99, 45.00, 5, 3, '{"S","M","L"}', '{"Negro","Azul"}'),
  ('Jeans Azul Clásico', 'JAC002', (SELECT id FROM public.categories WHERE name = 'Pantalones'), 65.50, 32.75, 12, 5, '{"28","30","32","34"}', '{"Azul","Negro"}'),
  ('Blusa Blanca Casual', 'BBC003', (SELECT id FROM public.categories WHERE name = 'Blusas'), 34.99, 17.50, 8, 4, '{"S","M","L","XL"}', '{"Blanco","Crema"}'),
  ('Chaqueta de Cuero', 'CDC004', (SELECT id FROM public.categories WHERE name = 'Abrigos'), 156.00, 78.00, 3, 2, '{"M","L","XL"}', '{"Negro","Marrón"}'),
  ('Zapatos Deportivos', 'ZD005', (SELECT id FROM public.categories WHERE name = 'Calzado'), 78.99, 39.50, 15, 8, '{"36","37","38","39","40"}', '{"Blanco","Negro"}'),
  ('Falda Plisada', 'FP006', (SELECT id FROM public.categories WHERE name = 'Faldas'), 42.50, 21.25, 7, 4, '{"S","M","L"}', '{"Negro","Gris","Azul"}')