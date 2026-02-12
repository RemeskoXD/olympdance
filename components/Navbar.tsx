import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { path: '/', label: 'Domů' },
    { path: '/krouzky', label: 'Taneční Kroužky' },
    { path: '/tabory', label: 'Letní Campy' },
    { path: '/galerie', label: 'Galerie' },
    { path: '/o-nas', label: 'O nás' },
    { path: '/kontakt', label: 'Kontakt' },
  ];

  const handleMobileClick = () => {
    setIsOpen(false);
  };

  const navItemClass = "text-sm uppercase tracking-wider font-semibold py-1 border-b-2 transition-colors duration-200 flex items-center text-gray-700 border-transparent hover:text-brand-blue hover:border-brand-red";
  const activeNavItemClass = "text-sm uppercase tracking-wider font-semibold py-1 border-b-2 transition-colors duration-200 flex items-center text-brand-blue border-brand-red";

  return (
    <nav className="fixed w-full bg-white/95 backdrop-blur-sm shadow-md z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24 md:h-28 items-center">
          {/* Logo Area */}
          <div className="flex-shrink-0 flex items-center cursor-pointer gap-4 group" onClick={() => navigate('/')}>
            <img 
              src="https://web2.itnahodinu.cz/olympdance/logo.png" 
              alt="Olymp Dance Logo" 
              className="h-20 w-auto md:h-24 transition-transform hover:scale-105"
            />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 lg:space-x-8 items-center">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => isActive ? activeNavItemClass : navItemClass}
              >
                {link.label}
              </NavLink>
            ))}
            
            {/* CTA Button */}
            <a 
              href="https://clen.olympdance.cz"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brand-red text-white px-5 py-2 rounded-full font-bold hover:bg-red-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ml-2"
            >
              Přihlásit se
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-brand-blue hover:text-brand-red focus:outline-none"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-xl">
           <div className="p-4 border-b border-gray-100 text-center bg-gray-50 flex flex-col items-center">
                <span className="font-display font-bold text-lg text-brand-blue uppercase">Tanči s námi</span>
                <span className="font-display font-bold text-lg text-brand-red uppercase">na tvé škole</span>
           </div>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={handleMobileClick}
                className={({ isActive }) => 
                  `block w-full text-left px-3 py-3 rounded-md text-base font-medium transition-colors ${
                    isActive
                    ? 'bg-brand-blue/5 text-brand-blue'
                    : 'text-gray-700 hover:text-brand-red hover:bg-gray-50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            {/* Mobile External Link */}
            <a
                href="https://clen.olympdance.cz"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleMobileClick}
                className="block w-full text-left px-3 py-3 rounded-md text-base font-bold transition-colors text-brand-red hover:bg-red-50"
            >
                Přihlásit se
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;