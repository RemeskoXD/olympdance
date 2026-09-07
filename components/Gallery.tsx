import React, { useState, useCallback, useEffect } from 'react';
import { Camera, X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { useData } from '../context/DataContext';

const Gallery: React.FC = () => {
  const { galleryImages } = useData();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [failedKeys, setFailedKeys] = useState<Set<string>>(new Set());

  const visibleImages = galleryImages.filter(img => 
    img && 
    img.url && 
    !failedKeys.has(img.id || img.url) && 
    !img.url.includes('photo-test-delete-verification')
  );

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
  };

  const closeLightbox = useCallback(() => {
    setSelectedIndex(null);
    document.body.style.overflow = 'unset';
  }, []);

  const nextImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedIndex === null || visibleImages.length === 0) return;
    setSelectedIndex((prev) => (prev !== null && prev < visibleImages.length - 1 ? prev + 1 : 0));
  }, [selectedIndex, visibleImages.length]);

  const prevImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedIndex === null || visibleImages.length === 0) return;
    setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : visibleImages.length - 1));
  }, [selectedIndex, visibleImages.length]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, closeLightbox, nextImage, prevImage]);

  return (
    <section className="py-8 sm:py-12 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-16">
          <span className="text-brand-red font-bold tracking-wider uppercase text-xs sm:text-sm">Fotogalerie</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-gray-900 mt-2 mb-3 sm:mb-4">
            Jak to u nás žije
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            Podívejte se na momentky z našich tréninků, vystoupení a letních táborů.
          </p>
        </div>

        {visibleImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {visibleImages.map((image, index) => (
              <div 
                key={image.id || image.url} 
                onClick={() => openLightbox(index)}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md sm:shadow-lg cursor-pointer bg-gray-100 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <img 
                  src={image.url} 
                  alt="Galerie" 
                  loading="lazy"
                  onError={() => {
                    setFailedKeys(prev => new Set(prev).add(image.id || image.url));
                  }}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="bg-white/90 p-3 sm:p-4 rounded-full shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                     <ZoomIn className="w-5 h-5 sm:w-6 sm:h-6 text-brand-blue" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 sm:py-20 text-gray-500">
            <Camera size={44} className="mx-auto mb-4 opacity-30" />
            <p className="text-sm sm:text-base">Zatím zde nejsou žádné fotografie.</p>
          </div>
        )}
        
        <div className="mt-10 sm:mt-16 text-center">
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-brand-blue font-bold hover:text-brand-red transition-colors text-sm sm:text-base">
                Více fotek najdete na našem Instagramu &rarr;
            </a>
        </div>
      </div>

      {/* Lightbox Overlay */}
      {selectedIndex !== null && visibleImages[selectedIndex] && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center animate-fadeIn" onClick={closeLightbox}>
          
          {/* Close Button */}
          <button 
            onClick={closeLightbox}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2.5 text-white/80 hover:text-white bg-white/15 hover:bg-white/25 rounded-full transition-colors z-[102]"
            aria-label="Zavřít"
          >
            <X size={24} className="sm:w-8 sm:h-8" />
          </button>

          {/* Navigation Buttons */}
          <button 
            onClick={prevImage}
            className="absolute left-2 sm:left-4 p-2 sm:p-3 text-white/80 hover:text-white bg-white/15 hover:bg-white/25 rounded-full transition-colors z-[102]"
            aria-label="Předchozí"
          >
            <ChevronLeft size={24} className="sm:w-8 sm:h-8" />
          </button>

          <button 
            onClick={nextImage}
            className="absolute right-2 sm:right-4 p-2 sm:p-3 text-white/80 hover:text-white bg-white/15 hover:bg-white/25 rounded-full transition-colors z-[102]"
            aria-label="Další"
          >
            <ChevronRight size={24} className="sm:w-8 sm:h-8" />
          </button>

          {/* Image Container */}
          <div className="relative max-w-7xl max-h-screen p-3 sm:p-4 flex items-center justify-center w-full h-full" onClick={e => e.stopPropagation()}>
             <img 
               src={visibleImages[selectedIndex].url} 
               alt="Galerie detail" 
               className="max-w-full max-h-[85vh] sm:max-h-[90vh] object-contain rounded-lg shadow-2xl animate-scaleIn"
             />
             <div className="absolute bottom-4 sm:bottom-8 left-0 right-0 text-center text-white/80 text-xs sm:text-sm font-medium pointer-events-none">
                {selectedIndex + 1} / {visibleImages.length}
             </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Gallery;