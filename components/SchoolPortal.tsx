import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { SchoolRegistration, School } from '../types';
import { LogIn, User, FileText, CheckCircle, Clock, AlertCircle, LogOut, ChevronRight, Calendar, PenTool } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { BANK_INFO } from '../constants';
import { useNavigate } from 'react-router-dom';

const SchoolPortal: React.FC = () => {
  const navigate = useNavigate();
  const { schoolRegistrations, schools, updateSchoolRegistration, addExcuse, excuses, attendance } = useData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<SchoolRegistration | null>(null);
  const [error, setError] = useState('');
  
  const [excuseDate, setExcuseDate] = useState('');
  const [excuseReason, setExcuseReason] = useState('');
  const [excuseRegistrationId, setExcuseRegistrationId] = useState('');
  const [isSubmittingExcuse, setIsSubmittingExcuse] = useState(false);
  const [excuseMessage, setExcuseMessage] = useState('');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<SchoolRegistration>>({});
  
  const [editingParent, setEditingParent] = useState(false);
  const [parentFormData, setParentFormData] = useState({ parentName: '', parentPhone: '' });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = schoolRegistrations.find(r => r.parentEmail === email && r.password === password);
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Nesprávný email nebo heslo.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setEmail('');
    setPassword('');
  };

  const submitExcuse = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetReg = schoolRegistrations.find(r => r.id === excuseRegistrationId);
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
    const reg = schoolRegistrations.find(r => r.id === regId);
    if (!reg) return;

    const currentHistory = reg.history || [];
    const newHistory = [
      ...currentHistory,
      { 
        date: new Date().toISOString(), 
        message: 'Rodič upravil údaje o dítěti.' 
      }
    ];

    await updateSchoolRegistration(regId, {
      ...editFormData,
      history: newHistory
    });
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
    const siblingRegs = schoolRegistrations.filter(r => r.parentEmail === currentUser.parentEmail && r.password === currentUser.password);
    
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
    
    setCurrentUser({
      ...currentUser,
      parentName: parentFormData.parentName,
      parentPhone: parentFormData.parentPhone
    });
    
    setEditingParent(false);
  };

  const unsubscribeChild = async (regId: string) => {
    if (!window.confirm('Opravdu chcete dítě odhlásit z kroužku?')) return;
    
    const reg = schoolRegistrations.find(r => r.id === regId);
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
              Zapomněli jste heslo? <button onClick={() => navigate('/kontakt')} className="text-brand-blue font-bold">Kontaktujte nás</button>
            </p>
            <p className="text-sm text-gray-500">
              Nemáte ještě účet? <button onClick={() => navigate('/tanecnikrouzky')} className="text-brand-red font-bold">Přihlaste se do kroužku</button>
            </p>
          </div>
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
                {schoolRegistrations.filter(r => r.parentEmail === currentUser?.parentEmail && r.password === currentUser?.password).map((reg) => {
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
                            <button onClick={() => unsubscribeChild(reg.id)} className="text-sm text-brand-red font-bold hover:underline">
                              Odhlásit z kroužku
                            </button>
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
                        <div className="mb-6 grid md:grid-cols-2 gap-6">
                          <div>
                            <h5 className="font-bold text-gray-700 text-sm mb-3">Odeslané omluvenky</h5>
                            {excuses.filter(e => e.registrationId === reg.id).length > 0 ? (
                              <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                {excuses.filter(e => e.registrationId === reg.id).map(excuse => (
                                  <li key={excuse.id} className="bg-white p-3 rounded-lg border border-gray-200 text-sm">
                                    <span className="font-bold text-gray-900 mr-2">{new Date(excuse.date).toLocaleDateString('cs-CZ')}:</span>
                                    <span className="text-gray-600">{excuse.reason}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-500 italic">Zatím nebyly odeslány žádné omluvenky.</p>
                            )}
                          </div>
                          <div>
                            <h5 className="font-bold text-gray-700 text-sm mb-3">Historie docházky</h5>
                            {attendance.filter(a => a.schoolId === reg.schoolId && a.records[reg.id] !== undefined).length > 0 ? (
                              <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                {attendance
                                  .filter(a => a.schoolId === reg.schoolId && a.records[reg.id] !== undefined)
                                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                  .map(a => (
                                  <li key={a.id} className="bg-white p-3 rounded-lg border border-gray-200 text-sm flex justify-between items-center">
                                    <span className="font-bold text-gray-900">{new Date(a.date).toLocaleDateString('cs-CZ')}</span>
                                    {a.records[reg.id] ? (
                                      <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded text-xs">Přítomen</span>
                                    ) : (
                                      <span className="text-red-600 font-bold bg-red-50 px-2 py-1 rounded text-xs">Nepřítomen</span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-500 italic">Zatím není zaznamenána žádná docházka.</p>
                            )}
                          </div>
                        </div>
                      )}

                      {reg.status === 'pending_payment' && !isEditing && (
                        <div className="mt-8 pt-6 border-t border-gray-200">
                          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-6">
                            <h4 className="font-bold text-brand-blue mb-4">Platební údaje (pololetí)</h4>
                            <div className="flex flex-col md:flex-row gap-6 items-center">
                              <div className="bg-white p-2 rounded-lg shadow-sm">
                                <QRCodeSVG 
                                  value={`SPD*1.0*ACC:${BANK_INFO.iban}*AM:${parseFloat(regSchool?.price.replace(/\s/g, '').replace('Kč', '') || '0')}*CC:CZK*MSG:${reg.childName} ${reg.childBirthDate}`} 
                                  size={120} 
                                />
                              </div>
                              <div className="flex-1 grid grid-cols-2 gap-y-2 text-sm">
                                <span className="text-gray-500">Číslo účtu:</span>
                                <span className="font-bold">{BANK_INFO.account}</span>
                                <span className="text-gray-500">Částka:</span>
                                <span className="font-bold text-brand-red">{regSchool?.price}</span>
                                <span className="text-gray-500">Zpráva pro příjemce:</span>
                                <span className="font-bold">{reg.childName} {reg.childBirthDate}</span>
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
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
    </div>
  );
};

export default SchoolPortal;
