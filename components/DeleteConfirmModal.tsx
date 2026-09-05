import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  itemName?: string;
  description?: string;
  isDeleting?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Opravdu smazat přihlášku?',
  itemName,
  description = 'Tato akce je nevratná a přihláška bude trvale odstraněna ze systému i z databáze.',
  isDeleting = false
}) => {
  if (!isOpen) return null;

  return (
    <div id="delete-confirm-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 animate-scaleUp">
        {/* Header */}
        <div className="p-6 text-center relative">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="w-14 h-14 bg-red-100 text-brand-red rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Trash2 size={26} />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {title}
          </h3>
          
          {itemName && (
            <p className="text-sm font-semibold text-brand-blue bg-blue-50 py-1 px-3 rounded-lg inline-block my-2">
              {itemName}
            </p>
          )}

          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Zrušit
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Trash2 size={16} />
            {isDeleting ? 'Mažu...' : 'Ano, určitě smazat'}
          </button>
        </div>
      </div>
    </div>
  );
};
