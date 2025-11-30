'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Upload, X, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    room_type: 'Living room',
    finish_type: 'Marble',
    color_tone: '',
    price_per_sqft: '',
    dimensions: '',
    installation_type: '',
    image_url: '',
    is_active: true,
    is_featured: false
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('products')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image: ' + error.message);
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate
      if (!formData.name || !formData.sku || !formData.price_per_sqft) {
        alert('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Insert product
      const { data, error } = await supabase
        .from('products')
        .insert({
          ...formData,
          price_per_sqft: parseFloat(formData.price_per_sqft),
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      alert('Product created successfully!');
      router.push('/admin/products');
      
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Products
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-gray-600 mt-1">Create a new wall panel design</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Image Upload */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Product Image</h2>
              
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-xl border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData({ ...formData, image_url: '' });
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 transition-all bg-gray-50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-sm text-gray-600">Uploading...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="mb-2 text-sm text-gray-600">
                          <span className="font-semibold">Click to upload</span>
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG (MAX. 5MB)</p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Right Column - Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    SKU <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="WP-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Marble Luxe Retreat"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Premium marble finish wall panel..."
                  />
                </div>
              </div>
            </div>

            {/* Categorization */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Categorization</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Room Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.room_type}
                    onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Living room">Living Room</option>
                    <option value="TV unit">TV Unit</option>
                    <option value="Bedroom">Bedroom</option>
                    <option value="Ceiling">Ceiling</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Finish Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.finish_type}
                    onChange={(e) => setFormData({ ...formData, finish_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Marble">Marble</option>
                    <option value="Wooden">Wooden</option>
                    <option value="Fabric">Fabric</option>
                    <option value="Metallic">Metallic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Color Tone
                  </label>
                  <input
                    type="text"
                    value={formData.color_tone}
                    onChange={(e) => setFormData({ ...formData, color_tone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Light, Dark, Grey..."
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Specifications */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Pricing & Specifications</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price per sq.ft <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={formData.price_per_sqft}
                      onChange={(e) => setFormData({ ...formData, price_per_sqft: e.target.value })}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="320.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dimensions
                  </label>
                  <input
                    type="text"
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="10x12 ft"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Installation Type
                  </label>
                  <input
                    type="text"
                    value={formData.installation_type}
                    onChange={(e) => setFormData({ ...formData, installation_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Wall Mount, Adhesive..."
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Status</h2>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Active (visible to customers)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured (show on homepage)</span>
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={loading || uploading}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg font-semibold disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Creating...' : 'Create Product'}
              </button>
              
              <Link
                href="/admin/products"
                className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}