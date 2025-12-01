-- =====================================================
-- DATABASE UPDATES FOR 6 AREAS + FILTERS + TWO IMAGES
-- =====================================================

-- 1. ADD SECOND IMAGE COLUMN TO PRODUCTS
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS image_url_2 TEXT;

-- 2. ADD SPACE CATEGORY COLUMN TO PRODUCTS
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS space_category TEXT CHECK (space_category IN ('tv-unit', 'living-room', 'bedroom', 'entrance', 'study', 'mandir'));

-- 3. ADD TAGS COLUMN TO PRODUCTS (JSON array)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;

-- 4. CREATE MATERIALS TABLE
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    color_code TEXT NOT NULL,
    text_color TEXT DEFAULT '#374151',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CREATE TAGS TABLE
CREATE TABLE IF NOT EXISTS design_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    category TEXT, -- 'style', 'material', 'price', etc.
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. INSERT DEFAULT MATERIALS
INSERT INTO materials (name, color_code, text_color, display_order) VALUES
('Marble', '#F5F5F5', '#374151', 1),
('Wooden', '#8B4513', '#FFFFFF', 2),
('Fabric', '#E8DCC4', '#374151', 3),
('Waffle', '#D4A574', '#FFFFFF', 4),
('Grey', '#9CA3AF', '#FFFFFF', 5),
('Glass', '#DBEAFE', '#374151', 6)
ON CONFLICT (name) DO NOTHING;

-- 7. INSERT DEFAULT TAGS
INSERT INTO design_tags (name, category, display_order) VALUES
('Modern', 'style', 1),
('Classic', 'style', 2),
('Minimalist', 'style', 3),
('Luxury', 'style', 4),
('Contemporary', 'style', 5),
('Traditional', 'style', 6)
ON CONFLICT (name) DO NOTHING;

-- 8. CREATE INDEXES FOR BETTER PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_products_space_category ON products(space_category);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_materials_active ON materials(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_tags_active ON design_tags(is_active, display_order);

-- 9. UPDATE EXISTING PRODUCTS WITH DEFAULT SPACE CATEGORY
UPDATE products 
SET space_category = 'tv-unit' 
WHERE space_category IS NULL;

-- 10. CREATE FUNCTION TO UPDATE TIMESTAMP
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. CREATE TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
DROP TRIGGER IF EXISTS update_materials_updated_at ON materials;
CREATE TRIGGER update_materials_updated_at
    BEFORE UPDATE ON materials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tags_updated_at ON design_tags;
CREATE TRIGGER update_tags_updated_at
    BEFORE UPDATE ON design_tags
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 12. GRANT PERMISSIONS (adjust as needed)
-- GRANT ALL ON materials TO authenticated;
-- GRANT ALL ON design_tags TO authenticated;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check products table structure
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products';

-- Check materials
-- SELECT * FROM materials ORDER BY display_order;

-- Check tags
-- SELECT * FROM design_tags ORDER BY display_order;

-- =====================================================
-- NOTES
-- =====================================================
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. Verify all tables are created successfully
-- 3. Check that indexes are created
-- 4. Test inserting a product with new fields
-- =====================================================