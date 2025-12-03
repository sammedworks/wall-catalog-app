'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Plus,
  Minus,
  Share2,
  Heart,
  Info
} from 'lucide-react';

export default function PremiumDesignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [sqft, setSqft] = useState(100);
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  useEffect(() => {
    loadDesignDetails();
  }, [params.id]);

  const loadDesignDetails = async () => {
    try {
      // Load design with all related data
      const { data: designData, error: designError } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .eq('is_active', true)
        .single();

      if (designError) throw designError;

      // Load addons
      const { data: addonsData } = await supabase
        .from('design_addons')
        .select(`
          *,
          addon:addons(*)
        `)
        .eq('design_id', params.id)
        .eq('is_enabled', true)
        .order('display_order');

      // Load products
      const { data: productsData } = await supabase
        .from('design_products')
        .select(`
          *,
          product:products_catalog(*)
        `)
        .eq('design_id', params.id)
        .order('display_order');

      // Load filters
      const { data: filtersData } = await supabase
        .from('design_filters')
        .select(`
          filter:filters(
            *,
            category:filter_categories(*)
          )
        `)
        .eq('design_id', params.id);

      setDesign({
        ...designData,
        addons: addonsData?.map(da => ({
          ...da.addon,
          custom_price: da.custom_price,
          display_order: da.display_order
        })) || [],
        products: productsData?.map(dp => ({
          ...dp.product,
          quantity: dp.quantity,
          display_order: dp.display_order
        })) || [],
        filters: filtersData?.map(df => df.filter) || []
      });
    } catch (error) {
      console.error('Error loading design:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImages = () => {
    if (!design) return [];
    const images = [
      design.image_url,
      design.image_url_2,
      design.image_url_3,
      design.image_url_4,
      design.image_url_5
    ].filter(Boolean);
    return images.length > 0 ? images : ['https://via.placeholder.com/800x600?text=No+Image'];
  };

  const calculatePrice = () => {
    if (!design) return 0;

    let basePrice = 0;
    
    if (design.price_calculation_type === 'fixed') {
      basePrice = parseFloat(design.fixed_price || 0);
    } else {
      basePrice = parseFloat(design.price_per_sqft || 0) * sqft;
    }

    const addonsTotal = selectedAddons.reduce((total, addonId) => {
      const addon = design.addons.find(a => a.id === addonId);
      if (!addon) return total;
      
      const price = addon.custom_price || addon.price;
      if (addon.pricing_type === 'per_sqft') {
        return total + (parseFloat(price) * sqft);
      }
      return total + parseFloat(price);
    }, 0);

    return basePrice + addonsTotal;
  };

  const toggleAddon = (addonId) => {
    setSelectedAddons(prev => 
      prev.includes(addonId) 
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  const nextImage = () => {
    const images = getImages();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    const images = getImages();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium text-lg">Loading design...</p>
        </div>
      </div>
    );
  }

  if (!design) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Design Not Found</h2>
          <p className="text-gray-600 mb-6">The design you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/designs')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
          >
            Browse All Designs
          </button>
        </div>
      </div>
    );
  }

  const images = getImages();
  const totalPrice = calculatePrice();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image Slider */}
      <div className="relative w-full h-[60vh] md:h-[70vh] bg-gray-900">
        <img
          src={images[currentImageIndex]}
          alt={design.name}
          className="w-full h-full object-cover"
        />
        
        {/* Image Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
            >
              <ChevronLeft className="w-6 h-6 text-gray-900" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
            >
              <ChevronRight className="w-6 h-6 text-gray-900" />
            </button>
          </>
        )}

        {/* Image Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentImageIndex 
                    ? 'bg-white w-8' 
                    : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-6 left-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
        >
          <ChevronLeft className="w-5 h-5 text-gray-900" />
        </button>

        {/* Action Buttons */}
        <div className="absolute top-6 right-4 flex gap-2">
          <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all">
            <Share2 className="w-5 h-5 text-gray-900" />
          </button>
          <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all">
            <Heart className="w-5 h-5 text-gray-900" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Title & Description */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{design.name}</h1>
          {design.short_description && (
            <p className="text-gray-600 text-lg leading-relaxed">{design.short_description}</p>
          )}
          
          {/* Filters/Tags */}
          {design.filters && design.filters.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {design.filters.map((filter) => (
                <span
                  key={filter.id}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                >
                  {filter.icon && <span className="mr-1">{filter.icon}</span>}
                  {filter.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Pricing Calculator */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white">
          <h2 className="text-xl font-bold mb-4">Calculate Your Price</h2>
          
          {design.price_calculation_type === 'per_sqft' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-blue-100 mb-2">
                Area (sq.ft)
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSqft(Math.max(1, sqft - 10))}
                  className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-all"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <input
                  type="number"
                  value={sqft}
                  onChange={(e) => setSqft(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button
                  onClick={() => setSqft(sqft + 10)}
                  className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-blue-100">Base Design</span>
              <span className="font-bold text-xl">
                ₹{design.price_calculation_type === 'fixed' 
                  ? parseFloat(design.fixed_price || 0).toLocaleString()
                  : (parseFloat(design.price_per_sqft || 0) * sqft).toLocaleString()
                }
              </span>
            </div>
            {design.price_calculation_type === 'per_sqft' && (
              <p className="text-sm text-blue-100">
                ₹{design.price_per_sqft}/sq.ft × {sqft} sq.ft
              </p>
            )}
          </div>

          {selectedAddons.length > 0 && (
            <div className="space-y-2 mb-4">
              {selectedAddons.map(addonId => {
                const addon = design.addons.find(a => a.id === addonId);
                if (!addon) return null;
                const price = addon.custom_price || addon.price;
                const addonTotal = addon.pricing_type === 'per_sqft' 
                  ? parseFloat(price) * sqft 
                  : parseFloat(price);
                
                return (
                  <div key={addonId} className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-100 text-sm">{addon.name}</span>
                      <span className="font-semibold">₹{addonTotal.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="border-t border-white/20 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold">Total Price</span>
              <span className="text-3xl font-bold">₹{totalPrice.toLocaleString()}</span>
            </div>
            <p className="text-sm text-blue-100 mt-1">
              *Final price may vary based on site conditions
            </p>
          </div>
        </div>

        {/* Add-ons */}
        {design.addons && design.addons.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Customize Your Design</h2>
            <div className="space-y-3">
              {design.addons.map((addon) => {
                const price = addon.custom_price || addon.price;
                const isSelected = selectedAddons.includes(addon.id);
                
                return (
                  <button
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-600' 
                          : 'border-gray-300'
                      }`}>
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 mb-1">
                          {addon.icon && <span className="text-xl">{addon.icon}</span>}
                          <h3 className="font-bold text-gray-900">{addon.name}</h3>
                        </div>
                        {addon.description && (
                          <p className="text-sm text-gray-600 mb-2">{addon.description}</p>
                        )}
                        <p className="text-sm font-semibold text-blue-600">
                          +₹{parseFloat(price).toLocaleString()}
                          {addon.pricing_type === 'per_sqft' && '/sq.ft'}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Specifications */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Specifications</h2>
          <div className="grid grid-cols-2 gap-4">
            {design.space_category && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Space Category</p>
                <p className="font-bold text-gray-900 capitalize">
                  {design.space_category.replace('-', ' ')}
                </p>
              </div>
            )}
            {design.material_type && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Material</p>
                <p className="font-bold text-gray-900">{design.material_type}</p>
              </div>
            )}
            {design.style_category && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Style</p>
                <p className="font-bold text-gray-900">{design.style_category}</p>
              </div>
            )}
            {design.lighting_type && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Lighting</p>
                <p className="font-bold text-gray-900">{design.lighting_type}</p>
              </div>
            )}
          </div>
        </div>

        {/* Products & Accessories */}
        {design.products && design.products.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Products & Accessories Used</h2>
            <div className="overflow-x-auto -mx-6 px-6">
              <div className="flex gap-4 pb-4">
                {design.products.map((product) => (
                  <div
                    key={product.id}
                    className="flex-shrink-0 w-64 bg-gray-50 rounded-xl p-4 hover:shadow-md transition-all"
                  >
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-40 object-cover rounded-lg mb-3"
                      />
                    )}
                    <h3 className="font-bold text-gray-900 mb-1">{product.name}</h3>
                    {product.brand && (
                      <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
                    )}
                    {product.category && (
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium mb-2">
                        {product.category}
                      </span>
                    )}
                    {product.price && (
                      <p className="text-lg font-bold text-gray-900">
                        ₹{parseFloat(product.price).toLocaleString()}
                      </p>
                    )}
                    {product.quantity > 1 && (
                      <p className="text-sm text-gray-600">Qty: {product.quantity}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Full Description */}
        {design.full_description && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Design</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {design.full_description}
            </p>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4 flex gap-3">
          <button
            onClick={() => router.push('/designs')}
            className="flex-1 px-6 py-4 bg-gray-100 text-gray-900 rounded-xl font-bold hover:bg-gray-200 transition-all"
          >
            Browse More
          </button>
          <button
            onClick={() => setShowQuoteForm(true)}
            className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg"
          >
            Get Quote
          </button>
        </div>
      </div>

      {/* Quote Form Modal */}
      {showQuoteForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Get Quote</h2>
                <button
                  onClick={() => setShowQuoteForm(false)}
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    rows="4"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell us about your project..."
                  ></textarea>
                </div>
                
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Design:</strong> {design.name}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Estimated Price:</strong> ₹{totalPrice.toLocaleString()}
                  </p>
                </div>

                <button className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">
                  Submit Quote Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
