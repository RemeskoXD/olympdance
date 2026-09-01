import React, { useState } from 'react';
import { Sparkles, Calendar, Users, Music, CheckCircle, Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import { useData } from '../context/DataContext';

const TanecniExpres: React.FC = () => {
  const { uploadFile } = useData();
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    eventDate: '',
    schoolName: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-12 pb-24">
      {/* Hero Section */}
      <div className="bg-brand-blue text-white py-12 sm:py-16 md:py-20 px-4 mb-10 sm:mb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900 opacity-50"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <span className="bg-white/20 text-white px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold tracking-wider uppercase mb-4 sm:mb-6 inline-block backdrop-blur-sm">
            Novinka
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-display font-bold mb-4 sm:mb-6">
            Taneční Expres
          </h1>
          <p className="text-base sm:text-lg md:text-2xl text-blue-100 max-w-3xl mx-auto mb-6 sm:mb-10">
            Přivezeme radost z pohybu a tance přímo k vám! Objednejte si náš zábavný program pro vaši školu, školku nebo družinu.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
          {/* Info Section */}
          <div className="space-y-6 sm:space-y-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Co je Taneční Expres?</h2>
            <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
              Taneční expres (dříve Roztančená družina) je náš speciální program, se kterým přijedeme přímo za vámi. 
              Přivezeme hudbu, energii a spoustu taneční zábavy. Děti si pod vedením našich zkušených lektorů vyzkouší 
              různé taneční styly, zapojí se do pohybových her a společně si užijí spoustu legrace.
            </p>
            
            <div className="space-y-6 mt-8">
              <div className="flex items-start">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center text-brand-blue mr-4 shrink-0">
                  <Music size={20} className="sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Moderní hudba a tanec</h3>
                  <p className="text-sm sm:text-base text-gray-600">Děti učíme na jejich oblíbené písničky. Zaměřujeme se na Street Dance a moderní styly.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-xl flex items-center justify-center text-brand-red mr-4 shrink-0">
                  <Users size={20} className="sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Pro všechny věkové kategorie</h3>
                  <p className="text-sm sm:text-base text-gray-600">Program přizpůsobíme věku dětí - od mateřských škol až po starší školáky.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mr-4 shrink-0">
                  <Sparkles size={20} className="sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Zábavná forma</h3>
                  <p className="text-sm sm:text-base text-gray-600">Nejde o dril, ale o radost z pohybu. Součástí jsou taneční hry a soutěže.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-brand-blue/5 p-5 sm:p-8 rounded-2xl border border-brand-blue/10 mt-8">
              <h3 className="font-bold text-brand-blue mb-4">Proč si nás objednat?</h3>
              <ul className="space-y-3">
                <li className="flex items-center text-sm sm:text-base text-gray-700">
                  <CheckCircle2 size={18} className="text-brand-blue mr-3 shrink-0" /> Zpestření programu družiny nebo školy
                </li>
                <li className="flex items-center text-sm sm:text-base text-gray-700">
                  <CheckCircle2 size={18} className="text-brand-blue mr-3 shrink-0" /> Profesionální lektoři s praxí
                </li>
                <li className="flex items-center text-sm sm:text-base text-gray-700">
                  <CheckCircle2 size={18} className="text-brand-blue mr-3 shrink-0" /> Veškerou techniku si přivezeme
                </li>
              </ul>
            </div>
          </div>

          {/* Booking Form */}
          <div>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Calendar className="mr-3 text-brand-red shrink-0" />
                Objednávka programu
              </h3>
              
              {submitted ? (
                <div className="text-center py-12 animate-fadeIn">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">Děkujeme za váš zájem!</h4>
                  <p className="text-gray-600 mb-8">
                    Vaše poptávka byla úspěšně odeslána. Brzy se vám ozveme s dalšími detaily.
                  </p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="text-brand-blue font-bold hover:underline"
                  >
                    Odeslat další poptávku
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-sm font-bold text-gray-700">Jméno</label>
                      <input
                        required
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none text-sm sm:text-base"
                        placeholder="Jan"
                      />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-sm font-bold text-gray-700">Příjmení</label>
                      <input
                        required
                        type="text"
                        name="surname"
                        value={formData.surname}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none text-sm sm:text-base"
                        placeholder="Novák"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-sm font-bold text-gray-700">Název školy / instituce</label>
                    <input
                      required
                      type="text"
                      name="schoolName"
                      value={formData.schoolName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none text-sm sm:text-base"
                      placeholder="ZŠ a MŠ Olomouc..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-sm font-bold text-gray-700">Email</label>
                      <input
                        required
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none text-sm sm:text-base"
                        placeholder="email@skola.cz"
                      />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-sm font-bold text-gray-700">Telefon</label>
                      <input
                        required
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none text-sm sm:text-base"
                        placeholder="+420 123 456 789"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Předpokládané datum akce</label>
                    <input
                      required
                      type="date"
                      name="eventDate"
                      value={formData.eventDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Poznámka / doplňující informace</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none resize-none"
                      placeholder="Např. přibližný počet dětí, věková kategorie..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full bg-brand-red text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-red-700 transition-colors ${
                      isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? 'Odesílám...' : 'Odeslat poptávku'}
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-4">
                    Odesláním formuláře souhlasíte se zpracováním osobních údajů pro účely vyřízení poptávky.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TanecniExpres;
