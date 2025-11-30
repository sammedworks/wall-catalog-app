# 🚀 Deployment Checklist

## ✅ Pre-Deployment Checklist

### **1. Environment Variables** (CRITICAL)

Go to Vercel: https://vercel.com/sammedworks/wall-catalog-app/settings/environment-variables

Add these variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://hgetbdapfszqngiqbxjm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**How to get Supabase Anon Key:**
1. Go to: https://supabase.com/dashboard/project/hgetbdapfszqngiqbxjm/settings/api
2. Find "Project API keys" section
3. Copy the `anon` `public` key
4. Paste in Vercel

**Important:**
- ✅ Select all environments (Production, Preview, Development)
- ✅ Click "Save" after adding each variable
- ✅ Redeploy after adding variables

---

### **2. Database Setup** (CRITICAL)

Run this SQL in Supabase SQL Editor:

```sql
-- Check if user_profiles table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_name = 'user_profiles'
);

-- If false, create the table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);
```

---

### **3. Create Admin User** (CRITICAL)

**Step 1: Create User in Supabase Auth**
1. Go to: https://supabase.com/dashboard/project/hgetbdapfszqngiqbxjm/auth/users
2. Click "Add user" → "Create new user"
3. Enter:
   - Email: `admin@wallcatalog.com`
   - Password: `Admin@123`
   - ✅ Check "Auto Confirm User"
4. Click "Create user"
5. **Copy the User ID (UUID)** - you'll need it next

**Step 2: Add Admin Role**
1. Go to SQL Editor
2. Run this (replace YOUR_USER_ID with the UUID you copied):

```sql
INSERT INTO user_profiles (id, full_name, role)
VALUES ('YOUR_USER_ID_HERE', 'Admin User', 'admin')
ON CONFLICT (id) 
DO UPDATE SET role = 'admin';
```

**Step 3: Verify**
```sql
SELECT id, full_name, role 
FROM user_profiles 
WHERE role = 'admin';
```

You should see your admin user!

---

### **4. Storage Bucket Setup** (CRITICAL)

**Create Products Bucket:**
1. Go to: https://supabase.com/dashboard/project/hgetbdapfszqngiqbxjm/storage/buckets
2. Click "New bucket"
3. Name: `products`
4. ✅ Check "Public bucket"
5. Click "Create bucket"

**Set Storage Policies:**
```sql
-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products' AND
  auth.role() = 'authenticated'
);

-- Allow users to update their own uploads
CREATE POLICY "Users can update own uploads"
ON storage.objects FOR UPDATE
USING (bucket_id = 'products' AND auth.uid() = owner);

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own uploads"
ON storage.objects FOR DELETE
USING (bucket_id = 'products' AND auth.uid() = owner);
```

---

### **5. Verify Database Tables**

Check if all required tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Required tables:**
- ✅ `products`
- ✅ `enquiries`
- ✅ `quotations`
- ✅ `user_profiles`
- ⚠️ `tags` (create if missing)
- ⚠️ `quotation_items` (create if missing)

**If missing, run the complete schema from ARCHITECTURE.md**

---

## 🔄 Deployment Steps

### **Step 1: Push to GitHub**

```bash
# Make sure all changes are committed
git add .
git commit -m "Ready for deployment"
git push origin main
```

### **Step 2: Vercel Auto-Deploy**

Vercel will automatically deploy when you push to GitHub.

**Monitor deployment:**
1. Go to: https://vercel.com/sammedworks/wall-catalog-app
2. Click "Deployments" tab
3. Watch the build progress

**Expected build time:** 2-3 minutes

---

### **Step 3: Check Build Logs**

**If build succeeds:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
✓ Build completed successfully
```

**If build fails:**
- Check error message
- Common issues:
  - Missing environment variables
  - Syntax errors
  - Import errors
  - Type errors

---

## ✅ Post-Deployment Checklist

### **1. Test Homepage**

Visit: `https://your-app.vercel.app`

**Check:**
- ✅ Page loads
- ✅ Products display
- ✅ Images load (or show fallback)
- ✅ Filters work
- ✅ Room categories work
- ✅ No console errors

---

### **2. Test Admin Login**

Visit: `https://your-app.vercel.app/login`

**Check:**
- ✅ Login page loads
- ✅ Shows "Connected" status (not error)
- ✅ Can enter credentials
- ✅ Login button works

**Login with:**
- Email: `admin@wallcatalog.com`
- Password: `Admin@123`

**Expected:**
- ✅ Redirects to `/admin`
- ✅ Shows admin dashboard
- ✅ Sidebar visible
- ✅ Header visible
- ✅ Statistics load

---

### **3. Test Admin Features**

**Products:**
- ✅ Click "Products" in sidebar
- ✅ Products list loads
- ✅ Click "Add Product"
- ✅ Upload image works
- ✅ Form submits successfully
- ✅ Product appears in list

**Tags:**
- ✅ Click "Tags" in sidebar
- ✅ Tags list loads
- ✅ Click "Add Tag"
- ✅ Modal opens
- ✅ Can create tag
- ✅ Tag appears in list

**Quotations:**
- ✅ Click "Quotations" in sidebar
- ✅ Quotations list loads
- ✅ Can change status
- ✅ Statistics update

**Enquiries:**
- ✅ Click "Enquiries" in sidebar
- ✅ Enquiries list loads
- ✅ Can view details
- ✅ Can mark resolved

---

### **4. Test Customer Features**

**Catalog:**
- ✅ Browse products
- ✅ Filter by room
- ✅ Filter by finish
- ✅ Search works
- ✅ Images load

**Quotation:**
- ✅ Click heart icon on product
- ✅ Product added to quotation
- ✅ View quotation page
- ✅ Can adjust quantity
- ✅ Can submit quotation

**Contact:**
- ✅ Contact form works
- ✅ Enquiry submitted
- ✅ Appears in admin panel

---

## 🐛 Troubleshooting

### **Issue 1: Build Fails**

**Error:** `Invalid supabaseUrl: Provided URL is malformed`

**Solution:**
1. Check environment variables are set in Vercel
2. Verify variable names are correct:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Redeploy after adding variables

---

### **Issue 2: Login Shows Error**

**Error:** "Cannot connect to database"

**Solution:**
1. Check Supabase project is active
2. Verify environment variables
3. Check `user_profiles` table exists
4. Verify RLS policies are set

---

### **Issue 3: Admin Can't Login**

**Error:** "User profile not found"

**Solution:**
1. Check admin user exists in Supabase Auth
2. Verify user has admin role in `user_profiles` table
3. Run this SQL:
```sql
SELECT * FROM user_profiles WHERE role = 'admin';
```

---

### **Issue 4: Images Not Uploading**

**Error:** "Upload failed"

**Solution:**
1. Check `products` bucket exists
2. Verify bucket is public
3. Check storage policies are set
4. Verify file size < 5MB
5. Check file type is image

---

### **Issue 5: 404 Errors**

**Error:** "404 This page could not be found"

**Solution:**
1. Check route exists in `app/` folder
2. Verify file is named `page.js`
3. Check for syntax errors
4. Redeploy

---

## 📊 Deployment Status

### **Current Status:**

- ✅ Code pushed to GitHub
- ⚠️ Environment variables (need to add)
- ⚠️ Admin user (need to create)
- ⚠️ Storage bucket (need to create)
- ⚠️ Database tables (need to verify)

### **Completion:**

```
[████████░░] 80% Complete

Remaining:
1. Add environment variables
2. Create admin user
3. Create storage bucket
4. Test deployment
```

---

## 🎯 Quick Start (5 Minutes)

**If you want to deploy RIGHT NOW:**

1. **Add Environment Variables** (2 min)
   - Go to Vercel settings
   - Add `NEXT_PUBLIC_SUPABASE_URL`
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Click "Redeploy"

2. **Create Admin User** (2 min)
   - Go to Supabase Auth
   - Add user: admin@wallcatalog.com
   - Copy user ID
   - Run SQL to add admin role

3. **Create Storage Bucket** (1 min)
   - Go to Supabase Storage
   - Create `products` bucket
   - Make it public

4. **Test** (1 min)
   - Visit your app
   - Login as admin
   - Add a product

**Total time: 5 minutes** ⚡

---

## 📞 Support

**If you get stuck:**

1. Check error logs in Vercel
2. Check browser console
3. Check Supabase logs
4. Review this checklist
5. Ask for help!

---

## ✅ Final Checklist

Before going live:

- [ ] Environment variables added
- [ ] Admin user created
- [ ] Storage bucket created
- [ ] Database tables verified
- [ ] Build succeeds
- [ ] Homepage loads
- [ ] Admin login works
- [ ] Can add products
- [ ] Images upload
- [ ] All features tested
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Performance good

---

## 🎉 You're Ready!

Once all checkboxes are ✅, your app is **production-ready**!

**Your app will be live at:**
`https://wall-catalog-app.vercel.app`

**Admin panel:**
`https://wall-catalog-app.vercel.app/admin`

---

**Need help? Just ask!** 🚀