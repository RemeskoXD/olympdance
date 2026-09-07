import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Registration, Camp } from '../types';
import { LogIn, User, FileText, CheckCircle, Clock, AlertCircle, LogOut, ChevronRight, Download, ShieldCheck, Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { BANK_INFO } from '../constants';
import { useNavigate } from 'react-router-dom';
import { InsuranceConfirmationModal } from './InsuranceConfirmationModal';
import { ForgotPasswordModal } from './ForgotPasswordModal';

const ClientPortal: React.FC = () => {
  const navigate = useNavigate();
  const { registrations, camps, updateRegistration } = useData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<Registration | null>(null);
  const [error, setError] = useState('');
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    setIsUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Chyba při nahrávání souboru');
      const data = await res.json();
      const newDocUrl = data.url || `/uploads/${data.filename}`;
      const newDocs = [...(currentUser.documents || []), newDocUrl];
      
      await updateRegistration(currentUser.id, { documents: newDocs });
      setCurrentUser({ ...currentUser, documents: newDocs });
    } catch (err: any) {
      alert('Nepodařilo se nahrát dokument: ' + err.message);
    } finally {
      setIsUploadingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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
      const res = await fetch('/api/portal/camp-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPass })
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.registration) {
          setCurrentUser(data.registration);
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
      // Backend not responding, fallback to local registrations
    }

    const fallbackUser = registrations.find(r => 
      r.parentEmail.trim().toLowerCase() === cleanEmail && r.password === cleanPass
    );
    if (fallbackUser) {
      setCurrentUser(fallbackUser);
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
    setEmail('');
    setPassword('');
  };

  const getStatusBadge = (status: Registration['status']) => {
    switch (status) {
      case 'approved':
        return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center"><CheckCircle size={12} className="mr-1" /> Schváleno</span>;
      case 'pending_payment':
        return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold flex items-center"><Clock size={12} className="mr-1" /> Čeká na platbu</span>;
      case 'pending_approval':
        return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center"><Clock size={12} className="mr-1" /> Čeká na schválení</span>;
      case 'action_required':
        return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center"><AlertCircle size={12} className="mr-1" /> Vyžadována akce</span>;
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
            <h2 className="text-2xl font-bold text-gray-900">Klientský portál</h2>
            <p className="text-gray-500">Přihlaste se pro správu vašich přihlášek</p>
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
              Nemáte ještě účet? <button type="button" onClick={() => navigate('/letnicampy')} className="text-brand-red font-bold hover:underline">Vyberte si tábor</button>
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

  const camp = camps.find(c => c.id === currentUser?.campId);

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
              <h3 className="font-bold text-gray-900 mb-4 flex items-center border-b pb-2">
                <User size={18} className="mr-2 text-brand-blue" /> Profil
              </h3>
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
                  <FileText size={18} className="mr-2 text-brand-blue" /> Moje přihlášky
                </h3>
              </div>
              
              <div className="p-6">
                {currentUser && (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-lg text-gray-900">{camp?.title}</h4>
                        <p className="text-sm text-gray-500">{camp?.date}</p>
                      </div>
                      {getStatusBadge(currentUser.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <span className="text-gray-400 block text-xs">Dítě</span>
                        <span className="font-bold text-sm">{currentUser.childName}</span>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <span className="text-gray-400 block text-xs">Datum narození</span>
                        <span className="font-bold text-sm">{currentUser.childBirthDate}</span>
                      </div>
                    </div>

                    {currentUser.adminNote && (
                      <div className="bg-red-50 p-4 rounded-lg border border-red-100 mb-6">
                        <h5 className="text-red-700 font-bold text-sm mb-1 flex items-center">
                          <AlertCircle size={14} className="mr-1" /> Poznámka od administrátora:
                        </h5>
                        <p className="text-red-600 text-sm">{currentUser.adminNote}</p>
                      </div>
                    )}

                    {/* Confirmation for Health Insurance / FKSP */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-blue text-white flex items-center justify-center shrink-0 shadow-sm">
                          <ShieldCheck size={20} />
                        </div>
                        <div>
                          <h5 className="font-bold text-gray-900 text-sm">Potvrzení pro zdravotní pojišťovnu / FKSP</h5>
                          <p className="text-xs text-gray-500">Získejte příspěvek na tábor od vaší pojišťovny (až 1 500 Kč)</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">
                        {currentUser.status === 'approved' && (
                          <a
                            href={`/api/registrations/${currentUser.id}/confirmation-pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl transition-colors shadow-sm flex items-center justify-center flex-1 sm:flex-initial"
                            title="Stáhnout oficiální PDF potvrzení o přijetí platby s razítkem 1:1"
                          >
                            <FileText size={14} className="mr-1.5" />
                            Oficiální PDF (1:1)
                          </a>
                        )}
                        <button
                          onClick={() => setShowInsuranceModal(true)}
                          className="bg-brand-blue hover:bg-blue-700 text-white text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl transition-colors shadow-sm flex items-center justify-center flex-1 sm:flex-initial"
                        >
                          <FileText size={14} className="mr-1.5" />
                          Zobrazit doklad
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h5 className="font-bold text-sm text-gray-700">Dokumenty:</h5>
                      {currentUser.documents && currentUser.documents.length > 0 ? (
                        <div className="space-y-2">
                          {currentUser.documents.map((doc, i) => {
                            const docUrl = doc.startsWith('/') || doc.startsWith('http') ? doc : `/uploads/${doc}`;
                            const docName = doc.split('/').pop() || doc;
                            return (
                              <div key={i} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 text-sm">
                                <span className="flex items-center truncate mr-2" title={docName}>
                                  <FileText size={14} className="mr-2 text-brand-blue shrink-0" />
                                  <span className="truncate">{docName}</span>
                                </span>
                                <a
                                  href={docUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download
                                  className="text-brand-blue hover:text-blue-700 p-1 rounded-md hover:bg-blue-50 transition-colors shrink-0"
                                  title="Stáhnout dokument"
                                >
                                  <Download size={16} />
                                </a>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic">Žádné dokumenty nebyly nahrány.</p>
                      )}
                      
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleDocUpload} 
                        className="hidden" 
                        accept=".pdf,image/*,.doc,.docx"
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingDoc}
                        className="w-full mt-2 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-brand-blue hover:text-brand-blue transition-colors flex items-center justify-center font-medium disabled:opacity-50"
                      >
                        <LogIn size={14} className="mr-2" />
                        {isUploadingDoc ? 'Nahrávám dokument do databáze...' : 'Nahrát další dokument (PDF, foto posudku)'}
                      </button>
                    </div>

                    {currentUser.status === 'pending_payment' && (
                      <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mb-6 shadow-sm">
                          <h4 className="font-bold text-brand-blue text-base mb-4 flex items-center">
                            <span>Platební údaje (převod / QR platba)</span>
                          </h4>
                          <div className="flex flex-col md:flex-row gap-6 items-center">
                            <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                              <QRCodeSVG 
                                value={`SPD*1.0*ACC:${BANK_INFO.iban}*AM:${parseFloat(camp?.price.replace(/\s/g, '').replace('Kč', '') || '0')}*CC:CZK*MSG:${currentUser.childName} ${currentUser.childBirthDate}*VS:${camp?.variableSymbol || ''}`} 
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
                                  onClick={() => copyToClipboard(BANK_INFO.account, 'acc')}
                                  className="text-xs font-bold text-brand-blue hover:text-blue-700 p-1.5 rounded-lg hover:bg-blue-50 transition-colors flex items-center"
                                  title="Kopírovat číslo účtu"
                                >
                                  {copiedField === 'acc' ? <Check size={14} className="text-green-600 mr-1" /> : <Copy size={14} className="mr-1" />}
                                  {copiedField === 'acc' ? 'Zkopírováno' : 'Kopírovat'}
                                </button>
                              </div>

                              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-gray-100">
                                <div>
                                  <span className="text-xs text-gray-400 block font-medium">IBAN / BIC</span>
                                  <span className="font-mono text-xs font-bold text-gray-800">{BANK_INFO.ibanFormatted || BANK_INFO.iban} <span className="text-gray-400 font-normal">({BANK_INFO.bic})</span></span>
                                </div>
                                <button
                                  onClick={() => copyToClipboard(BANK_INFO.iban, 'iban')}
                                  className="text-xs font-bold text-brand-blue hover:text-blue-700 p-1.5 rounded-lg hover:bg-blue-50 transition-colors flex items-center"
                                  title="Kopírovat IBAN"
                                >
                                  {copiedField === 'iban' ? <Check size={14} className="text-green-600 mr-1" /> : <Copy size={14} className="mr-1" />}
                                  {copiedField === 'iban' ? 'Zkopírováno' : 'Kopírovat'}
                                </button>
                              </div>

                              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-gray-100">
                                <div>
                                  <span className="text-xs text-gray-400 block font-medium">Částka</span>
                                  <span className="font-bold text-brand-red">{camp?.price}</span>
                                </div>
                                <button
                                  onClick={() => copyToClipboard(camp?.price?.replace(/[^0-9]/g, '') || '', 'amount')}
                                  className="text-xs font-bold text-brand-blue hover:text-blue-700 p-1.5 rounded-lg hover:bg-blue-50 transition-colors flex items-center"
                                  title="Kopírovat částku"
                                >
                                  {copiedField === 'amount' ? <Check size={14} className="text-green-600 mr-1" /> : <Copy size={14} className="mr-1" />}
                                  {copiedField === 'amount' ? 'Zkopírováno' : 'Kopírovat'}
                                </button>
                              </div>

                              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-gray-100">
                                <div>
                                  <span className="text-xs text-gray-400 block font-medium">Variabilní symbol</span>
                                  <span className="font-bold text-gray-900">{camp?.variableSymbol}</span>
                                </div>
                                <button
                                  onClick={() => copyToClipboard(camp?.variableSymbol || '', 'vs')}
                                  className="text-xs font-bold text-brand-blue hover:text-blue-700 p-1.5 rounded-lg hover:bg-blue-50 transition-colors flex items-center"
                                  title="Kopírovat VS"
                                >
                                  {copiedField === 'vs' ? <Check size={14} className="text-green-600 mr-1" /> : <Copy size={14} className="mr-1" />}
                                  {copiedField === 'vs' ? 'Zkopírováno' : 'Kopírovat'}
                                </button>
                              </div>

                              <div className="p-2.5 bg-white rounded-xl border border-gray-100">
                                <span className="text-xs text-gray-400 block font-medium">Zpráva pro příjemce</span>
                                <span className="font-bold text-gray-800 text-xs">{currentUser.childName} {currentUser.childBirthDate}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={() => updateRegistration(currentUser.id, { status: 'pending_approval' })}
                          className="w-full bg-brand-red text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors shadow-lg"
                        >
                          Mám zaplaceno - odeslat ke schválení
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insurance Modal */}
      {showInsuranceModal && currentUser && (
        <InsuranceConfirmationModal
          data={{
            childName: currentUser.childName,
            childBirthDate: currentUser.childBirthDate,
            parentName: currentUser.parentName,
            parentPhone: currentUser.parentPhone,
            parentEmail: currentUser.parentEmail,
            activityTitle: `Letní tábor: ${camp?.title || 'Olymp Dance'}`,
            activityType: 'tabor',
            location: camp?.location || 'Olomouc / Prostějov / Bílá',
            periodOrDate: camp?.date || 'Léto 2026',
            price: camp?.price || '0 Kč',
            variableSymbol: camp?.variableSymbol,
            paymentStatus: currentUser.status
          }}
          onClose={() => setShowInsuranceModal(false)}
        />
      )}
    </div>
  );
};

export default ClientPortal;
