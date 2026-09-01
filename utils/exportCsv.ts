import { SchoolRegistration, Registration, School, Camp } from '../types';

/**
 * Exports data to a CSV file with UTF-8 BOM so Microsoft Excel
 * and other spreadsheet tools render Czech characters correctly.
 */
export function downloadCsv(filename: string, headers: string[], rows: (string | number | boolean | null | undefined)[][]) {
  const escapeCell = (val: string | number | boolean | null | undefined) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(escapeCell).join(';'),
    ...rows.map(row => row.map(escapeCell).join(';'))
  ].join('\r\n');

  // \uFEFF is UTF-8 Byte Order Mark (BOM) for Excel compatibility
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportSchoolRegistrationsToCsv(registrations: SchoolRegistration[], schools: School[]) {
  const schoolMap = new Map(schools.map(s => [s.id, s]));

  const headers = [
    'ID přihlášky',
    'Jméno dítěte',
    'Datum narození',
    'Telefon dítěte',
    'Škola / Pobočka',
    'Město',
    'Den a čas',
    'Družina (vyzvedávat)',
    'Jméno rodiče',
    'Email rodiče',
    'Telefon rodiče',
    'Adresa',
    'Status přihlášky',
    'Zaplaceno do',
    'Poznámka administrátora',
    'Vytvořeno'
  ];

  const rows = registrations.map(reg => {
    const s = schoolMap.get(reg.schoolId);
    return [
      reg.id,
      reg.childName,
      reg.childBirthDate || '',
      reg.childPhone || '',
      s?.name || '',
      s?.city || '',
      s ? `${s.day} ${s.time}` : '',
      reg.afterSchoolClub ? 'ANO' : 'NE',
      reg.parentName,
      reg.parentEmail,
      reg.parentPhone,
      reg.parentAddress || '',
      reg.status,
      reg.paidUntil || '',
      reg.adminNote || '',
      reg.createdAt || ''
    ];
  });

  const dateStr = new Date().toISOString().split('T')[0];
  downloadCsv(`olymp-dance-krouzky-${dateStr}.csv`, headers, rows);
}

export function exportCampRegistrationsToCsv(registrations: Registration[], camps: Camp[]) {
  const campMap = new Map(camps.map(c => [c.id, c]));

  const headers = [
    'ID přihlášky',
    'Jméno dítěte',
    'Datum narození',
    'Tábor',
    'Termín',
    'Cena',
    'Variabilní symbol',
    'Jméno rodiče',
    'Email rodiče',
    'Telefon rodiče',
    'Status',
    'Poznámka administrátora',
    'Počet nahraných dokumentů',
    'Vytvořeno'
  ];

  const rows = registrations.map(reg => {
    const camp = campMap.get(reg.campId);
    return [
      reg.id,
      reg.childName,
      reg.childBirthDate,
      camp?.title || '',
      camp?.date || '',
      camp?.price || '',
      camp?.variableSymbol || '',
      reg.parentName,
      reg.parentEmail,
      reg.parentPhone,
      reg.status,
      reg.adminNote || '',
      reg.documents?.length || 0,
      reg.createdAt || ''
    ];
  });

  const dateStr = new Date().toISOString().split('T')[0];
  downloadCsv(`olymp-dance-tabory-${dateStr}.csv`, headers, rows);
}
