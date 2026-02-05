import React from 'react';
import { ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-12 pb-12 lg:pt-20 lg:pb-12 overflow-hidden bg-gradient-to-br from-blue-50 to-white">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-brand-blue/10 blur-3xl animate-float"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-brand-red/10 blur-3xl animate-float-delayed"></div>
      <div className="absolute top-1/2 left-10 w-32 h-32 rounded-full bg-yellow-400/10 blur-2xl animate-pulse-slow"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-brand-red/10 text-brand-red text-sm font-semibold mb-6 animate-fadeIn">
          <Star size={16} className="mr-2 animate-spin-slow" />
          <span>Nábor nových členů zahájen 2026/2027</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6 font-display">
          Objevte radost <br />
          <span className="text-brand-blue">z pohybu a tance</span>
        </h1>
        
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Taneční kroužky pro děti přímo na vaší škole. Moderní styly, skvělá parta a profesionální lektoři. Přidejte se k týmu Olymp Dance!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link to="/krouzky" className="px-8 py-4 bg-brand-blue text-white rounded-xl font-bold text-lg hover:bg-blue-800 transition-all shadow-lg hover:shadow-brand-blue/30 flex items-center justify-center transform hover:-translate-y-1">
            Najít kroužek
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
          <Link to="/tabory" className="px-8 py-4 bg-white text-brand-blue border-2 border-brand-blue rounded-xl font-bold text-lg hover:bg-blue-50 transition-all flex items-center justify-center transform hover:-translate-y-1">
            Letní tábory
          </Link>
        </div>

        {/* Wide Banner Image - Taller and better positioning */}
        <div className="relative w-full max-w-6xl mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-white transform hover:scale-[1.01] transition-transform duration-500 group">
           <img 
             src="https://static.wixstatic.com/media/93005c_362da366b610451abefc712af9703b80~mv2.jpg/v1/fill/w_1901,h_450,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/93005c_362da366b610451abefc712af9703b80~mv2.jpg" 
             alt="Taneční tým Olymp Dance" 
             className="w-full h-auto min-h-[300px] md:min-h-[500px] object-cover object-top"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500"></div>
           
           {/* Floating Badge on Image */}
           <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg shadow-lg flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm font-bold text-gray-800">Právě trénujeme v Olomouci</span>
           </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;