create or replace function create_sale_and_update_stock(
    p_customer_name text,
    p_customer_email text,
    p_subtotal numeric,
    p_tax numeric,
    p_total numeric,
    p_payment_method text,
    p_items jsonb
)
returns uuid as $$
declare
    v_sale_id uuid;
    v_sale_number text;
    item_data jsonb;
begin
    -- 1. Generate sale number
    select generate_sale_number() into v_sale_number;

    -- 2. Create sale and get its ID
    insert into public.sales (sale_number, customer_name, customer_email, subtotal, tax, total, payment_method, status)
    values (v_sale_number, p_customer_name, p_customer_email, p_subtotal, p_tax, p_total, p_payment_method, 'completed')
    returning id into v_sale_id;

    -- 3. Loop through items, insert into sale_items and update stock
    for item_data in select * from jsonb_array_elements(p_items)
    loop
        -- Insert into sale_items
        insert into public.sale_items (sale_id, product_id, quantity, unit_price, total_price, size, color)
        values (
            v_sale_id,
            (item_data->>'product_id')::uuid,
            (item_data->>'quantity')::integer,
            (item_data->>'unit_price')::numeric,
            (item_data->>'total_price')::numeric,
            item_data->>'size',
            item_data->>'color'
        );

        -- Update product stock
        update public.products
        set stock = stock - (item_data->>'quantity')::integer
        where id = (item_data->>'product_id')::uuid;
    end loop;

    return v_sale_id;
end;
$$ language plpgsql volatile security definer;

-- Grant permissions to the API roles
GRANT EXECUTE
ON FUNCTION public.create_sale_and_update_stock(text, text, numeric, numeric, numeric, text, jsonb)
TO authenticated, anon;
