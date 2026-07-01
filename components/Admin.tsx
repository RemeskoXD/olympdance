import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Trash2, Plus, School as SchoolIcon, Tent, LogOut, Lock, Image as ImageIcon, Edit2, Save, X, ShoppingBag, ToggleLeft, ToggleRight, FileText, CheckCircle as CheckCircleIcon, Clock, AlertCircle, Mail, Users, Check, X as XIcon, Calendar } from 'lucide-react';
import { School, Camp, Product, Registration, User, SchoolRegistration } from '../types';

const Admin: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, schools, schoolRegistrations, attendance, excuses, updateAttendance } = useData();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'schools' | 'camps' | 'gallery' | 'merch' | 'registrations' | 'school_registrations' | 'users' | 'attendance'>('schools');

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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Správa obsahu</h1>
          <button 
            onClick={handleLogout}
            className="flex items-center text-gray-600 hover:text-red-600 transition-colors text-sm font-medium"
          >
            <LogOut size={18} className="mr-2" />
            Odhlásit se
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-xl shadow-sm inline-flex">
          {(currentUser?.role === 'admin' || currentUser?.role === undefined) && (
            <>
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

        {activeTab === 'schools' && <SchoolManager />}
        {activeTab === 'camps' && <CampManager />}
        {activeTab === 'gallery' && <GalleryManager />}
        {activeTab === 'merch' && <MerchManager />}
        {activeTab === 'school_registrations' && <SchoolRegistrationManager />}
        {activeTab === 'registrations' && <RegistrationManager />}
        {activeTab === 'users' && <UserManager />}
        {activeTab === 'attendance' && <AttendanceManager currentUser={currentUser} />}
      </div>
    </div>
  );
};

// --- Sub-components for better organization ---

const SchoolManager: React.FC = () => {
  const { schools, addSchool, updateSchool, deleteSchool } = useData();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', city: '', day: '', time: '', price: '', isKindergarten: false });

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
        {schools.map(school => (
          <div key={school.id} className={`bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center group transition-all ${isEditing === school.id ? 'border-brand-blue ring-2 ring-brand-blue/20' : 'border-gray-100 hover:shadow-md'}`}>
            <div>
              <div className="flex items-center gap-2">
                  <h4 className="font-bold text-gray-900">{school.name}</h4>
                  {school.isKindergarten && <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded font-bold">MŠ</span>}
              </div>
              <p className="text-sm text-gray-500">{school.city} • {school.day} {school.time}</p>
              <p className="text-sm font-semibold text-brand-blue mt-1">{school.price}</p>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => handleEdit(school)}
                className="p-2 text-gray-400 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-colors"
                title="Upravit"
              >
                <Edit2 size={20} />
              </button>
              <button 
                onClick={() => { if(confirm('Opravdu smazat?')) deleteSchool(school.id) }}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Smazat"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
        {schools.length === 0 && <p className="text-gray-500 text-center py-8">Žádné školy v seznamu.</p>}
      </div>
    </div>
  );
};

const CampManager: React.FC = () => {
    const { camps, addCamp, updateCamp, deleteCamp, campGeneralInfo, updateCampGeneralInfo } = useData();
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
    const { products, addProduct, deleteProduct, isMerchEnabled, toggleMerch } = useData();
    const [formData, setFormData] = useState({ name: '', price: '', description: '', image: '' });
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.name) return;
      addProduct(formData);
      setFormData({ name: '', price: '', description: '', image: '' });
    };
  
    return (
      <div className="space-y-8">
        {/* Visibility Toggle */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
           <div>
               <h3 className="text-lg font-bold text-gray-900">Viditelnost E-shopu</h3>
               <p className="text-gray-500 text-sm">Pokud vypnete, odkaz zmizí z patičky a stránka nebude přístupná.</p>
           </div>
           <button 
             onClick={() => toggleMerch(!isMerchEnabled)}
             className={`flex items-center px-4 py-2 rounded-full font-bold transition-all ${isMerchEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
           >
               {isMerchEnabled ? <ToggleRight size={40} className="mr-2" /> : <ToggleLeft size={40} className="mr-2" />}
               {isMerchEnabled ? 'Aktivní' : 'Vypnuto'}
           </button>
        </div>

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
                  placeholder="Cena" 
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
                <button className="w-full bg-brand-blue text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Přidat produkt
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
      </div>
    );
};

const RegistrationManager: React.FC = () => {
  const { registrations, camps, updateRegistration } = useData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState('');

  const handleUpdateStatus = (id: string, status: Registration['status']) => {
    updateRegistration(id, { status });
  };

  const handleSaveNote = (id: string) => {
    updateRegistration(id, { adminNote });
    setEditingId(null);
    setAdminNote('');
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Správa přihlášek</h2>
        <div className="text-sm text-gray-500">Celkem: {registrations.length}</div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Dítě / Tábor</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Rodič / Kontakt</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Akce</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">Zatím žádné přihlášky.</td>
                </tr>
              ) : (
                registrations.map((reg) => {
                  const camp = camps.find(c => c.id === reg.campId);
                  return (
                    <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{reg.childName}</div>
                        <div className="text-xs text-gray-500">{reg.childBirthDate}</div>
                        <div className="text-xs font-medium text-brand-blue mt-1">{camp?.title}</div>
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
                        {getStatusBadge(reg.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
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
    </div>
  );
};

const UserManager: React.FC = () => {
  const { users, addUser, deleteUser, schools } = useData();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'trainer' as 'admin' | 'trainer', name: '', schoolId: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addUser(formData);
    setFormData({ username: '', password: '', role: 'trainer', name: '', schoolId: '' });
    setIsAdding(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Správa uživatelů</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors flex items-center"
        >
          {isAdding ? <X size={16} className="mr-2" /> : <Plus size={16} className="mr-2" />}
          {isAdding ? 'Zrušit' : 'Přidat uživatele'}
        </button>
      </div>

      {isAdding && (
        <div className="p-6 bg-gray-50 border-b border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Jméno (např. Jan Novák)" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="px-4 py-2 border border-gray-300 rounded-lg outline-none" required />
              <input type="text" placeholder="Přihlašovací jméno" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="px-4 py-2 border border-gray-300 rounded-lg outline-none" required />
              <input type="text" placeholder="Heslo" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="px-4 py-2 border border-gray-300 rounded-lg outline-none" required />
              <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})} className="px-4 py-2 border border-gray-300 rounded-lg outline-none">
                <option value="trainer">Trenér/ka</option>
                <option value="admin">Administrátor</option>
              </select>
              {formData.role === 'trainer' && (
                <select value={formData.schoolId} onChange={e => setFormData({...formData, schoolId: e.target.value})} className="px-4 py-2 border border-gray-300 rounded-lg outline-none" required>
                  <option value="">Vyberte školu...</option>
                  {schools.map(s => <option key={s.id} value={s.id}>{s.name} ({s.day})</option>)}
                </select>
              )}
            </div>
            <button type="submit" className="bg-brand-red text-white px-6 py-2 rounded-lg font-bold">Uložit uživatele</button>
          </form>
        </div>
      )}

      <div className="p-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-3 font-bold text-gray-500 text-sm">Jméno</th>
              <th className="py-3 font-bold text-gray-500 text-sm">Login</th>
              <th className="py-3 font-bold text-gray-500 text-sm">Heslo</th>
              <th className="py-3 font-bold text-gray-500 text-sm">Role</th>
              <th className="py-3 font-bold text-gray-500 text-sm">Přiřazená škola</th>
              <th className="py-3 font-bold text-gray-500 text-sm">Akce</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => {
              const school = schools.find(s => s.id === user.schoolId);
              return (
                <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 font-medium">{user.name}</td>
                  <td className="py-3 text-gray-500">{user.username}</td>
                  <td className="py-3 text-gray-500 font-mono text-xs">{user.password}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                      {user.role === 'admin' ? 'Administrátor' : 'Trenér/ka'}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500">{school ? school.name : '-'}</td>
                  <td className="py-3">
                    <button onClick={() => deleteUser(user.id)} className="text-gray-400 hover:text-brand-red"><Trash2 size={18} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AttendanceManager: React.FC<{ currentUser: User | null }> = ({ currentUser }) => {
  const { schools, schoolRegistrations, attendance, updateAttendance, excuses } = useData();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  if (!currentUser || currentUser.role !== 'trainer' || !currentUser.schoolId) {
    return <div>Nemáte přiřazenou žádnou školu.</div>;
  }

  const school = schools.find(s => s.id === currentUser.schoolId);
  const students = schoolRegistrations.filter(r => r.schoolId === currentUser.schoolId);
  const currentAttendance = attendance.find(a => a.schoolId === currentUser.schoolId && a.date === selectedDate);
  const records = currentAttendance?.records || {};

  const handleToggle = (studentId: string, isPresent: boolean) => {
    const newRecords = { ...records, [studentId]: isPresent };
    updateAttendance(currentUser.schoolId!, selectedDate, newRecords);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-brand-blue text-white">
        <div>
          <h2 className="text-xl font-bold">{school?.name}</h2>
          <p className="text-blue-200 text-sm">{school?.day} {school?.time}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar size={18} />
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1 rounded bg-white/20 border-none outline-none text-white font-bold"
          />
        </div>
      </div>

      <div className="p-6">
        {students.length === 0 ? (
          <p className="text-gray-500 text-center py-8">V této škole nejsou žádní přihlášení žáci.</p>
        ) : (
          <div className="space-y-4">
            {students.map(student => {
              const isPresent = records[student.id];
              const excuse = excuses.find(e => e.registrationId === student.id && e.date === selectedDate);

              return (
                <div key={student.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50">
                  <div>
                    <h3 className="font-bold text-gray-900">{student.childName}</h3>
                    {excuse && (
                      <p className="text-xs text-red-600 font-bold mt-1">
                        Omluvenka: {excuse.reason}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleToggle(student.id, true)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isPresent === true ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600'}`}
                    >
                      <Check size={20} />
                    </button>
                    <button 
                      onClick={() => handleToggle(student.id, false)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isPresent === false ? 'bg-red-500 text-white shadow-md' : 'bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600'}`}
                    >
                      <XIcon size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// --- SchoolRegistrationManager ---

const SchoolRegistrationManager: React.FC = () => {
  const { schoolRegistrations, schools, updateSchoolRegistration, excuses } = useData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [showHistoryFor, setShowHistoryFor] = useState<string | null>(null);

  const handleUpdateStatus = (id: string, status: SchoolRegistration['status']) => {
    updateSchoolRegistration(id, { status });
  };

  const handleSaveNote = (id: string) => {
    updateSchoolRegistration(id, { adminNote });
    setEditingId(null);
    setAdminNote('');
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Správa přihlášek (Kroužky)</h2>
        <div className="text-sm text-gray-500">Celkem: {schoolRegistrations.length}</div>
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
              {schoolRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">Zatím žádné přihlášky na kroužky.</td>
                </tr>
              ) : (
                schoolRegistrations.map((reg) => {
                  const school = schools.find(s => s.id === reg.schoolId);
                  const regExcuses = excuses.filter(e => e.registrationId === reg.id);
                  return (
                    <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{reg.childName}</div>
                        <div className="text-xs text-gray-500">{reg.childBirthDate} {reg.childPhone && `• ${reg.childPhone}`}</div>
                        <div className="text-xs font-medium text-brand-blue mt-1">{school?.name} - {school?.city}</div>
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
                          <div className="flex gap-2">
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
    </div>
  );
};

export default Admin;