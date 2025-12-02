-- =====================================================
-- WALL CATALOG DATABASE CLEANUP & MERGE MIGRATION
-- =====================================================
-- This migration removes old structures and consolidates
-- everything into a single Designs Library system
-- =====================================================

-- Step 1: Drop old tables (if they exist)
-- =====================================================

-- Drop design_tags junction table
DROP TABLE IF EXISTS design_tags CASCADE;

-- Drop tags table
DROP TABLE IF EXISTS tags CASCADE;

-- Drop old designs table (if separate from products)
DROP TABLE IF EXISTS designs CASCADE;

-- =====================================================
-- Step 2: Ensure products table has correct structure
-- =====================================================

-- Add missing columns if they don't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS space_category VARCHAR(50),
ADD COLUMN IF NOT EXISTS material_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS style_category VARCHAR(50),
ADD COLUMN IF NOT EXISTS lighting_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Remove old/unused columns (if they exist)
ALTER TABLE products 
DROP COLUMN IF EXISTS room_type,
DROP COLUMN IF EXISTS finish_type,
DROP COLUMN IF EXISTS sku;

-- =====================================================
-- Step 3: Create/Update supporting tables
-- =====================================================

-- Spaces table
CREATE TABLE IF NOT EXISTS spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  icon VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Looks table
CREATE TABLE IF NOT EXISTS looks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7),
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Materials table
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Filters table
CREATE TABLE IF NOT EXISTS filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(50),
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Slider items table
CREATE TABLE IF NOT EXISTS slider_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- Step 4: Insert default data
-- =====================================================

-- Default Spaces
INSERT INTO spaces (name, slug, icon, display_order) VALUES
('TV Unit', 'tv-unit', '📺', 1),
('Living Room', 'living-room', '🛋️', 2),
('Bedroom', 'bedroom', '🛏️', 3),
('Entrance', 'entrance', '🚪', 4),
('Study', 'study', '📚', 5),
('Mandir', 'mandir', '🕉️', 6)
ON CONFLICT (slug) DO NOTHING;

-- Default Looks
INSERT INTO looks (name, slug, color, display_order) VALUES
('Wood', 'wood', '#8B4513', 1),
('Marble', 'marble', '#F5F5F5', 2),
('Rattan', 'rattan', '#D2B48C', 3),
('Fabric', 'fabric', '#E6E6FA', 4),
('Limewash', 'limewash', '#F0EAD6', 5),
('Pastel', 'pastel', '#FFB6C1', 6),
('Stone', 'stone', '#808080', 7),
('Gold', 'gold', '#FFD700', 8),
('Traditional', 'traditional', '#8B0000', 9)
ON CONFLICT (slug) DO NOTHING;

-- Default Budget Categories (as filters)
INSERT INTO filters (name, slug, category, display_order) VALUES
('Economy', 'economy', 'budget', 1),
('Minimal', 'minimal', 'budget', 2),
('Luxe', 'luxe', 'budget', 3),
('Statement', 'statement', 'budget', 4)
ON CONFLICT (slug) DO NOTHING;

-- Default Lighting Types (as filters)
INSERT INTO filters (name, slug, category, display_order) VALUES
('Cove Light', 'cove-light', 'lighting', 1),
('Profile Light', 'profile-light', 'lighting', 2),
('Wall Washer Light', 'wall-washer-light', 'lighting', 3)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- Step 5: Create indexes for performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_products_space ON products(space_category);
CREATE INDEX IF NOT EXISTS idx_products_material ON products(material_type);
CREATE INDEX IF NOT EXISTS idx_products_style ON products(style_category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_spaces_slug ON spaces(slug);
CREATE INDEX IF NOT EXISTS idx_spaces_active ON spaces(is_active);

CREATE INDEX IF NOT EXISTS idx_looks_slug ON looks(slug);
CREATE INDEX IF NOT EXISTS idx_looks_active ON looks(is_active);

CREATE INDEX IF NOT EXISTS idx_materials_slug ON materials(slug);
CREATE INDEX IF NOT EXISTS idx_materials_active ON materials(is_active);

CREATE INDEX IF NOT EXISTS idx_filters_category ON filters(category);
CREATE INDEX IF NOT EXISTS idx_filters_active ON filters(is_active);

-- =====================================================
-- Step 6: Create updated_at trigger
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_spaces_updated_at ON spaces;
CREATE TRIGGER update_spaces_updated_at BEFORE UPDATE ON spaces
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_looks_updated_at ON looks;
CREATE TRIGGER update_looks_updated_at BEFORE UPDATE ON looks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_materials_updated_at ON materials;
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_filters_updated_at ON filters;
CREATE TRIGGER update_filters_updated_at BEFORE UPDATE ON filters
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_slider_items_updated_at ON slider_items;
CREATE TRIGGER update_slider_items_updated_at BEFORE UPDATE ON slider_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Step 7: Enable Row Level Security (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE looks ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE slider_items ENABLE ROW LEVEL SECURITY;

-- Public read access for active items
CREATE POLICY "Public can view active products" ON products
FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active spaces" ON spaces
FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active looks" ON looks
FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active materials" ON materials
FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active filters" ON filters
FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active slider items" ON slider_items
FOR SELECT USING (is_active = true);

-- Admin full access (requires user_profiles table with role column)
CREATE POLICY "Admins have full access to products" ON products
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

CREATE POLICY "Admins have full access to spaces" ON spaces
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

CREATE POLICY "Admins have full access to looks" ON looks
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

CREATE POLICY "Admins have full access to materials" ON materials
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

CREATE POLICY "Admins have full access to filters" ON filters
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

CREATE POLICY "Admins have full access to slider items" ON slider_items
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Summary:
-- ✅ Removed: tags, design_tags, old designs tables
-- ✅ Updated: products table structure
-- ✅ Created: spaces, looks, materials, filters, slider_items
-- ✅ Added: indexes for performance
-- ✅ Added: updated_at triggers
-- ✅ Added: Row Level Security policies
-- ✅ Inserted: default data for spaces, looks, filters
-- =====================================================
