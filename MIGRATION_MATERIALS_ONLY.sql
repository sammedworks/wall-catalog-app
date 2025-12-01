-- =====================================================
-- MATERIALS TABLE ONLY - Simple Migration
-- Just creates materials table for the slider
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CREATE MATERIALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Info
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  
  -- Visual
  thumbnail_url TEXT,
  color_code TEXT DEFAULT '#F5F5F5',
  text_color TEXT DEFAULT '#374151',
  
  -- Display
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 2. INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_materials_active ON materials(is_active);
CREATE INDEX IF NOT EXISTS idx_materials_display_order ON materials(display_order);
CREATE INDEX IF NOT EXISTS idx_materials_slug ON materials(slug);

-- =====================================================
-- 3. AUTO-GENERATE SLUG TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION generate_material_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := LOWER(REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
    NEW.slug := TRIM(BOTH '-' FROM NEW.slug);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_material_slug ON materials;
CREATE TRIGGER set_material_slug
  BEFORE INSERT OR UPDATE ON materials
  FOR EACH ROW
  EXECUTE FUNCTION generate_material_slug();

-- =====================================================
-- 4. UPDATE TIMESTAMP TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION update_materials_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_materials_timestamp ON materials;
CREATE TRIGGER update_materials_timestamp
  BEFORE UPDATE ON materials
  FOR EACH ROW
  EXECUTE FUNCTION update_materials_timestamp();

-- =====================================================
-- 5. INSERT DEFAULT MATERIALS
-- =====================================================

-- Clear existing materials (if any)
TRUNCATE TABLE materials CASCADE;

-- Insert 10 default materials with Unsplash images
INSERT INTO materials (name, slug, description, thumbnail_url, color_code, display_order, is_active, is_featured) VALUES
('Marble', 'marble', 'Elegant marble finish with natural veining', 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=400&h=400&fit=crop', '#F5E6D3', 1, true, true),
('Marble Luxe', 'marble-luxe', 'Premium marble with gold accents', 'https://images.unsplash.com/photo-1618219944342-824e40a13285?w=400&h=400&fit=crop', '#E8DCC8', 2, true, true),
('Wooden', 'wooden', 'Natural wood grain texture', 'https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=400&h=400&fit=crop', '#8B6F47', 3, true, true),
('Fabric', 'fabric', 'Soft fabric texture panels', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop', '#D4C5B9', 4, true, false),
('Waffle', 'waffle', 'Textured waffle pattern', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&h=400&fit=crop', '#C8B8A8', 5, true, false),
('Grey', 'grey', 'Modern grey concrete finish', 'https://images.unsplash.com/photo-1615875474908-f403116f5287?w=400&h=400&fit=crop', '#9CA3AF', 6, true, false),
('White', 'white', 'Clean white minimalist', 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=400&h=400&fit=crop', '#F9FAFB', 7, true, false),
('Glass', 'glass', 'Sleek glass panels', 'https://images.unsplash.com/photo-1618221381711-42ca8ab6e908?w=400&h=400&fit=crop', '#E0F2FE', 8, true, false),
('Metal', 'metal', 'Industrial metal finish', 'https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=400&h=400&fit=crop', '#94A3B8', 9, true, false),
('Stone', 'stone', 'Natural stone texture', 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=400&h=400&fit=crop', '#78716C', 10, true, false);

-- =====================================================
-- 6. ADD MATERIAL_NAMES TO PRODUCTS (if products table exists)
-- =====================================================

-- Check if products table exists and add material_names column
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products') THEN
    -- Add material_names column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'material_names') THEN
      ALTER TABLE products ADD COLUMN material_names TEXT[];
    END IF;
    
    -- Create GIN index for fast filtering
    CREATE INDEX IF NOT EXISTS idx_products_material_names ON products USING GIN(material_names);
    
    RAISE NOTICE 'Products table updated with material_names column';
  ELSE
    RAISE NOTICE 'Products table does not exist - skipping material_names column';
  END IF;
END $$;

-- =====================================================
-- 7. VERIFY INSTALLATION
-- =====================================================

-- Show results
SELECT 'Materials table created' as status, COUNT(*) as material_count FROM materials;
SELECT 'Active materials' as status, COUNT(*) as active_count FROM materials WHERE is_active = true;

-- Show all materials
SELECT 
  name,
  slug,
  display_order,
  is_active,
  is_featured,
  CASE WHEN thumbnail_url IS NOT NULL THEN '✓ Has Image' ELSE '✗ No Image' END as image_status
FROM materials 
ORDER BY display_order;
