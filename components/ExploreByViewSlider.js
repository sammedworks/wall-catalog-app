'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DEFAULT_LOOKS = [
  {
    id: 'wood',
    name: 'Wood',
    image: 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=800&h=600&fit=crop',
    color: '#8B4513',
    enabled: true,
    order: 1
  },
  {
    id: 'marble',
    name: 'Marble',
    image: 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=800&h=600&fit=crop',
    color: '#F5F5F5',
    enabled: true,
    order: 2
  },
  {
    id: 'rattan',
    name: 'Rattan',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=600&fit=crop',
    color: '#D2B48C',
    enabled: true,
    order: 3
  },
  {
    id: 'fabric',
    name: 'Fabric',
    image: 'https://images.unsplash.com/photo-1616137466211-f939a420be84?w=800&h=600&fit=crop',
    color: '#E6E6FA',
    enabled: true,
    order: 4
  },
  {
    id: 'limewash',
    name: 'Limewash',
    image: 'https://images.unsplash.com/photo-1615875474908-f403116f5287?w=800&h=600&fit=crop',
    color: '#F0EAD6',
    enabled: true,
    order: 5
  },
  {
    id: 'pastel',
    name: 'Pastel',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=600&fit=crop',
    color: '#FFB6C1',
    enabled: true,
    order: 6
  },
  {
    id: 'stone',
    name: 'Stone',
    image: 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=800&h=600&fit=crop',
    color: '#808080',
    enabled: true,
    order: 7
  },
  {
    id: 'gold',
    name: 'Gold',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&h=600&fit=crop',
    color: '#FFD700',
    enabled: true,
    order: 8
  },
  {
    id: 'traditional',
    name: 'Traditional',
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&h=600&fit=crop',
    color: '#8B0000',
    enabled: true,
    order: 9
  },
];

export default function ExploreByViewSlider() {
  const [looks, setLooks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const sliderRef = useRef(null);
  const autoPlayRef = useRef(null);

  useEffect(() => {
    loadLooks();
  }, []);

  useEffect(() => {
    if (isAutoPlaying && looks.length > 0) {
      autoPlayRef.current = setInterval(() => {
        handleNext();
      }, 4000); // Auto-advance every 4 seconds
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, currentIndex, looks.length]);

  const loadLooks = () => {
    const saved = localStorage.getItem('looks_config');
    if (saved) {
      const allLooks = JSON.parse(saved);
      const enabledLooks = allLooks.filter(look => look.enabled);
      setLooks(enabledLooks);
    } else {
      setLooks(DEFAULT_LOOKS);
    }
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? looks.length - 1 : prev - 1));
    setIsAutoPlaying(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === looks.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const getVisibleSlides = () => {
    if (looks.length === 0) return [];
    
    const slides = [];
    const totalSlides = looks.length;
    
    // Show 3 slides: previous, current, next
    for (let i = -1; i <= 1; i++) {
      const index = (currentIndex + i + totalSlides) % totalSlides;
      slides.push({ ...looks[index], position: i });
    }
    
    return slides;
  };

  if (looks.length === 0) {
    return null;
  }

  const visibleSlides = getVisibleSlides();

  return (
    <div className="w-full py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Explore by View
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover stunning wall designs by material and style
          </p>
        </div>

        {/* Slider Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all hover:scale-110 group"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700 group-hover:text-gray-900" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all hover:scale-110 group"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-gray-700 group-hover:text-gray-900" />
          </button>

          {/* Slides */}
          <div className="relative h-[500px] overflow-hidden" ref={sliderRef}>
            <div className="absolute inset-0 flex items-center justify-center">
              {visibleSlides.map((slide, idx) => {
                const isCenter = slide.position === 0;
                const isLeft = slide.position === -1;
                const isRight = slide.position === 1;

                return (
                  <Link
                    key={`${slide.id}-${idx}`}
                    href={`/designs?look=${encodeURIComponent(slide.name)}`}
                    className={`absolute transition-all duration-500 ease-out ${
                      isCenter
                        ? 'z-10 scale-100 opacity-100'
                        : 'z-0 scale-75 opacity-40 hover:opacity-60'
                    }`}
                    style={{
                      transform: `translateX(${
                        isLeft ? '-120%' : isRight ? '120%' : '0'
                      }) scale(${isCenter ? 1 : 0.75})`,
                    }}
                  >
                    <div className="w-[400px] bg-white rounded-2xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-300 group">
                      {/* Image */}
                      <div className="relative h-[320px] overflow-hidden">
                        <img
                          src={slide.image}
                          alt={slide.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.target.src = `https://via.placeholder.com/400x320/${slide.color.replace('#', '')}?text=${slide.name}`;
                          }}
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        
                        {/* Look Name on Image */}
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                            {slide.name}
                          </h3>
                          <div className="flex items-center gap-2 text-white/90">
                            <span className="text-sm font-medium">View Designs</span>
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="p-6 bg-white">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full border-2 border-gray-200"
                              style={{ backgroundColor: slide.color }}
                            />
                            <span className="text-sm font-semibold text-gray-700">
                              {slide.name} Collection
                            </span>
                          </div>
                          <span className="text-sm text-blue-600 font-semibold group-hover:gap-2 flex items-center transition-all">
                            Explore
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Dots Navigation */}
          <div className="flex justify-center gap-2 mt-8">
            {looks.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? 'w-8 h-3 bg-blue-600'
                    : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Slide Counter */}
          <div className="text-center mt-4">
            <span className="text-sm font-medium text-gray-600">
              {currentIndex + 1} / {looks.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
