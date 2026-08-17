CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE password_reset_tokens
  ADD COLUMN IF NOT EXISTS used_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can create reset tokens" ON password_reset_tokens
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can read reset tokens" ON password_reset_tokens
  FOR SELECT USING (true);

CREATE POLICY "Public can update reset tokens" ON password_reset_tokens
  FOR UPDATE USING (true);

CREATE POLICY "Public can delete reset tokens" ON password_reset_tokens
  FOR DELETE USING (true);