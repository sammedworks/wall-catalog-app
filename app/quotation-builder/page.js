'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ChevronDown, ChevronUp, Download, Save, Plus, X, Calculator, Image as ImageIcon } from 'lucide-react';
import jsPDF from 'jspdf';

export default function QuotationBuilderPage() {
  const router = useRouter();
  
  // Loading States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // UI States
  const [expandedSections, setExpandedSections] = useState({
    customer: false,
    panels: true,
    furniture: false,
    lighting: false,
    accessories: false
  });

  // Data from Admin Panel
  const [materials, setMaterials] = useState([]);
  const [seriesByMaterial, setSeriesByMaterial] = useState({});
  const [panelTypesBySeries, setPanelTypesBySeries] = useState({});
  const [furniture, setFurniture] = useState([]);
  const [lighting, setLighting] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [pricingConfig, setPricingConfig] = useState({});

  // User Selections
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

  // Design Reference (from detail page)
  const [designReference, setDesignReference] = useState(null);

  // Load all data on mount
  useEffect(() => {
    loadAllData();
    loadDesignReference();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      const [materialsRes, furnRes, lightRes, accRes, configRes] = await Promise.all([
        supabase.from('materials').select('*').eq('is_active', true).order('display_order'),
        supabase.from('modular_furniture').select('*').eq('is_active', true).order('display_order'),
        supabase.from('lighting_options').select('*').eq('is_active', true).order('category, display_order'),
        supabase.from('installation_accessories').select('*').eq('is_active', true).order('display_order'),
        supabase.from('pricing_config').select('*')
      ]);

      if (materialsRes.error) throw materialsRes.error;
      if (furnRes.error) throw furnRes.error;
      if (lightRes.error) throw lightRes.error;
      if (accRes.error) throw accRes.error;
      if (configRes.error) throw configRes.error;

      setMaterials(materialsRes.data || []);
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

  const loadDesignReference = () => {
    try {
      const storedData = localStorage.getItem('designQuoteData');
      if (storedData) {
        const data = JSON.parse(storedData);
        setDesignReference(data.design);
        localStorage.removeItem('designQuoteData');
      }
    } catch (error) {
      console.error('Error loading design reference:', error);
    }
  };

  // Load series for a material
  const loadSeriesForMaterial = async (materialId) => {
    if (seriesByMaterial[materialId]) return; // Already loaded
    
    try {
      const { data, error } = await supabase
        .from('material_series')
        .select('*')
        .eq('material_id', materialId)
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      
      setSeriesByMaterial(prev => ({
        ...prev,
        [materialId]: data || []
      }));
    } catch (error) {
      console.error('Error loading series:', error);
    }
  };

  // Load panel types for a series
  const loadPanelTypesForSeries = async (seriesId) => {
    if (panelTypesBySeries[seriesId]) return; // Already loaded
    
    try {
      const { data, error } = await supabase
        .from('panel_types')
        .select('*')
        .eq('series_id', seriesId)
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      
      setPanelTypesBySeries(prev => ({
        ...prev,
        [seriesId]: data || []
      }));
    } catch (error) {
      console.error('Error loading panel types:', error);
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
        material: null,
        seriesId: null,
        series: null,
        panelTypeId: null,
        panelType: null,
        area: 0,
        cost: 0
      }]);
    }
  };

  const removePanel = (id) => {
    if (selectedPanels.length > 1) {
      setSelectedPanels(selectedPanels.filter(p => p.id !== id));
    }
  };

  const updatePanel = async (panelId, field, value) => {
    setSelectedPanels(prev => prev.map(panel => {
      if (panel.id !== panelId) return panel;
      
      const updated = { ...panel, [field]: value };
      
      // Reset dependent fields when parent changes
      if (field === 'materialId') {
        updated.seriesId = null;
        updated.series = null;
        updated.panelTypeId = null;
        updated.panelType = null;
        updated.area = 0;
        updated.cost = 0;
        
        // Load series for this material
        if (value) {
          loadSeriesForMaterial(value);
          updated.material = materials.find(m => m.id === value);
        } else {
          updated.material = null;
        }
      }
      
      if (field === 'seriesId') {
        updated.panelTypeId = null;
        updated.panelType = null;
        updated.area = 0;
        updated.cost = 0;
        
        // Load panel types for this series
        if (value) {
          loadPanelTypesForSeries(value);
          updated.series = seriesByMaterial[panel.materialId]?.find(s => s.id === value);
        } else {
          updated.series = null;
        }
      }
      
      if (field === 'panelTypeId') {
        updated.area = 0;
        updated.cost = 0;
        
        if (value) {
          updated.panelType = panelTypesBySeries[panel.seriesId]?.find(p => p.id === value);
        } else {
          updated.panelType = null;
        }
      }
      
      if (field === 'area') {
        // Calculate cost
        if (updated.panelType && value > 0) {
          updated.cost = value * parseFloat(updated.panelType.rate_per_sqft);
        } else {
          updated.cost = 0;
        }
      }
      
      return updated;
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
        selectedColor: item.available_colors?.[0] || 'Default'
      }]);
    }
  };

  const updateFurnitureQuantity = (id, quantity) => {
    setSelectedFurniture(prev => prev.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
    ));
  };

  const updateFurnitureColor = (id, color) => {
    setSelectedFurniture(prev => prev.map(item =>
      item.id === id ? { ...item, selectedColor: color } : item
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
    setSelectedLighting(prev => prev.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
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
        quantity: item.unit === 'fixed' ? 1 : 0,
        area: item.unit !== 'fixed' ? 0 : 0
      }]);
    }
  };

  const updateAccessoryValue = (id, field, value) => {
    setSelectedAccessories(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: Math.max(0, value) } : item
    ));
  };

  // Calculate Totals
  const calculateTotals = () => {
    // Panel Cost
    const panelCost = selectedPanels.reduce((sum, panel) => sum + (panel.cost || 0), 0);

    // Furniture Cost
    const furnitureCost = selectedFurniture.reduce((sum, item) => 
      sum + (parseFloat(item.price) * item.quantity), 0
    );

    // Lighting Cost
    const lightingCost = selectedLighting.reduce((sum, item) => 
      sum + (parseFloat(item.price) * item.quantity), 0
    );

    // Accessories Cost
    const accessoriesCost = selectedAccessories.reduce((sum, item) => {
      if (item.unit === 'fixed') {
        return sum + (parseFloat(item.price) * item.quantity);
      } else {
        return sum + (parseFloat(item.price) * item.area);
      }
    }, 0);

    const materialCost = panelCost + furnitureCost + lightingCost + accessoriesCost;
    const labourCharges = parseFloat(pricingConfig.labour_charges || 0);
    const transportation = parseFloat(pricingConfig.transportation || 0);
    const subtotal = materialCost + labourCharges + transportation;
    const gstPercentage = parseFloat(pricingConfig.gst_percentage || 18);
    const gstAmount = (subtotal * gstPercentage) / 100;
    const total = subtotal + gstAmount;
    const roundedTotal = Math.round(total);

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
        
        // Enhanced panel data with three-level structure
        panels: selectedPanels
          .filter(p => p.panelTypeId)
          .map(p => ({
            material_id: p.materialId,
            material_name: p.material?.name,
            series_id: p.seriesId,
            series_name: p.series?.name,
            panel_type_id: p.panelTypeId,
            panel_type_name: p.panelType?.name,
            rate_per_sqft: p.panelType?.rate_per_sqft,
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
      
      let yPos = 20;
      
      // Header
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('QUOTATION', 105, yPos, { align: 'center' });
      yPos += 10;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, 105, yPos, { align: 'center' });
      yPos += 5;
      pdf.text(`Quote #: QT-${Date.now()}`, 105, yPos, { align: 'center' });
      yPos += 15;
      
      // Design Reference (if exists)
      if (designReference) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Design Reference', 20, yPos);
        yPos += 7;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Name: ${designReference.name}`, 25, yPos);
        yPos += 5;
        
        if (designReference.space_category) {
          pdf.text(`Space: ${designReference.space_category}`, 25, yPos);
          yPos += 5;
        }
        
        if (designReference.material_type) {
          pdf.text(`Material: ${designReference.material_type}`, 25, yPos);
          yPos += 5;
        }
        
        yPos += 10;
      }
      
      // Customer Details
      if (customerDetails.name) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Customer Details', 20, yPos);
        yPos += 7;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Name: ${customerDetails.name}`, 25, yPos);
        yPos += 5;
        
        if (customerDetails.phone) {
          pdf.text(`Phone: ${customerDetails.phone}`, 25, yPos);
          yPos += 5;
        }
        
        if (customerDetails.email) {
          pdf.text(`Email: ${customerDetails.email}`, 25, yPos);
          yPos += 5;
        }
        
        if (customerDetails.address) {
          pdf.text(`Address: ${customerDetails.address}`, 25, yPos);
          yPos += 5;
        }
        
        yPos += 10;
      }

      // Panels Section
      if (selectedPanels.some(p => p.panelTypeId)) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Wall Panels', 20, yPos);
        yPos += 7;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        selectedPanels.forEach((panel, idx) => {
          if (panel.panelType && panel.area > 0) {
            // Material > Series > Panel hierarchy
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
        pdf.text(`Panel Total: ₹${totals.panelCost.toLocaleString('en-IN')}`, 25, yPos);
        yPos += 10;
      }

      // Furniture Section
      if (selectedFurniture.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Modular Furniture', 20, yPos);
        yPos += 7;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        selectedFurniture.forEach((item, idx) => {
          const cost = item.price * item.quantity;
          pdf.text(
            `${idx + 1}. ${item.name} (${item.selectedColor}) - ${item.quantity} × ₹${item.price.toLocaleString('en-IN')} = ₹${cost.toLocaleString('en-IN')}`,
            25,
            yPos
          );
          yPos += 5;
        });
        
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Furniture Total: ₹${totals.furnitureCost.toLocaleString('en-IN')}`, 25, yPos);
        yPos += 10;
      }

      // Lighting Section
      if (selectedLighting.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Lighting', 20, yPos);
        yPos += 7;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        selectedLighting.forEach((item, idx) => {
          const cost = item.price * item.quantity;
          pdf.text(
            `${idx + 1}. ${item.name} - ${item.quantity} × ₹${item.price.toLocaleString('en-IN')} = ₹${cost.toLocaleString('en-IN')}`,
            25,
            yPos
          );
          yPos += 5;
        });
        
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Lighting Total: ₹${totals.lightingCost.toLocaleString('en-IN')}`, 25, yPos);
        yPos += 10;
      }

      // Accessories Section
      if (selectedAccessories.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Accessories', 20, yPos);
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
            25,
            yPos
          );
          yPos += 5;
        });
        
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Accessories Total: ₹${totals.accessoriesCost.toLocaleString('en-IN')}`, 25, yPos);
        yPos += 10;
      }

      // Cost Breakdown
      yPos += 5;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Cost Breakdown', 20, yPos);
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
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`TOTAL: ₹${totals.roundedTotal.toLocaleString('en-IN')}`, 25, yPos);

      // Save PDF
      const filename = designReference 
        ? `Quote_${designReference.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`
        : `Quotation_${Date.now()}.pdf`;
      
      pdf.save(filename);
      
      alert('PDF downloaded successfully!');
      
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
                  disabled={saving || selectedPanels.every(p => !p.panelTypeId)}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : 'Save Quote'}
                </button>
                <button
                  onClick={exportToPDF}
                  disabled={selectedPanels.every(p => !p.panelTypeId)}
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
        {/* Design Reference Banner */}
        {designReference && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-2xl p-6 mb-6 shadow-lg">
            <div className="flex items-center gap-4">
              {designReference.image && (
                <img
                  src={designReference.image}
                  alt={designReference.name}
                  className="w-24 h-24 object-cover rounded-xl shadow-md"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                    DESIGN REFERENCE
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {designReference.name}
                </h3>
                <div className="flex flex-wrap gap-3 text-sm">
                  {designReference.space_category && (
                    <span className="px-3 py-1 bg-white rounded-full text-gray-700 font-medium">
                      📍 {designReference.space_category}
                    </span>
                  )}
                  {designReference.material_type && (
                    <span className="px-3 py-1 bg-white rounded-full text-gray-700 font-medium">
                      🎨 {designReference.material_type}
                    </span>
                  )}
                  {designReference.basePrice && (
                    <span className="px-3 py-1 bg-white rounded-full text-green-700 font-bold">
                      ₹{parseFloat(designReference.basePrice).toLocaleString()}
                      {designReference.pricingType === 'per_sqft' && '/sq.ft'}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setDesignReference(null)}
                className="p-2 hover:bg-blue-200 rounded-lg transition-all"
                title="Remove reference"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        )}

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

        {/* PANELS SECTION - THREE-LEVEL STRUCTURE */}
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
                <p className="text-sm text-gray-600">Material → Series → Panel Type (1-4 panels)</p>
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
              <div className="space-y-6">
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
                  <div key={panel.id} className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
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
                        isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      {item.photo_url && (
                        <img
                          src={item.photo_url}
                          alt={item.name}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                      )}
                      <h4 className="font-bold text-gray-900">{item.name}</h4>
                      <p className="text-lg font-bold text-green-600 mt-2">
                        ₹{parseFloat(item.price).toLocaleString('en-IN')}
                      </p>
                      {isSelected && (
                        <div className="mt-3 space-y-2" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="number"
                            value={isSelected.quantity}
                            onChange={(e) => updateFurnitureQuantity(item.id, parseInt(e.target.value))}
                            className="w-full px-3 py-2 border rounded-lg"
                            min="1"
                            placeholder="Quantity"
                          />
                          {item.available_colors && item.available_colors.length > 0 && (
                            <select
                              value={isSelected.selectedColor}
                              onChange={(e) => updateFurnitureColor(item.id, e.target.value)}
                              className="w-full px-3 py-2 border rounded-lg"
                            >
                              {item.available_colors.map(color => (
                                <option key={color} value={color}>{color}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
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
              <h2 className="text-xl font-bold text-gray-900">Lighting (Optional)</h2>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lighting.map((item) => {
                  const isSelected = selectedLighting.find(l => l.id === item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleLighting(item)}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                        isSelected ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-yellow-300'
                      }`}
                    >
                      <h4 className="font-bold text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">{item.category}</p>
                      <p className="text-lg font-bold text-green-600 mt-2">
                        ₹{parseFloat(item.price).toLocaleString('en-IN')}
                      </p>
                      {isSelected && (
                        <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="number"
                            value={isSelected.quantity}
                            onChange={(e) => updateLightingQuantity(item.id, parseInt(e.target.value))}
                            className="w-full px-3 py-2 border rounded-lg"
                            min="1"
                            placeholder="Quantity"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
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
              <h2 className="text-xl font-bold text-gray-900">Accessories (Optional)</h2>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accessories.map((item) => {
                  const isSelected = selectedAccessories.find(a => a.id === item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleAccessory(item)}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                        isSelected ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <h4 className="font-bold text-gray-900">{item.name}</h4>
                      <p className="text-lg font-bold text-green-600 mt-2">
                        ₹{parseFloat(item.price).toLocaleString('en-IN')}
                        {item.unit === 'per_sqft' && '/sq.ft'}
                        {item.unit === 'per_meter' && '/m'}
                      </p>
                      {isSelected && (
                        <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                          {item.unit === 'fixed' ? (
                            <input
                              type="number"
                              value={isSelected.quantity}
                              onChange={(e) => updateAccessoryValue(item.id, 'quantity', parseInt(e.target.value))}
                              className="w-full px-3 py-2 border rounded-lg"
                              min="1"
                              placeholder="Quantity"
                            />
                          ) : (
                            <input
                              type="number"
                              value={isSelected.area}
                              onChange={(e) => updateAccessoryValue(item.id, 'area', parseFloat(e.target.value))}
                              className="w-full px-3 py-2 border rounded-lg"
                              min="0"
                              step="0.01"
                              placeholder={item.unit === 'per_sqft' ? 'Area (sq.ft)' : 'Length (m)'}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* COST SUMMARY */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border-4 border-green-500">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Cost Summary</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-700">Panel Cost:</span>
              <span className="font-bold text-gray-900">₹{totals.panelCost.toLocaleString('en-IN')}</span>
            </div>
            
            {totals.furnitureCost > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-700">Furniture Cost:</span>
                <span className="font-bold text-gray-900">₹{totals.furnitureCost.toLocaleString('en-IN')}</span>
              </div>
            )}
            
            {totals.lightingCost > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-700">Lighting Cost:</span>
                <span className="font-bold text-gray-900">₹{totals.lightingCost.toLocaleString('en-IN')}</span>
              </div>
            )}
            
            {totals.accessoriesCost > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-700">Accessories Cost:</span>
                <span className="font-bold text-gray-900">₹{totals.accessoriesCost.toLocaleString('en-IN')}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-700">Material Cost:</span>
              <span className="font-bold text-gray-900">₹{totals.materialCost.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-700">Labour Charges:</span>
              <span className="font-bold text-gray-900">₹{totals.labourCharges.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-700">Transportation:</span>
              <span className="font-bold text-gray-900">₹{totals.transportation.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b-2 border-gray-400">
              <span className="text-gray-700 font-semibold">Subtotal:</span>
              <span className="font-bold text-gray-900">₹{totals.subtotal.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b-2 border-gray-400">
              <span className="text-gray-700 font-semibold">GST ({totals.gstPercentage}%):</span>
              <span className="font-bold text-gray-900">₹{totals.gstAmount.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="flex justify-between items-center py-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg px-4 mt-4">
              <span className="text-xl font-bold text-gray-900">TOTAL:</span>
              <span className="text-3xl font-bold text-green-700">₹{totals.roundedTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
