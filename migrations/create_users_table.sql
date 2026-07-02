-- Tabla de usuarios para el panel de admin
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT,
  role TEXT DEFAULT 'freelancer',
  account_type TEXT DEFAULT 'person',
  avatar TEXT,
  phone_country TEXT,
  phone_dial_code TEXT,
  phone_number TEXT,
  tagline TEXT,
  bio TEXT,
  location TEXT,
  skills TEXT[] DEFAULT '{}',
  social_links JSONB DEFAULT '{}'::jsonb,
  internship_profile JSONB,
  company_profile JSONB,
  school_profile JSONB,
  portfolio JSONB DEFAULT '[]'::jsonb,
  tax_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'person',
  ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS internship_profile JSONB,
  ADD COLUMN IF NOT EXISTS company_profile JSONB,
  ADD COLUMN IF NOT EXISTS school_profile JSONB,
  ADD COLUMN IF NOT EXISTS portfolio JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS tax_id TEXT,
  ADD COLUMN IF NOT EXISTS phone_country TEXT,
  ADD COLUMN IF NOT EXISTS phone_dial_code TEXT,
  ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Índices para velocidad
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created ON users(created_at DESC);

-- Políticas de seguridad (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede ver usuarios (para el directorio)
CREATE POLICY "Usuarios públicos" ON users
  FOR SELECT USING (true);

-- Solo el mismo usuario o admin puede editar
CREATE POLICY "Usuario puede editar su perfil" ON users
  FOR UPDATE USING (auth.uid()::text = id OR (SELECT role FROM users WHERE id = auth.uid()::text) = 'admin');

-- Admin puede crear/borrar usuarios
CREATE POLICY "Crear usuarios" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin puede borrar usuarios" ON users
  FOR DELETE USING ((SELECT role FROM users WHERE id = auth.uid()::text) = 'admin');
