'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, ZoomIn, Save, FileText, Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';

const MATERIALS = [
  { id: 'walnut', name: 'Walnut Wood', type: 'Wood', priceAdjustment: 2000, color: '#5D4037' },
  { id: 'oak', name: 'Oak Wood', type: 'Wood', priceAdjustment: 1500, color: '#8D6E63' },
  { id: 'teak', name: 'Teak Wood', type: 'Wood', priceAdjustment: 2500, color: '#6D4C41' },
  { id: 'marble', name: 'Italian Marble', type: 'Marble', priceAdjustment: 3000, color: '#ECEFF1' },
  { id: 'stone', name: 'Natural Stone', type: 'Stone', priceAdjustment: 1000, color: '#78909C' },
  { id: 'paint', name: 'Premium Paint', type: 'Paint', priceAdjustment: -500, color: '#90CAF9' },
];

const ADDONS = [
  { id: 'led', name: 'LED Lighting', price: 3500, icon: '💡' },
  { id: 'shelves', name: 'Floating Shelves', price: 2500, icon: '📚' },
  { id: 'mirror', name: 'Designer Mirror', price: 4000, icon: '🪞' },
  { id: 'storage', name: 'Hidden Storage', price: 5000, icon: '🗄️' },
];

const INSTALLATION_LABOR = 1500;

export default function DesignDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const designId = searchParams.get('id');
  
  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState(MATERIALS[0]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [area, setArea] = useState(100);
  const [imageZoom, setImageZoom] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (designId) {
      loadDesign();
    }
  }, [designId]);

  const loadDesign = async () => {
    try {
      // Try designs table first
      let { data, error } = await supabase
        .from('designs')
        .select('*')
        .eq('id', designId)
        .single();

      // Fallback to products table
      if (error || !data) {
        const result = await supabase
          .from('products')
          .select('*')
          .eq('id', designId)
          .single();
        data = result.data;
        error = result.error;
      }

      if (error) throw error;
      setDesign(data);
    } catch (error) {
      console.error('Error loading design:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImages = () => {
    if (!design) return [];
    const images = [];
    if (design.image_url) images.push(design.image_url);
    if (design.image_url_2) images.push(design.image_url_2);
    return images.length > 0 ? images : ['https://via.placeholder.com/800x600?text=Design+Preview'];
  };

  const images = getImages();

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const toggleAddon = (addon) => {
    if (selectedAddons.find(a => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter(a => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const calculateCost = () => {
    if (!design) return { base: 0, material: 0, addons: 0, labor: 0, total: 0 };

    const pricePerSqft = design.price_per_sqft || 500;
    const baseCost = pricePerSqft * area;
    const materialCost = selectedMaterial.priceAdjustment;
    const addonsCost = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
    const laborCost = INSTALLATION_LABOR;
    const total = baseCost + materialCost + addonsCost + laborCost;

    return {
      base: baseCost,
      material: materialCost,
      addons: addonsCost,
      labor: laborCost,
      total: total,
      rounded: Math.round(total / 1000) * 1000
    };
  };

  const handleSaveDesign = () => {
    const savedDesigns = JSON.parse(localStorage.getItem('savedDesigns') || '[]');
    const designData = {
      id: design.id,
      name: design.name,
      image: images[0],
      material: selectedMaterial,
      addons: selectedAddons,
      area: area,
      cost: calculateCost(),
      savedAt: new Date().toISOString()
    };
    savedDesigns.push(designData);
    localStorage.setItem('savedDesigns', JSON.stringify(savedDesigns));
    alert('Design saved successfully!');
  };

  const handleCreateQuote = () => {
    const quoteData = {
      design: design,
      material: selectedMaterial,
      addons: selectedAddons,
      area: area,
      cost: calculateCost()
    };
    localStorage.setItem('currentQuote', JSON.stringify(quoteData));
    router.push('/quote');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading design...</p>
        </div>
      </div>
    );
  }

  if (!design) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Design not found</h2>
          <Link href="/browse" className="text-blue-600 hover:text-blue-700 font-semibold">
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  const cost = calculateCost();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/browse" className="p-2 hover:bg-gray-100 rounded-lg transition-all">
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{design.name}</h1>
              <p className="text-xs text-gray-600">Customize your design</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Carousel */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="relative h-96 bg-gray-100 group">
                <img
                  src={images[currentImageIndex]}
                  alt={`${design.name} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/800x600?text=Design+Preview';
                  }}
                />
                
                {/* Image Counter */}
                {images.length > 1 && (
                  <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                )}

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 p-3 rounded-full shadow-lg transition-all"
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-900" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 p-3 rounded-full shadow-lg transition-all"
                    >
                      <ChevronRight className="w-6 h-6 text-gray-900" />
                    </button>
                  </>
                )}

                {/* Zoom Overlay */}
                <div 
                  className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center cursor-pointer"
                  onClick={() => setImageZoom(true)}
                >
                  <div className="opacity-0 group-hover:opacity-100 transition-all bg-white rounded-full p-4">
                    <ZoomIn className="w-8 h-8 text-gray-900" />
                  </div>
                </div>
              </div>

              {/* Thumbnail Navigation */}
              {images.length > 1 && (
                <div className="p-4 flex gap-2 justify-center bg-gray-50">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        currentImageIndex === idx
                          ? 'border-blue-600 shadow-lg'
                          : 'border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/100x100?text=' + (idx + 1);
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}

              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{design.name}</h2>
                <p className="text-gray-600">{design.description || 'Premium wall panel design'}</p>
              </div>
            </div>

            {/* Materials */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Select Material</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {MATERIALS.map((material) => (
                  <button
                    key={material.id}
                    onClick={() => setSelectedMaterial(material)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedMaterial.id === material.id
                        ? 'border-blue-600 bg-blue-50 shadow-lg'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div
                      className="w-full h-16 rounded-lg mb-3"
                      style={{ backgroundColor: material.color }}
                    ></div>
                    <p className="font-semibold text-gray-900 text-sm mb-1">{material.name}</p>
                    <p className="text-xs text-gray-600 mb-2">{material.type}</p>
                    <p className={`text-sm font-bold ${material.priceAdjustment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {material.priceAdjustment >= 0 ? '+' : ''}₹{material.priceAdjustment.toLocaleString('en-IN')}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Add-ons */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Add-ons (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ADDONS.map((addon) => {
                  const isSelected = selectedAddons.find(a => a.id === addon.id);
                  return (
                    <button
                      key={addon.id}
                      onClick={() => toggleAddon(addon)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-green-600 bg-green-50 shadow-lg'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl">{addon.icon}</span>
                        {isSelected && (
                          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                      <p className="font-semibold text-gray-900 mb-1">{addon.name}</p>
                      <p className="text-sm font-bold text-green-600">+₹{addon.price.toLocaleString('en-IN')}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Area */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Wall Area (sq.ft)</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setArea(Math.max(10, area - 10))}
                  className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                >
                  <Minus className="w-6 h-6 text-gray-700" />
                </button>
                <input
                  type="number"
                  value={area}
                  onChange={(e) => setArea(Math.max(10, parseInt(e.target.value) || 10))}
                  className="flex-1 text-center text-2xl font-bold py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="10"
                />
                <button
                  onClick={() => setArea(area + 10)}
                  className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                >
                  <Plus className="w-6 h-6 text-gray-700" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Cost Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Cost Summary</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Base Cost</span>
                  <span className="font-semibold text-gray-900">₹{cost.base.toLocaleString('en-IN')}</span>
                </div>
                
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Material</span>
                  <span className={`font-semibold ${cost.material >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {cost.material >= 0 ? '+' : ''}₹{cost.material.toLocaleString('en-IN')}
                  </span>
                </div>
                
                {cost.addons > 0 && (
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Add-ons</span>
                    <span className="font-semibold text-green-600">+₹{cost.addons.toLocaleString('en-IN')}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Installation</span>
                  <span className="font-semibold text-gray-900">₹{cost.labor.toLocaleString('en-IN')}</span>
                </div>
                
                <div className="flex justify-between items-center pt-3">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-blue-600">₹{cost.rounded.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleCreateQuote}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  Get Quote
                </button>
                
                <button
                  onClick={handleSaveDesign}
                  className="w-full py-4 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Design
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {imageZoom && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setImageZoom(false)}
        >
          <img
            src={images[currentImageIndex]}
            alt={design.name}
            className="max-w-full max-h-full object-contain"
          />
          <button
            onClick={() => setImageZoom(false)}
            className="absolute top-4 right-4 bg-white rounded-full p-3 hover:bg-gray-100 transition-all"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>
      )}
    </div>
  );
}
