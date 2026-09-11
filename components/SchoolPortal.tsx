import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { SchoolRegistration, School } from '../types';
import { 
  LogIn, User, FileText, CheckCircle, Clock, AlertCircle, LogOut, 
  ChevronRight, Calendar, PenTool, ShieldCheck, Copy, Check, X, 
  Sparkles, Phone, Mail, MapPin, Download, ExternalLink, HelpCircle, 
  ArrowRight, Eye, EyeOff, UserCheck, RefreshCw, Send
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { BANK_INFO } from '../constants';
import { useNavigate } from 'react-router-dom';
import { InsuranceConfirmationModal } from './InsuranceConfirmationModal';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { getFirstTrainingDate, formatCzechDateString } from '../utils/trainingDates';

const SchoolPortal: React.FC = () => {
  const navigate = useNavigate();
  const { schoolRegistrations, schools, updateSchoolRegistration, addExcuse, excuses, attendance } = useData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<SchoolRegistration | null>(null);
  const [userRegistrations, setUserRegistrations] = useState<SchoolRegistration[]>([]);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  // Navigation tabs in parent portal
  const [activePortalTab, setActivePortalTab] = useState<'all' | 'courses' | 'schedule' | 'payment' | 'insurance' | 'excuses' | 'profile'>('all');
  const [selectedChildFilter, setSelectedChildFilter] = useState<string>('all');

  const [excuseDate, setExcuseDate] = useState('');
  const [excuseReason, setExcuseReason] = useState('');
  const [excuseRegistrationId, setExcuseRegistrationId] = useState('');
  const [isSubmittingExcuse, setIsSubmittingExcuse] = useState(false);
  const [excuseMessage, setExcuseMessage] = useState('');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<SchoolRegistration>>({});
  
  const [editingParent, setEditingParent] = useState(false);
  const [parentFormData, setParentFormData] = useState({ parentName: '', parentPhone: '' });
  const [selectedInsuranceReg, setSelectedInsuranceReg] = useState<SchoolRegistration | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [unsubscribingRegId, setUnsubscribingRegId] = useState<string | null>(null);

  const myRegistrations = userRegistrations.length > 0
    ? userRegistrations
    : schoolRegistrations.filter(r => r.parentEmail === currentUser?.parentEmail && r.password === currentUser?.password);

  const filteredRegistrations = selectedChildFilter === 'all'
    ? myRegistrations
    : myRegistrations.filter(r => r.id === selectedChildFilter);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError('');
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    try {
      const res = await fetch('/api/portal/school-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPass })
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.registration) {
          setCurrentUser(data.registration);
          setUserRegistrations(data.registrations || [data.registration]);
          setIsLoggedIn(true);
          setError('');
          setIsLoggingIn(false);
          return;
        }
      } else if (res.status === 401 && contentType.includes('application/json')) {
        const data = await res.json();
        setError(data.error || 'Nesprávný email nebo heslo.');
        setIsLoggingIn(false);
        return;
      }
    } catch {
      // Backend fallback
    }

    const matchedRegs = schoolRegistrations.filter(r => 
      r.parentEmail.trim().toLowerCase() === cleanEmail && r.password === cleanPass
    );
    if (matchedRegs.length > 0) {
      setCurrentUser(matchedRegs[0]);
      setUserRegistrations(matchedRegs);
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Nesprávný email nebo heslo.');
    }
    setIsLoggingIn(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setUserRegistrations([]);
    setEmail('');
    setPassword('');
  };

  const submitExcuse = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetReg = myRegistrations.find(r => r.id === excuseRegistrationId);
    if (!targetReg || !excuseDate || !excuseReason) return;
    
    setIsSubmittingExcuse(true);
    setExcuseMessage('');
    try {
      await addExcuse({
        registrationId: targetReg.id,
        schoolId: targetReg.schoolId,
        date: excuseDate,
        reason: excuseReason
      });
      setExcuseMessage('Omluvenka byla úspěšně odeslána trenérovi.');
      setExcuseDate('');
      setExcuseReason('');
    } catch (err) {
      setExcuseMessage('Došlo k chybě při odesílání omluvenky.');
    } finally {
      setIsSubmittingExcuse(false);
    }
  };

  const startEditing = (reg: SchoolRegistration) => {
    setEditingId(reg.id);
    setEditFormData({
      childBirthDate: reg.childBirthDate,
      childPhone: reg.childPhone || '',
      afterSchoolClub: reg.afterSchoolClub || false
    });
  };

  const saveEdit = async (regId: string) => {
    const reg = myRegistrations.find(r => r.id === regId);
    if (!reg) return;

    const currentHistory = reg.history || [];
    const newHistory = [
      ...currentHistory,
      { 
        date: new Date().toISOString(), 
        message: 'Rodič upravil údaje o dítěti.' 
      }
    ];

    const updated = {
      ...editFormData,
      history: newHistory
    };

    await updateSchoolRegistration(regId, updated);
    setUserRegistrations(prev => prev.map(r => r.id === regId ? { ...r, ...updated } : r));
    if (currentUser?.id === regId) {
      setCurrentUser(prev => prev ? { ...prev, ...updated } : null);
    }
    setEditingId(null);
  };

  const startEditingParent = () => {
    if (currentUser) {
      setParentFormData({
        parentName: currentUser.parentName,
        parentPhone: currentUser.parentPhone
      });
      setEditingParent(true);
    }
  };

  const saveParentEdit = async () => {
    if (!currentUser) return;
    const siblingRegs = myRegistrations;
    
    for (const reg of siblingRegs) {
      const currentHistory = reg.history || [];
      const newHistory = [
        ...currentHistory,
        { 
          date: new Date().toISOString(), 
          message: 'Rodič upravil své kontaktní údaje.' 
        }
      ];
      await updateSchoolRegistration(reg.id, {
        parentName: parentFormData.parentName,
        parentPhone: parentFormData.parentPhone,
        history: newHistory
      });
    }
    
    setUserRegistrations(prev => prev.map(r => ({
      ...r,
      parentName: parentFormData.parentName,
      parentPhone: parentFormData.parentPhone
    })));

    setCurrentUser({
      ...currentUser,
      parentName: parentFormData.parentName,
      parentPhone: parentFormData.parentPhone
    });
    
    setEditingParent(false);
  };

  const unsubscribeChild = async (regId: string) => {
    const reg = myRegistrations.find(r => r.id === regId);
    if (!reg) return;

    const currentHistory = reg.history || [];
    const newHistory = [
      ...currentHistory,
      { 
        date: new Date().toISOString(), 
        message: 'Rodič odhlásil dítě z kroužku.' 
      }
    ];

    await updateSchoolRegistration(regId, {
      status: 'cancelled',
      history: newHistory
    });

    setUserRegistrations(prev => prev.map(r => r.id === regId ? { ...r, status: 'cancelled', history: newHistory } : r));
    setUnsubscribingRegId(null);
  };

  const getStatusBadge = (status: SchoolRegistration['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="bg-green-100 text-green-800 border border-green-200 px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-xs">
            <CheckCircle size={13} className="mr-1.5 text-green-600" />
            Schváleno (Platba zaevidována)
          </span>
        );
      case 'pending_payment':
        return (
          <span className="bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-xs">
            <Clock size={13} className="mr-1.5 text-amber-600" />
            Čeká na úhradu
          </span>
        );
      case 'pending_approval':
        return (
          <span className="bg-blue-100 text-blue-800 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-xs">
            <Clock size={13} className="mr-1.5 text-brand-blue" />
            Čeká na schválení platby
          </span>
        );
      case 'action_required':
        return (
          <span className="bg-red-100 text-red-800 border border-red-200 px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-xs">
            <AlertCircle size={13} className="mr-1.5 text-brand-red" />
            Vyžadována akce
          </span>
        );
      case 'cancelled':
        return (
          <span className="bg-gray-100 text-gray-600 border border-gray-200 px-3 py-1 rounded-full text-xs font-bold flex items-center">
            Odhlášeno
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  // Login view
  if (!isLoggedIn) {
    return (
      <div className="min-h-[85vh] bg-gradient-to-b from-blue-50/40 via-white to-gray-50 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 md:p-10 transition-all">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand-blue/10 text-brand-blue rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
              <LogIn size={28} />
            </div>
            <span className="text-xs uppercase tracking-widest font-bold text-brand-blue">Olymp Dance</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">Portál pro rodiče</h2>
            <p className="text-sm text-gray-500 mt-1.5">
              Správa tanečních kroužků na školách, docházka, platby a omluvenky
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                E-mail z přihlášky
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all text-sm sm:text-base font-medium"
                  placeholder="např. rodic@seznam.cz"
                  required
                  autoComplete="email"
                />
                <Mail size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Heslo
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs text-brand-blue font-bold hover:underline"
                >
                  Zapomněli jste heslo?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-11 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all text-sm sm:text-base font-medium"
                  placeholder="Zadejte heslo"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  tabIndex={-1}
                  title={showPassword ? "Skrýt heslo" : "Zobrazit heslo"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-semibold rounded-xl flex items-center">
                <AlertCircle size={16} className="mr-2 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-brand-blue hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center text-sm sm:text-base min-h-[48px] disabled:opacity-75 cursor-pointer"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw size={18} className="mr-2 animate-spin" />
                  Přihlašuji...
                </>
              ) : (
                <>
                  Přihlásit se do portálu
                  <ArrowRight size={18} className="ml-2" />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-gray-100 text-center space-y-3">
            <p className="text-xs text-gray-500">
              Přístupové heslo vám bylo zasláno na e-mail při odeslání přihlášky dítěte do kroužku.
            </p>
            <p className="text-xs sm:text-sm text-gray-600">
              Nemáte ještě přihlášené dítě?{' '}
              <button 
                type="button" 
                onClick={() => navigate('/tanecnikrouzky')} 
                className="text-brand-red font-bold hover:underline"
              >
                Vyberte školu a přihlaste se
              </button>
            </p>
          </div>

          <ForgotPasswordModal
            isOpen={showForgotPassword}
            onClose={() => setShowForgotPassword(false)}
            initialEmail={email}
            onPasswordResetSuccess={(resetEmail) => {
              setEmail(resetEmail);
              setError('');
            }}
          />
        </div>
      </div>
    );
  }

  // Calculate totals
  const totalKids = myRegistrations.length;
  const pendingPaymentCount = myRegistrations.filter(r => r.status === 'pending_payment').length;

  return (
    <div className="min-h-screen bg-gray-50/70 py-6 sm:py-10 px-3 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0 shadow-2xs font-extrabold text-lg">
                {currentUser?.parentName ? currentUser.parentName.charAt(0) : 'R'}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 text-brand-blue border border-blue-100">
                    Rodičovský účet
                  </span>
                  {pendingPaymentCount > 0 && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                      Čeká na platbu: {pendingPaymentCount}
                    </span>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-950 mt-1">
                  Vítejte, {currentUser?.parentName}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  {currentUser?.parentEmail} &bull; {currentUser?.parentPhone || 'Telefon nezadán'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-center">
              <button
                onClick={startEditingParent}
                className="px-3 py-2 text-xs sm:text-sm font-bold text-gray-700 hover:text-brand-blue bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-xl transition-all flex items-center cursor-pointer min-h-[40px]"
                title="Upravit kontaktní údaje rodiče"
              >
                <PenTool size={15} className="mr-1.5" />
                Upravit profil
              </button>
              <button 
                onClick={handleLogout}
                className="px-3.5 py-2 text-xs sm:text-sm font-bold text-brand-red hover:bg-red-50 border border-red-200 rounded-xl transition-all flex items-center cursor-pointer min-h-[40px]"
                title="Odhlásit se z portálu"
              >
                <LogOut size={16} className="mr-1.5" />
                Odhlásit se
              </button>
            </div>
          </div>

          {/* Quick Subnav / Filter Pills (Responsive scrolling bar) */}
          <div className="mt-6 pt-5 border-t border-gray-100 flex items-center gap-2 overflow-x-auto pb-1 text-xs sm:text-sm no-scrollbar">
            <button
              onClick={() => setActivePortalTab('all')}
              className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                activePortalTab === 'all'
                  ? 'bg-brand-blue text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Všechny informace
            </button>
            <button
              onClick={() => setActivePortalTab('courses')}
              className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                activePortalTab === 'courses'
                  ? 'bg-brand-blue text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Moje kroužky ({myRegistrations.length})
            </button>
            <button
              onClick={() => setActivePortalTab('schedule')}
              className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                activePortalTab === 'schedule'
                  ? 'bg-brand-blue text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Termíny lekcí & Docházka
            </button>
            <button
              onClick={() => setActivePortalTab('payment')}
              className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                activePortalTab === 'payment'
                  ? 'bg-brand-blue text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Platba & QR kód
            </button>
            <button
              onClick={() => setActivePortalTab('insurance')}
              className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                activePortalTab === 'insurance'
                  ? 'bg-brand-blue text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Potvrzení pro pojišťovnu
            </button>
            <button
              onClick={() => setActivePortalTab('excuses')}
              className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                activePortalTab === 'excuses'
                  ? 'bg-brand-blue text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Omluvit trénink
            </button>
          </div>

          {/* Sibling switcher if more than 1 child */}
          {totalKids > 1 && (
            <div className="mt-3.5 p-2 bg-blue-50/60 border border-blue-100 rounded-2xl flex flex-wrap items-center gap-2 text-xs">
              <span className="text-gray-500 font-semibold px-2">Zobrazit dítě:</span>
              <button
                onClick={() => setSelectedChildFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedChildFilter === 'all'
                    ? 'bg-brand-blue text-white shadow-2xs'
                    : 'bg-white text-gray-700 hover:bg-blue-100'
                }`}
              >
                Všechny ({totalKids})
              </button>
              {myRegistrations.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedChildFilter(r.id)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    selectedChildFilter === r.id
                      ? 'bg-brand-blue text-white shadow-2xs'
                      : 'bg-white text-gray-700 hover:bg-blue-100'
                  }`}
                >
                  {r.childName}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modal / Form for editing Parent profile */}
        {editingParent && (
          <div className="bg-white rounded-3xl shadow-md border-2 border-brand-blue/30 p-5 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center">
              <User size={18} className="mr-2 text-brand-blue" />
              Úprava kontaktních údajů rodiče
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Celé jméno a příjmení</label>
                <input 
                  type="text"
                  value={parentFormData.parentName || ''}
                  onChange={e => setParentFormData({...parentFormData, parentName: e.target.value})}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Telefonní číslo</label>
                <input 
                  type="tel"
                  value={parentFormData.parentPhone || ''}
                  onChange={e => setParentFormData({...parentFormData, parentPhone: e.target.value})}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none text-sm font-medium"
                />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              E-mail <span className="font-medium text-gray-600">{currentUser?.parentEmail}</span> slouží jako přihlašovací login a nelze jej změnit.
            </p>
            <div className="flex justify-end gap-2.5 mt-4 pt-3 border-t border-gray-100">
              <button 
                onClick={() => setEditingParent(false)} 
                className="px-4 py-2 text-xs sm:text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                Zrušit
              </button>
              <button 
                onClick={saveParentEdit} 
                className="px-5 py-2 text-xs sm:text-sm bg-brand-blue hover:bg-blue-700 text-white rounded-xl transition-colors font-bold shadow-xs cursor-pointer"
              >
                Uložit změny
              </button>
            </div>
          </div>
        )}

        {/* Main Registrations List */}
        <div className="space-y-6">
          {filteredRegistrations.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-gray-100">
              <User size={36} className="mx-auto text-gray-300 mb-2" />
              <h3 className="text-base font-bold text-gray-800">Žádná přihláška nebyla nalezena</h3>
              <p className="text-xs text-gray-500 mt-1">
                Zvolte zobrazení všech dětí nebo se přihlaste na novou školu.
              </p>
            </div>
          ) : (
            filteredRegistrations.map((reg) => {
              const regSchool = schools.find(s => s.id === reg.schoolId);
              const isEditing = editingId === reg.id;
              const firstTraining = getFirstTrainingDate(regSchool);
              const regVs = (reg.variableSymbol || (reg.childRodneCislo ? reg.childRodneCislo.replace(/\D/g, '').slice(0, 10) : '') || `261${reg.id.replace(/\D/g, '').slice(-6)}`).replace(/\D/g, '').slice(0, 10);
              const cleanAmount = parseFloat(regSchool?.price.replace(/\s/g, '').replace('Kč', '') || '0');
              const qrValue = `SPD*1.0*ACC:${BANK_INFO.iban}*AM:${cleanAmount}*CC:CZK*X-VS:${regVs}*MSG:${reg.childName} ${reg.childSurname || ''}`;

              return (
                <div 
                  key={reg.id} 
                  className="bg-white rounded-3xl shadow-sm border border-gray-150 overflow-hidden transition-all hover:shadow-md"
                >
                  {/* Card Header */}
                  <div className="p-5 sm:p-7 border-b border-gray-100 bg-gradient-to-r from-gray-50/80 to-white">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-bold">
                            <MapPin size={11} className="mr-1" />
                            {regSchool?.city || 'Škola'}
                          </span>
                          {regSchool?.isKindergarten ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
                              MŠ (Mateřská škola)
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                              ZŠ (Základní škola)
                            </span>
                          )}
                          {getStatusBadge(reg.status)}
                        </div>

                        <h3 className="text-xl sm:text-2xl font-extrabold text-gray-950">
                          {regSchool?.name || 'Taneční kroužek'}
                        </h3>
                        <p className="text-xs sm:text-sm font-medium text-gray-500 mt-1 flex items-center">
                          <Calendar size={14} className="mr-1.5 text-brand-red shrink-0" />
                          Každé {regSchool?.day} &bull; {regSchool?.time} &bull; {regSchool?.price}
                        </p>
                      </div>

                      {/* Right actions */}
                      <div className="flex items-center gap-2 self-start sm:self-center">
                        {reg.status !== 'cancelled' && !isEditing && (
                          <button 
                            onClick={() => startEditing(reg)} 
                            className="px-3 py-1.5 text-xs font-bold text-gray-700 hover:text-brand-blue bg-white border border-gray-200 hover:border-brand-blue rounded-xl transition-all flex items-center cursor-pointer shadow-2xs"
                            title="Upravit údaje dítěte"
                          >
                            <PenTool size={13} className="mr-1.5" />
                            Upravit údaje
                          </button>
                        )}
                      </div>
                    </div>

                    {/* PROMINENT FIRST TRAINING DATE BANNER */}
                    {(activePortalTab === 'all' || activePortalTab === 'courses' || activePortalTab === 'schedule') && (
                      <div className={`mt-4 p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                        firstTraining.isSet
                          ? 'bg-blue-50/90 border-blue-200 text-brand-blue shadow-xs'
                          : 'bg-amber-50/90 border-amber-200 text-amber-900 shadow-xs'
                      }`}>
                        <div className="flex items-start sm:items-center space-x-3.5">
                          <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 ${
                            firstTraining.isSet ? 'bg-brand-blue text-white shadow-xs' : 'bg-amber-500 text-white shadow-xs'
                          }`}>
                            <Sparkles size={20} className="sm:w-5 sm:h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-500 block">
                              Zahájení kroužku v pololetí
                            </span>
                            <div className="flex flex-wrap items-baseline gap-1.5">
                              <span className="text-sm sm:text-base font-extrabold text-gray-950">
                                První trénink:
                              </span>
                              <span className={`text-base sm:text-lg font-extrabold ${
                                firstTraining.isSet ? 'text-brand-blue' : 'text-amber-800 italic'
                              }`}>
                                {firstTraining.formatted}
                              </span>
                            </div>
                            {firstTraining.withWeekday ? (
                              <p className="text-xs text-gray-600 mt-0.5 font-medium">
                                {firstTraining.withWeekday} &bull; v čase {regSchool?.time}
                              </p>
                            ) : (
                              <p className="text-xs text-amber-700 mt-0.5">
                                Přesné datum 1. lekce trenér brzy upřesní a zobrazí se zde.
                              </p>
                            )}
                          </div>
                        </div>

                        {firstTraining.isSet && (
                          <div className="flex items-center gap-2 self-start sm:self-auto bg-white px-3 py-1.5 rounded-xl border border-blue-100 shadow-2xs text-xs font-bold text-gray-800">
                            <Clock size={13} className="text-brand-blue" />
                            {regSchool?.day} {regSchool?.time}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-5 sm:p-7 space-y-6">
                    
                    {/* Editing Form */}
                    {isEditing ? (
                      <div className="bg-blue-50/40 p-5 rounded-2xl border border-blue-100 space-y-4">
                        <h4 className="text-sm font-bold text-gray-900">Úprava údajů dítěte: {reg.childName}</h4>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Datum narození</label>
                            <input 
                              type="date"
                              value={editFormData.childBirthDate || ''}
                              onChange={e => setEditFormData({...editFormData, childBirthDate: e.target.value})}
                              className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none text-sm bg-white font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Telefon na dítě (volitelné)</label>
                            <input 
                              type="tel"
                              value={editFormData.childPhone || ''}
                              onChange={e => setEditFormData({...editFormData, childPhone: e.target.value})}
                              className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none text-sm bg-white font-medium"
                              placeholder="+420..."
                            />
                          </div>
                        </div>

                        <div className="flex items-center pt-1">
                          <input 
                            type="checkbox"
                            id={`edit-druzina-${reg.id}`}
                            checked={!!editFormData.afterSchoolClub}
                            onChange={e => setEditFormData({...editFormData, afterSchoolClub: e.target.checked})}
                            className="w-4 h-4 text-brand-blue rounded border-gray-300 focus:ring-brand-blue cursor-pointer"
                          />
                          <label htmlFor={`edit-druzina-${reg.id}`} className="ml-2.5 text-sm font-medium text-gray-800 cursor-pointer">
                            Vyzvednout dítě ze školní družiny na trénink
                          </label>
                        </div>

                        <div className="flex flex-wrap justify-between items-center gap-3 pt-3 border-t border-gray-200">
                          {unsubscribingRegId === reg.id ? (
                            <div className="flex items-center gap-2 bg-red-50 p-2 rounded-xl border border-red-200">
                              <span className="text-xs text-red-700 font-bold">Opravdu odhlásit?</span>
                              <button
                                type="button"
                                onClick={() => unsubscribeChild(reg.id)}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                              >
                                Ano, odhlásit
                              </button>
                              <button
                                type="button"
                                onClick={() => setUnsubscribingRegId(null)}
                                className="px-2.5 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                              >
                                Zrušit
                              </button>
                            </div>
                          ) : (
                            <button 
                              type="button" 
                              onClick={() => setUnsubscribingRegId(reg.id)} 
                              className="text-xs text-brand-red font-bold hover:underline cursor-pointer py-1"
                            >
                              Odhlásit dítě z kroužku
                            </button>
                          )}

                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => setEditingId(null)} 
                              className="px-3.5 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                            >
                              Zrušit
                            </button>
                            <button 
                              onClick={() => saveEdit(reg.id)} 
                              className="px-4 py-1.5 text-xs bg-brand-blue hover:bg-blue-700 text-white rounded-xl transition-colors font-bold shadow-xs cursor-pointer"
                            >
                              Uložit změny
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Child Details Summary Bar */
                      (activePortalTab === 'all' || activePortalTab === 'courses' || activePortalTab === 'profile') && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100">
                            <span className="text-gray-400 font-semibold block text-[10px] uppercase">Dítě</span>
                            <span className="font-bold text-gray-900 text-sm mt-0.5 block truncate">
                              {reg.childName} {reg.childSurname || ''}
                            </span>
                          </div>
                          <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100">
                            <span className="text-gray-400 font-semibold block text-[10px] uppercase">Datum narození</span>
                            <span className="font-bold text-gray-900 text-sm mt-0.5 block">
                              {reg.childBirthDate ? formatCzechDateString(reg.childBirthDate) : 'Nezadáno'}
                            </span>
                          </div>
                          <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100">
                            <span className="text-gray-400 font-semibold block text-[10px] uppercase">Vyzvednutí z družiny</span>
                            <span className={`font-bold text-sm mt-0.5 block ${reg.afterSchoolClub ? 'text-brand-blue' : 'text-gray-700'}`}>
                              {reg.afterSchoolClub ? '✓ Ano' : 'Ne'}
                            </span>
                          </div>
                          <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100">
                            <span className="text-gray-400 font-semibold block text-[10px] uppercase">Telefon dítěte</span>
                            <span className="font-bold text-gray-900 text-sm mt-0.5 block truncate">
                              {reg.childPhone || '—'}
                            </span>
                          </div>
                        </div>
                      )
                    )}

                    {/* Admin Note if present */}
                    {reg.adminNote && !isEditing && (
                      <div className="bg-red-50 p-4 rounded-2xl border border-red-200">
                        <h5 className="text-red-800 font-bold text-xs sm:text-sm mb-1 flex items-center">
                          <AlertCircle size={15} className="mr-1.5 shrink-0" />
                          Důležitá zpráva od vedení tanečního klubu:
                        </h5>
                        <p className="text-red-700 text-xs sm:text-sm">{reg.adminNote}</p>
                      </div>
                    )}

                    {/* INSURANCE CONFIRMATION (POTVRZENÍ PRO POJIŠŤOVNU) */}
                    {(activePortalTab === 'all' || activePortalTab === 'insurance' || activePortalTab === 'courses') && reg.status !== 'cancelled' && (
                      reg.status === 'approved' ? (
                        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/60 to-blue-50/50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
                          <div className="flex items-start space-x-3.5">
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                              <ShieldCheck size={22} />
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="font-extrabold text-gray-900 text-sm sm:text-base">
                                  Potvrzení pro zdravotní pojišťovnu / FKSP
                                </h4>
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                                  Platba zaevidována
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 mt-1 max-w-xl">
                                Oficiální potvrzení o přijetí platby s razítkem a podpisem 1:1. Pojišťovny (VZP, ČPZP, OZP, ZP MV ČR) proplácejí 500 až 2 000 Kč na pohybové aktivity.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                            <button
                              type="button"
                              onClick={() => setSelectedInsuranceReg(reg)}
                              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center cursor-pointer min-h-[42px]"
                              title="Náhled a stažení PDF potvrzení pro pojišťovnu"
                            >
                              <FileText size={16} className="mr-2 shrink-0" />
                              Náhled / Stáhnout
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start space-x-3 text-xs">
                          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                            <ShieldCheck size={17} />
                          </div>
                          <div>
                            <h5 className="font-bold text-amber-900 text-xs sm:text-sm">
                              Potvrzení pro pojišťovnu / FKSP
                            </h5>
                            <p className="text-amber-800 mt-0.5">
                              Oficiální potvrzení s razítkem bude připraveno ke stažení v PDF ihned po připsání a spárování platby.
                            </p>
                          </div>
                        </div>
                      )
                    )}

                    {/* PAYMENT & QR SECTION */}
                    {(activePortalTab === 'all' || activePortalTab === 'payment') && reg.status === 'pending_payment' && !isEditing && (
                      <div className="p-5 sm:p-6 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/50 rounded-2xl border-2 border-brand-blue/30 shadow-xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 pb-3">
                          <div>
                            <h4 className="font-extrabold text-brand-blue text-base sm:text-lg flex items-center">
                              Platební údaje & QR platba (Pololetí)
                            </h4>
                            <p className="text-xs text-gray-600 mt-0.5">
                              Plaťte prosím převodem nebo načtením QR kódu v mobilním bankovnictví.
                            </p>
                          </div>
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 self-start sm:self-auto">
                            Částka: {regSchool?.price}
                          </span>
                        </div>

                        <div className="flex flex-col md:flex-row gap-6 items-center">
                          {/* QR Code Container */}
                          <div className="bg-white p-4 rounded-2xl shadow-sm border border-blue-100 flex flex-col items-center shrink-0">
                            <QRCodeSVG 
                              value={qrValue} 
                              size={140} 
                            />
                            <span className="text-[10px] text-brand-blue font-bold uppercase tracking-wider mt-2.5 flex items-center">
                              <Sparkles size={11} className="mr-1" /> Naskenujte v bance
                            </span>
                          </div>

                          {/* Bank details grid with copy buttons */}
                          <div className="flex-1 w-full space-y-2.5 text-xs sm:text-sm">
                            {/* Variable symbol - Highlighted */}
                            <div className="flex items-center justify-between p-3 bg-white rounded-xl border-2 border-blue-300 shadow-2xs">
                              <div>
                                <span className="text-[11px] text-brand-blue block font-extrabold uppercase tracking-wider">
                                  Variabilní symbol (důležité pro spárování)
                                </span>
                                <span className="font-mono text-base sm:text-lg font-extrabold text-gray-950 tracking-wider">
                                  {regVs}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(regVs, `vs-${reg.id}`)}
                                className="text-xs font-bold text-white bg-brand-blue hover:bg-blue-700 px-3 py-2 rounded-lg transition-all flex items-center shadow-xs cursor-pointer min-h-[36px]"
                                title="Kopírovat variabilní symbol"
                              >
                                {copiedField === `vs-${reg.id}` ? <Check size={14} className="text-white mr-1.5" /> : <Copy size={14} className="mr-1.5" />}
                                {copiedField === `vs-${reg.id}` ? 'Zkopírováno' : 'Kopírovat VS'}
                              </button>
                            </div>

                            {/* Bank account */}
                            <div className="flex items-center justify-between p-2.5 sm:p-3 bg-white rounded-xl border border-gray-200">
                              <div>
                                <span className="text-[10px] text-gray-400 block uppercase font-bold">
                                  Číslo účtu ({BANK_INFO.bankName})
                                </span>
                                <span className="font-mono font-bold text-gray-900 text-xs sm:text-sm">
                                  {BANK_INFO.account}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(BANK_INFO.account, `acc-${reg.id}`)}
                                className="text-xs font-bold text-brand-blue hover:text-blue-700 p-1.5 rounded-lg hover:bg-blue-50 transition-colors flex items-center cursor-pointer"
                              >
                                {copiedField === `acc-${reg.id}` ? <Check size={14} className="text-green-600 mr-1" /> : <Copy size={14} className="mr-1" />}
                                {copiedField === `acc-${reg.id}` ? 'Zkopírováno' : 'Kopírovat'}
                              </button>
                            </div>

                            {/* IBAN */}
                            <div className="flex items-center justify-between p-2.5 sm:p-3 bg-white rounded-xl border border-gray-200">
                              <div>
                                <span className="text-[10px] text-gray-400 block uppercase font-bold">IBAN</span>
                                <span className="font-mono text-xs font-bold text-gray-800 truncate block max-w-[200px] sm:max-w-none">
                                  {BANK_INFO.ibanFormatted || BANK_INFO.iban}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(BANK_INFO.iban, `iban-${reg.id}`)}
                                className="text-xs font-bold text-brand-blue hover:text-blue-700 p-1.5 rounded-lg hover:bg-blue-50 transition-colors flex items-center cursor-pointer"
                              >
                                {copiedField === `iban-${reg.id}` ? <Check size={14} className="text-green-600 mr-1" /> : <Copy size={14} className="mr-1" />}
                                {copiedField === `iban-${reg.id}` ? 'Zkopírováno' : 'Kopírovat'}
                              </button>
                            </div>

                            {/* Message */}
                            <div className="p-2.5 sm:p-3 bg-white rounded-xl border border-gray-200">
                              <span className="text-[10px] text-gray-400 block uppercase font-bold">Zpráva pro příjemce</span>
                              <span className="font-bold text-gray-900 text-xs sm:text-sm">
                                {reg.childName} {reg.childSurname || ''} ({reg.childBirthDate})
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2">
                          <button 
                            onClick={() => updateSchoolRegistration(reg.id, { status: 'pending_approval' })}
                            className="w-full bg-brand-blue hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center cursor-pointer text-sm sm:text-base min-h-[44px]"
                          >
                            <CheckCircle size={17} className="mr-2" />
                            Mám odeslanou platbu – nahlásit ke kontrole
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 14 LESSONS SCHEDULE & ATTENDANCE */}
                    {(activePortalTab === 'all' || activePortalTab === 'schedule' || activePortalTab === 'courses') && !isEditing && (
                      <div className="p-5 sm:p-6 bg-gray-50/70 rounded-2xl border border-gray-200/80 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-200">
                          <div>
                            <h4 className="font-extrabold text-gray-900 text-base flex items-center">
                              <Calendar size={18} className="mr-2 text-brand-blue" />
                              Rozvrh tréninků & docházka (14 lekcí)
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Lekce probíhají každé {regSchool?.day} v čase {regSchool?.time}.
                            </p>
                          </div>
                          {regSchool?.trainingDates && regSchool.trainingDates.filter(Boolean).length > 0 && (
                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-brand-blue border border-blue-200 self-start sm:self-auto">
                              {regSchool.trainingDates.filter(Boolean).length} / 14 lekcí vypsáno
                            </span>
                          )}
                        </div>

                        {/* Lessons Grid */}
                        {regSchool?.trainingDates && regSchool.trainingDates.filter(Boolean).length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                            {regSchool.trainingDates.map((dateStr, idx) => {
                              if (!dateStr) {
                                return (
                                  <div 
                                    key={idx} 
                                    className="p-3 rounded-xl border border-dashed border-gray-200 bg-white/60 flex items-center justify-between text-gray-400"
                                  >
                                    <span className="font-bold">{idx + 1}. lekce</span>
                                    <span className="italic">Termín se připravuje</span>
                                  </div>
                                );
                              }

                              const isFirst = idx === 0;
                              const attRecord = attendance.find(a => a.schoolId === reg.schoolId && a.date === dateStr);
                              const isRecorded = attRecord && attRecord.records[reg.id] !== undefined;
                              const isPresent = isRecorded ? attRecord.records[reg.id] : null;
                              const excuse = excuses.find(e => e.registrationId === reg.id && e.date === dateStr);

                              const todayStr = new Date().toISOString().split('T')[0];
                              const isToday = dateStr === todayStr;
                              const isFuture = dateStr > todayStr;

                              const dateObj = new Date(dateStr + 'T12:00:00');
                              const formattedDate = dateObj.toLocaleDateString('cs-CZ', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'numeric'
                              });

                              return (
                                <div 
                                  key={idx} 
                                  className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                                    isFirst 
                                      ? 'bg-blue-50/90 border-blue-300 ring-1 ring-blue-200' 
                                      : isToday 
                                        ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-300' 
                                        : isRecorded 
                                          ? (isPresent ? 'bg-green-50/70 border-green-200' : 'bg-red-50/70 border-red-200')
                                          : excuse 
                                            ? 'bg-amber-50/70 border-amber-200'
                                            : 'bg-white border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <div className="flex items-center space-x-2.5 min-w-0">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-xs shrink-0 ${
                                      isFirst ? 'bg-brand-blue text-white' : isToday ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                      {idx + 1}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <p className="font-extrabold text-gray-950 truncate capitalize">
                                          {formattedDate}
                                        </p>
                                        {isFirst && (
                                          <span className="text-[10px] bg-brand-blue text-white font-bold px-1.5 py-0.2 rounded">
                                            Start
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[11px] text-gray-500">
                                        {regSchool.time || 'Čas kroužku'}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0 ml-2">
                                    {isRecorded ? (
                                      isPresent ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-800 border border-green-200">
                                          <Check size={12} className="mr-1" /> Přítomen
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">
                                          <X size={12} className="mr-1" /> Nepřítomen
                                        </span>
                                      )
                                    ) : excuse ? (
                                      <span 
                                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200"
                                        title={excuse.reason ? `Omluveno: ${excuse.reason}` : 'Omluveno'}
                                      >
                                        ✉ Omluveno
                                      </span>
                                    ) : isToday ? (
                                      <div className="flex items-center gap-1">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                                          Dnes
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setActivePortalTab('excuses');
                                            setExcuseRegistrationId(reg.id);
                                            setExcuseDate(dateStr);
                                            const excuseEl = document.getElementById('excuse-form');
                                            if (excuseEl) excuseEl.scrollIntoView({ behavior: 'smooth' });
                                          }}
                                          className="text-[11px] text-brand-blue hover:underline font-bold ml-1 cursor-pointer"
                                        >
                                          Omluvit
                                        </button>
                                      </div>
                                    ) : isFuture ? (
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setActivePortalTab('excuses');
                                            setExcuseRegistrationId(reg.id);
                                            setExcuseDate(dateStr);
                                            const excuseEl = document.getElementById('excuse-form');
                                            if (excuseEl) excuseEl.scrollIntoView({ behavior: 'smooth' });
                                          }}
                                          className="text-[11px] text-brand-blue hover:text-blue-800 bg-blue-50/80 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-md font-bold cursor-pointer transition-colors"
                                          title="Omluvit dítě z tohoto tréninku předem"
                                        >
                                          Omluvit
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="text-[10px] text-gray-400 font-medium">
                                        Proběhlo
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-6 px-4 bg-white rounded-xl border border-dashed border-gray-200">
                            <Calendar size={28} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-xs sm:text-sm font-bold text-gray-700">Termíny lekcí se připravují</p>
                            <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
                              Lektor termíny pro školu {regSchool?.name} brzy upřesní a naleznete zde kompletní rozpis 14 lekcí.
                            </p>
                          </div>
                        )}

                        {/* Excuses history & Attendance metrics */}
                        <div className="grid sm:grid-cols-2 gap-4 pt-2">
                          <div className="bg-white p-4 rounded-2xl border border-gray-200 text-xs">
                            <h5 className="font-bold text-gray-900 mb-2 flex items-center">
                              <PenTool size={14} className="mr-1.5 text-brand-blue" />
                              Odeslané omluvenky
                            </h5>
                            {excuses.filter(e => e.registrationId === reg.id).length > 0 ? (
                              <ul className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                {excuses.filter(e => e.registrationId === reg.id).map(excuse => (
                                  <li key={excuse.id} className="bg-gray-50 p-2 rounded-lg border border-gray-100 flex items-center justify-between">
                                    <div>
                                      <span className="font-bold text-gray-800 block">
                                        {formatCzechDateString(excuse.date)}
                                      </span>
                                      <span className="text-gray-500 italic text-[11px]">
                                        {excuse.reason || 'Bez udání důvodu'}
                                      </span>
                                    </div>
                                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                                      Omluveno
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-gray-400 italic text-xs py-1">Zatím nebyly zaslány žádné omluvenky.</p>
                            )}
                          </div>

                          <div className="bg-white p-4 rounded-2xl border border-gray-200 text-xs space-y-1.5">
                            <h5 className="font-bold text-gray-900 mb-2 flex items-center">
                              <CheckCircle size={14} className="mr-1.5 text-green-600" />
                              Souhrn docházky
                            </h5>
                            <div className="flex justify-between items-center text-gray-600">
                              <span>Zaznamenáno trenérem:</span>
                              <strong className="text-gray-900">
                                {attendance.filter(a => a.schoolId === reg.schoolId && a.records[reg.id] !== undefined).length} lekcí
                              </strong>
                            </div>
                            <div className="flex justify-between items-center text-green-700">
                              <span>Přítomen na tréninku:</span>
                              <strong>
                                {attendance.filter(a => a.schoolId === reg.schoolId && a.records[reg.id] === true).length}×
                              </strong>
                            </div>
                            <div className="flex justify-between items-center text-red-600">
                              <span>Nepřítomen:</span>
                              <strong>
                                {attendance.filter(a => a.schoolId === reg.schoolId && a.records[reg.id] === false).length}×
                              </strong>
                            </div>
                            <div className="flex justify-between items-center text-amber-700 pt-1 border-t border-gray-100">
                              <span>Omluvené tréninky:</span>
                              <strong>
                                {excuses.filter(e => e.registrationId === reg.id).length}×
                              </strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* EXCUSE SUBMISSION FORM */}
        {(activePortalTab === 'all' || activePortalTab === 'excuses') && (
          <div id="excuse-form" className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-8">
            <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
                <Send size={18} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-gray-950">
                  Omluvit dítě z tréninku
                </h3>
                <p className="text-xs text-gray-500">
                  Omluvenka se ihned přenese trenérovi do docházkového listu.
                </p>
              </div>
            </div>

            <form onSubmit={submitExcuse} className="space-y-4">
              {excuseMessage && (
                <div className={`p-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center ${
                  excuseMessage.includes('chybě') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
                }`}>
                  <CheckCircle size={16} className="mr-2 shrink-0" />
                  <span>{excuseMessage}</span>
                </div>
              )}

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Vyberte dítě
                  </label>
                  <select 
                    required
                    value={excuseRegistrationId}
                    onChange={e => setExcuseRegistrationId(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none bg-white text-xs sm:text-sm font-medium"
                  >
                    <option value="" disabled>Vyberte dítě a kroužek...</option>
                    {schoolRegistrations
                      .filter(r => r.parentEmail === currentUser?.parentEmail && r.password === currentUser?.password && r.status !== 'cancelled')
                      .map(r => (
                      <option key={r.id} value={r.id}>
                        {r.childName} ({schools.find(s => s.id === r.schoolId)?.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Datum tréninku
                  </label>
                  <input 
                    type="date" 
                    required
                    value={excuseDate}
                    onChange={e => setExcuseDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none text-xs sm:text-sm font-medium bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Důvod absence (volitelné)
                  </label>
                  <input 
                    type="text" 
                    value={excuseReason}
                    onChange={e => setExcuseReason(e.target.value)}
                    placeholder="Např. Nemoc, rodinné důvody..."
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none text-xs sm:text-sm font-medium bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  type="submit" 
                  disabled={isSubmittingExcuse}
                  className="bg-brand-blue hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-xs flex items-center text-xs sm:text-sm min-h-[42px] cursor-pointer disabled:opacity-75"
                >
                  <Send size={14} className="mr-2" />
                  {isSubmittingExcuse ? 'Odesílám...' : 'Odeslat omluvenku trenérovi'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Support & Contacts Footer Box */}
        <div className="bg-gradient-to-r from-brand-blue to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md">
              Potřebujete poradit?
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold mt-1.5">
              Jsme tu pro vás kdykoliv
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
              V případě dotazů k tréninkům, platbě nebo potvrzení pro pojišťovnu nás můžete kontaktovat.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto shrink-0">
            <button 
              onClick={() => navigate('/kontakt')}
              className="bg-white hover:bg-blue-50 text-brand-blue font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center w-full sm:w-auto min-h-[40px] cursor-pointer"
            >
              Napsat nám zprávu
              <ArrowRight size={15} className="ml-1.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Insurance Confirmation Modal */}
      {selectedInsuranceReg && (
        <InsuranceConfirmationModal
          data={{
            id: selectedInsuranceReg.id,
            childName: selectedInsuranceReg.childName,
            childBirthDate: selectedInsuranceReg.childBirthDate,
            parentName: selectedInsuranceReg.parentName,
            parentPhone: selectedInsuranceReg.parentPhone,
            parentEmail: selectedInsuranceReg.parentEmail,
            activityTitle: `Taneční kroužek: ${schools.find(s => s.id === selectedInsuranceReg.schoolId)?.name || 'Kroužek'}`,
            activityType: 'krouzek',
            location: `${schools.find(s => s.id === selectedInsuranceReg.schoolId)?.name}, ${schools.find(s => s.id === selectedInsuranceReg.schoolId)?.city}`,
            periodOrDate: 'Školní rok 2025/2026 (Pololetí)',
            price: schools.find(s => s.id === selectedInsuranceReg.schoolId)?.price || '1 800 Kč',
            variableSymbol: selectedInsuranceReg.variableSymbol,
            password: selectedInsuranceReg.password,
            paymentStatus: selectedInsuranceReg.status
          }}
          onClose={() => setSelectedInsuranceReg(null)}
        />
      )}
    </div>
  );
};

export default SchoolPortal;
