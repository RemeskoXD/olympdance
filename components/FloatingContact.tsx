import React, { useState } from 'react';
import { Phone, MessageCircle, Mail, X, Sparkles, Music, Sun, HelpCircle, ChevronUp } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { CONTACT_INFO } from '../constants';

export const FloatingContact: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 print:hidden font-sans">
      {/* Expanded Popup Menu */}
      {isOpen && (
        <div className="mb-3 w-72 sm:w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 p-5 overflow-hidden animate-fadeIn transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
              <span className="font-bold text-gray-900 text-sm">Rychlý kontakt</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Zavřít"
            >
              <X size={18} />
            </button>
          </div>

          <p className="text-xs text-gray-500 my-3">
            Máte dotaz k přihlášce, kroužkům nebo letním táborům? Rádi vám poradíme:
          </p>

          <div className="space-y-2">
            {/* Call Button */}
            <a
              href={`tel:${CONTACT_INFO.phone.replace(/\s/g, '')}`}
              className="flex items-center justify-between p-3 rounded-2xl bg-blue-50/80 hover:bg-blue-100 text-brand-blue font-bold text-sm transition-all group"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-blue text-white flex items-center justify-center shadow-sm">
                  <Phone size={16} />
                </div>
                <div>
                  <span className="block text-xs text-blue-600 font-medium">Zavolat</span>
                  <span className="block text-gray-900 text-xs sm:text-sm font-bold">{CONTACT_INFO.phone}</span>
                </div>
              </div>
            </a>

            {/* WhatsApp / Message Button */}
            <a
              href={`https://wa.me/420${CONTACT_INFO.phone.replace(/[^0-9]/g, '').slice(-9)}?text=Dobr%C3%BD%20den,%20m%C3%A1m%20dotaz%20ohledn%C4%9B%20Olymp%20Dance`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-2xl bg-green-50/80 hover:bg-green-100 text-green-700 font-bold text-sm transition-all group"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-green-600 text-white flex items-center justify-center shadow-sm">
                  <MessageCircle size={16} />
                </div>
                <div>
                  <span className="block text-xs text-green-600 font-medium">Napsat na WhatsApp</span>
                  <span className="block text-gray-900 text-xs sm:text-sm font-bold">Rychlá odpověď</span>
                </div>
              </div>
            </a>

            {/* Email Button */}
            <a
              href={`mailto:${CONTACT_INFO.email}?subject=Dotaz%20Olymp%20Dance`}
              className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium text-sm transition-all"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-gray-200 text-gray-700 flex items-center justify-center">
                  <Mail size={16} />
                </div>
                <div>
                  <span className="block text-xs text-gray-500 font-medium">Poslat e-mail</span>
                  <span className="block text-gray-900 text-xs sm:text-sm font-bold">{CONTACT_INFO.email}</span>
                </div>
              </div>
            </a>
          </div>

          {/* Quick Registration Links */}
          <div className="pt-3 mt-3 border-t border-gray-100">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Přihlásit se
            </span>
            <div className="grid grid-cols-2 gap-2">
              <NavLink
                to="/tanecnikrouzky"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl bg-blue-50 text-brand-blue hover:bg-blue-100 text-xs font-bold text-center transition-colors flex flex-col items-center"
              >
                <Music size={14} className="mb-1" />
                <span>Kroužky</span>
              </NavLink>
              <NavLink
                to="/letnicampy"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl bg-red-50 text-brand-red hover:bg-red-100 text-xs font-bold text-center transition-colors flex flex-col items-center"
              >
                <Sun size={14} className="mb-1" />
                <span>Letní tábory</span>
              </NavLink>
            </div>
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-gradient-to-r from-brand-red to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3.5 rounded-full shadow-2xl hover:shadow-red-500/30 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none"
        aria-label="Rychlý kontakt"
      >
        <div className="relative">
          {isOpen ? (
            <X size={20} />
          ) : (
            <>
              <MessageCircle size={20} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 border-2 border-brand-red rounded-full"></span>
            </>
          )}
        </div>
        <span className="font-bold text-sm hidden sm:inline-block">
          {isOpen ? 'Zavřít' : 'Potřebujete poradit?'}
        </span>
      </button>
    </div>
  );
};
