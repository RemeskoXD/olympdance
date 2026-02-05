import React from 'react';
import { Calendar, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

const Camps: React.FC = () => {
  const navigate = useNavigate();
  const { camps } = useData();

  const handleRegister = (campTitle: string) => {
    navigate(`/kontakt?skola=${encodeURIComponent(campTitle)}`);
  };

  return (
    <section className="py-12 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Section - Increased height and object position */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl mb-16">
          <img 
            src="https://static.wixstatic.com/media/93005c_573dc43953b84fde95242482a4c20b9c~mv2.jpg/v1/fill/w_1901,h_362,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/93005c_573dc43953b84fde95242482a4c20b9c~mv2.jpg" 
            alt="Letní tábory" 
            className="w-full h-[300px] md:h-[450px] object-cover object-top"
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
                
                <button 
                  onClick={() => handleRegister(camp.title)}
                  className="w-full mt-auto bg-gray-50 text-gray-900 border border-gray-200 py-2 rounded-lg font-bold hover:bg-brand-blue hover:text-white hover:border-brand-blue transition-all text-sm"
                >
                  Přihlásit se
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Camps;