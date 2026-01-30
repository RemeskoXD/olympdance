import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Building2, Facebook, Instagram, Send, CheckCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { CONTACT_INFO } from '../constants';

const Contact: React.FC = () => {
  const { schools } = useData();
  const [selectedTopic, setSelectedTopic] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [searchParams] = useSearchParams();

  // Read the 'skola' query parameter when the component mounts
  useEffect(() => {
    const schoolFromUrl = searchParams.get('skola');
    if (schoolFromUrl) {
      setSelectedTopic(schoolFromUrl);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 800);
  };

  return (
    <section className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-brand-red font-bold tracking-wider uppercase text-sm">Kde nás najdete</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mt-2 mb-4">
            Kontaktujte nás
          </h2>
          <p className="text-gray-600">
            Máte dotaz k přihlášce nebo průběhu kroužků? Jsme tu pro vás.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Contact Form */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            {isSubmitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle size={40} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Zpráva odeslána!</h3>
                <p className="text-gray-600 mb-8 max-w-sm">
                  Děkujeme za vaši zprávu. Ozveme se vám co nejdříve na uvedený email nebo telefon.
                </p>
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Poslat další zprávu
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center">
                  <Send size={20} className="mr-2 text-brand-blue" />
                  Napište nám
                </h3>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Jméno</label>
                      <input required type="text" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all bg-gray-50 focus:bg-white" placeholder="Jan Novák" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                      <input type="tel" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all bg-gray-50 focus:bg-white" placeholder="+420" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                    <input required type="email" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all bg-gray-50 focus:bg-white" placeholder="vas@email.cz" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">O co máte zájem?</label>
                    <select 
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all bg-gray-50 focus:bg-white"
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                    >
                      <option value="">-- Vyberte téma nebo školu --</option>
                      <optgroup label="Obecné">
                        <option value="Obecný dotaz">Obecný dotaz</option>
                        <option value="Letní tábory">Dotaz k táborům</option>
                      </optgroup>
                      <optgroup label="Školy a Kroužky">
                        {schools.sort((a,b) => a.name.localeCompare(b.name)).map(school => (
                          <option key={school.id} value={school.name}>
                            {school.name} ({school.city})
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zpráva <span className="text-red-500">*</span></label>
                    <textarea required rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all bg-gray-50 focus:bg-white resize-none" placeholder="Na co se chcete zeptat?"></textarea>
                  </div>
                  <button type="submit" className="w-full bg-brand-red text-white font-bold py-4 rounded-xl hover:bg-red-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mt-2">
                    Odeslat zprávu
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Contact Info Cards */}
          <div className="space-y-6">
             {/* Main Info */}
             <div className="bg-brand-blue text-white p-8 rounded-2xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-white/10 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-32 h-32 rounded-full bg-brand-red/20 blur-2xl"></div>
                
                <h3 className="text-2xl font-bold mb-8 relative z-10">{CONTACT_INFO.name}</h3>
                
                <div className="space-y-8 relative z-10">
                  <div className="flex items-start group">
                    <div className="p-3 bg-white/10 rounded-lg mr-4 group-hover:bg-white/20 transition-colors">
                       <MapPin className="w-6 h-6 text-brand-lightBlue" />
                    </div>
                    <div>
                      <p className="font-semibold text-blue-200 text-sm uppercase tracking-wide mb-1">Adresa sídla</p>
                      <p className="text-lg leading-snug font-medium">{CONTACT_INFO.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start group">
                    <div className="p-3 bg-white/10 rounded-lg mr-4 group-hover:bg-white/20 transition-colors">
                       <Building2 className="w-6 h-6 text-brand-lightBlue" />
                    </div>
                    <div>
                      <p className="font-semibold text-blue-200 text-sm uppercase tracking-wide mb-1">Fakturační údaje</p>
                      <p className="text-lg font-medium">IČO: {CONTACT_INFO.ico}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center pt-6 border-t border-white/10 gap-4">
                    <a href={`mailto:${CONTACT_INFO.email}`} className="flex items-center hover:text-brand-lightBlue transition-colors group">
                       <Mail className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                       <span className="font-medium">{CONTACT_INFO.email}</span>
                    </a>
                    <a href={`tel:${CONTACT_INFO.phone.replace(/\s/g,'')}`} className="flex items-center hover:text-brand-lightBlue transition-colors group">
                       <Phone className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                       <span className="font-medium">{CONTACT_INFO.phone}</span>
                    </a>
                  </div>
                </div>
             </div>

             {/* Socials */}
             <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 flex flex-col justify-center items-center text-center">
                <h4 className="text-lg font-bold text-gray-900 mb-6">Sledujte nás na sociálních sítích</h4>
                <div className="flex space-x-6">
                  <a href="#" className="flex flex-col items-center group">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-blue-200 group-hover:shadow-lg">
                       <Facebook size={28} />
                    </div>
                    <span className="text-xs font-medium text-gray-500 mt-2 group-hover:text-blue-600">Facebook</span>
                  </a>
                  <a href="#" className="flex flex-col items-center group">
                    <div className="p-4 bg-pink-50 text-pink-600 rounded-2xl group-hover:bg-pink-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-pink-200 group-hover:shadow-lg">
                       <Instagram size={28} />
                    </div>
                    <span className="text-xs font-medium text-gray-500 mt-2 group-hover:text-pink-600">Instagram</span>
                  </a>
                </div>
                <p className="text-sm text-gray-500 mt-6 bg-gray-50 px-4 py-2 rounded-full">
                   📸 Aktuální fotky z tréninků a vystoupení
                </p>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Contact;