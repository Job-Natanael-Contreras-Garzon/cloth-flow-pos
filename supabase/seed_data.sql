-- Datos de prueba para Cloth Flow POS
-- Ejecutar después de las migraciones principales

-- Limpiar datos existentes (solo para desarrollo)
DELETE FROM sale_items;
DELETE FROM sales;
DELETE FROM products;
DELETE FROM categories;

-- Categorías de ropa
INSERT INTO categories (id, name, description) VALUES
  ('cat1', 'Camisas', 'Camisas formales y casuales'),
  ('cat2', 'Pantalones', 'Pantalones de vestir y casuales'),
  ('cat3', 'Vestidos', 'Vestidos para toda ocasión'),
  ('cat4', 'Zapatos', 'Calzado formal y casual'),
  ('cat5', 'Accesorios', 'Cinturones, carteras y más');

-- Productos de prueba
INSERT INTO products (id, name, sku, description, category_id, price, cost, stock, min_stock, sizes, colors, is_active) VALUES
  -- Camisas
  ('prod1', 'Camisa Formal Blanca', 'CAM-001', 'Camisa formal de algodón blanca', 'cat1', 899.00, 450.00, 15, 5, ARRAY['S', 'M', 'L', 'XL'], ARRAY['Blanco'], true),
  ('prod2', 'Camisa Casual Azul', 'CAM-002', 'Camisa casual de mezclilla azul', 'cat1', 749.00, 375.00, 8, 5, ARRAY['S', 'M', 'L', 'XL'], ARRAY['Azul'], true),
  ('prod3', 'Camisa Polo Negra', 'CAM-003', 'Polo de algodón negro', 'cat1', 599.00, 300.00, 3, 5, ARRAY['S', 'M', 'L'], ARRAY['Negro'], true),
  
  -- Pantalones
  ('prod4', 'Pantalón de Vestir Negro', 'PAN-001', 'Pantalón formal negro', 'cat2', 1299.00, 650.00, 12, 3, ARRAY['28', '30', '32', '34', '36'], ARRAY['Negro'], true),
  ('prod5', 'Jeans Clásico Azul', 'PAN-002', 'Jeans de mezclilla azul clásico', 'cat2', 999.00, 500.00, 0, 5, ARRAY['28', '30', '32', '34'], ARRAY['Azul'], true),
  ('prod6', 'Pantalón Chino Beige', 'PAN-003', 'Pantalón chino casual beige', 'cat2', 849.00, 425.00, 7, 4, ARRAY['30', '32', '34', '36'], ARRAY['Beige'], true),
  
  -- Vestidos
  ('prod7', 'Vestido Cocktail Negro', 'VES-001', 'Vestido elegante para eventos', 'cat3', 1899.00, 950.00, 5, 2, ARRAY['XS', 'S', 'M', 'L'], ARRAY['Negro'], true),
  ('prod8', 'Vestido Casual Floral', 'VES-002', 'Vestido casual con estampado floral', 'cat3', 1299.00, 650.00, 1, 3, ARRAY['S', 'M', 'L', 'XL'], ARRAY['Multicolor'], true),
  
  -- Zapatos
  ('prod9', 'Zapatos Oxford Café', 'ZAP-001', 'Zapatos formales de cuero café', 'cat4', 2199.00, 1100.00, 6, 2, ARRAY['25', '26', '27', '28', '29'], ARRAY['Café'], true),
  ('prod10', 'Tenis Deportivos Blancos', 'ZAP-002', 'Tenis casuales blancos', 'cat4', 1599.00, 800.00, 10, 4, ARRAY['25', '26', '27', '28', '29', '30'], ARRAY['Blanco'], true),
  
  -- Accesorios
  ('prod11', 'Cinturón de Cuero Negro', 'ACC-001', 'Cinturón formal de cuero genuino', 'cat5', 599.00, 300.00, 8, 3, ARRAY['S', 'M', 'L', 'XL'], ARRAY['Negro'], true),
  ('prod12', 'Cartera de Dama Roja', 'ACC-002', 'Cartera elegante de cuero rojo', 'cat5', 1499.00, 750.00, 4, 2, ARRAY['Única'], ARRAY['Rojo'], true);

-- Ventas de ejemplo
INSERT INTO sales (id, sale_number, customer_name, customer_email, total_amount, payment_method, status, created_at) VALUES
  ('sale1', 'V-20250720-0001', 'María González', 'maria@email.com', 1548.00, 'card', 'completed', '2025-01-20 10:30:00'),
  ('sale2', 'V-20250720-0002', 'Juan Pérez', 'juan@email.com', 899.00, 'cash', 'completed', '2025-01-20 14:15:00'),
  ('sale3', 'V-20250720-0003', NULL, NULL, 1299.00, 'cash', 'completed', '2025-01-20 16:45:00');

-- Items de ventas de ejemplo
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price) VALUES
  -- Venta 1: Camisa + Pantalón
  ('sale1', 'prod1', 1, 899.00, 899.00),
  ('sale1', 'prod6', 1, 849.00, 849.00),
  
  -- Venta 2: Solo camisa
  ('sale2', 'prod1', 1, 899.00, 899.00),
  
  -- Venta 3: Pantalón de vestir
  ('sale3', 'prod4', 1, 1299.00, 1299.00);

-- Mensaje de confirmación
SELECT 'Datos de prueba insertados correctamente' as mensaje;
