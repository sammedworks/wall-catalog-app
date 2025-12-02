'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronDown, ChevronUp, Download, Save, Plus, Minus, X } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function QuotationBuilderPage() {
  // State Management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    panels: true,
    furniture: false,
    lighting: false,
    accessories: false,
    summary: false
  });

  // Data from Admin
  const [panelMaterials, setPanelMaterials] = useState([]);
  const [furniture, setFurniture] = useState([]);
  const [lighting, setLighting] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [pricingConfig, setPricingConfig] = useState({});

  // User Selections
  const [selectedPanels, setSelectedPanels] = useState([
    { id: 1, materialId: null, area: 0, material: null }
  ]);
  const [selectedFurniture, setSelectedFurniture] = useState([]);
  const [selectedLighting, setSelectedLighting] = useState([]);
  const [selectedAccessories, setSelectedAccessories] = useState([]);

  // Customer Details
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  // Load all data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      const [panelsRes, furnRes, lightRes, accRes, configRes] = await Promise.all([
        supabase.from('panel_materials').select('*').eq('is_active', true).order('display_order'),
        supabase.from('modular_furniture').select('*').eq('is_active', true).order('display_order'),
        supabase.from('lighting_options').select('*').eq('is_active', true).order('category, display_order'),
        supabase.from('installation_accessories').select('*').eq('is_active', true).order('display_order'),
        supabase.from('pricing_config').select('*')
      ]);

      if (panelsRes.error) throw panelsRes.error;
      if (furnRes.error) throw furnRes.error;
      if (lightRes.error) throw lightRes.error;
      if (accRes.error) throw accRes.error;
      if (configRes.error) throw configRes.error;

      setPanelMaterials(panelsRes.data || []);
      setFurniture(furnRes.data || []);
      setLighting(lightRes.data || []);
      setAccessories(accRes.data || []);

      // Parse pricing config
      const config = {};
      configRes.data?.forEach(item => {
        config[item.config_key] = item.config_value;
      });
      setPricingConfig(config);

    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Panel Management
  const addPanel = () => {
    if (selectedPanels.length < 4) {
      setSelectedPanels([...selectedPanels, { 
        id: Date.now(), 
        materialId: null, 
        area: 0, 
        material: null 
      }]);
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
        if (field === 'materialId') {
          const material = panelMaterials.find(m => m.id === parseInt(value));
          return { ...panel, materialId: value, material };
        }
        return { ...panel, [field]: value };
      }
      return panel;
    }));
  };

  // Furniture Management
  const toggleFurniture = (item) => {
    const exists = selectedFurniture.find(f => f.id === item.id);
    if (exists) {
      setSelectedFurniture(selectedFurniture.filter(f => f.id !== item.id));
    } else {
      setSelectedFurniture([...selectedFurniture, { 
        ...item, 
        quantity: 1, 
        selectedColor: item.colors?.[0] || 'Default' 
      }]);
    }
  };

  const updateFurnitureQuantity = (id, quantity) => {
    setSelectedFurniture(selectedFurniture.map(f => 
      f.id === id ? { ...f, quantity: Math.max(1, quantity) } : f
    ));
  };

  const updateFurnitureColor = (id, color) => {
    setSelectedFurniture(selectedFurniture.map(f => 
      f.id === id ? { ...f, selectedColor: color } : f
    ));
  };

  // Lighting Management
  const toggleLighting = (item) => {
    const exists = selectedLighting.find(l => l.id === item.id);
    if (exists) {
      setSelectedLighting(selectedLighting.filter(l => l.id !== item.id));
    } else {
      setSelectedLighting([...selectedLighting, { ...item, quantity: 1 }]);
    }
  };

  const updateLightingQuantity = (id, quantity) => {
    setSelectedLighting(selectedLighting.map(l => 
      l.id === id ? { ...l, quantity: Math.max(1, quantity) } : l
    ));
  };

  // Accessories Management
  const toggleAccessory = (item) => {
    const exists = selectedAccessories.find(a => a.id === item.id);
    if (exists) {
      setSelectedAccessories(selectedAccessories.filter(a => a.id !== item.id));
    } else {
      setSelectedAccessories([...selectedAccessories, { 
        ...item, 
        quantity: 1, 
        area: 0 
      }]);
    }
  };

  const updateAccessory = (id, field, value) => {
    setSelectedAccessories(selectedAccessories.map(a => 
      a.id === id ? { ...a, [field]: Math.max(0, value) } : a
    ));
  };

  // Cost Calculations
  const calculatePanelCost = () => {
    return selectedPanels.reduce((total, panel) => {
      if (panel.material && panel.area > 0) {
        return total + (panel.area * panel.material.rate_per_sqft);
      }
      return total;
    }, 0);
  };

  const calculateFurnitureCost = () => {
    return selectedFurniture.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const calculateLightingCost = () => {
    return selectedLighting.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const calculateAccessoriesCost = () => {
    return selectedAccessories.reduce((total, item) => {
      if (item.unit === 'fixed') {
        return total + (item.price * item.quantity);
      } else if (item.unit === 'per_sqft') {
        return total + (item.price * item.area);
      } else if (item.unit === 'per_meter') {
        return total + (item.price * item.area);
      }
      return total;
    }, 0);
  };

  const calculateTotals = () => {
    const panelCost = calculatePanelCost();
    const furnitureCost = calculateFurnitureCost();
    const lightingCost = calculateLightingCost();
    const accessoriesCost = calculateAccessoriesCost();
    
    const materialCost = panelCost + furnitureCost + lightingCost + accessoriesCost;
    const labourCharges = pricingConfig.labour_charges?.base || 1500;
    const transportation = pricingConfig.transportation?.base || 500;
    
    const subtotal = materialCost + labourCharges + transportation;
    const gstPercentage = pricingConfig.gst?.percentage || 18;
    const gstAmount = subtotal * (gstPercentage / 100);
    const total = subtotal + gstAmount;
    const roundedTotal = Math.round(total / 1000) * 1000;

    return {
      panelCost,
      furnitureCost,
      lightingCost,
      accessoriesCost,
      materialCost,
      labourCharges,
      transportation,
      subtotal,
      gstPercentage,
      gstAmount,
      total,
      roundedTotal
    };
  };

  // Save Quotation
  const saveQuotation = async () => {
    try {
      setSaving(true);
      
      const totals = calculateTotals();
      const { data: { user } } = await supabase.auth.getUser();

      const quotationData = {
        user_id: user?.id,
        customer_name: customerDetails.name,
        customer_email: customerDetails.email,
        customer_phone: customerDetails.phone,
        customer_address: customerDetails.address,
        panels: selectedPanels.filter(p => p.materialId),
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

      const { data, error } = await supabase
        .from('quotations')
        .insert(quotationData)
        .select()
        .single();

      if (error) throw error;

      alert('Quotation saved successfully! Quote #' + data.quote_number);
      
    } catch (error) {
      console.error('Error saving quotation:', error);
      alert('Failed to save quotation: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Export to PDF
  const exportToPDF = async () => {
    try {
      const totals = calculateTotals();
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('QUOTATION', 105, 20, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);
      
      // Customer Details
      let yPos = 40;
      if (customerDetails.name) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Customer Details:', 20, yPos);
        yPos += 7;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Name: ${customerDetails.name}`, 20, yPos);
        yPos += 5;
        if (customerDetails.email) {
          pdf.text(`Email: ${customerDetails.email}`, 20, yPos);
          yPos += 5;
        }
        if (customerDetails.phone) {
          pdf.text(`Phone: ${customerDetails.phone}`, 20, yPos);
          yPos += 5;
        }
        if (customerDetails.address) {
          pdf.text(`Address: ${customerDetails.address}`, 20, yPos);
          yPos += 5;
        }
        yPos += 5;
      }

      // Panels Section
      if (selectedPanels.some(p => p.materialId)) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Wall Panels:', 20, yPos);
        yPos += 7;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        selectedPanels.forEach((panel, idx) => {
          if (panel.material && panel.area > 0) {
            const cost = panel.area * panel.material.rate_per_sqft;
            pdf.text(
              `${idx + 1}. ${panel.material.name} - ${panel.area} sq.ft @ ₹${panel.material.rate_per_sqft}/sq.ft = ₹${cost.toLocaleString('en-IN')}`,
              25, yPos
            );
            yPos += 5;
          }
        });
        pdf.text(`Panel Total: ₹${totals.panelCost.toLocaleString('en-IN')}`, 25, yPos);
        yPos += 10;
      }

      // Furniture Section
      if (selectedFurniture.length > 0) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Modular Furniture:', 20, yPos);
        yPos += 7;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        selectedFurniture.forEach((item, idx) => {
          const cost = item.price * item.quantity;
          pdf.text(
            `${idx + 1}. ${item.name} (${item.selectedColor}) - ${item.quantity} × ₹${item.price.toLocaleString('en-IN')} = ₹${cost.toLocaleString('en-IN')}`,
            25, yPos
          );
          yPos += 5;
        });
        pdf.text(`Furniture Total: ₹${totals.furnitureCost.toLocaleString('en-IN')}`, 25, yPos);
        yPos += 10;
      }

      // Lighting Section
      if (selectedLighting.length > 0) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Lighting:', 20, yPos);
        yPos += 7;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        selectedLighting.forEach((item, idx) => {
          const cost = item.price * item.quantity;
          pdf.text(
            `${idx + 1}. ${item.name} - ${item.quantity} × ₹${item.price.toLocaleString('en-IN')} = ₹${cost.toLocaleString('en-IN')}`,
            25, yPos
          );
          yPos += 5;
        });
        pdf.text(`Lighting Total: ₹${totals.lightingCost.toLocaleString('en-IN')}`, 25, yPos);
        yPos += 10;
      }

      // Accessories Section
      if (selectedAccessories.length > 0) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Accessories:', 20, yPos);
        yPos += 7;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        selectedAccessories.forEach((item, idx) => {
          let cost = 0;
          let detail = '';
          if (item.unit === 'fixed') {
            cost = item.price * item.quantity;
            detail = `${item.quantity} × ₹${item.price.toLocaleString('en-IN')}`;
          } else if (item.unit === 'per_sqft') {
            cost = item.price * item.area;
            detail = `${item.area} sq.ft × ₹${item.price.toLocaleString('en-IN')}/sq.ft`;
          } else if (item.unit === 'per_meter') {
            cost = item.price * item.area;
            detail = `${item.area} m × ₹${item.price.toLocaleString('en-IN')}/m`;
          }
          pdf.text(
            `${idx + 1}. ${item.name} - ${detail} = ₹${cost.toLocaleString('en-IN')}`,
            25, yPos
          );
          yPos += 5;
        });
        pdf.text(`Accessories Total: ₹${totals.accessoriesCost.toLocaleString('en-IN')}`, 25, yPos);
        yPos += 10;
      }

      // Cost Breakdown
      yPos += 5;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Cost Breakdown:', 20, yPos);
      yPos += 7;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Material Cost: ₹${totals.materialCost.toLocaleString('en-IN')}`, 25, yPos);
      yPos += 5;
      pdf.text(`Labour Charges: ₹${totals.labourCharges.toLocaleString('en-IN')}`, 25, yPos);
      yPos += 5;
      pdf.text(`Transportation: ₹${totals.transportation.toLocaleString('en-IN')}`, 25, yPos);
      yPos += 5;
      pdf.text(`Subtotal: ₹${totals.subtotal.toLocaleString('en-IN')}`, 25, yPos);
      yPos += 5;
      pdf.text(`GST (${totals.gstPercentage}%): ₹${totals.gstAmount.toLocaleString('en-IN')}`, 25, yPos);
      yPos += 7;
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`TOTAL: ₹${totals.roundedTotal.toLocaleString('en-IN')}`, 25, yPos);

      // Save PDF
      pdf.save(`Quotation_${Date.now()}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading quotation builder...</p>
        </div>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quotation Builder</h1>
              <p className="text-gray-600 mt-1">Create your custom wall panel quotation</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-3xl font-bold text-blue-600">
                  ₹{totals.roundedTotal.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={saveQuotation}
                  disabled={saving || selectedPanels.every(p => !p.materialId)}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : 'Save Quote'}
                </button>
                <button
                  onClick={exportToPDF}
                  disabled={selectedPanels.every(p => !p.materialId)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                >
                  <Download className="w-5 h-5" />
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Customer Details Section */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection('customer')}
            className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-all"
          >
            <h2 className="text-xl font-bold text-gray-900">Customer Details (Optional)</h2>
            {expandedSections.customer ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
          </button>
          
          {expandedSections.customer && (
            <div className="p-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Name</label>
                  <input
                    type="text"
                    value={customerDetails.name}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Customer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    value={customerDetails.email}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="customer@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Phone</label>
                  <input
                    type="tel"
                    value={customerDetails.phone}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+91 1234567890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Address</label>
                  <input
                    type="text"
                    value={customerDetails.address}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, address: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Customer address"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PANELS SECTION - MAIN FOCUS */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 overflow-hidden border-4 border-blue-500">
          <button
            onClick={() => toggleSection('panels')}
            className="w-full px-6 py-5 flex justify-between items-center bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <div className="text-left">
                <h2 className="text-2xl font-bold text-gray-900">Wall Panels</h2>
                <p className="text-sm text-gray-600">Select materials and enter wall areas (1-4 panels)</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-blue-600">
                ₹{totals.panelCost.toLocaleString('en-IN')}
              </span>
              {expandedSections.panels ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
            </div>
          </button>
          
          {expandedSections.panels && (
            <div className="p-6 border-t-4 border-blue-200">
              {/* Panel Materials Grid */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-4">Available Panel Materials</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {panelMaterials.map((material) => (
                    <div
                      key={material.id}
                      className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer"
                    >
                      {/* Photo Preview */}
                      {material.photo_url ? (
                        <img
                          src={material.photo_url}
                          alt={material.name}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                      ) : (
                        <div
                          className="w-full h-32 rounded-lg mb-3"
                          style={{ backgroundColor: material.color_code || '#ccc' }}
                        ></div>
                      )}
                      
                      <h4 className="font-bold text-gray-900">{material.name}</h4>
                      <p className="text-sm text-gray-600">{material.material_type}</p>
                      <p className="text-lg font-bold text-green-600 mt-2">
                        ₹{material.rate_per_sqft}/sq.ft
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Panels */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold">Your Wall Panels ({selectedPanels.length}/4)</h3>
                  <button
                    onClick={addPanel}
                    disabled={selectedPanels.length >= 4}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Panel
                  </button>
                </div>

                {selectedPanels.map((panel, index) => (
                  <div key={panel.id} className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-bold text-lg">Panel {index + 1}</h4>
                      {selectedPanels.length > 1 && (
                        <button
                          onClick={() => removePanel(panel.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-all"
                        >
                          <X className="w-5 h-5 text-red-600" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Material *</label>
                        <select
                          value={panel.materialId || ''}
                          onChange={(e) => updatePanel(panel.id, 'materialId', e.target.value)}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select material</option>
                          {panelMaterials.map((material) => (
                            <option key={material.id} value={material.id}>
                              {material.name} - ₹{material.rate_per_sqft}/sq.ft
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">Area (sq.ft) *</label>
                        <input
                          type="number"
                          value={panel.area || ''}
                          onChange={(e) => updatePanel(panel.id, 'area', parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter area"
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">Cost</label>
                        <div className="px-4 py-2 bg-green-100 border-2 border-green-300 rounded-lg">
                          <span className="text-lg font-bold text-green-700">
                            ₹{panel.material && panel.area > 0 
                              ? (panel.area * panel.material.rate_per_sqft).toLocaleString('en-IN')
                              : '0'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FURNITURE SECTION */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection('furniture')}
            className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-white">2</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Modular Furniture (Optional)</h2>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xl font-bold text-purple-600">
                ₹{totals.furnitureCost.toLocaleString('en-IN')}
              </span>
              {expandedSections.furniture ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
            </div>
          </button>
          
          {expandedSections.furniture && (
            <div className="p-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {furniture.map((item) => {
                  const isSelected = selectedFurniture.find(f => f.id === item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleFurniture(item)}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-purple-500 bg-purple-50 shadow-lg' 
                          : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                      }`}
                    >
                      <h4 className="font-bold text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">{item.size}</p>
                      <p className="text-lg font-bold text-green-600 mt-2">
                        ₹{item.price?.toLocaleString('en-IN')}
                      </p>
                      {item.colors && item.colors.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.colors.slice(0, 4).map((color, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs">
                              {color}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Selected Furniture */}
              {selectedFurniture.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold">Selected Furniture</h3>
                  {selectedFurniture.map((item) => (
                    <div key={item.id} className="bg-purple-50 rounded-lg p-4 flex justify-between items-center">
                      <div className="flex-1">
                        <h4 className="font-bold">{item.name}</h4>
                        <div className="flex gap-4 mt-2">
                          <div>
                            <label className="text-xs text-gray-600">Quantity</label>
                            <div className="flex items-center gap-2 mt-1">
                              <button
                                onClick={() => updateFurnitureQuantity(item.id, item.quantity - 1)}
                                className="p-1 bg-white rounded hover:bg-gray-100"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="font-bold w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateFurnitureQuantity(item.id, item.quantity + 1)}
                                className="p-1 bg-white rounded hover:bg-gray-100"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {item.colors && item.colors.length > 0 && (
                            <div>
                              <label className="text-xs text-gray-600">Color</label>
                              <select
                                value={item.selectedColor}
                                onChange={(e) => updateFurnitureColor(item.id, e.target.value)}
                                className="mt-1 px-3 py-1 border rounded"
                              >
                                {item.colors.map((color) => (
                                  <option key={color} value={color}>{color}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="text-xl font-bold text-green-600">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* LIGHTING SECTION */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection('lighting')}
            className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-white">3</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Lighting Options (Optional)</h2>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xl font-bold text-yellow-600">
                ₹{totals.lightingCost.toLocaleString('en-IN')}
              </span>
              {expandedSections.lighting ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
            </div>
          </button>
          
          {expandedSections.lighting && (
            <div className="p-6 border-t border-gray-200">
              {['Profile Light', 'Cove Light', 'Wall Light'].map((category) => {
                const items = lighting.filter(l => l.category === category);
                if (items.length === 0) return null;
                
                return (
                  <div key={category} className="mb-6">
                    <h3 className="text-lg font-bold mb-3">{category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {items.map((item) => {
                        const isSelected = selectedLighting.find(l => l.id === item.id);
                        return (
                          <div
                            key={item.id}
                            onClick={() => toggleLighting(item)}
                            className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                              isSelected 
                                ? 'border-yellow-500 bg-yellow-50 shadow-lg' 
                                : 'border-gray-200 hover:border-yellow-300 hover:shadow-md'
                            }`}
                          >
                            <h4 className="font-bold text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-600">{item.unit}</p>
                            <p className="text-lg font-bold text-green-600 mt-2">
                              ₹{item.price?.toLocaleString('en-IN')}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Selected Lighting */}
              {selectedLighting.length > 0 && (
                <div className="space-y-3 mt-6">
                  <h3 className="text-lg font-bold">Selected Lighting</h3>
                  {selectedLighting.map((item) => (
                    <div key={item.id} className="bg-yellow-50 rounded-lg p-4 flex justify-between items-center">
                      <div className="flex-1">
                        <h4 className="font-bold">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-2">
                          <label className="text-xs text-gray-600">Quantity</label>
                          <button
                            onClick={() => updateLightingQuantity(item.id, item.quantity - 1)}
                            className="p-1 bg-white rounded hover:bg-gray-100"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-bold w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateLightingQuantity(item.id, item.quantity + 1)}
                            className="p-1 bg-white rounded hover:bg-gray-100"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="text-xl font-bold text-green-600">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ACCESSORIES SECTION */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection('accessories')}
            className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-white">4</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Installation Accessories (Optional)</h2>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xl font-bold text-orange-600">
                ₹{totals.accessoriesCost.toLocaleString('en-IN')}
              </span>
              {expandedSections.accessories ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
            </div>
          </button>
          
          {expandedSections.accessories && (
            <div className="p-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {accessories.map((item) => {
                  const isSelected = selectedAccessories.find(a => a.id === item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleAccessory(item)}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-orange-500 bg-orange-50 shadow-lg' 
                          : 'border-gray-200 hover:border-orange-300 hover:shadow-md'
                      }`}
                    >
                      <h4 className="font-bold text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">
                        {item.unit === 'fixed' ? 'Fixed Price' : item.unit.replace('per_', 'Per ')}
                      </p>
                      <p className="text-lg font-bold text-green-600 mt-2">
                        ₹{item.price?.toLocaleString('en-IN')}
                        {item.unit !== 'fixed' && `/${item.unit.replace('per_', '')}`}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Selected Accessories */}
              {selectedAccessories.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold">Selected Accessories</h3>
                  {selectedAccessories.map((item) => (
                    <div key={item.id} className="bg-orange-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold">{item.name}</h4>
                        <p className="text-xl font-bold text-green-600">
                          ₹{(item.unit === 'fixed' 
                            ? item.price * item.quantity 
                            : item.price * item.area
                          ).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="flex gap-4">
                        {item.unit === 'fixed' ? (
                          <div>
                            <label className="text-xs text-gray-600">Quantity</label>
                            <div className="flex items-center gap-2 mt-1">
                              <button
                                onClick={() => updateAccessory(item.id, 'quantity', item.quantity - 1)}
                                className="p-1 bg-white rounded hover:bg-gray-100"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="font-bold w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateAccessory(item.id, 'quantity', item.quantity + 1)}
                                className="p-1 bg-white rounded hover:bg-gray-100"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <label className="text-xs text-gray-600">
                              {item.unit === 'per_sqft' ? 'Area (sq.ft)' : 'Length (m)'}
                            </label>
                            <input
                              type="number"
                              value={item.area || ''}
                              onChange={(e) => updateAccessory(item.id, 'area', parseFloat(e.target.value) || 0)}
                              className="mt-1 px-3 py-1 border rounded w-24"
                              min="0"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* SUMMARY SECTION */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-xl overflow-hidden border-4 border-blue-300">
          <button
            onClick={() => toggleSection('summary')}
            className="w-full px-6 py-5 flex justify-between items-center hover:bg-blue-100 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">5</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Cost Summary</h2>
            </div>
            {expandedSections.summary ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
          </button>
          
          {expandedSections.summary && (
            <div className="p-6 border-t-4 border-blue-200">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Panel Cost:</span>
                  <span className="font-bold text-lg">₹{totals.panelCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Furniture Cost:</span>
                  <span className="font-bold text-lg">₹{totals.furnitureCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Lighting Cost:</span>
                  <span className="font-bold text-lg">₹{totals.lightingCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Accessories Cost:</span>
                  <span className="font-bold text-lg">₹{totals.accessoriesCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t-2 border-gray-300 pt-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-700">Material Cost:</span>
                    <span className="font-bold text-lg">₹{totals.materialCost.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-700">Labour Charges:</span>
                    <span className="font-bold text-lg">₹{totals.labourCharges.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-700">Transportation:</span>
                    <span className="font-bold text-lg">₹{totals.transportation.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div className="border-t-2 border-gray-300 pt-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-700">Subtotal:</span>
                    <span className="font-bold text-lg">₹{totals.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-700">GST ({totals.gstPercentage}%):</span>
                    <span className="font-bold text-lg">₹{totals.gstAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div className="border-t-4 border-blue-400 pt-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-2xl font-bold text-gray-900">TOTAL:</span>
                    <span className="text-3xl font-bold text-blue-600">
                      ₹{totals.roundedTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
