import React, { useState } from 'react';
import { Calendar, CheckCircle, Info, X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import ReactMarkdown from 'react-markdown';
import { Camp } from '../types';

const Camps: React.FC = () => {
  const navigate = useNavigate();
  const { camps, campGeneralInfo } = useData();
  const [selectedCamp, setSelectedCamp] = useState<Camp | null>(null);

  const handleRegister = (camp: Camp) => {
    if (camp.externalUrl) {
      window.open(camp.externalUrl, '_blank');
    } else {
      navigate(`/registrace/${camp.id}`);
    }
  };

  const openDetails = (camp: Camp) => {
    setSelectedCamp(camp);
  };

  const closeDetails = () => {
    setSelectedCamp(null);
  };

  return (
    <section className="py-12 bg-white min-h-screen relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Section */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl mb-12">
          <img 
            src="https://web2.itnahodinu.cz/olympdance/prostejov/img_14_optimized.02.25_00050.jpg" 
            alt="Letní tábory" 
            className="w-full h-[300px] md:h-[450px] object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center">
            <div className="px-8 md:px-12">
              <span className="text-brand-red font-bold tracking-wider uppercase text-sm bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">Léto 2026</span>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-white mt-4 mb-2">
                Letní Taneční Campy
              </h2>
              <p className="text-white/90 text-lg max-w-xl">
                Nezapomenutelné zážitky, noví přátelé a spousta tance pro všechny věkové kategorie.
              </p>
            </div>
          </div>
        </div>

        {/* General Info Section (Dynamic) */}
        {campGeneralInfo && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 mb-12 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-full text-brand-blue shrink-0">
                        <Info size={24} />
                    </div>
                    <div className="prose prose-blue max-w-none text-gray-700">
                        <ReactMarkdown>{campGeneralInfo}</ReactMarkdown>
                    </div>
                </div>
            </div>
        )}

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Proč poslat děti na náš tábor?</h3>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Neseďte v létě doma! Připravili jsme pro vaše děti nezapomenutelné zážitky plné pohybu, hudby a nových kamarádů. 
              Naše příměstské i pobytové tábory jsou vhodné pro začátečníky i pokročilé tanečníky.
            </p>
            <ul className="space-y-4">
              {[
                'Profesionální lektoři a animátoři s praxí',
                'Zajištěná strava (svačiny, obědy) a pitný režim',
                'Závěrečná show pro rodiče',
                'Bohatý doprovodný program, hry a soutěže'
              ].map((item, i) => (
                <li key={i} className="flex items-center text-gray-700 font-medium">
                  <CheckCircle className="w-5 h-5 text-brand-red mr-3 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-brand-blue/5 rounded-2xl p-8 flex flex-col justify-center border border-brand-blue/10">
             <h4 className="text-xl font-bold text-brand-blue mb-4">Co s sebou?</h4>
             <p className="text-gray-600 mb-4">
               Pohodlné sportovní oblečení, pevnou obuv na tanec, láhev na pití a hlavně dobrou náladu! 
               Na pobytové tábory zasíláme podrobný seznam věcí emailem.
             </p>
             <button onClick={() => navigate('/kontakt')} className="self-start text-brand-red font-bold hover:text-red-800 transition-colors flex items-center">
               Máte dotaz? Napište nám
             </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {camps.map((camp) => (
            <div key={camp.id} className="group flex flex-col bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="relative h-48 overflow-hidden">
                <img src={camp.image} alt={camp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-900 shadow-sm">
                  {camp.price}
                </div>
              </div>
              
              <div className="p-5 flex-grow flex flex-col">
                <div className="flex items-center text-sm font-medium text-brand-red mb-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  {camp.date}
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">{camp.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">{camp.description}</p>
                
                <div className="mt-auto space-y-2">
                    {camp.details && (
                        <button 
                            onClick={() => openDetails(camp)}
                            className="w-full bg-white text-brand-blue border border-brand-blue py-2 rounded-lg font-bold hover:bg-blue-50 transition-all text-sm"
                        >
                            Více info
                        </button>
                    )}
                    <button 
                        onClick={() => handleRegister(camp)}
                        className="w-full bg-gray-50 text-gray-900 border border-gray-200 py-2 rounded-lg font-bold hover:bg-brand-blue hover:text-white hover:border-brand-blue transition-all text-sm flex items-center justify-center"
                    >
                        {camp.externalUrl ? <>Registrovat <ExternalLink size={14} className="ml-2" /></> : 'Registrovat dítě'}
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedCamp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={closeDetails}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
                <button 
                    onClick={closeDetails}
                    className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors z-10"
                >
                    <X size={20} />
                </button>
                
                <div className="relative h-48 sm:h-64">
                    <img src={selectedCamp.image} alt={selectedCamp.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                        <span className="text-white/80 text-sm font-bold uppercase tracking-wider mb-1">{selectedCamp.date}</span>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white">{selectedCamp.title}</h2>
                    </div>
                </div>

                <div className="p-6 sm:p-8">
                    <div className="prose prose-sm sm:prose-base max-w-none text-gray-700 mb-8">
                        <ReactMarkdown>{selectedCamp.details || ''}</ReactMarkdown>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
                        <button 
                            onClick={() => handleRegister(selectedCamp)}
                            className="flex-1 bg-brand-red text-white font-bold py-3 px-6 rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center shadow-lg hover:shadow-red-200"
                        >
                            {selectedCamp.externalUrl ? 'Přejít na registraci' : 'Zaregistrovat dítě'}
                            <ExternalLink size={18} className="ml-2" />
                        </button>
                        <button 
                            onClick={closeDetails}
                            className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Zavřít
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </section>
  );
};

export default Camps;