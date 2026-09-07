import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Upload, 
  Lock, 
  ExternalLink, 
  FileCheck, 
  Search, 
  Check,
  Clock,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';

interface RbStatus {
  clientId: string;
  rawClientId: string;
  hasClientSecret?: boolean;
  clientSecret?: string;
  rawClientSecret?: string;
  accountNumber: string;
  hasCert: boolean;
  certSource: string;
  certFilename: string;
  hasPassword: boolean;
  lastSync: string | null;
  syncStatus: string;
  matchedPaymentsCount: number;
}

interface PaymentLog {
  id: number;
  transactionId: string;
  bookingDate: string;
  amount: number;
  currency: string;
  variableSymbol: string | null;
  senderAccount: string | null;
  senderName: string | null;
  message: string | null;
  matchedType: 'school' | 'camp' | 'merch' | 'unmatched';
  matchedId: string | null;
  matchedName: string | null;
  status: string;
  createdAt: string;
}

export const RbBankManager: React.FC = () => {
  const [status, setStatus] = useState<RbStatus | null>(null);
  const [logs, setLogs] = useState<PaymentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string; newMatched?: number } | null>(null);

  // Form inputs
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [accountNumber, setAccountNumber] = useState('1806875329');
  const [certPassword, setCertPassword] = useState('');
  const [certFile, setCertFile] = useState<File | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Simulation / Manual Match Test
  const [simVs, setSimVs] = useState('');
  const [simAmount, setSimAmount] = useState('1600');
  const [simSender, setSimSender] = useState('');
  const [simMessage, setSimMessage] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<{ success: boolean; message: string; matchedName?: string; matchedType?: string } | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('olymp_admin_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const fetchStatusAndLogs = async () => {
    try {
      setLoading(true);
      const authHeaders = getAuthHeaders();
      const [resStatus, resLogs] = await Promise.all([
        fetch('/api/rb/status', { headers: authHeaders }),
        fetch('/api/rb/logs', { headers: authHeaders })
      ]);

      if (resStatus.ok) {
        const data: RbStatus = await resStatus.json();
        setStatus(data);
        if (data.rawClientId) setClientId(data.rawClientId);
        if (data.rawClientSecret) setClientSecret(data.rawClientSecret);
        if (data.accountNumber) setAccountNumber(data.accountNumber);
      }

      if (resLogs.ok) {
        const logsData = await resLogs.json();
        setLogs(Array.isArray(logsData) ? logsData : []);
      }
    } catch (err) {
      console.error('Error fetching RB data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatusAndLogs();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setTestResult(null);

    try {
      const formData = new FormData();
      formData.append('clientId', clientId);
      formData.append('clientSecret', clientSecret);
      formData.append('accountNumber', accountNumber);
      if (certPassword) formData.append('certPassword', certPassword);
      if (certFile) formData.append('certFile', certFile);

      const res = await fetch('/api/rb/config', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      });

      if (res.ok) {
        setSaveSuccess(true);
        setCertFile(null);
        await fetchStatusAndLogs();
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        const data = await res.json();
        alert(data.error || 'Uložení selhalo.');
      }
    } catch (err: any) {
      alert('Chyba při ukládání: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/rb/test', {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: 'Spojení selhalo: ' + err.message
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSyncPayments = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch('/api/rb/sync', {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setSyncResult(data);
      await fetchStatusAndLogs();
    } catch (err: any) {
      setSyncResult({
        success: false,
        message: 'Synchronizace selhala: ' + err.message
      });
    } finally {
      setSyncing(false);
    }
  };

  const isConfigured = Boolean(status?.hasCert && status?.clientId && status?.hasPassword);

  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simVs && !simMessage) {
      alert('Zadejte alespoň variabilní symbol nebo zprávu pro příjemce.');
      return;
    }
    try {
      setSimulating(true);
      setSimResult(null);
      const res = await fetch('/api/rb/simulate-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          variableSymbol: simVs,
          amount: Number(simAmount) || 1600,
          senderName: simSender || 'Testující plátce',
          message: simMessage
        })
      });
      const data = await res.json();
      setSimResult(data);
      await fetchStatusAndLogs();
    } catch (err: any) {
      setSimResult({ success: false, message: 'Chyba: ' + err.message });
    } finally {
      setSimulating(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (log.variableSymbol && log.variableSymbol.toLowerCase().includes(term)) ||
      (log.matchedName && log.matchedName.toLowerCase().includes(term)) ||
      (log.message && log.message.toLowerCase().includes(term)) ||
      (log.senderName && log.senderName.toLowerCase().includes(term)) ||
      log.amount.toString().includes(term)
    );
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header & Status Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isConfigured ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
            }`}>
              <CreditCard size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">Raiffeisenbank Premium API</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                  isConfigured 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {isConfigured ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                  {isConfigured ? 'Aktivní a propojeno' : 'Čeká na nastavení'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Automatické stahování plateb a okamžité potvrzování kroužků, táborů i merche
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleTestConnection}
              disabled={testing || !isConfigured}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <ShieldCheck size={16} className={testing ? 'animate-spin' : ''} />
              {testing ? 'Testuji spojení...' : 'Otestovat spojení s bankou'}
            </button>
            <button
              onClick={handleSyncPayments}
              disabled={syncing || !isConfigured}
              className="px-4 py-2 bg-brand-blue hover:bg-blue-800 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Synchronizuji...' : 'Synchronizovat platby hned'}
            </button>
          </div>
        </div>

        {/* Results banners */}
        {testResult && (
          <div className={`mt-4 p-4 rounded-xl text-sm flex items-start gap-3 ${
            testResult.success 
              ? 'bg-green-50 border border-green-200 text-green-900' 
              : 'bg-red-50 border border-red-200 text-red-900'
          }`}>
            {testResult.success ? <CheckCircle size={20} className="text-green-600 shrink-0 mt-0.5" /> : <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />}
            <div className="flex-1">
              <p className="font-bold">{testResult.message}</p>
              {testResult.details && (
                <p className="text-xs mt-1 text-gray-600 font-mono overflow-auto max-h-24">
                  {typeof testResult.details === 'object' ? JSON.stringify(testResult.details, null, 2) : testResult.details}
                </p>
              )}
            </div>
          </div>
        )}

        {syncResult && (
          <div className={`mt-4 p-4 rounded-xl text-sm flex items-start gap-3 ${
            syncResult.success 
              ? 'bg-green-50 border border-green-200 text-green-900' 
              : 'bg-amber-50 border border-amber-200 text-amber-900'
          }`}>
            <CheckCircle size={20} className="text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{syncResult.message}</p>
            </div>
          </div>
        )}

        {/* Info badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <span className="text-xs text-gray-500 font-medium block">Certifikát banky (.p12)</span>
            <div className="flex items-center gap-2 mt-1">
              {status?.hasCert ? (
                <span className="text-sm font-bold text-green-600 flex items-center gap-1">
                  <FileCheck size={16} /> Nahrán ({status.certFilename || 'rb_cert.p12'})
                </span>
              ) : (
                <span className="text-sm font-bold text-amber-600 flex items-center gap-1">
                  <AlertCircle size={16} /> Dosud nenahrán
                </span>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <span className="text-xs text-gray-500 font-medium block">Poslední synchronizace</span>
            <div className="flex items-center gap-2 mt-1">
              <Clock size={16} className="text-gray-400" />
              <span className="text-sm font-bold text-gray-800">
                {status?.lastSync ? new Date(status.lastSync).toLocaleString('cs-CZ') : 'Dosud neproběhla'}
              </span>
            </div>
            <span className="text-[11px] text-gray-400 mt-0.5 block truncate">
              {status?.syncStatus || 'Automatická kontrola každých 15 min'}
            </span>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <span className="text-xs text-gray-500 font-medium block">Automaticky spárováno</span>
            <div className="flex items-center gap-2 mt-1">
              <Check size={18} className="text-brand-blue" />
              <span className="text-lg font-bold text-brand-blue">
                {logs.filter(l => l.matchedType !== 'unmatched').length} plateb
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Guide & Steps Accordion */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6">
        <h3 className="text-base font-bold text-brand-blue flex items-center gap-2 mb-3">
          <HelpCircle size={18} /> Jak funguje napojení na Raiffeisenbank
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-700">
          <div className="bg-white/80 backdrop-blur p-3.5 rounded-xl border border-blue-100">
            <div className="font-bold text-brand-blue text-sm mb-1">1. Developers portál (RB)</div>
            <p className="text-gray-600">
              Na <a href="https://developers.rb.cz/" target="_blank" rel="noreferrer" className="text-brand-blue underline font-bold inline-flex items-center gap-0.5">developers.rb.cz <ExternalLink size={10} /></a> máte v aplikaci <strong>Client ID</strong> a <strong>Client Secret</strong> (Heslo od API klíče). V záložce <em>Subscriptions (Předplatné)</em> mějte aktivní balíček Premium API.
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur p-3.5 rounded-xl border border-blue-100">
            <div className="font-bold text-brand-blue text-sm mb-1">2. Klientský certifikát (.p12)</div>
            <p className="text-gray-600">
              Certifikát <strong>.p12</strong> máte vygenerovaný z internetového bankovnictví RB a znáte heslo, které jste k tomuto souboru zadali při exportu.
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur p-3.5 rounded-xl border border-blue-100">
            <div className="font-bold text-brand-blue text-sm mb-1">3. Automatické párování</div>
            <p className="text-gray-600">
              Systém každých 15 minut stáhne nové platby. Pokud platba odpovídá variabilnímu symbolu přihlášky nebo objednávky, ihned ji označí jako <strong>Zaplaceno</strong> a odešle potvrzovací email rodiči!
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Lock size={18} className="text-brand-blue" />
          Nastavení přihlašovacích údajů Raiffeisenbank API
        </h3>

        <form onSubmit={handleSaveConfig} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Client ID (z developers.rb.cz)
              </label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="např. a1b2c3d4-e5f6-7890-..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none text-sm font-mono"
                required
              />
              <span className="text-xs text-gray-400 mt-1 block">
                Získáte v přehledu Moje aplikace na developers.rb.cz
              </span>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Client Secret (Heslo / Tajný klíč API)
              </label>
              <input
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder={status?.hasClientSecret ? '•••••••••••• (tajný klíč je uložen)' : 'Zadejte heslo/secret z developers.rb.cz'}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none text-sm font-mono"
              />
              <span className="text-xs text-gray-400 mt-1 block">
                Získáte při vytvoření aplikace na developers.rb.cz („Client Secret“)
              </span>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Číslo bankovního účtu (bez kódu banky)
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="1806875329"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none text-sm font-mono"
                required
              />
              <span className="text-xs text-gray-400 mt-1 block">
                Číslo účtu klubu Olymp Dance: 1806875329 (kód banky 5500)
              </span>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Heslo k certifikátu (.p12)
              </label>
              <input
                type="password"
                value={certPassword}
                onChange={(e) => setCertPassword(e.target.value)}
                placeholder={status?.hasPassword ? '•••••••••••• (heslo je uloženo)' : 'Zadejte heslo k certifikátu'}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none text-sm"
              />
              <span className="text-xs text-gray-400 mt-1 block">
                Heslo, které jste zvolili při exportu certifikátu v bankovnictví
              </span>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Soubor certifikátu (.p12)
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="rb-cert-file-input"
                  accept=".p12,.pfx"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setCertFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="rb-cert-file-input"
                  className="w-full px-4 py-2.5 border border-dashed border-gray-300 rounded-xl hover:border-brand-blue cursor-pointer bg-gray-50 flex items-center justify-between text-sm transition-colors"
                >
                  <span className="truncate text-gray-600">
                    {certFile ? certFile.name : (status?.hasCert ? `Současný certifikát (${status.certFilename || 'rb_cert.p12'})` : 'Vybrat soubor .p12 z počítače')}
                  </span>
                  <Upload size={16} className="text-gray-400 ml-2 shrink-0" />
                </label>
              </div>
              <span className="text-xs text-gray-400 mt-1 block">
                Bezpečně uložen na serveru pro autorizaci mTLS spojení
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {saveSuccess ? (
              <span className="text-sm font-bold text-green-600 flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle size={16} /> Nastavení bylo úspěšně uloženo!
              </span>
            ) : <span />}

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-brand-blue hover:bg-blue-800 text-white font-bold rounded-xl transition-colors shadow-md text-sm disabled:opacity-50"
            >
              {saving ? 'Ukládám...' : 'Uložit nastavení API'}
            </button>
          </div>
        </form>
      </div>

      {/* Manual / Test Payment Reconciliation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck size={20} className="text-brand-blue" />
              Otestovat spárování platby (Simulátor příchozí platby)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Umožňuje okamžitě vyzkoušet automatické schválení přihlášky podle specifického variabilního symbolu a odeslání potvrzovacího e-mailu.
            </p>
          </div>
        </div>

        <form onSubmit={handleSimulatePayment} className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Variabilní symbol (VS) *
              </label>
              <input
                type="text"
                value={simVs}
                onChange={(e) => setSimVs(e.target.value)}
                placeholder="např. 26100001 nebo 26200001"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-brand-blue outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Částka (Kč)
              </label>
              <input
                type="number"
                value={simAmount}
                onChange={(e) => setSimAmount(e.target.value)}
                placeholder="1600"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Jméno odesílatele (volitelné)
              </label>
              <input
                type="text"
                value={simSender}
                onChange={(e) => setSimSender(e.target.value)}
                placeholder="např. Jan Novák"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Zpráva pro příjemce (volitelné)
              </label>
              <input
                type="text"
                value={simMessage}
                onChange={(e) => setSimMessage(e.target.value)}
                placeholder="např. Jméno dítěte"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-gray-500">
              💡 Zadejte variabilní symbol jakékoliv existující přihlášky na kroužek nebo tábor.
            </span>
            <button
              type="submit"
              disabled={simulating}
              className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <CheckCircle size={14} className={simulating ? 'animate-spin' : ''} />
              {simulating ? 'Zpracovávám...' : 'Simulovat přijetí platby'}
            </button>
          </div>
        </form>

        {simResult && (
          <div className={`mt-4 p-4 rounded-xl text-sm flex items-start gap-3 ${
            simResult.success 
              ? 'bg-green-50 border border-green-200 text-green-900' 
              : 'bg-amber-50 border border-amber-200 text-amber-900'
          }`}>
            {simResult.success ? <CheckCircle size={20} className="text-green-600 shrink-0 mt-0.5" /> : <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />}
            <div>
              <p className="font-bold">{simResult.message}</p>
              {simResult.matchedName && (
                <p className="text-xs mt-1 text-gray-700">
                  Přihláška byla automaticky změněna na <strong>Schváleno / Zaplaceno</strong> a rodiči byl odeslán potvrzovací e-mail.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* History of Received & Matched Bank Payments */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Přehled transakcí a spárovaných plateb</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Historie plateb stažených přímo z bankovního účtu přes Premium API
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Hledat VS, jméno, zprávu..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-blue outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Načítám platby...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
            <CreditCard size={36} className="mx-auto text-gray-300 mb-2" />
            <p className="font-bold text-gray-600 text-sm">Dosud nebyly zaznamenány žádné transakce</p>
            <p className="text-xs text-gray-400 mt-1">
              Po uložení údajů klikněte na „Synchronizovat platby hned“ nebo vyčkejte na automatickou periodickou kontrolu.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[11px] font-bold border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Datum zaúčtování</th>
                  <th className="py-3 px-4">Částka</th>
                  <th className="py-3 px-4">Variabilní symbol</th>
                  <th className="py-3 px-4">Odesílatel / Zpráva</th>
                  <th className="py-3 px-4">Spárováno s</th>
                  <th className="py-3 px-4">Stav</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4 text-xs font-mono text-gray-600">
                      {log.bookingDate || new Date(log.createdAt).toLocaleDateString('cs-CZ')}
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">
                      {log.amount} {log.currency}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-brand-blue">
                      {log.variableSymbol || '—'}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {log.senderName && <div className="font-bold text-gray-800">{log.senderName}</div>}
                      {log.message && <div className="text-gray-500 italic max-w-xs truncate">{log.message}</div>}
                      {!log.senderName && !log.message && <span className="text-gray-400">—</span>}
                    </td>
                    <td className="py-3 px-4">
                      {log.matchedType === 'school' && (
                        <div className="text-xs">
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold mr-1.5">Kroužek</span>
                          <span className="font-medium text-gray-800">{log.matchedName}</span>
                        </div>
                      )}
                      {log.matchedType === 'camp' && (
                        <div className="text-xs">
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold mr-1.5">Tábor</span>
                          <span className="font-medium text-gray-800">{log.matchedName}</span>
                        </div>
                      )}
                      {log.matchedType === 'merch' && (
                        <div className="text-xs">
                          <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold mr-1.5">Merch</span>
                          <span className="font-medium text-gray-800">{log.matchedName}</span>
                        </div>
                      )}
                      {log.matchedType === 'unmatched' && (
                        <span className="text-xs text-gray-400 italic">Nespárováno (chybí VS)</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {log.matchedType === 'school' ? (
                        <div>
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                            <CheckCircle size={12} /> Schváleno & Odeslán email s PDF
                          </span>
                          {log.matchedId && (
                            <div className="mt-1">
                              <a
                                href={`/api/school-registrations/${log.matchedId}/confirmation-pdf`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200"
                                title="Stáhnout / zobrazit vygenerované PDF 1:1"
                              >
                                <FileCheck size={11} /> Stáhnout PDF potvrzení (1:1)
                              </a>
                            </div>
                          )}
                        </div>
                      ) : log.matchedType === 'camp' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200" title="Tábor - automaticky označeno v adminu bez e-mailu dle zadání">
                          <CheckCircle size={12} /> Zaplaceno v adminu
                        </span>
                      ) : log.matchedType === 'merch' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                          <CheckCircle size={12} /> Zaplaceno & Odeslán email
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                          Přijato na účet (nespárováno)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
