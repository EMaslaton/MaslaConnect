import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://oxcvythoudgzoxanszkz.supabase.co";
const supabaseAnonKey = "sb_publishable_-rTQfuUgzxGod9pqaAc8yg_3rKlm-gH";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addUserNameColumn() {
  try {
    console.log("🔄 Ejecutando migration: agregar columna user_name...");

    // Ejecutar la SQL via rpc si existe la función, o intenta directo
    const { error } = await supabase.rpc("execute_sql", {
      query: `
        ALTER TABLE services ADD COLUMN IF NOT EXISTS user_name TEXT;
        CREATE INDEX IF NOT EXISTS idx_services_user_id_user_name 
        ON services(user_id, user_name);
      `,
    });

    if (error) {
      // Si no existe la función RPC, intentamos otra forma
      console.log(
        "⚠️ RPC execute_sql no disponible, intentando alternativa..."
      );

      // Verification: intenta leer la tabla para confirmar que existe
      const { data, error: selectError } = await supabase
        .from("services")
        .select("*")
        .limit(1);

      if (selectError) {
        console.error("❌ Error:", selectError.message);
        return;
      }

      console.log(
        "✅ Tabla 'services' existe. Necesitas ejecutar la SQL manualmente en Supabase Dashboard:"
      );
      console.log(`
ALTER TABLE services ADD COLUMN IF NOT EXISTS user_name TEXT;
CREATE INDEX IF NOT EXISTS idx_services_user_id_user_name ON services(user_id, user_name);
      `);
      return;
    }

    console.log("✅ Migration completada: columna user_name agregada");
  } catch (err) {
    console.error("❌ Error durante migration:", err);
  }
}

addUserNameColumn();
