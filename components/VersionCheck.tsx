import React, { useEffect, useState } from 'react';
import { RefreshCw, AlertCircle, X } from 'lucide-react';

export const VersionCheck: React.FC = () => {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Helper to fetch current page and parse version meta tag
  const checkVersion = async () => {
    try {
      // Fetch the index page with a timestamp to bypass cache
      const response = await fetch(`/?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'
        }
      });
      
      const text = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      
      const remoteVersion = doc.querySelector('meta[name="app-version"]')?.getAttribute('content');
      const localVersion = document.querySelector('meta[name="app-version"]')?.getAttribute('content');

      if (remoteVersion && localVersion && remoteVersion !== localVersion) {
        console.log(`Update detected: ${localVersion} -> ${remoteVersion}`);
        setHasUpdate(true);
        setIsVisible(true);
      }
    } catch (error) {
      console.error('Failed to check version', error);
    }
  };

  useEffect(() => {
    // Check immediately on mount
    checkVersion();

    // Check every 60 seconds
    const interval = setInterval(checkVersion, 60000);

    // Check when window regains focus (user comes back to tab)
    const onFocus = () => checkVersion();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const handleReload = () => {
    // Hard reload ignoring cache
    window.location.reload();
  };

  if (!hasUpdate || !isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-bounce-in">
      <div className="bg-white rounded-xl shadow-2xl border-2 border-brand-red p-4 max-w-sm flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center text-brand-red font-bold">
            <AlertCircle className="mr-2" size={20} />
            <span>Nová verze webu!</span>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>
        
        <p className="text-sm text-gray-600">
          Je k dispozici aktualizace s novým obsahem. Pro správné zobrazení prosím obnovte stránku.
        </p>

        <button
          onClick={handleReload}
          className="w-full bg-brand-red text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center shadow-lg"
        >
          <RefreshCw className="mr-2 animate-spin-slow" size={18} />
          Aktualizovat nyní
        </button>
      </div>
    </div>
  );
};

export default VersionCheck;