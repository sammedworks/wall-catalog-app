-- ============================================
-- COMPLETE DATABASE SCHEMA FOR WALL CATALOG
-- ============================================
-- Run this in Supabase SQL Editor to set up everything

-- ============================================
-- 1. USER PROFILES & AUTHENTICATION
-- ============================================

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. MATERIALS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Public read, admin write
DROP POLICY IF EXISTS "Anyone can view active materials" ON materials;
CREATE POLICY "Anyone can view active materials"
  ON materials FOR SELECT
  USING (is_active = true OR auth.uid() IN (
    SELECT id FROM user_profiles WHERE role = 'admin'
  ));

DROP POLICY IF EXISTS "Admins can insert materials" ON materials;
CREATE POLICY "Admins can insert materials"
  ON materials FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT id FROM user_profiles WHERE role = 'admin'
  ));

DROP POLICY IF EXISTS "Admins can update materials" ON materials;
CREATE POLICY "Admins can update materials"
  ON materials FOR UPDATE
  USING (auth.uid() IN (
    SELECT id FROM user_profiles WHERE role = 'admin'
  ));

DROP POLICY IF EXISTS "Admins can delete materials" ON materials;
CREATE POLICY "Admins can delete materials"
  ON materials FOR DELETE
  USING (auth.uid() IN (
    SELECT id FROM user_profiles WHERE role = 'admin'
  ));

-- ============================================
-- 3. DESIGN TAGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS design_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT DEFAULT 'style' CHECK (category IN ('style', 'material', 'price', 'feature', 'room', 'other')),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE design_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Public read, admin write
DROP POLICY IF EXISTS "Anyone can view active tags" ON design_tags;
CREATE POLICY "Anyone can view active tags"
  ON design_tags FOR SELECT
  USING (is_active = true OR auth.uid() IN (
    SELECT id FROM user_profiles WHERE role = 'admin'
  ));

DROP POLICY IF EXISTS "Admins can insert tags" ON design_tags;
CREATE POLICY "Admins can insert tags"
  ON design_tags FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT id FROM user_profiles WHERE role = 'admin'
  ));

DROP POLICY IF EXISTS "Admins can update tags" ON design_tags;
CREATE POLICY "Admins can update tags"
  ON design_tags FOR UPDATE
  USING (auth.uid() IN (
    SELECT id FROM user_profiles WHERE role = 'admin'
  ));

DROP POLICY IF EXISTS "Admins can delete tags" ON design_tags;
CREATE POLICY "Admins can delete tags"
  ON design_tags FOR DELETE
  USING (auth.uid() IN (
    SELECT id FROM user_profiles WHERE role = 'admin'
  ));

-- ============================================
-- 4. DESIGNS TABLE (NEW - Main Product Table)
-- ============================================

CREATE TABLE IF NOT EXISTS designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  space_category TEXT CHECK (space_category IN ('tv-unit', 'living-room', 'bedroom', 'entrance', 'study', 'mandir')),
  
  -- Images
  image_url TEXT,
  image_url_2 TEXT,
  
  -- Materials (array of material slugs)
  material_slugs TEXT[] DEFAULT '{}',
  
  -- Tags (array of tag slugs)
  tag_slugs TEXT[] DEFAULT '{}',
  
  -- Pricing
  price_range TEXT,
  
  -- Metadata
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE designs ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Public read, admin write
DROP POLICY IF EXISTS "Anyone can view active designs" ON designs;
CREATE POLICY "Anyone can view active designs"
  ON designs FOR SELECT
  USING (is_active = true OR auth.uid() IN (
    SELECT id FROM user_profiles WHERE role = 'admin'
  ));

DROP POLICY IF EXISTS "Admins can insert designs" ON designs;
CREATE POLICY "Admins can insert designs"
  ON designs FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT id FROM user_profiles WHERE role = 'admin'
  ));

DROP POLICY IF EXISTS "Admins can update designs" ON designs;
CREATE POLICY "Admins can update designs"
  ON designs FOR UPDATE
  USING (auth.uid() IN (
    SELECT id FROM user_profiles WHERE role = 'admin'
  ));

DROP POLICY IF EXISTS "Admins can delete designs" ON designs;
CREATE POLICY "Admins can delete designs"
  ON designs FOR DELETE
  USING (auth.uid() IN (
    SELECT id FROM user_profiles WHERE role = 'admin'
  ));

-- ============================================
-- 5. PRODUCTS TABLE (LEGACY - Keep for backward compatibility)
-- ============================================

-- Add missing columns to products table if they don't exist
DO $$ 
BEGIN
  -- Add material_names column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'material_names'
  ) THEN
    ALTER TABLE products ADD COLUMN material_names TEXT[] DEFAULT '{}';
  END IF;

  -- Add material_slugs column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'material_slugs'
  ) THEN
    ALTER TABLE products ADD COLUMN material_slugs TEXT[] DEFAULT '{}';
  END IF;

  -- Add tag_slugs column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'tag_slugs'
  ) THEN
    ALTER TABLE products ADD COLUMN tag_slugs TEXT[] DEFAULT '{}';
  END IF;

  -- Add space_category column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'space_category'
  ) THEN
    ALTER TABLE products ADD COLUMN space_category TEXT;
  END IF;

  -- Add is_active column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE products ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Enable RLS on products if not already enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products - Public read, admin write
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (is_active = true OR auth.uid() IN (
    SELECT id FROM user_profiles WHERE role = 'admin'
  ));

DROP POLICY IF EXISTS "Admins can insert products" ON products;
CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT id FROM user_profiles WHERE role = 'admin'
  ));

DROP POLICY IF EXISTS "Admins can update products" ON products;
CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  USING (auth.uid() IN (
    SELECT id FROM user_profiles WHERE role = 'admin'
  ));

DROP POLICY IF EXISTS "Admins can delete products" ON products;
CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  USING (auth.uid() IN (
    SELECT id FROM user_profiles WHERE role = 'admin'
  ));

-- ============================================
-- 6. ENQUIRIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'quoted', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Anyone can create enquiries" ON enquiries;
CREATE POLICY "Anyone can create enquiries"
  ON enquiries FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all enquiries" ON enquiries;
CREATE POLICY "Admins can view all enquiries"
  ON enquiries FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM user_profiles WHERE role = 'admin'
  ));

DROP POLICY IF EXISTS "Admins can update enquiries" ON enquiries;
CREATE POLICY "Admins can update enquiries"
  ON enquiries FOR UPDATE
  USING (auth.uid() IN (
    SELECT id FROM user_profiles WHERE role = 'admin'
  ));

-- ============================================
-- 7. QUOTATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id UUID REFERENCES enquiries(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  items JSONB DEFAULT '[]',
  total_amount DECIMAL(10,2),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Admins can manage quotations" ON quotations;
CREATE POLICY "Admins can manage quotations"
  ON quotations FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM user_profiles WHERE role = 'admin'
  ));

-- ============================================
-- 8. INDEXES FOR PERFORMANCE
-- ============================================

-- Materials indexes
CREATE INDEX IF NOT EXISTS idx_materials_slug ON materials(slug);
CREATE INDEX IF NOT EXISTS idx_materials_active ON materials(is_active);
CREATE INDEX IF NOT EXISTS idx_materials_order ON materials(display_order);

-- Tags indexes
CREATE INDEX IF NOT EXISTS idx_tags_slug ON design_tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_category ON design_tags(category);
CREATE INDEX IF NOT EXISTS idx_tags_active ON design_tags(is_active);

-- Designs indexes
CREATE INDEX IF NOT EXISTS idx_designs_space ON designs(space_category);
CREATE INDEX IF NOT EXISTS idx_designs_active ON designs(is_active);
CREATE INDEX IF NOT EXISTS idx_designs_featured ON designs(is_featured);
CREATE INDEX IF NOT EXISTS idx_designs_materials ON designs USING GIN(material_slugs);
CREATE INDEX IF NOT EXISTS idx_designs_tags ON designs USING GIN(tag_slugs);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_space ON products(space_category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_materials ON products USING GIN(material_slugs);

-- ============================================
-- 9. SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert sample materials
INSERT INTO materials (name, slug, description, display_order, is_active) VALUES
  ('Veneer', 'veneer', 'Natural wood veneer finish', 1, true),
  ('Laminate', 'laminate', 'Durable laminate surface', 2, true),
  ('PU Finish', 'pu-finish', 'Premium polyurethane finish', 3, true),
  ('Acrylic', 'acrylic', 'Modern acrylic panels', 4, true),
  ('Glass', 'glass', 'Tempered glass elements', 5, true),
  ('Metal', 'metal', 'Metal accents and frames', 6, true)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample tags
INSERT INTO design_tags (name, slug, category, display_order, is_active) VALUES
  ('Modern', 'modern', 'style', 1, true),
  ('Classic', 'classic', 'style', 2, true),
  ('Minimalist', 'minimalist', 'style', 3, true),
  ('Luxury', 'luxury', 'style', 4, true),
  ('Budget Friendly', 'budget-friendly', 'price', 5, true),
  ('Premium', 'premium', 'price', 6, true),
  ('LED Lighting', 'led-lighting', 'feature', 7, true),
  ('Storage', 'storage', 'feature', 8, true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 10. MAKE FIRST USER ADMIN
-- ============================================
-- Replace 'your-email@example.com' with your actual email

-- Uncomment and run this after creating your account:
-- UPDATE user_profiles SET role = 'admin' WHERE email = 'your-email@example.com';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if all tables exist
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN ('user_profiles', 'materials', 'design_tags', 'designs', 'products', 'enquiries', 'quotations')
ORDER BY table_name;

-- Check RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('user_profiles', 'materials', 'design_tags', 'designs', 'products', 'enquiries', 'quotations');

-- Check admin users
SELECT email, role, created_at FROM user_profiles WHERE role = 'admin';

-- Check sample data
SELECT 'materials' as table_name, COUNT(*) as count FROM materials
UNION ALL
SELECT 'design_tags', COUNT(*) FROM design_tags
UNION ALL
SELECT 'designs', COUNT(*) FROM designs
UNION ALL
SELECT 'products', COUNT(*) FROM products;
