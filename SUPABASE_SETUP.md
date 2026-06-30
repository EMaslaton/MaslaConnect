# 🚀 Setup Supabase en 5 Minutos

## Paso 1: Crear Cuenta en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Click en "Start your project" 
3. Crea una cuenta con GitHub/Google o email
4. Crea un nuevo proyecto (nombre: `maslaconnect`)
5. Espera ~2 minutos mientras se inicializa

---

## Paso 2: Copiar Credenciales

En el dashboard de Supabase:
1. Ve a **Settings → API**
2. Copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Project API Key (anon public)** → `VITE_SUPABASE_ANON_KEY`

Crear `.env.local`:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...xxxxx
```

---

## Paso 3: Crear Tablas en Supabase

1. En dashboard → **SQL Editor**
2. Click en "New Query"
3. Copiar y ejecutar este SQL:

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

-- Índices para velocidad
CREATE INDEX idx_services_user_id ON services(user_id);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_created ON services(created_at DESC);

-- Políticas de seguridad (RLS)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede ver servicios
CREATE POLICY "Servicios públicos" ON services
  FOR SELECT USING (true);

-- Solo propietario puede editar/borrar
CREATE POLICY "Usuario puede editar su servicio" ON services
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Usuario puede borrar su servicio" ON services
  FOR DELETE USING (auth.uid()::text = user_id);

-- Cualquiera autenticado puede crear
CREATE POLICY "Usuarios autenticados pueden crear servicios" ON services
  FOR INSERT WITH CHECK (true);
```

---

## Paso 4: Instalar en el Proyecto

```bash
npm install @supabase/supabase-js
```

---

## Paso 5: Verificar Conexión

En la terminal:
```bash
npm run dev
```

Abre la consola del navegador (F12) y busca:
```
[Supabase] Connected ✅
```

---

## ✅ Listo! Los servicios ahora persisten en la nube

**Próximos pasos:**
- Los servicios se guardan automáticamente en Supabase
- El código ya está actualizado para cargar desde la BD
- Los enlaces compartidos ahora funcionarán indefinidamente ✨

---

## 🐛 Troubleshooting

### Error: "Missing API keys"
```
❌ VITE_SUPABASE_URL no definida
```
**Solución:** Verifica que `.env.local` tenga las keys correctas

### Error: "403 Unauthorized"
```
❌ La key está expirada o es incorrecta
```
**Solución:** Copia nuevamente desde Settings → API

### Error: "Row Level Security"
```
❌ No tienes permiso para crear/editar servicios
```
**Solución:** Asegúrate de estar autenticado en la app

---

## 📊 Dashboard Stats

Visita: `https://supabase.com` → Tu Proyecto → **Database → Services**

Verás en tiempo real:
- ✅ Servicios guardados
- 📈 Cantidad de registros
- ⚡ Queries ejecutados

---

## 🔐 Seguridad

Las políticas RLS aseguran que:
- Todos pueden **VER** servicios
- Solo propietario puede **EDITAR/BORRAR**
- Solo autenticados pueden **CREAR**

Si necesitas cambiar permisos, edita las políticas en:
**Database → Policies** en Supabase dashboard

---

**¡Listo para usar!** 🚀
