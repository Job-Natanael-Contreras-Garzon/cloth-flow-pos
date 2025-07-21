-- Corregir la función process_complete_sale para usar la columna correcta
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
  
  -- Crear la venta - usando 'total' en lugar de 'total_amount'
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
      RAISE EXCEPTION 'Stock insuficiente para el producto %. Stock disponible: %, solicitado: %', 
        product_record.name, product_record.stock, (item->>'quantity')::integer;
    END IF;
    
    -- Insertar item de venta
    INSERT INTO sale_items (
      sale_id,
      product_id,
      quantity,
      unit_price,
      total_price,
      size,
      color
    ) VALUES (
      sale_id,
      (item->>'product_id')::uuid,
      (item->>'quantity')::integer,
      (item->>'unit_price')::decimal,
      (item->>'total_price')::decimal,
      item->>'size',
      item->>'color'
    );
    
    -- Actualizar stock del producto
    UPDATE products 
    SET stock = stock - (item->>'quantity')::integer,
        updated_at = now()
    WHERE id = (item->>'product_id')::uuid;
  END LOOP;

  -- Construir resultado de éxito
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
