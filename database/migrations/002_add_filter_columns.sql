-- Migration: Add filter columns to products table
-- This enables material type and style filtering

-- Add material_type column
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS material_type TEXT;

-- Add style_category column
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS style_category TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_material_type ON products(material_type);
CREATE INDEX IF NOT EXISTS idx_products_style_category ON products(style_category);
CREATE INDEX IF NOT EXISTS idx_products_space_category ON products(space_category);

-- Update existing products with default values (optional)
UPDATE products 
SET material_type = 'Wood' 
WHERE material_type IS NULL;

UPDATE products 
SET style_category = 'Minimal' 
WHERE style_category IS NULL;

-- Add check constraints for valid values
ALTER TABLE products 
ADD CONSTRAINT check_material_type 
CHECK (material_type IN ('Wood', 'Marble', 'Rattan', 'Fabric', 'Leather', 'Stone', 'Metal', 'Glass'));

ALTER TABLE products 
ADD CONSTRAINT check_style_category 
CHECK (style_category IN ('Economy', 'Luxe', 'Minimal', 'Statement', 'Modern', 'Classic'));

-- Verify changes
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('material_type', 'style_category');

-- Show sample data
SELECT 
  name,
  material_type,
  style_category,
  space_category
FROM products 
LIMIT 5;
