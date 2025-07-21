import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY son requeridas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  try {
    console.log('🔍 Verificando datos existentes...\n');
    
    // Verificar categorías
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*');
    
    if (catError) {
      console.error('❌ Error consultando categorías:', catError);
      return;
    }
    
    console.log(`📁 Categorías encontradas: ${categories.length}`);
    categories.forEach(cat => console.log(`  • ${cat.name}`));
    
    // Verificar productos
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id, name, sku, stock, is_active');
    
    if (prodError) {
      console.error('❌ Error consultando productos:', prodError);
      return;
    }
    
    console.log(`\n👕 Productos encontrados: ${products.length}`);
    products.forEach(prod => console.log(`  • ${prod.name} (${prod.sku}) - Stock: ${prod.stock}`));
    
    // Verificar ventas
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('id, total, created_at, customer_name');
    
    if (salesError) {
      console.error('❌ Error consultando ventas:', salesError);
      return;
    }
    
    console.log(`\n💰 Ventas encontradas: ${sales.length}`);
    sales.forEach(sale => console.log(`  • $${sale.total} - ${sale.customer_name || 'Sin nombre'}`));
    
    // Estadísticas
    const outOfStock = products.filter(p => p.stock === 0);
    const critical = products.filter(p => p.stock > 0 && p.stock <= 2);
    const warning = products.filter(p => p.stock > 2 && p.stock <= 5);
    
    console.log(`\n📊 Estado del inventario:`);
    console.log(`  • Sin stock: ${outOfStock.length} productos`);
    console.log(`  • Stock crítico (≤2): ${critical.length} productos`);
    console.log(`  • Stock bajo (≤5): ${warning.length} productos`);
    
    if (outOfStock.length > 0) {
      console.log(`\n🚨 Productos sin stock:`);
      outOfStock.forEach(p => console.log(`  • ${p.name}`));
    }
    
    if (critical.length > 0) {
      console.log(`\n⚠️ Productos con stock crítico:`);
      critical.forEach(p => console.log(`  • ${p.name} (${p.stock} unidades)`));
    }
    
  } catch (error) {
    console.error('❌ Error verificando datos:', error);
  }
}

checkData();
