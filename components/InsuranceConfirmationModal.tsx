import React from 'react';
import { X, Printer, Download, CheckCircle, ShieldCheck } from 'lucide-react';
import { CONTACT_INFO } from '../constants';

interface ConfirmationData {
  childName: string;
  childBirthDate: string;
  parentName: string;
  parentPhone?: string;
  parentEmail?: string;
  activityTitle: string;
  activityType: 'krouzek' | 'tabor';
  location: string;
  periodOrDate: string;
  price: string;
  variableSymbol?: string;
  paymentStatus: string;
}

interface InsuranceConfirmationModalProps {
  data: ConfirmationData;
  onClose: () => void;
}

export const InsuranceConfirmationModal: React.FC<InsuranceConfirmationModalProps> = ({ data, onClose }) => {
  const today = new Date().toLocaleDateString('cs-CZ');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      {/* Container */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl my-8 relative overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Bar (Hidden on print) */}
        <div className="bg-brand-blue text-white px-6 py-4 flex justify-between items-center print:hidden">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="text-yellow-400" size={24} />
            <div>
              <h3 className="font-bold text-lg">Potvrzení pro pojišťovnu a FKSP</h3>
              <p className="text-xs text-blue-200">Oficiální formulář pro čerpání příspěvku na pohybovou aktivitu dítěte</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="bg-white text-brand-blue px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors flex items-center shadow-md"
            >
              <Printer size={16} className="mr-1.5" />
              Vytisknout / Uložit PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Certificate Body */}
        <div className="p-8 sm:p-12 overflow-y-auto print:p-0 print:overflow-visible print:m-0 font-sans text-gray-900 bg-white" id="printable-certificate">
          
          {/* Header */}
          <div className="border-b-2 border-brand-blue pb-6 mb-8 flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <img 
                src="https://web2.itnahodinu.cz/olympdance/logo.png" 
                alt="Olymp Dance Logo" 
                className="h-16 w-auto"
              />
              <div>
                <h1 className="text-xl font-bold text-brand-blue uppercase tracking-wide">Taneční klub Olymp Olomouc, z. s.</h1>
                <p className="text-xs text-gray-600">IČO: 68347286 • Holečkova 10, 779 00 Olomouc</p>
                <p className="text-xs text-gray-600">Email: {CONTACT_INFO.email} • Tel: {CONTACT_INFO.phone}</p>
                <p className="text-xs text-gray-600">Web: www.olympdance.cz</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block bg-blue-50 text-brand-blue text-xs font-bold px-3 py-1 rounded-full border border-blue-100 uppercase">
                Oficiální potvrzení
              </span>
              <p className="text-xs text-gray-500 mt-2">Vystaveno dne: <strong>{today}</strong></p>
            </div>
          </div>

          {/* Certificate Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">
              POTVRZENÍ O ÚČASTI A ZAPLACENÍ
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Doklad pro uplatnění příspěvku u zdravotní pojišťovny nebo fondu FKSP / zaměstnavatele
            </p>
          </div>

          {/* Statement */}
          <p className="text-sm text-gray-700 leading-relaxed mb-6">
            Taneční klub <strong>Olymp Olomouc, z. s.</strong> tímto potvrzuje, že níže uvedený účastník se účastní 
            pravidelné sportovní a pohybové aktivity (taneční kroužek / tábor) zaměřené na zdravý tělesný rozvoj dětí a mládeže.
          </p>

          {/* Participant & Course Details Table */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 mb-6 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3 border-b border-gray-200 text-sm">
              <div>
                <span className="text-gray-500 block text-xs font-bold uppercase">Jméno a příjmení dítěte:</span>
                <span className="font-bold text-base text-gray-900">{data.childName}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs font-bold uppercase">Datum narození:</span>
                <span className="font-bold text-base text-gray-900">{data.childBirthDate || 'Neuvedeno'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3 border-b border-gray-200 text-sm">
              <div>
                <span className="text-gray-500 block text-xs font-bold uppercase">Zákonný zástupce (Rodič):</span>
                <span className="font-medium text-gray-900">{data.parentName}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs font-bold uppercase">Název aktivity:</span>
                <span className="font-bold text-brand-blue">{data.activityTitle}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3 border-b border-gray-200 text-sm">
              <div>
                <span className="text-gray-500 block text-xs font-bold uppercase">Místo konání:</span>
                <span className="font-medium text-gray-900">{data.location}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs font-bold uppercase">Období / Termín:</span>
                <span className="font-medium text-gray-900">{data.periodOrDate}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-sm">
              <div>
                <span className="text-gray-500 block text-xs font-bold uppercase">Uhrazená částka:</span>
                <span className="text-xl font-bold text-brand-red">{data.price}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs font-bold uppercase">Stav úhrady:</span>
                <span className="inline-flex items-center text-green-700 font-bold">
                  <CheckCircle size={16} className="mr-1 text-green-600" />
                  Uhrazeno v plné výši (Bankovní převod)
                </span>
              </div>
            </div>
          </div>

          {/* Insurance statement notes */}
          <div className="text-xs text-gray-500 space-y-1 mb-10 leading-normal">
            <p>• Tento doklad splňuje požadavky zdravotních pojišťoven v ČR (VZP 111, VoZP 201, ČPZP 205, OZP 207, ZPŠ 209, ZP MV ČR 211, RBP 213) pro čerpání příspěvku na sportovní kroužky a pohybové aktivity dětí.</p>
            <p>• Doklad slouží rovněž pro uplatnění příspěvku ze sociálního fondu FKSP u zaměstnavatele.</p>
          </div>

          {/* Signature & Stamp Section */}
          <div className="pt-8 flex justify-between items-end border-t border-gray-200">
            <div className="text-xs text-gray-500">
              <p className="font-bold text-gray-700">Taneční klub Olymp Olomouc, z. s.</p>
              <p>Holečkova 10, 779 00 Olomouc</p>
              <p>IČO: 68347286</p>
            </div>
            <div className="text-center">
              <div className="w-48 border-b border-gray-400 pb-1 mb-1">
                <span className="text-xs text-gray-400 italic">Podpis a razítko organizátora</span>
              </div>
              <span className="text-xs font-bold text-gray-700">Vedení klubu Olymp Dance</span>
            </div>
          </div>
        </div>

        {/* Footer actions on screen */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end space-x-3 print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            Zavřít
          </button>
          <button
            onClick={handlePrint}
            className="bg-brand-blue text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md flex items-center"
          >
            <Printer size={18} className="mr-2" />
            Vytisknout / Uložit PDF
          </button>
        </div>
      </div>
    </div>
  );
};
