-- Tabla de usuarios para el panel de admin
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT,
  role TEXT DEFAULT 'freelancer',
  avatar TEXT,
  tagline TEXT,
  bio TEXT,
  location TEXT,
  skills TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

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
