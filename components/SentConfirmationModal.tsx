import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Mail, 
  FileText, 
  Download, 
  Printer, 
  ExternalLink, 
  CheckCircle, 
  Loader2, 
  AlertCircle,
  CreditCard,
  User,
  Calendar,
  Sparkles
} from 'lucide-react';

interface SentConfirmationModalProps {
  logId: number;
  onClose: () => void;
}

export const SentConfirmationModal: React.FC<SentConfirmationModalProps> = ({ logId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'pdf' | 'email' | 'tx'>('pdf');
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const adminToken = localStorage.getItem('olymp_admin_token') || '';

  useEffect(() => {
    let isMounted = true;

    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/rb/logs/${logId}/sent-details`, {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Nepodařilo se načíst detail odeslaného potvrzení.');
        }

        const json = await res.json();
        if (!isMounted) return;
        setData(json);

        // If no PDF (e.g. merch), default to email tab
        if (!json.hasPdf) {
          setActiveTab('email');
        }

        // Fetch PDF blob if hasPdf
        if (json.hasPdf && json.pdfUrl) {
          const tokenParam = adminToken ? `?token=${encodeURIComponent(adminToken)}` : '';
          const pdfRes = await fetch(`${json.pdfUrl}${tokenParam}`, {
            headers: {
              'Authorization': `Bearer ${adminToken}`
            }
          });

          if (pdfRes.ok) {
            const blob = await pdfRes.blob();
            const url = URL.createObjectURL(blob);
            if (isMounted) {
              setPdfBlobUrl(url);
            }
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Nastala neočekávaná chyba při načítání dat.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetails();

    return () => {
      isMounted = false;
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [logId]);

  const handlePrint = () => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;
    setIsPrinting(true);
    try {
      iframeRef.current.contentWindow.focus();
      iframeRef.current.contentWindow.print();
    } catch (e) {
      console.warn('Iframe print error, falling back to window print on iframe', e);
      if (iframeRef.current) {
        iframeRef.current.focus();
      }
    } finally {
      setTimeout(() => setIsPrinting(false), 1000);
    }
  };

  const safeName = (data?.childName || data?.recipientName || 'doklad').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Potvrzeni_o_prijeti_platby_${safeName}.pdf`;

  const handleDownload = () => {
    if (!pdfBlobUrl) {
      if (data?.pdfUrl) {
        const fullUrl = `${data.pdfUrl}?token=${encodeURIComponent(adminToken)}`;
        window.open(fullUrl, '_blank');
      }
      return;
    }
    const a = document.createElement('a');
    a.href = pdfBlobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpenDirect = () => {
    if (data?.pdfUrl) {
      const fullUrl = `${data.pdfUrl}?token=${encodeURIComponent(adminToken)}`;
      window.open(fullUrl, '_blank');
    } else if (pdfBlobUrl) {
      window.open(pdfBlobUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-blue/10 text-brand-blue rounded-xl">
              <CheckCircle size={22} className="text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">
                  Co bylo odesláno k platbě
                </h2>
                {data?.matchedType && (
                  <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                    data.matchedType === 'school' 
                      ? 'bg-blue-100 text-blue-800' 
                      : data.matchedType === 'camp'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {data.matchedType === 'school' ? 'Taneční kroužek' : data.matchedType === 'camp' ? 'Letní tábor' : 'Klubový merch'}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {data?.activityTitle || 'Bankovní párování & automatické potvrzení'} • Částka: <strong className="text-gray-800">{data?.log?.amount} {data?.log?.currency || 'CZK'}</strong> • VS: <strong className="text-brand-blue font-mono">{data?.log?.variableSymbol || '—'}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
            title="Zavřít"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-3 border-b border-gray-100 bg-gray-50/50">
          {data?.hasPdf && (
            <button
              onClick={() => setActiveTab('pdf')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'pdf'
                  ? 'border-brand-blue text-brand-blue bg-white rounded-t-lg shadow-sm'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <FileText size={15} />
              Oficiální PDF potvrzení (příloha)
            </button>
          )}

          <button
            onClick={() => setActiveTab('email')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'email'
                ? 'border-brand-blue text-brand-blue bg-white rounded-t-lg shadow-sm'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Mail size={15} />
            Znění odeslaného e-mailu
          </button>

          <button
            onClick={() => setActiveTab('tx')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'tx'
                ? 'border-brand-blue text-brand-blue bg-white rounded-t-lg shadow-sm'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <CreditCard size={15} />
            Detail bankovní transakce
          </button>

          {/* Action buttons on the right side if PDF tab is active */}
          {activeTab === 'pdf' && data?.hasPdf && (
            <div className="ml-auto flex items-center gap-2 pb-2">
              <button
                onClick={handlePrint}
                disabled={!pdfBlobUrl || isPrinting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                title="Vytisknout PDF"
              >
                <Printer size={13} />
                <span className="hidden sm:inline">Vytisknout</span>
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue text-white hover:bg-brand-blue/90 rounded-lg text-xs font-semibold shadow-sm transition-all"
                title="Stáhnout PDF soubor"
              >
                <Download size={13} />
                <span>Uložit PDF</span>
              </button>
              <button
                onClick={handleOpenDirect}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-gray-500 hover:text-brand-blue hover:bg-blue-50 rounded-lg text-xs font-semibold transition-colors"
                title="Otevřít PDF v nové záložce"
              >
                <ExternalLink size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/30">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <Loader2 size={36} className="animate-spin text-brand-blue mb-3" />
              <p className="text-sm font-medium text-gray-700">Načítám odeslané potvrzení...</p>
              <p className="text-xs text-gray-400 mt-1">Ověřuji autorizaci a připravuji dokument 1:1</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center max-w-md mx-auto">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Nepodařilo se načíst detail</h3>
              <p className="text-xs text-red-600 mb-4">{error}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-bold transition-colors"
              >
                Zavřít
              </button>
            </div>
          ) : (
            <>
              {/* TAB 1: PDF Viewer */}
              {activeTab === 'pdf' && data?.hasPdf && (
                <div className="flex flex-col h-[65vh] bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  {pdfBlobUrl ? (
                    <iframe
                      ref={iframeRef}
                      src={`${pdfBlobUrl}#toolbar=1&navpanes=0`}
                      className="w-full h-full border-0"
                      title="Potvrzení o platbě"
                    />
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                      <FileText size={40} className="text-gray-300 mb-3" />
                      <p className="text-sm font-semibold text-gray-700">PDF se připravuje k zobrazení...</p>
                      <button
                        onClick={handleOpenDirect}
                        className="mt-4 px-4 py-2 bg-brand-blue text-white rounded-xl text-xs font-bold inline-flex items-center gap-2"
                      >
                        <ExternalLink size={14} />
                        Otevřít PDF přímo
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Email View */}
              {activeTab === 'email' && (
                <div className="max-w-2xl mx-auto space-y-4">
                  {/* Email envelope header */}
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-500 font-medium">Od:</span>
                      <span className="font-semibold text-gray-800">info@olympdance.cz (Taneční klub Olymp Olomouc)</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-500 font-medium">Komu:</span>
                      <span className="font-semibold text-brand-blue">
                        {data?.recipientEmail || 'Rodič / Plátce'} {data?.recipientName ? `(${data.recipientName})` : ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-500 font-medium">Předmět:</span>
                      <span className="font-bold text-gray-900">{data?.subject || 'Potvrzení o přijetí platby'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium">Příloha:</span>
                      {data?.hasPdf ? (
                        <button
                          onClick={() => setActiveTab('pdf')}
                          className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded border border-emerald-200 font-bold transition-colors"
                        >
                          <FileText size={12} />
                          {filename} (PDF)
                        </button>
                      ) : (
                        <span className="text-gray-400 italic">Bez přílohy</span>
                      )}
                    </div>
                  </div>

                  {/* Email HTML message body */}
                  {data?.emailBodyHtml ? (
                    <div 
                      className="bg-white rounded-xl border border-gray-200 p-2 sm:p-4 shadow-sm overflow-x-auto"
                      dangerouslySetInnerHTML={{ __html: data.emailBodyHtml }}
                    />
                  ) : (
                    <div className="bg-white rounded-xl p-8 text-center text-gray-500 border border-gray-200">
                      Text e-mailu není k dispozici.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Transaction Details */}
              {activeTab === 'tx' && (
                <div className="max-w-xl mx-auto bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
                    <CreditCard size={16} className="text-brand-blue" />
                    Technické záznamy z banky Raiffeisenbank
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <span className="text-gray-400 block mb-0.5">ID transakce (RB API):</span>
                      <span className="font-mono font-bold text-gray-800">{data?.log?.transactionId || '—'}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <span className="text-gray-400 block mb-0.5">Datum zaúčtování:</span>
                      <span className="font-medium text-gray-800">
                        {data?.log?.bookingDate ? new Date(data.log.bookingDate).toLocaleString('cs-CZ') : '—'}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <span className="text-gray-400 block mb-0.5">Částka:</span>
                      <span className="font-bold text-green-700 text-sm">{data?.log?.amount} {data?.log?.currency || 'CZK'}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <span className="text-gray-400 block mb-0.5">Variabilní symbol:</span>
                      <span className="font-mono font-bold text-brand-blue text-sm">{data?.log?.variableSymbol || '—'}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 sm:col-span-2">
                      <span className="text-gray-400 block mb-0.5">Účet odesílatele:</span>
                      <span className="font-mono font-semibold text-gray-800">{data?.log?.senderAccount || 'Neuvedeno'}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 sm:col-span-2">
                      <span className="text-gray-400 block mb-0.5">Název účtu / Jméno plátce:</span>
                      <span className="font-medium text-gray-800">{data?.log?.senderName || 'Neuvedeno'}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 sm:col-span-2">
                      <span className="text-gray-400 block mb-0.5">Zpráva pro příjemce:</span>
                      <span className="font-medium text-gray-700 italic">{data?.log?.message || 'Bez zprávy'}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="text-xs text-gray-500">
            {data?.childName && (
              <span>Přiřazeno účastníkovi: <strong>{data.childName}</strong></span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-bold transition-colors"
          >
            Zavřít
          </button>
        </div>
      </div>
    </div>
  );
};
