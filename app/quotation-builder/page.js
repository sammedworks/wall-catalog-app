'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, ArrowRight, Check, Plus, Minus, 
  Save, FileText, Home, Sofa, Bed, DoorOpen, 
  BookOpen, Church, ChevronRight, Lightbulb,
  Package, Wrench
} from 'lucide-react';

// Area options
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
  const [currentStage, setCurrentStage] = useState(0);
  const [selectedArea, setSelectedArea] = useState(null);
  
  // Data from database
  const [panelMaterials, setPanelMaterials] = useState([]);
  const [furnitureItems, setFurnitureItems] = useState([]);
  const [lightingOptions, setLightingOptions] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [pricingConfig, setPricingConfig] = useState({ labour: 1500, transport: 500, gst: 18 });
  
  // Selections
  const [selectedPanels, setSelectedPanels] = useState([{ id: 1, material: null, area: 0, rate: 0, subtotal: 0 }]);
  const [selectedFurniture, setSelectedFurniture] = useState([]);
  const [selectedLighting, setSelectedLighting] = useState([]);
  const [selectedAccessories, setSelectedAccessories] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [panels, furniture, lighting, acc, config] = await Promise.all([
        supabase.from('panel_materials').select('*').eq('is_active', true).order('display_order'),
        supabase.from('modular_furniture').select('*').eq('is_active', true).order('display_order'),
        supabase.from('lighting_options').select('*').eq('is_active', true).order('category, display_order'),
        supabase.from('installation_accessories').select('*').eq('is_active', true).order('display_order'),
        supabase.from('pricing_config').select('*')
      ]);
      
      setPanelMaterials(panels.data || []);
      setFurnitureItems(furniture.data || []);
      setLightingOptions(lighting.data || []);
      setAccessories(acc.data || []);
      
      if (config.data) {
        const labour = config.data.find(c => c.config_key === 'labour_charges');
        const transport = config.data.find(c => c.config_key === 'transportation');
        const gst = config.data.find(c => c.config_key === 'gst');
        setPricingConfig({
          labour: labour?.config_value?.base || 1500,
          transport: transport?.config_value?.base || 500,
          gst: gst?.config_value?.percentage || 18
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Panel functions
  const addPanel = () => {
    if (selectedPanels.length < 4) {
      setSelectedPanels([...selectedPanels, { id: Date.now(), material: null, area: 0, rate: 0, subtotal: 0 }]);
    }
  };

  const removePanel = (id) => {
    if (selectedPanels.length > 1) setSelectedPanels(selectedPanels.filter(p => p.id !== id));
  };

  const updatePanel = (id, field, value) => {
    setSelectedPanels(selectedPanels.map(panel => {
      if (panel.id === id) {
        const updated = { ...panel, [field]: value };
        if (field === 'material' && value) {
          const material = panelMaterials.find(m => m.id === value);
          updated.rate = material?.rate_per_sqft || 0;
        }
        updated.subtotal = updated.area * updated.rate;
        return updated;
      }
      return panel;
    }));
  };

  // Furniture functions
  const toggleFurniture = (item, color) => {
    const key = `${item.id}-${color}`;
    const existing = selectedFurniture.find(f => `${f.id}-${f.color}` === key);
    if (existing) {
      setSelectedFurniture(selectedFurniture.filter(f => `${f.id}-${f.color}` !== key));
    } else {
      setSelectedFurniture([...selectedFurniture, { ...item, color, quantity: 1 }]);
    }
  };

  // Lighting functions
  const toggleLighting = (item) => {
    const existing = selectedLighting.find(l => l.id === item.id);
    if (existing) {
      setSelectedLighting(selectedLighting.filter(l => l.id !== item.id));
    } else {
      setSelectedLighting([...selectedLighting, { ...item, quantity: 1 }]);
    }
  };

  const updateLightingQty = (id, qty) => {
    setSelectedLighting(selectedLighting.map(l => l.id === id ? { ...l, quantity: Math.max(1, qty) } : l));
  };

  // Accessory functions
  const toggleAccessory = (item) => {
    const existing = selectedAccessories.find(a => a.id === item.id);
    if (existing) {
      setSelectedAccessories(selectedAccessories.filter(a => a.id !== item.id));
    } else {
      setSelectedAccessories([...selectedAccessories, { 
        ...item, 
        quantity: item.unit === 'fixed' ? 1 : 0,
        area: item.unit === 'per_sqft' ? 0 : null,
        subtotal: 0
      }]);
    }
  };

  const updateAccessory = (id, field, value) => {
    setSelectedAccessories(selectedAccessories.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
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

  // Cost calculation
  const calculateCosts = () => {
    const panelCost = selectedPanels.reduce((sum, p) => sum + (p.subtotal || 0), 0);
    const furnitureCost = selectedFurniture.reduce((sum, f) => sum + (f.price * f.quantity), 0);
    const lightingCost = selectedLighting.reduce((sum, l) => sum + (l.price * l.quantity), 0);
    const accessoriesCost = selectedAccessories.reduce((sum, a) => sum + (a.subtotal || 0), 0);
    const subtotal = panelCost + furnitureCost + lightingCost + accessoriesCost + pricingConfig.labour + pricingConfig.transport;
    const gstAmount = subtotal * (pricingConfig.gst / 100);
    const total = subtotal + gstAmount;
    
    return { panelCost, furnitureCost, lightingCost, accessoriesCost, labour: pricingConfig.labour, transport: pricingConfig.transport, subtotal, gstAmount, total, rounded: Math.round(total / 1000) * 1000 };
  };

  const costs = calculateCosts();

  // Navigation
  const canProceed = () => {
    if (currentStage === 0) return selectedArea !== null;
    if (currentStage === 1) return selectedPanels.some(p => p.material && p.area > 0);
    return true;
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

      const quotationData = {
        quote_number: `QT-${Date.now()}`,
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
        status: 'draft'
      };

      const { data, error } = await supabase.from('quotations').insert(quotationData).select().single();
      if (error) throw error;

      alert('Quotation saved successfully!');
      router.push(`/quotations/${data.id}`);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
              <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold">Quotation Builder</h1>
                <p className="text-xs text-gray-600">Create your custom quote</p>
              </div>
            </div>
            <div className="bg-blue-50 px-6 py-3 rounded-xl">
              <p className="text-xs text-gray-600">Running Total</p>
              <p className="text-2xl font-bold text-blue-600">₹{costs.rounded.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {['Area', 'Panels', 'Furniture', 'Lighting', 'Accessories', 'Summary'].map((stage, idx) => (
              <div key={idx} className="flex items-center">
                <div className={`flex items-center gap-2 ${idx <= currentStage ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    idx < currentStage ? 'bg-blue-600 text-white' :
                    idx === currentStage ? 'bg-blue-100 text-blue-600 border-2 border-blue-600' :
                    'bg-gray-100'
                  }`}>
                    {idx < currentStage ? <Check className="w-5 h-5" /> : idx + 1}
                  </div>
                  <span className="text-sm font-semibold hidden md:block">{stage}</span>
                </div>
                {idx < 5 && <ChevronRight className="w-5 h-5 mx-2" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stage 0: Area */}
        {currentStage === 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Select Area</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {AREAS.map((area) => {
                const Icon = area.icon;
                return (
                  <button
                    key={area.id}
                    onClick={() => setSelectedArea(area.id)}
                    className={`p-6 rounded-2xl border-2 ${
                      selectedArea === area.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <Icon className="w-12 h-12 mx-auto mb-3" />
                    <p className="font-semibold">{area.name}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Stage 1: Panels */}
        {currentStage === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Select Wall Panels</h2>
            {selectedPanels.map((panel, idx) => (
              <div key={panel.id} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between mb-4">
                  <h3 className="text-lg font-bold">Panel {idx + 1}</h3>
                  {selectedPanels.length > 1 && (
                    <button onClick={() => removePanel(panel.id)} className="text-red-600">Remove</button>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  {panelMaterials.map((mat) => (
                    <button
                      key={mat.id}
                      onClick={() => updatePanel(panel.id, 'material', mat.id)}
                      className={`p-4 rounded-xl border-2 ${
                        panel.material === mat.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="w-full h-16 rounded-lg mb-2" style={{ backgroundColor: mat.color_code }}></div>
                      <p className="font-semibold text-sm">{mat.name}</p>
                      <p className="text-xs text-gray-600">{mat.material_type}</p>
                      <p className="text-sm font-bold text-green-600">₹{mat.rate_per_sqft}/sq.ft</p>
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Wall Area (sq.ft)</label>
                    <input
                      type="number"
                      value={panel.area || ''}
                      onChange={(e) => updatePanel(panel.id, 'area', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 border-2 rounded-xl"
                      placeholder="Enter area"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Subtotal</label>
                    <div className="px-4 py-3 bg-gray-100 rounded-xl">
                      <p className="text-xl font-bold">₹{panel.subtotal.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {selectedPanels.length < 4 && (
              <button onClick={addPanel} className="w-full py-4 border-2 border-dashed rounded-2xl flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" /> Add Another Panel
              </button>
            )}
          </div>
        )}

        {/* Stage 2: Furniture */}
        {currentStage === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Modular Furniture (Optional)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {furnitureItems.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="font-bold text-lg mb-2">{item.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{item.size} - ₹{item.price.toLocaleString('en-IN')}</p>
                  <div className="flex flex-wrap gap-2">
                    {item.colors?.map((color) => (
                      <button
                        key={color}
                        onClick={() => toggleFurniture(item, color)}
                        className={`px-4 py-2 rounded-lg border-2 text-sm ${
                          selectedFurniture.find(f => f.id === item.id && f.color === color)
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stage 3: Lighting */}
        {currentStage === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Lighting Options</h2>
            {['Profile Light', 'Cove Light', 'Wall Light'].map((category) => (
              <div key={category}>
                <h3 className="text-lg font-bold mb-3">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lightingOptions.filter(l => l.category === category).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => toggleLighting(item)}
                      className={`p-4 rounded-xl border-2 text-left ${
                        selectedLighting.find(l => l.id === item.id)
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-sm font-bold text-green-600">₹{item.price.toLocaleString('en-IN')}</p>
                        </div>
                        {selectedLighting.find(l => l.id === item.id) && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const current = selectedLighting.find(l => l.id === item.id);
                                updateLightingQty(item.id, current.quantity - 1);
                              }}
                              className="p-1 bg-white rounded"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-bold">{selectedLighting.find(l => l.id === item.id).quantity}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const current = selectedLighting.find(l => l.id === item.id);
                                updateLightingQty(item.id, current.quantity + 1);
                              }}
                              className="p-1 bg-white rounded"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stage 4: Accessories */}
        {currentStage === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Installation Accessories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accessories.map((item) => (
                <div key={item.id} className={`p-4 rounded-xl border-2 ${
                  selectedAccessories.find(a => a.id === item.id) ? 'border-green-600 bg-green-50' : 'border-gray-200 bg-white'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        ₹{item.price.toLocaleString('en-IN')} {item.unit === 'fixed' ? '' : `per ${item.unit.replace('per_', '')}`}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleAccessory(item)}
                      className={`px-4 py-2 rounded-lg ${
                        selectedAccessories.find(a => a.id === item.id) ? 'bg-green-600 text-white' : 'bg-gray-200'
                      }`}
                    >
                      {selectedAccessories.find(a => a.id === item.id) ? 'Added' : 'Add'}
                    </button>
                  </div>
                  {selectedAccessories.find(a => a.id === item.id) && (
                    <div>
                      {item.unit === 'fixed' ? (
                        <input
                          type="number"
                          value={selectedAccessories.find(a => a.id === item.id).quantity}
                          onChange={(e) => updateAccessory(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full px-4 py-2 border rounded-lg"
                          placeholder="Quantity"
                          min="1"
                        />
                      ) : (
                        <input
                          type="number"
                          value={selectedAccessories.find(a => a.id === item.id).area}
                          onChange={(e) => updateAccessory(item.id, 'area', parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-2 border rounded-lg"
                          placeholder="Area (sq.ft)"
                          min="0"
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stage 5: Summary */}
        {currentStage === 5 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Cost Summary</h2>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="space-y-4">
                <div className="flex justify-between pb-3 border-b">
                  <span className="text-gray-600">Panel Cost</span>
                  <span className="font-semibold">₹{costs.panelCost.toLocaleString('en-IN')}</span>
                </div>
                {costs.furnitureCost > 0 && (
                  <div className="flex justify-between pb-3 border-b">
                    <span className="text-gray-600">Furniture Cost</span>
                    <span className="font-semibold">₹{costs.furnitureCost.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {costs.lightingCost > 0 && (
                  <div className="flex justify-between pb-3 border-b">
                    <span className="text-gray-600">Lighting Cost</span>
                    <span className="font-semibold">₹{costs.lightingCost.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {costs.accessoriesCost > 0 && (
                  <div className="flex justify-between pb-3 border-b">
                    <span className="text-gray-600">Accessories Cost</span>
                    <span className="font-semibold">₹{costs.accessoriesCost.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between pb-3 border-b">
                  <span className="text-gray-600">Labour Charges</span>
                  <span className="font-semibold">₹{costs.labour.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pb-3 border-b">
                  <span className="text-gray-600">Transportation</span>
                  <span className="font-semibold">₹{costs.transport.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pb-3 border-b">
                  <span className="text-gray-600">GST ({pricingConfig.gst}%)</span>
                  <span className="font-semibold">₹{costs.gstAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-lg font-bold">TOTAL</span>
                  <span className="text-2xl font-bold text-blue-600">₹{costs.rounded.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <button
                  onClick={saveQuotation}
                  disabled={saving}
                  className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  {saving ? 'Saving...' : 'Create Quote'}
                </button>
                <button className="w-full py-4 bg-gray-100 rounded-xl font-semibold flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" />
                  Save Design
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <button
            onClick={prevStage}
            disabled={currentStage === 0}
            className="px-6 py-3 bg-gray-100 rounded-xl font-semibold disabled:opacity-50 flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" /> Previous
          </button>
          <button
            onClick={nextStage}
            disabled={!canProceed()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold disabled:opacity-50 flex items-center gap-2"
          >
            Next <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
