-- Llamar a la función para crear el usuario administrador
-- Esto es más seguro y es la forma recomendada para el desarrollo local.
SELECT public.create_user_with_admin_role('admin@gmail.com', 'admin123');
