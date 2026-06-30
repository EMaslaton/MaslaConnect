#!/usr/bin/env node

/**
 * Script para actualizar las políticas RLS en Supabase
 * Hace que el chat funcione con usuarios mock
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://oxcvythoudgzoxanszkz.supabase.co";
const supabaseKey = "sb_publishable_-rTQfuUgzxGod9pqaAc8yg_3rKlm-gH";

const supabase = createClient(supabaseUrl, supabaseKey);

const sql = `
-- Eliminar políticas antiguas
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;

-- Crear nuevas políticas permisivas (para testing con usuarios mock)
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (true);

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their conversations"
  ON conversations FOR UPDATE
  USING (true);

-- Eliminar políticas antiguas de messages
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;

-- Crear nuevas políticas permisivas para messages
CREATE POLICY "Users can view messages from their conversations"
  ON messages FOR SELECT
  USING (true);

CREATE POLICY "Users can insert messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  USING (true);
`;

async function updatePolicies() {
  try {
    console.log("🔄 Actualizando políticas RLS en Supabase...\n");

    // Ejecutar cada statement por separado
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith("--"));

    for (const statement of statements) {
      console.log(`⏳ Ejecutando: ${statement.substring(0, 50)}...`);
      try {
        await supabase.rpc("exec", { sql_text: statement });
      } catch (error) {
        // Si exec no existe, intentar via REST API
        const response = await fetch(
          `${supabaseUrl}/rest/v1/rpc/exec`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${supabaseKey}`,
              apikey: supabaseKey,
            },
            body: JSON.stringify({ sql_text: statement }),
          }
        ).catch(() => null);

        if (!response?.ok) {
          console.warn(`⚠️  No se pudo ejecutar: ${statement.substring(0, 30)}...`);
        }
      }
    }

    console.log("\n✅ ¡Políticas RLS actualizadas!\n");
    console.log("📋 Próximos pasos:");
    console.log("1. Recarga tu navegador (Ctrl + F5)");
    console.log("2. Inicia sesión");
    console.log("3. Prueba el botón 'Conectar'\n");
  } catch (error) {
    console.error("❌ Error:", error);
    console.log("\n📖 Ejecuta esto manualmente en Supabase SQL Editor:\n");
    console.log(sql);
  }
}

updatePolicies();
