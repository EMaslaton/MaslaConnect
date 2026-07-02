-- Add phone contact fields to users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone_country TEXT,
  ADD COLUMN IF NOT EXISTS phone_dial_code TEXT,
  ADD COLUMN IF NOT EXISTS phone_number TEXT;