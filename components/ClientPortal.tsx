import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Registration, Camp } from '../types';
import { LogIn, User, FileText, CheckCircle, Clock, AlertCircle, LogOut, ChevronRight, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { BANK_INFO } from '../constants';
import { useNavigate } from 'react-router-dom';

const ClientPortal: React.FC = () => {
  const navigate = useNavigate();
  const { registrations, camps, updateRegistration } = useData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<Registration | null>(null);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = registrations.find(r => r.parentEmail === email && r.password === password);
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
              Zapomněli jste heslo? <button onClick={() => navigate('/kontakt')} className="text-brand-blue font-bold">Kontaktujte nás</button>
            </p>
            <p className="text-sm text-gray-500">
              Nemáte ještě účet? <button onClick={() => navigate('/tabory')} className="text-brand-red font-bold">Vyberte si tábor</button>
            </p>
          </div>
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

                    <div className="space-y-4">
                      <h5 className="font-bold text-sm text-gray-700">Dokumenty:</h5>
                      {currentUser.documents.length > 0 ? (
                        <div className="space-y-2">
                          {currentUser.documents.map((doc, i) => (
                            <div key={i} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 text-sm">
                              <span className="flex items-center"><FileText size={14} className="mr-2 text-gray-400" /> {doc}</span>
                              <button className="text-brand-blue hover:text-blue-700"><Download size={14} /></button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic">Žádné dokumenty nebyly nahrány.</p>
                      )}
                      
                      <button className="w-full mt-2 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-brand-blue hover:text-brand-blue transition-colors flex items-center justify-center">
                        <LogIn size={14} className="mr-2" /> Nahrát další dokument
                      </button>
                    </div>

                    {currentUser.status === 'pending_payment' && (
                      <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-6">
                          <h4 className="font-bold text-brand-blue mb-4">Platební údaje</h4>
                          <div className="flex flex-col md:flex-row gap-6 items-center">
                            <div className="bg-white p-2 rounded-lg shadow-sm">
                              <QRCodeSVG 
                                value={`SPD*1.0*ACC:${BANK_INFO.iban}*AM:${parseFloat(camp?.price.replace(/\s/g, '').replace('Kč', '') || '0')}*CC:CZK*MSG:${currentUser.childName} ${currentUser.childBirthDate}*VS:${camp?.variableSymbol || ''}`} 
                                size={120} 
                              />
                            </div>
                            <div className="flex-1 grid grid-cols-2 gap-y-2 text-sm">
                              <span className="text-gray-500">Číslo účtu:</span>
                              <span className="font-bold">{BANK_INFO.account}</span>
                              <span className="text-gray-500">Částka:</span>
                              <span className="font-bold text-brand-red">{camp?.price}</span>
                              <span className="text-gray-500">Variabilní symbol:</span>
                              <span className="font-bold">{camp?.variableSymbol}</span>
                              <span className="text-gray-500">Zpráva pro příjemce:</span>
                              <span className="font-bold">{currentUser.childName} {currentUser.childBirthDate}</span>
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
    </div>
  );
};

export default ClientPortal;
