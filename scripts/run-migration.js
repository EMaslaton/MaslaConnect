import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://oxcvythoudgzoxanszkz.supabase.co";
const supabaseAnonKey = "sb_publishable_-rTQfuUgzxGod9pqaAc8yg_3rKlm-gH";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runMigration() {
  try {
    console.log("🔄 Intentando ejecutar migration...");

    // Intentar via RPC (si existe la función)
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      "execute_sql",
      {
        query: `ALTER TABLE services ADD COLUMN IF NOT EXISTS user_name TEXT;`,
      }
    );

    if (rpcError) {
      console.log("⚠️ RPC execute_sql no disponible:", rpcError.message);
      console.log("\n📋 Por favor ejecuta manualmente en Supabase Dashboard:");
      console.log("1. Ve a: https://app.supabase.com/project/oxcvythoudgzoxanszkz/sql");
      console.log("2. Copia y ejecuta esta SQL:\n");
      console.log(`
-- Add user_name column
ALTER TABLE services ADD COLUMN IF NOT EXISTS user_name TEXT;

-- Create index for better queries
CREATE INDEX IF NOT EXISTS idx_services_user_id_user_name 
ON services(user_id, user_name);

-- Verify the column was created
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name='services' AND column_name='user_name';
      `);
      return;
    }

    console.log("✅ Migration ejecutada exitosamente!");
    console.log(rpcResult);
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

runMigration();
