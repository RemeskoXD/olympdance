import React from 'react';
import { Mail, Phone, MapPin, Lock, Send, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CONTACT_INFO } from '../constants';
import { useData } from '../context/DataContext';

const Footer: React.FC = () => {
  const { isMerchEnabled } = useData();
  const currentVersion = document.querySelector('meta[name="app-version"]')?.getAttribute('content') || 'v1.0';

  const handleForceReload = () => {
    window.location.reload();
  };

  return (
    <footer className="bg-gray-900 text-gray-400 py-8 sm:py-12 border-t border-gray-800 relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8 sm:mb-12">
          
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
             <Link to="/" className="flex items-center gap-3 mb-4 sm:mb-6 group">
                <img 
                  src="https://web2.itnahodinu.cz/olympdance/logobile.webp" 
                  alt="Olymp Dance Logo" 
                  className="h-12 sm:h-16 w-auto transition-transform group-hover:scale-105"
                />
                <div className="flex flex-col justify-center items-start">
                   <span className="font-display font-extrabold text-base sm:text-lg leading-none tracking-wide text-white uppercase group-hover:text-brand-lightBlue transition-colors">
                     Tanči s námi
                   </span>
                   <span className="font-display font-extrabold text-base sm:text-lg leading-none tracking-wide text-brand-red uppercase -mt-1 group-hover:text-red-400 transition-colors">
                     na tvé škole
                   </span>
                </div>
            </Link>
            <p className="text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 text-gray-500 max-w-sm">
              Moderní taneční klub pro děti a mládež v Olomouci a okolí. 
              Radost z pohybu, skvělá parta a profesionální vedení.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-3 sm:mb-4 uppercase tracking-wider text-xs sm:text-sm">Rychlé odkazy</h4>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
              <li><Link to="/tanecnikrouzky" className="hover:text-brand-red transition-colors block py-1 sm:py-1.5">Taneční kroužky</Link></li>
              <li><Link to="/letnicampy" className="hover:text-brand-red transition-colors block py-1 sm:py-1.5">Letní tábory</Link></li>
              <li><Link to="/galerie" className="hover:text-brand-red transition-colors block py-1 sm:py-1.5">Galerie</Link></li>
              <li><Link to="/o-nas" className="hover:text-brand-red transition-colors block py-1 sm:py-1.5">O nás</Link></li>
              <li><Link to="/kontakt" className="hover:text-brand-red transition-colors block py-1 sm:py-1.5">Kontakt</Link></li>
              {isMerchEnabled && (
                <li><Link to="/merch" className="text-brand-lightBlue hover:text-white transition-colors block py-1 sm:py-1.5 font-bold">E-shop / Merch</Link></li>
              )}
            </ul>
          </div>

          {/* Contact Small */}
          <div>
            <h4 className="text-white font-bold mb-3 sm:mb-4 uppercase tracking-wider text-xs sm:text-sm">Kontakt</h4>
            <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
              <li className="flex items-start">
                <MapPin size={16} className="mr-2 mt-0.5 shrink-0 text-brand-red" />
                <span>{CONTACT_INFO.address}</span>
              </li>
              <li className="flex items-center">
                <Phone size={16} className="mr-2 shrink-0 text-brand-red" />
                <a href={`tel:${CONTACT_INFO.phone.replace(/\s/g,'')}`} className="hover:text-white transition-colors">{CONTACT_INFO.phone}</a>
              </li>
              <li className="flex items-center">
                <Mail size={16} className="mr-2 shrink-0 text-brand-red" />
                <a href={`mailto:${CONTACT_INFO.email}`} className="hover:text-white transition-colors break-all">{CONTACT_INFO.email}</a>
              </li>
            </ul>
          </div>

           {/* Newsletter */}
           <div className="sm:col-span-2 md:col-span-1">
            <h4 className="text-white font-bold mb-3 sm:mb-4 uppercase tracking-wider text-xs sm:text-sm">Zůstaňte v obraze</h4>
            <p className="text-xs text-gray-500 mb-3">Zadejte svůj email a neuteče vám žádná novinka.</p>
            <div className="flex max-w-sm">
               <input 
                 type="email" 
                 placeholder="Váš email" 
                 className="bg-gray-800 border-none text-white text-xs sm:text-sm rounded-l-lg px-3 py-2.5 w-full focus:ring-1 focus:ring-brand-blue outline-none" 
               />
               <button className="bg-brand-blue hover:bg-blue-700 text-white px-3.5 py-2.5 rounded-r-lg transition-colors shrink-0">
                 <Send size={16} />
               </button>
            </div>
          </div>

        </div>

        <div className="border-t border-gray-800 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600 gap-3 text-center md:text-left">
          <p>© {new Date().getFullYear()} Taneční klub Olymp Olomouc, z. s. Všechna práva vyhrazena.</p>
          <div className="flex flex-wrap justify-center space-x-4 items-center">
             <span>IČO: {CONTACT_INFO.ico}</span>
             <Link to="/admin" className="text-gray-700 hover:text-gray-500 transition-colors flex items-center" title="Administrace">
                <Lock size={12} className="mr-1" /> Admin
             </Link>
             <button onClick={handleForceReload} className="text-gray-700 hover:text-brand-blue transition-colors flex items-center ml-2" title="Vynutit aktualizaci">
                <RefreshCw size={10} className="mr-1" /> {currentVersion}
             </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;