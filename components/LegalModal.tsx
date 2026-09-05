import React from 'react';
import { X, ShieldCheck, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { CONTACT_INFO, BANK_INFO } from '../constants';

export type LegalDocType = 'gdpr' | 'terms';

interface LegalModalProps {
  isOpen: boolean;
  type: LegalDocType;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, type, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80 sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              type === 'gdpr' ? 'bg-blue-100 text-brand-blue' : 'bg-red-100 text-brand-red'
            }`}>
              {type === 'gdpr' ? <ShieldCheck size={22} /> : <FileText size={22} />}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                {type === 'gdpr' 
                  ? 'Zásady zpracování a ochrany osobních údajů (GDPR)' 
                  : 'Obchodní podmínky a provozní řád'}
              </h2>
              <p className="text-xs text-gray-500">
                Taneční klub Olymp Olomouc • {CONTACT_INFO.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors shrink-0 ml-2"
            aria-label="Zavřít"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm sm:text-base text-gray-700 leading-relaxed">
          {type === 'gdpr' ? (
            <>
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs sm:text-sm text-blue-900">
                <p className="font-semibold mb-1 flex items-center">
                  <ShieldCheck size={16} className="mr-1.5 text-brand-blue" />
                  Stručné shrnutí pro rodiče:
                </p>
                <p>
                  Vaše osobní údaje i údaje vašich dětí chráníme v maximální možné míře. Od dětí nevyžadujeme telefonní čísla – veškerá komunikace probíhá výhradně s vámi jako zákonnými zástupci. Údaje využíváme pouze k organizaci tréninků, vedení docházky a vystavení dokladů.
                </p>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">1. Správce osobních údajů</h3>
                <p className="mb-2">
                  Správcem osobních údajů je spolek <strong>{CONTACT_INFO.name}</strong>, se sídlem {CONTACT_INFO.registeredOffice} (dále jen „Správce“).
                </p>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 my-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-700">Identifikační číslo (IČO):</span>
                    <strong className="font-mono text-gray-800">{CONTACT_INFO.ico}</strong>
                  </div>
                  <p className="text-gray-600">Sídlo: {CONTACT_INFO.registeredOffice}</p>
                  <p className="text-gray-600">Kontaktní e-mail: <a href={`mailto:${CONTACT_INFO.email}`} className="text-brand-blue font-medium underline">{CONTACT_INFO.email}</a></p>
                  <p className="text-gray-600">Kontaktní telefon: <a href={`tel:${CONTACT_INFO.phone.replace(/\s/g,'')}`} className="text-brand-blue font-medium">{CONTACT_INFO.phone}</a></p>
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">2. Rozsah zpracovávaných údajů</h3>
                <p className="mb-2">Zpracováváme pouze nezbytné údaje potřebné k bezpečnému a řádnému vedení lekcí:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-gray-700">
                  <li><strong>Údaje zákonného zástupce:</strong> Jméno a příjmení, e-mailová adresa, telefonní číslo, adresa trvalého bydliště.</li>
                  <li><strong>Údaje dítěte:</strong> Jméno a příjmení, datum narození / rodné číslo (vyžadováno pro evidenci, jednoznačnou identifikaci plateb a vystavení potvrzení pro zdravotní pojišťovnu), navštěvovaná škola a třída, informace o vyzvedávání ze školní družiny.</li>
                  <li><strong>Zdravotní údaje (pouze tábory):</strong> Potvrzení o bezinfekčnosti a zdravotní způsobilosti, případná dietní omezení nebo alergie (pouze pro zajištění bezpečnosti dítěte).</li>
                  <li className="text-brand-blue font-semibold">Od dětí nevyžadujeme ani neukládáme telefonní čísla. Kontakt je veden výhradně přes zákonného zástupce.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">3. Účel a právní základ zpracování</h3>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-gray-700">
                  <li><strong>Plnění smlouvy (čl. 6 odst. 1 písm. b) GDPR):</strong> Zajištění účasti dítěte na kroužcích, komunikace rozvrhů a omluvenek, vyzvedávání ze školních družin.</li>
                  <li><strong>Plnění právních povinností (čl. 6 odst. 1 písm. c) GDPR):</strong> Vedení účetnictví, daňová evidence a archivace platebních dokladů.</li>
                  <li><strong>Oprávněný zájem (čl. 6 odst. 1 písm. f) GDPR):</strong> Zajištění bezpečnosti a ochrany zdraví dětí během tréninků a táborů.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">4. Doba uchování a zabezpečení údajů</h3>
                <p className="text-xs sm:text-sm">
                  Osobní údaje jsou uchovávány po dobu trvání účasti v kroužku nebo na táboře a po dobu nezbytnou podle zákona o účetnictví (zpravidla 5–10 let pro účetní doklady). Veškerá data jsou zabezpečena v elektronických systémech s řízeným přístupem. K údajům mají přístup výhradně oprávnění lektoři a vedení klubu.
                </p>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">5. Vaše práva</h3>
                <p className="text-xs sm:text-sm mb-2">
                  Dle nařízení GDPR máte právo:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-gray-700">
                  <li>Požadovat přístup k vašim osobním údajům a kopii těchto údajů.</li>
                  <li>Požadovat opravu nesprávných nebo neaktuálních údajů.</li>
                  <li>Požadovat výmaz údajů (pokud již pominul zákonný důvod jejich uchování).</li>
                  <li>Podat stížnost u dozorového orgánu (Úřad pro ochranu osobních údajů, Pplk. Sochora 27, 170 00 Praha 7, <a href="https://www.uoou.cz" target="_blank" rel="noopener noreferrer" className="text-brand-blue underline">www.uoou.cz</a>).</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <div className="bg-red-50/70 border border-red-200 rounded-xl p-4 text-xs sm:text-sm text-red-900">
                <p className="font-semibold mb-1 flex items-center">
                  <AlertCircle size={16} className="mr-1.5 text-brand-red" />
                  Důležité informace pro rodiče:
                </p>
                <p>
                  Odesláním přihlášky souhlasíte s těmito podmínkami, organizací kroužků a termíny úhrad kurzovného. Pololetní kurzovné je splatné před zahájením pololetí.
                </p>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">1. Všeobecná ustanovení</h3>
                <p className="text-xs sm:text-sm">
                  Tyto obchodní podmínky a provozní řád upravují vztah mezi spolkem <strong>{CONTACT_INFO.name}</strong>, 
                  se sídlem {CONTACT_INFO.registeredOffice} (IČO: {CONTACT_INFO.ico}), 
                  a zákonnými zástupci přihlášených dětí do kroužků, tanečních kurzů a letních kempů.
                </p>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">2. Přihlášení a vznik smlouvy</h3>
                <p className="text-xs sm:text-sm">
                  Přihlášení dítěte probíhá prostřednictvím online registračního formuláře na webových stránkách www.olympdance.cz. 
                  Po odeslání přihlášky obdrží zákonný zástupce potvrzení a platební instrukce s QR kódem. Odesláním formuláře vzniká závazná přihláška.
                </p>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">3. Úhrada kurzovného</h3>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-gray-700">
                  <li>Kurzovné se hradí pololetně bezhotovostním převodem na účet číslo <strong>{BANK_INFO.account}</strong> (Raiffeisenbank) s použitím vygenerovaného variabilního symbolu nebo SPAY QR platby.</li>
                  <li>Kurzovné musí být uhrazeno v termínu splatnosti uvedeném v pokynech k platbě.</li>
                  <li className="font-semibold text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
                    Upozornění: V případě, že kurzovné nebude uhrazeno ve stanoveném termínu, může být částka kurzovného navýšena o 200 Kč z důvodu administrativního vymáhání a dodatečného párování plateb.
                  </li>
                  <li>Na vyžádání vystavujeme potvrzení pro zdravotní pojišťovny k čerpání finančních příspěvků na sportovní kroužky dětí.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">4. Vyzvedávání dětí z družiny a bezpečnost</h3>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-gray-700">
                  <li>Pokud je v přihlášce zvoleno vyzvednutí z družiny, lektor osobně vyzvedává přihlášené děti ze školní družiny v prostorách dané ZŠ a po skončení lekce je vrací zpět do družiny nebo předává osobně rodičům.</li>
                  <li>Dítě musí mít vhodný cvičební úbor a čistou sálovou obuv s nebarvící podrážkou.</li>
                  <li>Účastník je povinen řídit se pokyny lektora a dodržovat bezpečnostní řád tělocvičny.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">5. Omluvenky a absence</h3>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-gray-700">
                  <li>Absenci na lekci kroužku je možné omluvit předem v klientském portálu rodiče.</li>
                  <li>Za neodcvičené lekce z důvodu krátkodobé absence (rodinné důvody, krátkodobá nemoc) se kurzovné nevrací.</li>
                  <li>Při dlouhodobé nemoci (déle než 4 po sobě jdoucí týdny doložené lékařskou zprávou) lze po vzájemné dohodě převést poměrnou část kurzovného do následujícího období.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">6. Storno podmínky (Letní kempy a tábory)</h3>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-gray-700">
                  <li>Zrušení účasti více než 30 dní před zahájením kempu: vrácení 100 % uhrazené částky (nebo manipulační poplatek max. 200 Kč).</li>
                  <li>Zrušení účasti 15–29 dní před zahájením: storno poplatek 50 % z celkové ceny.</li>
                  <li>Zrušení účasti méně než 14 dní před zahájením: storno poplatek 80 % z celkové ceny (při zajištění náhradníka bez storno poplatku).</li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-brand-blue text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm shadow-sm flex items-center"
          >
            <CheckCircle2 size={16} className="mr-1.5" />
            Rozumím a zavřít
          </button>
        </div>
      </div>
    </div>
  );
};
