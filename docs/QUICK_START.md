# 🚀 Quick Start Guide - Create Admin Account

## 📍 **Your Login Page URL:**
```
https://wall-catalog-i4m0c2sf4-akshay-anagalis-projects.vercel.app/login
```

---

## ✅ **Step-by-Step Instructions**

### **Step 1: Go to Login Page**

1. Open your browser
2. Visit: `https://wall-catalog-i4m0c2sf4-akshay-anagalis-projects.vercel.app/login`
3. You'll see the Wall Catalog login page

---

### **Step 2: Click "Sign Up" Tab**

On the login page, you'll see two tabs:
- **Login** (default)
- **Sign Up** ← Click this one!

---

### **Step 3: Fill in Your Details**

Enter the following information:

```
Full Name: Akshay Anagali
Email: akshayanagali@gmail.com
Password: [Choose a secure password - minimum 6 characters]
```

---

### **Step 4: Click "Create Account"**

1. Click the blue **"Create Account"** button
2. Wait for success message
3. The page will automatically switch to Login tab

---

### **Step 5: Login with Your New Account**

1. Enter your email: `akshayanagali@gmail.com`
2. Enter your password
3. Click **"Sign In"**

---

### **Step 6: Make Yourself Admin**

Go to Supabase and run:

```sql
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'akshayanagali@gmail.com';
```

---

### **Step 7: Access Admin Panel**

Visit: `https://wall-catalog-i4m0c2sf4-akshay-anagalis-projects.vercel.app/admin`

🎉 **You're now an admin!**
