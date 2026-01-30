import React from 'react';
import { Link } from 'react-router-dom';
import { Music, Home } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-lg">
        <div className="relative inline-block mb-8">
            <div className="absolute inset-0 animate-ping opacity-20 bg-brand-red rounded-full"></div>
            <div className="bg-white p-6 rounded-full shadow-xl relative z-10 text-brand-red">
                <Music size={64} />
            </div>
        </div>
        
        <h1 className="text-6xl font-display font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Zdá se, že jste ztratili rytmus...</h2>
        <p className="text-gray-600 mb-8 text-lg">
          Tato stránka bohužel neexistuje. Možná byla přesunuta, smazána, nebo jste jen udělali překlep v tanečních krocích.
        </p>
        
        <Link 
          to="/" 
          className="inline-flex items-center px-8 py-3 bg-brand-blue text-white font-bold rounded-xl hover:bg-blue-800 transition-all shadow-lg transform hover:-translate-y-1"
        >
          <Home className="mr-2" size={20} />
          Zpět na parket (Domů)
        </Link>
      </div>
    </div>
  );
};

export default NotFound;