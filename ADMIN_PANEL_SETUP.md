# 🚀 Admin Panel Setup & Integration Guide

## Overview

This guide will help you connect the Admin Panel to the Frontend Browse page, ensuring all data flows correctly from Supabase → Admin Panel → Frontend.

---

## 📋 Step-by-Step Setup

### **Step 1: Run Database Schema**

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Open the file: `database/COMPLETE_SCHEMA.sql`
4. Copy the entire contents
5. Paste into Supabase SQL Editor
6. Click **Run**

This will create:
- ✅ `user_profiles` table (authentication & roles)
- ✅ `materials` table (material categories)
- ✅ `design_tags` table (style tags)
- ✅ `designs` table (main products)
- ✅ `products` table (legacy support)
- ✅ `enquiries` table (customer inquiries)
- ✅ `quotations` table (quotes)
- ✅ All RLS policies (security)
- ✅ Sample data (materials & tags)

### **Step 2: Make Yourself Admin**

After running the schema, create your account and make yourself admin:

```sql
-- Replace with your email
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Verify it worked
SELECT email, role FROM user_profiles WHERE role = 'admin';
```

### **Step 3: Verify Database Setup**

Run these verification queries:

```sql
-- Check all tables exist
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN ('user_profiles', 'materials', 'design_tags', 'designs', 'products', 'enquiries', 'quotations')
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('materials', 'design_tags', 'designs', 'products');

-- Check sample data loaded
SELECT 'materials' as table_name, COUNT(*) as count FROM materials
UNION ALL
SELECT 'design_tags', COUNT(*) FROM design_tags;
```

Expected results:
- 7 tables with proper column counts
- All tables have `rowsecurity = true`
- 6 materials, 8 tags

---

## 🔐 Authentication & Access

### **Admin Panel Access**

1. **URL:** `https://your-site.vercel.app/admin`
2. **Login:** `https://your-site.vercel.app/login`

### **What Happens:**

- ✅ **If logged in as admin:** Shows admin dashboard
- 🔄 **If not logged in:** Redirects to `/login`
- ❌ **If logged in as user:** Redirects to `/` (home)

### **Create Admin Account:**

1. Go to `/login`
2. Click "Sign Up"
3. Create account
4. Run Step 2 SQL to upgrade to admin
5. Refresh page
6. Go to `/admin`

---

## 🎨 Admin Panel Features

### **Dashboard** (`/admin`)
- Total designs count
- Materials count
- Tags count
- Enquiries count
- Recent enquiries
- Quick actions

### **Designs** (`/admin/products`)
- Create new designs
- Upload images (2 per design)
- Select space category
- Assign materials
- Assign tags
- Set active/inactive
- Set featured

### **Materials** (`/admin/materials`)
- Create material categories
- Upload material images
- Set display order
- Toggle active/inactive

### **Tags** (`/admin/tags`)
- Create style tags
- Organize by category
- Set display order
- Toggle active/inactive

### **Filters** (`/admin/filters`)
- Advanced filter management
- (Coming soon)

### **Enquiries** (`/admin/enquiries`)
- View customer inquiries
- Update status
- Respond to customers

---

## 🌐 Frontend Integration

### **Browse Page** (`/browse`)

The browse page now automatically loads:

1. ✅ **Space Categories** (6 categories)
   - TV Unit
   - Living Room
   - Bedroom
   - Entrance
   - Study
   - Mandir

2. ✅ **Materials Slider** (from `materials` table)
   - Loads all active materials
   - Multi-select filtering
   - Horizontal scroll with arrows

3. ✅ **Style Tags** (from `design_tags` table)
   - Loads all active tags
   - Multi-select filtering
   - Pill-style buttons

4. ✅ **Design Grid** (from `designs` or `products` table)
   - Loads all active designs
   - Filters by space, materials, tags
   - Image carousel (2 images per design)
   - Favorite functionality

### **Data Flow:**

```
Admin Panel → Supabase → Frontend
     ↓            ↓          ↓
  Create      Stores     Fetches
  Material    in DB      & Displays
```

### **Real-Time Updates:**

- Changes in admin panel are immediately available
- Frontend fetches fresh data on page load
- No caching issues

---

## 🔧 Troubleshooting

### **Problem: Browse page shows "No Designs Found"**

**Diagnosis:**
```sql
-- Check if designs exist
SELECT COUNT(*) FROM designs WHERE is_active = true;
SELECT COUNT(*) FROM products WHERE is_active = true;
```

**Solutions:**
1. Create designs in admin panel (`/admin/products`)
2. Ensure designs are marked as `is_active = true`
3. Check RLS policies allow public read

### **Problem: Materials not showing**

**Diagnosis:**
```sql
-- Check materials
SELECT * FROM materials WHERE is_active = true ORDER BY display_order;
```

**Solutions:**
1. Run `COMPLETE_SCHEMA.sql` to insert sample materials
2. Create materials in admin panel (`/admin/materials`)
3. Ensure materials are marked as `is_active = true`

### **Problem: Tags not showing**

**Diagnosis:**
```sql
-- Check tags
SELECT * FROM design_tags WHERE is_active = true ORDER BY category, display_order;
```

**Solutions:**
1. Run `COMPLETE_SCHEMA.sql` to insert sample tags
2. Create tags in admin panel (`/admin/tags`)
3. Ensure tags are marked as `is_active = true`

### **Problem: "Failed to load catalog data"**

**Diagnosis:**
- Open browser console (F12)
- Look for errors
- Check Network tab for failed requests

**Common Causes:**
1. **RLS Policies:** Tables not readable by public
2. **Missing Tables:** Schema not run
3. **Supabase Connection:** Check `.env.local` file

**Solutions:**

```sql
-- Fix RLS policies for public read
DROP POLICY IF EXISTS "Anyone can view active materials" ON materials;
CREATE POLICY "Anyone can view active materials"
  ON materials FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can view active tags" ON design_tags;
CREATE POLICY "Anyone can view active tags"
  ON design_tags FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can view active designs" ON designs;
CREATE POLICY "Anyone can view active designs"
  ON designs FOR SELECT
  USING (is_active = true);
```

### **Problem: Admin panel shows blank page**

**Solutions:**
1. Check browser console for errors
2. Verify you're logged in
3. Verify your role is 'admin'
4. Clear browser cache
5. Try incognito mode

### **Problem: Can't login to admin panel**

**Solutions:**
1. Create account at `/login`
2. Run SQL to make yourself admin
3. Logout and login again
4. Check Supabase Auth settings

---

## 📊 Database Structure

### **Materials Table**
```sql
CREATE TABLE materials (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Design Tags Table**
```sql
CREATE TABLE design_tags (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT DEFAULT 'style',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Designs Table**
```sql
CREATE TABLE designs (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  space_category TEXT,
  image_url TEXT,
  image_url_2 TEXT,
  material_slugs TEXT[] DEFAULT '{}',
  tag_slugs TEXT[] DEFAULT '{}',
  price_range TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🎯 Testing Checklist

### **Database Setup:**
- [ ] All tables created
- [ ] RLS policies enabled
- [ ] Sample data loaded
- [ ] Admin user created

### **Admin Panel:**
- [ ] Can access `/admin`
- [ ] Dashboard shows stats
- [ ] Can create materials
- [ ] Can create tags
- [ ] Can create designs

### **Frontend:**
- [ ] Browse page loads
- [ ] Space categories show
- [ ] Materials slider works
- [ ] Tags show
- [ ] Designs load
- [ ] Filters work
- [ ] Images display

### **Integration:**
- [ ] Admin changes appear on frontend
- [ ] Filters work correctly
- [ ] No console errors
- [ ] Loading states work
- [ ] Error handling works

---

## 🚀 Quick Start Commands

### **1. Setup Database**
```sql
-- Run in Supabase SQL Editor
-- Copy contents of database/COMPLETE_SCHEMA.sql
```

### **2. Make Admin**
```sql
UPDATE user_profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

### **3. Verify Setup**
```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Check data
SELECT 'materials' as table, COUNT(*) FROM materials
UNION ALL SELECT 'tags', COUNT(*) FROM design_tags
UNION ALL SELECT 'designs', COUNT(*) FROM designs;
```

### **4. Test Frontend**
1. Visit: `https://your-site.vercel.app/browse`
2. Should see materials slider
3. Should see tags
4. Should see designs (if any created)

---

## 📞 Support

If you encounter issues:

1. **Check browser console** for errors
2. **Check Supabase logs** for database errors
3. **Verify RLS policies** are correct
4. **Check environment variables** in Vercel
5. **Clear browser cache** and try again

---

## ✅ Success Criteria

Your setup is complete when:

1. ✅ Admin panel accessible at `/admin`
2. ✅ Can create materials, tags, and designs
3. ✅ Browse page shows all data
4. ✅ Filters work correctly
5. ✅ No console errors
6. ✅ Images display properly
7. ✅ Real-time updates work

---

**🎉 Congratulations! Your admin panel is now fully integrated with the frontend!**
