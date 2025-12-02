'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, ArrowRight, Check, Plus, Minus, 
  Save, FileText, Home, Sofa, Bed, DoorOpen, 
  BookOpen, Church, ChevronRight 
} from 'lucide-react';

// Area options with icons
const AREAS = [
  { id: 'tv-unit', name: 'TV Unit', icon: Home },
  { id: 'living-room', name: 'Living Room', icon: Sofa },
  { id: 'bedroom', name: 'Bedroom', icon: Bed },
  { id: 'entrance', name: 'Entrance', icon: DoorOpen },
  { id: 'study', name: 'Study', icon: BookOpen },
  { id: 'mandir', name: 'Mandir', icon: Church },
];

export default function QuotationBuilder() {
  const router = useRouter();
  
  // Stage management
  const [currentStage, setCurrentStage] = useState(0); // 0=Area, 1=Panels, 2=Furniture, 3=Lighting, 4=Accessories, 5=Summary
  
  // Area selection
  const [selectedArea, setSelectedArea] = useState(null);
  
  // Stage 1: Panels
  const [panelMaterials, setPanelMaterials] = useState([]);
  const [selectedPanels, setSelectedPanels] = useState([
    { id: 1, material: null, area: 0, rate: 0, subtotal: 0 }
  ]);
  
  // Stage 2: Furniture
  const [furnitureItems, setFurnitureItems] = useState([]);
  const [selectedFurniture, setSelectedFurniture] = useState([]);
  
  // Stage 3: Lighting
  const [lightingOptions, setLightingOptions] = useState([]);
  const [selectedLighting, setSelectedLighting] = useState([]);
  
  // Stage 4: Accessories
  const [accessories, setAccessories] = useState([]);
  const [selectedAccessories, setSelectedAccessories] = useState([]);
  
  // Stage 5: Pricing config
  const [pricingConfig, setPricingConfig] = useState({
    labour: 1500,
    transport: 500,
    gst: 18
  });
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load all data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // Load panel materials
      const { data: panels } = await supabase
        .from('panel_materials')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      setPanelMaterials(panels || []);
      
      // Load furniture
      const { data: furniture } = await supabase
        .from('modular_furniture')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      setFurnitureItems(furniture || []);
      
      // Load lighting
      const { data: lighting } = await supabase
        .from('lighting_options')
        .select('*')
        .eq('is_active', true)
        .order('category, display_order');
      setLightingOptions(lighting || []);
      
      // Load accessories
      const { data: acc } = await supabase
        .from('installation_accessories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      setAccessories(acc || []);
      
      // Load pricing config
      const { data: config } = await supabase
        .from('pricing_config')
        .select('*');
      
      if (config) {
        const labourConfig = config.find(c => c.config_key === 'labour_charges');
        const transportConfig = config.find(c => c.config_key === 'transportation');
        const gstConfig = config.find(c => c.config_key === 'gst');
        
        setPricingConfig({
          labour: labourConfig?.config_value?.base || 1500,
          transport: transportConfig?.config_value?.base || 500,
          gst: gstConfig?.config_value?.percentage || 18
        });
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Panel management
  const addPanel = () => {
    if (selectedPanels.length < 4) {
      setSelectedPanels([
        ...selectedPanels,
        { id: Date.now(), material: null, area: 0, rate: 0, subtotal: 0 }
      ]);
    }
  };

  const removePanel = (id) => {
    if (selectedPanels.length > 1) {
      setSelectedPanels(selectedPanels.filter(p => p.id !== id));
    }
  };

  const updatePanel = (id, field, value) => {
    setSelectedPanels(selectedPanels.map(panel => {
      if (panel.id === id) {
        const updated = { ...panel, [field]: value };
        
        // If material changed, update rate
        if (field === 'material' && value) {
          const material = panelMaterials.find(m => m.id === value);
          updated.rate = material?.rate_per_sqft || 0;
        }
        
        // Recalculate subtotal
        updated.subtotal = updated.area * updated.rate;
        
        return updated;
      }
      return panel;
    }));
  };

  // Furniture management
  const toggleFurniture = (item, color) => {
    const existing = selectedFurniture.find(
      f => f.id === item.id && f.color === color
    );
    
    if (existing) {
      setSelectedFurniture(selectedFurniture.filter(
        f => !(f.id === item.id && f.color === color)
      ));
    } else {
      setSelectedFurniture([
        ...selectedFurniture,
        {
          id: item.id,
          name: item.name,
          size: item.size,
          price: item.price,
          color: color,
          quantity: 1
        }
      ]);
    }
  };

  // Lighting management
  const toggleLighting = (item) => {
    const existing = selectedLighting.find(l => l.id === item.id);
    
    if (existing) {
      setSelectedLighting(selectedLighting.filter(l => l.id !== item.id));
    } else {
      setSelectedLighting([
        ...selectedLighting,
        {
          id: item.id,
          name: item.name,
          category: item.category,
          price: item.price,
          quantity: 1
        }
      ]);
    }
  };

  const updateLightingQuantity = (id, quantity) => {
    setSelectedLighting(selectedLighting.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
    ));
  };

  // Accessories management
  const toggleAccessory = (item) => {
    const existing = selectedAccessories.find(a => a.id === item.id);
    
    if (existing) {
      setSelectedAccessories(selectedAccessories.filter(a => a.id !== item.id));
    } else {
      setSelectedAccessories([
        ...selectedAccessories,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          unit: item.unit,
          quantity: item.unit === 'fixed' ? 1 : 0,
          area: item.unit === 'per_sqft' ? 0 : null
        }
      ]);
    }
  };

  const updateAccessory = (id, field, value) => {
    setSelectedAccessories(selectedAccessories.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        
        // Calculate subtotal
        if (item.unit === 'fixed') {
          updated.subtotal = item.price * updated.quantity;
        } else if (item.unit === 'per_sqft') {
          updated.subtotal = item.price * updated.area;
        }
        
        return updated;
      }
      return item;
    }));
  };

  // Cost calculations
  const calculateCosts = () => {
    // Panel cost
    const panelCost = selectedPanels.reduce((sum, p) => sum + (p.subtotal || 0), 0);
    
    // Furniture cost
    const furnitureCost = selectedFurniture.reduce((sum, f) => sum + (f.price * f.quantity), 0);
    
    // Lighting cost
    const lightingCost = selectedLighting.reduce((sum, l) => sum + (l.price * l.quantity), 0);
    
    // Accessories cost
    const accessoriesCost = selectedAccessories.reduce((sum, a) => {
      if (a.unit === 'fixed') {
        return sum + (a.price * a.quantity);
      } else if (a.unit === 'per_sqft') {
        return sum + (a.price * a.area);
      }
      return sum;
    }, 0);
    
    // Subtotal
    const subtotal = panelCost + furnitureCost + lightingCost + accessoriesCost + pricingConfig.labour + pricingConfig.transport;
    
    // GST
    const gstAmount = subtotal * (pricingConfig.gst / 100);
    
    // Total
    const total = subtotal + gstAmount;
    
    return {
      panelCost,
      furnitureCost,
      lightingCost,
      accessoriesCost,
      labour: pricingConfig.labour,
      transport: pricingConfig.transport,
      subtotal,
      gstAmount,
      total,
      rounded: Math.round(total / 1000) * 1000
    };
  };

  const costs = calculateCosts();

  // Navigation
  const canProceed = () => {
    switch (currentStage) {
      case 0: return selectedArea !== null;
      case 1: return selectedPanels.some(p => p.material && p.area > 0);
      case 2: return true; // Optional
      case 3: return true; // Optional
      case 4: return true; // Optional
      default: return true;
    }
  };

  const nextStage = () => {
    if (canProceed() && currentStage < 5) {
      setCurrentStage(currentStage + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStage = () => {
    if (currentStage > 0) {
      setCurrentStage(currentStage - 1);
      window.scrollTo(0, 0);
    }
  };

  // Save quotation
  const saveQuotation = async () => {
    try {
      setSaving(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('Please login to save quotation');
        return;
      }

      // Generate quote number
      const { data: quoteNum } = await supabase.rpc('generate_quote_number');
      
      const quotationData = {
        quote_number: quoteNum || `QT-${Date.now()}`,
        customer_id: user.id,
        selected_area: selectedArea,
        panels: selectedPanels.filter(p => p.material && p.area > 0),
        furniture: selectedFurniture,
        lighting: selectedLighting,
        accessories: selectedAccessories,
        panel_cost: costs.panelCost,
        furniture_cost: costs.furnitureCost,
        lighting_cost: costs.lightingCost,
        accessories_cost: costs.accessoriesCost,
        labour_charges: costs.labour,
        transportation: costs.transport,
        subtotal: costs.subtotal,
        gst_percentage: pricingConfig.gst,
        gst_amount: costs.gstAmount,
        total_amount: costs.total,
        status: 'draft',
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      const { data, error } = await supabase
        .from('quotations')
        .insert(quotationData)
        .select()
        .single();

      if (error) throw error;

      alert('Quotation saved successfully!');
      router.push(`/quotation/${data.id}`);
      
    } catch (error) {
      console.error('Error saving quotation:', error);
      alert('Failed to save quotation: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quotation builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Quotation Builder</h1>
                <p className="text-xs text-gray-600">Create your custom quote</p>
              </div>
            </div>
            
            {/* Running Total */}
            <div className="bg-blue-50 px-6 py-3 rounded-xl">
              <p className="text-xs text-gray-600 mb-1">Running Total</p>
              <p className="text-2xl font-bold text-blue-600">
                ₹{costs.rounded.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {['Area', 'Panels', 'Furniture', 'Lighting', 'Accessories', 'Summary'].map((stage, idx) => (
              <div key={idx} className="flex items-center">
                <div className={`flex items-center gap-2 ${idx <= currentStage ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    idx < currentStage ? 'bg-blue-600 text-white' :
                    idx === currentStage ? 'bg-blue-100 text-blue-600 border-2 border-blue-600' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {idx < currentStage ? <Check className="w-5 h-5" /> : idx + 1}
                  </div>
                  <span className="text-sm font-semibold hidden md:block">{stage}</span>
                </div>
                {idx < 5 && (
                  <ChevronRight className={`w-5 h-5 mx-2 ${idx < currentStage ? 'text-blue-600' : 'text-gray-300'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stage 0: Area Selection */}
        {currentStage === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Area</h2>
              <p className="text-gray-600">Choose the space you want to design</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {AREAS.map((area) => {
                const Icon = area.icon;
                return (
                  <button
                    key={area.id}
                    onClick={() => setSelectedArea(area.id)}
                    className={`p-6 rounded-2xl border-2 transition-all ${
                      selectedArea === area.id
                        ? 'border-blue-600 bg-blue-50 shadow-lg'
                        : 'border-gray-200 hover:border-blue-300 bg-white'
                    }`}
                  >
                    <Icon className={`w-12 h-12 mx-auto mb-3 ${
                      selectedArea === area.id ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <p className="font-semibold text-gray-900">{area.name}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Stage 1: Panel Selection */}
        {currentStage === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Wall Panels</h2>
              <p className="text-gray-600">Add up to 4 wall panels with different materials and areas</p>
            </div>

            {selectedPanels.map((panel, idx) => (
              <div key={panel.id} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Panel {idx + 1}</h3>
                  {selectedPanels.length > 1 && (
                    <button
                      onClick={() => removePanel(panel.id)}
                      className="text-red-600 hover:text-red-700 font-semibold"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Material Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Select Material</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {panelMaterials.map((material) => (
                      <button
                        key={material.id}
                        onClick={() => updatePanel(panel.id, 'material', material.id)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          panel.material === material.id
                            ? 'border-blue-600 bg-blue-50 shadow-lg'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div
                          className="w-full h-16 rounded-lg mb-2"
                          style={{ backgroundColor: material.color_code }}
                        ></div>
                        <p className="font-semibold text-sm text-gray-900">{material.name}</p>
                        <p className="text-xs text-gray-600">{material.material_type}</p>
                        <p className="text-sm font-bold text-green-600 mt-1">
                          ₹{material.rate_per_sqft}/sq.ft
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Area Input */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Wall Area (sq.ft)</label>
                    <input
                      type="number"
                      value={panel.area || ''}
                      onChange={(e) => updatePanel(panel.id, 'area', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter area"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subtotal</label>
                    <div className="px-4 py-3 bg-gray-100 rounded-xl">
                      <p className="text-xl font-bold text-gray-900">
                        ₹{panel.subtotal.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {selectedPanels.length < 4 && (
              <button
                onClick={addPanel}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 font-semibold"
              >
                <Plus className="w-5 h-5" />
                Add Another Panel
              </button>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={prevStage}
            disabled={currentStage === 0}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Previous
          </button>

          <button
            onClick={nextStage}
            disabled={!canProceed()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Next
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
