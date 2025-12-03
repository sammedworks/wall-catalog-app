# 🎯 Three-Level Quotation System Documentation

## Overview

Complete implementation of the **Material → Series → Panel** three-level structure for the Quotation Builder, fully integrated with the Admin Panel.

---

## 📊 **DATABASE SCHEMA**

### **1. Materials Table**
```sql
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  color_code TEXT DEFAULT '#F5F5F5',
  text_color TEXT DEFAULT '#374151',
  category TEXT DEFAULT 'material',
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Examples:**
- Wood
- Glass
- Metal
- Stone
- Laminate

---

### **2. Material Series Table**
```sql
CREATE TABLE material_series (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(material_id, slug)
);
```

**Examples for Wood Material:**
- Premium Oak Series
- Walnut Collection
- Teak Classics
- Pine Essentials

---

### **3. Panel Types Table**
```sql
CREATE TABLE panel_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  series_id UUID REFERENCES material_series(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  photo_url TEXT,
  rate_per_sqft DECIMAL(10,2) NOT NULL,
  color_code TEXT,
  finish_type TEXT, -- matte, glossy, textured
  thickness_mm DECIMAL(5,2),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(series_id, slug)
);
```

**Examples for Premium Oak Series:**
- Natural Oak Panel - ₹450/sq.ft
- Dark Oak Panel - ₹480/sq.ft
- White Oak Panel - ₹500/sq.ft

---

## 🔄 **DATA FLOW**

### **Admin Panel → Database → Frontend**

```
┌─────────────────────────────────────────────────────────┐
│                    ADMIN PANEL                          │
│                                                         │
│  1. Create Material (Wood)                              │
│  2. Create Series (Premium Oak Series)                  │
│  3. Create Panel Types (Natural Oak - ₹450/sq.ft)      │
│  4. Set Labour Charges (₹5000)                          │
│  5. Set Transportation (₹2000)                          │
│  6. Add Furniture, Lighting, Accessories                │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                    │
│                                                         │
│  materials → material_series → panel_types              │
│  modular_furniture                                      │
│  lighting_options                                       │
│  installation_accessories                               │
│  pricing_config                                         │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                 QUOTATION BUILDER (FRONTEND)            │
│                                                         │
│  1. Fetch all materials                                 │
│  2. User selects Material → Load its Series            │
│  3. User selects Series → Load its Panel Types         │
│  4. User selects Panel Type → Show rate_per_sqft       │
│  5. User enters area → Calculate cost                   │
│  6. Add to quotation                                    │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 **UI FLOW**

### **Panel Selection (1-4 Panels)**

```
┌─────────────────────────────────────────────────────────┐
│  Panel 1                                        [Remove] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Step 1: Select Material *                              │
│  ┌───────────────────────────────────────────────────┐  │
│  │ [Select Material]                            ▼    │  │
│  └───────────────────────────────────────────────────┘  │
│  Options: Wood, Glass, Metal, Stone, Laminate           │
│                                                         │
│  Step 2: Select Series *                                │
│  ┌───────────────────────────────────────────────────┐  │
│  │ [Select Series]                              ▼    │  │
│  └───────────────────────────────────────────────────┘  │
│  (Disabled until Material selected)                     │
│                                                         │
│  Step 3: Select Panel Type *                            │
│  ┌───────────────────────────────────────────────────┐  │
│  │ [Select Panel]                               ▼    │  │
│  └───────────────────────────────────────────────────┘  │
│  (Disabled until Series selected)                       │
│                                                         │
│  Step 4: Enter Area (sq.ft) *                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │ [Enter area]                                      │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  Rate: ₹450/sq.ft                                       │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Cost: ₹36,000                                    │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘

[+ Add Another Panel] (max 4)
```

---

## 💻 **IMPLEMENTATION**

### **1. Database Queries**

#### **Fetch Materials**
```javascript
const { data: materials } = await supabase
  .from('materials')
  .select('*')
  .eq('is_active', true)
  .order('display_order');
```

#### **Fetch Series for Material**
```javascript
const { data: series } = await supabase
  .from('material_series')
  .select('*')
  .eq('material_id', selectedMaterialId)
  .eq('is_active', true)
  .order('display_order');
```

#### **Fetch Panel Types for Series**
```javascript
const { data: panels } = await supabase
  .from('panel_types')
  .select('*')
  .eq('series_id', selectedSeriesId)
  .eq('is_active', true)
  .order('display_order');
```

---

### **2. State Management**

```javascript
const [selectedPanels, setSelectedPanels] = useState([
  {
    id: 1,
    materialId: null,
    material: null,
    seriesId: null,
    series: null,
    panelTypeId: null,
    panelType: null,
    area: 0,
    cost: 0
  }
]);

const [materials, setMaterials] = useState([]);
const [seriesByMaterial, setSeriesByMaterial] = useState({});
const [panelTypesBySeries, setPanelTypesBySeries] = useState({});
```

---

### **3. Panel Update Logic**

```javascript
const updatePanel = async (panelId, field, value) => {
  setSelectedPanels(prev => prev.map(panel => {
    if (panel.id !== panelId) return panel;
    
    const updated = { ...panel, [field]: value };
    
    // Reset dependent fields
    if (field === 'materialId') {
      updated.seriesId = null;
      updated.series = null;
      updated.panelTypeId = null;
      updated.panelType = null;
      updated.area = 0;
      updated.cost = 0;
      
      // Load series for this material
      loadSeriesForMaterial(value);
      
      // Find and store material object
      updated.material = materials.find(m => m.id === value);
    }
    
    if (field === 'seriesId') {
      updated.panelTypeId = null;
      updated.panelType = null;
      updated.area = 0;
      updated.cost = 0;
      
      // Load panel types for this series
      loadPanelTypesForSeries(value);
      
      // Find and store series object
      updated.series = seriesByMaterial[panel.materialId]?.find(s => s.id === value);
    }
    
    if (field === 'panelTypeId') {
      updated.area = 0;
      updated.cost = 0;
      
      // Find and store panel type object
      updated.panelType = panelTypesBySeries[panel.seriesId]?.find(p => p.id === value);
    }
    
    if (field === 'area') {
      // Calculate cost
      if (updated.panelType && value > 0) {
        updated.cost = value * updated.panelType.rate_per_sqft;
      } else {
        updated.cost = 0;
      }
    }
    
    return updated;
  }));
};
```

---

### **4. Load Functions**

```javascript
const loadSeriesForMaterial = async (materialId) => {
  if (seriesByMaterial[materialId]) return; // Already loaded
  
  const { data, error } = await supabase
    .from('material_series')
    .select('*')
    .eq('material_id', materialId)
    .eq('is_active', true)
    .order('display_order');
  
  if (!error && data) {
    setSeriesByMaterial(prev => ({
      ...prev,
      [materialId]: data
    }));
  }
};

const loadPanelTypesForSeries = async (seriesId) => {
  if (panelTypesBySeries[seriesId]) return; // Already loaded
  
  const { data, error } = await supabase
    .from('panel_types')
    .select('*')
    .eq('series_id', seriesId)
    .eq('is_active', true)
    .order('display_order');
  
  if (!error && data) {
    setPanelTypesBySeries(prev => ({
      ...prev,
      [seriesId]: data
    }));
  }
};
```

---

### **5. Panel Rendering**

```jsx
{selectedPanels.map((panel, index) => (
  <div key={panel.id} className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
    <div className="flex justify-between items-start mb-4">
      <h4 className="font-bold text-lg">Panel {index + 1}</h4>
      {selectedPanels.length > 1 && (
        <button
          onClick={() => removePanel(panel.id)}
          className="p-2 hover:bg-red-100 rounded-lg"
        >
          <X className="w-5 h-5 text-red-600" />
        </button>
      )}
    </div>

    <div className="space-y-4">
      {/* Step 1: Material */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Step 1: Select Material *
        </label>
        <select
          value={panel.materialId || ''}
          onChange={(e) => updatePanel(panel.id, 'materialId', e.target.value)}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Material</option>
          {materials.map(material => (
            <option key={material.id} value={material.id}>
              {material.name}
            </option>
          ))}
        </select>
      </div>

      {/* Step 2: Series */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Step 2: Select Series *
        </label>
        <select
          value={panel.seriesId || ''}
          onChange={(e) => updatePanel(panel.id, 'seriesId', e.target.value)}
          disabled={!panel.materialId}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Select Series</option>
          {seriesByMaterial[panel.materialId]?.map(series => (
            <option key={series.id} value={series.id}>
              {series.name}
            </option>
          ))}
        </select>
        {!panel.materialId && (
          <p className="text-xs text-gray-500 mt-1">
            Select a material first
          </p>
        )}
      </div>

      {/* Step 3: Panel Type */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Step 3: Select Panel Type *
        </label>
        <select
          value={panel.panelTypeId || ''}
          onChange={(e) => updatePanel(panel.id, 'panelTypeId', e.target.value)}
          disabled={!panel.seriesId}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Select Panel Type</option>
          {panelTypesBySeries[panel.seriesId]?.map(panelType => (
            <option key={panelType.id} value={panelType.id}>
              {panelType.name} - ₹{panelType.rate_per_sqft}/sq.ft
            </option>
          ))}
        </select>
        {!panel.seriesId && (
          <p className="text-xs text-gray-500 mt-1">
            Select a series first
          </p>
        )}
      </div>

      {/* Step 4: Area */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Step 4: Enter Area (sq.ft) *
        </label>
        <input
          type="number"
          value={panel.area || ''}
          onChange={(e) => updatePanel(panel.id, 'area', parseFloat(e.target.value) || 0)}
          disabled={!panel.panelTypeId}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="Enter area"
          min="0"
          step="0.01"
        />
        {!panel.panelTypeId && (
          <p className="text-xs text-gray-500 mt-1">
            Select a panel type first
          </p>
        )}
      </div>

      {/* Cost Display */}
      {panel.panelType && (
        <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Rate:</span>
            <span className="text-lg font-bold text-green-700">
              ₹{panel.panelType.rate_per_sqft}/sq.ft
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Total Cost:</span>
            <span className="text-2xl font-bold text-green-700">
              ₹{panel.cost.toLocaleString('en-IN')}
            </span>
          </div>
          {panel.area > 0 && (
            <p className="text-xs text-gray-600 mt-2">
              {panel.area} sq.ft × ₹{panel.panelType.rate_per_sqft} = ₹{panel.cost.toLocaleString('en-IN')}
            </p>
          )}
        </div>
      )}

      {/* Panel Preview */}
      {panel.panelType?.photo_url && (
        <div>
          <label className="block text-sm font-semibold mb-2">Panel Preview</label>
          <img
            src={panel.panelType.photo_url}
            alt={panel.panelType.name}
            className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
          />
        </div>
      )}
    </div>
  </div>
))}
```

---

## 📄 **PDF EXPORT**

### **Enhanced PDF with Three-Level Structure**

```javascript
const exportToPDF = async () => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  let yPos = 20;
  
  // Header
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('QUOTATION', 105, yPos, { align: 'center' });
  yPos += 15;
  
  // Wall Panels Section
  if (selectedPanels.some(p => p.panelTypeId)) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Wall Panels', 20, yPos);
    yPos += 7;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    selectedPanels.forEach((panel, idx) => {
      if (panel.panelType && panel.area > 0) {
        // Material > Series > Panel
        pdf.text(
          `${idx + 1}. ${panel.material.name} > ${panel.series.name} > ${panel.panelType.name}`,
          25,
          yPos
        );
        yPos += 5;
        
        // Area and Rate
        pdf.text(
          `   ${panel.area} sq.ft × ₹${panel.panelType.rate_per_sqft}/sq.ft = ₹${panel.cost.toLocaleString('en-IN')}`,
          25,
          yPos
        );
        yPos += 7;
      }
    });
    
    pdf.setFont('helvetica', 'bold');
    pdf.text(
      `Panel Total: ₹${totals.panelCost.toLocaleString('en-IN')}`,
      25,
      yPos
    );
    yPos += 10;
  }
  
  // ... rest of PDF sections
};
```

---

## 💾 **SAVE QUOTATION**

### **Database Structure**

```javascript
const quotationData = {
  user_id: user?.id,
  customer_name: customerDetails.name,
  customer_email: customerDetails.email,
  customer_phone: customerDetails.phone,
  customer_address: customerDetails.address,
  
  // Enhanced panel data with three-level structure
  panels: selectedPanels
    .filter(p => p.panelTypeId)
    .map(p => ({
      material_id: p.materialId,
      material_name: p.material.name,
      series_id: p.seriesId,
      series_name: p.series.name,
      panel_type_id: p.panelTypeId,
      panel_type_name: p.panelType.name,
      rate_per_sqft: p.panelType.rate_per_sqft,
      area: p.area,
      cost: p.cost
    })),
  
  furniture: selectedFurniture,
  lighting: selectedLighting,
  accessories: selectedAccessories,
  
  panel_cost: totals.panelCost,
  furniture_cost: totals.furnitureCost,
  lighting_cost: totals.lightingCost,
  accessories_cost: totals.accessoriesCost,
  labour_charges: totals.labourCharges,
  transportation: totals.transportation,
  subtotal: totals.subtotal,
  gst_amount: totals.gstAmount,
  total_amount: totals.total,
  status: 'draft'
};
```

---

## 🎯 **ADMIN PANEL INTEGRATION**

### **1. Materials Management**
- Create/Edit/Delete materials
- Upload thumbnails
- Set display order
- Toggle active status

### **2. Series Management**
- Link to materials
- Create/Edit/Delete series
- Upload thumbnails
- Set display order

### **3. Panel Types Management**
- Link to series
- Set rate per sq.ft
- Upload photos
- Set finish type, thickness
- Toggle active status

### **4. Pricing Configuration**
- Default labour charges
- Default transportation
- GST percentage
- Update anytime

---

## ✅ **TESTING CHECKLIST**

### **Frontend:**
- [ ] Materials dropdown loads correctly
- [ ] Series dropdown disabled until material selected
- [ ] Series loads when material selected
- [ ] Panel types dropdown disabled until series selected
- [ ] Panel types load when series selected
- [ ] Rate per sq.ft displays correctly
- [ ] Area input calculates cost correctly
- [ ] Cost updates in real-time
- [ ] Can add up to 4 panels
- [ ] Can remove panels
- [ ] Panel preview shows photo
- [ ] Cost summary updates correctly

### **Admin Panel:**
- [ ] Can create materials
- [ ] Can create series linked to materials
- [ ] Can create panel types linked to series
- [ ] Can upload photos
- [ ] Can set rates
- [ ] Can update pricing config
- [ ] Changes reflect immediately in frontend

### **PDF Export:**
- [ ] Shows Material > Series > Panel hierarchy
- [ ] Shows rate per sq.ft
- [ ] Shows area and cost
- [ ] All calculations correct
- [ ] Professional layout

### **Save Quotation:**
- [ ] Saves complete panel data
- [ ] Includes three-level structure
- [ ] Saves all costs correctly
- [ ] Generates quote number

---

## 🚀 **DEPLOYMENT STEPS**

1. **Create Database Tables:**
   - `material_series`
   - `panel_types`

2. **Update Admin Panel:**
   - Add Series Management
   - Add Panel Types Management
   - Link to Materials

3. **Update Quotation Builder:**
   - Implement three-level dropdowns
   - Update state management
   - Update cost calculations
   - Update PDF export
   - Update save quotation

4. **Test Everything:**
   - Create test data in admin
   - Test quotation builder
   - Test PDF export
   - Test save quotation

5. **Deploy:**
   - Push to GitHub
   - Deploy to Vercel
   - Verify production

---

## 📊 **SUMMARY**

### **Before:**
```
Panel Selection:
- Material dropdown (flat list)
- Area input
- Cost calculation
```

### **After:**
```
Panel Selection:
- Material dropdown (Level 1)
  ↓
- Series dropdown (Level 2)
  ↓
- Panel Type dropdown (Level 3)
  ↓
- Area input
  ↓
- Cost calculation (rate from panel type)
```

### **Benefits:**
✅ Better organization
✅ More flexibility
✅ Easier to manage
✅ Scalable structure
✅ Admin-controlled pricing
✅ Professional quotations

**System is ready for implementation!** 🎉
