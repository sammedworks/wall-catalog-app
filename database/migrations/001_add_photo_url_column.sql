-- Migration: Add photo_url column to panel_materials
-- This ensures consistency with the frontend code

-- Add photo_url column if it doesn't exist
ALTER TABLE panel_materials 
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Copy data from image_url to photo_url if image_url exists
UPDATE panel_materials 
SET photo_url = image_url 
WHERE image_url IS NOT NULL AND photo_url IS NULL;

-- Optional: Drop image_url column if you want to clean up
-- ALTER TABLE panel_materials DROP COLUMN IF EXISTS image_url;

-- Add photo_url to modular_furniture as well
ALTER TABLE modular_furniture 
ADD COLUMN IF NOT EXISTS photo_url TEXT;

UPDATE modular_furniture 
SET photo_url = image_url 
WHERE image_url IS NOT NULL AND photo_url IS NULL;

-- Add photo_url to lighting_options
ALTER TABLE lighting_options 
ADD COLUMN IF NOT EXISTS photo_url TEXT;

UPDATE lighting_options 
SET photo_url = image_url 
WHERE image_url IS NOT NULL AND photo_url IS NULL;

-- Add photo_url to installation_accessories
ALTER TABLE installation_accessories 
ADD COLUMN IF NOT EXISTS photo_url TEXT;

UPDATE installation_accessories 
SET photo_url = image_url 
WHERE image_url IS NOT NULL AND photo_url IS NULL;

-- Create storage bucket for product photos if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-photos', 'product-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Public can view product photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-photos');

CREATE POLICY "Admins can upload product photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-photos' AND
  auth.uid() IN (
    SELECT id FROM user_profiles WHERE role = 'admin'
  )
);

CREATE POLICY "Admins can update product photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-photos' AND
  auth.uid() IN (
    SELECT id FROM user_profiles WHERE role = 'admin'
  )
);

CREATE POLICY "Admins can delete product photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-photos' AND
  auth.uid() IN (
    SELECT id FROM user_profiles WHERE role = 'admin'
  )
);
