# 🔧 Complete Setup & Fixes Guide

## 🚀 **WHAT'S BEEN FIXED**

### ✅ **1. Single-Page Quotation Builder**
- ❌ **OLD:** Multi-stage pipeline with navigation
- ✅ **NEW:** Single-page with collapsible sections
- **Main Focus:** Panel section appears first with prominent styling

### ✅ **2. Panel Section with Photos**
- ✅ Photo preview for each panel material
- ✅ Fallback to color block if no photo
- ✅ 1-4 panels support with independent sq.ft values
- ✅ Rate per sq.ft controlled by admin
- ✅ Real-time cost calculation

### ✅ **3. PDF Export**
- ✅ "Export PDF" button in header
- ✅ Includes all selections with photos
- ✅ Complete cost breakdown
- ✅ Customer details
- ✅ Professional formatting

### ✅ **4. Admin Panel Fixes**
- ✅ Photo upload functionality
- ✅ All CRUD operations working
- ✅ Proper error handling with console logs
- ✅ Form validation
- ✅ Success/error messages

### ✅ **5. Show/Hide Toggle**
- ✅ `is_active` field controls visibility
- ✅ Inactive items hidden from frontend
- ✅ Admin can toggle instantly

### ✅ **6. Data Sync & Performance**
- ✅ All selections sync with backend
- ✅ Loading states for all operations
- ✅ Error handling throughout
- ✅ Console logging for debugging

---

## 📋 **SETUP INSTRUCTIONS**

### **Step 1: Run Database Migration**

```sql
-- Go to Supabase SQL Editor
-- Run this migration:

-- Add photo_url columns
ALTER TABLE panel_materials ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE modular_furniture ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE lighting_options ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE installation_accessories ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-photos', 'product-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
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
```

### **Step 2: Install Dependencies**

```bash
npm install
# or
yarn install
```

**New dependencies added:**
- `jspdf` - PDF generation
- `html2canvas` - HTML to canvas conversion
- `lucide-react` - Icons

### **Step 3: Deploy to Vercel**

```bash
# Push to GitHub (auto-deploys)
git add .
git commit -m "Complete quotation builder rebuild"
git push origin main

# Or deploy manually
vercel --prod
```

### **Step 4: Set Admin Role**

```sql
-- In Supabase SQL Editor
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

### **Step 5: Test Everything**

1. **Admin Panel:** `/admin/quotation-settings`
   - Add panel material with photo
   - Verify CRUD operations
   - Update pricing config

2. **Quotation Builder:** `/quotation-builder`
   - Select panels
   - Add furniture/lighting/accessories
   - Export PDF
   - Save quotation

---

## 🐛 **TROUBLESHOOTING**

### **Issue 1: Admin Panel Not Loading**

**Symptoms:**
- Blank page
- "Loading admin panel..." forever
- Console errors

**Solutions:**

1. **Check User Role:**
```sql
SELECT email, role FROM user_profiles WHERE email = 'your-email';
```

2. **Check RLS Policies:**
```sql
-- Verify policies exist
SELECT * FROM pg_policies WHERE tablename = 'panel_materials';
```

3. **Check Browser Console:**
- Open DevTools (F12)
- Look for errors in Console tab
- Check Network tab for failed requests

4. **Verify Supabase Connection:**
```javascript
// In browser console
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
```

### **Issue 2: Photo Upload Not Working**

**Symptoms:**
- "Failed to upload photo" error
- Upload button does nothing
- Photos don't appear

**Solutions:**

1. **Check Storage Bucket:**
```sql
-- Verify bucket exists
SELECT * FROM storage.buckets WHERE id = 'product-photos';
```

2. **Check Storage Policies:**
```sql
-- List all storage policies
SELECT * FROM storage.policies WHERE bucket_id = 'product-photos';
```

3. **Verify File Size:**
- Max file size: 50MB (Supabase default)
- Recommended: < 5MB for photos

4. **Check File Type:**
- Supported: JPG, PNG, GIF, WebP
- Not supported: SVG, TIFF, BMP

5. **Console Logs:**
```javascript
// Check these logs in browser console:
// "Uploading file: panels/1234567890.jpg"
// "Upload successful: { path: '...' }"
// "Public URL: https://..."
```

### **Issue 3: CRUD Operations Not Working**

**Symptoms:**
- "Failed to save" error
- Items not appearing after save
- Delete not working

**Solutions:**

1. **Check Console Logs:**
```javascript
// Look for these logs:
// "Saving to table: panel_materials"
// "Data: { name: '...', ... }"
// "Insert successful" or "Update successful"
```

2. **Verify Table Permissions:**
```sql
-- Check if user can insert
INSERT INTO panel_materials (name, material_type, rate_per_sqft)
VALUES ('Test', 'Wood', 100);

-- If error, check RLS policies
```

3. **Check Required Fields:**
- Panel Materials: name, material_type, rate_per_sqft
- Furniture: name, size, price
- Lighting: name, category, price
- Accessories: name, price, unit

4. **Verify Data Types:**
```javascript
// Correct:
rate_per_sqft: 500 (number)
colors: ['White', 'Black'] (array)
is_active: true (boolean)

// Incorrect:
rate_per_sqft: "500" (string)
colors: "White, Black" (string)
is_active: "true" (string)
```

### **Issue 4: Items Not Showing in Quotation Builder**

**Symptoms:**
- Empty sections
- "No items found"
- Items added in admin but not visible

**Solutions:**

1. **Check `is_active` Status:**
```sql
-- Verify items are active
SELECT name, is_active FROM panel_materials;

-- Activate all items
UPDATE panel_materials SET is_active = true;
```

2. **Check RLS Policies:**
```sql
-- Public should be able to view active items
CREATE POLICY "Anyone can view active panel materials"
  ON panel_materials FOR SELECT
  USING (is_active = true);
```

3. **Clear Browser Cache:**
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Or clear cache in DevTools

4. **Check API Response:**
```javascript
// In browser console on quotation builder page:
// Look for: "Loading all data..."
// Should see: "Panels response: { data: [...], error: null }"
```

### **Issue 5: PDF Export Not Working**

**Symptoms:**
- "Failed to generate PDF" error
- PDF downloads but is blank
- PDF missing content

**Solutions:**

1. **Check Dependencies:**
```bash
npm list jspdf html2canvas
# Should show installed versions
```

2. **Verify Selections:**
- At least one panel must be selected
- Panel must have material and area > 0

3. **Check Console Errors:**
```javascript
// Look for:
// "Error generating PDF: ..."
```

4. **Browser Compatibility:**
- Works best in Chrome/Edge
- May have issues in Safari/Firefox
- Try different browser

### **Issue 6: Pricing Not Calculating**

**Symptoms:**
- Total shows ₹0
- Costs not updating
- Wrong calculations

**Solutions:**

1. **Check Pricing Config:**
```sql
SELECT * FROM pricing_config;

-- Should have:
-- labour_charges: { "base": 1500 }
-- transportation: { "base": 500 }
-- gst: { "percentage": 18 }
```

2. **Verify Panel Selection:**
- Material must be selected
- Area must be > 0
- Rate per sq.ft must be set

3. **Check Console:**
```javascript
// Look for calculation logs
console.log('Panel cost:', calculatePanelCost());
console.log('Total:', calculateTotals());
```

### **Issue 7: Data Not Persisting After Refresh**

**Symptoms:**
- Selections lost on page refresh
- Have to start over

**Solutions:**

1. **Save Quotation:**
- Click "Save Quote" button
- Quotation saved to database
- Can retrieve later

2. **Use Browser Storage (Future Enhancement):**
```javascript
// Save to localStorage
localStorage.setItem('quotation_draft', JSON.stringify(selections));

// Retrieve on load
const draft = JSON.parse(localStorage.getItem('quotation_draft'));
```

---

## 🔍 **DEBUGGING CHECKLIST**

### **Admin Panel:**
- [ ] Can access `/admin/quotation-settings`
- [ ] See all 5 tabs
- [ ] Can click "Add Material"
- [ ] Form opens
- [ ] Can upload photo
- [ ] Photo preview appears
- [ ] Can fill all fields
- [ ] "Save Material" button enabled
- [ ] Click save
- [ ] See "Saved successfully!" message
- [ ] Item appears in table
- [ ] Can click "Edit"
- [ ] Form pre-filled with data
- [ ] Can modify fields
- [ ] Save works
- [ ] Changes reflect in table
- [ ] Can click "Delete"
- [ ] Confirmation dialog appears
- [ ] Item removed from table

### **Quotation Builder:**
- [ ] Can access `/quotation-builder`
- [ ] See "Wall Panels" section
- [ ] Section expanded by default
- [ ] See panel materials grid
- [ ] Photos/colors visible
- [ ] Can select material in dropdown
- [ ] Can enter area
- [ ] Cost calculates automatically
- [ ] Can add more panels (up to 4)
- [ ] Can remove panels
- [ ] Total updates in header
- [ ] Can expand other sections
- [ ] Can select furniture/lighting/accessories
- [ ] Quantities work
- [ ] Colors work (furniture)
- [ ] Summary shows all costs
- [ ] Can enter customer details
- [ ] "Save Quote" button works
- [ ] "Export PDF" button works
- [ ] PDF downloads
- [ ] PDF contains all data

---

## 📊 **CONSOLE LOG REFERENCE**

### **Expected Logs (Admin Panel):**

```javascript
// On page load:
"Loading all data..."
"Panels response: { data: [...], error: null }"
"Furniture response: { data: [...], error: null }"
"Lighting response: { data: [...], error: null }"
"Accessories response: { data: [...], error: null }"
"Config response: { data: [...], error: null }"
"Data loaded successfully"

// On add/edit:
"Opening new form"
"Opening edit form for: { id: '...', name: '...' }"

// On photo upload:
"Uploading file: panels/1234567890.jpg"
"Upload successful: { path: '...' }"
"Public URL: https://..."

// On save:
"Saving to table: panel_materials"
"Data: { name: '...', material_type: '...', ... }"
"Insert successful" or "Update successful"

// On delete:
"Deleting from table: panel_materials ID: ..."
"Delete successful"
```

### **Expected Logs (Quotation Builder):**

```javascript
// On page load:
"Loading all data..."
"Panels response: { data: [...], error: null }"
// ... (same as admin)

// On selection:
"Panel updated: { id: 1, materialId: '...', area: 100 }"
"Calculating costs..."
"Panel cost: 50000"
"Total: 58000"
```

---

## ✅ **VERIFICATION STEPS**

### **1. Verify Database Setup:**

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('panel_materials', 'modular_furniture', 'lighting_options', 'installation_accessories', 'pricing_config', 'quotations');

-- Check photo_url columns exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'panel_materials' AND column_name = 'photo_url';

-- Check storage bucket
SELECT * FROM storage.buckets WHERE id = 'product-photos';

-- Check storage policies
SELECT * FROM storage.policies WHERE bucket_id = 'product-photos';
```

### **2. Verify Admin Access:**

```sql
-- Check user role
SELECT email, role FROM user_profiles WHERE email = 'your-email';

-- Should return: role = 'admin'
```

### **3. Verify Sample Data:**

```sql
-- Check panel materials
SELECT COUNT(*) FROM panel_materials;
-- Should return: 6 (or more if you added)

-- Check active items
SELECT COUNT(*) FROM panel_materials WHERE is_active = true;
-- Should match total or be less if some inactive
```

### **4. Verify Frontend:**

1. Open browser DevTools (F12)
2. Go to Console tab
3. Visit `/admin/quotation-settings`
4. Should see: "Loading all data..." → "Data loaded successfully"
5. Visit `/quotation-builder`
6. Should see same logs
7. No red errors

---

## 🎯 **QUICK FIXES**

### **Fix 1: Reset Everything**

```sql
-- Delete all data (CAUTION!)
TRUNCATE panel_materials, modular_furniture, lighting_options, installation_accessories, quotations CASCADE;

-- Re-run schema
-- Copy from database/QUOTATION_SCHEMA.sql
```

### **Fix 2: Reset Storage**

```sql
-- Delete storage bucket
DELETE FROM storage.buckets WHERE id = 'product-photos';

-- Re-create
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-photos', 'product-photos', true);

-- Re-create policies
-- (Copy from migration file)
```

### **Fix 3: Reset User Role**

```sql
-- Set as admin
UPDATE user_profiles SET role = 'admin' WHERE email = 'your-email';

-- Verify
SELECT email, role FROM user_profiles WHERE email = 'your-email';
```

### **Fix 4: Clear Browser Data**

1. Open DevTools (F12)
2. Go to Application tab
3. Clear Storage:
   - Local Storage
   - Session Storage
   - Cookies
   - Cache
4. Hard refresh: Ctrl+Shift+R

---

## 📞 **SUPPORT**

### **Still Having Issues?**

1. **Check Console Logs:**
   - Open DevTools (F12)
   - Console tab
   - Copy all errors

2. **Check Network Tab:**
   - DevTools → Network
   - Look for failed requests (red)
   - Click on failed request
   - Check Response tab

3. **Check Supabase Logs:**
   - Go to Supabase Dashboard
   - Logs section
   - Look for errors

4. **Provide Details:**
   - What were you trying to do?
   - What happened instead?
   - Any error messages?
   - Console logs?
   - Screenshots?

---

## 🎉 **SUCCESS CRITERIA**

You know everything is working when:

✅ Admin panel loads without errors
✅ Can add panel material with photo
✅ Photo appears in table
✅ Can edit and delete items
✅ Quotation builder loads
✅ Panel materials show with photos
✅ Can select panels and enter areas
✅ Costs calculate correctly
✅ Can add furniture/lighting/accessories
✅ Total updates in real-time
✅ Can save quotation
✅ Can export PDF
✅ PDF contains all data

**If all above work → System is fully functional!** 🚀
