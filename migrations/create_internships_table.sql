-- Internships table for MaslaConnect pasantías module
CREATE TABLE IF NOT EXISTS internships (
  id TEXT PRIMARY KEY DEFAULT ('int_' || gen_random_uuid()::text),
  company_id TEXT NOT NULL,
  company_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  field TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  stipend TEXT,
  duration TEXT NOT NULL,
  modality TEXT NOT NULL CHECK (modality IN ('presencial', 'remoto', 'hibrido')),
  location TEXT NOT NULL,
  requirements TEXT,
  school_info TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  external_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS internship_applications (
  id TEXT PRIMARY KEY DEFAULT ('app_' || gen_random_uuid()::text),
  internship_id TEXT NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
  internship_title TEXT NOT NULL,
  company_id TEXT NOT NULL,
  company_name TEXT NOT NULL,
  applicant_id TEXT NOT NULL,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  cover_letter TEXT,
  school TEXT,
  degree TEXT,
  documents_ready BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'applied',
  match_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_internships_company ON internships(company_id);
CREATE INDEX IF NOT EXISTS idx_internships_field ON internships(field);
CREATE INDEX IF NOT EXISTS idx_internships_status ON internships(status);
CREATE INDEX IF NOT EXISTS idx_applications_internship ON internship_applications(internship_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant ON internship_applications(applicant_id);

ALTER TABLE internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view open internships"
  ON internships FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create internships"
  ON internships FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view applications"
  ON internship_applications FOR SELECT USING (true);

CREATE POLICY "Authenticated users can apply"
  ON internship_applications FOR INSERT WITH CHECK (true);
