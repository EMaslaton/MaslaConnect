import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://oxcvythoudgzoxanszkz.supabase.co";
const supabaseAnonKey = "sb_publishable_-rTQfuUgzxGod9pqaAc8yg_3rKlm-gH";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addUserNameColumn() {
  try {
    console.log("🔄 Verificando tabla services...");

    // Intenta leer un registro para ver la estructura actual
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .limit(1);

    if (error) {
      console.error("❌ Error al conectar:", error.message);
      return;
    }

    if (data && data.length > 0) {
      console.log("✅ Tabla services existe");
      console.log("📋 Campos actuales:", Object.keys(data[0]));

      // Verificar si ya existe la columna user_name
      if ("user_name" in data[0]) {
        console.log("✅ Columna user_name ya existe");
      } else {
        console.log("⚠️ Columna user_name NO EXISTE");
        console.log(
          "\nNecesitas ejecutar esta SQL en Supabase Dashboard (SQL Editor):\n"
        );
        console.log(`
ALTER TABLE services ADD COLUMN IF NOT EXISTS user_name TEXT;
CREATE INDEX IF NOT EXISTS idx_services_user_id_user_name 
ON services(user_id, user_name);
        `);
      }
    } else {
      console.log("📊 No hay servicios aún");
    }
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

addUserNameColumn();
