import React, { useState, useEffect } from 'react';
import { X, Printer, CheckCircle, ShieldCheck, Loader2, FileDown } from 'lucide-react';
import { CONTACT_INFO } from '../constants';

interface ConfirmationData {
  id?: number | string;
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
  const [isPreparing, setIsPreparing] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);

  // Add print isolation classes to body while modal is active
  useEffect(() => {
    document.body.classList.add('has-print-modal', 'print-portrait');
    
    // Preload logo for crisp printing
    const img = new Image();
    img.src = "https://web2.itnahodinu.cz/olympdance/logo.png";
    img.onload = () => setLogoLoaded(true);

    return () => {
      document.body.classList.remove('has-print-modal', 'print-portrait');
    };
  }, []);

  const handlePrint = () => {
    setIsPreparing(true);
    // Short timeout to ensure all DOM elements, fonts, and images are fully rasterized
    setTimeout(() => {
      window.print();
      setIsPreparing(false);
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn printable-modal-overlay printable-content-target print:p-0 print:bg-white print:overflow-visible">
      {/* Container */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl my-8 relative overflow-hidden flex flex-col max-h-[92vh] printable-modal-card print:max-h-none print:shadow-none print:my-0 print:border-none print:rounded-none print:w-full print:overflow-visible">
        
        {/* Modal Top Bar (Hidden on print) */}
        <div className="bg-brand-blue text-white px-6 py-4 flex justify-between items-center print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-yellow-400">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Potvrzení pro pojišťovnu a FKSP</h3>
              <p className="text-xs text-blue-200">Formulář pro čerpání příspěvku na pohybovou aktivitu dítěte</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {data.id && (
              <a
                href={data.activityType === 'tabor' ? `/api/registrations/${data.id}/confirmation-pdf` : `/api/school-registrations/${data.id}/confirmation-pdf`}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors flex items-center shadow-md"
                title="Stáhnout oficiální PDF s razítkem a podpisem 1:1"
              >
                <FileDown size={16} className="mr-2" />
                Oficiální PDF (1:1)
              </a>
            )}
            <button
              onClick={handlePrint}
              disabled={isPreparing}
              className="bg-white text-brand-blue px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors flex items-center shadow-md disabled:opacity-75"
            >
              {isPreparing ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Načítám tisk...
                </>
              ) : (
                <>
                  <Printer size={16} className="mr-2" />
                  Vytisknout / Uložit PDF
                </>
              )}
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
        <div className="p-8 sm:p-12 overflow-y-auto print:p-0 print:overflow-visible print:m-0 font-sans text-gray-900 bg-white print:w-full" id="printable-certificate">
          
          {/* Header */}
          <div className="border-b-2 border-brand-blue pb-5 mb-6 flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <img 
                src="https://web2.itnahodinu.cz/olympdance/logo.png" 
                alt="Olymp Dance Logo" 
                className="h-16 w-auto object-contain"
                loading="eager"
                crossOrigin="anonymous"
              />
              <div>
                <h1 className="text-lg font-bold text-brand-blue uppercase tracking-wide">Taneční klub Olymp Olomouc, z. s.</h1>
                <p className="text-xs text-gray-600">IČO: {CONTACT_INFO.ico} • Sídlo: {CONTACT_INFO.registeredOffice}</p>
                <p className="text-xs text-gray-600">Tréninkové centrum: {CONTACT_INFO.trainingLocation}</p>
                <p className="text-xs text-gray-600">Bankovní účet: 1806875329/5500 (Raiffeisenbank)</p>
                <p className="text-xs text-gray-600">Email: {CONTACT_INFO.email} • Tel: {CONTACT_INFO.phone} • Web: www.olympdance.cz</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block bg-blue-50 text-brand-blue text-xs font-bold px-3 py-1 rounded-full border border-blue-200 uppercase tracking-wider">
                Oficiální doklad
              </span>
              <p className="text-xs text-gray-500 mt-2">Vystaveno dne: <strong>{today}</strong></p>
            </div>
          </div>

          {/* Certificate Title */}
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tight">
              POTVRZENÍ O ÚČASTI A ÚHRADĚ
            </h2>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              Doklad pro uplatnění preventivního příspěvku u zdravotní pojišťovny nebo fondu FKSP / zaměstnavatele
            </p>
          </div>

          {/* Statement */}
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-5">
            Taneční klub <strong>Olymp Olomouc, z. s.</strong> tímto potvrzuje, že níže uvedený účastník se účastní 
            pravidelné sportovní a pohybové aktivity (taneční kroužek / tábor) zaměřené na zdravý tělesný rozvoj dětí a mládeže, 
            a byl za něj v plné výši uhrazen účastnický poplatek.
          </p>

          {/* Participant & Course Details Table */}
          <div className="bg-gray-50 rounded-2xl p-5 sm:p-6 border border-gray-200 mb-5 space-y-3 print:border-gray-300 print:bg-gray-50 print-avoid-break">
            <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-200 text-xs sm:text-sm">
              <div>
                <span className="text-gray-500 block text-[11px] font-bold uppercase tracking-wider">Jméno a příjmení dítěte:</span>
                <span className="font-bold text-base text-gray-900">{data.childName}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px] font-bold uppercase tracking-wider">Datum narození:</span>
                <span className="font-bold text-base text-gray-900">{data.childBirthDate || 'Neuvedeno'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-200 text-xs sm:text-sm">
              <div>
                <span className="text-gray-500 block text-[11px] font-bold uppercase tracking-wider">Zákonný zástupce (Rodič):</span>
                <span className="font-semibold text-gray-900">{data.parentName}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px] font-bold uppercase tracking-wider">Název aktivity:</span>
                <span className="font-bold text-brand-blue">{data.activityTitle}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-200 text-xs sm:text-sm">
              <div>
                <span className="text-gray-500 block text-[11px] font-bold uppercase tracking-wider">Místo konání:</span>
                <span className="font-medium text-gray-900">{data.location}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px] font-bold uppercase tracking-wider">Období / Termín:</span>
                <span className="font-medium text-gray-900">{data.periodOrDate}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1 text-xs sm:text-sm">
              <div>
                <span className="text-gray-500 block text-[11px] font-bold uppercase tracking-wider">Uhrazená částka:</span>
                <span className="text-lg sm:text-xl font-bold text-brand-red">{data.price}</span>
                {data.variableSymbol && (
                  <span className="block text-[11px] text-gray-500 mt-0.5">VS: {data.variableSymbol}</span>
                )}
              </div>
              <div>
                <span className="text-gray-500 block text-[11px] font-bold uppercase tracking-wider">Stav úhrady:</span>
                <span className="inline-flex items-center text-green-700 font-bold mt-1">
                  <CheckCircle size={16} className="mr-1.5 text-green-600 shrink-0" />
                  Uhrazeno v plné výši (Bankovní převod)
                </span>
              </div>
            </div>
          </div>

          {/* Insurance statement notes */}
          <div className="text-[11px] text-gray-600 space-y-1 mb-8 leading-normal bg-blue-50/60 p-3.5 rounded-xl border border-blue-100 print:bg-transparent print:p-0 print:border-none print-avoid-break">
            <p className="font-semibold text-gray-700">Potvrzení pro zdravotní pojišťovny:</p>
            <p>• Tento doklad splňuje veškeré legislativní náležitosti zdravotních pojišťoven v ČR (VZP 111, VoZP 201, ČPZP 205, OZP 207, ZPŠ 209, ZP MV ČR 211, RBP 213) pro čerpání finančního příspěvku na sportovní a pohybové aktivity dětí.</p>
            <p>• Doklad slouží rovněž pro uplatnění příspěvku ze sociálního fondu FKSP u zaměstnavatele.</p>
          </div>

          {/* Signature & Official Club Stamp Section */}
          <div className="pt-4 flex justify-between items-end border-t-2 border-gray-200 print-avoid-break">
            <div className="text-xs text-gray-600 space-y-0.5">
              <p className="font-bold text-gray-800 text-sm">Taneční klub Olymp Olomouc, z. s.</p>
              <p>Sídlo: {CONTACT_INFO.registeredOffice}</p>
              <p>Tréninky: {CONTACT_INFO.trainingLocation}</p>
              <p>IČO: {CONTACT_INFO.ico}</p>
              <p>IBAN: CZ08 5500 0000 0018 0687 5329</p>
            </div>

            {/* Stamp and Signature Box */}
            <div className="flex items-center gap-6 text-center">
              {/* Authenticated Stamp graphic */}
              <div className="border-2 border-brand-blue/80 rounded-full w-24 h-24 p-1 flex flex-col items-center justify-center text-brand-blue/90 shadow-xs print:border-brand-blue">
                <div className="text-[7px] font-bold uppercase tracking-wider text-center">
                  OLYMP OLOMOUC
                </div>
                <div className="text-[11px] font-black uppercase my-0.5 text-brand-red">
                  ★ Z. S. ★
                </div>
                <div className="text-[7px] font-semibold">
                  IČO: {CONTACT_INFO.ico}
                </div>
                <div className="text-[6px] font-bold uppercase mt-0.5 tracking-tight">
                  TANEČNÍ KLUB
                </div>
              </div>

              <div className="w-44 text-center">
                <div className="border-b border-gray-400 pb-1 mb-1">
                  <span className="text-[11px] text-gray-400 italic">Podpis statutárního zástupce</span>
                </div>
                <span className="text-xs font-bold text-gray-800">Vedení klubu Olymp Dance</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions on screen */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center print:hidden">
          <p className="text-xs text-gray-500">
            Tip: V dialogu tisku můžete zvolit <strong>Uložit jako PDF</strong>.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors text-sm"
            >
              Zavřít
            </button>
            <button
              onClick={handlePrint}
              disabled={isPreparing}
              className="bg-brand-blue text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md flex items-center text-sm disabled:opacity-75"
            >
              {isPreparing ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Načítám...
                </>
              ) : (
                <>
                  <Printer size={16} className="mr-2" />
                  Vytisknout / Uložit PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

