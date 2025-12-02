# 🎛️ Admin Panel - Complete User Guide

## 📍 **Access Admin Panel**

**URL:** `/admin/quotation-settings`

**Requirements:**
- Must be logged in
- User role must be 'admin'

---

## 🎨 **OVERVIEW**

The Admin Panel has **5 main tabs** for managing all quotation builder data:

1. **Panel Materials** - Wall panel types and rates
2. **Furniture** - Modular furniture items
3. **Lighting** - Lighting options by category
4. **Accessories** - Installation accessories
5. **Pricing Config** - Labour, transport, GST settings

---

## 📋 **TAB 1: PANEL MATERIALS**

### **What You Can Do:**
- ✅ View all panel materials
- ✅ Add new materials
- ✅ Edit existing materials
- ✅ Delete materials
- ✅ Toggle active/inactive status

### **Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **Name** | Text | Yes | Material name (e.g., "Walnut Wood") |
| **Material Type** | Dropdown | Yes | Wood, Marble, Stone, Paint, Metal, Glass |
| **Color Code** | Color Picker | Yes | Hex color for visual display |
| **Rate per sq.ft** | Number | Yes | Price per square foot (₹) |
| **Description** | Textarea | No | Optional description |
| **Display Order** | Number | No | Order in which items appear (0 = first) |
| **Active** | Checkbox | Yes | Show/hide in quotation builder |

### **How to Add Panel Material:**

1. Click **"Add Material"** button
2. Fill in all required fields:
   - Name: "Teak Wood"
   - Material Type: "Wood"
   - Color Code: Select brown color or enter "#6D4C41"
   - Rate per sq.ft: 550
   - Description: "Premium teak wood finish"
   - Display Order: 3
   - Active: ✓ Checked
3. Click **"Save Material"**
4. Material appears in table immediately

### **How to Edit Panel Material:**

1. Find material in table
2. Click **Edit icon** (pencil)
3. Modify fields as needed
4. Click **"Save Material"**
5. Changes reflect immediately

### **How to Delete Panel Material:**

1. Find material in table
2. Click **Delete icon** (trash)
3. Confirm deletion
4. Material removed from database

### **Example Data:**

```
Name: Walnut Wood
Type: Wood
Color: #5D4037 (brown)
Rate: ₹500/sq.ft
Status: Active
```

---

## 🪑 **TAB 2: MODULAR FURNITURE**

### **What You Can Do:**
- ✅ View all furniture items
- ✅ Add new furniture
- ✅ Edit existing furniture
- ✅ Delete furniture
- ✅ Manage multiple colors per item

### **Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **Name** | Text | Yes | Furniture name (e.g., "Grooveline Console") |
| **Category** | Dropdown | No | Console, Cabinet, Shelf, Table, Storage |
| **Size** | Text | Yes | Size specification (e.g., "4 ft") |
| **Price** | Number | Yes | Fixed price (₹) |
| **Colors** | Text | Yes | Comma-separated color names |
| **Description** | Textarea | No | Optional description |
| **Display Order** | Number | No | Display sequence |
| **Active** | Checkbox | Yes | Show/hide in builder |

### **How to Add Furniture:**

1. Click **"Add Furniture"** button
2. Fill in details:
   - Name: "Grooveline Console"
   - Category: "Console"
   - Size: "4 ft"
   - Price: 7999
   - Colors: "White, Beige, Walnut, Grey, Black, Teak"
   - Description: "Modern console with grooveline design"
   - Display Order: 1
   - Active: ✓ Checked
3. Click **"Save Furniture"**

### **Color Input Format:**

```
Correct: White, Beige, Walnut, Grey, Black, Teak
Incorrect: White,Beige,Walnut (no spaces)
Incorrect: White; Beige; Walnut (wrong separator)
```

**System automatically:**
- Splits by comma
- Trims whitespace
- Stores as array

### **Example Data:**

```
Name: Grooveline Console
Category: Console
Size: 4 ft
Price: ₹7,999
Colors: [White, Beige, Walnut, Grey, Black, Teak]
Status: Active
```

---

## 💡 **TAB 3: LIGHTING OPTIONS**

### **What You Can Do:**
- ✅ View all lighting items
- ✅ Add new lighting
- ✅ Edit existing lighting
- ✅ Delete lighting
- ✅ Organize by category

### **Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **Name** | Text | Yes | Lighting item name |
| **Category** | Dropdown | Yes | Profile Light, Cove Light, Wall Light |
| **Price** | Number | Yes | Item price (₹) |
| **Unit** | Dropdown | No | Piece, Meter, Set |
| **Description** | Textarea | No | Optional description |
| **Display Order** | Number | No | Display sequence |
| **Active** | Checkbox | Yes | Show/hide in builder |

### **Categories:**

**1. Profile Light**
- LED Installation Kits
- Aluminium Channels
- Profile Light Casings

**2. Cove Light**
- LED Strips
- Diffusers
- Controllers

**3. Wall Light**
- Mounted LEDs
- Designer Sconces
- Smart Lights

### **How to Add Lighting:**

1. Click **"Add Lighting"** button
2. Fill in details:
   - Name: "240 LED Installation Kit"
   - Category: "Profile Light"
   - Price: 2500
   - Unit: "Piece"
   - Description: "Complete LED installation kit with 240 LEDs"
   - Display Order: 1
   - Active: ✓ Checked
3. Click **"Save Lighting"**

### **Example Data:**

```
Name: 240 LED Installation Kit
Category: Profile Light
Price: ₹2,500
Unit: Piece
Status: Active
```

---

## 🔧 **TAB 4: INSTALLATION ACCESSORIES**

### **What You Can Do:**
- ✅ View all accessories
- ✅ Add new accessories
- ✅ Edit existing accessories
- ✅ Delete accessories
- ✅ Set pricing unit (fixed/per sq.ft/per meter)

### **Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **Name** | Text | Yes | Accessory name |
| **Price** | Number | Yes | Base price (₹) |
| **Unit** | Dropdown | Yes | Fixed, Per Sq.Ft, Per Meter |
| **Description** | Textarea | No | Optional description |
| **Display Order** | Number | No | Display sequence |
| **Active** | Checkbox | Yes | Show/hide in builder |

### **Unit Types:**

**1. Fixed Price**
- One-time charge
- Example: PVC Board - ₹1,500 (total)
- User pays exactly ₹1,500

**2. Per Sq.Ft**
- Price multiplied by area
- Example: Metal Trims - ₹600/sq.ft
- User enters area: 10 sq.ft
- Total: ₹600 × 10 = ₹6,000

**3. Per Meter**
- Price multiplied by length
- Example: Edge Bidding - ₹400/meter
- User enters length: 5 meters
- Total: ₹400 × 5 = ₹2,000

### **How to Add Accessory:**

1. Click **"Add Accessory"** button
2. Fill in details:
   - Name: "PVC Board (12mm)"
   - Price: 1500
   - Unit: "Fixed Price"
   - Description: "12mm PVC board for backing"
   - Display Order: 1
   - Active: ✓ Checked
3. Click **"Save Accessory"**

### **Example Data:**

```
Fixed Price:
Name: PVC Board (12mm)
Price: ₹1,500
Unit: Fixed
Status: Active

Per Sq.Ft:
Name: Metal Trims
Price: ₹600/sq.ft
Unit: Per Sq.Ft
Status: Active
```

---

## ⚙️ **TAB 5: PRICING CONFIGURATION**

### **What You Can Do:**
- ✅ Set labour charges
- ✅ Set transportation charges
- ✅ Set GST percentage
- ✅ View pricing summary

### **Settings:**

#### **1. Labour Charges**

| Setting | Default | Description |
|---------|---------|-------------|
| **Base Rate** | ₹1,500 | Standard labour charge per quotation |

**How to Update:**
1. Enter new value in "Base Rate" field
2. System auto-saves on blur
3. Confirmation message appears
4. New rate applies to all future quotations

#### **2. Transportation**

| Setting | Default | Description |
|---------|---------|-------------|
| **Base Rate** | ₹500 | Standard transportation charge |

**How to Update:**
1. Enter new value in "Base Rate" field
2. System auto-saves on blur
3. Confirmation message appears
4. New rate applies immediately

#### **3. GST Configuration**

| Setting | Default | Description |
|---------|---------|-------------|
| **GST Percentage** | 18% | Tax rate applied to subtotal |

**How to Update:**
1. Enter new percentage (0-100)
2. System auto-saves on blur
3. Confirmation message appears
4. New rate applies to all quotations

### **Pricing Summary Card:**

Shows current active rates:
```
Labour Charges: ₹1,500
Transportation: ₹500
GST: 18%
```

---

## 🔄 **COMMON WORKFLOWS**

### **Workflow 1: Add Complete Panel Material**

```
1. Go to "Panel Materials" tab
2. Click "Add Material"
3. Fill form:
   ✓ Name: Italian Marble
   ✓ Type: Marble
   ✓ Color: #ECEFF1 (light grey)
   ✓ Rate: ₹600/sq.ft
   ✓ Description: Premium Italian marble finish
   ✓ Display Order: 4
   ✓ Active: Yes
4. Click "Save Material"
5. ✅ Material appears in table
6. ✅ Available in quotation builder immediately
```

### **Workflow 2: Add Furniture with Multiple Colors**

```
1. Go to "Furniture" tab
2. Click "Add Furniture"
3. Fill form:
   ✓ Name: Modern Cabinet
   ✓ Category: Cabinet
   ✓ Size: 4 ft
   ✓ Price: ₹12,999
   ✓ Colors: White, Black, Walnut, Oak, Grey
   ✓ Description: Modern cabinet with soft-close doors
   ✓ Display Order: 4
   ✓ Active: Yes
4. Click "Save Furniture"
5. ✅ Furniture appears in table
6. ✅ All 5 colors selectable in builder
```

### **Workflow 3: Update Pricing Config**

```
1. Go to "Pricing Config" tab
2. Update Labour Charges:
   - Change from ₹1,500 to ₹2,000
   - Click outside field (auto-save)
   - ✅ Confirmation: "Updated successfully!"
3. Update GST:
   - Change from 18% to 12%
   - Click outside field (auto-save)
   - ✅ Confirmation: "Updated successfully!"
4. ✅ All new quotations use updated rates
```

### **Workflow 4: Deactivate Item (Hide from Builder)**

```
1. Find item in any tab
2. Click "Edit" icon
3. Uncheck "Active" checkbox
4. Click "Save"
5. ✅ Item hidden from quotation builder
6. ✅ Still visible in admin panel
7. ✅ Can reactivate anytime
```

### **Workflow 5: Bulk Price Update**

```
Scenario: Increase all panel rates by 10%

1. Go to "Panel Materials" tab
2. For each material:
   - Click "Edit"
   - Calculate new rate: old_rate × 1.10
   - Enter new rate
   - Click "Save"
3. Repeat for all materials
4. ✅ All rates updated
```

---

## 🎯 **BEST PRACTICES**

### **1. Display Order**

Use consistent numbering:
```
Display Order 0: First item
Display Order 1: Second item
Display Order 2: Third item
...
Display Order 10: Eleventh item
```

**Tip:** Leave gaps (0, 10, 20, 30) to insert items later without renumbering.

### **2. Naming Conventions**

**Panel Materials:**
```
✓ Good: Walnut Wood, Italian Marble, Natural Stone
✗ Bad: wood1, marble_italian, stone
```

**Furniture:**
```
✓ Good: Grooveline Console - 4ft, Modern Cabinet - 6ft
✗ Bad: Console1, Cabinet_6
```

**Lighting:**
```
✓ Good: 240 LED Installation Kit, Aluminium Channel
✗ Bad: LED Kit, Channel
```

### **3. Color Management**

**Always use comma-separated format:**
```
✓ Good: White, Beige, Walnut, Grey, Black, Teak
✗ Bad: White,Beige,Walnut (no spaces)
✗ Bad: White; Beige; Walnut (wrong separator)
```

### **4. Pricing Strategy**

**Panel Materials:**
- Set competitive rates per sq.ft
- Consider material cost + margin
- Update seasonally

**Furniture:**
- Fixed prices per size
- Include all costs (material + labour)
- Offer multiple sizes

**Lighting:**
- Price per unit (piece/meter/set)
- Bundle items for better value
- Consider installation complexity

**Accessories:**
- Use "Fixed" for one-time items
- Use "Per Sq.Ft" for area-based items
- Use "Per Meter" for length-based items

### **5. Active/Inactive Management**

**When to Deactivate:**
- Out of stock items
- Seasonal items (off-season)
- Discontinued products
- Testing new items

**Benefits:**
- Items hidden from users
- Still in database
- Can reactivate anytime
- Historical data preserved

---

## 🚨 **TROUBLESHOOTING**

### **Problem: Can't access admin panel**

**Solution:**
1. Check if logged in
2. Verify user role:
   ```sql
   SELECT email, role FROM user_profiles WHERE email = 'your-email';
   ```
3. If role is not 'admin', update:
   ```sql
   UPDATE user_profiles SET role = 'admin' WHERE email = 'your-email';
   ```
4. Logout and login again

### **Problem: Changes not saving**

**Solution:**
1. Check browser console for errors
2. Verify internet connection
3. Check Supabase connection
4. Try refreshing page
5. Clear browser cache

### **Problem: Items not showing in quotation builder**

**Solution:**
1. Check if item is "Active"
2. Verify display_order is set
3. Check if required fields filled
4. Refresh quotation builder page

### **Problem: Colors not displaying correctly**

**Solution:**
1. Verify comma-separated format
2. Remove extra spaces
3. Check for special characters
4. Re-save the item

### **Problem: Pricing calculations wrong**

**Solution:**
1. Check pricing config values
2. Verify GST percentage
3. Check labour/transport rates
4. Test with simple values
5. Check browser console for errors

---

## 📊 **DATA VALIDATION**

### **Required Fields:**

**Panel Materials:**
- ✓ Name
- ✓ Material Type
- ✓ Color Code
- ✓ Rate per sq.ft

**Furniture:**
- ✓ Name
- ✓ Size
- ✓ Price
- ✓ Colors (at least one)

**Lighting:**
- ✓ Name
- ✓ Category
- ✓ Price

**Accessories:**
- ✓ Name
- ✓ Price
- ✓ Unit

### **Field Constraints:**

| Field | Min | Max | Format |
|-------|-----|-----|--------|
| Price | 0 | ∞ | Number |
| Rate per sq.ft | 0 | ∞ | Number |
| GST % | 0 | 100 | Number |
| Display Order | 0 | ∞ | Integer |
| Color Code | - | - | Hex (#RRGGBB) |

---

## 🎓 **TRAINING CHECKLIST**

### **For New Admins:**

- [ ] Access admin panel successfully
- [ ] Navigate all 5 tabs
- [ ] Add a panel material
- [ ] Add a furniture item with colors
- [ ] Add a lighting option
- [ ] Add an accessory (fixed price)
- [ ] Add an accessory (per sq.ft)
- [ ] Edit an existing item
- [ ] Delete an item
- [ ] Deactivate/reactivate an item
- [ ] Update labour charges
- [ ] Update transportation charges
- [ ] Update GST percentage
- [ ] Test changes in quotation builder
- [ ] Understand display order
- [ ] Know when to use each unit type

---

## 📞 **SUPPORT**

### **Common Questions:**

**Q: How often should I update prices?**
A: Review quarterly or when costs change significantly.

**Q: Can I delete items with existing quotations?**
A: Yes, but historical quotations retain old data.

**Q: How many colors can furniture have?**
A: Unlimited, but 4-8 is recommended for UX.

**Q: Can I change unit type after creation?**
A: Yes, but affects future quotations only.

**Q: What happens to old quotations when I change prices?**
A: Old quotations keep their original prices. Only new quotations use updated rates.

---

## ✅ **QUICK REFERENCE**

### **Keyboard Shortcuts:**

| Action | Shortcut |
|--------|----------|
| Close Modal | ESC |
| Save Form | Ctrl/Cmd + Enter |

### **Status Indicators:**

| Color | Meaning |
|-------|---------|
| 🟢 Green | Active |
| 🔴 Red | Inactive |
| 🔵 Blue | Category Tag |
| 🟣 Purple | Unit Type |

### **Action Icons:**

| Icon | Action |
|------|--------|
| ✏️ Pencil | Edit |
| 🗑️ Trash | Delete |
| ➕ Plus | Add New |
| 💾 Save | Save Changes |
| ❌ X | Close/Cancel |

---

## 🎉 **YOU'RE READY!**

You now have complete control over:
- ✅ All panel materials and rates
- ✅ All furniture items and colors
- ✅ All lighting options
- ✅ All installation accessories
- ✅ Labour, transport, and GST rates

**Start managing your quotation system like a pro!** 🚀
