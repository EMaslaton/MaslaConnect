-- Migration: Add user_name column to services table
-- Purpose: Store the name of the user who published the service
-- This allows displaying the real username instead of a generic "Profesional"

ALTER TABLE services ADD COLUMN IF NOT EXISTS user_name TEXT;

-- Create index for faster lookups if needed
CREATE INDEX IF NOT EXISTS idx_services_user_id_user_name 
ON services(user_id, user_name);

-- Update RLS policy to allow users to see user_name
-- The user_name is public information, so it doesn't need extra restrictions
