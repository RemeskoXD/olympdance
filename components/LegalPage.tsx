import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ShieldCheck, FileText, ArrowLeft, Building2, Mail, Phone } from 'lucide-react';
import { CONTACT_INFO, BANK_INFO } from '../constants';

export const LegalPage: React.FC = () => {
  const location = useLocation();
  const isGdpr = location.pathname.includes('gdpr');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation back */}
        <div className="mb-6 flex items-center justify-between">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm font-semibold text-gray-600 hover:text-brand-blue transition-colors"
          >
            <ArrowLeft size={16} className="mr-1.5" />
            Zpět na hlavní stránku
          </Link>

          <div className="flex gap-2">
            <Link
              to="/gdpr"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isGdpr 
                  ? 'bg-brand-blue text-white shadow-xs' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Zásady GDPR
            </Link>
            <Link
              to="/obchodni-podminky"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                !isGdpr 
                  ? 'bg-brand-blue text-white shadow-xs' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Obchodní podmínky
            </Link>
          </div>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
          <div className="p-6 sm:p-10 border-b border-gray-100 bg-gradient-to-r from-blue-50/60 to-white">
            <div className="flex items-center gap-3 sm:gap-4 mb-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                isGdpr ? 'bg-blue-100 text-brand-blue' : 'bg-red-100 text-brand-red'
              }`}>
                {isGdpr ? <ShieldCheck size={26} /> : <FileText size={26} />}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  {isGdpr 
                    ? 'Zásady ochrany osobních údajů (GDPR)' 
                    : 'Obchodní podmínky a provozní řád'}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  {CONTACT_INFO.name} • Sídlo: {CONTACT_INFO.registeredOffice}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10 space-y-8 text-gray-700 leading-relaxed text-sm sm:text-base">
            {isGdpr ? (
              <>
                <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-5 text-sm text-blue-900">
                  <p className="font-bold mb-1 flex items-center text-brand-blue">
                    <ShieldCheck size={18} className="mr-1.5 shrink-0" />
                    Přehled pro zákonné zástupce:
                  </p>
                  <p>
                    Vážíme si vaší důvěry. Údaje o dětech a rodičích zpracováváme výhradně za účelem organizace kroužků a táborů. Od dětí nikdy nevyžadujeme telefonní čísla – komunikace probíhá vždy pouze se zákonnými zástupci.
                  </p>
                </div>

                <section>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">1. Správce osobních údajů</h2>
                  <p className="mb-3">
                    Správcem osobních údajů dle nařízení Evropského parlamentu a Rady (EU) 2016/679 (GDPR) je spolek <strong>{CONTACT_INFO.name}</strong>, 
                    se sídlem {CONTACT_INFO.registeredOffice} (dále jen „Správce“).
                  </p>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-1.5 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">Identifikační číslo (IČO):</span>
                      <strong className="font-mono text-gray-900 font-semibold">{CONTACT_INFO.ico}</strong>
                    </div>
                    <p className="text-gray-600">Sídlo: {CONTACT_INFO.registeredOffice}</p>
                    <p className="text-gray-600 flex items-center">
                      <Mail size={14} className="mr-1.5 text-gray-500" />
                      E-mail: <a href={`mailto:${CONTACT_INFO.email}`} className="text-brand-blue font-medium underline ml-1">{CONTACT_INFO.email}</a>
                    </p>
                    <p className="text-gray-600 flex items-center">
                      <Phone size={14} className="mr-1.5 text-gray-500" />
                      Telefon: <a href={`tel:${CONTACT_INFO.phone.replace(/\s/g,'')}`} className="text-brand-blue font-medium ml-1">{CONTACT_INFO.phone}</a>
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">2. Jaké údaje zpracováváme</h2>
                  <p className="mb-3">Evidujeme pouze údaje nezbytné pro přihlášení, účast na trénincích a fakturaci:</p>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                    <li><strong>Údaje zákonného zástupce:</strong> Jméno a příjmení, kontaktní telefonní číslo, e-mailová adresa, adresa bydliště.</li>
                    <li><strong>Údaje dítěte:</strong> Jméno a příjmení, datum narození / rodné číslo (nezbytné pro pojišťovny, identifikaci plateb a evidenci docházky), navštěvovaná škola a třída, informace o družině.</li>
                    <li><strong>Zdravotní způsobilost (tábory):</strong> Posudek o bezinfekčnosti a zdravotní informace nutné pro bezpečnost na pobytových akcích.</li>
                    <li className="font-semibold text-brand-blue">Od dětí nevyžadujeme žádná telefonní čísla; veškeré kontakty vedeme výhradně s rodiči.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">3. Účel zpracování a právní základ</h2>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                    <li><strong>Plnění smlouvy (čl. 6 odst. 1 písm. b) GDPR):</strong> Zajištění řádného průběhu tanečních lekcí, vyzvedávání dětí z družin a komunikace změn.</li>
                    <li><strong>Zákonná povinnost (čl. 6 odst. 1 písm. c) GDPR):</strong> Vedení účetnictví, správa daňových dokladů a potvrzení pro pojišťovny.</li>
                    <li><strong>Oprávněný zájem (čl. 6 odst. 1 písm. f) GDPR):</strong> Bezpečnost dětí a ochrana majetku.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">4. Doba uložení a vaše práva</h2>
                  <p className="text-sm mb-3">
                    Údaje uchováváme po dobu trvání členství nebo docházky a následně dle zákonných lhůt (zpravidla 5 až 10 let u účetních dokladů).
                  </p>
                  <p className="text-sm mb-2">Jako subjekt údajů máte právo na:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                    <li>Přístup k osobním údajům a poskytnutí jejich kopie.</li>
                    <li>Opravu či doplnění neúplných údajů.</li>
                    <li>Výmaz údajů, pominul-li účel nebo zákonný důvod jejich zpracování.</li>
                    <li>Podání stížnosti u Úřadu pro ochranu osobních údajů (www.uoou.cz).</li>
                  </ul>
                </section>
              </>
            ) : (
              <>
                <section>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">1. Všeobecná ustanovení</h2>
                  <p className="text-sm">
                    Tyto obchodní podmínky a provozní řád upravují práva a povinnosti mezi spolkem <strong>{CONTACT_INFO.name}</strong>, 
                    se sídlem {CONTACT_INFO.registeredOffice} (IČO: {CONTACT_INFO.ico}), 
                    a zákonnými zástupci dětí přihlášených do tanečních kroužků a táborů.
                  </p>
                </section>

                <section>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">2. Přihlášení a kurzovné</h2>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                    <li>Přihláška do kroužku nebo na kemp je závazná okamžikem odeslání elektronického formuláře.</li>
                    <li>Kurzovné se platí pololetně na bankovní účet <strong>{BANK_INFO.account}</strong> (Raiffeisenbank) s použitím SPAY QR platby nebo uvedených údajů.</li>
                    <li className="font-semibold text-amber-900 bg-amber-50 p-3 rounded-lg border border-amber-200">
                      Upozornění k platbám: V případě neuhrazení kurzovného v termínu splatnosti bude cena kurzovného navýšena o 200 Kč z důvodu zvýšených administrativních nákladů.
                    </li>
                    <li>Na vyžádání vystavujeme potvrzení o úhradě pro čerpání příspěvků od zdravotních pojišťoven.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">3. Vyzvedávání ze školních družin</h2>
                  <p className="text-sm">
                    Pokud je v přihlášce zaškrtnuta volba vyzvednutí z družiny, lektor osobně přebírá dítě od vychovatele družiny na dané základní škole a po ukončení tréninku jej opět do družiny předává.
                  </p>
                </section>

                <section>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">4. Omluvenky a absence</h2>
                  <p className="text-sm mb-2">
                    Absence dětí se omlouvají v klientském portálu. Při krátkodobé absenci se kurzovné nevrací. Při doložené dlouhodobé nemoci (déle než 4 týdny) lze po dohodě poměrnou část převést na další pololetí.
                  </p>
                </section>

                <section>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">5. Storno podmínky letních táborů</h2>
                  <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-700">
                    <li>Zrušení více než 30 dní předem: 100% vrácení (nebo manipulační poplatek 200 Kč).</li>
                    <li>Zrušení 15–29 dní předem: storno poplatek 50 % z ceny.</li>
                    <li>Zrušení méně než 14 dní předem: storno poplatek 80 % (nebo bez poplatku při zajištění náhradníka).</li>
                  </ul>
                </section>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
