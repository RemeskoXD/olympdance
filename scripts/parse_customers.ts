import fs from 'fs';

export interface RawCustomer {
  email: string;
  childName: string;
  childSurname: string;
  childRodneCislo: string;
  address: string;
  phone: string;
  schoolRaw: string;
}

export function parseCsvRows(content: string): RawCustomer[] {
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const results: RawCustomer[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (i === 0 && (line.toLowerCase().includes('email') || line.toLowerCase().includes('rodiče'))) {
      continue; // header
    }

    // Parse CSV line with quotes
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let charIdx = 0; charIdx < line.length; charIdx++) {
      const char = line[charIdx];
      if (char === '"') {
        if (inQuotes && line[charIdx + 1] === '"') {
          current += '"';
          charIdx++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        fields.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    fields.push(current.trim());

    if (fields.length >= 7) {
      results.push({
        email: fields[0],
        childName: fields[1],
        childSurname: fields[2],
        childRodneCislo: fields[3],
        address: fields[4],
        phone: fields[5],
        schoolRaw: fields[6]
      });
    }
  }

  return results;
}

if (process.argv[1] && process.argv[1].endsWith('parse_customers.ts')) {
  const file = fs.readFileSync('./import_customers.csv', 'utf8');
  const items = parseCsvRows(file);
  console.log(`Parsed ${items.length} records.`);
  const schools = new Set<string>();
  items.forEach(it => schools.add(it.schoolRaw));
  console.log('Unique schools:', Array.from(schools));
}
