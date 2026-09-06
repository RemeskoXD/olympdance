import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, ChevronDown, Home, Music, Sparkles, Sun, Image as ImageIcon, Users, Phone, ShoppingBag, LogIn } from 'lucide-react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isMerchEnabled, isTanecniExpresEnabled, isCampsEnabled, isGalleryEnabled, isAboutEnabled } = useData();

  // Close dropdown and mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { path: '/', label: 'Domů', icon: Home },
    { path: '/tanecnikrouzky', label: 'Taneční Kroužky', icon: Music },
    ...(isTanecniExpresEnabled ? [{ path: '/tanecni-expres', label: 'Taneční Expres', icon: Sparkles }] : []),
    ...(isCampsEnabled ? [{ path: '/letnicampy', label: 'Letní Campy', icon: Sun }] : []),
    ...(isGalleryEnabled ? [{ path: '/galerie', label: 'Galerie', icon: ImageIcon }] : []),
    ...(isAboutEnabled ? [{ path: '/o-nas', label: 'O nás', icon: Users }] : []),
    { path: '/kontakt', label: 'Kontakt', icon: Phone },
    ...(isMerchEnabled ? [{ path: '/merch', label: 'E-shop', icon: ShoppingBag }] : []),
  ];

  const handleMobileClick = () => {
    setIsOpen(false);
  };

  const navItemClass = "text-sm uppercase tracking-wider font-semibold py-1 border-b-2 transition-colors duration-200 flex items-center text-gray-700 border-transparent hover:text-brand-blue hover:border-brand-red";
  const activeNavItemClass = "text-sm uppercase tracking-wider font-semibold py-1 border-b-2 transition-colors duration-200 flex items-center text-brand-blue border-brand-red";

  return (
    <nav className="fixed top-0 left-0 right-0 w-full bg-white/95 backdrop-blur-md shadow-md z-50 transition-all duration-300 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 sm:h-20 items-center">
          {/* Logo Area */}
          <div 
            className="flex-shrink-0 flex items-center cursor-pointer gap-2 group py-1" 
            onClick={() => { navigate('/'); setIsOpen(false); }}
          >
            <img 
              src="https://web2.itnahodinu.cz/olympdance/logo.png" 
              alt="Olymp Dance Logo" 
              className="h-12 sm:h-16 w-auto transition-transform group-hover:scale-105 drop-shadow-sm"
            />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-5 lg:space-x-7 items-center">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => isActive ? activeNavItemClass : navItemClass}
              >
                {link.label}
              </NavLink>
            ))}
            
            {/* CTA Button Dropdown */}
            <div className="relative ml-2" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="bg-brand-red text-white px-5 py-2.5 rounded-full font-bold hover:bg-red-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center text-sm"
              >
                <LogIn size={16} className="mr-1.5" />
                Přihlásit se
                <ChevronDown size={15} className={`ml-1 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fadeIn">
                  <NavLink 
                    to="/portal-krouzky" 
                    className={`block px-5 py-4 hover:bg-blue-50 hover:text-brand-blue ${isCampsEnabled ? 'border-b border-gray-100' : ''} transition-colors text-left`}
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <span className="font-bold text-base text-gray-900 block flex items-center gap-2">
                      <Music size={18} className="text-brand-blue" />
                      Portál Kroužky
                    </span>
                    <span className="text-xs text-gray-500 block mt-0.5">Omluvenky a klientský přístup</span>
                  </NavLink>
                  {isCampsEnabled && (
                    <NavLink 
                      to="/portal" 
                      className="block px-5 py-4 hover:bg-red-50 hover:text-brand-red transition-colors text-left"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <span className="font-bold text-base text-gray-900 block flex items-center gap-2">
                        <Sun size={18} className="text-brand-red" />
                        Portál Tábory
                      </span>
                      <span className="text-xs text-gray-500 block mt-0.5">Správa přihlášek na tábory</span>
                    </NavLink>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-brand-blue hover:text-brand-red hover:bg-gray-100 focus:outline-none transition-colors"
              aria-label="Přepnout menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute top-full left-0 w-full shadow-2xl max-h-[calc(100vh-4rem)] overflow-y-auto transition-all animate-fadeIn">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const IconComponent = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={handleMobileClick}
                  className={({ isActive }) => 
                    `flex items-center gap-3 w-full px-3.5 py-3 rounded-xl text-base font-semibold transition-all ${
                      isActive
                      ? 'bg-brand-blue text-white shadow-sm'
                      : 'text-gray-700 hover:text-brand-red hover:bg-gray-50 active:bg-gray-100'
                    }`
                  }
                >
                  <IconComponent size={20} className="shrink-0" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}

            {/* Mobile Portal / Registration Direct Actions */}
            <div className="pt-3 pb-2 border-t border-gray-100 mt-2 space-y-2">
              <div className="px-2 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Klientský portál &amp; Přihlášení
              </div>
              <div className={`grid ${isCampsEnabled ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
                <NavLink
                  to="/portal-krouzky"
                  onClick={handleMobileClick}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-brand-blue font-bold text-sm transition-colors border border-blue-100 text-center"
                >
                  <Music size={20} className="mb-1 text-brand-blue" />
                  <span>Kroužky portál</span>
                </NavLink>
                {isCampsEnabled && (
                  <NavLink
                    to="/portal"
                    onClick={handleMobileClick}
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-red-50 hover:bg-red-100 text-brand-red font-bold text-sm transition-colors border border-red-100 text-center"
                  >
                    <Sun size={20} className="mb-1 text-brand-red" />
                    <span>Tábory portál</span>
                  </NavLink>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;