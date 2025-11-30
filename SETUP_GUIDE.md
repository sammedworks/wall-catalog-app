# 🚀 Complete Setup Guide

## Step 1: Clone the Repository

```bash
git clone https://github.com/sammedworks/wall-catalog-app.git
cd wall-catalog-app
```

## Step 2: Install Dependencies

```bash
npm install
```

This will install:
- Next.js 14
- React 18
- Supabase client
- jsPDF for PDF generation
- Tailwind CSS
- Lucide React icons

## Step 3: Configure Supabase

### 3.1 Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Sign in to your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

### 3.2 Create Environment File

Create a file named `.env.local` in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://hgetbdapfszqngiqbxjm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace `your_anon_key_here` with your actual anon key.

## Step 4: Verify Database Setup

Your Supabase database should already have:

✅ **Tables:**
- `products` (12 sample products)
- `quotations`
- `enquiries`
- `user_profiles`

✅ **Storage:**
- `product-images` bucket

✅ **Security:**
- Row Level Security enabled
- Proper access policies

### Verify by running this SQL in Supabase:

```sql
-- Check products
SELECT COUNT(*) FROM products;

-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

## Step 5: Create Admin User

### Option A: Using Supabase Dashboard

1. Go to **Authentication** → **Users**
2. Click **Add User**
3. Enter:
   - Email: `admin@wallcatalog.com`
   - Password: `Admin@123`
   - Auto Confirm User: ✅ Yes
4. Copy the User UUID
5. Run this SQL:

```sql
INSERT INTO user_profiles (id, full_name, role, phone)
VALUES (
  'paste-user-uuid-here',
  'Admin User',
  'admin',
  '+91-1234567890'
);
```

### Option B: Update Existing User

If you already have a user:

```sql
UPDATE user_profiles 
SET role = 'admin'
WHERE id = 'your-user-uuid';
```

## Step 6: Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 7: Test the Application

### Customer View (Main Page)

1. **Browse Products**
   - Click on room categories
   - Filter by finish type
   - Use search bar

2. **Add to Quotation**
   - Click heart icon on products
   - View quotation sidebar
   - Export as PDF

3. **Contact Form**
   - Click "Contact" button
   - Fill and submit form
   - Check Supabase `enquiries` table

### Admin View

1. **Login**
   - Go to `/login`
   - Use admin credentials
   - Should redirect to `/admin`

2. **Manage Products** (Coming soon)
   - Add new products
   - Edit existing products
   - Upload images

## Step 8: Deploy to Production

### Deploy to Vercel

1. **Push to GitHub** (already done!)

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import `sammedworks/wall-catalog-app`

3. **Add Environment Variables**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```

4. **Deploy!**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app is live! 🎉

### Deploy to Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy**
   - Go to [netlify.com](https://netlify.com)
   - Drag & drop the `.next` folder
   - Add environment variables
   - Done!

## 🔧 Troubleshooting

### Issue: "Failed to fetch products"

**Solution:**
- Check `.env.local` file exists
- Verify Supabase URL and key are correct
- Check Supabase project is active
- Verify RLS policies are set up

### Issue: "Login not working"

**Solution:**
- Verify admin user exists in `user_profiles` table
- Check user has `role = 'admin'`
- Verify email/password are correct

### Issue: "Images not loading"

**Solution:**
- Check `product-images` bucket exists
- Verify storage policies are set up
- Check image URLs in database

### Issue: "PDF export not working"

**Solution:**
- Check browser console for errors
- Verify jsPDF is installed: `npm install jspdf jspdf-autotable`
- Try in different browser

## 📱 PWA Setup

To enable offline mode:

1. **Add icons** to `public/` folder:
   - `icon-192.png` (192x192)
   - `icon-512.png` (512x512)

2. **Test PWA**:
   - Open in Chrome
   - Click menu → "Install app"
   - Use offline

## 🎨 Customization

### Change Colors

Edit `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: '#your-color',
    }
  }
}
```

### Add More Products

Run SQL in Supabase:

```sql
INSERT INTO products (name, sku, finish_type, room_type, color_tone, price_per_sqft, dimensions, installation_type, image_url, description)
VALUES (
  'Product Name',
  'SKU-001',
  'Marble',
  'Living room',
  'Light',
  350.00,
  '10x12 ft',
  'Wall Mount',
  'https://image-url.com',
  'Product description'
);
```

### Modify Filters

Edit `app/page.js`:

```js
const FINISHES = [
  { name: 'Your Finish', color: '#hexcolor' },
  // Add more...
];
```

## 🆘 Need Help?

- **GitHub Issues**: [Create an issue](https://github.com/sammedworks/wall-catalog-app/issues)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)

## ✅ Checklist

Before going live:

- [ ] Database tables created
- [ ] Sample products loaded
- [ ] Admin user created
- [ ] Environment variables set
- [ ] App runs locally
- [ ] Login works
- [ ] PDF export works
- [ ] Contact form works
- [ ] Deployed to production
- [ ] Custom domain configured (optional)
- [ ] PWA icons added
- [ ] Analytics set up (optional)

## 🎉 You're Done!

Your wall catalog is now ready for production use!

**Next Steps:**
1. Add your own products
2. Customize branding
3. Share with customers
4. Start getting quotations!

---

Need more features? Check the roadmap in README.md