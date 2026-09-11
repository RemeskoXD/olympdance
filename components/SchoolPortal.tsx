import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { SchoolRegistration, School } from '../types';
import { LogIn, User, FileText, CheckCircle, Clock, AlertCircle, LogOut, ChevronRight, Calendar, PenTool, ShieldCheck, Copy, Check, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { BANK_INFO } from '../constants';
import { useNavigate } from 'react-router-dom';
import { InsuranceConfirmationModal } from './InsuranceConfirmationModal';
import { ForgotPasswordModal } from './ForgotPasswordModal';

const SchoolPortal: React.FC = () => {
  const navigate = useNavigate();
  const { schoolRegistrations, schools, updateSchoolRegistration, addExcuse, excuses, attendance } = useData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<SchoolRegistration | null>(null);
  const [userRegistrations, setUserRegistrations] = useState<SchoolRegistration[]>([]);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
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
      // Backend not reachable, fallback to local school registrations
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
      setExcuseMessage('Omluvenka byla úspěšně odeslána.');
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
        return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center"><CheckCircle size={12} className="mr-1" /> Schváleno</span>;
      case 'pending_payment':
        return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold flex items-center"><Clock size={12} className="mr-1" /> Čeká na platbu</span>;
      case 'pending_approval':
        return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center"><Clock size={12} className="mr-1" /> Čeká na schválení</span>;
      case 'action_required':
        return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center"><AlertCircle size={12} className="mr-1" /> Vyžadována akce</span>;
      case 'cancelled':
        return <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold flex items-center">Odhlášeno</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand-blue/10 text-brand-blue rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Portál Kroužky</h2>
            <p className="text-gray-500">Přihlaste se pro správu tanečních kroužků</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none"
                placeholder="email@priklad.cz"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Heslo</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none"
                placeholder="********"
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

            <button
              type="submit"
              className="w-full bg-brand-blue text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
            >
              Přihlásit se
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-gray-100 text-center space-y-2">
            <p className="text-sm text-gray-500">
              Zapomněli jste heslo?{' '}
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-brand-blue font-bold hover:underline"
              >
                Obnovit heslo
              </button>
            </p>
            <p className="text-sm text-gray-500">
              Nemáte ještě účet? <button type="button" onClick={() => navigate('/tanecnikrouzky')} className="text-brand-red font-bold hover:underline">Přihlaste se do kroužku</button>
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

  const school = schools.find(s => s.id === currentUser?.schoolId);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Vítejte, {currentUser?.parentName}</h2>
            <p className="text-gray-500">Správa vašich tanečních aktivit</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center text-gray-600 font-bold hover:text-brand-red transition-colors"
          >
            <LogOut size={20} className="mr-2" /> Odhlásit se
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="font-bold text-gray-900 flex items-center">
                  <User size={18} className="mr-2 text-brand-blue" /> Profil
                </h3>
                {!editingParent && (
                  <button onClick={startEditingParent} className="text-brand-blue hover:text-blue-700" title="Upravit profil">
                    <PenTool size={16} />
                  </button>
                )}
              </div>
              
              {editingParent ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Jméno</label>
                    <input 
                      type="text"
                      value={parentFormData.parentName || ''}
                      onChange={e => setParentFormData({...parentFormData, parentName: e.target.value})}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-brand-blue outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Telefon</label>
                    <input 
                      type="tel"
                      value={parentFormData.parentPhone || ''}
                      onChange={e => setParentFormData({...parentFormData, parentPhone: e.target.value})}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-brand-blue outline-none text-sm"
                    />
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs">Email</span>
                    <span className="font-medium text-sm text-gray-500">{currentUser?.parentEmail} (nelze změnit)</span>
                  </div>
                  <div className="flex space-x-2 pt-2 border-t border-gray-100">
                    <button onClick={() => setEditingParent(false)} className="flex-1 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded transition-colors">
                      Zrušit
                    </button>
                    <button onClick={saveParentEdit} className="flex-1 px-3 py-1.5 text-sm bg-brand-blue text-white rounded hover:bg-blue-700 transition-colors font-bold">
                      Uložit
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="text-gray-400 block text-xs">Jméno</span>
                    <span className="font-medium">{currentUser?.parentName}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs">Email</span>
                    <span className="font-medium">{currentUser?.parentEmail}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs">Telefon</span>
                    <span className="font-medium">{currentUser?.parentPhone}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-brand-blue p-6 rounded-2xl shadow-lg text-white">
              <h3 className="font-bold mb-2">Potřebujete pomoc?</h3>
              <p className="text-sm text-blue-100 mb-4">
                Pokud máte jakékoli dotazy k vaší přihlášce, neváhejte nás kontaktovat.
              </p>
              <button 
                onClick={() => navigate('/kontakt')}
                className="w-full bg-white text-brand-blue font-bold py-2 rounded-lg text-sm hover:bg-blue-50 transition-colors"
              >
                Napsat nám
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 flex items-center">
                  <FileText size={18} className="mr-2 text-brand-blue" /> Moje kroužky
                </h3>
              </div>
              
              <div className="p-6">
                {myRegistrations.map((reg) => {
                  const regSchool = schools.find(s => s.id === reg.schoolId);
                  const isEditing = editingId === reg.id;
                  
                  return (
                    <div key={reg.id} className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-6 last:mb-0">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-lg text-gray-900">{regSchool?.name}</h4>
                          <p className="text-sm text-gray-500">{regSchool?.city} • {regSchool?.day} {regSchool?.time}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(reg.status)}
                          {reg.status !== 'cancelled' && !isEditing && (
                            <button onClick={() => startEditing(reg)} className="text-brand-blue hover:text-blue-700 mt-1" title="Upravit údaje dítěte">
                              <PenTool size={16} />
                            </button>
                          )}
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6 space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1">Datum narození</label>
                              <input 
                                type="date"
                                value={editFormData.childBirthDate || ''}
                                onChange={e => setEditFormData({...editFormData, childBirthDate: e.target.value})}
                                className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-brand-blue outline-none text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1">Telefon dítěte</label>
                              <input 
                                type="tel"
                                value={editFormData.childPhone || ''}
                                onChange={e => setEditFormData({...editFormData, childPhone: e.target.value})}
                                className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-brand-blue outline-none text-sm"
                                placeholder="+420..."
                              />
                            </div>
                          </div>
                          <div className="flex items-center">
                            <input 
                              type="checkbox"
                              id={`edit-druzina-${reg.id}`}
                              checked={!!editFormData.afterSchoolClub}
                              onChange={e => setEditFormData({...editFormData, afterSchoolClub: e.target.checked})}
                              className="w-4 h-4 text-brand-blue rounded border-gray-300 focus:ring-brand-blue"
                            />
                            <label htmlFor={`edit-druzina-${reg.id}`} className="ml-2 text-sm text-gray-700">
                              Dítě navštěvuje školní družinu
                            </label>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                            {unsubscribingRegId === reg.id ? (
                              <div className="flex items-center gap-2 bg-red-50 p-1.5 rounded-lg border border-red-200">
                                <span className="text-xs text-red-700 font-bold">Opravdu odhlásit?</span>
                                <button
                                  type="button"
                                  onClick={() => unsubscribeChild(reg.id)}
                                  className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded transition-colors"
                                >
                                  Ano
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setUnsubscribingRegId(null)}
                                  className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs rounded transition-colors"
                                >
                                  Zrušit
                                </button>
                              </div>
                            ) : (
                              <button 
                                type="button" 
                                onClick={() => setUnsubscribingRegId(reg.id)} 
                                className="text-sm text-brand-red font-bold hover:underline cursor-pointer"
                              >
                                Odhlásit z kroužku
                              </button>
                            )}
                            <div className="space-x-2">
                              <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded transition-colors">
                                Zrušit
                              </button>
                              <button onClick={() => saveEdit(reg.id)} className="px-3 py-1.5 text-sm bg-brand-blue text-white rounded hover:bg-blue-700 transition-colors font-bold">
                                Uložit
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-white p-3 rounded-lg border border-gray-200">
                            <span className="text-gray-400 block text-xs">Dítě</span>
                            <span className="font-bold text-sm">{reg.childName}</span>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-gray-200">
                            <span className="text-gray-400 block text-xs">Datum narození</span>
                            <span className="font-bold text-sm">{reg.childBirthDate}</span>
                          </div>
                          {reg.childPhone && (
                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                              <span className="text-gray-400 block text-xs">Telefon dítěte</span>
                              <span className="font-bold text-sm">{reg.childPhone}</span>
                            </div>
                          )}
                          <div className="bg-white p-3 rounded-lg border border-gray-200">
                            <span className="text-gray-400 block text-xs">Družina</span>
                            <span className="font-bold text-sm">{reg.afterSchoolClub ? 'Ano' : 'Ne'}</span>
                          </div>
                        </div>
                      )}

                      {reg.adminNote && !isEditing && (
                        <div className="bg-red-50 p-4 rounded-lg border border-red-100 mb-6">
                          <h5 className="text-red-700 font-bold text-sm mb-1 flex items-center">
                            <AlertCircle size={14} className="mr-1" /> Poznámka od administrátora:
                          </h5>
                          <p className="text-red-600 text-sm">{reg.adminNote}</p>
                        </div>
                      )}

                      {!isEditing && reg.status !== 'cancelled' && (
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6 flex items-center justify-between">
                          <div className="flex items-center text-green-800">
                            <Calendar size={18} className="mr-2" />
                            <span className="font-bold">Zaplaceno do:</span>
                          </div>
                          <span className="font-bold text-lg text-green-700">
                            {reg.paidUntil ? new Date(reg.paidUntil).toLocaleDateString('cs-CZ') : 'Zatím nezaplaceno'}
                          </span>
                        </div>
                      )}

                      {!isEditing && reg.status !== 'cancelled' && (
                        reg.status === 'approved' ? (
                          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-4 rounded-xl border border-emerald-200 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                                <ShieldCheck size={20} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h5 className="font-bold text-gray-900 text-sm">Potvrzení pro zdravotní pojišťovnu / FKSP</h5>
                                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-bold">Platba zaevidována</span>
                                </div>
                                <p className="text-xs text-gray-600 mt-0.5">Oficiální doklad o úhradě kroužku s razítkem a podpisem (příspěvek až 1 500 Kč).</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">
                              <a
                                href={`/api/school-registrations/${reg.id}/confirmation-pdf`}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition-colors shadow-sm flex items-center shrink-0 w-full sm:w-auto justify-center"
                                title="Stáhnout oficiální PDF potvrzení o přijetí platby s razítkem 1:1"
                              >
                                <FileText size={14} className="mr-1.5" />
                                Stáhnout PDF (1:1)
                              </a>
                              <button
                                onClick={() => setSelectedInsuranceReg(reg)}
                                className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs sm:text-sm font-bold px-3 py-2 rounded-xl transition-colors shadow-xs flex items-center shrink-0 w-full sm:w-auto justify-center"
                              >
                                Náhled dokladu
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-200 mb-6 flex items-start space-x-3">
                            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                              <ShieldCheck size={18} />
                            </div>
                            <div>
                              <h5 className="font-bold text-amber-900 text-sm">Potvrzení o platbě pro pojišťovnu / FKSP</h5>
                              <p className="text-xs text-amber-700 mt-0.5">
                                Oficiální potvrzení o přijetí platby s razítkem a podpisem bude k dispozici ke stažení <strong>ihned po připsání a spárování platby</strong> na bankovním účtu.
                              </p>
                            </div>
                          </div>
                        )
                      )}

                      {!isEditing && reg.status !== 'cancelled' && (
                        <div className="mb-6 space-y-6">
                          {/* Training Dates & Attendance Schedule (14 sessions) */}
                          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-100">
                              <div>
                                <h5 className="font-bold text-gray-900 text-base flex items-center">
                                  <Calendar size={18} className="mr-2 text-brand-blue" />
                                  Termíny tréninků & docházka (14 lekcí)
                                </h5>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  Rozpis lekcí stanovený trenérem pro školu {regSchool?.name} ({regSchool?.day} {regSchool?.time})
                                </p>
                              </div>
                              {regSchool?.trainingDates && regSchool.trainingDates.filter(Boolean).length > 0 && (
                                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-brand-blue border border-blue-200 self-start sm:self-auto">
                                  {regSchool.trainingDates.filter(Boolean).length}/14 termínů vypsáno
                                </span>
                              )}
                            </div>

                            {/* If training dates are configured */}
                            {regSchool?.trainingDates && regSchool.trainingDates.filter(Boolean).length > 0 ? (
                              <div className="space-y-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                  {regSchool.trainingDates.map((dateStr, idx) => {
                                    if (!dateStr) {
                                      return (
                                        <div key={idx} className="p-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 flex items-center justify-between text-xs text-gray-400">
                                          <span className="font-bold">{idx + 1}. lekce</span>
                                          <span>Termín zatím nezadán</span>
                                        </div>
                                      );
                                    }

                                    // Check attendance and excuse status
                                    const attRecord = attendance.find(a => a.schoolId === reg.schoolId && a.date === dateStr);
                                    const isRecorded = attRecord && attRecord.records[reg.id] !== undefined;
                                    const isPresent = isRecorded ? attRecord.records[reg.id] : null;
                                    const excuse = excuses.find(e => e.registrationId === reg.id && e.date === dateStr);

                                    const todayStr = new Date().toISOString().split('T')[0];
                                    const isToday = dateStr === todayStr;
                                    const isFuture = dateStr > todayStr;

                                    const formattedDate = new Date(dateStr + 'T12:00:00').toLocaleDateString('cs-CZ', {
                                      weekday: 'short',
                                      day: 'numeric',
                                      month: 'numeric',
                                      year: 'numeric'
                                    });

                                    return (
                                      <div 
                                        key={idx} 
                                        className={`p-3 rounded-xl border transition-all flex items-center justify-between text-xs ${
                                          isToday 
                                            ? 'bg-blue-50/80 border-blue-300 ring-1 ring-blue-300' 
                                            : isRecorded 
                                              ? (isPresent ? 'bg-green-50/60 border-green-200' : 'bg-red-50/60 border-red-200')
                                              : excuse 
                                                ? 'bg-amber-50/60 border-amber-200'
                                                : 'bg-white border-gray-200 hover:border-gray-300'
                                        }`}
                                      >
                                        <div className="flex items-center space-x-2.5 min-w-0">
                                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] shrink-0 ${
                                            isToday ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-700'
                                          }`}>
                                            {idx + 1}
                                          </span>
                                          <div className="min-w-0">
                                            <p className="font-bold text-gray-900 truncate capitalize">{formattedDate}</p>
                                            <p className="text-[11px] text-gray-500">{regSchool.time || 'Čas dle rozvrhu'}</p>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
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
                                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                                                Dnes
                                              </span>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setExcuseRegistrationId(reg.id);
                                                  setExcuseDate(dateStr);
                                                  const excuseEl = document.getElementById('excuse-form');
                                                  if (excuseEl) excuseEl.scrollIntoView({ behavior: 'smooth' });
                                                }}
                                                className="text-[11px] text-brand-blue hover:underline font-bold ml-1"
                                              >
                                                Omluvit
                                              </button>
                                            </div>
                                          ) : isFuture ? (
                                            <div className="flex items-center gap-1">
                                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600">
                                                Plánováno
                                              </span>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setExcuseRegistrationId(reg.id);
                                                  setExcuseDate(dateStr);
                                                  const excuseEl = document.getElementById('excuse-form');
                                                  if (excuseEl) excuseEl.scrollIntoView({ behavior: 'smooth' });
                                                }}
                                                className="text-[11px] text-brand-blue hover:underline font-bold ml-1"
                                                title="Předem omluvit tento trénink"
                                              >
                                                Omluvit
                                              </button>
                                            </div>
                                          ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] text-gray-400 bg-gray-50 border border-gray-200">
                                              Proběhlo
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-6 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <Calendar size={32} className="mx-auto text-gray-300 mb-2" />
                                <p className="text-sm font-bold text-gray-700">Termíny tréninků budou brzy vypsány</p>
                                <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
                                  Lektor nebo administrátor školy termíny pro toto pololetí brzy upřesní. Poté zde uvidíte kompletní rozpis všech 14 lekcí.
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Excuses history & Attendance Summary */}
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <h5 className="font-bold text-gray-700 text-sm mb-3 flex items-center">
                                <PenTool size={15} className="mr-1.5 text-brand-blue" />
                                Odeslané omluvenky
                              </h5>
                              {excuses.filter(e => e.registrationId === reg.id).length > 0 ? (
                                <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                  {excuses.filter(e => e.registrationId === reg.id).map(excuse => (
                                    <li key={excuse.id} className="bg-white p-3 rounded-xl border border-gray-200 text-xs">
                                      <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-gray-900">
                                          {new Date(excuse.date + 'T12:00:00').toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' })}
                                        </span>
                                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                                          Omluveno
                                        </span>
                                      </div>
                                      <p className="text-gray-600 italic">{excuse.reason || 'Bez udání důvodu'}</p>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-xs text-gray-500 italic p-3 bg-white rounded-xl border border-gray-100">Zatím nebyly odeslány žádné omluvenky.</p>
                              )}
                            </div>

                            <div>
                              <h5 className="font-bold text-gray-700 text-sm mb-3 flex items-center">
                                <CheckCircle size={15} className="mr-1.5 text-green-600" />
                                Souhrn účasti
                              </h5>
                              <div className="bg-white p-4 rounded-xl border border-gray-200 text-xs space-y-2">
                                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                  <span className="text-gray-600">Zaznamenaných lekcí:</span>
                                  <strong className="text-gray-900">
                                    {attendance.filter(a => a.schoolId === reg.schoolId && a.records[reg.id] !== undefined).length}
                                  </strong>
                                </div>
                                <div className="flex justify-between items-center text-green-700">
                                  <span className="flex items-center"><Check size={13} className="mr-1" /> Přítomen:</span>
                                  <strong className="font-bold">
                                    {attendance.filter(a => a.schoolId === reg.schoolId && a.records[reg.id] === true).length}
                                  </strong>
                                </div>
                                <div className="flex justify-between items-center text-red-600">
                                  <span className="flex items-center"><X size={13} className="mr-1" /> Nepřítomen:</span>
                                  <strong className="font-bold">
                                    {attendance.filter(a => a.schoolId === reg.schoolId && a.records[reg.id] === false).length}
                                  </strong>
                                </div>
                                <div className="flex justify-between items-center text-amber-700 pt-1 border-t border-gray-100">
                                  <span>Omluvené tréninky:</span>
                                  <strong className="font-bold">
                                    {excuses.filter(e => e.registrationId === reg.id).length}
                                  </strong>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {reg.status === 'pending_payment' && !isEditing && (() => {
                        const regVs = (reg.variableSymbol || (reg.childRodneCislo ? reg.childRodneCislo.replace(/\D/g, '').slice(0, 10) : '') || `261${reg.id.replace(/\D/g, '').slice(-6)}`).replace(/\D/g, '').slice(0, 10);
                        const cleanAmount = parseFloat(regSchool?.price.replace(/\s/g, '').replace('Kč', '') || '0');
                        const qrValue = `SPD*1.0*ACC:${BANK_INFO.iban}*AM:${cleanAmount}*CC:CZK*X-VS:${regVs}*MSG:${reg.childName} ${reg.childSurname || ''}`;

                        return (
                        <div className="mt-8 pt-6 border-t border-gray-200">
                          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mb-6 shadow-sm">
                            <h4 className="font-bold text-brand-blue text-base mb-4 flex items-center">
                              Platební údaje (pololetí / QR platba)
                            </h4>
                            <div className="flex flex-col md:flex-row gap-6 items-center">
                              <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                                <QRCodeSVG 
                                  value={qrValue} 
                                  size={130} 
                                />
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-2">Naskenujte v bance</span>
                              </div>
                              <div className="flex-1 w-full space-y-2.5 text-sm">
                                <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-gray-100">
                                  <div>
                                    <span className="text-xs text-gray-400 block font-medium">Číslo účtu ({BANK_INFO.bankName})</span>
                                    <span className="font-bold text-gray-900">{BANK_INFO.account}</span>
                                  </div>
                                  <button
                                    onClick={() => copyToClipboard(BANK_INFO.account, `acc-${reg.id}`)}
                                    className="text-xs font-bold text-brand-blue hover:text-blue-700 p-1.5 rounded-lg hover:bg-blue-50 transition-colors flex items-center"
                                  >
                                    {copiedField === `acc-${reg.id}` ? <Check size={14} className="text-green-600 mr-1" /> : <Copy size={14} className="mr-1" />}
                                    {copiedField === `acc-${reg.id}` ? 'Zkopírováno' : 'Kopírovat'}
                                  </button>
                                </div>

                                <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-gray-100">
                                  <div>
                                    <span className="text-xs text-gray-400 block font-medium">IBAN / BIC</span>
                                    <span className="font-mono text-xs font-bold text-gray-800">{BANK_INFO.ibanFormatted || BANK_INFO.iban} <span className="text-gray-400 font-normal">({BANK_INFO.bic})</span></span>
                                  </div>
                                  <button
                                    onClick={() => copyToClipboard(BANK_INFO.iban, `iban-${reg.id}`)}
                                    className="text-xs font-bold text-brand-blue hover:text-blue-700 p-1.5 rounded-lg hover:bg-blue-50 transition-colors flex items-center"
                                  >
                                    {copiedField === `iban-${reg.id}` ? <Check size={14} className="text-green-600 mr-1" /> : <Copy size={14} className="mr-1" />}
                                    {copiedField === `iban-${reg.id}` ? 'Zkopírováno' : 'Kopírovat'}
                                  </button>
                                </div>

                                <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-gray-100">
                                  <div>
                                    <span className="text-xs text-gray-400 block font-medium">Částka</span>
                                    <span className="font-bold text-brand-red">{regSchool?.price}</span>
                                  </div>
                                  <button
                                    onClick={() => copyToClipboard(regSchool?.price?.replace(/[^0-9]/g, '') || '', `amount-${reg.id}`)}
                                    className="text-xs font-bold text-brand-blue hover:text-blue-700 p-1.5 rounded-lg hover:bg-blue-50 transition-colors flex items-center"
                                  >
                                    {copiedField === `amount-${reg.id}` ? <Check size={14} className="text-green-600 mr-1" /> : <Copy size={14} className="mr-1" />}
                                    {copiedField === `amount-${reg.id}` ? 'Zkopírováno' : 'Kopírovat'}
                                  </button>
                                </div>

                                <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border-2 border-blue-200 bg-blue-50/50 shadow-sm">
                                  <div>
                                    <span className="text-xs text-brand-blue block font-bold">Variabilní symbol (specifický pro platbu)</span>
                                    <span className="font-mono text-base font-extrabold text-gray-950 tracking-wider">{regVs}</span>
                                  </div>
                                  <button
                                    onClick={() => copyToClipboard(regVs, `vs-${reg.id}`)}
                                    className="text-xs font-bold text-white bg-brand-blue hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors flex items-center shadow-xs"
                                    title="Kopírovat variabilní symbol"
                                  >
                                    {copiedField === `vs-${reg.id}` ? <Check size={14} className="text-white mr-1" /> : <Copy size={14} className="mr-1" />}
                                    {copiedField === `vs-${reg.id}` ? 'Zkopírováno' : 'Kopírovat VS'}
                                  </button>
                                </div>

                                <div className="p-2.5 bg-white rounded-xl border border-gray-100">
                                  <span className="text-xs text-gray-400 block font-medium">Zpráva pro příjemce</span>
                                  <span className="font-bold text-gray-800 text-xs">{reg.childName} {reg.childSurname || ''} ({reg.childBirthDate})</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <button 
                            onClick={() => updateSchoolRegistration(reg.id, { status: 'pending_approval' })}
                            className="w-full bg-brand-red text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors shadow-lg"
                          >
                            Mám zaplaceno - odeslat ke schválení
                          </button>
                        </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            </div>

            <div id="excuse-form" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 flex items-center">
                  <PenTool size={18} className="mr-2 text-brand-blue" /> Odeslat omluvenku
                </h3>
              </div>
              <div className="p-6">
                <form onSubmit={submitExcuse} className="space-y-4">
                  {excuseMessage && (
                    <div className={`p-4 rounded-lg text-sm font-bold ${excuseMessage.includes('chybě') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                      {excuseMessage}
                    </div>
                  )}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vyberte dítě</label>
                    <select 
                      required
                      value={excuseRegistrationId}
                      onChange={e => setExcuseRegistrationId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none bg-white"
                    >
                      <option value="" disabled>Vyberte dítě...</option>
                      {schoolRegistrations
                        .filter(r => r.parentEmail === currentUser?.parentEmail && r.password === currentUser?.password && r.status !== 'cancelled')
                        .map(r => (
                        <option key={r.id} value={r.id}>{r.childName} ({schools.find(s => s.id === r.schoolId)?.name})</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Datum absence</label>
                      <input 
                        type="date" 
                        required
                        value={excuseDate}
                        onChange={e => setExcuseDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Důvod (volitelné)</label>
                      <input 
                        type="text" 
                        value={excuseReason}
                        onChange={e => setExcuseReason(e.target.value)}
                        placeholder="Např. Nemoc, rodinné důvody..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSubmittingExcuse}
                    className="bg-brand-blue text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {isSubmittingExcuse ? 'Odesílám...' : 'Odeslat omluvenku'}
                  </button>
                </form>
              </div>
            </div>
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
