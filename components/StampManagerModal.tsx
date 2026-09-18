import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Check, AlertCircle, FileText, Image as ImageIcon, RefreshCw, Calendar, Save } from 'lucide-react';

interface StampManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPeriodChange?: (newPeriod: string) => void;
}

export const StampManagerModal: React.FC<StampManagerModalProps> = ({ isOpen, onClose, onPeriodChange }) => {
  const [stampTimestamp, setStampTimestamp] = useState<number>(Date.now());
  const [period, setPeriod] = useState<string>('říjen 2026 až únor 2026');
  const [initialPeriod, setInitialPeriod] = useState<string>('říjen 2026 až únor 2026');
  const [savingPeriod, setSavingPeriod] = useState<boolean>(false);
  const [periodSavedSuccess, setPeriodSavedSuccess] = useState<boolean>(false);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch current stamp & period on open
  useEffect(() => {
    if (isOpen) {
      fetchStampInfo();
    }
  }, [isOpen]);

  const fetchStampInfo = async () => {
    try {
      const res = await fetch('/api/admin/stamp');
      if (res.ok) {
        const data = await res.json();
        if (data.period) {
          setPeriod(data.period);
          setInitialPeriod(data.period);
        }
      }
    } catch (err) {
      console.warn('Could not fetch stamp/period info:', err);
    }
  };

  if (!isOpen) return null;

  const handleSavePeriod = async (customPeriod?: string) => {
    const textToSave = (customPeriod || period).trim();
    if (!textToSave) {
      setErrorMessage('Zadejte prosím platný text období.');
      return;
    }

    setSavingPeriod(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setPeriodSavedSuccess(false);

    try {
      const adminToken = localStorage.getItem('olymp_admin_token') || '';
      const response = await fetch('/api/admin/stamp-period', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ period: textToSave })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Uložení období se nezdařilo.');
      }

      setPeriod(data.period || textToSave);
      setInitialPeriod(data.period || textToSave);
      setPeriodSavedSuccess(true);
      setSuccessMessage('Platné období pro PDF potvrzení bylo úspěšně uloženo a aplikováno!');
      setStampTimestamp(Date.now());
      if (onPeriodChange) {
        onPeriodChange(data.period || textToSave);
      }
      setTimeout(() => setPeriodSavedSuccess(false), 3500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Chyba při ukládání období.');
    } finally {
      setSavingPeriod(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Vyberte prosím obrázek ve formátu PNG, JPG nebo WebP.');
      return;
    }

    setUploading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('stampImage', file);
    if (period && period.trim()) {
      formData.append('period', period.trim());
    }

    try {
      const adminToken = localStorage.getItem('olymp_admin_token') || '';
      const response = await fetch('/api/admin/stamp', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Nahrání razítka se nezdařilo.');
      }

      setSuccessMessage('Obrázek razítka a podpisu byl úspěšně nahrán a aktivován pro všechna PDF potvrzení!');
      setStampTimestamp(Date.now());
      if (data.period) {
        setPeriod(data.period);
        setInitialPeriod(data.period);
        if (onPeriodChange) onPeriodChange(data.period);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Došlo k chybě při nahrávání souboru.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-blue to-blue-900 text-white px-6 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Oficiální razítko a období pro PDF</h3>
              <p className="text-xs text-blue-200">Nastavení razítka a platného období pro potvrzení o úhradě</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Section 1: Period input field */}
          <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-blue" />
                <label className="text-xs font-bold uppercase tracking-wider text-gray-800">
                  Platné období na potvrzení (pololetí kroužků):
                </label>
              </div>
              {periodSavedSuccess && (
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check size={12} /> Uloženo
                </span>
              )}
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Zde zadejte text období, který se automaticky vytiskne na všech nově stahovaných a odesílaných PDF potvrzeních o přijetí platby.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="např. říjen 2026 až únor 2026"
                className="flex-1 px-3.5 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue font-medium text-gray-800 shadow-2xs"
              />
              <button
                type="button"
                onClick={() => handleSavePeriod()}
                disabled={savingPeriod || !period.trim()}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs ${
                  period !== initialPeriod
                    ? 'bg-brand-blue hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {savingPeriod ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : periodSavedSuccess ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>{savingPeriod ? 'Ukládám...' : 'Uložit období'}</span>
              </button>
            </div>

            {/* Quick preset buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-gray-500 font-medium">Rychlé volby:</span>
              <button
                type="button"
                onClick={() => {
                  const val = 'říjen 2026 až únor 2026';
                  setPeriod(val);
                  handleSavePeriod(val);
                }}
                className="text-[11px] px-2.5 py-1 rounded-md bg-white hover:bg-blue-100/70 text-gray-700 hover:text-brand-blue border border-gray-200 transition-colors font-medium shadow-2xs"
              >
                říjen 2026 až únor 2026
              </button>
              <button
                type="button"
                onClick={() => {
                  const val = 'únor 2027 až červen 2027';
                  setPeriod(val);
                  handleSavePeriod(val);
                }}
                className="text-[11px] px-2.5 py-1 rounded-md bg-white hover:bg-blue-100/70 text-gray-700 hover:text-brand-blue border border-gray-200 transition-colors font-medium shadow-2xs"
              >
                únor 2027 až červen 2027
              </button>
              <button
                type="button"
                onClick={() => {
                  const val = 'říjen 2026 až květen 2026';
                  setPeriod(val);
                  handleSavePeriod(val);
                }}
                className="text-[11px] px-2.5 py-1 rounded-md bg-white hover:bg-blue-100/70 text-gray-700 hover:text-brand-blue border border-gray-200 transition-colors font-medium shadow-2xs"
              >
                říjen 2026 až květen 2026
              </button>
            </div>

            {/* Live PDF row preview */}
            <div className="mt-2 p-2.5 bg-white rounded-lg border border-blue-200/60 flex items-center gap-2 text-xs">
              <span className="text-gray-500 font-medium shrink-0">Náhled na PDF listu:</span>
              <span className="font-mono text-gray-900 bg-gray-50 px-2 py-0.5 rounded border border-gray-200 font-semibold truncate">
                za období :  {period ? period.replace(/\.+$/, '') : '...'}.
              </span>
            </div>
          </div>

          {/* Section 2: Current Stamp Preview */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Aktuálně používané razítko s podpisem:
              </label>
              <button
                type="button"
                onClick={() => {
                  setStampTimestamp(Date.now());
                  fetchStampInfo();
                }}
                className="text-xs text-brand-blue hover:underline flex items-center gap-1 font-medium"
              >
                <RefreshCw size={12} /> Obnovit náhled
              </button>
            </div>
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex items-center justify-center min-h-[130px] text-center relative overflow-hidden">
              <img
                src={`/stamp-signature.png?t=${stampTimestamp}`}
                alt="Aktuální razítko a podpis"
                className="max-h-28 max-w-full object-contain drop-shadow-xs"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Toto razítko a podpis se automaticky tiskne v pravém dolním rohu všech PDF potvrzení o přijetí platby.
            </p>
          </div>

          {/* Section 3: Upload Area */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">
              Nahrát nový snímek razítka s podpisem (PNG nebo JPG):
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                isDragOver 
                  ? 'border-brand-blue bg-blue-50/50 scale-[1.01]' 
                  : 'border-gray-300 hover:border-brand-blue hover:bg-gray-50/80'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />

              <div className="flex flex-col items-center">
                <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center text-brand-blue mb-2.5">
                  {uploading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                </div>
                <p className="font-semibold text-gray-800 text-sm mb-1">
                  {uploading ? 'Zpracovávám a ukládám razítko...' : 'Klikněte sem nebo přetáhněte nový snímek razítka'}
                </p>
                <p className="text-xs text-gray-500">
                  Podporované formáty: PNG, JPG, JPEG. Automaticky se optimalizuje na vysoké rozlišení pro tisk.
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          {successMessage && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2.5 text-xs text-green-800 animate-in fade-in">
              <Check className="w-4 h-4 text-green-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions & Links */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <a
              href={`/api/sample-confirmation-pdf?t=${stampTimestamp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg text-xs transition-colors border border-emerald-200"
            >
              <FileText size={14} /> Otevřít zkušební PDF
            </a>
            <a
              href={`/sample-confirmation-preview.png?t=${stampTimestamp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 font-semibold rounded-lg text-xs transition-colors border border-gray-200"
            >
              <ImageIcon size={14} /> Náhled listu (PNG)
            </a>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl text-xs transition-colors"
          >
            Zavřít
          </button>
        </div>
      </div>
    </div>
  );
};
