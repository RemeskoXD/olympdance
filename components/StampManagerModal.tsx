import React, { useState, useRef } from 'react';
import { X, Upload, Check, AlertCircle, FileText, Image as ImageIcon, RefreshCw } from 'lucide-react';

interface StampManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StampManagerModal: React.FC<StampManagerModalProps> = ({ isOpen, onClose }) => {
  const [stampTimestamp, setStampTimestamp] = useState<number>(Date.now());
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

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
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-blue to-blue-900 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Oficiální razítko a podpis pro PDF</h3>
              <p className="text-xs text-blue-200">Správa obrázku razítka pro potvrzení plateb kroužků a táborů</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Stamp Preview */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Aktuálně používané razítko s podpisem:
              </label>
              <button
                type="button"
                onClick={() => setStampTimestamp(Date.now())}
                className="text-xs text-brand-blue hover:underline flex items-center gap-1 font-medium"
              >
                <RefreshCw size={12} /> Obnovit náhled
              </button>
            </div>
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex items-center justify-center min-h-[140px] text-center relative overflow-hidden">
              <img
                src={`/stamp-signature.png?t=${stampTimestamp}`}
                alt="Aktuální razítko a podpis"
                className="max-h-32 max-w-full object-contain drop-shadow-xs"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Toto razítko a podpis se automaticky tiskne v pravém dolním rohu všech PDF potvrzení o přijetí platby.
            </p>
          </div>

          {/* Upload Area */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">
              Nahrát originální snímek razítka (PNG nebo JPG):
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
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
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-brand-blue mb-3">
                  {uploading ? (
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                <p className="font-semibold text-gray-800 text-sm mb-1">
                  {uploading ? 'Zpracovávám a ukládám razítko...' : 'Klikněte sem nebo přetáhněte soubor se snímkem razítka'}
                </p>
                <p className="text-xs text-gray-500">
                  Podporované formáty: PNG, JPG, JPEG (např. vámi poskytnutý snímek)
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

          {/* Actions & Links */}
          <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <a
                href="/api/sample-confirmation-pdf"
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-xs transition-colors"
              >
                <ImageIcon size={14} /> Náhled listu (PNG)
              </a>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl text-xs transition-colors"
            >
              Zavřít
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
