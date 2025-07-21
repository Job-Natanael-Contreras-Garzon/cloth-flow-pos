import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

// Use remote database URLs if available, fallback to local
const supabaseUrl = process.env.VITE_SUPABASE_URL_REMOTE || process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY_REMOTE || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL or Service Role Key is missing in .env file')
}

console.log('🔗 Conectando a:', supabaseUrl.includes('127.0.0.1') ? 'Base de datos LOCAL' : 'Base de datos REMOTA')

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function createAdminUser() {
  const adminEmail = 'admin@gmail.com'
  const adminPassword = 'admin123'

  // 1. Check if the user already exists
  const { data: userData, error: userError } = await supabase.auth.admin.listUsers()
  if (userError) {
    console.error('Error listing users:', userError.message)
    return
  }

  const adminExists = userData.users.some(user => user.email === adminEmail)

  if (adminExists) {
    console.log('Admin user already exists. Skipping creation.')
    return
  }

  // 2. Create the user if they don't exist
  try {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Auto-confirm the email
    });

    if (authError) {
      // Si el error es porque el usuario ya existe, no es un fallo crítico.
      if (authError.message.includes('User already registered')) {
        console.warn(`⚠️  User ${adminEmail} already exists. Proceeding to update role.`);
      } else {
        throw authError; // Lanza otros errores de autenticación
      }
    }

    if (authData?.user) {
        console.log(`✅ Admin user created successfully: ${authData.user.email}`);
    }

    // 3. Obtenemos el ID del usuario, ya sea recién creado o existente
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Could not get user to update profile.');

    // Esperar un momento para asegurar que el trigger que crea el perfil se complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 4. Actualizamos el perfil del usuario para asignarle el rol de 'admin'
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', user.id);

    if (profileError) {
      throw profileError; // Lanza el error del perfil para ser capturado abajo
    }

    console.log(`🎉 Successfully set role 'admin' for user ${adminEmail}`);

  } catch (error: any) {
    console.error('❌ Error during admin user seeding:', error.message || 'Unknown error');
    if (error.details) console.error('   Details:', error.details);
    if (error.hint) console.error('   Hint:', error.hint);
  }

createAdminUser()
