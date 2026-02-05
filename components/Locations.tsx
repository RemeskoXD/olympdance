import React, { useState, useMemo } from 'react';
import { Search, Calendar, Clock, CreditCard, School as SchoolIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { School } from '../types';

const Locations: React.FC = () => {
  const { schools } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('Všechna města');
  const navigate = useNavigate();

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

  const handleSelectSchool = (schoolName: string) => {
    // Navigate to contact page with the school name as a query parameter
    navigate(`/kontakt?skola=${encodeURIComponent(schoolName)}`);
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
            Najděte tu nejbližší a přihlaste se ještě dnes.
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
                onSelect={() => handleSelectSchool(school.name)}
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
    </section>
  );
};

const SchoolCard: React.FC<{ school: School, onSelect: () => void }> = ({ school, onSelect }) => {
  // Helper for correct Czech grammar
  const formatDay = (day: string) => {
    const d = day.trim().toLowerCase();
    
    // Check against full day names to apply correct case
    if (d === 'pondělí') return <span>Každé <strong>pondělí</strong></span>;
    if (d === 'úterý') return <span>Každé <strong>úterý</strong></span>;
    if (d === 'středa') return <span>Každou <strong>středu</strong></span>;
    if (d === 'čtvrtek') return <span>Každý <strong>čtvrtek</strong></span>;
    if (d === 'pátek') return <span>Každý <strong>pátek</strong></span>;
    
    // Fallback for non-standard inputs
    return <span>{day}</span>;
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col group h-full">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-2 rounded-lg ${school.isKindergarten ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-brand-blue'}`}>
            <SchoolIcon size={24} />
          </div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide bg-gray-50 px-2 py-1 rounded">
            {school.city}
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-blue transition-colors">
          {school.name}
        </h3>
        
        <div className="space-y-3 mt-4">
          <div className="flex items-center text-gray-600 text-sm">
            <Calendar className="w-4 h-4 mr-3 text-brand-red" />
            {formatDay(school.day)}
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <Clock className="w-4 h-4 mr-3 text-brand-red" />
            <span>{school.time}</span>
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <CreditCard className="w-4 h-4 mr-3 text-brand-red" />
            <span>{school.price}</span>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <button 
          onClick={onSelect}
          className="w-full py-2 rounded-lg border border-brand-blue text-brand-blue font-semibold hover:bg-brand-blue hover:text-white transition-colors"
        >
          Přihlásit se
        </button>
      </div>
    </div>
  );
};

export default Locations;