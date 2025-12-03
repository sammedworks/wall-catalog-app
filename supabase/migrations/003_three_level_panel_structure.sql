-- =====================================================
-- THREE-LEVEL PANEL STRUCTURE MIGRATION
-- Material → Series → Panel Types
-- =====================================================

-- 1. Create Material Series Table
CREATE TABLE IF NOT EXISTS material_series (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(material_id, slug)
);

-- 2. Create Panel Types Table
CREATE TABLE IF NOT EXISTS panel_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  series_id UUID REFERENCES material_series(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  photo_url TEXT,
  rate_per_sqft DECIMAL(10,2) NOT NULL,
  color_code TEXT,
  finish_type TEXT, -- matte, glossy, textured, satin
  thickness_mm DECIMAL(5,2),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(series_id, slug)
);

-- 3. Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_material_series_material_id ON material_series(material_id);
CREATE INDEX IF NOT EXISTS idx_material_series_active ON material_series(is_active);
CREATE INDEX IF NOT EXISTS idx_panel_types_series_id ON panel_types(series_id);
CREATE INDEX IF NOT EXISTS idx_panel_types_active ON panel_types(is_active);

-- 4. Add RLS Policies
ALTER TABLE material_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE panel_types ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to material_series"
  ON material_series FOR SELECT
  USING (is_active = true);

CREATE POLICY "Allow public read access to panel_types"
  ON panel_types FOR SELECT
  USING (is_active = true);

-- Allow authenticated users full access (for admin)
CREATE POLICY "Allow authenticated full access to material_series"
  ON material_series FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated full access to panel_types"
  ON panel_types FOR ALL
  USING (auth.role() = 'authenticated');

-- 5. Create Updated At Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_material_series_updated_at
  BEFORE UPDATE ON material_series
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_panel_types_updated_at
  BEFORE UPDATE ON panel_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. Insert Sample Data (Optional - for testing)

-- Sample Material (if not exists)
INSERT INTO materials (name, slug, description, color_code, category, display_order, is_active)
VALUES 
  ('Wood', 'wood', 'Premium wood panels for elegant interiors', '#8B4513', 'material', 1, true),
  ('Glass', 'glass', 'Modern glass panels for contemporary spaces', '#E0F7FA', 'material', 2, true),
  ('Metal', 'metal', 'Industrial metal panels for modern aesthetics', '#9E9E9E', 'material', 3, true)
ON CONFLICT (slug) DO NOTHING;

-- Sample Series for Wood
INSERT INTO material_series (material_id, name, slug, description, display_order, is_active)
SELECT 
  m.id,
  'Premium Oak Series',
  'premium-oak-series',
  'High-quality oak panels with natural finish',
  1,
  true
FROM materials m WHERE m.slug = 'wood'
ON CONFLICT (material_id, slug) DO NOTHING;

INSERT INTO material_series (material_id, name, slug, description, display_order, is_active)
SELECT 
  m.id,
  'Walnut Collection',
  'walnut-collection',
  'Rich walnut panels for luxury interiors',
  2,
  true
FROM materials m WHERE m.slug = 'wood'
ON CONFLICT (material_id, slug) DO NOTHING;

-- Sample Panel Types for Premium Oak Series
INSERT INTO panel_types (series_id, name, slug, rate_per_sqft, finish_type, thickness_mm, display_order, is_active)
SELECT 
  ms.id,
  'Natural Oak Panel',
  'natural-oak-panel',
  450.00,
  'matte',
  18.00,
  1,
  true
FROM material_series ms WHERE ms.slug = 'premium-oak-series'
ON CONFLICT (series_id, slug) DO NOTHING;

INSERT INTO panel_types (series_id, name, slug, rate_per_sqft, finish_type, thickness_mm, display_order, is_active)
SELECT 
  ms.id,
  'Dark Oak Panel',
  'dark-oak-panel',
  480.00,
  'glossy',
  18.00,
  2,
  true
FROM material_series ms WHERE ms.slug = 'premium-oak-series'
ON CONFLICT (series_id, slug) DO NOTHING;

INSERT INTO panel_types (series_id, name, slug, rate_per_sqft, finish_type, thickness_mm, display_order, is_active)
SELECT 
  ms.id,
  'White Oak Panel',
  'white-oak-panel',
  500.00,
  'matte',
  18.00,
  3,
  true
FROM material_series ms WHERE ms.slug = 'premium-oak-series'
ON CONFLICT (series_id, slug) DO NOTHING;

-- Sample Panel Types for Walnut Collection
INSERT INTO panel_types (series_id, name, slug, rate_per_sqft, finish_type, thickness_mm, display_order, is_active)
SELECT 
  ms.id,
  'Classic Walnut Panel',
  'classic-walnut-panel',
  550.00,
  'satin',
  20.00,
  1,
  true
FROM material_series ms WHERE ms.slug = 'walnut-collection'
ON CONFLICT (series_id, slug) DO NOTHING;

INSERT INTO panel_types (series_id, name, slug, rate_per_sqft, finish_type, thickness_mm, display_order, is_active)
SELECT 
  ms.id,
  'Premium Walnut Panel',
  'premium-walnut-panel',
  600.00,
  'glossy',
  20.00,
  2,
  true
FROM material_series ms WHERE ms.slug = 'walnut-collection'
ON CONFLICT (series_id, slug) DO NOTHING;

-- 7. Comments for Documentation
COMMENT ON TABLE material_series IS 'Series/collections within each material category';
COMMENT ON TABLE panel_types IS 'Individual panel types with pricing within each series';
COMMENT ON COLUMN panel_types.rate_per_sqft IS 'Price per square foot in INR';
COMMENT ON COLUMN panel_types.finish_type IS 'Surface finish: matte, glossy, textured, satin';
COMMENT ON COLUMN panel_types.thickness_mm IS 'Panel thickness in millimeters';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- 
-- Structure Created:
-- 1. material_series table (linked to materials)
-- 2. panel_types table (linked to material_series)
-- 3. Indexes for performance
-- 4. RLS policies for security
-- 5. Updated_at triggers
-- 6. Sample data for testing
--
-- Next Steps:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Update Admin Panel to manage series and panel types
-- 3. Update Quotation Builder to use three-level structure
-- =====================================================
