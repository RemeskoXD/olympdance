import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Trash2, Plus, School as SchoolIcon, Tent, LogOut, Lock, Image as ImageIcon, Edit2, Save, X, ShoppingBag, ToggleLeft, ToggleRight } from 'lucide-react';
import { School, Camp, Product } from '../types';

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'schools' | 'camps' | 'gallery' | 'merch'>('schools');

  // Check for persisted login on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem('olymp_admin_auth');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') { // Simple simulation auth
      setIsAuthenticated(true);
      localStorage.setItem('olymp_admin_auth', 'true');
    } else {
      alert('Špatné heslo');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('olymp_admin_auth');
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Heslo</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
                  placeholder="Zadejte heslo"
                />
            </div>
            <button type="submit" className="w-full bg-brand-blue text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors">
              Přihlásit se
            </button>
          </form>
          <div className="mt-6 text-center text-xs text-gray-400">
            Tip: Heslo je "admin123"
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
        </div>

        {activeTab === 'schools' && <SchoolManager />}
        {activeTab === 'camps' && <CampManager />}
        {activeTab === 'gallery' && <GalleryManager />}
        {activeTab === 'merch' && <MerchManager />}
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
    const { camps, addCamp, updateCamp, deleteCamp } = useData();
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [formData, setFormData] = useState({ title: '', date: '', price: '', description: '', image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=800' });
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.title) return;
      
      if (isEditing) {
        updateCamp(isEditing, formData);
        setIsEditing(null);
      } else {
        addCamp(formData);
      }
      setFormData({ title: '', date: '', price: '', description: '', image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=800' });
    };

    const handleEdit = (camp: Camp) => {
      setIsEditing(camp.id);
      setFormData({
        title: camp.title,
        date: camp.date,
        price: camp.price,
        description: camp.description,
        image: camp.image
      });
    };

    const cancelEdit = () => {
      setIsEditing(null);
      setFormData({ title: '', date: '', price: '', description: '', image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=800' });
    };
  
    return (
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
                placeholder="Popis tábora..." 
                rows={3}
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
              />
              <input 
                className="w-full px-3 py-2 border rounded-lg text-sm" 
                placeholder="URL obrázku" 
                value={formData.image} 
                onChange={e => setFormData({...formData, image: e.target.value})} 
              />
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
               </div>
            </div>
          ))}
          {camps.length === 0 && <p className="text-gray-500 text-center py-8">Žádné tábory v seznamu.</p>}
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

export default Admin;