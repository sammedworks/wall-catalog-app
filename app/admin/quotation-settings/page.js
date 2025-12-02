'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Trash2, Save, X, DollarSign, Settings, Package, Lightbulb, Wrench, Palette } from 'lucide-react';

export default function QuotationSettingsPage() {
  const [activeTab, setActiveTab] = useState('panels');
  
  // Data states
  const [panelMaterials, setPanelMaterials] = useState([]);
  const [furniture, setFurniture] = useState([]);
  const [lighting, setLighting] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [pricingConfig, setPricingConfig] = useState({});
  
  // Form states
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
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
      
      const configObj = {};
      config.data?.forEach(item => {
        configObj[item.config_key] = item.config_value;
      });
      setPricingConfig(configObj);
      
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Generic save function
  const saveItem = async (table, data) => {
    try {
      setSaving(true);
      if (editingItem) {
        const { error } = await supabase.from(table).update(data).eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(table).insert(data);
        if (error) throw error;
      }
      await loadAllData();
      setShowForm(false);
      setEditingItem(null);
      setFormData({});
      alert('Saved successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Generic delete function
  const deleteItem = async (table, id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      await loadAllData();
      alert('Deleted successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete: ' + error.message);
    }
  };

  // Update pricing config
  const updatePricingConfig = async (key, value) => {
    try {
      const { error } = await supabase
        .from('pricing_config')
        .upsert({ config_key: key, config_value: value }, { onConflict: 'config_key' });
      if (error) throw error;
      await loadAllData();
      alert('Updated successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update: ' + error.message);
    }
  };

  // Open form for editing
  const openEditForm = (item) => {
    setEditingItem(item);
    setFormData(item);
    setShowForm(true);
  };

  // Open form for new item
  const openNewForm = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      is_active: true,
      display_order: 0
    });
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Quotation Settings</h1>
          <p className="text-gray-600 mt-1">Manage all quotation builder data and pricing</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            {[
              { id: 'panels', name: 'Panel Materials', icon: Palette },
              { id: 'furniture', name: 'Furniture', icon: Package },
              { id: 'lighting', name: 'Lighting', icon: Lightbulb },
              { id: 'accessories', name: 'Accessories', icon: Wrench },
              { id: 'pricing', name: 'Pricing Config', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setShowForm(false);
                  }}
                  className={`px-6 py-4 font-semibold whitespace-nowrap flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Panel Materials Tab */}
        {activeTab === 'panels' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Panel Materials</h2>
              <button
                onClick={openNewForm}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" /> Add Material
              </button>
            </div>

            {/* Form Modal */}
            {showForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                    <h3 className="text-xl font-bold">
                      {editingItem ? 'Edit Panel Material' : 'Add Panel Material'}
                    </h3>
                    <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Name *</label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Walnut Wood"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Material Type *</label>
                      <select
                        value={formData.material_type || ''}
                        onChange={(e) => setFormData({ ...formData, material_type: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select type</option>
                        <option value="Wood">Wood</option>
                        <option value="Marble">Marble</option>
                        <option value="Stone">Stone</option>
                        <option value="Paint">Paint</option>
                        <option value="Metal">Metal</option>
                        <option value="Glass">Glass</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Color Code (Hex) *</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.color_code || '#000000'}
                          onChange={(e) => setFormData({ ...formData, color_code: e.target.value })}
                          className="w-20 h-12 border-2 border-gray-300 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.color_code || ''}
                          onChange={(e) => setFormData({ ...formData, color_code: e.target.value })}
                          className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="#000000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Rate per sq.ft (₹) *</label>
                      <input
                        type="number"
                        value={formData.rate_per_sqft || ''}
                        onChange={(e) => setFormData({ ...formData, rate_per_sqft: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="500"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Description</label>
                      <textarea
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                        placeholder="Optional description"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Display Order</label>
                      <input
                        type="number"
                        value={formData.display_order || 0}
                        onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_active !== false}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-5 h-5"
                      />
                      <label className="text-sm font-semibold">Active</label>
                    </div>
                  </div>

                  <div className="p-6 border-t border-gray-200 flex gap-3">
                    <button
                      onClick={() => setShowForm(false)}
                      className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => saveItem('panel_materials', formData)}
                      disabled={saving || !formData.name || !formData.material_type || !formData.rate_per_sqft}
                      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      {saving ? 'Saving...' : 'Save Material'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Material</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Rate/sq.ft</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {panelMaterials.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        No panel materials found. Click "Add Material" to create one.
                      </td>
                    </tr>
                  ) : (
                    panelMaterials.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg border-2 border-gray-200"
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
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {item.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditForm(item)}
                              className="p-2 hover:bg-blue-100 rounded-lg transition-all"
                            >
                              <Edit className="w-5 h-5 text-blue-600" />
                            </button>
                            <button
                              onClick={() => deleteItem('panel_materials', item.id)}
                              className="p-2 hover:bg-red-100 rounded-lg transition-all"
                            >
                              <Trash2 className="w-5 h-5 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Furniture Tab */}
        {activeTab === 'furniture' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Modular Furniture</h2>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setFormData({ name: '', size: '', price: 0, colors: [], is_active: true, display_order: 0 });
                  setShowForm(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" /> Add Furniture
              </button>
            </div>

            {/* Furniture Form Modal */}
            {showForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                    <h3 className="text-xl font-bold">
                      {editingItem ? 'Edit Furniture' : 'Add Furniture'}
                    </h3>
                    <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Name *</label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Grooveline Console"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Category</label>
                      <select
                        value={formData.category || ''}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select category</option>
                        <option value="Console">Console</option>
                        <option value="Cabinet">Cabinet</option>
                        <option value="Shelf">Shelf</option>
                        <option value="Table">Table</option>
                        <option value="Storage">Storage</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Size *</label>
                      <input
                        type="text"
                        value={formData.size || ''}
                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 4 ft"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Price (₹) *</label>
                      <input
                        type="number"
                        value={formData.price || ''}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="7999"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Colors (comma-separated) *</label>
                      <input
                        type="text"
                        value={Array.isArray(formData.colors) ? formData.colors.join(', ') : ''}
                        onChange={(e) => setFormData({ ...formData, colors: e.target.value.split(',').map(c => c.trim()).filter(c => c) })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="White, Beige, Walnut, Grey, Black, Teak"
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter colors separated by commas</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Description</label>
                      <textarea
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Display Order</label>
                      <input
                        type="number"
                        value={formData.display_order || 0}
                        onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_active !== false}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-5 h-5"
                      />
                      <label className="text-sm font-semibold">Active</label>
                    </div>
                  </div>

                  <div className="p-6 border-t border-gray-200 flex gap-3">
                    <button
                      onClick={() => setShowForm(false)}
                      className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => saveItem('modular_furniture', formData)}
                      disabled={saving || !formData.name || !formData.size || !formData.price}
                      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      {saving ? 'Saving...' : 'Save Furniture'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Furniture Table */}
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
                  {furniture.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        No furniture items found. Click "Add Furniture" to create one.
                      </td>
                    </tr>
                  ) : (
                    furniture.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-semibold">{item.name}</td>
                        <td className="px-6 py-4">{item.size}</td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-green-600">₹{item.price?.toLocaleString('en-IN')}</span>
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
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {item.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditForm(item)}
                              className="p-2 hover:bg-blue-100 rounded-lg"
                            >
                              <Edit className="w-5 h-5 text-blue-600" />
                            </button>
                            <button
                              onClick={() => deleteItem('modular_furniture', item.id)}
                              className="p-2 hover:bg-red-100 rounded-lg"
                            >
                              <Trash2 className="w-5 h-5 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Lighting Tab */}
        {activeTab === 'lighting' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Lighting Options</h2>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setFormData({ name: '', category: 'Profile Light', price: 0, unit: 'piece', is_active: true, display_order: 0 });
                  setShowForm(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" /> Add Lighting
              </button>
            </div>

            {/* Lighting Form Modal */}
            {showForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                    <h3 className="text-xl font-bold">
                      {editingItem ? 'Edit Lighting' : 'Add Lighting'}
                    </h3>
                    <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Name *</label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 240 LED Installation Kit"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Category *</label>
                      <select
                        value={formData.category || 'Profile Light'}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Profile Light">Profile Light</option>
                        <option value="Cove Light">Cove Light</option>
                        <option value="Wall Light">Wall Light</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Price (₹) *</label>
                      <input
                        type="number"
                        value={formData.price || ''}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="2500"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Unit</label>
                      <select
                        value={formData.unit || 'piece'}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="piece">Piece</option>
                        <option value="meter">Meter</option>
                        <option value="set">Set</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Description</label>
                      <textarea
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Display Order</label>
                      <input
                        type="number"
                        value={formData.display_order || 0}
                        onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_active !== false}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-5 h-5"
                      />
                      <label className="text-sm font-semibold">Active</label>
                    </div>
                  </div>

                  <div className="p-6 border-t border-gray-200 flex gap-3">
                    <button
                      onClick={() => setShowForm(false)}
                      className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => saveItem('lighting_options', formData)}
                      disabled={saving || !formData.name || !formData.price}
                      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      {saving ? 'Saving...' : 'Save Lighting'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Lighting Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Unit</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {lighting.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        No lighting options found. Click "Add Lighting" to create one.
                      </td>
                    </tr>
                  ) : (
                    lighting.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-semibold">{item.name}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-green-600">₹{item.price?.toLocaleString('en-IN')}</span>
                        </td>
                        <td className="px-6 py-4">{item.unit}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {item.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditForm(item)}
                              className="p-2 hover:bg-blue-100 rounded-lg"
                            >
                              <Edit className="w-5 h-5 text-blue-600" />
                            </button>
                            <button
                              onClick={() => deleteItem('lighting_options', item.id)}
                              className="p-2 hover:bg-red-100 rounded-lg"
                            >
                              <Trash2 className="w-5 h-5 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Accessories Tab */}
        {activeTab === 'accessories' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Installation Accessories</h2>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setFormData({ name: '', price: 0, unit: 'fixed', is_active: true, display_order: 0 });
                  setShowForm(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" /> Add Accessory
              </button>
            </div>

            {/* Accessory Form Modal */}
            {showForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                    <h3 className="text-xl font-bold">
                      {editingItem ? 'Edit Accessory' : 'Add Accessory'}
                    </h3>
                    <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Name *</label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., PVC Board (12mm)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Price (₹) *</label>
                      <input
                        type="number"
                        value={formData.price || ''}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="1500"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Unit *</label>
                      <select
                        value={formData.unit || 'fixed'}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="fixed">Fixed Price</option>
                        <option value="per_sqft">Per Sq.Ft</option>
                        <option value="per_meter">Per Meter</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Fixed: One-time price | Per Sq.Ft: Price × Area | Per Meter: Price × Length
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Description</label>
                      <textarea
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Display Order</label>
                      <input
                        type="number"
                        value={formData.display_order || 0}
                        onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_active !== false}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-5 h-5"
                      />
                      <label className="text-sm font-semibold">Active</label>
                    </div>
                  </div>

                  <div className="p-6 border-t border-gray-200 flex gap-3">
                    <button
                      onClick={() => setShowForm(false)}
                      className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => saveItem('installation_accessories', formData)}
                      disabled={saving || !formData.name || !formData.price}
                      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      {saving ? 'Saving...' : 'Save Accessory'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Accessories Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Unit</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {accessories.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        No accessories found. Click "Add Accessory" to create one.
                      </td>
                    </tr>
                  ) : (
                    accessories.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-semibold">{item.name}</td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-green-600">₹{item.price?.toLocaleString('en-IN')}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                            {item.unit === 'fixed' ? 'Fixed' : item.unit.replace('per_', 'Per ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {item.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditForm(item)}
                              className="p-2 hover:bg-blue-100 rounded-lg"
                            >
                              <Edit className="w-5 h-5 text-blue-600" />
                            </button>
                            <button
                              onClick={() => deleteItem('installation_accessories', item.id)}
                              className="p-2 hover:bg-red-100 rounded-lg"
                            >
                              <Trash2 className="w-5 h-5 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pricing Config Tab */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Pricing Configuration</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Labour Charges */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
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
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Standard labour charge per quotation</p>
                  </div>
                </div>
              </div>

              {/* Transportation */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
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
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Standard transportation charge</p>
                  </div>
                </div>
              </div>

              {/* GST */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-600" />
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
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max="100"
                    />
                    <p className="text-xs text-gray-500 mt-1">GST rate applied to all quotations</p>
                  </div>
                </div>
              </div>

              {/* Summary Card */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg p-6 border-2 border-blue-200">
                <h3 className="text-lg font-bold mb-4">Current Pricing Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Labour Charges:</span>
                    <span className="font-bold text-blue-600">₹{pricingConfig.labour_charges?.base || 1500}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Transportation:</span>
                    <span className="font-bold text-green-600">₹{pricingConfig.transportation?.base || 500}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">GST:</span>
                    <span className="font-bold text-purple-600">{pricingConfig.gst?.percentage || 18}%</span>
                  </div>
                  <div className="pt-3 border-t border-gray-300">
                    <p className="text-xs text-gray-600">
                      These rates are applied to all new quotations. Changes take effect immediately.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
