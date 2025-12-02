# 🚨 EMERGENCY FIX - Photo Upload Not Working

## **Your Errors:**
1. ❌ `"Could not find the table 'public.panel_materials' in the schema cache"`
2. ❌ `"Failed to upload image: Bucket not found"`

## **Root Cause:**
- Database tables not created in Supabase
- Storage bucket not created
- Missing permissions

---

## ✅ **QUICK FIX (5 Minutes)**

### **Step 1: Go to Supabase Dashboard**
1. Open: https://supabase.com/dashboard
2. Select your project: `wall-catalog-app`
3. Click **SQL Editor** in left sidebar

### **Step 2: Run Emergency Fix Script**
1. Click **"New Query"**
2. Copy the entire script from: [`database/EMERGENCY_FIX.sql`](https://github.com/sammedworks/wall-catalog-app/blob/main/database/EMERGENCY_FIX.sql)
3. **IMPORTANT:** Find this line near the bottom:
   ```sql
   WHERE email = 'your-email@example.com'
   ```
   Replace `'your-email@example.com'` with your actual email (the one you use to login)
   
4. Click **"Run"** button (or press Ctrl+Enter)

### **Step 3: Verify Success**
You should see output like:
```
✅ EMERGENCY FIX COMPLETED SUCCESSFULLY!
✅ All tables created
✅ All policies configured
✅ Sample data inserted
✅ Storage bucket created
✅ Storage policies configured
```

And at the bottom:
```
email                    | role  | message
-------------------------|-------|------------------
your-email@example.com   | admin | Admin status set!
```

### **Step 4: Refresh Your App**
1. Go back to your app: https://wall-catalog-app.vercel.app/admin/quotation-settings
2. Hard refresh: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)
3. Try uploading a photo again

---

## 🧪 **Test Photo Upload**

### **After running the fix:**

1. **Go to Admin Panel:**
   - URL: https://wall-catalog-app.vercel.app/admin/quotation-settings
   
2. **Click "Add Material"**

3. **Upload Photo:**
   - Click "Upload Photo" button
   - Select an image (JPG/PNG, < 5MB recommended)
   - Wait for upload (should see "Uploading...")
   - Photo preview should appear

4. **Fill Other Fields:**
   - Name: "Test Material"
   - Material Type: "Wood"
   - Color Code: Any color
   - Rate per sq.ft: 500

5. **Click "Save Material"**
   - Should see: "Saved successfully!"
   - Item appears in table with photo

6. **If it works:** ✅ Photo upload is fixed!

7. **If it still fails:** See troubleshooting below

---

## 🐛 **Still Not Working?**

### **Check 1: Verify Tables Exist**

Run this in Supabase SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'panel_materials', 
  'modular_furniture', 
  'lighting_options', 
  'installation_accessories'
);
```

**Expected:** Should return 4 rows

**If empty:** Tables not created. Re-run EMERGENCY_FIX.sql

### **Check 2: Verify Storage Bucket**

Run this in Supabase SQL Editor:
```sql
SELECT id, name, public 
FROM storage.buckets 
WHERE id = 'product-photos';
```

**Expected:** 
```
id             | name           | public
---------------|----------------|--------
product-photos | product-photos | true
```

**If empty:** Bucket not created. Re-run EMERGENCY_FIX.sql

### **Check 3: Verify Admin Role**

Run this in Supabase SQL Editor (replace with your email):
```sql
SELECT email, role 
FROM user_profiles 
WHERE email = 'your-email@example.com';
```

**Expected:**
```
email                  | role
-----------------------|-------
your-email@example.com | admin
```

**If empty or role != 'admin':** Run this:
```sql
INSERT INTO user_profiles (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

### **Check 4: Verify Storage Policies**

Run this in Supabase SQL Editor:
```sql
SELECT policyname 
FROM storage.policies 
WHERE bucket_id = 'product-photos';
```

**Expected:** Should return 4 policies:
- Public can view product photos
- Authenticated users can upload product photos
- Admins can update product photos
- Admins can delete product photos

**If less than 4:** Re-run EMERGENCY_FIX.sql

### **Check 5: Browser Console**

1. Open your app
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Try uploading photo
5. Look for errors (red text)

**Common errors:**

**Error:** `"Bucket not found"`
**Fix:** Re-run EMERGENCY_FIX.sql, verify bucket exists

**Error:** `"new row violates row-level security policy"`
**Fix:** Verify admin role (Check 3 above)

**Error:** `"Failed to upload: 413 Payload Too Large"`
**Fix:** Image too large. Use image < 5MB

**Error:** `"Failed to upload: 415 Unsupported Media Type"`
**Fix:** Use JPG or PNG format only

### **Check 6: Network Tab**

1. Open DevTools (F12)
2. Go to **Network** tab
3. Try uploading photo
4. Look for failed requests (red)
5. Click on failed request
6. Check **Response** tab for error details

---

## 📋 **Manual Bucket Creation (If Script Fails)**

If EMERGENCY_FIX.sql fails to create bucket, do this manually:

### **In Supabase Dashboard:**

1. Go to **Storage** in left sidebar
2. Click **"New bucket"**
3. Settings:
   - **Name:** `product-photos`
   - **Public bucket:** ✅ **ON**
   - **File size limit:** 50 MB
   - **Allowed MIME types:** `image/jpeg, image/png, image/gif, image/webp`
4. Click **"Create bucket"**

### **Then set policies:**

Go to **SQL Editor** and run:
```sql
-- Public can view
CREATE POLICY "Public can view product photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-photos');

-- Authenticated can upload
CREATE POLICY "Authenticated users can upload product photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-photos' AND
  auth.role() = 'authenticated'
);

-- Admins can update
CREATE POLICY "Admins can update product photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-photos' AND
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admins can delete
CREATE POLICY "Admins can delete product photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-photos' AND
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

---

## ✅ **Verification Checklist**

After running EMERGENCY_FIX.sql, verify:

- [ ] Tables exist (Check 1)
- [ ] Storage bucket exists (Check 2)
- [ ] You are admin (Check 3)
- [ ] Storage policies exist (Check 4)
- [ ] Sample data loaded (6 panel materials)
- [ ] Can access admin panel
- [ ] Can click "Add Material"
- [ ] Can click "Upload Photo"
- [ ] File picker opens
- [ ] Can select image
- [ ] Upload starts (see "Uploading...")
- [ ] Photo preview appears
- [ ] Can save material
- [ ] Photo appears in table

**If all checked:** ✅ System fully working!

---

## 🎯 **Expected Behavior After Fix**

### **Admin Panel:**
1. Go to: `/admin/quotation-settings`
2. Click "Add Material"
3. Click "Upload Photo"
4. Select image
5. See "Uploading..." (1-3 seconds)
6. Photo preview appears
7. Fill other fields
8. Click "Save Material"
9. See "Saved successfully!"
10. Item appears in table with photo

### **Quotation Builder:**
1. Go to: `/quotation-builder`
2. See panel materials with photos
3. Photos load instantly
4. Can select materials
5. Everything works smoothly

---

## 📞 **Still Having Issues?**

### **Provide These Details:**

1. **Supabase Project URL:**
   - Go to Settings → API
   - Copy "Project URL"

2. **Console Errors:**
   - Open DevTools (F12)
   - Console tab
   - Copy all red errors

3. **SQL Query Results:**
   - Run all verification queries above
   - Copy results

4. **Screenshots:**
   - Error messages
   - Console logs
   - Network tab failures

---

## 🚀 **Quick Commands Reference**

### **Check Everything:**
```sql
-- Tables
SELECT COUNT(*) FROM panel_materials;
SELECT COUNT(*) FROM modular_furniture;

-- Bucket
SELECT * FROM storage.buckets WHERE id = 'product-photos';

-- Admin
SELECT email, role FROM user_profiles WHERE role = 'admin';

-- Policies
SELECT COUNT(*) FROM storage.policies WHERE bucket_id = 'product-photos';
```

### **Reset Everything (CAUTION!):**
```sql
-- Delete all data
TRUNCATE panel_materials, modular_furniture, lighting_options, installation_accessories CASCADE;

-- Delete bucket
DELETE FROM storage.buckets WHERE id = 'product-photos';

-- Then re-run EMERGENCY_FIX.sql
```

---

## ✅ **Success Indicators**

You'll know it's working when:

1. ✅ No errors in console
2. ✅ "Upload Photo" button works
3. ✅ Photo preview appears after upload
4. ✅ "Saved successfully!" message shows
5. ✅ Photo appears in admin table
6. ✅ Photo appears in quotation builder
7. ✅ Can edit and re-upload photos
8. ✅ Can delete items with photos

**All working?** 🎉 **System is fully operational!**
