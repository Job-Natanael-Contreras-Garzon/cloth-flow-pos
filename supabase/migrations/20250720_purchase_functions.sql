-- Función para crear una compra con productos (nuevos o existentes)
CREATE OR REPLACE FUNCTION public.create_purchase_with_items(
  p_supplier_name TEXT,
  p_supplier_email TEXT DEFAULT NULL,
  p_delivery_date DATE DEFAULT NULL,
  p_subtotal DECIMAL(10,2),
  p_tax DECIMAL(10,2),
  p_total DECIMAL(10,2),
  p_items JSONB
) RETURNS UUID AS $$
DECLARE
  purchase_id UUID;
  item JSONB;
  product_id UUID;
  purchase_number_val TEXT;
BEGIN
  -- Generar número de compra
  purchase_number_val := public.generate_purchase_number();
  
  -- Crear la compra
  INSERT INTO public.purchases (
    purchase_number,
    supplier_name,
    supplier_email,
    subtotal,
    tax,
    total,
    delivery_date,
    status
  ) VALUES (
    purchase_number_val,
    p_supplier_name,
    p_supplier_email,
    p_subtotal,
    p_tax,
    p_total,
    p_delivery_date,
    'pending'
  ) RETURNING id INTO purchase_id;

  -- Procesar cada item
  FOR item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Si no tiene product_id, crear nuevo producto
    IF (item->>'product_id') IS NULL THEN
      INSERT INTO public.products (
        name,
        sku,
        description,
        category_id,
        price,
        cost,
        stock,
        min_stock
      ) VALUES (
        item->>'product_name',
        item->>'sku',
        COALESCE(item->>'description', ''),
        COALESCE((item->>'category_id')::UUID, NULL),
        COALESCE((item->>'price')::DECIMAL(10,2), 0),
        (item->>'unit_cost')::DECIMAL(10,2),
        0, -- Stock inicial en 0, se actualizará al recibir
        0
      ) RETURNING id INTO product_id;
    ELSE
      product_id := (item->>'product_id')::UUID;
      
      -- Actualizar el costo del producto si es diferente
      UPDATE public.products 
      SET cost = (item->>'unit_cost')::DECIMAL(10,2),
          updated_at = NOW()
      WHERE id = product_id 
        AND cost != (item->>'unit_cost')::DECIMAL(10,2);
    END IF;

    -- Crear el item de compra
    INSERT INTO public.purchase_items (
      purchase_id,
      product_id,
      quantity,
      unit_cost,
      total_cost
    ) VALUES (
      purchase_id,
      product_id,
      (item->>'quantity')::INTEGER,
      (item->>'unit_cost')::DECIMAL(10,2),
      (item->>'quantity')::INTEGER * (item->>'unit_cost')::DECIMAL(10,2)
    );
  END LOOP;

  RETURN purchase_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para actualizar stock cuando se recibe una compra
CREATE OR REPLACE FUNCTION public.update_stock_from_purchase(
  p_purchase_id UUID
) RETURNS VOID AS $$
DECLARE
  item RECORD;
BEGIN
  -- Iterar sobre todos los items de la compra
  FOR item IN 
    SELECT product_id, quantity 
    FROM public.purchase_items 
    WHERE purchase_id = p_purchase_id
  LOOP
    -- Actualizar el stock del producto
    UPDATE public.products 
    SET stock = stock + item.quantity,
        updated_at = NOW()
    WHERE id = item.product_id;
  END LOOP;
  
  -- Marcar la compra como recibida si no lo está ya
  UPDATE public.purchases 
  SET status = 'received',
      updated_at = NOW()
  WHERE id = p_purchase_id AND status != 'received';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para revertir stock (en caso de cancelar una compra recibida)
CREATE OR REPLACE FUNCTION public.revert_stock_from_purchase(
  p_purchase_id UUID
) RETURNS VOID AS $$
DECLARE
  item RECORD;
BEGIN
  -- Verificar que la compra esté en estado 'received'
  IF NOT EXISTS (
    SELECT 1 FROM public.purchases 
    WHERE id = p_purchase_id AND status = 'received'
  ) THEN
    RAISE EXCEPTION 'La compra no está en estado recibida';
  END IF;

  -- Iterar sobre todos los items de la compra
  FOR item IN 
    SELECT product_id, quantity 
    FROM public.purchase_items 
    WHERE purchase_id = p_purchase_id
  LOOP
    -- Verificar que hay suficiente stock para revertir
    IF (SELECT stock FROM public.products WHERE id = item.product_id) < item.quantity THEN
      RAISE EXCEPTION 'No hay suficiente stock para revertir la compra del producto ID: %', item.product_id;
    END IF;
    
    -- Revertir el stock del producto
    UPDATE public.products 
    SET stock = stock - item.quantity,
        updated_at = NOW()
    WHERE id = item.product_id;
  END LOOP;
  
  -- Marcar la compra como pendiente
  UPDATE public.purchases 
  SET status = 'pending',
      updated_at = NOW()
  WHERE id = p_purchase_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para generar alertas de stock bajo después de actualizar stock
CREATE OR REPLACE FUNCTION public.check_low_stock_after_purchase()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar si algún producto tiene stock bajo después de la actualización
  INSERT INTO public.alerts (type, title, message, product_id, priority)
  SELECT 
    'low_stock',
    'Stock Bajo',
    'El producto ' || p.name || ' (SKU: ' || p.sku || ') tiene stock bajo (' || p.stock || ' unidades)',
    p.id,
    CASE 
      WHEN p.stock = 0 THEN 'high'
      WHEN p.stock <= p.min_stock / 2 THEN 'high'
      ELSE 'medium'
    END
  FROM public.products p
  WHERE p.stock <= p.min_stock 
    AND p.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM public.alerts a 
      WHERE a.product_id = p.id 
        AND a.type = 'low_stock' 
        AND a.is_read = false
    );

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger que se ejecuta después de actualizar stock
CREATE OR REPLACE TRIGGER trigger_check_low_stock_after_purchase
  AFTER UPDATE OF stock ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.check_low_stock_after_purchase();
