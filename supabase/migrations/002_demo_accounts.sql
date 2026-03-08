-- ============================================================
-- Demo Accounts for CCIS Connect
-- Username = password for all accounts
-- ============================================================

-- Add username and password_hash columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS username text UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text;

-- ============================================================
-- Student accounts (format: xx-xxxxxx)
-- ============================================================
INSERT INTO users (id, name, email, student_id, username, password_hash, department, role)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Juan dela Cruz', 'juan@mmsu.edu.ph', '23-140028', '23-140028', '23-140028', 'CCIS', 'student'),
  ('00000000-0000-0000-0000-000000000002', 'Maria Santos', 'maria@mmsu.edu.ph', '22-130015', '22-130015', '22-130015', 'CCIS', 'student'),
  ('00000000-0000-0000-0000-000000000003', 'Pedro Reyes', 'pedro@mmsu.edu.ph', '24-150042', '24-150042', '24-150042', 'CCIS', 'student'),
  ('00000000-0000-0000-0000-000000000004', 'Ana Gonzales', 'ana@mmsu.edu.ph', '23-140055', '23-140055', '23-140055', 'CCIS', 'student'),
  ('00000000-0000-0000-0000-000000000005', 'Carlos Bautista', 'carlos@mmsu.edu.ph', '22-130099', '22-130099', '22-130099', 'CCIS', 'student')
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  student_id = EXCLUDED.student_id;

-- ============================================================
-- Faculty accounts (format: fac-xxxx)
-- ============================================================
INSERT INTO users (id, name, email, username, password_hash, department, role)
VALUES
  ('00000000-0000-0000-0000-000000000010', 'Prof. Elena Ramos', 'elena.ramos@mmsu.edu.ph', 'fac-0001', 'fac-0001', 'CCIS', 'faculty'),
  ('00000000-0000-0000-0000-000000000011', 'Prof. Ricardo Fernandez', 'ricardo.f@mmsu.edu.ph', 'fac-0002', 'fac-0002', 'CCIS', 'faculty'),
  ('00000000-0000-0000-0000-000000000012', 'Prof. Lucia Aquino', 'lucia.a@mmsu.edu.ph', 'fac-0003', 'fac-0003', 'CCIS', 'faculty')
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name,
  email = EXCLUDED.email;

-- ============================================================
-- Admin accounts (format: admin-xxxx)
-- ============================================================
INSERT INTO users (id, name, email, username, password_hash, department, role)
VALUES
  ('00000000-0000-0000-0000-000000000020', 'Admin User', 'admin@mmsu.edu.ph', 'admin-0001', 'admin-0001', 'CCIS', 'admin'),
  ('00000000-0000-0000-0000-000000000021', 'Super Admin', 'superadmin@mmsu.edu.ph', 'admin-0002', 'admin-0002', 'CCIS', 'super_admin')
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role;
