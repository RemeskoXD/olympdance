import React, { useRef } from 'react';
import { School, SchoolRegistration } from '../types';
import { Printer, X, Download, Users, School as SchoolIcon, Calendar } from 'lucide-react';

interface AttendanceSheetModalProps {
  school: School;
  registrations: SchoolRegistration[];
  onClose: () => void;
}

export const AttendanceSheetModal: React.FC<AttendanceSheetModalProps> = ({
  school,
  registrations,
  onClose
}) => {
  const activeStudents = registrations.filter(r => r.status !== 'cancelled');

  const handlePrint = () => {
    window.print();
  };

  // Generate 12 empty lesson columns for the semester
  const lessonColumns = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto border border-gray-100 flex flex-col print:shadow-none print:border-none print:max-w-none print:max-h-none print:w-full">
        
        {/* Modal Header (hidden on print) */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-blue text-white flex items-center justify-center">
              <SchoolIcon size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Prezenční listina pro trenéra</h3>
              <p className="text-xs text-gray-500">{school.name} ({school.city}) • {school.day} {school.time}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="bg-brand-blue hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors flex items-center shadow-sm"
            >
              <Printer size={16} className="mr-2" /> Vytisknout (PDF)
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Content */}
        <div className="p-8 print:p-4 text-gray-900 bg-white font-sans">
          
          {/* Header */}
          <div className="border-b-2 border-brand-red pb-4 mb-6 flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-brand-red text-white text-xs font-black uppercase px-2 py-0.5 rounded tracking-wider">
                  OLYMP DANCE
                </span>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Taneční škola Olomouc
                </span>
              </div>
              <h1 className="text-2xl font-black text-gray-900 mt-1">Prezenční listina kroužku</h1>
              <p className="text-sm font-bold text-brand-blue mt-0.5">
                {school.name} — {school.city}
              </p>
            </div>
            <div className="text-right text-xs space-y-1">
              <p><span className="text-gray-500">Termín:</span> <strong className="text-gray-900">{school.day} {school.time}</strong></p>
              <p><span className="text-gray-500">Pololetí:</span> <strong className="text-gray-900">Školní rok 2025/2026</strong></p>
              <p><span className="text-gray-500">Počet dětí:</span> <strong className="text-gray-900">{activeStudents.length}</strong></p>
            </div>
          </div>

          {/* Attendance Table */}
          {activeStudents.length === 0 ? (
            <p className="text-center py-12 text-gray-400 italic">Na této škole zatím nejsou žádní aktivní žáci.</p>
          ) : (
            <div className="overflow-x-auto border border-gray-300 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300">
                    <th className="p-2 border-r border-gray-300 w-8 text-center font-bold">#</th>
                    <th className="p-2 border-r border-gray-300 font-bold min-w-[150px]">Jméno a příjmení</th>
                    <th className="p-2 border-r border-gray-300 font-bold w-20 text-center">Narození</th>
                    <th className="p-2 border-r border-gray-300 font-bold w-16 text-center">Družina</th>
                    <th className="p-2 border-r border-gray-300 font-bold min-w-[120px]">Telefon rodiče</th>
                    {lessonColumns.map(col => (
                      <th key={col} className="p-1 border-r border-gray-300 text-center w-7 font-bold text-[10px] text-gray-600">
                        {col}.
                      </th>
                    ))}
                    <th className="p-2 font-bold min-w-[100px]">Poznámka trenéra</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                  {activeStudents.map((reg, idx) => (
                    <tr key={reg.id} className="hover:bg-gray-50/50">
                      <td className="p-2 border-r border-gray-300 text-center font-bold text-gray-500">
                        {idx + 1}
                      </td>
                      <td className="p-2 border-r border-gray-300 font-bold text-gray-900">
                        {reg.childName}
                        {reg.childPhone && <span className="block text-[10px] text-gray-500 font-normal">Tel: {reg.childPhone}</span>}
                      </td>
                      <td className="p-2 border-r border-gray-300 text-center text-gray-700">
                        {reg.childBirthDate}
                      </td>
                      <td className="p-2 border-r border-gray-300 text-center font-bold">
                        {reg.afterSchoolClub ? (
                          <span className="text-purple-700 bg-purple-50 px-1 py-0.5 rounded text-[10px]">ANO</span>
                        ) : (
                          <span className="text-gray-400 text-[10px]">NE</span>
                        )}
                      </td>
                      <td className="p-2 border-r border-gray-300">
                        <div className="font-semibold text-gray-800">{reg.parentPhone}</div>
                        <div className="text-[10px] text-gray-500 truncate max-w-[110px]">{reg.parentName}</div>
                      </td>
                      {lessonColumns.map(col => (
                        <td key={col} className="p-1 border-r border-gray-300 text-center h-8">
                          {/* Blank cell for physical checkmark or mark */}
                        </td>
                      ))}
                      <td className="p-2 text-gray-400 text-[10px]">
                        {reg.adminNote || ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer for notes & trainer signature */}
          <div className="mt-8 pt-4 border-t border-gray-200 grid grid-cols-2 gap-8 text-xs text-gray-600">
            <div>
              <h4 className="font-bold text-gray-800 mb-1">Vysvětlivky docházky:</h4>
              <p>✔ = Přítomen | <strong>O</strong> = Omluven | <strong>N</strong> = Neomluven</p>
              <p className="mt-2 text-[11px] text-gray-500">
                Olymp Dance Olomouc • info@olympdance.cz • www.olympdance.cz
              </p>
            </div>
            <div className="text-right flex flex-col justify-end">
              <div className="border-b border-dashed border-gray-400 w-48 ml-auto mb-1"></div>
              <p className="text-[11px] text-gray-500">Podpis trenéra / lektora</p>
            </div>
          </div>
        </div>

        {/* Modal Footer (hidden on print) */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center print:hidden">
          <p className="text-xs text-gray-500">
            Tip: Pro nejlepší výsledek v dialogu tisku vyberte orientaci <strong>Na šířku (Landscape)</strong>.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Zavřít
            </button>
            <button
              onClick={handlePrint}
              className="bg-brand-blue hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl text-sm transition-colors flex items-center shadow-md"
            >
              <Printer size={16} className="mr-2" /> Vytisknout listinu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
