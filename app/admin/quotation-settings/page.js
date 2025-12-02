'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Trash2, Save, DollarSign, Settings } from 'lucide-react';

export default function QuotationSettingsPage() {
  const [activeTab, setActiveTab] = useState('panels'); // panels, furniture, lighting, accessories, pricing
  
  // Data states
  const [panelMaterials, setPanelMaterials] = useState([]);
  const [furniture, setFurniture] = useState([]);
  const [lighting, setLighting] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [pricingConfig, setPricingConfig] = useState({});
  
  // Form states
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [panels, furn, light, acc, config] = await Promise.all([
        supabase.from('panel_materials').select('*').order('display_order'),
        supabase.from('modular_furniture').select('*').order('display_order'),
        supabase.from('lighting_options').select('*').order('category, display_order'),
        supabase.from('installation_accessories').select('*').order('display_order'),
        supabase.from('pricing_config').select('*')
      ]);
      
      setPanelMaterials(panels.data || []);
      setFurniture(furn.data || []);
      setLighting(light.data || []);
      setAccessories(acc.data || []);
      
      // Convert config array to object
      const configObj = {};
      config.data?.forEach(item => {
        configObj[item.config_key] = item.config_value;
      });
      setPricingConfig(configObj);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Panel Material Functions
  const savePanelMaterial = async (data) => {
    try {
      setSaving(true);
      if (editingItem) {
        const { error } = await supabase
          .from('panel_materials')
          .update(data)
          .eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('panel_materials')
          .insert(data);
        if (error) throw error;
      }
      await loadAllData();
      setShowForm(false);
      setEditingItem(null);
      alert('Saved successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const deletePanelMaterial = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      const { error } = await supabase
        .from('panel_materials')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await loadAllData();
      alert('Deleted successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete: ' + error.message);
    }
  };

  // Furniture Functions
  const saveFurniture = async (data) => {
    try {
      setSaving(true);
      if (editingItem) {
        const { error } = await supabase
          .from('modular_furniture')
          .update(data)
          .eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('modular_furniture')
          .insert(data);
        if (error) throw error;
      }
      await loadAllData();
      setShowForm(false);
      setEditingItem(null);
      alert('Saved successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteFurniture = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      const { error } = await supabase
        .from('modular_furniture')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await loadAllData();
      alert('Deleted successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete: ' + error.message);
    }
  };

  // Lighting Functions
  const saveLighting = async (data) => {
    try {
      setSaving(true);
      if (editingItem) {
        const { error } = await supabase
          .from('lighting_options')
          .update(data)
          .eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('lighting_options')
          .insert(data);
        if (error) throw error;
      }
      await loadAllData();
      setShowForm(false);
      setEditingItem(null);
      alert('Saved successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteLighting = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      const { error } = await supabase
        .from('lighting_options')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await loadAllData();
      alert('Deleted successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete: ' + error.message);
    }
  };

  // Accessory Functions
  const saveAccessory = async (data) => {
    try {
      setSaving(true);
      if (editingItem) {
        const { error } = await supabase
          .from('installation_accessories')
          .update(data)
          .eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('installation_accessories')
          .insert(data);
        if (error) throw error;
      }
      await loadAllData();
      setShowForm(false);
      setEditingItem(null);
      alert('Saved successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteAccessory = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      const { error } = await supabase
        .from('installation_accessories')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await loadAllData();
      alert('Deleted successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete: ' + error.message);
    }
  };

  // Pricing Config Functions
  const updatePricingConfig = async (key, value) => {
    try {
      const { error } = await supabase
        .from('pricing_config')
        .upsert({
          config_key: key,
          config_value: value
        }, {
          onConflict: 'config_key'
        });
      if (error) throw error;
      await loadAllData();
      alert('Updated successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Quotation Settings</h1>
        <p className="text-gray-600 mt-1">Manage all quotation builder data</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg mb-6">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {[
            { id: 'panels', name: 'Panel Materials' },
            { id: 'furniture', name: 'Furniture' },
            { id: 'lighting', name: 'Lighting' },
            { id: 'accessories', name: 'Accessories' },
            { id: 'pricing', name: 'Pricing Config' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-semibold whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Panel Materials Tab */}
      {activeTab === 'panels' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Panel Materials</h2>
            <button
              onClick={() => {
                setEditingItem(null);
                setShowForm(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add Material
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Rate/sq.ft</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {panelMaterials.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg"
                          style={{ backgroundColor: item.color_code }}
                        ></div>
                        <span className="font-semibold">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{item.material_type}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-green-600">₹{item.rate_per_sqft}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setShowForm(true);
                          }}
                          className="p-2 hover:bg-blue-100 rounded-lg"
                        >
                          <Edit className="w-5 h-5 text-blue-600" />
                        </button>
                        <button
                          onClick={() => deletePanelMaterial(item.id)}
                          className="p-2 hover:bg-red-100 rounded-lg"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Furniture Tab */}
      {activeTab === 'furniture' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Modular Furniture</h2>
            <button
              onClick={() => {
                setEditingItem(null);
                setShowForm(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add Furniture
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Size</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Colors</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {furniture.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold">{item.name}</td>
                    <td className="px-6 py-4">{item.size}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-green-600">₹{item.price.toLocaleString('en-IN')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {item.colors?.slice(0, 3).map((color, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs">
                            {color}
                          </span>
                        ))}
                        {item.colors?.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                            +{item.colors.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setShowForm(true);
                          }}
                          className="p-2 hover:bg-blue-100 rounded-lg"
                        >
                          <Edit className="w-5 h-5 text-blue-600" />
                        </button>
                        <button
                          onClick={() => deleteFurniture(item.id)}
                          className="p-2 hover:bg-red-100 rounded-lg"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pricing Config Tab */}
      {activeTab === 'pricing' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Pricing Configuration</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Labour Charges */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Labour Charges
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Base Rate (₹)</label>
                  <input
                    type="number"
                    value={pricingConfig.labour_charges?.base || 1500}
                    onChange={(e) => {
                      const newConfig = {
                        ...pricingConfig.labour_charges,
                        base: parseFloat(e.target.value)
                      };
                      updatePricingConfig('labour_charges', newConfig);
                    }}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Transportation */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Transportation
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Base Rate (₹)</label>
                  <input
                    type="number"
                    value={pricingConfig.transportation?.base || 500}
                    onChange={(e) => {
                      const newConfig = {
                        ...pricingConfig.transportation,
                        base: parseFloat(e.target.value)
                      };
                      updatePricingConfig('transportation', newConfig);
                    }}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* GST */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                GST Configuration
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">GST Percentage (%)</label>
                  <input
                    type="number"
                    value={pricingConfig.gst?.percentage || 18}
                    onChange={(e) => {
                      const newConfig = {
                        ...pricingConfig.gst,
                        percentage: parseFloat(e.target.value)
                      };
                      updatePricingConfig('gst', newConfig);
                    }}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
