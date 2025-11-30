# ⚡ Quick Start (5 Minutes)

Get your Wall Catalog running in 5 minutes!

## 1️⃣ Clone & Install (1 min)

```bash
git clone https://github.com/sammedworks/wall-catalog-app.git
cd wall-catalog-app
npm install
```

## 2️⃣ Configure Environment (1 min)

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://hgetbdapfszqngiqbxjm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Get your anon key:**
1. Go to [supabase.com](https://supabase.com/dashboard)
2. Select your project
3. Settings → API → Copy "anon public" key

## 3️⃣ Run the App (1 min)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 4️⃣ Test Features (2 min)

### Customer View
✅ Browse 12 sample products  
✅ Filter by room/finish  
✅ Add to quotation  
✅ Export PDF  
✅ Submit contact form  

### Admin View
1. Go to [http://localhost:3000/login](http://localhost:3000/login)
2. Login with:
   - Email: `admin@wallcatalog.com`
   - Password: `Admin@123`

## 🎉 Done!

Your catalog is running!

---

## Next Steps

### Add Your Products

Run in Supabase SQL Editor:

```sql
INSERT INTO products (name, sku, finish_type, room_type, color_tone, price_per_sqft, dimensions, installation_type, image_url, description)
VALUES (
  'Your Product Name',
  'SKU-XXX',
  'Marble',
  'Living room',
  'Light',
  350.00,
  '10x12 ft',
  'Wall Mount',
  'https://your-image-url.com',
  'Product description here'
);
```

### Deploy to Production

**Vercel (Easiest):**
```bash
npm install -g vercel
vercel
```

**Or use the button:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sammedworks/wall-catalog-app)

---

## 🆘 Issues?

### App won't start?
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Products not loading?
- Check `.env.local` exists
- Verify Supabase credentials
- Check database has products

### Login not working?
- Verify admin user exists in Supabase
- Check user has `role = 'admin'` in `user_profiles` table

---

## 📚 Full Documentation

- **Setup Guide**: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **Deployment**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **README**: [README.md](./README.md)

---

## ✨ Features Included

✅ Product catalog with 12 samples  
✅ Advanced filtering & search  
✅ Quotation system with PDF export  
✅ Contact form  
✅ Admin authentication  
✅ Supabase database  
✅ PWA support  
✅ Responsive design  
✅ Production-ready  

---

**That's it! You're ready to go! 🚀**