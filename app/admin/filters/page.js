'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit2, Trash2, GripVertical, Eye, EyeOff, Save, X } from 'lucide-react';

export default function AdminFiltersPage() {
  const [tabs, setTabs] = useState([]);
  const [chips, setChips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('tabs'); // 'tabs' or 'chips'
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [modalType, setModalType] = useState('tab'); // 'tab' or 'chip'
  const [editingItem, setEditingItem] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    filterType: 'material',
    filterKey: '',
    filterValue: '',
    filterOperator: 'equals',
    groupName: '',
    displayOrder: 0,
    isActive: true,
    isDefault: false,
    isFeatured: false,
    colorCode: '#6B7280',
    icon: '',
    badgeText: '',
    description: ''
  });

  useEffect(() => {
    loadFilters();
  }, []);

  const loadFilters = async () => {
    setLoading(true);
    try {
      // Load tabs
      const { data: tabsData, error: tabsError } = await supabase
        .from('filter_tabs')
        .select('*')
        .order('display_order');
      
      if (tabsError) throw tabsError;
      setTabs(tabsData || []);
      
      // Load chips
      const { data: chipsData, error: chipsError } = await supabase
        .from('filter_chips')
        .select('*')
        .order('display_order');
      
      if (chipsError) throw chipsError;
      setChips(chipsData || []);
    } catch (error) {
      console.error('Error loading filters:', error);
      alert('Error loading filters: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = (type) => {
    setModalMode('create');
    setModalType(type);
    setEditingItem(null);
    setFormData({
      name: '',
      slug: '',
      filterType: type === 'tab' ? 'material' : 'price',
      filterKey: type === 'tab' ? 'material_slugs' : 'price_per_sqft',
      filterValue: '',
      filterOperator: 'equals',
      groupName: '',
      displayOrder: type === 'tab' ? tabs.length : chips.length,
      isActive: true,
      isDefault: false,
      isFeatured: false,
      colorCode: '#6B7280',
      icon: '',
      badgeText: '',
      description: ''
    });
    setShowModal(true);
  };

  const openEditModal = (item, type) => {
    setModalMode('edit');
    setModalType(type);
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      slug: item.slug || '',
      filterType: item.filter_type || (type === 'tab' ? 'material' : 'price'),
      filterKey: item.filter_key || '',
      filterValue: typeof item.filter_value === 'object' ? JSON.stringify(item.filter_value) : (item.filter_value || ''),
      filterOperator: item.filter_operator || 'equals',
      groupName: item.group_name || '',
      displayOrder: item.display_order || 0,
      isActive: item.is_active !== false,
      isDefault: item.is_default || false,
      isFeatured: item.is_featured || false,
      colorCode: item.color_code || '#6B7280',
      icon: item.icon || '',
      badgeText: item.badge_text || '',
      description: item.description || ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      // Parse filter value if it's JSON
      let filterValue = formData.filterValue;
      if (formData.filterOperator === 'range') {
        try {
          filterValue = JSON.parse(formData.filterValue);
        } catch (e) {
          alert('Invalid JSON for range filter. Use format: {"min": 0, "max": 400}');
          return;
        }
      }
      
      const dataToSave = {
        name: formData.name,
        slug: formData.slug || null,
        filter_type: formData.filterType,
        filter_key: formData.filterKey || null,
        filter_value: filterValue || null,
        filter_operator: modalType === 'chip' ? formData.filterOperator : null,
        group_name: modalType === 'chip' ? formData.groupName : null,
        display_order: formData.displayOrder,
        is_active: formData.isActive,
        is_default: modalType === 'tab' ? formData.isDefault : null,
        is_featured: modalType === 'chip' ? formData.isFeatured : null,
        color_code: formData.colorCode,
        icon: formData.icon || null,
        badge_text: modalType === 'chip' ? formData.badgeText : null,
        description: formData.description || null
      };
      
      const table = modalType === 'tab' ? 'filter_tabs' : 'filter_chips';
      
      if (modalMode === 'create') {
        const { error } = await supabase
          .from(table)
          .insert([dataToSave]);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from(table)
          .update(dataToSave)
          .eq('id', editingItem.id);
        
        if (error) throw error;
      }
      
      setShowModal(false);
      loadFilters();
      alert(`${modalType === 'tab' ? 'Tab' : 'Chip'} ${modalMode === 'create' ? 'created' : 'updated'} successfully!`);
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving: ' + error.message);
    }
  };

  const handleDelete = async (id, type) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
    
    try {
      const table = type === 'tab' ? 'filter_tabs' : 'filter_chips';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      loadFilters();
      alert(`${type === 'tab' ? 'Tab' : 'Chip'} deleted successfully!`);
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Error deleting: ' + error.message);
    }
  };

  const toggleActive = async (id, currentStatus, type) => {
    try {
      const table = type === 'tab' ? 'filter_tabs' : 'filter_chips';
      const { error } = await supabase
        .from(table)
        .update({ is_active: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      loadFilters();
    } catch (error) {
      console.error('Error toggling active:', error);
      alert('Error: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading filters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Filter Management</h1>
          <p className="text-gray-600 mt-2">Manage horizontal filter tabs and chips</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 py-8">
        {/* Section Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveSection('tabs')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeSection === 'tabs'
                ? 'bg-gray-900 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Filter Tabs ({tabs.length})
          </button>
          <button
            onClick={() => setActiveSection('chips')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeSection === 'chips'
                ? 'bg-gray-900 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Filter Chips ({chips.length})
          </button>
        </div>

        {/* Tabs Section */}
        {activeSection === 'tabs' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Filter Tabs</h2>
              <button
                onClick={() => openCreateModal('tab')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all"
              >
                <Plus className="w-5 h-5" />
                Add Tab
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Filter</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tabs.map((tab) => (
                    <tr key={tab.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{tab.display_order}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {tab.icon && <span>{tab.icon}</span>}
                          <span className="text-sm font-medium text-gray-900">{tab.name}</span>
                          {tab.is_default && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Default</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{tab.slug}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">{tab.filter_type}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {tab.filter_key ? `${tab.filter_key} = ${tab.filter_value}` : 'All'}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleActive(tab.id, tab.is_active, 'tab')}
                          className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                            tab.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {tab.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {tab.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(tab, 'tab')}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(tab.id, 'tab')}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Chips Section */}
        {activeSection === 'chips' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Filter Chips</h2>
              <button
                onClick={() => openCreateModal('chip')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all"
              >
                <Plus className="w-5 h-5" />
                Add Chip
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Group</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Filter</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {chips.map((chip) => (
                    <tr key={chip.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{chip.display_order}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {chip.icon && <span>{chip.icon}</span>}
                          <span className="text-sm font-medium text-gray-900">{chip.name}</span>
                          {chip.badge_text && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">{chip.badge_text}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{chip.group_name || '-'}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">{chip.filter_type}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {chip.filter_key} {chip.filter_operator} {typeof chip.filter_value === 'object' ? JSON.stringify(chip.filter_value) : chip.filter_value}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleActive(chip.id, chip.is_active, 'chip')}
                          className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                            chip.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {chip.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {chip.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(chip, 'chip')}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(chip.id, 'chip')}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
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
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">
                {modalMode === 'create' ? 'Create' : 'Edit'} {modalType === 'tab' ? 'Tab' : 'Chip'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="e.g., Wood, Economy, Minimal"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slug (auto-generated if empty)</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="e.g., wood, economy, minimal"
                />
              </div>

              {/* Filter Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter Type *</label>
                <select
                  value={formData.filterType}
                  onChange={(e) => setFormData({ ...formData, filterType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  {modalType === 'tab' ? (
                    <>
                      <option value="all">All (no filter)</option>
                      <option value="material">Material</option>
                      <option value="style">Style</option>
                      <option value="custom">Custom</option>
                    </>
                  ) : (
                    <>
                      <option value="price">Price</option>
                      <option value="style">Style</option>
                      <option value="feature">Feature</option>
                      <option value="custom">Custom</option>
                    </>
                  )}
                </select>
              </div>

              {/* Filter Key */}
              {formData.filterType !== 'all' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter Key *</label>
                  <input
                    type="text"
                    value={formData.filterKey}
                    onChange={(e) => setFormData({ ...formData, filterKey: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="e.g., material_slugs, tag_slugs, price_per_sqft"
                  />
                </div>
              )}

              {/* Filter Operator (chips only) */}
              {modalType === 'chip' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter Operator</label>
                  <select
                    value={formData.filterOperator}
                    onChange={(e) => setFormData({ ...formData, filterOperator: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  >
                    <option value="equals">Equals</option>
                    <option value="contains">Contains</option>
                    <option value="range">Range (JSON)</option>
                    <option value="in">In Array</option>
                  </select>
                </div>
              )}

              {/* Filter Value */}
              {formData.filterType !== 'all' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter Value {formData.filterOperator === 'range' && '(JSON format)'}
                  </label>
                  <input
                    type="text"
                    value={formData.filterValue}
                    onChange={(e) => setFormData({ ...formData, filterValue: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder={formData.filterOperator === 'range' ? '{"min": 0, "max": 400}' : 'e.g., wooden, minimal'}
                  />
                </div>
              )}

              {/* Group Name (chips only) */}
              {modalType === 'chip' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
                  <input
                    type="text"
                    value={formData.groupName}
                    onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="e.g., Price, Style, Lighting"
                  />
                </div>
              )}

              {/* Display Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              {/* Color Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color Code</label>
                <input
                  type="color"
                  value={formData.colorCode}
                  onChange={(e) => setFormData({ ...formData, colorCode: e.target.value })}
                  className="w-full h-12 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Checkboxes */}
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-gray-900 rounded"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
                
                {modalType === 'tab' && (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                      className="w-4 h-4 text-gray-900 rounded"
                    />
                    <span className="text-sm text-gray-700">Default Tab</span>
                  </label>
                )}
                
                {modalType === 'chip' && (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-4 h-4 text-gray-900 rounded"
                    />
                    <span className="text-sm text-gray-700">Featured</span>
                  </label>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save {modalType === 'tab' ? 'Tab' : 'Chip'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
