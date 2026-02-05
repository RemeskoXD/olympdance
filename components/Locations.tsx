import React, { useState, useMemo, useEffect } from 'react';
import { Search, MapPin, Calendar, Clock, Banknote, X, CheckCircle2, Shirt, Info, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { School } from '../types';

const Locations: React.FC = () => {
  const { schools } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('Všechna města');
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const navigate = useNavigate();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedSchool) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedSchool]);

  // Extract unique cities for filter dropdown
  const cities = useMemo(() => {
    const unique = new Set(schools.map(s => s.city));
    return ['Všechna města', ...Array.from(unique).sort()];
  }, [schools]);

  // Filter logic
  const filteredSchools = useMemo(() => {
    return schools.filter(school => {
      const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            school.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = cityFilter === 'Všechna města' || school.city === cityFilter;
      return matchesSearch && matchesCity;
    });
  }, [searchTerm, cityFilter, schools]);

  const openModal = (school: School) => {
    setSelectedSchool(school);
  };

  const closeModal = () => {
    setSelectedSchool(null);
  };

  const handleRegister = () => {
    if (selectedSchool) {
      navigate(`/kontakt?skola=${encodeURIComponent(selectedSchool.name)}`);
    }
  };

  return (
    <section className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="text-brand-red font-bold tracking-wider uppercase text-sm">Kde tancujeme</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mt-2 mb-4">
            Taneční kroužky na školách
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-10">
            Působíme na mnoha základních a mateřských školách v Olomouci a okolí. 
            Najděte tu nejbližší a přidejte se k nám.
          </p>
        </div>

        {/* Video Embed */}
        <div className="max-w-4xl mx-auto mb-16 rounded-2xl overflow-hidden shadow-2xl bg-black">
          <div className="relative pb-[56.25%] h-0">
            <iframe 
              className="absolute top-0 left-0 w-full h-full"
              src="https://www.youtube.com/embed/wBi25-mTMrc" 
              title="Olymp Dance - Taneční SHOW základních škol 3. ročník" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen
            ></iframe>
          </div>
        </div>

        {/* General Info Section */}
        <div className="mb-16">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <div className="p-8 lg:p-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Sparkles className="text-brand-blue mr-3" />
                  Jak to u nás chodí?
                </h3>
                <div className="space-y-6 text-gray-600 leading-relaxed">
                  <p>
                    Naše lekce jsou zaměřeny na všestranný pohybový rozvoj dětí, vnímání hudby a především na radost z tance.
                    Děti se učí moderní taneční styly (Street Dance, Disco Dance) a připravují choreografie na vystoupení.
                  </p>
                  
                  <div className="space-y-4 mt-6">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 mr-4 flex-shrink-0">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Vyzvedávání z družiny</h4>
                        <p className="text-sm">Pokud kroužek probíhá v době družiny, lektor si děti osobně vyzvedne a po lekci je zase vrátí zpět. Nemusíte se o nic starat.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-brand-blue mr-4 flex-shrink-0">
                        <Shirt size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Co s sebou?</h4>
                        <p className="text-sm">Pohodlné sportovní oblečení (tepláky, legíny, tričko), pevnou čistou obuv (tenisky) a láhev s pitím.</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mr-4 flex-shrink-0">
                        <Info size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">První lekce zdarma</h4>
                        <p className="text-sm">Pro nové členy je první ukázková hodina zdarma. Dítě si může kroužek nezávazně vyzkoušet.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-brand-blue/5 p-8 lg:p-10 border-t lg:border-t-0 lg:border-l border-gray-100 flex flex-col justify-center">
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-4 border-b pb-2">Časté dotazy</h4>
                    <ul className="space-y-3 text-sm text-gray-600">
                       <li className="flex items-start">
                         <span className="text-brand-red mr-2 font-bold">•</span>
                         <span>Kroužek se platí pololetně (do 15.10. a 15.2.).</span>
                       </li>
                       <li className="flex items-start">
                         <span className="text-brand-red mr-2 font-bold">•</span>
                         <span>Lze vystavit potvrzení pro pojišťovnu.</span>
                       </li>
                       <li className="flex items-start">
                         <span className="text-brand-red mr-2 font-bold">•</span>
                         <span>Děti rozdělujeme do skupin dle věku.</span>
                       </li>
                    </ul>
                 </div>
                 <div className="mt-8 text-center">
                    <p className="text-brand-blue font-bold mb-2">Vyberte si školu níže 👇</p>
                    <p className="text-sm text-gray-500">Kliknutím na kartu školy zobrazíte detailní informace.</p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-10 border border-gray-100 sticky top-24 z-30">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Hledat školu (např. Hněvotín, Rožňavská...)"
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition duration-150 ease-in-out"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
               <select 
                 className="block w-full pl-3 pr-10 py-3 border border-gray-200 rounded-xl leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue"
                 value={cityFilter}
                 onChange={(e) => setCityFilter(e.target.value)}
               >
                 {cities.map(city => (
                   <option key={city} value={city}>{city}</option>
                 ))}
               </select>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {filteredSchools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchools.map((school) => (
              <SchoolCard 
                key={school.id} 
                school={school} 
                onSelect={() => openModal(school)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Nenašli jsme žádnou školu</h3>
            <p className="text-gray-500">Zkuste upravit hledání nebo vybrat jiné město.</p>
          </div>
        )}
      </div>

      {/* MODAL WINDOW */}
      {selectedSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={closeModal}
          ></div>

          {/* Modal Content */}
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="bg-brand-blue p-6 md:p-8 text-white relative">
              <button 
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
              >
                <X size={24} />
              </button>
              <h3 className="text-2xl md:text-3xl font-bold font-display pr-10">{selectedSchool.name}</h3>
              <div className="flex items-center mt-2 text-blue-100">
                <MapPin size={18} className="mr-2" />
                {selectedSchool.city}
                {selectedSchool.isKindergarten && (
                  <span className="ml-3 bg-white/20 px-2 py-0.5 rounded text-sm font-bold">Mateřská škola</span>
                )}
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 md:p-8 overflow-y-auto">
              
              {/* Specific Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start">
                   <div className="bg-white p-2 rounded-lg shadow-sm mr-4 text-brand-red">
                      <Calendar size={24} />
                   </div>
                   <div>
                      <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Kdy</p>
                      <p className="font-bold text-gray-900 text-lg">{formatDay(selectedSchool.day)}</p>
                   </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start">
                   <div className="bg-white p-2 rounded-lg shadow-sm mr-4 text-brand-blue">
                      <Clock size={24} />
                   </div>
                   <div>
                      <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Čas</p>
                      <p className="font-bold text-gray-900 text-lg">{selectedSchool.time}</p>
                   </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start md:col-span-2">
                   <div className="bg-white p-2 rounded-lg shadow-sm mr-4 text-green-600">
                      <Banknote size={24} />
                   </div>
                   <div>
                      <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Cena</p>
                      <p className="font-bold text-gray-900 text-lg">{selectedSchool.price}</p>
                   </div>
                </div>
              </div>

              {/* Info Text */}
              <div className="space-y-4 mb-8">
                 <h4 className="font-bold text-gray-900 text-lg border-b pb-2">Informace ke kroužku</h4>
                 
                 <div className="flex gap-3">
                    <CheckCircle2 className="text-brand-blue flex-shrink-0 mt-0.5" size={20} />
                    <p className="text-gray-600 text-sm md:text-base">
                       <strong>Družina:</strong> Pokud vaše dítě navštěvuje školní družinu, náš lektor si ho vyzvedne a po lekci ho zase vrátí zpět.
                    </p>
                 </div>
                 
                 <div className="flex gap-3">
                    <CheckCircle2 className="text-brand-blue flex-shrink-0 mt-0.5" size={20} />
                    <p className="text-gray-600 text-sm md:text-base">
                       <strong>Co s sebou:</strong> Sportovní oblečení, pevnou obuv a pití.
                    </p>
                 </div>

                 <div className="flex gap-3">
                    <CheckCircle2 className="text-brand-blue flex-shrink-0 mt-0.5" size={20} />
                    <p className="text-gray-600 text-sm md:text-base">
                       <strong>První lekce:</strong> Ukázková hodina je pro nové zájemce zdarma.
                    </p>
                 </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleRegister}
                  className="flex-1 bg-brand-red text-white font-bold py-4 rounded-xl hover:bg-red-700 transition-all shadow-lg hover:shadow-red-200 flex items-center justify-center group"
                >
                  Závazně přihlásit
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={closeModal}
                  className="px-6 py-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
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

// Helper for correct Czech grammar in Modal
const formatDay = (day: string) => {
    const d = day.trim().toLowerCase();
    if (d === 'pondělí') return 'Každé pondělí';
    if (d === 'úterý') return 'Každé úterý';
    if (d === 'středa') return 'Každou středu';
    if (d === 'čtvrtek') return 'Každý čtvrtek';
    if (d === 'pátek') return 'Každý pátek';
    return `Každý ${day}`;
};

const SchoolCard: React.FC<{ school: School, onSelect: () => void }> = ({ school, onSelect }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group h-full">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-bold">
            <MapPin size={12} className="mr-1" />
            {school.city}
          </div>
          {school.isKindergarten && (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
              MŠ
            </div>
          )}
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-brand-blue transition-colors line-clamp-2 min-h-[3.5rem]">
          {school.name}
        </h3>

        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-center">
            <Calendar size={16} className="text-brand-red mr-3 flex-shrink-0" />
            <span className="font-medium">{school.day}</span>
          </div>
          <div className="flex items-center">
            <Clock size={16} className="text-brand-red mr-3 flex-shrink-0" />
            <span className="font-medium">{school.time}</span>
          </div>
          <div className="flex items-center">
            <Banknote size={16} className="text-brand-red mr-3 flex-shrink-0" />
            <span className="font-medium">{school.price}</span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-100 mt-auto">
        <button 
          onClick={onSelect}
          className="w-full bg-white border-2 border-brand-blue text-brand-blue py-2 rounded-lg font-bold hover:bg-brand-blue hover:text-white transition-all duration-300 flex items-center justify-center"
        >
          Více informací <ArrowRight size={16} className="ml-2" />
        </button>
      </div>
    </div>
  );
};

export default Locations;