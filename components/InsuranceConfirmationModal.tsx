import React, { useState, useEffect, useRef } from 'react';
import { X, Printer, ShieldCheck, Loader2, FileDown, ExternalLink, AlertCircle, RefreshCw } from 'lucide-react';

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
  password?: string;
  paymentStatus: string;
}

interface InsuranceConfirmationModalProps {
  data: ConfirmationData;
  onClose: () => void;
}

export const InsuranceConfirmationModal: React.FC<InsuranceConfirmationModalProps> = ({ data, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const safeChildName = (data.childName || 'ucastnik').trim().replace(/[^a-zA-Z0-9á-žÁ-Ž_-]/g, '_');
  const filename = `Potvrzeni_o_prijeti_platby_${safeChildName}.pdf`;

  const fetchPdf = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const adminToken = localStorage.getItem('olymp_admin_token');
      const headers: Record<string, string> = {};
      if (adminToken) {
        headers['Authorization'] = `Bearer ${adminToken}`;
      }

      let res: Response | null = null;

      // 1. Try registration endpoint if ID is provided
      if (data.id) {
        const queryParams = new URLSearchParams();
        if (adminToken) queryParams.set('token', adminToken);
        if (data.variableSymbol) queryParams.set('vs', data.variableSymbol);
        if (data.password) queryParams.set('password', data.password);
        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

        const endpoint = data.activityType === 'tabor'
          ? `/api/registrations/${data.id}/confirmation-pdf${queryString}`
          : `/api/school-registrations/${data.id}/confirmation-pdf${queryString}`;

        res = await fetch(endpoint, { headers });
      }

      // 2. If no ID or primary endpoint returns error, fall back to custom generator
      if (!res || !res.ok) {
        // Parse numerical amount
        const amountNum = parseFloat(String(data.price || '').replace(/[^0-9]/g, '')) || 0;

        res = await fetch('/api/generate-custom-confirmation-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body: JSON.stringify({
            activityType: data.activityType,
            activityName: data.activityTitle,
            paymentDate: new Date(),
            senderAccount: '',
            parentName: data.parentName || 'Zákonný zástupce',
            childName: data.childName,
            childBirthDate: data.childBirthDate,
            amount: amountNum,
            period: data.periodOrDate || null,
            issueDate: new Date()
          })
        });
      }

      if (!res.ok) {
        let errMessage = 'Nepodařilo se vygenerovat PDF potvrzení.';
        try {
          const errData = await res.json();
          if (errData?.error) errMessage = errData.error;
        } catch {}
        throw new Error(errMessage);
      }

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      setPdfBlobUrl(blobUrl);
    } catch (err: any) {
      console.error('Failed to load confirmation PDF:', err);
      setError(err?.message || 'Nastala chyba při přípravě PDF potvrzení.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPdf();

    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [data.id, data.childName]);

  const handlePrint = () => {
    if (!pdfBlobUrl) return;
    setIsPrinting(true);

    // Try printing from the embedded iframe directly (prints ONLY the PDF)
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.focus();
        iframeRef.current.contentWindow.print();
        setTimeout(() => setIsPrinting(false), 800);
        return;
      } catch (err) {
        console.warn('Direct iframe print blocked, falling back to window.open', err);
      }
    }

    // Fallback: open PDF in a new tab where browser's native PDF print controls take over
    const printWindow = window.open(pdfBlobUrl, '_blank');
    if (printWindow) {
      printWindow.focus();
    }
    setTimeout(() => setIsPrinting(false), 500);
  };

  const handleDownload = () => {
    if (!pdfBlobUrl) return;
    const a = document.createElement('a');
    a.href = pdfBlobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpenInNewTab = () => {
    if (!pdfBlobUrl) return;
    window.open(pdfBlobUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
      {/* Modal Container */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-5xl h-[94vh] flex flex-col overflow-hidden border border-gray-200">
        
        {/* Modal Top Bar */}
        <div className="bg-brand-blue text-white px-4 sm:px-6 py-3.5 flex flex-wrap justify-between items-center gap-3 shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-yellow-400 shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div className="truncate">
              <h3 className="font-bold text-base sm:text-lg leading-tight truncate">
                Potvrzení o úhradě pro pojišťovnu / FKSP
              </h3>
              <p className="text-xs text-blue-200 truncate">
                {data.childName} • {data.activityTitle}
              </p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center space-x-2 shrink-0 ml-auto">
            {pdfBlobUrl && (
              <>
                <button
                  onClick={handlePrint}
                  disabled={isPrinting}
                  className="bg-white/15 hover:bg-white/25 text-white px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center shadow-xs disabled:opacity-50 cursor-pointer"
                  title="Vytisknout pouze samotné PDF potvrzení"
                >
                  {isPrinting ? (
                    <Loader2 size={16} className="mr-1.5 animate-spin" />
                  ) : (
                    <Printer size={16} className="mr-1.5" />
                  )}
                  <span className="hidden sm:inline">Vytisknout</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center shadow-xs cursor-pointer"
                  title="Stáhnout oficiální PDF soubor"
                >
                  <FileDown size={16} className="mr-1.5" />
                  <span>Uložit PDF</span>
                </button>

                <button
                  onClick={handleOpenInNewTab}
                  className="bg-white/15 hover:bg-white/25 text-white p-2 rounded-xl transition-colors hidden md:flex items-center"
                  title="Otevřít PDF v nové záložce prohlížeče"
                >
                  <ExternalLink size={17} />
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors text-white ml-1 cursor-pointer"
              title="Zavřít okno"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body - Embedded PDF Viewer */}
        <div className="flex-1 bg-gray-100 relative overflow-hidden flex flex-col">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/90 z-10">
              <Loader2 size={42} className="text-brand-blue animate-spin mb-3" />
              <p className="text-base font-bold text-gray-800">Generuji oficiální PDF potvrzení...</p>
              <p className="text-xs text-gray-500 mt-1">Sestavuji doklad s logem TK Olymp a razítkem 1:1</p>
            </div>
          )}

          {error ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-4">
                <AlertCircle size={30} />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-1">Chyba při přípravě potvrzení</h4>
              <p className="text-sm text-gray-600 max-w-md mb-6">{error}</p>
              <div className="flex gap-3">
                <button
                  onClick={fetchPdf}
                  className="bg-brand-blue text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors flex items-center shadow-sm"
                >
                  <RefreshCw size={16} className="mr-2" /> Zkusit znovu
                </button>
                <button
                  onClick={onClose}
                  className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-50"
                >
                  Zavřít
                </button>
              </div>
            </div>
          ) : pdfBlobUrl ? (
            <iframe
              ref={iframeRef}
              src={`${pdfBlobUrl}#toolbar=1&navpanes=0&view=FitH`}
              title="Oficiální PDF potvrzení o úhradě"
              className="w-full h-full border-0 bg-white"
            />
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="bg-white px-4 sm:px-6 py-3 border-t border-gray-200 flex flex-wrap justify-between items-center gap-3 shrink-0">
          <div className="text-xs text-gray-500">
            Oficiální doklad s razítkem a podpisem pro zdravotní pojišťovny ČR a fond FKSP.
          </div>

          <div className="flex items-center space-x-2.5 ml-auto">
            {pdfBlobUrl && (
              <>
                <button
                  onClick={handleOpenInNewTab}
                  className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors hidden sm:inline-flex items-center"
                >
                  <ExternalLink size={14} className="mr-1.5" /> Samostatné okno
                </button>
                <button
                  onClick={handlePrint}
                  disabled={isPrinting || !pdfBlobUrl}
                  className="px-4 py-2 text-xs sm:text-sm font-bold text-brand-blue bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors inline-flex items-center"
                >
                  <Printer size={15} className="mr-1.5" /> Vytisknout PDF
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!pdfBlobUrl}
                  className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors inline-flex items-center shadow-xs"
                >
                  <FileDown size={15} className="mr-1.5" /> Uložit PDF
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-xl transition-colors"
            >
              Zavřít
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

