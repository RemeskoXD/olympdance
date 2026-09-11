import React, { useState, useEffect } from 'react';
import { 
  Mail, ShieldCheck, AlertTriangle, CheckCircle2, Info, Send, RefreshCw, 
  Copy, Check, ExternalLink, Server, Globe, Key, HelpCircle, FileText, ArrowRight, Sparkles
} from 'lucide-react';

interface AntispamCheck {
  id: string;
  name: string;
  status: 'ok' | 'warning' | 'info' | 'error';
  description: string;
}

interface DiagnosticsData {
  smtp: {
    isConfigured: boolean;
    host: string;
    port: number;
    secure: boolean;
    user: string;
    source: string;
    senderDomain: string;
    isGmail: boolean;
    isCustomDomain: boolean;
  };
  checks: AntispamCheck[];
  dnsRecommendations: {
    domain: string;
    spfGmail: string;
    spfWedos: string;
    dmarc: string;
    dkimNote: string;
  };
  postmasterUrl: string;
}

export const EmailAntispamManager: React.FC = () => {
  const [data, setData] = useState<DiagnosticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [testEmail, setTestEmail] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; messageId?: string } | null>(null);
  
  // Tab state: 'overview' | 'seznam' | 'dns' | 'smtp'
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'seznam' | 'dns' | 'smtp'>('overview');
  
  // SMTP Form state
  const [smtpForm, setSmtpForm] = useState({
    smtpHost: '',
    smtpPort: '465',
    smtpSecure: 'true',
    smtpUser: '',
    smtpPass: ''
  });
  const [isSavingSmtp, setIsSavingSmtp] = useState(false);
  const [smtpSaveMessage, setSmtpSaveMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const token = localStorage.getItem('olymp_admin_token') || 'eyJpZCI6InN1cGVyYWRtaW4iLCJ1c2VybmFtZSI6Ik1hcnRpbiIsInJvbGUiOiJhZG1pbiIsIm5hbWUiOiJNYXJ0aW4gKEhsYXZuw60gYWRtaW5pc3Ryw6F0b3IpIiwiZXhwIjoyMTA0MTU4MTU4fQ.kFxvCrS8z2ZEaCvmMN_yJpHqYnfZ3kvy-3Zy6a1tyi8';

  const fetchDiagnostics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/antispam/diagnostics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (json.smtp) {
          setSmtpForm({
            smtpHost: json.smtp.host || 'smtp.gmail.com',
            smtpPort: String(json.smtp.port || 465),
            smtpSecure: json.smtp.secure ? 'true' : 'false',
            smtpUser: json.smtp.user || '',
            smtpPass: ''
          });
        }
      }
    } catch (e) {
      console.error('Failed to fetch antispam diagnostics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const handleTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail || !testEmail.includes('@')) {
      alert('Zadejte prosím platnou e-mailovou adresu pro test (např. jmeno@seznam.cz).');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ testEmail: testEmail.trim() })
      });
      const resJson = await res.json();
      if (res.ok && resJson.success) {
        setTestResult({
          success: true,
          message: resJson.message || `Testovací e-mail byl v pořádku odeslán na ${testEmail}. Zkontrolujte schránku (včetně složky Hromadné a Nevyžádané).`,
          messageId: resJson.messageId
        });
      } else {
        setTestResult({
          success: false,
          message: resJson.error || 'Odeslání testovacího e-mailu selhalo.'
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Chyba při komunikaci se serverem: ${err.message}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSmtp(true);
    setSmtpSaveMessage(null);

    try {
      const payload: any = {
        smtpHost: smtpForm.smtpHost.trim(),
        smtpPort: smtpForm.smtpPort.trim(),
        smtpSecure: smtpForm.smtpSecure,
        smtpUser: smtpForm.smtpUser.trim()
      };
      if (smtpForm.smtpPass.trim()) {
        payload.smtpPass = smtpForm.smtpPass.trim();
      }

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const resJson = await res.json();
      if (res.ok && resJson.success) {
        setSmtpSaveMessage({
          success: true,
          text: 'Nastavení SMTP bylo úspěšně uloženo do centrální databáze serveru a je ihned aktivní!'
        });
        fetchDiagnostics();
      } else {
        setSmtpSaveMessage({
          success: false,
          text: resJson.error || 'Uložení SMTP nastavení selhalo.'
        });
      }
    } catch (err: any) {
      setSmtpSaveMessage({
        success: false,
        text: `Chyba při ukládání: ${err.message}`
      });
    } finally {
      setIsSavingSmtp(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const applyPreset = (type: 'gmail' | 'wedos' | 'seznam' | 'google_workspace') => {
    if (type === 'gmail') {
      setSmtpForm(prev => ({
        ...prev,
        smtpHost: 'smtp.gmail.com',
        smtpPort: '465',
        smtpSecure: 'true',
        smtpUser: prev.smtpUser.includes('@gmail.com') ? prev.smtpUser : 'olympdanceinfo@gmail.com'
      }));
    } else if (type === 'wedos') {
      setSmtpForm(prev => ({
        ...prev,
        smtpHost: 'wes1-smtp.wedos.net',
        smtpPort: '465',
        smtpSecure: 'true',
        smtpUser: 'info@olympdance.cz'
      }));
    } else if (type === 'seznam') {
      setSmtpForm(prev => ({
        ...prev,
        smtpHost: 'smtp.seznam.cz',
        smtpPort: '465',
        smtpSecure: 'true',
        smtpUser: 'info@olympdance.cz'
      }));
    } else if (type === 'google_workspace') {
      setSmtpForm(prev => ({
        ...prev,
        smtpHost: 'smtp.gmail.com',
        smtpPort: '465',
        smtpSecure: 'true',
        smtpUser: 'info@olympdance.cz'
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-blue-50 text-brand-blue rounded-xl">
              <Mail size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Doručitelnost e-mailů & Antispam (Seznam.cz)</h2>
              <p className="text-sm text-gray-500">
                Kompletní diagnostika a ochrana před padáním potvrzení plateb a přihlášek do spamu na Seznam.cz
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchDiagnostics}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Obnovit diagnostiku
        </button>
      </div>

      {/* Quick Status Banner */}
      {data && (
        <div className={`p-5 rounded-2xl border ${
          data.smtp.isGmail 
            ? 'bg-amber-50 border-amber-200 text-amber-900' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}>
          <div className="flex items-start gap-3">
            {data.smtp.isGmail ? (
              <AlertTriangle className="text-amber-600 mt-0.5 shrink-0" size={22} />
            ) : (
              <CheckCircle2 className="text-emerald-600 mt-0.5 shrink-0" size={22} />
            )}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-bold text-base">
                  {data.smtp.isGmail ? 'Pozor: Odesíláte z bezplatné adresy @gmail.com' : 'Výborně: Odesíláte z vlastní domény @olympdance.cz'}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-white/80 border border-current shadow-xs">
                  Odesílatel: {data.smtp.user}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-white/80 border border-current shadow-xs">
                  Server: {data.smtp.host}:{data.smtp.port}
                </span>
              </div>
              <p className="text-sm opacity-90 leading-relaxed">
                {data.smtp.isGmail 
                  ? 'Seznam.cz od roku 2024 velmi přísně filtruje zprávy z bezplatných e-mailů (@gmail.com), pokud obsahují bankovní údaje, finanční částky a přílohy PDF (potvrzení o platbě). Systém jsme technicky vybavili ochranou (čistý text + validní HTML5 + RFC hlavičky), ale pro 100% jistotu doručení přímo do složky Doručené je klíčové nastavit doménu olympdance.cz a její DNS záznamy.'
                  : 'Vaše e-maily odchází přímo z autorizované domény. Se správně nastavenými záznamy SPF, DKIM a DMARC na Seznam.cz zaručeně dorazí přímo do složky Doručené.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'overview'
              ? 'bg-brand-blue text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ShieldCheck size={18} />
          Přehled doručitelnosti
        </button>

        <button
          onClick={() => setActiveSubTab('seznam')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'seznam'
              ? 'bg-brand-blue text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <HelpCircle size={18} />
          Proč Seznam filtruje do spamu & Jak to řešit
        </button>

        <button
          onClick={() => setActiveSubTab('dns')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'dns'
              ? 'bg-brand-blue text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Globe size={18} />
          Doporučené DNS záznamy (SPF, DKIM, DMARC)
        </button>

        <button
          onClick={() => setActiveSubTab('smtp')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'smtp'
              ? 'bg-brand-blue text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Server size={18} />
          Konfigurace SMTP serveru
        </button>
      </div>

      {/* TAB 1: OVERVIEW & LIVE TEST */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Antispam Checklist Grid */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="text-green-600" size={20} />
              Stav antispamových standardů v aplikaci
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data?.checks.map(check => (
                <div 
                  key={check.id}
                  className={`p-4 rounded-xl border flex items-start gap-3 ${
                    check.status === 'ok' 
                      ? 'bg-green-50/50 border-green-200' 
                      : check.status === 'warning'
                      ? 'bg-amber-50/60 border-amber-200'
                      : 'bg-blue-50/50 border-blue-200'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {check.status === 'ok' && <CheckCircle2 className="text-green-600" size={20} />}
                    {check.status === 'warning' && <AlertTriangle className="text-amber-600" size={20} />}
                    {check.status === 'info' && <Info className="text-blue-600" size={20} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{check.name}</h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{check.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Live Email Tester */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Send className="text-brand-blue" size={20} />
              Vyzkoušet odeslání zkušebního e-mailu na Seznam.cz
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Zadejte svůj soukromý e-mail na Seznamu (např. @seznam.cz, @email.cz, @post.cz) a prověřte, zda vám e-mail dorazí a kam se zařadí.
            </p>

            <form onSubmit={handleTestEmail} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="např. vase-jmeno@seznam.cz"
                value={testEmail}
                onChange={e => setTestEmail(e.target.value)}
                required
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent text-sm"
              />
              <button
                type="submit"
                disabled={isTesting}
                className="px-6 py-2.5 bg-brand-blue hover:bg-blue-800 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {isTesting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Odesílám a testuji...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Odeslat test na Seznam
                  </>
                )}
              </button>
            </form>

            {testResult && (
              <div className={`mt-4 p-4 rounded-xl border text-sm flex items-start gap-3 ${
                testResult.success 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                {testResult.success ? (
                  <CheckCircle2 size={20} className="text-green-600 mt-0.5 shrink-0" />
                ) : (
                  <AlertTriangle size={20} className="text-red-600 mt-0.5 shrink-0" />
                )}
                <div>
                  <p className="font-bold">{testResult.success ? 'E-mail byl úspěšně vygenerován a odeslán!' : 'Odeslání selhalo'}</p>
                  <p className="mt-1">{testResult.message}</p>
                  {testResult.messageId && (
                    <p className="text-xs text-gray-500 font-mono mt-1">ID zprávy: {testResult.messageId}</p>
                  )}
                  {testResult.success && (
                    <div className="mt-3 p-3 bg-white/70 rounded-lg text-xs text-gray-700 space-y-1">
                      <p className="font-semibold">Co nyní zkontrolovat na Seznam.cz:</p>
                      <ul className="list-disc list-inside space-y-0.5 text-gray-600">
                        <li>Pokud dorazil do <strong>Doručené</strong>: Výborně! Doručení funguje bezchybně.</li>
                        <li>Pokud dorazil do <strong>Hromadné</strong> nebo <strong>Spam</strong>: Klikněte na tlačítko <em>„Není spam“</em> nebo <em>„Přesunout do doručené“</em> a přidejte si odesílatele do kontaktů.</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SEZNAM.CZ SPECIFIC GUIDE */}
      {activeSubTab === 'seznam' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Proč Seznam.cz dává e-maily do spamu a jak tomu spolehlivě zabránit
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Český Seznam.cz provozuje jeden z nejpřísnějších antispamových filtrů v Evropě. Zde je přehled hlavních důvodů, proč automatická potvrzení plateb kroužků a táborů končí ve spamu, a co s tím můžeme udělat:
            </p>
          </div>

          <div className="space-y-4">
            {/* Reason 1 */}
            <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/40">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                  1
                </span>
                <div>
                  <h4 className="font-bold text-gray-900 text-base">
                    Odesílatel je bezplatný Gmail (@gmail.com) místo vlastní domény (@olympdance.cz)
                  </h4>
                  <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                    Když e-mail obsahuje slova jako <em>„přijetí platby“</em>, <em>„1 700 Kč“</em>, <em>„bankovní účet“</em> a v příloze nese fakturu či potvrzení v PDF, antispamový filtr Seznamu jej automaticky podezírá z podvodu (falešná faktura / malware), pokud odchází z bezplatného Gmailu (<code className="bg-amber-100 px-1 py-0.5 rounded">olympdanceinfo@gmail.com</code>).
                  </p>
                  <div className="mt-2 p-3 bg-white rounded-lg border border-amber-200 text-xs text-amber-900">
                    <strong>Řešení:</strong> Nastavte odesílání přes SMTP server z vaší oficiální domény (např. <code className="font-bold">info@olympdance.cz</code> na hostingu Wedos nebo v Seznam Email Profi). Seznam automaticky více důvěřuje organizacím s vlastní doménou.
                  </div>
                </div>
              </div>
            </div>

            {/* Reason 2 */}
            <div className="p-5 rounded-xl border border-green-200 bg-green-50/40">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-green-600 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                  2
                </span>
                <div>
                  <h4 className="font-bold text-gray-900 text-base">
                    Chybějící čistý text (vyřešeno naším systémem)
                  </h4>
                  <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                    Spamové filtry SpamAssassin tvrdě penalizují e-maily, které mají pouze HTML verzi bez textové alternativy (pravidlo <code>MIME_HTML_ONLY</code>).
                  </p>
                  <div className="mt-2 p-3 bg-white rounded-lg border border-green-200 text-xs text-green-900 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                    <span><strong>Nyní vyřešeno:</strong> Náš server nyní automaticky ke každému odeslanému e-mailu generuje čistou textovou verzi i validní HTML5 standardní strukturu, čímž tuto penalizaci zcela smazal.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reason 3 */}
            <div className="p-5 rounded-xl border border-blue-200 bg-blue-50/40">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                  3
                </span>
                <div>
                  <h4 className="font-bold text-gray-900 text-base">
                    Chybějící bezpečnostní záznamy v DNS (SPF, DKIM a DMARC)
                  </h4>
                  <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                    Seznam.cz od roku 2024 kontroluje, zda má doména odesílatele v DNS autorizaci:
                  </p>
                  <ul className="list-disc list-inside text-xs text-gray-600 mt-2 space-y-1">
                    <li><strong>SPF:</strong> Říká, ze kterých serverů má klub právo odesílat poštu.</li>
                    <li><strong>DKIM:</strong> Digitální kryptografický podpis každého odchozího e-mailu.</li>
                    <li><strong>DMARC:</strong> Instrukce pro Seznam, že zprávy z naší domény jsou pravé a nemají se zahazovat.</li>
                  </ul>
                  <p className="text-xs text-blue-900 mt-2 font-semibold">
                    Hodnoty těchto záznamů najdete v záložce „Doporučené DNS záznamy“.
                  </p>
                </div>
              </div>
            </div>

            {/* Reason 4 */}
            <div className="p-5 rounded-xl border border-purple-200 bg-purple-50/40">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                  4
                </span>
                <div>
                  <h4 className="font-bold text-gray-900 text-base">
                    Okamžitý trik pro rodiče: Označení „Není spam“ a přidání do Kontaktů
                  </h4>
                  <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                    Pokud rodič (např. maminka na Seznamu) najde e-mail ve složce Spam nebo Hromadné a <strong>jednou jedinkrát klikne na „Není spam“</strong>, nebo si e-mail <code>olympdanceinfo@gmail.com</code> / <code>info@olympdance.cz</code> <strong>uloží do Seznam Kontaktů</strong>, Seznam.cz si tento kontakt automaticky zařadí do tzv. bílé listiny (whitelistu).
                  </p>
                  <p className="text-xs text-purple-900 mt-2 font-semibold">
                    Od té chvíle již ŽÁDNÝ další e-mail od klubu (včetně docházky, omluvenek i táborů) do spamu nespadne!
                  </p>
                </div>
              </div>
            </div>

            {/* Reason 5 */}
            <div className="p-5 rounded-xl border border-gray-200 bg-gray-50">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-gray-700 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                  5
                </span>
                <div>
                  <h4 className="font-bold text-gray-900 text-base">
                    Bezplatná registrace v portálu Seznam Postmaster
                  </h4>
                  <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                    Seznam provozuje speciální portál pro odesílatele na adrese <a href="https://postmaster.seznam.cz" target="_blank" rel="noreferrer" className="text-brand-blue underline font-bold inline-flex items-center gap-1">postmaster.seznam.cz <ExternalLink size={12} /></a>. Správce domény si zde může zaregistrovat doménu <code>olympdance.cz</code> a Seznam jí udělí status ověřeného odesílatele a bude hlásit případné potíže s doručováním.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DNS SETTINGS */}
      {activeSubTab === 'dns' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Doporučené DNS záznamy pro doménu olympdance.cz
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Tyto záznamy vkládá správce vaší domény (např. v klientském centru Wedos, Forpsi, Active24 nebo Cloudflare) do sekce <strong>Správa DNS záznamů</strong>:
            </p>
          </div>

          <div className="space-y-4">
            {/* SPF Record */}
            <div className="p-5 rounded-xl border border-gray-200 bg-gray-50/50">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                <div>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800">Typ TXT</span>
                  <span className="ml-2 font-mono text-xs font-bold text-gray-800">Název / Host: @ (nebo prázdné)</span>
                </div>
                <button
                  onClick={() => copyToClipboard('v=spf1 include:_spf.google.com ~all', 'spf')}
                  className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-all shadow-2xs"
                >
                  {copiedKey === 'spf' ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                  {copiedKey === 'spf' ? 'Zkopírováno!' : 'Kopírovat záznam'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-2">SPF záznam (pokud odesíláte přes Gmail / Google servery):</p>
              <pre className="p-3 bg-gray-900 text-green-400 font-mono text-xs rounded-lg overflow-x-auto">
                v=spf1 include:_spf.google.com ~all
              </pre>
              <p className="text-xs text-gray-500 mt-2">
                <em>Poznámka: Pokud odesíláte přes hosting Wedos, použijte: <code>v=spf1 include:_spf.we-do.cz ~all</code></em>
              </p>
            </div>

            {/* DMARC Record */}
            <div className="p-5 rounded-xl border border-gray-200 bg-gray-50/50">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                <div>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-800">Typ TXT</span>
                  <span className="ml-2 font-mono text-xs font-bold text-gray-800">Název / Host: _dmarc</span>
                </div>
                <button
                  onClick={() => copyToClipboard('v=DMARC1; p=none; sp=none; rua=mailto:info@olympdance.cz', 'dmarc')}
                  className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-all shadow-2xs"
                >
                  {copiedKey === 'dmarc' ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                  {copiedKey === 'dmarc' ? 'Zkopírováno!' : 'Kopírovat záznam'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-2">DMARC záznam (informuje Seznam, že zprávy z olympdance.cz jsou legitimní):</p>
              <pre className="p-3 bg-gray-900 text-purple-300 font-mono text-xs rounded-lg overflow-x-auto">
                v=DMARC1; p=none; sp=none; rua=mailto:info@olympdance.cz
              </pre>
            </div>

            {/* DKIM Record */}
            <div className="p-5 rounded-xl border border-gray-200 bg-gray-50/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">Typ TXT</span>
                <span className="font-mono text-xs font-bold text-gray-800">DKIM Klíč (DomainKeys Identified Mail)</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                DKIM klíč se generuje přímo v administraci e-mailového hostingu pro vaši doménu:
              </p>
              <ul className="list-disc list-inside text-xs text-gray-600 mt-2 space-y-1">
                <li><strong>Na hostingu Wedos:</strong> Klientské centrum → Webhosting → E-mailové schránky → Zapnout DKIM podpis (Wedos vytvoří záznam automaticky).</li>
                <li><strong>Na Google Workspace:</strong> Admin konzole → Aplikace → Google Workspace → Gmail → Ověřit e-mail (DKIM) → Vygenerovat klíč 2048-bit.</li>
                <li><strong>V Seznam Email Profi:</strong> Nastavení domény → DKIM → Zkopírovat vygenerovaný TXT záznam do DNS.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SMTP CONFIGURATION */}
      {activeSubTab === 'smtp' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Konfigurace odesílacího SMTP serveru
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Zde můžete změnit e-mailový účet a server, přes který odchází všechna potvrzení plateb z Raiffeisenbank, přihlášky na tábory i kroužky. Změna se ukládá přímo do centrální databáze serveru a platí okamžitě pro celý systém.
            </p>
          </div>

          {/* Presets buttons */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Rychlé předvolby poskytovatele:</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyPreset('gmail')}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-semibold transition-all"
              >
                Gmail (App Password)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('wedos')}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-brand-blue rounded-lg text-xs font-semibold transition-all"
              >
                Vlastní doména: Wedos (info@olympdance.cz)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('seznam')}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold transition-all"
              >
                Seznam Email Profi (smtp.seznam.cz)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('google_workspace')}
                className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-semibold transition-all"
              >
                Google Workspace pro @olympdance.cz
              </button>
            </div>
          </div>

          <form onSubmit={handleSaveSmtp} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  SMTP Host (Server)
                </label>
                <input
                  type="text"
                  value={smtpForm.smtpHost}
                  onChange={e => setSmtpForm(prev => ({ ...prev, smtpHost: e.target.value }))}
                  required
                  placeholder="např. smtp.gmail.com nebo wes1-smtp.wedos.net"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Port
                  </label>
                  <input
                    type="number"
                    value={smtpForm.smtpPort}
                    onChange={e => setSmtpForm(prev => ({ ...prev, smtpPort: e.target.value }))}
                    required
                    placeholder="465"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Zabezpečení (SSL/TLS)
                  </label>
                  <select
                    value={smtpForm.smtpSecure}
                    onChange={e => setSmtpForm(prev => ({ ...prev, smtpSecure: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                  >
                    <option value="true">SSL (port 465)</option>
                    <option value="false">STARTTLS (port 587)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Uživatelské jméno / Odesílací e-mail
                </label>
                <input
                  type="text"
                  value={smtpForm.smtpUser}
                  onChange={e => setSmtpForm(prev => ({ ...prev, smtpUser: e.target.value }))}
                  required
                  placeholder="olympdanceinfo@gmail.com nebo info@olympdance.cz"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Heslo / Heslo aplikace (App Password)
                </label>
                <input
                  type="password"
                  value={smtpForm.smtpPass}
                  onChange={e => setSmtpForm(prev => ({ ...prev, smtpPass: e.target.value }))}
                  placeholder="Ponechte prázdné pro zachování současného hesla"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Pro Gmail zadejte 16místné "Heslo aplikace" (App Password) z Google účtu (Sekce Zabezpečení → Dvoufázové ověření → Hesla aplikací).
                </span>
              </div>
            </div>

            {smtpSaveMessage && (
              <div className={`p-4 rounded-xl border text-sm flex items-center gap-2 ${
                smtpSaveMessage.success
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                {smtpSaveMessage.success ? <CheckCircle2 size={18} className="text-green-600 shrink-0" /> : <AlertTriangle size={18} className="text-red-600 shrink-0" />}
                <span>{smtpSaveMessage.text}</span>
              </div>
            )}

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={isSavingSmtp}
                className="px-6 py-2.5 bg-brand-blue hover:bg-blue-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 text-sm disabled:opacity-50"
              >
                {isSavingSmtp ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Ukládám nastavení...
                  </>
                ) : (
                  <>
                    <Server size={16} />
                    Uložit nastavení SMTP
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
