# ⚡ Instalación Rápida de Supabase para MaslaConnect

## 📦 Paso 1: Instalar Dependencias (Ya Hecho)

```bash
npm install @supabase/supabase-js
```

✅ La dependencia ya está configurada en el proyecto

---

## 🔑 Paso 2: Obtener Credenciales de Supabase (5 minutos)

### 2.1 Crear Cuenta
1. Ve a [https://supabase.com](https://supabase.com)
2. Haz click en "Sign Up"
3. Usa GitHub/Google o email

### 2.2 Crear Proyecto
1. Click en "New Project"
2. **Nombre:** `maslaconnect`
3. **Contraseña:** Alguna segura (la guardaremos)
4. **Región:** Elige la más cercana a ti
5. Click en "Create new project"
6. Espera ~2 minutos ⏳

### 2.3 Copiar Credenciales
1. En el dashboard → **Settings** (⚙️ esquina abajo izquierda)
2. Click en **API**
3. Encontrarás:
   - **Project URL** (algo como `https://xxxxx.supabase.co`)
   - **Project API Key** → Copia la key `anon` (la pública)

---

## 📝 Paso 3: Configurar Variables de Entorno

1. En la raíz del proyecto, copia `.env.example` → `.env.local`

```bash
cp .env.example .env.local
```

2. Abre `.env.local` y reemplaza:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...abcdefghijklmnop
```

**Ejemplo completo:**
```env
VITE_SUPABASE_URL=https://pmjqywvtxnhoihvw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtanF5d3Z0eG5ob2lodnciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcxNTAwMDAwMCwiZXhwIjoxODQzNjAwMDAwfQ.abcdef123456
```

---

## 🗄️ Paso 4: Crear Tablas en Supabase

1. En Supabase Dashboard → **SQL Editor** (esquina izquierda)
2. Click en **"New Query"**
3. Copia y pega este SQL completo:

```sql
-- Tabla de servicios
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price TEXT,
  rating DECIMAL DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  image TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índices para velocidad ⚡
CREATE INDEX idx_services_user_id ON services(user_id);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_created ON services(created_at DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden VER servicios
CREATE POLICY "Servicios publicos - lectura" ON services
  FOR SELECT USING (true);

-- Política: Solo propietario puede EDITAR
CREATE POLICY "Usuario puede editar su servicio" ON services
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Política: Solo propietario puede BORRAR
CREATE POLICY "Usuario puede borrar su servicio" ON services
  FOR DELETE USING (auth.uid()::text = user_id);

-- Política: Cualquiera autenticado puede CREAR
CREATE POLICY "Usuarios autenticados pueden crear servicios" ON services
  FOR INSERT WITH CHECK (true);
```

4. Click en **"Run"** ▶️
5. Espera a que termine ✅

**Si ves errores de "already exists"**, es normal - significa que ya existe

---

## ✅ Paso 5: Verificar Conexión

1. Abre terminal en el proyecto:
```bash
npm run dev
```

2. Abre el navegador en `http://localhost:5173`

3. Abre **DevTools** (F12 o Ctrl+Shift+I)

4. Ve a **Console** y busca este mensaje:

```
[Supabase] Connected ✅
```

Si ves esto, **¡Estás listo!** 🎉

---

## 🧪 Paso 6: Probar (Opcional)

1. Crea un usuario y publica un servicio
2. En Supabase Dashboard → **Table Editor** → **services**
3. Deberías ver tu servicio ahí ✨

---

## ⚠️ Troubleshooting

### Error: "VITE_SUPABASE_URL not defined"
```
❌ Las credenciales no están cargadas
```
**Solución:** 
- Verifica que `.env.local` exista
- Reinicia el servidor (`npm run dev`)
- Cierra y reabre el navegador

### Error: "403 Unauthorized"
```
❌ Las credenciales están incorrectas
```
**Solución:**
- Copia nuevamente desde Settings → API
- Verifica que sea la key `anon` (no `service_role`)
- Revisa que no haya espacios al copiar

### No veo "[Supabase] Connected ✅"
```
❌ Supabase no está configurada
```
**Solución:**
- Verifica el contenido de `.env.local`
- Abre DevTools y busca mensajes de error
- Intenta crear `.env.local` manualmente

### Error: "Row Level Security"
```
❌ No tienes permiso para crear servicios
```
**Solución:**
- Asegúrate de estar autenticado
- Verifica que las políticas RLS estén correctas
- Ejecuta el SQL de RLS nuevamente

---

## 📊 Verificar en Supabase Dashboard

Abierto En Supabase:
- **Table Editor** → ves todos los servicios guardados
- **Realtime** → ves cambios en vivo
- **SQL Editor** → ejecutar queries manual

---

## 🎯 Ahora Qué Sucede

✅ **Servicios publicados persisten en la nube**
✅ **Puedes empezar enlaces con otros usuarios**
✅ **Los servicios no desaparecen al refrescar**
✅ **Escalable automáticamente**

---

## 🚀 Próximos Pasos

Cuando crezcas:
1. Autenticación con usuarios reales (Firebase Auth o Supabase Auth)
2. Pagos (Stripe, MercadoPago)
3. Notificaciones (Push notifications)
4. Chat en tiempo real

---

## 📞 Necesitas Ayuda?

- Documentación Supabase: https://supabase.com/docs
- Community Discord: https://discord.supabase.com
- Issues del proyecto: Crea un Issue en GitHub

---

**¡Listo para usar Supabase!** 🎉
