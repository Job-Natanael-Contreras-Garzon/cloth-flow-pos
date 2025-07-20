import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL or Service Role Key is missing in .env file')
}

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
  const { data, error } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true, // Auto-confirm the email
  })

  if (error) {
    console.error('Error creating admin user:', error.message)
    return
  }

  if (!data.user) {
    console.error('User was not created, but no error was reported.')
    return
  }

  console.log('Admin user created successfully:', data.user.email)

  // 3. Update the user's profile to set the role to 'admin'
  // The trigger should have already created the profile, so we just update it.
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', data.user.id)

  if (updateError) {
    console.error('Error updating profile to admin:', updateError.message)
  } else {
    console.log('Admin user role updated to admin.')
  }
}

createAdminUser()
