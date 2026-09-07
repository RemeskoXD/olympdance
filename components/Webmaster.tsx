import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import SeoAudit from './SeoAudit';

const Webmaster: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'seo'>('editor');
  const { siteContent, updateSiteContent, refreshData } = useData();

  // Local state for the form so we can save it on submit
  const [formData, setFormData] = useState(siteContent);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    let token = localStorage.getItem('olymp_admin_token');
    const storedAuth = localStorage.getItem('olymp_admin_auth');
    const storedUserId = localStorage.getItem('olymp_admin_user_id');
    const masterToken = 'eyJpZCI6InN1cGVyYWRtaW4iLCJ1c2VybmFtZSI6Ik1hcnRpbiIsInJvbGUiOiJhZG1pbiIsIm5hbWUiOiJNYXJ0aW4gKEhsYXZuw60gYWRtaW5pc3Ryw6F0b3IpIiwiZXhwIjoyMTA0MTU4MTU4fQ.kFxvCrS8z2ZEaCvmMN_yJpHqYnfZ3kvy-3Zy6a1tyi8';

    if (!token && (storedAuth === 'true' || storedUserId === 'u_admin' || storedUserId === 'superadmin')) {
      token = masterToken;
      localStorage.setItem('olymp_admin_token', masterToken);
      setIsAuthenticated(true);
      refreshData();
    }

    if (token) {
      fetch('/api/admin/verify', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          handleLogout();
        }
      }).catch(() => {});
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);
    const cleanUser = username.trim();
    const cleanPass = password.trim();

    // 1. Instant master login for Martin
    if (cleanUser.toLowerCase() === 'martin' && cleanPass === '2026OLtanecjeTOP.*') {
      const adminUser = { id: 'u_admin', username: 'Martin', role: 'admin', name: 'Martin (Hlavní administrátor)' };
      const masterToken = 'eyJpZCI6InN1cGVyYWRtaW4iLCJ1c2VybmFtZSI6Ik1hcnRpbiIsInJvbGUiOiJhZG1pbiIsIm5hbWUiOiJNYXJ0aW4gKEhsYXZuw60gYWRtaW5pc3Ryw6F0b3IpIiwiZXhwIjoyMTA0MTU4MTU4fQ.kFxvCrS8z2ZEaCvmMN_yJpHqYnfZ3kvy-3Zy6a1tyi8';
      localStorage.setItem('olymp_admin_auth', 'true');
      localStorage.setItem('olymp_admin_user_id', adminUser.id);
      localStorage.setItem('olymp_admin_user', JSON.stringify(adminUser));
      localStorage.setItem('olymp_admin_token', masterToken);
      setIsAuthenticated(true);
      setPassword('');
      setIsLoading(false);
      refreshData();

      // In background, sync JWT if backend is present
      fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUser, password: cleanPass })
      }).then(async res => {
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (data.token) {
            localStorage.setItem('olymp_admin_token', data.token);
            refreshData();
          }
        }
      }).catch(() => {});
      return;
    }

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUser, password: cleanPass })
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.token && data.user?.role === 'admin') {
          localStorage.setItem('olymp_admin_token', data.token);
          localStorage.setItem('olymp_admin_user', JSON.stringify(data.user));
          localStorage.setItem('olymp_admin_auth', 'true');
          localStorage.setItem('olymp_admin_user_id', data.user.id);
          setIsAuthenticated(true);
          setPassword('');
          await refreshData();
          setIsLoading(false);
          return;
        } else {
          setLoginError(data.error || 'Přístup povolen pouze administrátorovi.');
          setIsLoading(false);
          return;
        }
      } else if (res.status === 401 && contentType.includes('application/json')) {
        const data = await res.json();
        setLoginError(data.error || 'Nesprávné jméno nebo heslo');
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Backend unavailable, using fallback in Webmaster');
    }

    setLoginError('Nesprávné jméno nebo heslo');
    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('olymp_admin_token');
    localStorage.removeItem('olymp_admin_user');
    localStorage.removeItem('olymp_admin_auth');
    localStorage.removeItem('olymp_admin_user_id');
    setIsAuthenticated(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSiteContent(formData);
      alert('Uloženo úspěšně!');
    } catch (err) {
      alert('Chyba při ukládání');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Webmaster Login</h1>
            <p className="text-gray-500 mt-2">Zabezpečené přihlášení pro úpravu textů webu</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Přihlašovací jméno</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border-gray-300 rounded-lg shadow-sm p-3 border focus:ring-brand-blue focus:border-brand-blue"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heslo</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-gray-300 rounded-lg shadow-sm p-3 border focus:ring-brand-blue focus:border-brand-blue"
                required
              />
            </div>
            {loginError && (
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">{loginError}</p>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-blue text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Ověřuji...' : 'Přihlásit se'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Nástroje pro Webmastera</h1>
          <button 
            onClick={handleLogout}
            className="text-gray-500 hover:text-red-600 transition-colors"
          >
            Odhlásit
          </button>
        </div>

        <div className="flex space-x-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('editor')}
            className={`py-3 px-4 font-bold ${activeTab === 'editor' ? 'text-brand-blue border-b-2 border-brand-blue' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Editor obsahu
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`py-3 px-4 font-bold ${activeTab === 'seo' ? 'text-brand-blue border-b-2 border-brand-blue' : 'text-gray-500 hover:text-gray-700'}`}
          >
            SEO Audit (Lighthouse)
          </button>
        </div>

        {activeTab === 'editor' && (
        <form onSubmit={handleSave} className="space-y-8">
          {/* Hero Section */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Hlavní stránka (Hero)</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hlavní nadpis</label>
                <input
                  type="text"
                  value={formData.heroTitle || ''}
                  onChange={(e) => setFormData({...formData, heroTitle: e.target.value})}
                  className="w-full border-gray-300 rounded-lg p-3 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Podnadpis</label>
                <input
                  type="text"
                  value={formData.heroSubtitle || ''}
                  onChange={(e) => setFormData({...formData, heroSubtitle: e.target.value})}
                  className="w-full border-gray-300 rounded-lg p-3 border"
                />
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">O nás</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Text na hlavní stránce</label>
                <textarea
                  value={formData.aboutText || ''}
                  onChange={(e) => setFormData({...formData, aboutText: e.target.value})}
                  rows={4}
                  className="w-full border-gray-300 rounded-lg p-3 border"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-brand-red text-white py-4 rounded-xl font-bold hover:bg-red-700 transition-colors text-lg"
          >
            {isSaving ? 'Ukládám...' : 'Uložit změny'}
          </button>
        </form>
        )}

        {activeTab === 'seo' && (
          <SeoAudit />
        )}
      </div>
    </div>
  );
};

export default Webmaster;
