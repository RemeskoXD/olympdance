import React, { useState } from 'react';
import { School } from '../types';
import { Calendar, X, Check, Wand2, ArrowRight, Clock, AlertCircle } from 'lucide-react';

interface TrainingDatesModalProps {
  school: School;
  onClose: () => void;
  onSave: (trainingDates: string[]) => void;
}

export const TrainingDatesModal: React.FC<TrainingDatesModalProps> = ({
  school,
  onClose,
  onSave,
}) => {
  // Initialize exactly 14 slots
  const [dates, setDates] = useState<string[]>(() => {
    const existing = school.trainingDates || [];
    const padded = Array.from({ length: 14 }, (_, i) => existing[i] || '');
    return padded;
  });

  const [startDate, setStartDate] = useState<string>(() => {
    // If 1st date exists, use it; otherwise default to today
    if (school.trainingDates && school.trainingDates[0]) {
      return school.trainingDates[0];
    }
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Update a specific lesson slot
  const handleDateChange = (index: number, value: string) => {
    const updated = [...dates];
    updated[index] = value;
    setDates(updated);
    setHasChanges(true);
  };

  // Clear a specific slot
  const handleClearSlot = (index: number) => {
    const updated = [...dates];
    updated[index] = '';
    setDates(updated);
    setHasChanges(true);
  };

  // Shift all lessons from index onwards by +7 days (great for school holidays)
  const handleShiftForward = (fromIndex: number) => {
    const updated = [...dates];
    for (let i = fromIndex; i < 14; i++) {
      if (updated[i]) {
        const d = new Date(updated[i]);
        d.setDate(d.getDate() + 7);
        updated[i] = d.toISOString().split('T')[0];
      }
    }
    setDates(updated);
    setHasChanges(true);
  };

  // Auto-generate 14 consecutive weeks starting from startDate
  const handleAutoGenerate = () => {
    if (!startDate) return;
    const base = new Date(startDate);
    if (isNaN(base.getTime())) return;

    const generated: string[] = [];
    for (let i = 0; i < 14; i++) {
      const nextDate = new Date(base);
      nextDate.setDate(base.getDate() + i * 7);
      generated.push(nextDate.toISOString().split('T')[0]);
    }
    setDates(generated);
    setHasChanges(true);
  };

  // Clear all dates
  const handleClearAll = () => {
    setDates(Array(14).fill(''));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Filter out empty dates or keep array with empty slots cleaned
    onSave(dates);
  };

  // Helper to format Czech date name
  const formatCzechDate = (dateStr: string) => {
    if (!dateStr) return null;
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      if (isNaN(d.getTime())) return null;

      const dayNames = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'];
      const dayName = dayNames[d.getDay()];
      return `${dayName} ${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
    } catch {
      return null;
    }
  };

  const filledCount = dates.filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-hidden flex flex-col border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-brand-blue to-blue-900 text-white flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/20 font-bold backdrop-blur-xs">
                Termíny kroužku ({filledCount}/14 nastaveno)
              </span>
              <span className="text-xs text-blue-100 flex items-center">
                <Clock size={12} className="mr-1" /> {school.day} {school.time}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">{school.name}</h2>
            <p className="text-xs sm:text-sm text-blue-100 mt-1">
              Nastavte data až 14 tréninků pro toto pololetí. Termíny se ihned zobrazí rodičům v portálu a v prezenční listině.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors shrink-0"
            title="Zavřít"
          >
            <X size={20} />
          </button>
        </div>

        {/* Generator Toolbar */}
        <div className="p-4 bg-blue-50/70 border-b border-blue-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center flex-wrap gap-2">
            <span className="font-bold text-gray-700 flex items-center">
              <Wand2 size={14} className="mr-1.5 text-brand-blue" />
              Generátor termínů (týdně):
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500">1. lekce:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-gray-800 outline-none focus:ring-1 focus:ring-brand-blue"
              />
            </div>
            <button
              onClick={handleAutoGenerate}
              className="bg-brand-blue hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center shadow-xs"
            >
              Vygenerovat 14 lekcí <ArrowRight size={12} className="ml-1" />
            </button>
          </div>

          <button
            onClick={handleClearAll}
            className="text-gray-500 hover:text-red-600 transition-colors self-end sm:self-auto font-medium"
          >
            Vymazat vše
          </button>
        </div>

        {/* 14 Lesson Slots Grid */}
        <div className="p-5 overflow-y-auto flex-1 space-y-2.5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {dates.map((dateVal, idx) => {
              const czechFormatted = formatCzechDate(dateVal);
              const isFilled = Boolean(dateVal);

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                    isFilled 
                      ? 'bg-white border-blue-200 shadow-xs ring-1 ring-blue-50' 
                      : 'bg-gray-50/60 border-dashed border-gray-200 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                      isFilled 
                        ? 'bg-brand-blue text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {idx + 1}.
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-gray-800 text-xs">
                          {idx + 1}. trénink
                        </span>
                        {isFilled && (
                          <span className="text-[10px] text-green-700 bg-green-50 font-bold px-1.5 py-0.2 rounded">
                            Aktivní
                          </span>
                        )}
                      </div>
                      {czechFormatted ? (
                        <p className="text-[11px] font-semibold text-brand-blue truncate">
                          {czechFormatted}
                        </p>
                      ) : (
                        <p className="text-[11px] text-gray-400 italic">
                          Termín nezadán
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <input
                      type="date"
                      value={dateVal}
                      onChange={(e) => handleDateChange(idx, e.target.value)}
                      className="text-xs bg-white border border-gray-300 rounded-lg px-2 py-1 font-medium text-gray-800 outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue w-32"
                    />
                    {isFilled && (
                      <>
                        <button
                          onClick={() => handleShiftForward(idx)}
                          className="p-1 text-gray-400 hover:text-brand-blue hover:bg-blue-50 rounded text-[10px] font-bold"
                          title="Posunout tuto a všechny následující lekce o +7 dní (např. po prázdninách)"
                        >
                          +7d
                        </button>
                        <button
                          onClick={() => handleClearSlot(idx)}
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                          title="Vymazat tento termín"
                        >
                          <X size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start space-x-2 mt-4">
            <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong>Tip pro trenéry:</strong> Tlačítko <strong>+7d</strong> u termínu posune tento i všechny zbývající tréninky o týden dopředu – to se hodí při vložení státního svátku nebo podzimních/vánočních prázdnin.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <p className="text-xs text-gray-500">
            {hasChanges ? 'Máte neuložené změny' : 'Žádné neuložené změny'}
          </p>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Zrušit
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-brand-blue hover:bg-blue-700 rounded-xl transition-colors flex items-center shadow-md"
            >
              <Check size={15} className="mr-1.5" />
              Uložit termíny tréninků
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
