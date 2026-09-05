import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { 
  Trash2, Plus, School as SchoolIcon, Tent, LogOut, Lock, Image as ImageIcon, Edit2, Save, X, 
  ShoppingBag, ToggleLeft, ToggleRight, FileText, CheckCircle as CheckCircleIcon, Clock, 
  AlertCircle, Mail, Users, Check, X as XIcon, Calendar, Info, LayoutDashboard, DollarSign, 
  Users as UsersIcon, Download, Printer, Search, Filter, ShieldCheck, ArrowLeft, ArrowRight, 
  UserCheck, CheckSquare, Square, ChevronRight, Sparkles, MapPin, Building2, Phone, RotateCcw,
  CreditCard
} from 'lucide-react';
import { School, Camp, Product, Registration, User, SchoolRegistration, MerchOrder } from '../types';
import { exportSchoolRegistrationsToCsv, exportCampRegistrationsToCsv } from '../utils/exportCsv';
import { AttendanceSheetModal } from './AttendanceSheetModal';
import { TrainingDatesModal } from './TrainingDatesModal';
import { InsuranceConfirmationModal } from './InsuranceConfirmationModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { RbBankManager } from './RbBankManager';

const Admin: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, schools, schoolRegistrations, attendance, excuses, updateAttendance } = useData();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'schools' | 'camps' | 'gallery' | 'merch' | 'registrations' | 'school_registrations' | 'users' | 'attendance' | 'rb_bank'>('dashboard');

  // Check for persisted login on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem('olymp_admin_user_id');
    const storedAuth = localStorage.getItem('olymp_admin_auth');
    if (storedAuth === 'true' && storedUserId) {
      if (storedUserId === 'superadmin') {
         setIsAuthenticated(true);
         setCurrentUser({ id: 'superadmin', username: 'admin', role: 'admin', name: 'Hlavní administrátor' });
      } else {
         const user = users.find(u => u.id === storedUserId);
         if (user) {
             setIsAuthenticated(true);
             setCurrentUser(user);
             if (user.role === 'trainer') {
                 setActiveTab('attendance');
             }
         }
      }
    }
  }, [users]);

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') { 
      setIsAuthenticated(true);
      setCurrentUser({ id: 'superadmin', username: 'admin', role: 'admin', name: 'Hlavní administrátor' });
      localStorage.setItem('olymp_admin_auth', 'true');
      localStorage.setItem('olymp_admin_user_id', 'superadmin');
    } else {
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
          setIsAuthenticated(true);
          setCurrentUser(user);
          localStorage.setItem('olymp_admin_auth', 'true');
          localStorage.setItem('olymp_admin_user_id', user.id);
          if (user.role === 'trainer') {
              setActiveTab('attendance');
          }
      } else {
          alert('Špatné jméno nebo heslo');
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('olymp_admin_auth');
    localStorage.removeItem('olymp_admin_user_id');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-brand-red/10 rounded-full mb-4 text-brand-red">
                <Lock size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Administrace</h2>
            <p className="text-gray-500 text-sm mt-2">Přístup pouze pro správce</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Uživatelské jméno</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
                  placeholder="Zadejte uživatelské jméno"
                  required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Heslo</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
                  placeholder="Zadejte heslo"
                  required
                />
            </div>
            <button type="submit" className="w-full bg-brand-blue text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors">
              Přihlásit se
            </button>
          </form>
          <div className="mt-6 text-center text-xs text-gray-400">
            Tip: Přístup pro hlavního správce (admin / admin123)
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Správa obsahu</h1>
          <button 
            onClick={handleLogout}
            className="flex items-center text-gray-600 hover:text-red-600 transition-colors text-sm font-medium"
          >
            <LogOut size={18} className="mr-2" />
            Odhlásit se
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6 sm:mb-8 bg-white p-1.5 sm:p-2 rounded-xl shadow-sm w-full">
          {(currentUser?.role === 'admin' || currentUser?.role === undefined) && (
            <>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'dashboard' 
                  ? 'bg-brand-blue text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <LayoutDashboard size={18} className="mr-2" />
                Přehled
              </button>
              <button
                onClick={() => setActiveTab('schools')}
                className={`flex items-center px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'schools' 
                  ? 'bg-brand-blue text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <SchoolIcon size={18} className="mr-2" />
                Školy a Kroužky
              </button>
              <button
                onClick={() => setActiveTab('camps')}
                className={`flex items-center px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'camps' 
                  ? 'bg-brand-blue text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <Tent size={18} className="mr-2" />
                Letní Tábory
              </button>
               <button
                onClick={() => setActiveTab('gallery')}
                className={`flex items-center px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'gallery' 
                  ? 'bg-brand-blue text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <ImageIcon size={18} className="mr-2" />
                Galerie
              </button>
              <button
                onClick={() => setActiveTab('merch')}
                className={`flex items-center px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'merch' 
                  ? 'bg-brand-blue text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <ShoppingBag size={18} className="mr-2" />
                E-shop / Merch
              </button>
              <button
                onClick={() => setActiveTab('school_registrations')}
                className={`flex items-center px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'school_registrations' 
                  ? 'bg-brand-blue text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <FileText size={18} className="mr-2" />
                Přihlášky Kroužky
              </button>
              <button
                onClick={() => setActiveTab('registrations')}
                className={`flex items-center px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'registrations' 
                  ? 'bg-brand-blue text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <FileText size={18} className="mr-2" />
                Přihlášky Tábory
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'users' 
                  ? 'bg-brand-blue text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <Users size={18} className="mr-2" />
                Uživatelé
              </button>
              <button
                onClick={() => setActiveTab('rb_bank')}
                className={`flex items-center px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'rb_bank' 
                  ? 'bg-brand-blue text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <CreditCard size={18} className="mr-2" />
                Banka & Platby API
              </button>
            </>
          )}

          {currentUser?.role === 'trainer' && (
             <button
                onClick={() => setActiveTab('attendance')}
                className={`flex items-center px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'attendance' 
                  ? 'bg-brand-blue text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <CheckCircleIcon size={18} className="mr-2" />
                Docházka
              </button>
          )}
        </div>

        {activeTab === 'dashboard' && <DashboardManager />}
        {activeTab === 'schools' && <SchoolManager />}
        {activeTab === 'camps' && <CampManager />}
        {activeTab === 'gallery' && <GalleryManager />}
        {activeTab === 'merch' && <MerchManager />}
        {activeTab === 'school_registrations' && <SchoolRegistrationManager />}
        {activeTab === 'registrations' && <RegistrationManager />}
        {activeTab === 'users' && <UserManager />}
        {activeTab === 'attendance' && <AttendanceManager currentUser={currentUser} />}
        {activeTab === 'rb_bank' && <RbBankManager />}
      </div>
    </div>
  );
};

// --- Sub-components for better organization ---

const DashboardManager: React.FC = () => {
  const { 
    schoolRegistrations, 
    registrations, 
    schools, 
    camps, 
    isTanecniExpresEnabled, 
    toggleTanecniExpres, 
    isCampsEnabled, 
    toggleCamps, 
    isMerchEnabled, 
    toggleMerch 
  } = useData();

  // Calculate stats
  const totalSchoolKids = schoolRegistrations.filter(r => r.status !== 'cancelled').length;
  const totalCampKids = registrations.filter(r => r.status !== 'cancelled').length;
  const totalKids = totalSchoolKids + totalCampKids;

  // Calculate revenue from approved registrations
  const calculateRevenue = () => {
    let total = 0;
    
    // Schools
    schoolRegistrations.filter(r => r.status === 'approved').forEach(reg => {
      const school = schools.find(s => s.id === reg.schoolId);
      if (school && school.price) {
        const amount = parseFloat(school.price.replace(/\s/g, '').replace('Kč', ''));
        if (!isNaN(amount)) total += amount;
      }
    });

    // Camps
    registrations.filter(r => r.status === 'approved').forEach(reg => {
      const camp = camps.find(c => c.id === reg.campId);
      if (camp && camp.price) {
        const amount = parseFloat(camp.price.replace(/\s/g, '').replace('Kč', ''));
        if (!isNaN(amount)) total += amount;
      }
    });

    return total;
  };

  const calculatePendingRevenue = () => {
    let total = 0;
    
    // Schools
    schoolRegistrations.filter(r => r.status === 'pending_payment').forEach(reg => {
      const school = schools.find(s => s.id === reg.schoolId);
      if (school && school.price) {
        const amount = parseFloat(school.price.replace(/\s/g, '').replace('Kč', ''));
        if (!isNaN(amount)) total += amount;
      }
    });

    // Camps
    registrations.filter(r => r.status === 'pending_payment').forEach(reg => {
      const camp = camps.find(c => c.id === reg.campId);
      if (camp && camp.price) {
        const amount = parseFloat(camp.price.replace(/\s/g, '').replace('Kč', ''));
        if (!isNaN(amount)) total += amount;
      }
    });

    return total;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Přehled a Statistiky</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-4 bg-blue-50 text-brand-blue rounded-xl mr-4">
            <UsersIcon size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Celkem dětí</p>
            <p className="text-2xl font-bold text-gray-900">{totalKids}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-4 bg-green-50 text-green-600 rounded-xl mr-4">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Vybraná částka</p>
            <p className="text-2xl font-bold text-gray-900">{calculateRevenue().toLocaleString('cs-CZ')} Kč</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-4 bg-yellow-50 text-yellow-600 rounded-xl mr-4">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Čeká na platbu</p>
            <p className="text-2xl font-bold text-gray-900">{calculatePendingRevenue().toLocaleString('cs-CZ')} Kč</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-xl mr-4">
            <SchoolIcon size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Aktivní školy/tábory</p>
            <p className="text-2xl font-bold text-gray-900">{schools.length + camps.length}</p>
          </div>
        </div>
      </div>

      {/* Subpage Toggles */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-lg text-gray-900 mb-4 pb-2 border-b">Aktivace a viditelnost podstránek</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Taneční expres toggle */}
          <div className="flex flex-col justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/60">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-gray-900">Taneční Expres</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${isTanecniExpresEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                  {isTanecniExpresEnabled ? 'Zapnuto' : 'Vypnuto'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-4">Zobrazuje položku Taneční Expres v navigaci a umožňuje přístup na stránku.</p>
            </div>
            <button
              onClick={() => toggleTanecniExpres(!isTanecniExpresEnabled)}
              className={`w-full py-2 px-3 rounded-lg font-bold text-sm flex items-center justify-center transition-all ${
                isTanecniExpresEnabled 
                  ? 'bg-red-50 text-brand-red hover:bg-red-100' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isTanecniExpresEnabled ? 'Vypnout podstránku' : 'Zapnout podstránku'}
            </button>
          </div>

          {/* Letní tábory toggle */}
          <div className="flex flex-col justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/60">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-gray-900">Letní Campy / Tábory</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${isCampsEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                  {isCampsEnabled ? 'Zapnuto' : 'Vypnuto'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-4">Zobrazuje Letní tábory v menu a na hlavní stránce, spravuje registrace.</p>
            </div>
            <button
              onClick={() => toggleCamps(!isCampsEnabled)}
              className={`w-full py-2 px-3 rounded-lg font-bold text-sm flex items-center justify-center transition-all ${
                isCampsEnabled 
                  ? 'bg-red-50 text-brand-red hover:bg-red-100' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isCampsEnabled ? 'Vypnout podstránku' : 'Zapnout podstránku'}
            </button>
          </div>

          {/* E-shop toggle */}
          <div className="flex flex-col justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/60">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-gray-900">E-shop / Merch</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${isMerchEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                  {isMerchEnabled ? 'Zapnuto' : 'Vypnuto'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-4">Zobrazuje odkaz na Merch v patičce a navigačním menu.</p>
            </div>
            <button
              onClick={() => toggleMerch(!isMerchEnabled)}
              className={`w-full py-2 px-3 rounded-lg font-bold text-sm flex items-center justify-center transition-all ${
                isMerchEnabled 
                  ? 'bg-red-50 text-brand-red hover:bg-red-100' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isMerchEnabled ? 'Vypnout e-shop' : 'Zapnout e-shop'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Rozdělení dětí</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center"><SchoolIcon size={16} className="mr-2 text-brand-blue"/> Kroužky na školách</span>
              <span className="font-bold">{totalSchoolKids} dětí</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center"><Tent size={16} className="mr-2 text-brand-blue"/> Letní tábory</span>
              <span className="font-bold">{totalCampKids} dětí</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Stav přihlášek</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center"><CheckCircleIcon size={16} className="mr-2 text-green-500"/> Schválené</span>
              <span className="font-bold">
                {schoolRegistrations.filter(r => r.status === 'approved').length + registrations.filter(r => r.status === 'approved').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center"><Clock size={16} className="mr-2 text-yellow-500"/> Čeká na platbu</span>
              <span className="font-bold">
                {schoolRegistrations.filter(r => r.status === 'pending_payment').length + registrations.filter(r => r.status === 'pending_payment').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center"><Clock size={16} className="mr-2 text-blue-500"/> Čeká na schválení</span>
              <span className="font-bold">
                {schoolRegistrations.filter(r => r.status === 'pending_approval').length + registrations.filter(r => r.status === 'pending_approval').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SchoolManager: React.FC = () => {
  const { schools, addSchool, updateSchool, deleteSchool } = useData();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', city: '', day: '', time: '', price: '', isKindergarten: false });
  const [datesModalSchool, setDatesModalSchool] = useState<School | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.city) return;
    
    if (isEditing) {
      updateSchool(isEditing, formData);
      setIsEditing(null);
    } else {
      addSchool(formData);
    }
    setFormData({ name: '', city: '', day: '', time: '', price: '', isKindergarten: false });
  };

  const handleEdit = (school: School) => {
    setIsEditing(school.id);
    setFormData({
      name: school.name,
      city: school.city,
      day: school.day,
      time: school.time,
      price: school.price,
      isKindergarten: school.isKindergarten || false
    });
  };

  const cancelEdit = () => {
    setIsEditing(null);
    setFormData({ name: '', city: '', day: '', time: '', price: '', isKindergarten: false });
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Form */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-2xl shadow-md sticky top-24">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center justify-between">
             <span className="flex items-center">
               {isEditing ? <Edit2 size={20} className="mr-2 text-brand-blue" /> : <Plus size={20} className="mr-2 text-brand-red" />}
               {isEditing ? 'Upravit školu' : 'Přidat školu'}
             </span>
             {isEditing && (
               <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600">
                 <X size={20} />
               </button>
             )}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input 
              className="w-full px-3 py-2 border rounded-lg text-sm" 
              placeholder="Název školy" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              required 
            />
            <input 
              className="w-full px-3 py-2 border rounded-lg text-sm" 
              placeholder="Město" 
              value={formData.city} 
              onChange={e => setFormData({...formData, city: e.target.value})} 
              required 
            />
            <div className="grid grid-cols-2 gap-2">
                <input 
                  className="w-full px-3 py-2 border rounded-lg text-sm" 
                  placeholder="Den (např. Pondělí)" 
                  value={formData.day} 
                  onChange={e => setFormData({...formData, day: e.target.value})} 
                />
                <input 
                  className="w-full px-3 py-2 border rounded-lg text-sm" 
                  placeholder="Čas (14:00 - 14:45)" 
                  value={formData.time} 
                  onChange={e => setFormData({...formData, time: e.target.value})} 
                />
            </div>
            <input 
              className="w-full px-3 py-2 border rounded-lg text-sm" 
              placeholder="Cena (1700 Kč / pololetí)" 
              value={formData.price} 
              onChange={e => setFormData({...formData, price: e.target.value})} 
            />
            <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.isKindergarten} 
                onChange={e => setFormData({...formData, isKindergarten: e.target.checked})}
                className="rounded text-brand-blue focus:ring-brand-blue"
              />
              <span>Je to mateřská škola?</span>
            </label>
            <button className={`w-full text-white font-bold py-2 rounded-lg transition-colors ${isEditing ? 'bg-brand-blue hover:bg-blue-700' : 'bg-brand-red hover:bg-red-700'}`}>
              {isEditing ? 'Uložit změny' : 'Přidat školu'}
            </button>
          </form>
        </div>
      </div>

      {/* List */}
      <div className="lg:col-span-2 space-y-4">
        {schools.map(school => {
          const filledDates = (school.trainingDates || []).filter(Boolean).length;

          return (
            <div key={school.id} className={`bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center group transition-all ${isEditing === school.id ? 'border-brand-blue ring-2 ring-brand-blue/20' : 'border-gray-100 hover:shadow-md'}`}>
              <div>
                <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900">{school.name}</h4>
                    {school.isKindergarten && <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded font-bold">MŠ</span>}
                </div>
                <p className="text-sm text-gray-500">{school.city} • {school.day} {school.time}</p>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-sm font-semibold text-brand-blue">{school.price}</p>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center ${
                    filledDates > 0 
                      ? 'bg-blue-50 text-brand-blue border border-blue-200' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    <Calendar size={11} className="mr-1" />
                    {filledDates > 0 ? `${filledDates}/14 termínů` : 'Termíny nezadány'}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setDatesModalSchool(school)}
                  className="px-2.5 py-1.5 text-xs font-bold text-brand-blue bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center"
                  title="Nastavit data tréninků (14 lekcí)"
                >
                  <Calendar size={14} className="mr-1" />
                  <span className="hidden sm:inline">14 termínů</span>
                </button>
                <button 
                  onClick={() => handleEdit(school)}
                  className="p-2 text-gray-400 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-colors"
                  title="Upravit"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => { if(confirm('Opravdu smazat?')) deleteSchool(school.id) }}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Smazat"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
        {schools.length === 0 && <p className="text-gray-500 text-center py-8">Žádné školy v seznamu.</p>}
      </div>

      {datesModalSchool && (
        <TrainingDatesModal
          school={datesModalSchool}
          onClose={() => setDatesModalSchool(null)}
          onSave={(trainingDates) => {
            updateSchool(datesModalSchool.id, { trainingDates });
            setDatesModalSchool(null);
          }}
        />
      )}
    </div>
  );
};

const CampManager: React.FC = () => {
    const { camps, addCamp, updateCamp, deleteCamp, campGeneralInfo, updateCampGeneralInfo, isCampsEnabled, toggleCamps } = useData();
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [formData, setFormData] = useState({ title: '', date: '', price: '', description: '', image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=800', externalUrl: '', details: '' });
    const [generalInfo, setGeneralInfo] = useState(campGeneralInfo);

    // Update local state when context changes (initial load)
    useEffect(() => {
        setGeneralInfo(campGeneralInfo);
    }, [campGeneralInfo]);

    const handleGeneralInfoSave = () => {
        updateCampGeneralInfo(generalInfo);
        alert('Obecné informace uloženy');
    };
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.title) return;
      
      if (isEditing) {
        updateCamp(isEditing, formData);
        setIsEditing(null);
      } else {
        addCamp(formData);
      }
      setFormData({ title: '', date: '', price: '', description: '', image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=800', externalUrl: '', details: '' });
    };

    const handleEdit = (camp: Camp) => {
      setIsEditing(camp.id);
      setFormData({
        title: camp.title,
        date: camp.date,
        price: camp.price,
        description: camp.description,
        image: camp.image,
        externalUrl: camp.externalUrl || '',
        details: camp.details || ''
      });
    };

    const cancelEdit = () => {
      setIsEditing(null);
      setFormData({ title: '', date: '', price: '', description: '', image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=800', externalUrl: '', details: '' });
    };
  
    return (
      <div className="space-y-8">
        {/* Visibility Toggle */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
           <div>
               <h3 className="text-lg font-bold text-gray-900">Viditelnost podstránky Letní tábory</h3>
               <p className="text-gray-500 text-sm">Pokud vypnete, odkaz zmizí z menu a na stránce táborů se zobrazí informace o ukončeném přihlašování.</p>
           </div>
           <button 
             onClick={() => toggleCamps(!isCampsEnabled)}
             className={`flex items-center px-4 py-2 rounded-full font-bold transition-all ${isCampsEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
           >
               {isCampsEnabled ? <ToggleRight size={40} className="mr-2" /> : <ToggleLeft size={40} className="mr-2" />}
               {isCampsEnabled ? 'Aktivní' : 'Vypnuto'}
           </button>
        </div>

        {/* General Info Editor */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Obecné informace na stránce Tábory</h3>
            <textarea 
                className="w-full px-3 py-2 border rounded-lg text-sm mb-3" 
                rows={4}
                value={generalInfo}
                onChange={(e) => setGeneralInfo(e.target.value)}
                placeholder="Zde napište obecné informace, které se zobrazí na stránce táborů..."
            />
            <button 
                onClick={handleGeneralInfoSave}
                className="bg-gray-800 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-900 transition-colors text-sm"
            >
                Uložit text
            </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-md sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center justify-between">
                <span className="flex items-center">
                    {isEditing ? <Edit2 size={20} className="mr-2 text-brand-blue" /> : <Plus size={20} className="mr-2 text-brand-red" />}
                    {isEditing ? 'Upravit tábor' : 'Přidat tábor'}
                </span>
                {isEditing && (
                    <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                    </button>
                )}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-3">
                <input 
                    className="w-full px-3 py-2 border rounded-lg text-sm" 
                    placeholder="Název tábora" 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                    required 
                />
                <div className="grid grid-cols-2 gap-2">
                    <input 
                        className="w-full px-3 py-2 border rounded-lg text-sm" 
                        placeholder="Datum (1.7. - 5.7.)" 
                        value={formData.date} 
                        onChange={e => setFormData({...formData, date: e.target.value})} 
                    />
                    <input 
                        className="w-full px-3 py-2 border rounded-lg text-sm" 
                        placeholder="Cena" 
                        value={formData.price} 
                        onChange={e => setFormData({...formData, price: e.target.value})} 
                    />
                </div>
                <textarea 
                    className="w-full px-3 py-2 border rounded-lg text-sm" 
                    placeholder="Krátký popis (na kartu)..." 
                    rows={2}
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                />
                <input 
                    className="w-full px-3 py-2 border rounded-lg text-sm" 
                    placeholder="URL obrázku" 
                    value={formData.image} 
                    onChange={e => setFormData({...formData, image: e.target.value})} 
                />
                
                <div className="border-t pt-3 mt-3">
                    <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Detaily</p>
                    <input 
                        className="w-full px-3 py-2 border rounded-lg text-sm mb-2" 
                        placeholder="Externí URL pro registraci (https://...)" 
                        value={formData.externalUrl} 
                        onChange={e => setFormData({...formData, externalUrl: e.target.value})} 
                    />
                    <textarea 
                        className="w-full px-3 py-2 border rounded-lg text-sm" 
                        placeholder="Detailní informace (Markdown)..." 
                        rows={5}
                        value={formData.details} 
                        onChange={e => setFormData({...formData, details: e.target.value})} 
                    />
                </div>

                <button className={`w-full text-white font-bold py-2 rounded-lg transition-colors ${isEditing ? 'bg-brand-blue hover:bg-blue-700' : 'bg-brand-red hover:bg-red-700'}`}>
                    {isEditing ? 'Uložit změny' : 'Uložit tábor'}
                </button>
                </form>
            </div>
            </div>
    
            {/* List */}
            <div className="lg:col-span-2 space-y-4">
            {camps.map(camp => (
                <div key={camp.id} className={`bg-white p-4 rounded-xl shadow-sm border flex gap-4 group transition-all ${isEditing === camp.id ? 'border-brand-blue ring-2 ring-brand-blue/20' : 'border-gray-100 hover:shadow-md'}`}>
                <img src={camp.image} alt="" className="w-24 h-24 object-cover rounded-lg bg-gray-100" />
                <div className="flex-grow">
                    <div className="flex justify-between items-start">
                        <h4 className="font-bold text-gray-900">{camp.title}</h4>
                        <div className="flex space-x-2">
                        <button 
                            onClick={() => handleEdit(camp)}
                            className="text-gray-400 hover:text-brand-blue transition-colors"
                        >
                            <Edit2 size={20} />
                        </button>
                        <button 
                            onClick={() => { if(confirm('Opravdu smazat?')) deleteCamp(camp.id) }}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                            <Trash2 size={20} />
                        </button>
                        </div>
                    </div>
                    <p className="text-sm text-brand-red font-semibold mb-1">{camp.date} • {camp.price}</p>
                    <p className="text-sm text-gray-500 line-clamp-2">{camp.description}</p>
                    {camp.externalUrl && <p className="text-xs text-blue-500 mt-1 truncate">🔗 {camp.externalUrl}</p>}
                </div>
                </div>
            ))}
            {camps.length === 0 && <p className="text-gray-500 text-center py-8">Žádné tábory v seznamu.</p>}
            </div>
        </div>
      </div>
    );
  };

const GalleryManager: React.FC = () => {
  const { galleryImages, addGalleryImage, deleteGalleryImage } = useData();
  const [newImageUrl, setNewImageUrl] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl) return;
    addGalleryImage(newImageUrl);
    setNewImageUrl('');
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Form */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-2xl shadow-md sticky top-24">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
             <Plus size={20} className="mr-2 text-brand-red" /> Přidat fotku
          </h3>
          <form onSubmit={handleAdd} className="space-y-3">
             <label className="block text-sm text-gray-600 mb-1">
                URL adresa obrázku (např. z Facebooku, Instagramu nebo webu)
             </label>
            <input 
              className="w-full px-3 py-2 border rounded-lg text-sm" 
              placeholder="https://..." 
              value={newImageUrl} 
              onChange={e => setNewImageUrl(e.target.value)} 
              required 
            />
            {newImageUrl && (
                <div className="mt-2 rounded-lg overflow-hidden border border-gray-200">
                    <img src={newImageUrl} alt="Náhled" className="w-full h-32 object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </div>
            )}
            <button className="w-full bg-brand-blue text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Uložit fotku
            </button>
          </form>
        </div>
      </div>

      {/* List */}
      <div className="lg:col-span-2">
         <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {galleryImages.map(img => (
                <div key={img.id} className="relative group rounded-lg overflow-hidden shadow-sm border border-gray-100 aspect-square">
                    <img src={img.url} alt="Galerie" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                            onClick={() => { if(confirm('Opravdu smazat?')) deleteGalleryImage(img.id) }}
                            className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                </div>
            ))}
         </div>
         {galleryImages.length === 0 && <p className="text-gray-500 text-center py-8">Žádné fotky v galerii.</p>}
      </div>
    </div>
  );
};

const MerchManager: React.FC = () => {
    const { products, addProduct, deleteProduct, isMerchEnabled, toggleMerch, merchOrders, updateMerchOrder, deleteMerchOrder } = useData();
    const [subTab, setSubTab] = useState<'orders' | 'products'>('orders');
    const [formData, setFormData] = useState({ name: '', price: '', description: '', image: '' });
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'pending' | 'paid' | 'completed' | 'cancelled'>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrderForQr, setSelectedOrderForQr] = useState<MerchOrder | null>(null);
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.name) return;
      addProduct(formData);
      setFormData({ name: '', price: '', description: '', image: '' });
    };

    const filteredOrders = useMemo(() => {
      return (merchOrders || []).filter(order => {
        const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
        const matchesSearch = !searchTerm || 
          order.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.variableSymbol && order.variableSymbol.includes(searchTerm));
        return matchesStatus && matchesSearch;
      });
    }, [merchOrders, statusFilter, searchTerm]);

    const pendingOrdersCount = useMemo(() => {
      return (merchOrders || []).filter(o => o.status === 'pending').length;
    }, [merchOrders]);

    const getStatusBadge = (status: MerchOrder['status']) => {
      switch (status) {
        case 'paid':
          return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">✅ Zaplaceno</span>;
        case 'completed':
          return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">📦 Předáno / Hotovo</span>;
        case 'cancelled':
          return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">❌ Zrušeno</span>;
        case 'pending':
        default:
          return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">⏳ Čeká na platbu</span>;
      }
    };
  
    return (
      <div className="space-y-6">
        {/* Navigation tabs between Orders and Catalog */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setSubTab('orders')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${subTab === 'orders' ? 'bg-brand-blue text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <ShoppingBag size={18} />
              <span>Objednávky z E-shopu</span>
              {pendingOrdersCount > 0 && (
                <span className="bg-brand-red text-white text-xs px-2 py-0.5 rounded-full font-extrabold">
                  {pendingOrdersCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setSubTab('products')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${subTab === 'products' ? 'bg-brand-blue text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <Plus size={18} />
              <span>Katalog produktů & Nastavení</span>
            </button>
          </div>

          {/* Visibility Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 font-medium">E-shop pro veřejnost:</span>
            <button 
              onClick={() => toggleMerch(!isMerchEnabled)}
              className={`flex items-center px-3 py-1.5 rounded-full text-xs font-bold transition-all ${isMerchEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
            >
              {isMerchEnabled ? <ToggleRight size={26} className="mr-1 text-green-600" /> : <ToggleLeft size={26} className="mr-1 text-gray-400" />}
              {isMerchEnabled ? 'Aktivní' : 'Vypnuto'}
            </button>
          </div>
        </div>

        {subTab === 'orders' ? (
          <div className="space-y-4">
            {/* Filter bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Hledat zákazníka, email, VS..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-gray-500 font-medium shrink-0">Stav:</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                  className="w-full sm:w-auto px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none bg-white"
                >
                  <option value="ALL">Všechny objednávky</option>
                  <option value="pending">⏳ Čeká na platbu</option>
                  <option value="paid">✅ Zaplaceno</option>
                  <option value="completed">📦 Předáno / Hotovo</option>
                  <option value="cancelled">❌ Zrušeno</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
                      <th className="px-5 py-3.5">Objednávka & Zboží</th>
                      <th className="px-5 py-3.5">Zákazník</th>
                      <th className="px-5 py-3.5">Cena & Platba</th>
                      <th className="px-5 py-3.5">Stav</th>
                      <th className="px-5 py-3.5 text-right">Akce</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                          Zatím nebyly nalezeny žádné objednávky z E-shopu.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map(order => (
                        <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-bold text-gray-900">{order.productName}</div>
                            <div className="text-xs text-gray-500">Velikost: <span className="font-semibold text-gray-700">{order.size}</span> • {order.quantity} ks</div>
                            <div className="text-xs text-gray-400 mt-1">Vytvořeno: {new Date(order.createdAt).toLocaleString('cs-CZ')}</div>
                            {order.deliveryNote && (
                              <div className="text-xs text-blue-800 bg-blue-50 px-2 py-1 rounded-lg mt-1.5 border border-blue-100">
                                📍 {order.deliveryNote}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-bold text-gray-900">{order.userName}</div>
                            <div className="text-xs text-gray-600">{order.userEmail}</div>
                            <div className="text-xs text-gray-600">{order.userPhone}</div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-extrabold text-brand-red text-base">{order.totalPrice} Kč</div>
                            <div className="text-xs text-gray-500">VS: <span className="font-bold text-gray-800">{order.variableSymbol}</span></div>
                            <button
                              onClick={() => setSelectedOrderForQr(order)}
                              className="text-xs text-brand-blue font-bold hover:underline mt-1 inline-flex items-center gap-1"
                            >
                              📲 Zobrazit QR platbu
                            </button>
                          </td>
                          <td className="px-5 py-4">
                            {getStatusBadge(order.status)}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {order.status !== 'paid' && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Označit objednávku ${order.variableSymbol} (${order.userName}) jako ZAPLACENOU? Zákazníkovi odejde potvrzovací email.`)) {
                                      updateMerchOrder(order.id, { status: 'paid' });
                                    }
                                  }}
                                  title="Označit jako zaplaceno (odešle se email)"
                                  className="px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-colors"
                                >
                                  Označit Zaplaceno
                                </button>
                              )}
                              {order.status === 'paid' && (
                                <button
                                  onClick={() => updateMerchOrder(order.id, { status: 'completed' })}
                                  title="Označit jako předáno zákazníkovi"
                                  className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
                                >
                                  Předat / Hotovo
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  if (confirm('Opravdu smazat tuto objednávku?')) {
                                    deleteMerchOrder(order.id);
                                  }
                                }}
                                title="Smazat objednávku"
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* QR Payment Inspection Modal */}
            {selectedOrderForQr && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white p-6 rounded-2xl max-w-sm w-full text-center relative shadow-2xl border border-gray-100">
                  <button 
                    onClick={() => setSelectedOrderForQr(null)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">QR Platba (Raiffeisenbank)</h3>
                  <p className="text-xs text-gray-500 mb-4">{selectedOrderForQr.userName} • {selectedOrderForQr.productName}</p>
                  
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`SPD*1.0*ACC:CZ6555000000000287413002*AM:${selectedOrderForQr.totalPrice.toFixed(2)}*CC:CZK*X-VS:${selectedOrderForQr.variableSymbol}*MSG:${encodeURIComponent(`Merch ${selectedOrderForQr.productName}`)}`)}`}
                    alt="QR kód"
                    className="w-48 h-48 mx-auto mb-4 border border-gray-200 rounded-xl p-2 bg-white"
                  />

                  <div className="text-left text-xs bg-gray-50 p-3 rounded-xl space-y-1 mb-4">
                    <div><strong>Číslo účtu:</strong> 287413002/5500</div>
                    <div><strong>Částka:</strong> {selectedOrderForQr.totalPrice} Kč</div>
                    <div><strong>Variabilní symbol:</strong> {selectedOrderForQr.variableSymbol}</div>
                    <div><strong>Stav:</strong> {selectedOrderForQr.status}</div>
                  </div>

                  <button
                    onClick={() => setSelectedOrderForQr(null)}
                    className="w-full py-2 bg-gray-900 text-white font-bold rounded-xl text-sm"
                  >
                    Zavřít
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-2xl shadow-md sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                   <Plus size={20} className="mr-2 text-brand-red" /> Přidat produkt
                </h3>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input 
                    className="w-full px-3 py-2 border rounded-lg text-sm" 
                    placeholder="Název produktu" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    required 
                  />
                  <input 
                    className="w-full px-3 py-2 border rounded-lg text-sm" 
                    placeholder="Cena (např. 450 Kč)" 
                    value={formData.price} 
                    onChange={e => setFormData({...formData, price: e.target.value})} 
                    required 
                  />
                  <textarea 
                    className="w-full px-3 py-2 border rounded-lg text-sm" 
                    placeholder="Popis produktu..." 
                    rows={3}
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                  />
                  <input 
                    className="w-full px-3 py-2 border rounded-lg text-sm" 
                    placeholder="URL obrázku" 
                    value={formData.image} 
                    onChange={e => setFormData({...formData, image: e.target.value})} 
                    required 
                  />
                  {formData.image && (
                       <div className="mt-2 rounded-lg overflow-hidden border border-gray-200">
                          <img src={formData.image} alt="Náhled" className="w-full h-32 object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                       </div>
                  )}
                  <button className="w-full bg-brand-blue text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-md">
                    Přidat produkt do nabídky
                  </button>
                </form>
              </div>
            </div>
    
            {/* List */}
            <div className="lg:col-span-2 space-y-4">
               {products.map(prod => (
                  <div key={prod.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-center">
                      <img src={prod.image} alt="" className="w-20 h-20 object-cover rounded-lg bg-gray-100" />
                      <div className="flex-grow">
                          <h4 className="font-bold text-gray-900">{prod.name}</h4>
                          <p className="text-brand-red font-bold text-sm">{prod.price}</p>
                          <p className="text-gray-500 text-sm line-clamp-1">{prod.description}</p>
                      </div>
                      <button 
                          onClick={() => { if(confirm('Opravdu smazat?')) deleteProduct(prod.id) }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                          <Trash2 size={20} />
                      </button>
                  </div>
               ))}
               {products.length === 0 && <p className="text-gray-500 text-center py-8">Žádné produkty v E-shopu.</p>}
            </div>
          </div>
        )}
      </div>
    );
};

const RegistrationManager: React.FC = () => {
  const { registrations, camps, updateRegistration, deleteRegistration } = useData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [campFilter, setCampFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [insuranceReg, setInsuranceReg] = useState<Registration | null>(null);
  const [deletingReg, setDeletingReg] = useState<Registration | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!deletingReg) return;
    try {
      setIsDeleting(true);
      await deleteRegistration(deletingReg.id);
      setDeletingReg(null);
    } catch (err) {
      console.error('Chyba při mazání přihlášky:', err);
      alert('Chyba při mazání přihlášky.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateStatus = (id: string, status: Registration['status']) => {
    updateRegistration(id, { status });
  };

  const handleSaveNote = (id: string) => {
    updateRegistration(id, { adminNote });
    setEditingId(null);
    setAdminNote('');
  };

  const filteredRegistrations = useMemo(() => {
    return registrations.filter(reg => {
      const camp = camps.find(c => c.id === reg.campId);
      const regVs = reg.variableSymbol || camp?.variableSymbol || '';
      const matchesSearch = 
        reg.childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.parentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.parentPhone.includes(searchTerm) ||
        regVs.includes(searchTerm) ||
        (camp?.title || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCamp = campFilter === 'ALL' || reg.campId === campFilter;
      const matchesStatus = statusFilter === 'ALL' || reg.status === statusFilter;

      return matchesSearch && matchesCamp && matchesStatus;
    });
  }, [registrations, camps, searchTerm, campFilter, statusFilter]);

  const handleExportCsv = () => {
    exportCampRegistrationsToCsv(filteredRegistrations, camps);
  };

  const getStatusBadge = (status: Registration['status']) => {
    switch (status) {
      case 'approved':
        return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center"><CheckCircleIcon size={12} className="mr-1" /> Schváleno</span>;
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Správa přihlášek (Letní tábory)</h2>
          <p className="text-sm text-gray-500">Zobrazeno {filteredRegistrations.length} z {registrations.length} přihlášek</p>
        </div>
        <button
          onClick={handleExportCsv}
          className="bg-brand-blue hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors flex items-center shadow-sm self-start sm:self-auto"
        >
          <Download size={16} className="mr-2" /> Export do Excelu (CSV)
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Hledat dítě, rodiče, telefon..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none"
          />
        </div>
        <select
          value={campFilter}
          onChange={(e) => setCampFilter(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none bg-white"
        >
          <option value="ALL">Všechny tábory</option>
          {camps.map(c => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none bg-white"
        >
          <option value="ALL">Všechny stavy</option>
          <option value="approved">Schváleno</option>
          <option value="pending_payment">Čeká na platbu</option>
          <option value="pending_approval">Čeká na schválení</option>
          <option value="action_required">Vyžadována akce</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Dítě / Tábor</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Rodič / Kontakt</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Dokumenty</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Akce</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">Nebyly nalezeny žádné přihlášky odpovídající filtrům.</td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => {
                  const camp = camps.find(c => c.id === reg.campId);
                  return (
                    <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{reg.childName}</div>
                        <div className="text-xs text-gray-500">{reg.childBirthDate}</div>
                        <div className="text-xs font-medium text-brand-blue mt-1">{camp?.title}</div>
                        {(reg.variableSymbol || camp?.variableSymbol) && (
                          <div className="text-[11px] text-gray-700 font-mono font-bold mt-0.5 bg-blue-50 px-1.5 py-0.5 rounded w-fit border border-blue-100">
                            VS: {reg.variableSymbol || camp?.variableSymbol}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{reg.parentName}</div>
                        <div className="text-xs text-gray-500">{reg.parentEmail}</div>
                        <div className="text-xs text-gray-500">{reg.parentPhone}</div>
                        <a 
                          href={`mailto:${reg.parentEmail}?subject=Olymp Dance - ${camp?.title}&body=Dobrý den,`}
                          className="inline-flex items-center mt-1 text-xs text-brand-blue hover:underline"
                        >
                          <Mail size={12} className="mr-1" /> Napsat email
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        {reg.documents && reg.documents.length > 0 ? (
                          <div className="space-y-1">
                            {reg.documents.map((doc, idx) => (
                              <a 
                                key={idx} 
                                href={doc} 
                                target="_blank" 
                                rel="noreferrer"
                                className="block text-xs text-brand-blue hover:underline truncate max-w-[150px]"
                                title={doc.split('/').pop() || 'Dokument'}
                              >
                                {doc.split('/').pop() || `Dokument ${idx + 1}`}
                              </a>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Nedodáno</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(reg.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button 
                              onClick={() => handleUpdateStatus(reg.id, 'approved')}
                              className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors"
                              title="Schválit"
                            >
                              <CheckCircleIcon size={16} />
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(reg.id, 'action_required')}
                              className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                              title="Vyžadovat akci"
                            >
                              <AlertCircle size={16} />
                            </button>
                            <button 
                              onClick={() => {
                                setEditingId(reg.id);
                                setAdminNote(reg.adminNote || '');
                              }}
                              className="p-1.5 bg-blue-100 text-brand-blue rounded hover:bg-blue-200 transition-colors"
                              title="Zpráva pro rodiče"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => setInsuranceReg(reg)}
                              className="p-1.5 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors"
                              title="Vystavit potvrzení pro pojišťovnu / FKSP"
                            >
                              <ShieldCheck size={16} />
                            </button>
                            <button
                              onClick={() => setDeletingReg(reg)}
                              className="p-1.5 bg-red-50 text-red-500 rounded hover:bg-red-100 hover:text-red-700 transition-colors"
                              title="Smazat přihlášku"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          
                          {editingId === reg.id && (
                            <div className="mt-2 space-y-2 bg-gray-50 p-2 rounded border border-gray-200">
                              <label className="text-[10px] font-bold text-gray-500 block mb-1">Zpráva pro rodiče (zobrazí se v portálu):</label>
                              <textarea 
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                className="w-full text-xs p-2 border border-gray-200 rounded outline-none focus:ring-1 focus:ring-brand-blue"
                                placeholder="Např: Prosím o doplnění dokumentu..."
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleSaveNote(reg.id)}
                                  className="text-[10px] bg-brand-blue text-white px-2 py-1 rounded font-bold"
                                >
                                  Odeslat zprávu
                                </button>
                                <button 
                                  onClick={() => setEditingId(null)}
                                  className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded font-bold"
                                >
                                  Zrušit
                                </button>
                              </div>
                            </div>
                          )}
                          
                          {reg.adminNote && editingId !== reg.id && (
                            <div className="text-[10px] bg-yellow-50 text-yellow-800 p-2 rounded border border-yellow-100 mt-1">
                              <span className="font-bold block mb-0.5">Zpráva pro rodiče:</span>
                              {reg.adminNote}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insurance Modal */}
      {insuranceReg && (
        <InsuranceConfirmationModal
          data={{
            childName: insuranceReg.childName,
            childBirthDate: insuranceReg.childBirthDate,
            parentName: insuranceReg.parentName,
            parentPhone: insuranceReg.parentPhone,
            parentEmail: insuranceReg.parentEmail,
            activityTitle: `Letní tábor: ${camps.find(c => c.id === insuranceReg.campId)?.title || 'Olymp Dance'}`,
            activityType: 'tabor',
            location: camps.find(c => c.id === insuranceReg.campId)?.location || 'Olomouc',
            periodOrDate: camps.find(c => c.id === insuranceReg.campId)?.date || 'Léto 2026',
            price: camps.find(c => c.id === insuranceReg.campId)?.price || '0 Kč',
            variableSymbol: camps.find(c => c.id === insuranceReg.campId)?.variableSymbol,
            paymentStatus: insuranceReg.status
          }}
          onClose={() => setInsuranceReg(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingReg}
        onClose={() => setDeletingReg(null)}
        onConfirm={handleConfirmDelete}
        title="Opravdu smazat přihlášku na tábor?"
        itemName={deletingReg ? `${deletingReg.childName} (${camps.find(c => c.id === deletingReg.campId)?.title || 'Tábor'})` : undefined}
        description="Přihláška bude trvale odstraněna ze systému i z databáze. Tuto akci nelze vzít zpět."
        isDeleting={isDeleting}
      />
    </div>
  );
};

const UserManager: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, schools } = useData();
  const [isAdding, setIsAdding] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [schoolSearchTerm, setSchoolSearchTerm] = useState('');
  const [formData, setFormData] = useState({ 
    username: '', 
    password: '', 
    role: 'trainer' as 'admin' | 'trainer', 
    name: '', 
    schoolIds: [] as string[] 
  });

  const handleStartAdd = () => {
    setEditingUserId(null);
    setFormData({ username: '', password: '', role: 'trainer', name: '', schoolIds: [] });
    setSchoolSearchTerm('');
    setIsAdding(true);
  };

  const handleStartEdit = (user: User) => {
    setEditingUserId(user.id);
    let assignedIds: string[] = [];
    if (user.schoolIds && user.schoolIds.length > 0) {
      assignedIds = [...user.schoolIds];
    } else if (user.schoolId) {
      assignedIds = [user.schoolId];
    }
    setFormData({
      username: user.username,
      password: user.password || '',
      role: user.role,
      name: user.name,
      schoolIds: assignedIds
    });
    setSchoolSearchTerm('');
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingUserId(null);
    setFormData({ username: '', password: '', role: 'trainer', name: '', schoolIds: [] });
    setSchoolSearchTerm('');
  };

  const handleToggleSchool = (schoolId: string) => {
    setFormData(prev => {
      const exists = prev.schoolIds.includes(schoolId);
      if (exists) {
        return { ...prev, schoolIds: prev.schoolIds.filter(id => id !== schoolId) };
      } else {
        return { ...prev, schoolIds: [...prev.schoolIds, schoolId] };
      }
    });
  };

  const handleSelectAllFilteredSchools = (filteredIds: string[]) => {
    setFormData(prev => {
      const combined = Array.from(new Set([...prev.schoolIds, ...filteredIds]));
      return { ...prev, schoolIds: combined };
    });
  };

  const handleDeselectAllSchools = () => {
    setFormData(prev => ({ ...prev, schoolIds: [] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.role === 'trainer' && formData.schoolIds.length === 0) {
      if (!confirm('Trenérovi nebyla přiřazena žádná škola. Chcete přesto pokračovat?')) {
        return;
      }
    }

    const payload = {
      username: formData.username,
      password: formData.password,
      role: formData.role,
      name: formData.name,
      schoolIds: formData.role === 'trainer' ? formData.schoolIds : [],
      schoolId: formData.role === 'trainer' && formData.schoolIds.length > 0 ? formData.schoolIds[0] : ''
    };

    if (editingUserId) {
      updateUser(editingUserId, payload);
    } else {
      addUser(payload);
    }

    handleCancel();
  };

  const filteredSchoolsForPicker = useMemo(() => {
    return schools.filter(s => 
      s.name.toLowerCase().includes(schoolSearchTerm.toLowerCase()) ||
      s.city.toLowerCase().includes(schoolSearchTerm.toLowerCase()) ||
      s.day.toLowerCase().includes(schoolSearchTerm.toLowerCase())
    );
  }, [schools, schoolSearchTerm]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Správa uživatelů a trenérů</h2>
          <p className="text-sm text-gray-500">Vytvářejte účty pro trenéry a přiřazujte jim jednu nebo více škol</p>
        </div>
        {!isAdding && (
          <button 
            onClick={handleStartAdd}
            className="bg-brand-blue text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors flex items-center shadow-sm"
          >
            <Plus size={16} className="mr-2" /> Přidat nového uživatele
          </button>
        )}
      </div>

      {isAdding && (
        <div className="p-6 bg-gray-50/80 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              {editingUserId ? <Edit2 size={18} className="mr-2 text-brand-blue" /> : <Plus size={18} className="mr-2 text-brand-blue" />}
              {editingUserId ? 'Upravit uživatele' : 'Přidat nového uživatele'}
            </h3>
            <button 
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Jméno a příjmení</label>
                <input 
                  type="text" 
                  placeholder="např. Jan Novák" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue text-sm" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Přihlašovací jméno (login)</label>
                <input 
                  type="text" 
                  placeholder="např. novak" 
                  value={formData.username} 
                  onChange={e => setFormData({...formData, username: e.target.value})} 
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue text-sm" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Heslo</label>
                <input 
                  type="text" 
                  placeholder="Zadejte heslo" 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue text-sm font-mono" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Role uživatele</label>
                <select 
                  value={formData.role} 
                  onChange={e => setFormData({...formData, role: e.target.value as any})} 
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue text-sm font-medium"
                >
                  <option value="trainer">Trenér / Trenérka (Docházka)</option>
                  <option value="admin">Administrátor (Plný přístup)</option>
                </select>
              </div>
            </div>

            {/* School Multi-selection for Trainers */}
            {formData.role === 'trainer' && (
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-2 border-b border-gray-100">
                  <div>
                    <span className="font-bold text-gray-900 text-sm flex items-center">
                      <SchoolIcon size={16} className="mr-1.5 text-brand-blue" />
                      Přiřadit školy trenérovi ({formData.schoolIds.length} vybráno)
                    </span>
                    <p className="text-xs text-gray-500">Trenér po přihlášení uvidí přehled svých škol a může mezi nimi jednoduše přepínat.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectAllFilteredSchools(filteredSchoolsForPicker.map(s => s.id))}
                      className="text-xs bg-blue-50 text-brand-blue font-bold px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      Vybrat zobrazené
                    </button>
                    <button
                      type="button"
                      onClick={handleDeselectAllSchools}
                      className="text-xs bg-gray-100 text-gray-600 font-bold px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Odznačit vše
                    </button>
                  </div>
                </div>

                {/* Filter in schools picker */}
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Vyhledat školu podle názvu, města nebo dne..."
                    value={schoolSearchTerm}
                    onChange={e => setSchoolSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>

                {/* Schools Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                  {filteredSchoolsForPicker.map(s => {
                    const isSelected = formData.schoolIds.includes(s.id);
                    return (
                      <div
                        key={s.id}
                        onClick={() => handleToggleSchool(s.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 select-none ${
                          isSelected 
                            ? 'bg-blue-50/70 border-brand-blue text-gray-900 shadow-xs' 
                            : 'bg-gray-50/60 border-gray-200 text-gray-700 hover:bg-gray-100/80'
                        }`}
                      >
                        <div className="pt-0.5">
                          {isSelected ? (
                            <CheckSquare size={18} className="text-brand-blue" />
                          ) : (
                            <Square size={18} className="text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-xs truncate block">{s.name}</span>
                            {s.isKindergarten && (
                              <span className="text-[9px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.2 rounded shrink-0">MŠ</span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5 flex items-center">
                            <Clock size={11} className="mr-1 inline" /> {s.day} {s.time}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{s.city}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button 
                type="submit" 
                className="bg-brand-red hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm flex items-center"
              >
                <Save size={16} className="mr-2" />
                {editingUserId ? 'Uložit změny' : 'Vytvořit uživatele'}
              </button>
              <button 
                type="button" 
                onClick={handleCancel}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors"
              >
                Zrušit
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="py-3 px-4 font-bold text-gray-500 text-xs uppercase">Jméno</th>
                <th className="py-3 px-4 font-bold text-gray-500 text-xs uppercase">Login</th>
                <th className="py-3 px-4 font-bold text-gray-500 text-xs uppercase">Heslo</th>
                <th className="py-3 px-4 font-bold text-gray-500 text-xs uppercase">Role</th>
                <th className="py-3 px-4 font-bold text-gray-500 text-xs uppercase">Přiřazené školy</th>
                <th className="py-3 px-4 font-bold text-gray-500 text-xs uppercase text-right">Akce</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400 text-sm">Žádní uživatelé. Klikněte na tlačítko výše pro přidání.</td>
                </tr>
              ) : (
                users.map(user => {
                  let userSchoolIds: string[] = [];
                  if (user.schoolIds && user.schoolIds.length > 0) {
                    userSchoolIds = user.schoolIds;
                  } else if (user.schoolId) {
                    userSchoolIds = [user.schoolId];
                  }
                  const userSchools = schools.filter(s => userSchoolIds.includes(s.id));

                  return (
                    <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-gray-900 text-sm">{user.name}</td>
                      <td className="py-3.5 px-4 text-gray-600 text-sm font-medium">{user.username}</td>
                      <td className="py-3.5 px-4 text-gray-500 font-mono text-xs">{user.password || '••••••••'}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center ${
                          user.role === 'admin' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {user.role === 'admin' ? 'Administrátor' : 'Trenér/ka'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-sm">
                        {user.role === 'admin' ? (
                          <span className="text-gray-400 text-xs italic">Všechny pravomoci (Admin)</span>
                        ) : userSchools.length === 0 ? (
                          <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-xs font-bold">Žádná škola nepřiřazena</span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-md">
                            <span className="bg-brand-blue/10 text-brand-blue font-bold px-2 py-0.5 rounded text-xs">
                              {userSchools.length} {userSchools.length === 1 ? 'škola' : userSchools.length < 5 ? 'školy' : 'škol'}
                            </span>
                            {userSchools.slice(0, 3).map(s => (
                              <span key={s.id} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs truncate max-w-[150px]" title={`${s.name} (${s.day})`}>
                                {s.name}
                              </span>
                            ))}
                            {userSchools.length > 3 && (
                              <span className="text-xs text-gray-500 font-medium self-center">
                                +{userSchools.length - 3} dalších
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => handleStartEdit(user)} 
                            className="p-1.5 text-gray-400 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-colors"
                            title="Upravit uživatele a školy"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm(`Opravdu chcete smazat uživatele ${user.name}?`)) {
                                deleteUser(user.id);
                              }
                            }} 
                            className="p-1.5 text-gray-400 hover:text-brand-red hover:bg-red-50 rounded-lg transition-colors"
                            title="Smazat uživatele"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const AttendanceManager: React.FC<{ currentUser: User | null }> = ({ currentUser }) => {
  const { schools, schoolRegistrations, attendance, updateAttendance, updateSchool, excuses } = useData();
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [expandedInfo, setExpandedInfo] = useState<string | null>(null);
  const [showPrintSheet, setShowPrintSheet] = useState(false);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [editingDatesSchool, setEditingDatesSchool] = useState<School | null>(null);

  // Extract all assigned schools for this trainer
  const assignedSchools = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return schools; // Admins can view all schools

    let assignedIds: string[] = [];
    if (currentUser.schoolIds && currentUser.schoolIds.length > 0) {
      assignedIds = currentUser.schoolIds;
    } else if (currentUser.schoolId) {
      assignedIds = [currentUser.schoolId];
    }
    return schools.filter(s => assignedIds.includes(s.id));
  }, [currentUser, schools]);

  // Active selected school object
  const activeSchool = useMemo(() => {
    if (!selectedSchoolId) return null;
    return schools.find(s => s.id === selectedSchoolId) || null;
  }, [selectedSchoolId, schools]);

  const students = useMemo(() => {
    if (!selectedSchoolId) return [];
    return schoolRegistrations.filter(r => r.schoolId === selectedSchoolId && r.status !== 'cancelled');
  }, [schoolRegistrations, selectedSchoolId]);

  const filteredStudents = useMemo(() => {
    if (!studentSearchTerm.trim()) return students;
    return students.filter(s => 
      s.childName.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      (s.childSurname && s.childSurname.toLowerCase().includes(studentSearchTerm.toLowerCase())) ||
      s.parentName.toLowerCase().includes(studentSearchTerm.toLowerCase())
    );
  }, [students, studentSearchTerm]);

  const currentAttendance = useMemo(() => {
    if (!selectedSchoolId) return null;
    return attendance.find(a => a.schoolId === selectedSchoolId && a.date === selectedDate);
  }, [attendance, selectedSchoolId, selectedDate]);

  const records = currentAttendance?.records || {};

  const handleToggle = (studentId: string, isPresent: boolean) => {
    if (!selectedSchoolId) return;
    const newRecords = { ...records, [studentId]: isPresent };
    updateAttendance(selectedSchoolId, selectedDate, newRecords);
  };

  const handleMarkAllPresent = () => {
    if (!selectedSchoolId) return;
    const newRecords: Record<string, boolean> = { ...records };
    students.forEach(s => {
      newRecords[s.id] = true;
    });
    updateAttendance(selectedSchoolId, selectedDate, newRecords);
  };

  const handleResetAttendance = () => {
    if (!selectedSchoolId) return;
    if (confirm('Opravdu chcete vyresetovat záznamy docházky pro tento den?')) {
      updateAttendance(selectedSchoolId, selectedDate, {});
    }
  };

  // If no schools assigned at all
  if (assignedSchools.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Zatím nemáte přiřazenou žádnou školu</h2>
        <p className="text-gray-500 text-sm mb-6">
          Administrátor vám zatím nepřiřadil žádné taneční kroužky. Požádejte prosím vedení klubu o přiřazení vašich škol.
        </p>
      </div>
    );
  }

  // --- SCREEN 1: SCHOOL SELECTION SCREEN (HUB) ---
  if (!selectedSchoolId || !activeSchool) {
    return (
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-brand-blue to-blue-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-xs font-bold text-blue-100 mb-3 backdrop-blur-xs">
              <Sparkles size={14} className="mr-1.5" /> Portál trenéra Olymp Dance
            </span>
            <h2 className="text-2xl sm:text-3xl font-black">
              Vítejte, {currentUser?.name}!
            </h2>
            <p className="text-blue-100 text-sm sm:text-base mt-1 max-w-2xl">
              Máte přiřazeno celkem <strong>{assignedSchools.length} {assignedSchools.length === 1 ? 'školu / kroužek' : assignedSchools.length < 5 ? 'školy / kroužky' : 'škol / kroužků'}</strong>. Vyberte školu, pro kterou chcete spravovat docházku žáků.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 opacity-10 pointer-events-none">
            <SchoolIcon size={240} />
          </div>
        </div>

        {/* School Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {assignedSchools.map(school => {
            const enrolledStudents = schoolRegistrations.filter(r => r.schoolId === school.id && r.status !== 'cancelled');
            const todayStr = new Date().toISOString().split('T')[0];
            const todayExcuses = excuses.filter(e => e.schoolId === school.id && e.date === todayStr);

            return (
              <div 
                key={school.id}
                onClick={() => setSelectedSchoolId(school.id)}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-blue/50 transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-brand-blue flex items-center">
                      <MapPin size={12} className="mr-1" /> {school.city}
                    </span>
                    {school.isKindergarten && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        Mateřská škola
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-lg text-gray-900 group-hover:text-brand-blue transition-colors">
                    {school.name}
                  </h3>

                  <div className="space-y-1.5 text-xs text-gray-600">
                    <p className="flex items-center font-medium text-gray-800">
                      <Calendar size={14} className="mr-2 text-brand-red shrink-0" />
                      {school.day} &bull; {school.time}
                    </p>
                    <p className="flex items-center text-gray-500">
                      <UsersIcon size={14} className="mr-2 text-gray-400 shrink-0" />
                      <strong>{enrolledStudents.length}</strong> {enrolledStudents.length === 1 ? 'přihlášené dítě' : enrolledStudents.length < 5 ? 'přihlášené děti' : 'přihlášených dětí'}
                    </p>
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="flex items-center text-gray-500">
                        <Calendar size={13} className="mr-1 text-brand-blue" />
                        Termíny: <strong className="ml-1 text-gray-800">{(school.trainingDates || []).filter(Boolean).length}/14</strong>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingDatesSchool(school);
                        }}
                        className="px-2 py-0.5 text-[11px] font-bold text-brand-blue bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors"
                        title="Nastavit a upravit data tréninků"
                      >
                        {(school.trainingDates || []).filter(Boolean).length > 0 ? 'Upravit data' : '+ Zadat data'}
                      </button>
                    </div>
                  </div>

                  {todayExcuses.length > 0 && (
                    <div className="p-2 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700 font-bold flex items-center">
                      <AlertCircle size={14} className="mr-1.5 shrink-0" />
                      {todayExcuses.length} {todayExcuses.length === 1 ? 'omluvenka na dnešek' : 'omluvenky na dnešek'}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-blue flex items-center group-hover:translate-x-1 transition-transform">
                    Otevřít docházku <ArrowRight size={14} className="ml-1" />
                  </span>
                  <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-brand-blue group-hover:text-white text-gray-500 flex items-center justify-center transition-colors">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {editingDatesSchool && (
          <TrainingDatesModal
            school={editingDatesSchool}
            onClose={() => setEditingDatesSchool(null)}
            onSave={(trainingDates) => {
              updateSchool(editingDatesSchool.id, { trainingDates });
              setEditingDatesSchool(null);
            }}
          />
        )}
      </div>
    );
  }

  // --- SCREEN 2: ACTIVE SCHOOL ATTENDANCE VIEW ---
  // Count stats
  const presentCount = students.filter(s => records[s.id] === true).length;
  const absentCount = students.filter(s => records[s.id] === false).length;
  const unmarkedCount = students.filter(s => records[s.id] === undefined).length;
  const excusedCount = students.filter(s => {
    return excuses.some(e => e.registrationId === s.id && e.date === selectedDate);
  }).length;

  return (
    <div className="space-y-6">
      {/* TOP NAVIGATION & SCHOOL SWITCHER BAR */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSelectedSchoolId(null)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center transition-colors shadow-xs"
            title="Zpět na přehled všech mých škol"
          >
            <ArrowLeft size={16} className="mr-1.5 text-brand-blue" />
            Všechny mé školy
          </button>
          
          {/* Direct switcher dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-gray-400 hidden md:inline">Přepnout školu:</span>
            <select
              value={selectedSchoolId}
              onChange={(e) => setSelectedSchoolId(e.target.value)}
              className="bg-blue-50 border border-blue-200 text-brand-blue font-bold text-xs py-2 px-3 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue cursor-pointer max-w-[220px] sm:max-w-xs truncate"
            >
              {assignedSchools.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.day} {s.time})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          <button
            onClick={() => setEditingDatesSchool(activeSchool)}
            className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-brand-blue text-xs font-bold transition-colors flex items-center border border-blue-200 shadow-xs"
            title="Nastavit a spravovat termíny tréninků (14 lekcí)"
          >
            <Calendar size={15} className="mr-1.5" />
            Termíny tréninků ({(activeSchool.trainingDates || []).filter(Boolean).length}/14)
          </button>
          <button
            onClick={() => setShowPrintSheet(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-colors flex items-center border border-purple-200 shadow-xs"
          >
            <Printer size={15} className="mr-1.5" /> Tisk listiny (PDF)
          </button>
        </div>
      </div>

      {/* ACTIVE SCHOOL MAIN ATTENDANCE CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header with School Details and Date picker */}
        <div className="p-6 bg-gradient-to-r from-brand-blue to-blue-900 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/20 font-bold backdrop-blur-xs">
                {activeSchool.city}
              </span>
              {activeSchool.isKindergarten && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 font-bold">
                  Mateřská škola
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black">{activeSchool.name}</h2>
            <p className="text-blue-100 text-sm font-medium mt-0.5 flex items-center">
              <Clock size={14} className="mr-1.5" />
              {activeSchool.day} {activeSchool.time} &bull; Cena: {activeSchool.price}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-white/10 p-2 rounded-2xl backdrop-blur-xs border border-white/20">
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-colors ${
                selectedDate === new Date().toISOString().split('T')[0]
                  ? 'bg-white text-brand-blue shadow-xs'
                  : 'text-white/80 hover:bg-white/20'
              }`}
            >
              Dnes
            </button>
            <div className="flex items-center space-x-2 bg-white/20 px-3 py-1.5 rounded-xl">
              <Calendar size={15} className="text-white" />
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none outline-none text-white font-bold text-xs"
              />
            </div>
          </div>
        </div>

        {/* Quick Lesson Selector from set training dates */}
        {activeSchool.trainingDates && activeSchool.trainingDates.some(Boolean) && (
          <div className="p-3 bg-blue-50/70 border-b border-blue-100 flex items-center gap-1.5 overflow-x-auto text-xs py-2 px-4 scrollbar-thin">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider shrink-0 mr-1 flex items-center">
              <Calendar size={12} className="mr-1 text-brand-blue" />
              Vybrat lekci:
            </span>
            {activeSchool.trainingDates.map((dStr, idx) => {
              if (!dStr) return null;
              const isCurrent = selectedDate === dStr;
              const parts = dStr.split('-');
              const day = parseInt(parts[2], 10);
              const month = parseInt(parts[1], 10);
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(dStr)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-all ${
                    isCurrent
                      ? 'bg-brand-blue text-white shadow-xs'
                      : 'bg-white text-gray-700 hover:bg-blue-100 border border-gray-200'
                  }`}
                  title={`${idx + 1}. lekce: ${dStr}`}
                >
                  {idx + 1}. ({day}.{month}.)
                </button>
              );
            })}
          </div>
        )}

        {/* Stats & Quick Action Bar */}
        <div className="p-4 sm:p-5 bg-gray-50 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* Stats Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="bg-white border border-gray-200 px-3 py-1.5 rounded-xl text-gray-700 shadow-xs">
              Celkem: <strong>{students.length}</strong>
            </span>
            <span className="bg-green-100 border border-green-200 text-green-800 px-3 py-1.5 rounded-xl flex items-center shadow-xs">
              <Check size={13} className="mr-1" /> Přítomno: <strong>{presentCount}</strong>
            </span>
            <span className="bg-red-100 border border-red-200 text-red-800 px-3 py-1.5 rounded-xl flex items-center shadow-xs">
              <XIcon size={13} className="mr-1" /> Nepřítomno: <strong>{absentCount}</strong>
            </span>
            {excusedCount > 0 && (
              <span className="bg-amber-100 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-xl shadow-xs">
                Omluveno: <strong>{excusedCount}</strong>
              </span>
            )}
            {unmarkedCount > 0 && (
              <span className="bg-gray-200 text-gray-600 px-3 py-1.5 rounded-xl">
                Neoznačeno: <strong>{unmarkedCount}</strong>
              </span>
            )}
          </div>

          {/* Quick Mark Buttons */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              onClick={handleMarkAllPresent}
              className="text-xs bg-green-600 hover:bg-green-700 text-white font-bold px-3.5 py-1.5 rounded-xl transition-colors flex items-center shadow-xs"
            >
              <Check size={14} className="mr-1" /> Všichni přítomni
            </button>
            <button
              onClick={handleResetAttendance}
              className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-600 font-bold px-2.5 py-1.5 rounded-xl transition-colors flex items-center"
              title="Vynulovat docházku pro tento den"
            >
              <RotateCcw size={13} className="mr-1" /> Reset
            </button>
          </div>
        </div>

        {/* Search input for students */}
        {students.length > 5 && (
          <div className="px-6 pt-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Hledat žáka podle jména nebo příjmení..."
                value={studentSearchTerm}
                onChange={e => setStudentSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>
        )}

        {/* Students List */}
        <div className="p-6">
          {students.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Users size={40} className="mx-auto mb-2 text-gray-300" />
              <p className="font-bold">V této škole zatím nejsou žádní přihlášení žáci.</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <p className="text-center py-8 text-gray-400 text-sm">Hledanému výrazu neodpovídá žádný žák.</p>
          ) : (
            <div className="space-y-3">
              {filteredStudents.map(student => {
                const isPresent = records[student.id];
                const excuse = excuses.find(e => e.registrationId === student.id && e.date === selectedDate);

                return (
                  <div 
                    key={student.id} 
                    className={`flex flex-col p-4 border rounded-2xl transition-all ${
                      isPresent === true
                        ? 'bg-green-50/40 border-green-200'
                        : isPresent === false
                        ? 'bg-red-50/40 border-red-200'
                        : 'bg-white border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-gray-900 text-base">
                            {student.childName} {student.childSurname || ''}
                          </h3>
                          <button 
                            onClick={() => setExpandedInfo(expandedInfo === student.id ? null : student.id)}
                            className={`p-1 rounded-lg transition-colors ${expandedInfo === student.id ? 'bg-blue-100 text-brand-blue' : 'text-gray-400 hover:text-brand-blue hover:bg-gray-100'}`}
                            title="Kontakt na rodiče"
                          >
                            <Info size={16} />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {student.childClass && (
                            <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-bold">
                              Třída: {student.childClass}
                            </span>
                          )}
                          {student.afterSchoolClub && (
                            <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold">
                              Školní družina
                            </span>
                          )}
                          {student.childPhone && (
                            <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
                              Tel. dítěte: {student.childPhone}
                            </span>
                          )}
                        </div>

                        {excuse && (
                          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
                            <span className="font-bold text-amber-800">Omluvenka od rodiče:</span> {excuse.reason}
                          </div>
                        )}
                      </div>

                      {/* Presence toggle buttons */}
                      <div className="flex items-center space-x-2 shrink-0">
                        <button 
                          onClick={() => handleToggle(student.id, true)}
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-all ${
                            isPresent === true 
                              ? 'bg-green-500 text-white shadow-md scale-105' 
                              : 'bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600'
                          }`}
                          title="Označit jako přítomen"
                        >
                          <Check size={24} />
                        </button>
                        <button 
                          onClick={() => handleToggle(student.id, false)}
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-all ${
                            isPresent === false 
                              ? 'bg-red-500 text-white shadow-md scale-105' 
                              : 'bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600'
                          }`}
                          title="Označit jako nepřítomen"
                        >
                          <XIcon size={24} />
                        </button>
                      </div>
                    </div>

                    {/* Expandable parent contact drawer */}
                    {expandedInfo === student.id && (
                      <div className="mt-3 p-3.5 bg-blue-50/80 border border-blue-100 rounded-xl text-xs space-y-1.5 animate-fadeIn">
                        <div className="flex justify-between items-center pb-1 border-b border-blue-100">
                          <span className="font-bold text-blue-900">Kontaktní údaje rodiče</span>
                          <span className="text-gray-500 text-[10px]">Přihlášeno: {new Date(student.createdAt).toLocaleDateString('cs-CZ')}</span>
                        </div>
                        <p><span className="font-bold text-gray-700">Jméno rodiče:</span> {student.parentName}</p>
                        <p className="flex items-center">
                          <span className="font-bold text-gray-700 mr-1.5">Telefon:</span>
                          <a href={`tel:${student.parentPhone}`} className="text-brand-blue font-bold hover:underline flex items-center">
                            <Phone size={12} className="mr-1" /> {student.parentPhone}
                          </a>
                        </p>
                        <p className="flex items-center">
                          <span className="font-bold text-gray-700 mr-1.5">E-mail:</span>
                          <a href={`mailto:${student.parentEmail}`} className="text-brand-blue hover:underline flex items-center">
                            <Mail size={12} className="mr-1" /> {student.parentEmail}
                          </a>
                        </p>
                        {student.parentAddress && (
                          <p><span className="font-bold text-gray-700">Adresa:</span> {student.parentAddress}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM SWITCHER BAR (DOLE) */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <span className="font-bold text-gray-900 text-sm block">Rychlý přechod na další školu</span>
          <span className="text-xs text-gray-500">Můžete se kdykoliv vrátit na přehled všech škol nebo přepnout přímo.</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedSchoolId(null)}
            className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors flex items-center"
          >
            <ArrowLeft size={14} className="mr-1.5 text-brand-blue" />
            Zpět na výběr mých škol
          </button>
          {assignedSchools
            .filter(s => s.id !== selectedSchoolId)
            .slice(0, 3)
            .map(s => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedSchoolId(s.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-brand-blue text-xs font-bold transition-colors truncate max-w-[180px]"
                title={`Přejít na ${s.name}`}
              >
                {s.name}
              </button>
            ))}
        </div>
      </div>

      {/* Modal for Printing Attendance Sheet */}
      {showPrintSheet && activeSchool && (
        <AttendanceSheetModal
          school={activeSchool}
          registrations={students}
          onClose={() => setShowPrintSheet(false)}
        />
      )}

      {/* Modal for Setting Training Dates (14 sessions) */}
      {editingDatesSchool && (
        <TrainingDatesModal
          school={editingDatesSchool}
          onClose={() => setEditingDatesSchool(null)}
          onSave={(trainingDates) => {
            updateSchool(editingDatesSchool.id, { trainingDates });
            setEditingDatesSchool(null);
          }}
        />
      )}
    </div>
  );
};

// --- SchoolRegistrationManager ---

const SchoolRegistrationManager: React.FC = () => {
  const { schoolRegistrations, schools, updateSchoolRegistration, deleteSchoolRegistration, excuses } = useData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [showHistoryFor, setShowHistoryFor] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedSchoolForSheet, setSelectedSchoolForSheet] = useState<School | null>(null);
  const [insuranceReg, setInsuranceReg] = useState<SchoolRegistration | null>(null);
  const [deletingReg, setDeletingReg] = useState<SchoolRegistration | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!deletingReg) return;
    try {
      setIsDeleting(true);
      await deleteSchoolRegistration(deletingReg.id);
      setDeletingReg(null);
    } catch (err) {
      console.error('Chyba při mazání přihlášky na kroužek:', err);
      alert('Chyba při mazání přihlášky.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateStatus = (id: string, status: SchoolRegistration['status']) => {
    updateSchoolRegistration(id, { status });
  };

  const handleSaveNote = (id: string) => {
    updateSchoolRegistration(id, { adminNote });
    setEditingId(null);
    setAdminNote('');
  };

  const filteredRegistrations = useMemo(() => {
    return schoolRegistrations.filter(reg => {
      const school = schools.find(s => s.id === reg.schoolId);
      const regVs = reg.variableSymbol || '';
      const matchesSearch = 
        reg.childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.parentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.parentPhone.includes(searchTerm) ||
        regVs.includes(searchTerm) ||
        (school?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (school?.city || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSchool = schoolFilter === 'ALL' || reg.schoolId === schoolFilter;
      const matchesStatus = statusFilter === 'ALL' || reg.status === statusFilter;

      return matchesSearch && matchesSchool && matchesStatus;
    });
  }, [schoolRegistrations, schools, searchTerm, schoolFilter, statusFilter]);

  const handleExportCsv = () => {
    exportSchoolRegistrationsToCsv(filteredRegistrations, schools);
  };

  const getStatusBadge = (status: SchoolRegistration['status']) => {
    switch (status) {
      case 'approved':
        return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center"><CheckCircleIcon size={12} className="mr-1" /> Schváleno</span>;
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Správa přihlášek (Kroužky)</h2>
          <p className="text-sm text-gray-500">Zobrazeno {filteredRegistrations.length} z {schoolRegistrations.length} přihlášek</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {schoolFilter !== 'ALL' && (
            <button
              onClick={() => {
                const s = schools.find(item => item.id === schoolFilter);
                if (s) setSelectedSchoolForSheet(s);
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors flex items-center shadow-sm"
            >
              <Printer size={16} className="mr-2" /> Prezenční listina
            </button>
          )}
          <button
            onClick={handleExportCsv}
            className="bg-brand-blue hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors flex items-center shadow-sm"
          >
            <Download size={16} className="mr-2" /> Export do Excelu (CSV)
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Hledat žáka, školu, město..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none"
          />
        </div>
        <select
          value={schoolFilter}
          onChange={(e) => setSchoolFilter(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none bg-white"
        >
          <option value="ALL">Všechny školy a pobočky</option>
          {schools.map(s => (
            <option key={s.id} value={s.id}>{s.name} ({s.city})</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none bg-white"
        >
          <option value="ALL">Všechny stavy</option>
          <option value="approved">Schváleno</option>
          <option value="pending_payment">Čeká na platbu</option>
          <option value="pending_approval">Čeká na schválení</option>
          <option value="action_required">Vyžadována akce</option>
          <option value="cancelled">Odhlášeno</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Dítě / Škola</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Rodič / Kontakt</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Omluvenky / Historie</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Akce</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">Nebyly nalezeny žádné přihlášky na kroužky.</td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => {
                  const school = schools.find(s => s.id === reg.schoolId);
                  const regExcuses = excuses.filter(e => e.registrationId === reg.id);
                  return (
                    <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{reg.childName}</div>
                        <div className="text-xs text-gray-500">{reg.childBirthDate} {reg.childPhone && `• ${reg.childPhone}`}</div>
                        <div className="text-xs font-medium text-brand-blue mt-1">{school?.name} - {school?.city}</div>
                        {reg.variableSymbol && (
                          <div className="text-[11px] text-gray-700 font-mono font-bold mt-0.5 bg-blue-50 px-1.5 py-0.5 rounded w-fit border border-blue-100">
                            VS: {reg.variableSymbol}
                          </div>
                        )}
                        {reg.afterSchoolClub && (
                           <div className="mt-1"><span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold">Školní družina</span></div>
                        )}
                        {reg.status === 'cancelled' && (
                          <div className="mt-2 text-xs font-bold text-red-600 bg-red-50 p-1 rounded inline-block">
                            ⚠️ DÍTĚ BYLO ODHLÁŠENO
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{reg.parentName}</div>
                        <div className="text-xs text-gray-500">{reg.parentEmail}</div>
                        <div className="text-xs text-gray-500">{reg.parentPhone}</div>
                        <a 
                          href={`mailto:${reg.parentEmail}?subject=Olymp Dance - ${school?.name}&body=Dobrý den,`}
                          className="inline-flex items-center mt-1 text-xs text-brand-blue hover:underline"
                        >
                          <Mail size={12} className="mr-1" /> Napsat email
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(reg.status)}
                      </td>
                      <td className="px-6 py-4">
                         <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
                            {regExcuses.length > 0 ? (
                                regExcuses.map(exc => (
                                    <div key={exc.id} className="bg-yellow-50 text-yellow-800 p-1 rounded border border-yellow-100">
                                        <span className="font-bold">{exc.date}</span>: {exc.reason}
                                    </div>
                                ))
                            ) : (
                                <span className="text-gray-400">Žádné omluvenky</span>
                            )}
                         </div>
                         <button 
                           onClick={() => setShowHistoryFor(showHistoryFor === reg.id ? null : reg.id)} 
                           className="text-xs text-brand-blue font-bold hover:underline mt-2 flex items-center"
                         >
                            <Clock size={12} className="mr-1"/> Historie změn
                         </button>
                         {showHistoryFor === reg.id && (
                           <div className="mt-2 text-[10px] space-y-1 bg-gray-100 p-2 rounded max-h-40 overflow-y-auto">
                             {reg.history && reg.history.length > 0 ? (
                                reg.history.map((h, i) => (
                                  <div key={i} className="border-b border-gray-200 pb-1 last:border-0 last:pb-0">
                                    <span className="text-gray-500 block">{new Date(h.date).toLocaleString('cs-CZ')}</span>
                                    <span className="font-medium">{h.message}</span>
                                  </div>
                                ))
                             ) : (
                                <span className="text-gray-500">Žádná historie.</span>
                             )}
                           </div>
                         )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button 
                              onClick={() => handleUpdateStatus(reg.id, 'approved')}
                              className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors"
                              title="Schválit"
                            >
                              <CheckCircleIcon size={16} />
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(reg.id, 'action_required')}
                              className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                              title="Vyžadovat akci"
                            >
                              <AlertCircle size={16} />
                            </button>
                            <button 
                              onClick={() => {
                                setEditingId(reg.id);
                                setAdminNote(reg.adminNote || '');
                              }}
                              className="p-1.5 bg-blue-100 text-brand-blue rounded hover:bg-blue-200 transition-colors"
                              title="Zpráva pro rodiče (zobrazí se v portálu)"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => setInsuranceReg(reg)}
                              className="p-1.5 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors"
                              title="Vystavit potvrzení pro pojišťovnu / FKSP"
                            >
                              <ShieldCheck size={16} />
                            </button>
                            <button
                              onClick={() => setDeletingReg(reg)}
                              className="p-1.5 bg-red-50 text-red-500 rounded hover:bg-red-100 hover:text-red-700 transition-colors"
                              title="Smazat přihlášku"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          
                          {editingId === reg.id && (
                            <div className="mt-2 space-y-2 bg-gray-50 p-2 rounded border border-gray-200">
                              <label className="text-[10px] font-bold text-gray-500 block mb-1">Zpráva pro rodiče (zobrazí se v portálu):</label>
                              <textarea 
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                className="w-full text-xs p-2 border border-gray-200 rounded outline-none focus:ring-1 focus:ring-brand-blue"
                                placeholder="Např: Prosím o doplnění dokumentu..."
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleSaveNote(reg.id)}
                                  className="text-[10px] bg-brand-blue text-white px-2 py-1 rounded font-bold"
                                >
                                  Odeslat zprávu
                                </button>
                                <button 
                                  onClick={() => setEditingId(null)}
                                  className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded font-bold"
                                >
                                  Zrušit
                                </button>
                              </div>
                            </div>
                          )}
                          
                          {reg.adminNote && editingId !== reg.id && (
                            <div className="text-[10px] bg-yellow-50 text-yellow-800 p-2 rounded border border-yellow-100 mt-1">
                              <span className="font-bold block mb-0.5">Zpráva pro rodiče:</span>
                              {reg.adminNote}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sheet Modal */}
      {selectedSchoolForSheet && (
        <AttendanceSheetModal
          school={selectedSchoolForSheet}
          registrations={schoolRegistrations.filter(r => r.schoolId === selectedSchoolForSheet.id)}
          onClose={() => setSelectedSchoolForSheet(null)}
        />
      )}

      {/* Insurance Modal */}
      {insuranceReg && (
        <InsuranceConfirmationModal
          data={{
            childName: insuranceReg.childName,
            childBirthDate: insuranceReg.childBirthDate,
            parentName: insuranceReg.parentName,
            parentPhone: insuranceReg.parentPhone,
            parentEmail: insuranceReg.parentEmail,
            activityTitle: `Taneční kroužek: ${schools.find(s => s.id === insuranceReg.schoolId)?.name || 'Kroužek'}`,
            activityType: 'krouzek',
            location: `${schools.find(s => s.id === insuranceReg.schoolId)?.name}, ${schools.find(s => s.id === insuranceReg.schoolId)?.city}`,
            periodOrDate: 'Školní rok 2025/2026 (Pololetí)',
            price: schools.find(s => s.id === insuranceReg.schoolId)?.price || '1 800 Kč',
            paymentStatus: insuranceReg.status
          }}
          onClose={() => setInsuranceReg(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingReg}
        onClose={() => setDeletingReg(null)}
        onConfirm={handleConfirmDelete}
        title="Opravdu smazat přihlášku na kroužek?"
        itemName={deletingReg ? `${deletingReg.childName} (${schools.find(s => s.id === deletingReg.schoolId)?.name || 'Kroužek'})` : undefined}
        description="Přihláška žáka bude trvale odstraněna ze systému a databáze. Tuto akci nelze vzít zpět."
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default Admin;