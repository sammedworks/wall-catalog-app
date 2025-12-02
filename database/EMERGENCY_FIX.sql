-- ============================================
-- EMERGENCY FIX SCRIPT
-- ============================================
-- Run this in Supabase SQL Editor to fix all issues
-- This will create tables and storage bucket if they don't exist

-- ============================================
-- STEP 1: CREATE TABLES
-- ============================================

-- Panel Materials Table
CREATE TABLE IF NOT EXISTS panel_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  material_type TEXT NOT NULL,
  color_code TEXT,
  rate_per_sqft DECIMAL(10,2) NOT NULL,
  description TEXT,
  image_url TEXT,
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modular Furniture Table
CREATE TABLE IF NOT EXISTS modular_furniture (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  size TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  colors TEXT[],
  description TEXT,
  image_url TEXT,
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lighting Options Table
CREATE TABLE IF NOT EXISTS lighting_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  unit TEXT DEFAULT 'piece',
  description TEXT,
  image_url TEXT,
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Installation Accessories Table
CREATE TABLE IF NOT EXISTS installation_accessories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  unit TEXT DEFAULT 'piece',
  description TEXT,
  image_url TEXT,
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pricing Config Table
CREATE TABLE IF NOT EXISTS pricing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quotations Table
CREATE TABLE IF NOT EXISTS quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  selections JSONB NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Profiles Table (if not exists)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 2: ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE panel_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE modular_furniture ENABLE ROW LEVEL SECURITY;
ALTER TABLE lighting_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE installation_accessories ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: DROP EXISTING POLICIES (IF ANY)
-- ============================================

DROP POLICY IF EXISTS "Anyone can view active panel materials" ON panel_materials;
DROP POLICY IF EXISTS "Admins can manage panel materials" ON panel_materials;
DROP POLICY IF EXISTS "Anyone can view active furniture" ON modular_furniture;
DROP POLICY IF EXISTS "Admins can manage furniture" ON modular_furniture;
DROP POLICY IF EXISTS "Anyone can view active lighting" ON lighting_options;
DROP POLICY IF EXISTS "Admins can manage lighting" ON lighting_options;
DROP POLICY IF EXISTS "Anyone can view active accessories" ON installation_accessories;
DROP POLICY IF EXISTS "Admins can manage accessories" ON installation_accessories;
DROP POLICY IF EXISTS "Anyone can view pricing config" ON pricing_config;
DROP POLICY IF EXISTS "Admins can manage pricing config" ON pricing_config;
DROP POLICY IF EXISTS "Users can view their quotations" ON quotations;
DROP POLICY IF EXISTS "Users can create quotations" ON quotations;
DROP POLICY IF EXISTS "Users can update their quotations" ON quotations;
DROP POLICY IF EXISTS "Users can view their profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their profile" ON user_profiles;

-- ============================================
-- STEP 4: CREATE NEW POLICIES
-- ============================================

-- Panel Materials Policies
CREATE POLICY "Anyone can view active panel materials"
  ON panel_materials FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage panel materials"
  ON panel_materials FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Modular Furniture Policies
CREATE POLICY "Anyone can view active furniture"
  ON modular_furniture FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage furniture"
  ON modular_furniture FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Lighting Options Policies
CREATE POLICY "Anyone can view active lighting"
  ON lighting_options FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage lighting"
  ON lighting_options FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Installation Accessories Policies
CREATE POLICY "Anyone can view active accessories"
  ON installation_accessories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage accessories"
  ON installation_accessories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Pricing Config Policies
CREATE POLICY "Anyone can view pricing config"
  ON pricing_config FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage pricing config"
  ON pricing_config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Quotations Policies
CREATE POLICY "Users can view their quotations"
  ON quotations FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "Users can create quotations"
  ON quotations FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their quotations"
  ON quotations FOR UPDATE
  USING (created_by = auth.uid());

-- User Profiles Policies
CREATE POLICY "Users can view their profile"
  ON user_profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update their profile"
  ON user_profiles FOR UPDATE
  USING (id = auth.uid());

-- ============================================
-- STEP 5: INSERT SAMPLE DATA
-- ============================================

-- Panel Materials
INSERT INTO panel_materials (name, material_type, color_code, rate_per_sqft, display_order, is_active)
VALUES
  ('Walnut Wood', 'Wood', '#5D4037', 500, 1, true),
  ('Oak Wood', 'Wood', '#8D6E63', 450, 2, true),
  ('Teak Wood', 'Wood', '#6D4C41', 550, 3, true),
  ('Italian Marble', 'Marble', '#ECEFF1', 600, 4, true),
  ('Natural Stone', 'Stone', '#78909C', 480, 5, true),
  ('Premium Paint', 'Paint', '#90CAF9', 200, 6, true)
ON CONFLICT DO NOTHING;

-- Modular Furniture
INSERT INTO modular_furniture (name, category, size, price, colors, display_order, is_active)
VALUES
  ('Grooveline Console', 'Console', '4 ft', 7999, ARRAY['White', 'Beige', 'Walnut', 'Grey', 'Black', 'Teak'], 1, true),
  ('Grooveline Console', 'Console', '5 ft', 9999, ARRAY['White', 'Beige', 'Walnut', 'Grey', 'Black', 'Teak'], 2, true),
  ('Grooveline Console', 'Console', '6 ft', 11999, ARRAY['White', 'Beige', 'Walnut', 'Grey', 'Black', 'Teak'], 3, true),
  ('Modern Cabinet', 'Cabinet', '4 ft', 12999, ARRAY['White', 'Black', 'Walnut'], 4, true),
  ('Floating Shelf', 'Shelf', '3 ft', 3999, ARRAY['White', 'Black', 'Walnut', 'Oak'], 5, true)
ON CONFLICT DO NOTHING;

-- Lighting Options
INSERT INTO lighting_options (name, category, price, unit, display_order, is_active)
VALUES
  ('Profile Light', 'Profile Light', 150, 'meter', 1, true),
  ('Cove Light', 'Cove Light', 200, 'meter', 2, true),
  ('Wall Light', 'Wall Light', 500, 'piece', 3, true),
  ('Spot Light', 'Spot Light', 300, 'piece', 4, true)
ON CONFLICT DO NOTHING;

-- Installation Accessories
INSERT INTO installation_accessories (name, category, price, unit, display_order, is_active)
VALUES
  ('Wall Mounting Kit', 'Hardware', 500, 'set', 1, true),
  ('Cable Management', 'Hardware', 300, 'set', 2, true),
  ('LED Strip', 'Lighting', 150, 'meter', 3, true),
  ('Corner Brackets', 'Hardware', 200, 'set', 4, true)
ON CONFLICT DO NOTHING;

-- Pricing Config
INSERT INTO pricing_config (config_key, config_value, description)
VALUES
  ('labour_charges', '{"base": 1500}'::jsonb, 'Base labour charges per quotation'),
  ('transportation', '{"base": 500}'::jsonb, 'Base transportation charges'),
  ('gst', '{"percentage": 18}'::jsonb, 'GST percentage')
ON CONFLICT (config_key) DO UPDATE
SET config_value = EXCLUDED.config_value;

-- ============================================
-- STEP 6: CREATE STORAGE BUCKET
-- ============================================

-- Insert storage bucket (will fail silently if exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-photos',
  'product-photos',
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- ============================================
-- STEP 7: CREATE STORAGE POLICIES
-- ============================================

-- Drop existing storage policies
DROP POLICY IF EXISTS "Public can view product photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view product photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload product photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product photos" ON storage.objects;

-- Create new storage policies
CREATE POLICY "Public can view product photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-photos');

CREATE POLICY "Authenticated users can upload product photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-photos' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Admins can update product photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-photos' AND
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete product photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-photos' AND
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- STEP 8: VERIFY SETUP
-- ============================================

-- Check tables
SELECT 
  'Tables Created' as status,
  COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'panel_materials', 
  'modular_furniture', 
  'lighting_options', 
  'installation_accessories', 
  'pricing_config', 
  'quotations',
  'user_profiles'
);

-- Check storage bucket
SELECT 
  'Storage Bucket' as status,
  id,
  name,
  public
FROM storage.buckets 
WHERE id = 'product-photos';

-- Check sample data
SELECT 'Panel Materials' as table_name, COUNT(*) as count FROM panel_materials
UNION ALL
SELECT 'Modular Furniture', COUNT(*) FROM modular_furniture
UNION ALL
SELECT 'Lighting Options', COUNT(*) FROM lighting_options
UNION ALL
SELECT 'Installation Accessories', COUNT(*) FROM installation_accessories
UNION ALL
SELECT 'Pricing Config', COUNT(*) FROM pricing_config;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ EMERGENCY FIX COMPLETED SUCCESSFULLY!';
  RAISE NOTICE '✅ All tables created';
  RAISE NOTICE '✅ All policies configured';
  RAISE NOTICE '✅ Sample data inserted';
  RAISE NOTICE '✅ Storage bucket created';
  RAISE NOTICE '✅ Storage policies configured';
  RAISE NOTICE '';
  RAISE NOTICE '📋 NEXT STEPS:';
  RAISE NOTICE '1. Set your user as admin (see below)';
  RAISE NOTICE '2. Refresh your application';
  RAISE NOTICE '3. Try uploading photos again';
END $$;

-- ============================================
-- SET YOUR USER AS ADMIN
-- ============================================
-- IMPORTANT: Replace 'your-email@example.com' with your actual email

-- First, create user profile if it doesn't exist
INSERT INTO user_profiles (id, email, role)
SELECT 
  id,
  email,
  'admin'
FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin';

-- Verify admin status
SELECT 
  email,
  role,
  'Admin status set!' as message
FROM user_profiles
WHERE email = 'your-email@example.com';
