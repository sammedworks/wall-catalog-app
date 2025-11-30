# 🚀 Deployment Guide

## Quick Deploy to Vercel (Recommended)

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sammedworks/wall-catalog-app)

### Manual Deploy

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
vercel
```

4. **Add Environment Variables**
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

5. **Deploy to Production**
```bash
vercel --prod
```

Your app is now live! 🎉

---

## Deploy to Netlify

### Using Netlify CLI

1. **Install Netlify CLI**
```bash
npm install -g netlify-cli
```

2. **Build the project**
```bash
npm run build
```

3. **Deploy**
```bash
netlify deploy --prod
```

4. **Add Environment Variables**
   - Go to Netlify Dashboard
   - Site Settings → Environment Variables
   - Add:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Using Netlify Dashboard

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub
4. Select `sammedworks/wall-catalog-app`
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Add environment variables
7. Deploy!

---

## Deploy to Railway

1. **Go to [railway.app](https://railway.app)**
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose `sammedworks/wall-catalog-app`
5. Add environment variables
6. Deploy automatically!

---

## Deploy to Render

1. **Go to [render.com](https://render.com)**
2. Click "New" → "Web Service"
3. Connect GitHub repository
4. Settings:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Add environment variables
6. Create Web Service

---

## Custom Domain Setup

### Vercel

1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### Netlify

1. Go to Domain Settings
2. Add custom domain
3. Update DNS:
   ```
   Type: CNAME
   Name: www
   Value: your-site.netlify.app
   ```

---

## Environment Variables

Required for all deployments:

```env
NEXT_PUBLIC_SUPABASE_URL=https://hgetbdapfszqngiqbxjm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## Post-Deployment Checklist

- [ ] App loads successfully
- [ ] Products display correctly
- [ ] Images load properly
- [ ] Login works
- [ ] PDF export works
- [ ] Contact form submits
- [ ] PWA installs on mobile
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active (https)
- [ ] Analytics set up (optional)

---

## Performance Optimization

### Enable Caching

Add to `next.config.js`:

```js
module.exports = {
  images: {
    domains: ['images.unsplash.com', 'hgetbdapfszqngiqbxjm.supabase.co'],
  },
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|webp)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
}
```

### Enable Compression

Vercel and Netlify automatically enable gzip/brotli compression.

### Image Optimization

Use Next.js Image component:

```jsx
import Image from 'next/image';

<Image 
  src={product.image_url} 
  alt={product.name}
  width={400}
  height={300}
  loading="lazy"
/>
```

---

## Monitoring & Analytics

### Add Google Analytics

1. Get GA4 tracking ID
2. Add to `app/layout.js`:

```jsx
<Script src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID" />
<Script id="google-analytics">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_MEASUREMENT_ID');
  `}
</Script>
```

### Vercel Analytics

```bash
npm install @vercel/analytics
```

Add to `app/layout.js`:

```jsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## Troubleshooting Deployment

### Build Fails

**Error: "Module not found"**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Error: "Environment variables not found"**
- Verify variables are added in deployment platform
- Check variable names match exactly
- Redeploy after adding variables

### Runtime Errors

**Error: "Failed to fetch"**
- Check Supabase URL is correct
- Verify anon key is valid
- Check Supabase project is active

**Error: "Images not loading"**
- Add image domains to `next.config.js`
- Check Supabase storage is public
- Verify image URLs are correct

---

## Scaling

### Database

Supabase free tier includes:
- 500 MB database
- 1 GB file storage
- 50,000 monthly active users

Upgrade to Pro for:
- 8 GB database
- 100 GB storage
- Unlimited users

### Hosting

**Vercel Free Tier:**
- 100 GB bandwidth
- Unlimited deployments
- Automatic SSL

**Upgrade for:**
- More bandwidth
- Team collaboration
- Advanced analytics

---

## Backup & Recovery

### Database Backup

```sql
-- Export products
COPY products TO '/tmp/products_backup.csv' CSV HEADER;

-- Export enquiries
COPY enquiries TO '/tmp/enquiries_backup.csv' CSV HEADER;
```

### Automated Backups

Supabase Pro includes:
- Daily automated backups
- Point-in-time recovery
- 7-day retention

---

## Security Best Practices

1. **Never commit `.env.local`** to Git
2. **Use Row Level Security** in Supabase
3. **Enable 2FA** on Supabase account
4. **Rotate keys** periodically
5. **Monitor access logs** in Supabase
6. **Use HTTPS only** (automatic on Vercel/Netlify)

---

## Support

Need help with deployment?

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **GitHub Issues**: [Create an issue](https://github.com/sammedworks/wall-catalog-app/issues)

---

## 🎉 Congratulations!

Your Wall Catalog is now live and ready for customers!

**Share your deployment:**
- Tweet about it
- Share on LinkedIn
- Add to your portfolio

Happy selling! 🚀