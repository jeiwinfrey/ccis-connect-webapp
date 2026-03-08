-- CCIS Connect Database Schema
-- Run this in the Supabase SQL Editor to create all tables

-- ============================================================
-- 1. Users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  email       text UNIQUE NOT NULL,
  student_id  text UNIQUE,
  department  text NOT NULL DEFAULT '',
  role        text NOT NULL DEFAULT 'student'
                CHECK (role IN ('student', 'faculty', 'admin', 'super_admin')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. Equipment
-- ============================================================
CREATE TABLE IF NOT EXISTS equipment_categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  emoji       text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  color       text NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS equipment_models (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES equipment_categories(id) ON DELETE CASCADE,
  model_name  text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url   text NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS equipment_units (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id    uuid NOT NULL REFERENCES equipment_models(id) ON DELETE CASCADE,
  unit_id     text UNIQUE NOT NULL,
  condition   text NOT NULL DEFAULT 'Good'
                CHECK (condition IN ('Excellent', 'Good', 'Fair', 'Maintenance')),
  status      text NOT NULL DEFAULT 'available'
                CHECK (status IN ('available', 'on-loan', 'maintenance')),
  notes       text NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. Rooms
-- ============================================================
CREATE TABLE IF NOT EXISTS rooms (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number text UNIQUE NOT NULL,
  name        text NOT NULL,
  type        text NOT NULL DEFAULT '',
  capacity    text NOT NULL DEFAULT '',
  floor       text NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS room_availability (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id     uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_hour  integer NOT NULL CHECK (start_hour BETWEEN 0 AND 23),
  end_hour    integer NOT NULL CHECK (end_hour BETWEEN 0 AND 23),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS room_reservations (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id          uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id          uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reservation_date date NOT NULL,
  start_time       time NOT NULL,
  end_time         time NOT NULL,
  purpose          text NOT NULL DEFAULT '',
  status           text NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'accepted', 'rejected')),
  admin_notes      text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. Borrow Requests
-- ============================================================
CREATE TABLE IF NOT EXISTS borrow_requests (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  unit_id     uuid NOT NULL REFERENCES equipment_units(id) ON DELETE CASCADE,
  start_date  date NOT NULL,
  end_date    date NOT NULL,
  purpose     text NOT NULL DEFAULT '',
  status      text NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'accepted', 'rejected', 'returned')),
  admin_notes text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 5. Activity Log
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES users(id) ON DELETE SET NULL,
  action      text NOT NULL,
  detail      text NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 6. Indexes for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_equipment_models_category  ON equipment_models(category_id);
CREATE INDEX IF NOT EXISTS idx_equipment_units_model      ON equipment_units(model_id);
CREATE INDEX IF NOT EXISTS idx_equipment_units_status      ON equipment_units(status);
CREATE INDEX IF NOT EXISTS idx_room_availability_room      ON room_availability(room_id);
CREATE INDEX IF NOT EXISTS idx_room_reservations_room      ON room_reservations(room_id);
CREATE INDEX IF NOT EXISTS idx_room_reservations_user      ON room_reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_room_reservations_status    ON room_reservations(status);
CREATE INDEX IF NOT EXISTS idx_room_reservations_date      ON room_reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_borrow_requests_user        ON borrow_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_borrow_requests_unit        ON borrow_requests(unit_id);
CREATE INDEX IF NOT EXISTS idx_borrow_requests_status      ON borrow_requests(status);
CREATE INDEX IF NOT EXISTS idx_activity_log_user           ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created        ON activity_log(created_at DESC);

-- ============================================================
-- 7. Updated_at triggers
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_equipment_categories_updated_at
  BEFORE UPDATE ON equipment_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_equipment_models_updated_at
  BEFORE UPDATE ON equipment_models FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_equipment_units_updated_at
  BEFORE UPDATE ON equipment_units FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_rooms_updated_at
  BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_room_reservations_updated_at
  BEFORE UPDATE ON room_reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_borrow_requests_updated_at
  BEFORE UPDATE ON borrow_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 8. Row Level Security (RLS) - Basic policies
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrow_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Allow public read on equipment & rooms (anyone can browse)
CREATE POLICY "Public read equipment_categories"
  ON equipment_categories FOR SELECT USING (true);
CREATE POLICY "Public read equipment_models"
  ON equipment_models FOR SELECT USING (true);
CREATE POLICY "Public read equipment_units"
  ON equipment_units FOR SELECT USING (true);
CREATE POLICY "Public read rooms"
  ON rooms FOR SELECT USING (true);
CREATE POLICY "Public read room_availability"
  ON room_availability FOR SELECT USING (true);

-- Allow authenticated users to read their own data
CREATE POLICY "Users read own profile"
  ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users read own borrow requests"
  ON borrow_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users read own reservations"
  ON room_reservations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create borrow requests"
  ON borrow_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users create reservations"
  ON room_reservations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow admins full access (using service role key bypasses RLS,
-- but these policies enable admin users via the anon key too)
CREATE POLICY "Admins full access users"
  ON users FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );
CREATE POLICY "Admins full access equipment_categories"
  ON equipment_categories FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );
CREATE POLICY "Admins full access equipment_models"
  ON equipment_models FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );
CREATE POLICY "Admins full access equipment_units"
  ON equipment_units FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );
CREATE POLICY "Admins full access rooms"
  ON rooms FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );
CREATE POLICY "Admins full access room_availability"
  ON room_availability FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );
CREATE POLICY "Admins full access room_reservations"
  ON room_reservations FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );
CREATE POLICY "Admins full access borrow_requests"
  ON borrow_requests FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );
CREATE POLICY "Admins full access activity_log"
  ON activity_log FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );
CREATE POLICY "Public read activity_log"
  ON activity_log FOR SELECT USING (true);
