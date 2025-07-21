-- Función para procesar una venta completa
-- Incluye: crear venta, items, actualizar stock, validaciones
CREATE OR REPLACE FUNCTION process_complete_sale(
  sale_data jsonb,
  sale_items jsonb[]
) RETURNS json AS $$
DECLARE
  sale_id uuid;
  item jsonb;
  product_record record;
  new_stock integer;
  sale_number text;
  result json;
BEGIN
  -- Generar número de venta único
  sale_number := 'V-' || to_char(now(), 'YYYYMMDD') || '-' || LPAD(nextval('sale_number_seq')::text, 4, '0');
  
  -- Crear la venta
  INSERT INTO sales (
    sale_number,
    customer_name,
    customer_email,
    subtotal,
    tax,
    total,
    payment_method,
    status,
    created_at
  ) VALUES (
    sale_number,
    sale_data->>'customer_name',
    sale_data->>'customer_email',
    COALESCE((sale_data->>'subtotal')::decimal, 0),
    COALESCE((sale_data->>'tax')::decimal, 0),
    (sale_data->>'total_amount')::decimal,
    sale_data->>'payment_method',
    'completed',
    now()
  ) RETURNING id INTO sale_id;

  -- Procesar cada item y actualizar stock
  FOREACH item IN ARRAY sale_items
  LOOP
    -- Validar stock disponible
    SELECT * INTO product_record 
    FROM products 
    WHERE id = (item->>'product_id')::uuid 
    AND is_active = true;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Producto no encontrado: %', item->>'product_id';
    END IF;
    
    IF product_record.stock < (item->>'quantity')::integer THEN
      RAISE EXCEPTION 'Stock insuficiente para producto: %. Disponible: %, Solicitado: %', 
        product_record.name, product_record.stock, item->>'quantity';
    END IF;
    
    -- Crear item de venta
    INSERT INTO sale_items (
      sale_id,
      product_id,
      quantity,
      unit_price,
      total_price
    ) VALUES (
      sale_id,
      (item->>'product_id')::uuid,
      (item->>'quantity')::integer,
      (item->>'unit_price')::decimal,
      (item->>'total_price')::decimal
    );
    
    -- Actualizar stock
    new_stock := product_record.stock - (item->>'quantity')::integer;
    UPDATE products 
    SET stock = new_stock, updated_at = now()
    WHERE id = (item->>'product_id')::uuid;
    
  END LOOP;

  -- Retornar resultado
  SELECT json_build_object(
    'success', true,
    'sale_id', sale_id,
    'sale_number', sale_number,
    'message', 'Venta procesada correctamente'
  ) INTO result;
  
  RETURN result;

EXCEPTION WHEN OTHERS THEN
  -- Rollback automático por transacción
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM,
    'message', 'Error al procesar la venta'
  );
END;
$$ LANGUAGE plpgsql;

-- Crear secuencia para números de venta
CREATE SEQUENCE IF NOT EXISTS sale_number_seq START 1;

-- Función para obtener estadísticas del dashboard
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS json AS $$
DECLARE
  stats json;
BEGIN
  SELECT json_build_object(
    'today_sales', (
      SELECT COALESCE(SUM(total_amount), 0)
      FROM sales 
      WHERE DATE(created_at) = CURRENT_DATE 
      AND status = 'completed'
    ),
    'total_products', (
      SELECT COUNT(*) FROM products WHERE is_active = true
    ),
    'low_stock_products', (
      SELECT COUNT(*) FROM products 
      WHERE is_active = true AND stock <= min_stock
    ),
    'out_of_stock_products', (
      SELECT COUNT(*) FROM products 
      WHERE is_active = true AND stock = 0
    ),
    'total_sales_count', (
      SELECT COUNT(*) FROM sales WHERE status = 'completed'
    ),
    'inventory_value', (
      SELECT COALESCE(SUM(cost * stock), 0) FROM products WHERE is_active = true
    )
  ) INTO stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql;
