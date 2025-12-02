'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, EyeOff, Info } from 'lucide-react';

const DEFAULT_FILTERS = {
  look: {
    name: 'Look / Material',
    description: 'Filter designs by material type (Wood, Marble, Rattan, etc.)',
    enabled: true,
    options: ['Wood', 'Marble', 'Rattan', 'Fabric', 'Limewash', 'Pastel', 'Stone', 'Gold', 'Traditional']
  },
  budget: {
    name: 'Budget',
    description: 'Filter designs by price range',
    enabled: true,
    options: ['Economy', 'Minimal', 'Luxe', 'Statement']
  },
  lighting: {
    name: 'Lighting Type',
    description: 'Filter designs by lighting style',
    enabled: true,
    options: ['Cove Light', 'Profile Light', 'Wall Washer Light']
  }
};

export default function FilterManager() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadFilters();
  }, []);

  const loadFilters = () => {
    const saved = localStorage.getItem('filters_config');
    if (saved) {
      setFilters(JSON.parse(saved));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      localStorage.setItem('filters_config', JSON.stringify(filters));
      setMessage('Filter configuration saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving filters:', error);
      setMessage('Error saving filter configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (filterKey) => {
    setFilters({
      ...filters,
      [filterKey]: {
        ...filters[filterKey],
        enabled: !filters[filterKey].enabled
      }
    });
  };

  const handleOptionToggle = (filterKey, optionIndex) => {
    const newOptions = [...filters[filterKey].options];
    // For now, we'll just keep all options enabled
    // This is a placeholder for future functionality
  };

  const enabledCount = Object.values(filters).filter(f => f.enabled).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Filter Manager</h1>
                <p className="text-sm text-gray-600">Enable/disable filters</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}>
            {message}
          </div>
        )}

        {/* Info Box */}
        <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="font-bold text-red-900 mb-2">🔍 Filter Control</h3>
          <p className="text-red-800 mb-2">
            Control which filters are available on space pages and the designs gallery.
          </p>
          <p className="text-red-800">
            <strong>{enabledCount} of 3</strong> filters currently enabled.
          </p>
        </div>

        {/* Filters List */}
        <div className="space-y-6">
          {Object.entries(filters).map(([key, filter]) => (
            <div
              key={key}
              className={`bg-white rounded-2xl shadow-md overflow-hidden border-2 transition-all ${
                filter.enabled ? 'border-red-200' : 'border-gray-200 opacity-60'
              }`}
            >
              <div className={`p-6 border-b ${
                filter.enabled ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{filter.name}</h3>
                      {filter.enabled ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-200 text-gray-600 text-sm font-semibold rounded-full">
                          Disabled
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600">{filter.description}</p>
                  </div>
                  <button
                    onClick={() => handleToggle(key)}
                    className={`p-4 rounded-xl transition-all ${
                      filter.enabled
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                    }`}
                    title={filter.enabled ? 'Disable filter' : 'Enable filter'}
                  >
                    {filter.enabled ? <Eye className="w-6 h-6" /> : <EyeOff className="w-6 h-6" />}
                  </button>
                </div>
              </div>

              <div className="p-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Filter Options ({filter.options.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {filter.options.map((option, index) => (
                    <span
                      key={index}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        filter.enabled
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {option}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex gap-3">
            <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-blue-900 mb-2">How Filters Work</h4>
              <ul className="space-y-2 text-blue-800">
                <li>• <strong>Look / Material:</strong> Filters designs by material type (Wood, Marble, etc.)</li>
                <li>• <strong>Budget:</strong> Filters designs by price category (Economy, Luxe, etc.)</li>
                <li>• <strong>Lighting Type:</strong> Filters designs by lighting style (Cove Light, etc.)</li>
                <li>• Disabled filters won't appear in the filter modal on space and design pages</li>
                <li>• All designs must have these tags set to be filterable</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Filter Usage Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {filters.look.enabled ? '✓' : '✗'}
            </div>
            <div className="text-gray-600 font-medium">Look Filter</div>
            <div className="text-sm text-gray-500 mt-1">
              {filters.look.options.length} options
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {filters.budget.enabled ? '✓' : '✗'}
            </div>
            <div className="text-gray-600 font-medium">Budget Filter</div>
            <div className="text-sm text-gray-500 mt-1">
              {filters.budget.options.length} options
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {filters.lighting.enabled ? '✓' : '✗'}
            </div>
            <div className="text-gray-600 font-medium">Lighting Filter</div>
            <div className="text-sm text-gray-500 mt-1">
              {filters.lighting.options.length} options
            </div>
          </div>
        </div>

        {/* Save Button (Bottom) */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Filter Configuration'}
          </button>
        </div>
      </main>
    </div>
  );
}
