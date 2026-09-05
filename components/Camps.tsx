import React, { useState } from 'react';
import { Calendar, CheckCircle, Info, X, ExternalLink, ArrowLeft, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import ReactMarkdown from 'react-markdown';
import { Camp } from '../types';
import { getCampSeasonYear, formatCampDate } from '../utils/schoolYear';

const Camps: React.FC = () => {
  const navigate = useNavigate();
  const { camps, campGeneralInfo, isCampsEnabled } = useData();
  const [selectedCamp, setSelectedCamp] = useState<Camp | null>(null);

  if (!isCampsEnabled) {
    return (
      <section className="py-16 sm:py-24 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="max-w-xl mx-auto px-4 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Sun size={36} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-gray-900 mb-3">
            Letní tábory {getCampSeasonYear()}
          </h2>
          <p className="text-gray-600 text-base sm:text-lg mb-8 leading-relaxed">
            Přihlašování a nabídka na letní tábory je v tuto chvíli uzavřena. Připravujeme pro vás program na novou sezónu!
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center bg-brand-blue hover:bg-blue-800 text-white font-bold px-6 py-3 rounded-full transition-all shadow-md"
          >
            <ArrowLeft size={18} className="mr-2" /> Zpět na hlavní stránku
          </button>
        </div>
      </section>
    );
  }

  const handleRegister = (camp: Camp) => {
    if (camp.externalUrl) {
      window.open(camp.externalUrl, '_blank');
    } else {
      navigate(`/registrace/${camp.id}`);
    }
  };

  const openDetails = (camp: Camp) => {
    setSelectedCamp(camp);
    document.body.style.overflow = 'hidden';
  };

  const closeDetails = () => {
    setSelectedCamp(null);
    document.body.style.overflow = 'unset';
  };

  return (
    <section className="py-8 sm:py-12 bg-white min-h-screen relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Section */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl mb-8 sm:mb-12">
          <img 
            src="/images/IMG_8522.jpg" 
            alt="Letní tábory" 
            className="w-full h-[240px] sm:h-[340px] md:h-[450px] object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent flex items-center">
            <div className="px-5 sm:px-8 md:px-12 py-6">
              <span className="text-brand-red font-bold tracking-wider uppercase text-xs sm:text-sm bg-white/15 px-3 py-1 rounded-full backdrop-blur-md inline-block">
                Léto {getCampSeasonYear()}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold text-white mt-3 sm:mt-4 mb-2">
                Letní Taneční Campy {getCampSeasonYear()}
              </h2>
              <p className="text-white/90 text-sm sm:text-base md:text-lg max-w-xl">
                Nezapomenutelné zážitky, noví přátelé a spousta tance pro všechny věkové kategorie.
              </p>
            </div>
          </div>
        </div>

        {/* General Info Section (Dynamic) */}
        {campGeneralInfo && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 sm:p-8 mb-8 sm:mb-12 shadow-sm">
                <div className="flex items-start gap-3 sm:gap-4">
                    <div className="bg-blue-100 p-2.5 sm:p-3 rounded-full text-brand-blue shrink-0">
                        <Info size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <div className="prose prose-sm sm:prose-base prose-blue max-w-none text-gray-700">
                        <ReactMarkdown>{campGeneralInfo}</ReactMarkdown>
                    </div>
                </div>
            </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 mb-12 sm:mb-16">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Proč poslat děti na náš tábor?</h3>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-6">
              Neseďte v létě doma! Připravili jsme pro vaše děti nezapomenutelné zážitky plné pohybu, hudby a nových kamarádů. 
              Naše příměstské i pobytové tábory jsou vhodné pro začátečníky i pokročilé tanečníky.
            </p>
            <ul className="space-y-3 sm:space-y-4">
              {[
                'Profesionální lektoři a animátoři s praxí',
                'Zajištěná strava (svačiny, obědy) a pitný režim',
                'Závěrečná show pro rodiče',
                'Bohatý doprovodný program, hry a soutěže'
              ].map((item, i) => (
                <li key={i} className="flex items-center text-sm sm:text-base text-gray-700 font-medium">
                  <CheckCircle className="w-5 h-5 text-brand-red mr-3 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-brand-blue/5 rounded-2xl p-5 sm:p-8 flex flex-col justify-center border border-brand-blue/10">
             <h4 className="text-lg sm:text-xl font-bold text-brand-blue mb-3 sm:mb-4">Co s sebou?</h4>
             <p className="text-sm sm:text-base text-gray-600 mb-4">
               Pohodlné sportovní oblečení, pevnou obuv na tanec, láhev na pití a hlavně dobrou náladu! 
               Na pobytové tábory zasíláme podrobný seznam věcí emailem.
             </p>
             <button onClick={() => navigate('/kontakt')} className="self-start text-brand-red font-bold hover:text-red-800 transition-colors flex items-center text-sm sm:text-base">
               Máte dotaz? Napište nám
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <Calendar className="w-4 h-4 mr-2 shrink-0" />
                  {formatCampDate(camp.date)}
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">{camp.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">{camp.description}</p>
                
                <div className="mt-auto space-y-2">
                    {camp.details && (
                        <button 
                            onClick={() => openDetails(camp)}
                            className="w-full bg-white text-brand-blue border border-brand-blue py-2.5 rounded-lg font-bold hover:bg-blue-50 transition-all text-sm"
                        >
                            Více info
                        </button>
                    )}
                    <button 
                        onClick={() => handleRegister(camp)}
                        className="w-full bg-gray-50 text-gray-900 border border-gray-200 py-2.5 rounded-lg font-bold hover:bg-brand-blue hover:text-white hover:border-brand-blue transition-all text-sm flex items-center justify-center"
                    >
                        {camp.externalUrl ? <>Registrovat <ExternalLink size={14} className="ml-2 shrink-0" /></> : 'Registrovat dítě'}
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedCamp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={closeDetails}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
                <button 
                    onClick={closeDetails}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 bg-black/40 text-white sm:bg-gray-100 sm:text-gray-700 rounded-full hover:bg-gray-200 hover:text-gray-900 transition-colors z-10"
                >
                    <X size={20} />
                </button>
                
                <div className="relative h-44 sm:h-64">
                    <img src={selectedCamp.image} alt={selectedCamp.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4 sm:p-6">
                        <span className="text-white/80 text-xs sm:text-sm font-bold uppercase tracking-wider mb-1">{formatCampDate(selectedCamp.date)}</span>
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">{selectedCamp.title}</h2>
                    </div>
                </div>

                <div className="p-4 sm:p-6 md:p-8">
                    <div className="prose prose-sm sm:prose-base max-w-none text-gray-700 mb-6 sm:mb-8">
                        <ReactMarkdown>{selectedCamp.details || ''}</ReactMarkdown>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-gray-100">
                        <button 
                            onClick={() => handleRegister(selectedCamp)}
                            className="flex-1 bg-brand-red text-white font-bold py-3 px-6 rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center shadow-lg hover:shadow-red-200 text-sm sm:text-base"
                        >
                            {selectedCamp.externalUrl ? 'Přejít na registraci' : 'Zaregistrovat dítě'}
                            <ExternalLink size={18} className="ml-2 shrink-0" />
                        </button>
                        <button 
                            onClick={closeDetails}
                            className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm sm:text-base"
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