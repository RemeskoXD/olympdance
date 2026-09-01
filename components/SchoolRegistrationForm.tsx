import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ChevronRight, ChevronLeft, CheckCircle, CreditCard, User, Mail, Phone, Calendar as CalendarIcon, MapPin, Plus, Trash2, School as SchoolIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { BANK_INFO } from '../constants';

const SchoolRegistrationForm: React.FC = () => {
  const { schoolId } = useParams<{ schoolId: string }>();
  const navigate = useNavigate();
  const { schools, addSchoolRegistration } = useData();
  
  const initialSchool = schools.find(c => c.id === schoolId);
  
  const [step, setStep] = useState(1);
  const [parentData, setParentData] = useState({
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    parentAddress: '',
  });
  
  const [children, setChildren] = useState([
    { id: 1, childName: '', childSurname: '', childRodneCislo: '', childClass: '', childPhone: '', afterSchoolClub: false, schoolId: schoolId || '' }
  ]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<any>(null);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    let amount = 0;
    children.forEach(child => {
      const school = schools.find(s => s.id === child.schoolId);
      if (school) {
        amount += parseFloat(school.price.replace(/\s/g, '').replace('Kč', '')) || 0;
      }
    });
    setTotalAmount(amount);
  }, [children, schools]);

  if (!initialSchool && !schoolId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Kroužek nebyl nalezen</h2>
          <button onClick={() => navigate('/tanecnikrouzky')} className="bg-brand-red text-white px-6 py-2 rounded-lg">Zpět na kroužky</button>
        </div>
      </div>
    );
  }

  const handleParentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParentData(prev => ({ ...prev, [name]: value }));
  };

  const handleChildChange = (id: number, field: string, value: string | boolean) => {
    setChildren(prev => prev.map(child => child.id === id ? { ...child, [field]: value } : child));
  };

  const addChild = () => {
    if (children.length < 5) {
      setChildren([...children, { id: Date.now(), childName: '', childSurname: '', childRodneCislo: '', childClass: '', childPhone: '', afterSchoolClub: false, schoolId: initialSchool?.id || '' }]);
    }
  };

  const removeChild = (id: number) => {
    if (children.length > 1) {
      setChildren(children.filter(c => c.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) {
      setStep(step + 1);
    } else {
      setIsSubmitting(true);
      try {
        const sharedPassword = Math.random().toString(36).slice(-8);
        
        // Register all children
        for (const child of children) {
          await addSchoolRegistration({
            schoolId: child.schoolId,
            parentName: parentData.parentName,
            parentEmail: parentData.parentEmail,
            parentPhone: parentData.parentPhone,
            parentAddress: parentData.parentAddress,
            childName: child.childName,
            childSurname: child.childSurname,
            childRodneCislo: child.childRodneCislo,
            childClass: child.childClass,
            childPhone: child.childPhone,
            afterSchoolClub: child.afterSchoolClub,
            password: sharedPassword,
            history: [{ date: new Date().toISOString(), message: 'Přihláška vytvořena' }]
          });
        }
        
        setRegistrationResult({ password: sharedPassword, childrenCount: children.length });
        setStep(3);
      } catch (error) {
        console.error('Registration failed:', error);
        alert('Registrace se nezdařila. Zkuste to prosím znovu.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Generate QR code data (SPAY)
  const qrData = `SPD*1.0*ACC:${BANK_INFO.iban}*AM:${totalAmount}*CC:CZK*MSG:${parentData.parentName} krouzky`;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {['Informace', 'Souhlas', 'Platba'].map((label, i) => (
              <div key={i} className={`flex flex-col items-center ${step > i ? 'text-brand-blue' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 font-bold ${step > i ? 'bg-brand-blue text-white' : 'bg-gray-200'}`}>
                  {i + 1}
                </div>
                <span className="text-xs font-medium">{label}</span>
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand-blue transition-all duration-500" 
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-brand-blue p-5 sm:p-6 text-white">
            <h2 className="text-xl sm:text-2xl font-bold">Přihláška do kroužků</h2>
            <p className="text-sm sm:text-base text-blue-100">Registrace dětí do tanečních kroužků</p>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-8">
            {step === 1 && (
              <div className="space-y-6 sm:space-y-8 animate-fadeIn">
                {/* Parent Data */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 border-b pb-2 mb-4">Údaje zákonného zástupce</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-sm font-bold text-gray-700 flex items-center">
                        <User size={16} className="mr-2 text-brand-blue shrink-0" /> Celé jméno (rodiče)
                      </label>
                      <input
                        required
                        type="text"
                        name="parentName"
                        value={parentData.parentName}
                        onChange={handleParentChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none text-sm sm:text-base"
                        placeholder="Petr Novák"
                      />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-sm font-bold text-gray-700 flex items-center">
                        <MapPin size={16} className="mr-2 text-brand-blue shrink-0" /> Adresa bydliště dítěte
                      </label>
                      <input
                        required
                        type="text"
                        name="parentAddress"
                        value={parentData.parentAddress}
                        onChange={handleParentChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none text-sm sm:text-base"
                        placeholder="Ulice, Město, PSČ"
                      />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-sm font-bold text-gray-700 flex items-center">
                        <Mail size={16} className="mr-2 text-brand-blue shrink-0" /> E-mail (rodiče)
                      </label>
                      <input
                        required
                        type="email"
                        name="parentEmail"
                        value={parentData.parentEmail}
                        onChange={handleParentChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none text-sm sm:text-base"
                        placeholder="email@priklad.cz"
                      />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-sm font-bold text-gray-700 flex items-center">
                        <Phone size={16} className="mr-2 text-brand-blue shrink-0" /> Telefonní číslo (rodiče)
                      </label>
                      <input
                        required
                        type="tel"
                        name="parentPhone"
                        value={parentData.parentPhone}
                        onChange={handleParentChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none text-sm sm:text-base"
                        placeholder="+420 123 456 789"
                      />
                    </div>
                  </div>
                </div>

                {/* Children Data */}
                <div>
                  <div className="flex justify-between items-center border-b pb-2 mb-4">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">Přihlášené děti (max 5)</h3>
                    {children.length < 5 && (
                      <button 
                        type="button" 
                        onClick={addChild}
                        className="text-brand-blue font-bold text-sm flex items-center hover:text-blue-700"
                      >
                        <Plus size={16} className="mr-1 shrink-0" /> Přidat dítě
                      </button>
                    )}
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {children.map((child, index) => (
                      <div key={child.id} className="bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-100 relative">
                        {children.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => removeChild(child.id)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors p-1"
                            title="Odebrat dítě"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                        <h4 className="font-bold text-gray-700 mb-3 sm:mb-4">Dítě {index + 1}</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                          <div className="space-y-1.5 sm:space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center">
                              <User size={14} className="mr-1 text-brand-blue shrink-0" /> Křestní jméno dítěte
                            </label>
                            <input
                              required
                              type="text"
                              value={child.childName}
                              onChange={(e) => handleChildChange(child.id, 'childName', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none text-sm sm:text-base"
                              placeholder="Jan"
                            />
                          </div>
                          <div className="space-y-1.5 sm:space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center">
                              <User size={14} className="mr-1 text-brand-blue shrink-0" /> Příjmení dítěte
                            </label>
                            <input
                              required
                              type="text"
                              value={child.childSurname}
                              onChange={(e) => handleChildChange(child.id, 'childSurname', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none text-sm sm:text-base"
                              placeholder="Novák"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                          <div className="space-y-1.5 sm:space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center">
                              <User size={14} className="mr-1 text-brand-blue shrink-0" /> Rodné číslo (bez lomítka)
                            </label>
                            <input
                              required
                              type="text"
                              maxLength={10}
                              pattern="\d{10}"
                              title="Rodné číslo musí obsahovat přesně 10 číslic bez mezer a lomítek."
                              value={child.childRodneCislo}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                handleChildChange(child.id, 'childRodneCislo', val);
                              }}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none text-sm sm:text-base"
                              placeholder="1234567890"
                            />
                          </div>
                          <div className="space-y-1.5 sm:space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center">
                              <SchoolIcon size={14} className="mr-1 text-brand-blue shrink-0" /> Třída
                            </label>
                            <input
                              required
                              type="text"
                              value={child.childClass}
                              onChange={(e) => handleChildChange(child.id, 'childClass', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none text-sm sm:text-base"
                              placeholder="např. 3.A"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div className="space-y-1.5 sm:space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center">
                              <Phone size={14} className="mr-1 text-brand-blue shrink-0" /> Telefonní číslo (nepovinné)
                            </label>
                            <input
                              type="tel"
                              value={child.childPhone}
                              onChange={(e) => handleChildChange(child.id, 'childPhone', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none text-sm sm:text-base"
                              placeholder="+420 123 456 789"
                            />
                          </div>
                          <div className="space-y-1.5 sm:space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center">
                              <SchoolIcon size={14} className="mr-1 text-brand-blue shrink-0" /> Výběr kroužku
                            </label>
                            <select
                              required
                              value={child.schoolId}
                              onChange={(e) => handleChildChange(child.id, 'schoolId', e.target.value)}
                              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none bg-white text-sm sm:text-base"
                            >
                              <option value="" disabled>Vyberte kroužek...</option>
                              {schools.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.day} {s.time}) - {s.price}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center">
                          <input
                            type="checkbox"
                            id={`druzina-${child.id}`}
                            checked={child.afterSchoolClub || false}
                            onChange={(e) => handleChildChange(child.id, 'afterSchoolClub', e.target.checked)}
                            className="w-4 h-4 text-brand-blue rounded border-gray-300 focus:ring-brand-blue"
                          />
                          <label htmlFor={`druzina-${child.id}`} className="ml-2 text-sm text-gray-700">
                            Vyzvednout dítě z družiny
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                  <h3 className="font-bold text-brand-blue mb-4 flex items-center">
                    <CheckCircle size={18} className="mr-2" /> Souhlas s podmínkami
                  </h3>
                  <div className="space-y-4">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        required 
                        className="mt-1 w-5 h-5 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                      />
                      <span className="text-sm text-gray-600">
                        Souhlasím se zpracováním osobních údajů (GDPR) pro účely organizace kroužku.
                      </span>
                    </label>
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        required 
                        className="mt-1 w-5 h-5 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                      />
                      <span className="text-sm text-gray-600">
                        Souhlasím s <a href="#" className="text-brand-blue hover:underline">obchodními podmínkami</a> a řádem tanečního klubu.
                      </span>
                    </label>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mt-4">
                      <p className="text-sm text-yellow-800">
                        <strong>Upozornění:</strong> V případě, že kurzovné nebude zaplaceno ve správném termínu, bude pololetní cena kurzovného navýšena o 200 Kč.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && registrationResult && (
              <div className="space-y-8 animate-fadeIn">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Přihláška byla úspěšně odeslána!</h3>
                  <p className="text-gray-600">Zaregistrováno dětí: {registrationResult.childrenCount}</p>
                </div>

                <div className="space-y-4">
                  {children.map((child) => {
                    const childSchool = schools.find(s => s.id === child.schoolId);
                    const amount = childSchool ? parseFloat(childSchool.price.replace(/\s/g, '').replace('Kč', '')) || 0 : 0;
                    const childQrData = `SPD*1.0*ACC:${BANK_INFO.iban}*AM:${amount}*CC:CZK*MSG:${child.childName} ${child.childSurname} ${child.childRodneCislo}`;

                    return (
                      <div key={child.id} className="bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200">
                        <h4 className="font-bold text-gray-700 mb-4 border-b pb-2 text-sm sm:text-base">Platba pro: {child.childName} {child.childSurname}</h4>
                        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-start text-center sm:text-left">
                          <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-100 shrink-0">
                            <QRCodeSVG value={childQrData} size={140} />
                            <p className="text-[10px] text-center mt-2 text-gray-400 font-mono">SPAY QR PLATBA</p>
                          </div>
                          
                          <div className="flex-1 space-y-3 sm:space-y-4 w-full">
                            <h4 className="font-bold text-gray-900 flex items-center justify-center sm:justify-start text-sm sm:text-base">
                              <CreditCard size={18} className="mr-2 text-brand-blue shrink-0" /> Platební údaje (za 1. pololetí)
                            </h4>
                            <div className="grid grid-cols-2 gap-y-2 text-xs sm:text-sm text-left">
                              <span className="text-gray-500">Číslo účtu:</span>
                              <span className="font-bold">{BANK_INFO.account}</span>
                              <span className="text-gray-500">Částka:</span>
                              <span className="font-bold text-brand-red">{amount} Kč</span>
                              <span className="text-gray-500">Zpráva pro příjemce:</span>
                              <span className="font-bold break-all">{child.childName} {child.childSurname} {child.childRodneCislo}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-brand-blue/5 p-4 sm:p-6 rounded-2xl border border-brand-blue/10">
                  <h4 className="font-bold text-brand-blue mb-2 text-sm sm:text-base">Vaše přístupové údaje do portálu</h4>
                  <p className="text-xs sm:text-sm text-gray-600 mb-4">
                    Tyto údaje slouží pro přihlášení do klientského portálu, kde můžete spravovat všechny přihlášené děti, stahovat faktury a psát omluvenky.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <span className="text-gray-400 block text-xs">Email (Váš login)</span>
                      <span className="font-bold text-sm sm:text-base break-all">{parentData.parentEmail}</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <span className="text-gray-400 block text-xs">Heslo</span>
                      <span className="font-bold font-mono tracking-wider text-sm sm:text-base">{registrationResult.password}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <button 
                    type="button"
                    onClick={() => navigate('/portal-krouzky')}
                    className="w-full bg-brand-blue text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
                  >
                    Přejít do klientského portálu
                  </button>
                  <button 
                    type="button"
                    onClick={() => navigate('/tanecnikrouzky')}
                    className="w-full bg-white text-gray-600 font-bold py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    Zpět na přehled škol
                  </button>
                </div>
              </div>
            )}

            {step < 3 && (
              <div className="flex gap-4 mt-12">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center"
                  >
                    <ChevronLeft size={20} className="mr-2" /> Zpět
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-[2] px-6 py-3 bg-brand-red text-white font-bold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center shadow-lg shadow-red-200 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? 'Odesílám...' : (step === 2 ? 'Dokončit přihlášení' : 'Pokračovat')} <ChevronRight size={20} className="ml-2" />
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SchoolRegistrationForm;
