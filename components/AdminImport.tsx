import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  UploadCloud, Mail, Send, CheckCircle2, AlertCircle, Clock, Search, 
  Filter, Eye, RefreshCw, ChevronLeft, ChevronRight, Play, Square,
  ShieldCheck, ArrowRight, UserCheck, Key, FileText, Download, Check,
  X, AlertTriangle, Building2, Phone, MapPin, Sparkles, Users
} from 'lucide-react';
import { QueueItem } from '../importService';

interface QueueStats {
  total: number;
  sent: number;
  pending: number;
  failed: number;
  sending: number;
  totalBatches: number;
  batches: Array<{
    batchNumber: number;
    total: number;
    sent: number;
    pending: number;
    failed: number;
  }>;
}

export const AdminImport: React.FC = () => {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [smtpConfigured, setSmtpConfigured] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedBatch, setSelectedBatch] = useState<number | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalFiltered, setTotalFiltered] = useState<number>(0);

  // Sending states
  const [isSendingBatch, setIsSendingBatch] = useState<boolean>(false);
  const [activeBatchSending, setActiveBatchSending] = useState<number | null>(null);
  const [sendingLog, setSendingLog] = useState<string[]>([]);
  const [autoRunnerActive, setAutoRunnerActive] = useState<boolean>(false);
  const stopAutoRunnerRef = useRef<boolean>(false);

  // Modal states
  const [previewItem, setPreviewItem] = useState<{
    recipient: string;
    childName: string;
    schoolName: string;
    variableSymbol: string;
    password: string;
    subject: string;
    html: string;
  } | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);

  const [isCsvModalOpen, setIsCsvModalOpen] = useState<boolean>(false);
  const [csvInput, setCsvInput] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Password visibility map
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Get Auth Token
  const getAuthToken = () => {
    return localStorage.getItem('olymp_admin_token') || 'eyJpZCI6InN1cGVyYWRtaW4iLCJ1c2VybmFtZSI6Ik1hcnRpbiIsInJvbGUiOiJhZG1pbiIsIm5hbWUiOiJNYXJ0aW4gKEhsYXZuw60gYWRtaW5pc3Ryw6F0b3IpIiwiZXhwIjoyMTA0MTU4MTU4fQ.kFxvCrS8z2ZEaCvmMN_yJpHqYnfZ3kvy-3Zy6a1tyi8';
  };

  // Fetch Queue Items and Stats
  const fetchQueue = async (page = currentPage) => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      const params = new URLSearchParams();
      if (selectedBatch !== 'all') params.append('batch', selectedBatch.toString());
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (selectedSchool !== 'all') params.append('schoolId', selectedSchool);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      params.append('page', page.toString());
      params.append('limit', '50');

      const res = await fetch(`/api/admin/import-queue?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        setStats(data.stats || null);
        setSmtpConfigured(Boolean(data.smtpConfigured));
        setCurrentPage(data.pagination?.page || 1);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalFiltered(data.pagination?.totalFiltered || 0);
      }
    } catch (err) {
      console.error('Failed to load import queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue(1);
  }, [selectedBatch, selectedStatus, selectedSchool]);

  // Handle Search Debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchQueue(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Send single email
  const handleSendSingle = async (id: string, email: string, childName: string) => {
    if (!confirm(`Opravdu si přejete odeslat e-mail s přihlášením pro ${childName} na adresu ${email}?`)) {
      return;
    }

    try {
      const token = getAuthToken();
      setSendingLog(prev => [`[${new Date().toLocaleTimeString('cs-CZ')}] Odesílám e-mail na ${email} (${childName})...`, ...prev]);
      
      const res = await fetch('/api/admin/import-queue/send-single', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSendingLog(prev => [`[${new Date().toLocaleTimeString('cs-CZ')}] ✓ ÚSPĚCH: E-mail pro ${childName} (${email}) byl v pořádku doručen.`, ...prev]);
      } else {
        setSendingLog(prev => [`[${new Date().toLocaleTimeString('cs-CZ')}] ✗ CHYBA: ${data.error || 'Neznámá chyba odeslání.'}`, ...prev]);
      }
      fetchQueue(currentPage);
    } catch (err: any) {
      setSendingLog(prev => [`[${new Date().toLocaleTimeString('cs-CZ')}] ✗ CHYBA: ${err.message}`, ...prev]);
    }
  };

  // Send Batch of 10
  const handleSendBatch = async (batchNumber?: number, count = 10) => {
    const batchLabel = batchNumber ? `Dávka ${batchNumber}` : `dalších ${count} čekajících`;
    if (!confirm(`Opravdu chcete spustit bezpečné odeslání pro ${batchLabel}? E-maily se budou posílat postupně s 1.8s prodlevou, aby nedošlo k zahlcení Gmail SMTP.`)) {
      return;
    }

    setIsSendingBatch(true);
    setActiveBatchSending(batchNumber || 999);
    setSendingLog(prev => [
      `[${new Date().toLocaleTimeString('cs-CZ')}] === Zahajuji bezpečné odesílání: ${batchLabel} ===`,
      `[${new Date().toLocaleTimeString('cs-CZ')}] Používám ochranu Gmail SMTP s rozestupem 1.8 s mezi zprávami...`,
      ...prev
    ]);

    try {
      const token = getAuthToken();
      const res = await fetch('/api/admin/import-queue/send-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ batchNumber, count })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSendingLog(prev => [
          `[${new Date().toLocaleTimeString('cs-CZ')}] ✓ Dávka dokončena: ${data.succeeded} odesláno, ${data.failed} chyb z celkem ${data.processed}.`,
          ...prev
        ]);
      } else {
        setSendingLog(prev => [`[${new Date().toLocaleTimeString('cs-CZ')}] ✗ Chyba dávky: ${data.error || 'Neznámá chyba'}`, ...prev]);
      }
      await fetchQueue(currentPage);
    } catch (err: any) {
      setSendingLog(prev => [`[${new Date().toLocaleTimeString('cs-CZ')}] ✗ Selhání požadavku: ${err.message}`, ...prev]);
    } finally {
      setIsSendingBatch(false);
      setActiveBatchSending(null);
    }
  };

  // Continuous safe queue runner (all remaining pending items in slow batches with cancel option)
  const startContinuousRunner = async () => {
    if (!confirm('Přejete si spustit automatické pomalé odesílání všech zbývajících čekajících e-mailů? Proces bude posílat dávky po 10 s bezpečnou prodlevou. Můžete jej kdykoliv zastavit tlačítkem Zastavit.')) {
      return;
    }

    setAutoRunnerActive(true);
    stopAutoRunnerRef.current = false;
    setSendingLog(prev => [
      `[${new Date().toLocaleTimeString('cs-CZ')}] ▶ SPUŠTĚNO KONTINUÁLNÍ POMALÉ ODESÍLÁNÍ CELÉ FRONTY...`,
      ...prev
    ]);

    const token = getAuthToken();

    while (!stopAutoRunnerRef.current) {
      try {
        const res = await fetch('/api/admin/import-queue/send-batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ count: 10 })
        });

        const data = await res.json();
        if (!res.ok || !data.success || data.processed === 0) {
          setSendingLog(prev => [
            `[${new Date().toLocaleTimeString('cs-CZ')}] Všechny čekající e-maily byly zpracovány nebo nebyla nalezena žádná další data.`,
            ...prev
          ]);
          break;
        }

        setSendingLog(prev => [
          `[${new Date().toLocaleTimeString('cs-CZ')}] Zpracováno ${data.processed} e-mailů (${data.succeeded} úspěšně, ${data.failed} chyb). Čekám 3 sekundy před další dávkou...`,
          ...prev
        ]);

        await fetchQueue(currentPage);

        // Extra 3s pause between batches of 10
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (err: any) {
        setSendingLog(prev => [`[${new Date().toLocaleTimeString('cs-CZ')}] ✗ Chyba při běhu fronty: ${err.message}`, ...prev]);
        break;
      }
    }

    setAutoRunnerActive(false);
    setSendingLog(prev => [`[${new Date().toLocaleTimeString('cs-CZ')}] ⏹ Kontinuální odesílání zastaveno.`, ...prev]);
    await fetchQueue(currentPage);
  };

  const stopContinuousRunner = () => {
    stopAutoRunnerRef.current = true;
    setAutoRunnerActive(false);
    setSendingLog(prev => [`[${new Date().toLocaleTimeString('cs-CZ')}] ⏸ Požadavek na zastavení přijat. Dokončuji aktuální zprávu...`, ...prev]);
  };

  // Preview Email
  const handlePreview = async (id: string) => {
    setIsPreviewLoading(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/admin/import-queue/preview/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPreviewItem(data);
      } else {
        alert('Nepodařilo se vygenerovat náhled e-mailu.');
      }
    } catch (err: any) {
      alert('Chyba při načítání náhledu: ' + err.message);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Reset Failed Status
  const handleResetFailed = async () => {
    if (!confirm('Přejete si resetovat všechny neúspěšné e-maily zpět do stavu "Čeká na odeslání", abyste je mohli zkusit poslat znovu?')) {
      return;
    }
    try {
      const token = getAuthToken();
      const res = await fetch('/api/admin/import-queue/reset-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ resetFailedOnly: true })
      });
      if (res.ok) {
        setSendingLog(prev => [`[${new Date().toLocaleTimeString('cs-CZ')}] Stav chybových e-mailů byl resetován na "Čeká na odeslání".`, ...prev]);
        fetchQueue(currentPage);
      }
    } catch (err) {
      alert('Chyba při resetování stavu.');
    }
  };

  // Synchronize / Reload Data from CSV
  const handleSyncData = async (customCsv?: string) => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const token = getAuthToken();
      const res = await fetch('/api/admin/import-queue/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ csvContent: customCsv })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSyncFeedback(data.message);
        setSendingLog(prev => [`[${new Date().toLocaleTimeString('cs-CZ')}] ✓ ${data.message}`, ...prev]);
        setIsCsvModalOpen(false);
        setCsvInput('');
        fetchQueue(1);
      } else {
        setSyncFeedback('Chyba: ' + (data.error || 'Neznámá chyba'));
      }
    } catch (err: any) {
      setSyncFeedback('Chyba: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // Extract unique schools from items or stats for filter
  const schoolOptions = useMemo(() => {
    const map = new Map<string, string>();
    items.forEach(item => {
      if (item.schoolId && item.schoolName) {
        map.set(item.schoolId, item.schoolName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [items]);

  const sentPercentage = stats && stats.total > 0 ? Math.round((stats.sent / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-brand-blue/10 text-brand-blue">
              <UploadCloud size={24} />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Hromadný import zákazníků</h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Přímý import žáků do kroužků a řízené, bezpečné odesílání přihlašovacích údajů po dávkách 10 e-mailů.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <a
            href="/vzor-potvrzeni-platby.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 md:flex-initial px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
            title="Otevřít a stáhnout vzorové PDF potvrzení o přijetí platby pro zdravotní pojišťovnu"
          >
            <FileText size={16} />
            <span>Vzorové PDF potvrzení</span>
          </a>

          <button
            onClick={() => handleSyncData()}
            disabled={isSyncing}
            className="flex-1 md:flex-initial px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
            title="Znovu synchronizuje výchozí export zákazníků (335 žáků) a propojí s MySQL kroužky"
          >
            <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'Synchronizuji...' : 'Načíst výchozí export'}</span>
          </button>

          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="flex-1 md:flex-initial px-4 py-2 border border-brand-blue text-brand-blue hover:bg-blue-50 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            <FileText size={16} />
            <span>Vložit vlastní CSV</span>
          </button>
        </div>
      </div>

      {/* Sync feedback alert */}
      {syncFeedback && (
        <div className="p-4 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-sm flex items-center justify-between">
          <span>{syncFeedback}</span>
          <button onClick={() => setSyncFeedback(null)} className="text-blue-500 hover:text-blue-700">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Metrics & Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Celkem žáků</span>
            <Users size={18} className="text-brand-blue" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900">{stats?.total || 0}</div>
          <div className="text-xs text-gray-400 mt-1">Rozděleno do {stats?.totalBatches || 0} dávek</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-green-100 bg-green-50/20">
          <div className="flex items-center justify-between text-green-600 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Odesláno e-mailů</span>
            <CheckCircle2 size={18} />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-green-700">{stats?.sent || 0}</div>
          <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-green-500 h-full rounded-full transition-all duration-500" style={{ width: `${sentPercentage}%` }}></div>
          </div>
          <div className="text-[11px] text-green-600 font-bold mt-1">{sentPercentage}% dokončeno</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-yellow-100 bg-yellow-50/20">
          <div className="flex items-center justify-between text-yellow-600 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Čeká na odeslání</span>
            <Clock size={18} />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-yellow-700">{stats?.pending || 0}</div>
          <div className="text-xs text-yellow-600 mt-1">Připraveno k odeslání</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-red-100 bg-red-50/20">
          <div className="flex items-center justify-between text-red-600 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Chyby odeslání</span>
            <AlertCircle size={18} />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-red-700">{stats?.failed || 0}</div>
          {stats && stats.failed > 0 && (
            <button
              onClick={handleResetFailed}
              className="text-[11px] text-red-600 hover:text-red-800 font-bold underline mt-1 block"
            >
              Resetovat k odeslání
            </button>
          )}
        </div>

        <div className="col-span-2 lg:col-span-1 bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Gmail SMTP</span>
            <ShieldCheck size={18} className={smtpConfigured ? 'text-green-600' : 'text-yellow-500'} />
          </div>
          <div className="text-sm font-bold text-gray-900 mt-1">
            {smtpConfigured ? (
              <span className="text-green-600 flex items-center gap-1">
                <Check size={14} /> Aktivní & funkční
              </span>
            ) : (
              <span className="text-yellow-600">Nenakonfigurováno</span>
            )}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Prodleva 1.8 s / e-mail</div>
        </div>
      </div>

      {/* Action Control Center: Batched Sending */}
      <div className="bg-gradient-to-br from-slate-900 to-brand-blue text-white p-5 sm:p-6 rounded-2xl shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-4 mb-4">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Mail className="text-blue-300" size={20} />
              Řízené odesílání e-mailů s přihlašovacími údaji
            </h3>
            <p className="text-xs sm:text-sm text-blue-200 mt-0.5">
              Gmail má bezpečnostní limit na počet odeslaných zpráv za minutu. Náš systém proto dělí příjemce do dávek po 10 a mezi každým e-mailem aplikuje 1.8sekundovou prodlevu.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Primary Action Button: Send Next 10 */}
            <button
              onClick={() => handleSendBatch(undefined, 10)}
              disabled={isSendingBatch || autoRunnerActive || (stats?.pending || 0) === 0}
              className="px-5 py-2.5 bg-brand-red hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} className={isSendingBatch && !autoRunnerActive ? 'animate-bounce' : ''} />
              <span>{isSendingBatch && !autoRunnerActive ? 'Odesílám dávku...' : 'Odeslat dalších 10 e-mailů'}</span>
            </button>

            {/* Continuous Safe Slow Runner */}
            {!autoRunnerActive ? (
              <button
                onClick={startContinuousRunner}
                disabled={isSendingBatch || (stats?.pending || 0) === 0}
                className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                title="Pomalé automatické odeslání všech zbývajících dávek s rozestupem"
              >
                <Play size={16} />
                <span>Odeslat celou frontu pomalu</span>
              </button>
            ) : (
              <button
                onClick={stopContinuousRunner}
                className="px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 animate-pulse"
              >
                <Square size={16} />
                <span>Zastavit odesílání</span>
              </button>
            )}
          </div>
        </div>

        {/* Batch Select Buttons Carousel/Grid */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
              Přehled dávek (po 10 žácích) – kliknutím vyfiltrujete nebo odešlete konkrétní dávku:
            </span>
            <button
              onClick={() => setSelectedBatch('all')}
              className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all ${
                selectedBatch === 'all' ? 'bg-white text-brand-blue' : 'text-blue-200 hover:text-white'
              }`}
            >
              Zobrazit všechny ({stats?.total || 0})
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
            {stats?.batches?.map(batch => {
              const isSelected = selectedBatch === batch.batchNumber;
              const isAllDone = batch.sent === batch.total && batch.total > 0;
              const hasErrors = batch.failed > 0;
              const isCurrentSending = activeBatchSending === batch.batchNumber;

              let bgClass = 'bg-white/10 hover:bg-white/20 text-white';
              if (isSelected) bgClass = 'ring-2 ring-white bg-white/30 text-white font-black';
              if (isAllDone) bgClass = isSelected ? 'bg-green-600 text-white ring-2 ring-white' : 'bg-green-900/50 hover:bg-green-800/60 text-green-200';
              if (hasErrors) bgClass = isSelected ? 'bg-red-600 text-white ring-2 ring-white' : 'bg-red-900/50 hover:bg-red-800/60 text-red-200';

              return (
                <button
                  key={batch.batchNumber}
                  onClick={() => setSelectedBatch(batch.batchNumber)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 border border-white/10 ${bgClass}`}
                  title={`Dávka ${batch.batchNumber}: ${batch.sent}/${batch.total} odesláno`}
                >
                  {isCurrentSending && <RefreshCw size={12} className="animate-spin text-yellow-300" />}
                  {isAllDone && !isCurrentSending && <Check size={12} className="text-green-400" />}
                  {hasErrors && !isCurrentSending && <AlertCircle size={12} className="text-red-400" />}
                  <span>Dávka {batch.batchNumber}</span>
                  <span className="text-[10px] opacity-75">
                    ({batch.sent}/{batch.total})
                  </span>
                </button>
              );
            })}
          </div>

          {selectedBatch !== 'all' && (
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-blue-100">
                Aktivní filtr: <strong>Dávka {selectedBatch}</strong>
              </span>
              <button
                onClick={() => handleSendBatch(Number(selectedBatch), 10)}
                disabled={isSendingBatch}
                className="px-3 py-1 bg-white text-brand-blue hover:bg-blue-50 font-bold rounded-lg transition-all flex items-center gap-1 shadow-sm"
              >
                <Send size={12} />
                <span>Odeslat tuto dávku {selectedBatch}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Live Sending Log Terminal (if there is activity) */}
      {sendingLog.length > 0 && (
        <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl shadow-sm border border-slate-800">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
            <span className="text-xs font-mono font-bold text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              Průběh odesílání a systémový log (Gmail SMTP)
            </span>
            <button
              onClick={() => setSendingLog([])}
              className="text-[11px] text-slate-400 hover:text-white"
            >
              Vymazat záznam
            </button>
          </div>
          <div className="font-mono text-xs space-y-1 max-h-36 overflow-y-auto text-slate-300">
            {sendingLog.map((log, index) => (
              <div 
                key={index}
                className={
                  log.includes('✓') || log.includes('ÚSPĚCH') 
                    ? 'text-green-400' 
                    : log.includes('✗') || log.includes('CHYBA') 
                    ? 'text-red-400 font-bold' 
                    : 'text-slate-300'
                }
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table Filters & Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Hledat jméno, e-mail, telefon, VS..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-blue outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-700 bg-white outline-none"
          >
            <option value="all">Všechny stavy e-mailů</option>
            <option value="pending">🟡 Pouze čekající</option>
            <option value="sent">🟢 Pouze odeslané</option>
            <option value="failed">🔴 Pouze chyby</option>
          </select>

          {/* School Filter */}
          <select
            value={selectedSchool}
            onChange={e => setSelectedSchool(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-700 bg-white outline-none max-w-[200px]"
          >
            <option value="all">Všechny školy ({schoolOptions.length})</option>
            {schoolOptions.map(sc => (
              <option key={sc.id} value={sc.id}>
                {sc.name}
              </option>
            ))}
          </select>

          <span className="text-xs text-gray-500 font-medium px-2">
            Nalezeno: <strong>{totalFiltered}</strong> žáků
          </span>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">Dávka</th>
                <th className="py-3 px-4">Žák & Rodné číslo</th>
                <th className="py-3 px-4">Škola / Kroužek</th>
                <th className="py-3 px-4">Rodič & Kontakt</th>
                <th className="py-3 px-4">VS & Heslo portálu</th>
                <th className="py-3 px-4">Stav e-mailu</th>
                <th className="py-3 px-4 text-right">Akce</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-brand-blue" />
                    <span>Načítám data zákazníků...</span>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    Nenalezeny žádné záznamy odpovídající filtru.
                  </td>
                </tr>
              ) : (
                items.map(item => {
                  const isPassVisible = visiblePasswords[item.id];
                  const isSent = item.emailStatus === 'sent';
                  const isFailed = item.emailStatus === 'failed';
                  const isSending = item.emailStatus === 'sending';

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                      {/* Batch Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                          #{item.batchNumber}
                        </span>
                      </td>

                      {/* Child Name & RC */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900">
                          {item.childName} {item.childSurname}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <span>RČ:</span>
                          <span className="font-mono text-gray-700">{item.childRodneCislo || '–'}</span>
                        </div>
                      </td>

                      {/* School */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-brand-blue text-xs sm:text-sm flex items-center gap-1">
                          <Building2 size={13} className="shrink-0 text-brand-blue/70" />
                          <span>{item.schoolName || item.schoolRaw}</span>
                        </div>
                        {item.address && (
                          <div className="text-[11px] text-gray-400 truncate max-w-[180px]" title={item.address}>
                            {item.address}
                          </div>
                        )}
                      </td>

                      {/* Parent Email & Phone */}
                      <td className="py-3 px-4">
                        <div className="text-xs sm:text-sm font-medium text-gray-900 flex items-center gap-1">
                          <Mail size={13} className="text-gray-400 shrink-0" />
                          <span className="truncate max-w-[200px]" title={item.email}>{item.email}</span>
                        </div>
                        {item.phone && (
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Phone size={11} className="text-gray-400 shrink-0" />
                            <span className="font-mono text-[11px]">{item.phone}</span>
                          </div>
                        )}
                      </td>

                      {/* VS & Portal Password */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-xs font-mono font-bold text-gray-800 flex items-center gap-1">
                          <span className="text-gray-400 font-sans font-normal">VS:</span>
                          <span>{item.variableSymbol}</span>
                        </div>
                        <div className="text-xs flex items-center gap-1.5 mt-1">
                          <span className="text-gray-400">Heslo:</span>
                          <span className="font-mono font-bold text-brand-blue bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                            {isPassVisible ? item.password : '••••••••'}
                          </span>
                          <button
                            onClick={() => togglePasswordVisibility(item.id)}
                            className="text-gray-400 hover:text-gray-600 text-[10px]"
                            title={isPassVisible ? 'Skrýt heslo' : 'Zobrazit heslo'}
                          >
                            <Eye size={12} />
                          </button>
                        </div>
                      </td>

                      {/* Email Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isSent ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                              <CheckCircle2 size={13} />
                              Odesláno
                            </span>
                            {item.emailSentAt && (
                              <div className="text-[10px] text-gray-400 mt-0.5">
                                {new Date(item.emailSentAt).toLocaleString('cs-CZ', {
                                  day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                                })}
                              </div>
                            )}
                          </div>
                        ) : isFailed ? (
                          <div>
                            <span 
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 cursor-help"
                              title={item.emailError || 'Chyba odeslání'}
                            >
                              <AlertCircle size={13} />
                              Chyba
                            </span>
                            {item.emailError && (
                              <div className="text-[10px] text-red-500 max-w-[140px] truncate" title={item.emailError}>
                                {item.emailError}
                              </div>
                            )}
                          </div>
                        ) : isSending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                            <RefreshCw size={13} className="animate-spin" />
                            Odesílám...
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                            <Clock size={13} />
                            Čeká
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Preview Email Button */}
                          <button
                            onClick={() => handlePreview(item.id)}
                            disabled={isPreviewLoading}
                            className="p-1.5 text-gray-500 hover:text-brand-blue hover:bg-gray-100 rounded-lg transition-colors"
                            title="Zobrazit náhled e-mailu (s platebními údaji a QR kódem)"
                          >
                            <Eye size={16} />
                          </button>

                          {/* PDF Confirmation Button */}
                          <a
                            href={`/api/import-queue/${item.id}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Zobrazit a stáhnout PDF potvrzení o přijetí platby pro pojišťovnu"
                          >
                            <FileText size={16} />
                          </a>

                          {/* Send Single Button */}
                          <button
                            onClick={() => handleSendSingle(item.id, item.email, `${item.childName} ${item.childSurname}`)}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                              isSent 
                                ? 'bg-gray-100 hover:bg-gray-200 text-gray-600' 
                                : 'bg-brand-blue hover:bg-blue-800 text-white shadow-sm'
                            }`}
                            title={isSent ? 'Znovu odeslat e-mail' : 'Odeslat e-mail nyní'}
                          >
                            <Send size={12} />
                            <span>{isSent ? 'Znovu' : 'Odeslat'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-xs text-gray-500">
            Zobrazeno {items.length} z celkem {totalFiltered} záznamů (Strana {currentPage} z {totalPages})
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => fetchQueue(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1 || isLoading}
              className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 py-1 text-xs font-bold text-gray-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => fetchQueue(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages || isLoading}
              className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Email Preview */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
            <div className="p-4 sm:p-5 bg-brand-blue text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                  <Eye size={18} />
                  Náhled e-mailu pro zákazníka
                </h3>
                <p className="text-xs text-blue-200 mt-0.5">
                  Příjemce: <strong>{previewItem.recipient}</strong> • Žák: <strong>{previewItem.childName}</strong>
                </p>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-3 bg-gray-100 border-b border-gray-200 text-xs text-gray-700">
              <strong>Předmět e-mailu:</strong> {previewItem.subject}
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50">
              <div 
                className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200"
                dangerouslySetInnerHTML={{ __html: previewItem.html }}
              />
            </div>

            <div className="p-4 bg-white border-t border-gray-200 flex justify-between items-center">
              <span className="text-xs text-gray-500">
                Škola: <strong>{previewItem.schoolName}</strong> • VS: <strong>{previewItem.variableSymbol}</strong>
              </span>
              <div className="flex items-center gap-2">
                {(() => {
                  const matchedItem = items.find(i => i.email === previewItem.recipient);
                  if (matchedItem) {
                    return (
                      <a
                        href={`/api/import-queue/${matchedItem.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold hover:bg-emerald-100 flex items-center gap-1.5 transition-colors shadow-sm"
                        title="Otevřít PDF potvrzení pro pojišťovnu"
                      >
                        <FileText size={14} />
                        <span>PDF potvrzení</span>
                      </a>
                    );
                  }
                  return null;
                })()}
                <button
                  onClick={() => setPreviewItem(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50"
                >
                  Zavřít náhled
                </button>
                <button
                  onClick={() => {
                    const matchedItem = items.find(i => i.email === previewItem.recipient);
                    if (matchedItem) {
                      setPreviewItem(null);
                      handleSendSingle(matchedItem.id, matchedItem.email, previewItem.childName);
                    }
                  }}
                  className="px-4 py-2 bg-brand-blue text-white rounded-xl text-xs font-bold hover:bg-blue-800 flex items-center gap-1.5 shadow-md"
                >
                  <Send size={14} />
                  <span>Odeslat tento e-mail hned</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Custom CSV Import */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <UploadCloud size={20} className="text-brand-blue" />
                Vložit vlastní CSV export zákazníků
              </h3>
              <button
                onClick={() => setIsCsvModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
              Vložte data ve formátu CSV. První řádek může obsahovat hlavičku:
              <br />
              <code className="bg-gray-100 p-1 rounded font-mono text-[11px] block mt-1">
                EMAIL RODIČE, JMÉNO DÍTĚTE, PŘÍJMENÍ DÍTĚTE, RODNÉ ČÍSLO DÍTĚTE, ADRESA, TELEFON, ŠKOLA
              </code>
            </p>

            <textarea
              rows={8}
              value={csvInput}
              onChange={e => setCsvInput(e.target.value)}
              placeholder="novak@email.cz, Jan, Novák, 1657080370, Školní 12 Olomouc, 777123456, ZŠ ŘEZNÍČKOVA"
              className="w-full p-3 border border-gray-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-brand-blue mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsCsvModalOpen(false)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                Zrušit
              </button>
              <button
                onClick={() => handleSyncData(csvInput)}
                disabled={!csvInput.trim() || isSyncing}
                className="px-5 py-2 bg-brand-blue text-white rounded-xl text-xs font-bold hover:bg-blue-800 disabled:opacity-50 flex items-center gap-1.5 shadow-md"
              >
                <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                <span>{isSyncing ? 'Importuji...' : 'Zpracovat a importovat data'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
