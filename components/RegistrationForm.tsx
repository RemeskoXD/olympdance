import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Camp } from '../types';
import { ChevronRight, ChevronLeft, Upload, CheckCircle, CreditCard, User, Mail, Phone, Calendar as CalendarIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { BANK_INFO } from '../constants';

const RegistrationForm: React.FC = () => {
  const { campId } = useParams<{ campId: string }>();
  const navigate = useNavigate();
  const { camps, addRegistration, uploadFile } = useData();
  
  const camp = camps.find(c => c.id === campId);
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    childName: '',
    childBirthDate: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
  });
  const [documents, setDocuments] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<any>(null);

  if (!camp) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Tábor nebyl nalezen</h2>
          <button onClick={() => navigate('/letnicampy')} className="bg-brand-red text-white px-6 py-2 rounded-lg">Zpět na tábory</button>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocuments(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) {
      setStep(step + 1);
    } else {
      setIsUploading(true);
      try {
        // Upload files first
        const uploadedFileUrls = await Promise.all(
          documents.map(async (file) => {
            try {
              return await uploadFile(file);
            } catch (error) {
              console.error('File upload failed:', error);
              return null;
            }
          })
        );

        const validUrls = uploadedFileUrls.filter((url): url is string => url !== null);

        const result = await addRegistration({
          campId: camp.id,
          ...formData,
          documents: validUrls,
        });
        setRegistrationResult(result);
        setStep(3);
      } catch (error) {
        console.error('Registration failed:', error);
        alert('Registrace se nezdařila. Zkuste to prosím znovu.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Generate QR code data (SPAY)
  const amount = parseFloat(camp.price.replace(/\s/g, '').replace('Kč', ''));
  const qrData = `SPD*1.0*ACC:${BANK_INFO.iban}*AM:${amount}*CC:CZK*MSG:${formData.childName} ${formData.childBirthDate}*VS:${camp.variableSymbol || ''}`;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {['Informace', 'Dokumenty', 'Platba'].map((label, i) => (
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
            <h2 className="text-xl sm:text-2xl font-bold">Přihláška na tábor</h2>
            <p className="text-sm sm:text-base text-blue-100">{camp.title}</p>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-8">
            {step === 1 && (
              <div className="space-y-5 sm:space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-sm font-bold text-gray-700 flex items-center">
                      <User size={16} className="mr-2 text-brand-blue shrink-0" /> Jméno a příjmení dítěte
                    </label>
                    <input
                      required
                      type="text"
                      name="childName"
                      value={formData.childName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none text-sm sm:text-base"
                      placeholder="Jan Novák"
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-sm font-bold text-gray-700 flex items-center">
                      <CalendarIcon size={16} className="mr-2 text-brand-blue shrink-0" /> Datum narození dítěte
                    </label>
                    <input
                      required
                      type="date"
                      name="childBirthDate"
                      value={formData.childBirthDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div className="h-px bg-gray-100 my-4 sm:my-6" />

                <div className="space-y-4 sm:space-y-6">
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-sm font-bold text-gray-700 flex items-center">
                      <User size={16} className="mr-2 text-brand-blue shrink-0" /> Jméno zákonného zástupce
                    </label>
                    <input
                      required
                      type="text"
                      name="parentName"
                      value={formData.parentName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none text-sm sm:text-base"
                      placeholder="Petr Novák"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-sm font-bold text-gray-700 flex items-center">
                        <Mail size={16} className="mr-2 text-brand-blue shrink-0" /> Email
                      </label>
                      <input
                        required
                        type="email"
                        name="parentEmail"
                        value={formData.parentEmail}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none text-sm sm:text-base"
                        placeholder="email@priklad.cz"
                      />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-sm font-bold text-gray-700 flex items-center">
                        <Phone size={16} className="mr-2 text-brand-blue shrink-0" /> Telefon
                      </label>
                      <input
                        required
                        type="tel"
                        name="parentPhone"
                        value={formData.parentPhone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none text-sm sm:text-base"
                        placeholder="+420 123 456 789"
                      />
                    </div>
                  </div>

                  <div className="h-px bg-gray-100 my-4 sm:my-6" />

                  <div className="space-y-3 sm:space-y-4">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        required 
                        className="mt-1 w-5 h-5 rounded border-gray-300 text-brand-blue focus:ring-brand-blue shrink-0"
                      />
                      <span className="text-xs sm:text-sm text-gray-600">
                        Souhlasím se zpracováním osobních údajů (GDPR) pro účely organizace tábora.
                      </span>
                    </label>
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        required 
                        className="mt-1 w-5 h-5 rounded border-gray-300 text-brand-blue focus:ring-brand-blue shrink-0"
                      />
                      <span className="text-xs sm:text-sm text-gray-600">
                        Souhlasím s <a href="#" className="text-brand-blue hover:underline">obchodními podmínkami</a> a storno podmínkami.
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-blue-50 p-4 sm:p-6 rounded-xl border border-blue-100">
                  <h3 className="font-bold text-brand-blue mb-2 flex items-center text-base sm:text-lg">
                    <Upload size={18} className="mr-2 shrink-0" /> Nahrání dokumentů
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-4">
                    Zde můžete nahrát potřebné dokumenty (např. potvrzení o bezinfekčnosti, kopii kartičky pojišťovny). 
                    Dokumenty můžete nahrát i později ve svém klientském portálu.
                  </p>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 sm:p-8 text-center hover:border-brand-blue transition-colors cursor-pointer relative bg-white/50">
                    <input 
                      type="file" 
                      multiple 
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="mx-auto text-gray-400 mb-3 sm:mb-4" size={36} />
                    <p className="text-sm sm:text-base text-gray-600 font-medium">Klikněte nebo přetáhněte soubory sem</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (max. 5MB na soubor)</p>
                  </div>

                  {documents.length > 0 && (
                    <div className="mt-6 space-y-2">
                      <p className="text-sm font-bold text-gray-700">Vybrané soubory:</p>
                      {documents.map((file, i) => (
                        <div key={i} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 text-xs sm:text-sm">
                          <span className="truncate pr-2">{file.name}</span>
                          <button 
                            type="button"
                            onClick={() => setDocuments(documents.filter((_, idx) => idx !== i))}
                            className="text-red-500 hover:text-red-700 font-medium shrink-0"
                          >
                            Odstranit
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 3 && registrationResult && (
              <div className="space-y-6 sm:space-y-8 animate-fadeIn">
                <div className="text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <CheckCircle size={28} className="sm:w-8 sm:h-8" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Registrace byla úspěšná!</h3>
                  <p className="text-sm sm:text-base text-gray-600">Nyní prosím proveďte platbu pro dokončení rezervace.</p>
                </div>

                <div className="bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-start text-center sm:text-left">
                    <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-100 shrink-0">
                      <QRCodeSVG value={qrData} size={150} />
                      <p className="text-[10px] text-center mt-2 text-gray-400 font-mono">SPAY QR PLATBA</p>
                    </div>
                    
                    <div className="flex-1 space-y-3 sm:space-y-4 w-full">
                      <h4 className="font-bold text-gray-900 flex items-center justify-center sm:justify-start text-sm sm:text-base">
                        <CreditCard size={18} className="mr-2 text-brand-blue shrink-0" /> Platební údaje
                      </h4>
                      <div className="grid grid-cols-2 gap-y-2 text-xs sm:text-sm text-left">
                        <span className="text-gray-500">Číslo účtu:</span>
                        <span className="font-bold">{BANK_INFO.account}</span>
                        <span className="text-gray-500">Částka:</span>
                        <span className="font-bold text-brand-red">{camp.price}</span>
                        <span className="text-gray-500">Variabilní symbol:</span>
                        <span className="font-bold">{camp.variableSymbol}</span>
                        <span className="text-gray-500">Zpráva pro příjemce:</span>
                        <span className="font-bold break-all">{formData.childName} {formData.childBirthDate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-brand-blue/5 p-4 sm:p-6 rounded-2xl border border-brand-blue/10">
                  <h4 className="font-bold text-brand-blue mb-2 text-sm sm:text-base">Vaše přístupové údaje do portálu</h4>
                  <p className="text-xs sm:text-sm text-gray-600 mb-4">
                    Zde můžete sledovat stav schválení přihlášky a spravovat dokumenty.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <span className="text-gray-400 block text-xs">Email</span>
                      <span className="font-bold text-sm sm:text-base break-all">{formData.parentEmail}</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <span className="text-gray-400 block text-xs">Heslo</span>
                      <span className="font-bold font-mono tracking-wider text-sm sm:text-base">{registrationResult.password}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:gap-4">
                  <button 
                    type="button"
                    onClick={() => navigate('/portal')}
                    className="w-full bg-brand-blue text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg text-sm sm:text-base"
                  >
                    Přejít do klientského portálu
                  </button>
                  <button 
                    type="button"
                    onClick={() => navigate('/letnicampy')}
                    className="w-full bg-white text-gray-600 font-bold py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-sm sm:text-base"
                  >
                    Zpět na přehled táborů
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
                  disabled={isUploading}
                  className={`flex-[2] px-6 py-3 bg-brand-red text-white font-bold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center shadow-lg shadow-red-200 ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isUploading ? 'Odesílám...' : (step === 2 ? 'Dokončit registraci' : 'Pokračovat')} <ChevronRight size={20} className="ml-2" />
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
