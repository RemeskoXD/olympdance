import React from 'react';
import { ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { getHeroEnrollmentText } from '../utils/schoolYear';

const Hero: React.FC = () => {
  const { siteContent } = useData();
  const title = siteContent?.heroTitle || 'Objevte pravou radost z pohybu a tance';
  const subtitle = siteContent?.heroSubtitle || 'Taneční kroužky pro děti přímo na vaší škole. Moderní styly, skvělá parta a profesionální lektoři. Přidejte se k týmu Olymp Dance!';
  const enrollmentText = getHeroEnrollmentText();

  return (
    <section className="relative pt-12 pb-12 lg:pt-20 lg:pb-12 overflow-hidden bg-gradient-to-br from-blue-50 to-white">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-brand-blue/10 blur-3xl animate-float"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-brand-red/10 blur-3xl animate-float-delayed"></div>
      <div className="absolute top-1/2 left-10 w-32 h-32 rounded-full bg-yellow-400/10 blur-2xl animate-pulse-slow"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-brand-red/10 text-brand-red text-sm font-semibold mb-6 animate-fadeIn">
          <Star size={16} className="mr-2 animate-spin-slow" />
          <span>{enrollmentText}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6 font-display" dangerouslySetInnerHTML={{ __html: title.replace(/z pohybu a tance/gi, '<br class="hidden sm:inline"/><span class="text-brand-blue">z pohybu a tance</span>') }}>
        </h1>
        
        <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10 sm:mb-12">
          <Link to="/tanecnikrouzky" className="w-full sm:w-auto px-8 py-4 bg-brand-blue text-white rounded-xl font-bold text-base sm:text-lg hover:bg-blue-800 transition-all shadow-lg hover:shadow-brand-blue/30 flex items-center justify-center transform hover:-translate-y-1">
            Najít kroužek
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
          <Link to="/letnicampy" className="w-full sm:w-auto px-8 py-4 bg-white text-brand-blue border-2 border-brand-blue rounded-xl font-bold text-base sm:text-lg hover:bg-blue-50 transition-all flex items-center justify-center transform hover:-translate-y-1">
            Letní tábory
          </Link>
        </div>

        {/* Wide Banner Image - Taller and better positioning */}
        <div className="relative w-full max-w-6xl mx-auto rounded-2xl overflow-hidden shadow-2xl border-2 sm:border-4 border-white transform hover:scale-[1.01] transition-transform duration-500 group">
           <img 
             src="https://web2.itnahodinu.cz/olympdance/star1.jpg" 
             alt="Taneční tým Olymp Dance" 
             className="w-full h-auto min-h-[220px] sm:min-h-[350px] md:min-h-[500px] object-cover object-top"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500"></div>
           
           {/* Floating Badge on Image */}
           <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 md:bottom-8 md:left-8 bg-white/95 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg shadow-lg flex items-center max-w-[92%] sm:max-w-none text-left">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full mr-2 shrink-0 animate-pulse"></div>
              <span className="text-xs sm:text-sm font-bold text-gray-800 line-clamp-1 sm:line-clamp-none">Právě trénujeme v Olomouci, Prostějově a okolí</span>
           </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;