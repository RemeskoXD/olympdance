import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Building2, Facebook, Instagram, Send, CheckCircle, CreditCard, Copy, Check, Compass } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { CONTACT_INFO, BANK_INFO } from '../constants';

const Contact: React.FC = () => {
  const { schools } = useData();
  const [selectedTopic, setSelectedTopic] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Read the 'skola' query parameter when the component mounts
  useEffect(() => {
    const schoolFromUrl = searchParams.get('skola');
    if (schoolFromUrl) {
      setSelectedTopic(schoolFromUrl);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          topic: selectedTopic || 'Obecný dotaz',
          message: formData.message,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Odeslání zprávy se nezdařilo. Zkuste to prosím znovu.');
      }

      setIsSubmitted(true);
      setFormData({ name: '', phone: '', email: '', message: '' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Contact form submission error:', err);
      setSubmitError(err.message || 'Nepodařilo se odeslat zprávu. Zkontrolujte připojení.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-8 sm:py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-16">
          <span className="text-brand-red font-bold tracking-wider uppercase text-xs sm:text-sm">Kde nás najdete</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-gray-900 mt-2 mb-3 sm:mb-4">
            Kontaktujte nás
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
            Máte dotaz k přihlášce nebo průběhu kroužků? Jsme tu pro vás.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12">
          
          {/* Contact Form */}
          <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-lg border border-gray-100">
            {isSubmitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-8 sm:py-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                  <CheckCircle size={36} className="sm:w-10 sm:h-10" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Zpráva odeslána!</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-sm">
                  Děkujeme za vaši zprávu. Ozveme se vám co nejdříve na uvedený email nebo telefon.
                </p>
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base"
                >
                  Poslat další zprávu
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-gray-900 flex items-center">
                  <Send size={18} className="mr-2 text-brand-blue shrink-0 sm:w-5 sm:h-5" />
                  Napište nám
                </h3>

                {submitError && (
                  <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl">
                    {submitError}
                  </div>
                )}

                <form className="space-y-3.5 sm:space-y-4" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Jméno</label>
                      <input 
                        required 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all bg-gray-50 focus:bg-white text-sm sm:text-base" 
                        placeholder="Jan Novák" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Telefon</label>
                      <input 
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all bg-gray-50 focus:bg-white text-sm sm:text-base" 
                        placeholder="+420" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                    <input 
                      required 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all bg-gray-50 focus:bg-white text-sm sm:text-base" 
                      placeholder="vas@email.cz" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">O co máte zájem?</label>
                    <select 
                      className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all bg-gray-50 focus:bg-white text-sm sm:text-base"
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
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Zpráva <span className="text-red-500">*</span></label>
                    <textarea 
                      required 
                      rows={4} 
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all bg-gray-50 focus:bg-white resize-none text-sm sm:text-base" 
                      placeholder="Na co se chcete zeptat?"
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-brand-red text-white font-bold py-3 sm:py-4 rounded-xl hover:bg-red-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mt-2 text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <span>Odesílám zprávu...</span>
                    ) : (
                      <>
                        <Send size={18} />
                        <span>Odeslat zprávu</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Contact Info Cards */}
          <div className="space-y-6">
             {/* Main Info */}
             <div className="bg-brand-blue text-white p-5 sm:p-8 rounded-2xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-white/10 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-32 h-32 rounded-full bg-brand-red/20 blur-2xl"></div>
                
                <h3 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 relative z-10">{CONTACT_INFO.name}</h3>
                
                <div className="space-y-6 sm:space-y-8 relative z-10">
                  {/* Sídlo */}
                  <div className="flex items-start group">
                    <div className="p-2.5 sm:p-3 bg-white/10 rounded-lg mr-3 sm:mr-4 group-hover:bg-white/20 transition-colors shrink-0">
                       <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-brand-lightBlue" />
                    </div>
                    <div>
                      <p className="font-semibold text-blue-200 text-xs sm:text-sm uppercase tracking-wide mb-1">Adresa sídla</p>
                      <p className="text-base sm:text-lg leading-snug font-medium">{CONTACT_INFO.registeredOffice}</p>
                    </div>
                  </div>

                  {/* Kde nás najdete */}
                  <div className="flex items-start group">
                    <div className="p-2.5 sm:p-3 bg-white/10 rounded-lg mr-3 sm:mr-4 group-hover:bg-white/20 transition-colors shrink-0">
                       <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-brand-lightBlue" />
                    </div>
                    <div>
                      <p className="font-semibold text-blue-200 text-xs sm:text-sm uppercase tracking-wide mb-1">Kde nás najdete (Tréninkové centrum)</p>
                      <p className="text-base sm:text-lg leading-snug font-medium">{CONTACT_INFO.trainingLocation}</p>
                    </div>
                  </div>

                  {/* Fakturační údaje & IČO */}
                  <div className="flex items-start group">
                    <div className="p-2.5 sm:p-3 bg-white/10 rounded-lg mr-3 sm:mr-4 group-hover:bg-white/20 transition-colors shrink-0">
                       <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-brand-lightBlue" />
                    </div>
                    <div className="w-full">
                      <p className="font-semibold text-blue-200 text-xs sm:text-sm uppercase tracking-wide mb-1.5">Fakturační a identifikační údaje</p>
                      <div className="bg-white/10 p-3.5 rounded-xl backdrop-blur-xs space-y-1 text-xs sm:text-sm">
                        <p><span className="text-blue-200">Organizace:</span> <strong className="font-semibold text-white ml-1">{CONTACT_INFO.name}</strong></p>
                        <p><span className="text-blue-200">Sídlo:</span> <span className="text-white ml-1">{CONTACT_INFO.registeredOffice}</span></p>
                        <p><span className="text-blue-200">IČO:</span> <strong className="font-mono text-white font-semibold ml-1">{CONTACT_INFO.ico}</strong></p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start group">
                    <div className="p-2.5 sm:p-3 bg-white/10 rounded-lg mr-3 sm:mr-4 group-hover:bg-white/20 transition-colors shrink-0">
                       <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-brand-lightBlue" />
                    </div>
                    <div className="w-full">
                      <p className="font-semibold text-blue-200 text-xs sm:text-sm uppercase tracking-wide mb-1">Bankovní spojení ({BANK_INFO.bankName})</p>
                      <div className="space-y-1 text-sm sm:text-base">
                        <div className="flex items-center justify-between">
                          <span>Číslo účtu: <strong className="font-mono">{BANK_INFO.account}</strong></span>
                          <button 
                            onClick={() => copyToClipboard(BANK_INFO.account, 'contact-acc')}
                            className="text-xs bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded ml-2 transition-colors inline-flex items-center"
                            title="Kopírovat číslo účtu"
                          >
                            {copiedField === 'contact-acc' ? <Check size={12} className="mr-1 text-green-300" /> : <Copy size={12} className="mr-1" />}
                            {copiedField === 'contact-acc' ? 'Zkopírováno' : 'Kopírovat'}
                          </button>
                        </div>
                        <div className="flex items-center justify-between text-xs sm:text-sm text-blue-100">
                          <span>IBAN: <strong className="font-mono">{BANK_INFO.ibanFormatted || BANK_INFO.iban}</strong></span>
                          <button 
                            onClick={() => copyToClipboard(BANK_INFO.iban, 'contact-iban')}
                            className="text-xs bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded ml-2 transition-colors inline-flex items-center"
                            title="Kopírovat IBAN"
                          >
                            {copiedField === 'contact-iban' ? <Check size={12} className="mr-1 text-green-300" /> : <Copy size={12} className="mr-1" />}
                            {copiedField === 'contact-iban' ? 'Zkopírováno' : 'Kopírovat'}
                          </button>
                        </div>
                        <p className="text-xs sm:text-sm text-blue-200">
                          BIC / SWIFT: <strong className="font-mono">{BANK_INFO.bic}</strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center pt-4 sm:pt-6 border-t border-white/10 gap-3 sm:gap-4">
                    <a href={`mailto:${CONTACT_INFO.email}`} className="flex items-center hover:text-brand-lightBlue transition-colors group text-sm sm:text-base">
                       <Mail className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform shrink-0" />
                       <span className="font-medium break-all">{CONTACT_INFO.email}</span>
                    </a>
                    <a href={`tel:${CONTACT_INFO.phone.replace(/\s/g,'')}`} className="flex items-center hover:text-brand-lightBlue transition-colors group text-sm sm:text-base">
                       <Phone className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform shrink-0" />
                       <span className="font-medium">{CONTACT_INFO.phone}</span>
                    </a>
                  </div>
                </div>
             </div>

             {/* Socials */}
             <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-md border border-gray-100 flex flex-col justify-center items-center text-center">
                <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6">Sledujte nás na sociálních sítích</h4>
                <div className="flex space-x-6">
                  <a href="#" className="flex flex-col items-center group">
                    <div className="p-3 sm:p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-blue-200 group-hover:shadow-lg">
                       <Facebook size={24} className="sm:w-7 sm:h-7" />
                    </div>
                    <span className="text-xs font-medium text-gray-500 mt-2 group-hover:text-blue-600">Facebook</span>
                  </a>
                  <a href="#" className="flex flex-col items-center group">
                    <div className="p-3 sm:p-4 bg-pink-50 text-pink-600 rounded-2xl group-hover:bg-pink-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-pink-200 group-hover:shadow-lg">
                       <Instagram size={24} className="sm:w-7 sm:h-7" />
                    </div>
                    <span className="text-xs font-medium text-gray-500 mt-2 group-hover:text-pink-600">Instagram</span>
                  </a>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-4 sm:mt-6 bg-gray-50 px-4 py-2 rounded-full">
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