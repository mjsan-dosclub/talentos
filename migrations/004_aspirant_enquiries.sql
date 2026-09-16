CREATE TABLE IF NOT EXISTS aspirant_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_ref text NOT NULL UNIQUE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  institution text,
  statement text,
  status text NOT NULL DEFAULT 'NEW',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE aspirant_enquiries ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS aspirant_enquiries_created_at_idx
  ON aspirant_enquiries (created_at DESC);
