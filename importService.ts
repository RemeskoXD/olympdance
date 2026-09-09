import fs from 'fs';
import path from 'path';
import { Pool } from 'mysql2/promise';

export interface RawCustomer {
  email: string;
  childName: string;
  childSurname: string;
  childRodneCislo: string;
  address: string;
  phone: string;
  schoolRaw: string;
}

export interface QueueItem {
  id: string;
  registrationId: string | null;
  email: string;
  childName: string;
  childSurname: string;
  childRodneCislo: string;
  address: string;
  phone: string;
  schoolRaw: string;
  schoolId: string;
  schoolName: string;
  variableSymbol: string;
  password: string;
  emailStatus: 'pending' | 'sending' | 'sent' | 'failed';
  emailSentAt: string | null;
  emailError: string | null;
  batchNumber: number;
  createdAt: string;
  updatedAt: string;
}

export const SCHOOL_MAPPING: Record<string, { id: string; name: string; city: string; price?: string }> = {
  "MŠ AURORA": { id: "30", name: "MŠ Aurora", city: "Olomouc", price: "1550 Kč / pololetí" },
  "ZŠ BOHUŇOVICE": { id: "2", name: "ZŠ a MŠ Bohuňovice", city: "Bohuňovice", price: "1700 Kč / pololetí" },
  "ZŠ DUB NAD MORAVOU": { id: "31", name: "ZŠ Dub nad Moravou", city: "Dub nad Moravou", price: "1700 Kč / pololetí" },
  "ZŠ GORKÉHO": { id: "12", name: "ZŠ Gorkého", city: "Olomouc", price: "1700 Kč / pololetí" },
  "ZŠ HÁLKOVA": { id: "15", name: "ZŠ Hálkova", city: "Olomouc", price: "1700 Kč / pololetí" },
  "ZŠ HNĚVOTÍN": { id: "6", name: "ZŠ Hněvotín", city: "Hněvotín", price: "1700 Kč / pololetí" },
  "ZŠ HOLEČKOVA": { id: "28", name: "ZŠ Holečkova", city: "Olomouc", price: "1700 Kč / pololetí" },
  "ZŠ LUTÍN": { id: "8", name: "ZŠ Lutín", city: "Lutín", price: "1700 Kč / pololetí" },
  "ZŠ PLUMLOV": { id: "24", name: "ZŠ Plumlov", city: "Plumlov", price: "1700 Kč / pololetí" },
  "ZŠ PŘÍKAZY": { id: "9", name: "ZŠ Příkazy", city: "Příkazy", price: "1700 Kč / pololetí" },
  "ZŠ ROOSEVELTOVA": { id: "3", name: "ZŠ Rooseveltova", city: "Olomouc", price: "1700 Kč / pololetí" },
  "ZŠ ROŽŇAVSKÁ": { id: "13", name: "ZŠ Rožňavská", city: "Olomouc", price: "1700 Kč / pololetí" },
  "ZŠ ŘEZNÍČKOVA": { id: "1", name: "ZŠ Řezníčkova", city: "Olomouc", price: "1700 Kč / pololetí" },
  "ZŠ SAMOTIŠKY": { id: "14", name: "ZŠ Samotišky", city: "Samotišky", price: "1700 Kč / pololetí" },
  "MŠ SAMOTIŠKY": { id: "1788899935373", name: "MŠ Samotišky", city: "Samotišky", price: "1700 Kč / pololetí" },
  "ZŠ SPOJENCŮ": { id: "29", name: "ZŠ Spojenců", city: "Olomouc", price: "1700 Kč / pololetí" },
  "ZŠ STUPKOVA": { id: "10", name: "ZŠ Stupkova", city: "Olomouc", price: "1700 Kč / pololetí" },
  "ZŠ ŠTĚPÁNOV": { id: "11", name: "ZŠ Štěpánov", city: "Štěpánov", price: "1700 Kč / pololetí" },
  "ZŠ OLŠANY U PROSTĚJOVA": { id: "26", name: "ZŠ Olšany", city: "Olšany u Pv", price: "1500 Kč / pololetí" },
  "MŠ OLŠANY U PROSTĚJOVA": { id: "26b", name: "MŠ Olšany", city: "Olšany u Pv", price: "1500 Kč / pololetí" },
  "ZŠ DR. HORÁKA": { id: "18", name: "ZŠ Dr. Horáka", city: "Prostějov", price: "1700 Kč / pololetí" },
  "ZŠ E. VALENTY": { id: "16", name: "ZŠ E. Valenty", city: "Prostějov", price: "1700 Kč / pololetí" },
  "ZŠ MAJAKOVSKÉHO": { id: "22", name: "ZŠ Majakovského", city: "Prostějov", price: "1700 Kč / pololetí" },
  "ZŠ MELANTRICHOVA": { id: "19", name: "ZŠ Melantrichova", city: "Prostějov", price: "1700 Kč / pololetí" },
  "ZŠ PROTIVANOV": { id: "21", name: "ZŠ Protivanov", city: "Protivanov", price: "1700 Kč / pololetí" }
};

export function parseCsvRows(content: string): RawCustomer[] {
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const results: RawCustomer[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (i === 0 && (line.toLowerCase().includes('email') || line.toLowerCase().includes('rodiče'))) {
      continue;
    }

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
        email: fields[0].trim().toLowerCase(),
        childName: fields[1].trim(),
        childSurname: fields[2].trim(),
        childRodneCislo: fields[3].trim(),
        address: fields[4].trim(),
        phone: fields[5].trim(),
        schoolRaw: fields[6].trim()
      });
    }
  }

  return results;
}

// Generate clean 10-digit Variable Symbol from rodné číslo or fallback
export function sanitizeVariableSymbol(rc: string, seedIndex: number): string {
  const digits = (rc || '').replace(/\D/g, '');
  if (digits.length >= 6 && digits.length <= 10) {
    return digits;
  }
  // If date format e.g. 8.7.2016
  const dateMatch = (rc || '').match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (dateMatch) {
    const day = dateMatch[1].padStart(2, '0');
    const month = dateMatch[2].padStart(2, '0');
    const year = dateMatch[3].slice(-2);
    return `${year}${month}${day}01`;
  }
  // Deterministic fallback
  const num = (2600000000 + seedIndex).toString();
  return num.slice(0, 10);
}

// Clean phone string while preserving multiple contact numbers
export function sanitizePhone(phone: string): string {
  if (!phone) return '';
  // Clean up comma formatting and scientific notation artifacts
  return phone.replace(/,(\d)/g, '$1').replace(/\s+/g, ' ').trim();
}

// Generates a clean readable 8-character password
export function generatePassword(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let res = '';
  for (let i = 0; i < 8; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
}

export async function syncCustomersToDatabase(pool: Pool, csvContent?: string): Promise<{
  totalProcessed: number;
  newInQueue: number;
  existingInQueue: number;
  syncedToRegistrations: number;
}> {
  let content = csvContent;
  if (!content) {
    const csvPath = path.join(process.cwd(), 'import_customers.csv');
    if (fs.existsSync(csvPath)) {
      content = fs.readFileSync(csvPath, 'utf8');
    }
  }

  if (!content) {
    throw new Error('No CSV data available for import.');
  }

  const rawRows = parseCsvRows(content);
  if (rawRows.length === 0) {
    throw new Error('No valid customer records found in CSV.');
  }

  // Pre-load existing registrations to reuse passwords and link existing records
  const [existingRegs] = await pool.query(`
    SELECT id, parentEmail, password, variableSymbol, childName, childSurname, schoolId 
    FROM school_registrations
  `);
  const regMap = new Map<string, any>();
  const emailPasswordMap = new Map<string, string>();

  (existingRegs as any[]).forEach(reg => {
    if (reg.parentEmail && reg.password) {
      emailPasswordMap.set(reg.parentEmail.toLowerCase().trim(), reg.password);
    }
    const key = `${(reg.parentEmail || '').toLowerCase().trim()}_${(reg.childName || '').toLowerCase().trim()}_${(reg.childSurname || '').toLowerCase().trim()}`;
    regMap.set(key, reg);
  });

  // Pre-load current import queue to preserve email status
  const [existingQueue] = await pool.query('SELECT * FROM customer_import_queue');
  const queueMap = new Map<string, any>();
  (existingQueue as any[]).forEach(q => {
    const key = `${q.email.toLowerCase().trim()}_${q.childName.toLowerCase().trim()}_${q.childSurname.toLowerCase().trim()}`;
    queueMap.set(key, q);
  });

  let newInQueue = 0;
  let existingInQueue = 0;
  let syncedToRegistrations = 0;

  for (let idx = 0; idx < rawRows.length; idx++) {
    const row = rawRows[idx];
    const email = row.email.trim().toLowerCase();
    const childName = row.childName.trim();
    const childSurname = row.childSurname.trim();
    const key = `${email}_${childName.toLowerCase()}_${childSurname.toLowerCase()}`;

    // Resolve school
    const normSchool = row.schoolRaw.trim().toUpperCase();
    const schoolInfo = SCHOOL_MAPPING[normSchool] || {
      id: '31',
      name: row.schoolRaw,
      city: 'Olomouc'
    };

    // Password logic: reuse if parent already has an assigned password
    let password = emailPasswordMap.get(email);
    if (!password) {
      password = generatePassword();
      emailPasswordMap.set(email, password);
    }

    // Variable symbol logic
    const vs = sanitizeVariableSymbol(row.childRodneCislo, idx + 1);
    const phone = sanitizePhone(row.phone);
    const batchNumber = Math.floor(idx / 10) + 1;

    // Check if registration exists in school_registrations
    let registrationId: string;
    const existingReg = regMap.get(key);

    if (existingReg) {
      registrationId = existingReg.id;
      // If password in existing registration is different, sync password
      if (!existingReg.password) {
        await pool.query('UPDATE school_registrations SET password = ? WHERE id = ?', [password, registrationId]);
      }
    } else {
      // Create record in school_registrations so parent can log in immediately
      registrationId = `sr_imp_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`;
      const parentName = `Rodič (${childSurname})`;
      const historyJson = JSON.stringify([
        { date: new Date().toISOString(), message: 'Zákazník importován z hromadného exportu' }
      ]);

      await pool.query(`
        INSERT INTO school_registrations (
          id, variableSymbol, schoolId, childName, childSurname,
          childRodneCislo, childBirthDate, childClass, childPhone,
          parentName, parentEmail, parentPhone, parentAddress,
          status, password, afterSchoolClub, history, adminNote, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        registrationId,
        vs,
        schoolInfo.id,
        childName,
        childSurname,
        row.childRodneCislo,
        row.childRodneCislo,
        'Kroužek',
        '',
        parentName,
        email,
        phone,
        row.address,
        'pending_payment',
        password,
        0,
        historyJson,
        'Hromadný import zákazníků'
      ]);

      regMap.set(key, { id: registrationId, password, variableSymbol: vs });
      syncedToRegistrations++;
    }

    // Now upsert into customer_import_queue
    const existingQ = queueMap.get(key);
    if (existingQ) {
      existingInQueue++;
      await pool.query(`
        UPDATE customer_import_queue SET
          registrationId = ?,
          phone = ?,
          address = ?,
          schoolRaw = ?,
          schoolId = ?,
          schoolName = ?,
          variableSymbol = ?,
          password = ?,
          batchNumber = ?
        WHERE id = ?
      `, [
        registrationId,
        phone,
        row.address,
        row.schoolRaw,
        schoolInfo.id,
        schoolInfo.name,
        vs,
        password,
        batchNumber,
        existingQ.id
      ]);
    } else {
      newInQueue++;
      const queueId = `imp_q_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`;
      await pool.query(`
        INSERT INTO customer_import_queue (
          id, registrationId, email, childName, childSurname, childRodneCislo,
          address, phone, schoolRaw, schoolId, schoolName, variableSymbol,
          password, emailStatus, batchNumber, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, NOW())
      `, [
        queueId,
        registrationId,
        email,
        childName,
        childSurname,
        row.childRodneCislo,
        row.address,
        phone,
        row.schoolRaw,
        schoolInfo.id,
        schoolInfo.name,
        vs,
        password,
        batchNumber
      ]);
    }
  }

  return {
    totalProcessed: rawRows.length,
    newInQueue,
    existingInQueue,
    syncedToRegistrations
  };
}

export function generateCustomerEmailHtml(item: QueueItem, school?: any, hostBaseUrl?: string): { subject: string; html: string } {
  const safeHost = hostBaseUrl ? hostBaseUrl.replace(/\/$/, '') : 'https://olympdance.cz';
  const portalUrl = `${safeHost}/skoly-portal`;
  const schoolName = school?.name ? `${school.name} (${school.city})` : (item.schoolName || item.schoolRaw);
  const schoolPrice = school?.price || '1700 Kč / pololetí';
  const numericPrice = parseInt(schoolPrice.replace(/\D/g, ''), 10) || 1700;
  
  const cleanMsg = `${item.childSurname} ${item.childName}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9\s]/g, '').slice(0, 50);
  const safeVs = (item.variableSymbol || '').replace(/\D/g, '').slice(0, 10) || '2026';
  const spayd = `SPD*1.0*ACC:CZ0855000000001806875329*AM:${numericPrice.toFixed(2)}*CC:CZK*X-VS:${safeVs}*MSG:${cleanMsg}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=10&data=${encodeURIComponent(spayd)}`;

  const subject = `Přihláška do tanečního kroužku a přihlašovací údaje - ${item.childName} ${item.childSurname} (Olymp Dance)`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
      <div style="background-color: #002B49; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 0.5px;">Olymp Dance Olomouc</h1>
        <p style="color: #93c5fd; margin: 6px 0 0 0; font-size: 15px;">Potvrzení přihlášky a přístupové údaje do Školního portálu</p>
      </div>
      <div style="background-color: #ffffff; padding: 32px 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; margin-top: 0;">Vážený rodiči,</p>
        <p>zasíláme Vám potvrzení přihlášky dítěte <strong>${item.childName} ${item.childSurname}</strong> do tanečního kroužku v tanečním klubu <strong>Olymp Dance</strong> spolu s Vašimi přihlašovacími údaji do Školního portálu a platebními instrukcemi.</p>
        
        <!-- Informace o kroužku a škole -->
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #002B49; font-size: 16px;">📍 Informace o kroužku</h3>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Škola / Místo:</strong> ${schoolName}</p>
          ${school?.day ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Den tréninků:</strong> ${school.day}</p>` : ''}
          ${school?.time ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Čas tréninků:</strong> ${school.time}</p>` : ''}
          <p style="margin: 4px 0; font-size: 14px;"><strong>Pololetní kurzovné:</strong> <span style="color: #E30613; font-weight: bold;">${schoolPrice}</span></p>
        </div>

        <!-- Rekapitulace údajů -->
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #002B49; font-size: 16px;">📋 Údaje přihlášeného žáka</h3>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Jméno a příjmení:</strong> ${item.childName} ${item.childSurname}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Rodné číslo / Datum narození:</strong> ${item.childRodneCislo || 'Neuvedeno'}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Bydliště:</strong> ${item.address || 'Neuvedeno'}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Telefonický kontakt:</strong> ${item.phone || 'Neuvedeno'}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>E-mail rodiče:</strong> ${item.email}</p>
        </div>

        <!-- Přihlašovací údaje do Školního portálu -->
        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 16px;">🔑 Vaše přihlašovací údaje do Školního portálu</h3>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Přihlašovací e-mail:</strong> ${item.email}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Heslo pro přihlášení:</strong> <span style="font-family: monospace; background: #ffffff; padding: 4px 10px; border-radius: 6px; font-weight: bold; border: 1px solid #93c5fd; color: #1e40af; font-size: 16px;">${item.password}</span></p>
          
          <div style="margin: 16px 0 8px 0; text-align: center;">
            <a href="${portalUrl}" style="background-color: #002B49; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
              Vstoupit do Školního portálu &rarr;
            </a>
          </div>

          <p style="margin: 10px 0 0 0; font-size: 12px; color: #475569; line-height: 1.5;">
            Ve Školním portálu můžete:
            <br />• Sledovat docházku dítěte na všech 14 tanečních lekcích
            <br />• Omlouvat absenci z lekcí jedním kliknutím
            <br />• Po úhradě si stáhnout oficiální potvrzení pro zdravotní pojišťovnu (příspěvek na sport až 1 500 Kč)
          </p>
        </div>

        <!-- Platební údaje -->
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #002B49; font-size: 16px;">💳 Platební údaje pro úhradu kurzovného</h3>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Banka:</strong> Raiffeisenbank a.s.</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Číslo účtu:</strong> 1806875329 / 5500</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>IBAN:</strong> CZ0855000000001806875329</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Částka:</strong> <span style="color: #E30613; font-weight: bold; font-size: 15px;">${schoolPrice}</span></p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Variabilní symbol:</strong> <span style="font-weight: bold; color: #002B49; font-size: 15px;">${item.variableSymbol}</span></p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Zpráva pro příjemce:</strong> ${item.childSurname} ${item.childName} - ${schoolName}</p>
        </div>

        <!-- QR Platba -->
        <div style="text-align: center; margin: 20px 0; padding: 16px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
          <p style="font-weight: bold; margin: 0 0 10px 0; color: #002B49; font-size: 15px;">📲 Rychlá platba mobilem (QR kód):</p>
          <img src="${qrUrl}" alt="QR platba" width="220" height="220" style="display: block; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 8px;" />
          <p style="font-size: 12px; color: #64748b; margin: 8px 0 0 0;">Naskenujte v mobilní aplikaci své banky (Raiffeisenbank, ČSOB, Česká spořitelna, Komerční banka, AirBank, Moneta atd.)</p>
        </div>

        <p>Těšíme se na naše společné taneční hodiny!</p>
        <p style="margin-bottom: 0;">S pozdravem,<br /><strong>Tým Olymp Dance</strong></p>
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
          Taneční klub Olymp Olomouc • E-mail: info@olympdance.cz • Tel: +420 722 017 700 • Web: www.olympdance.cz
        </p>
      </div>
    </div>
  `;

  return { subject, html };
}

export async function getImportQueueStats(pool: Pool) {
  const [totalRows] = await pool.query(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN emailStatus = 'sent' THEN 1 ELSE 0 END) as sent,
      SUM(CASE WHEN emailStatus = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN emailStatus = 'failed' THEN 1 ELSE 0 END) as failed,
      SUM(CASE WHEN emailStatus = 'sending' THEN 1 ELSE 0 END) as sending,
      MAX(batchNumber) as totalBatches
    FROM customer_import_queue
  `);

  const [batchRows] = await pool.query(`
    SELECT 
      batchNumber,
      COUNT(*) as total,
      SUM(CASE WHEN emailStatus = 'sent' THEN 1 ELSE 0 END) as sent,
      SUM(CASE WHEN emailStatus = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN emailStatus = 'failed' THEN 1 ELSE 0 END) as failed
    FROM customer_import_queue
    GROUP BY batchNumber
    ORDER BY batchNumber ASC
  `);

  const stat = (totalRows as any[])[0] || {};
  return {
    total: Number(stat.total || 0),
    sent: Number(stat.sent || 0),
    pending: Number(stat.pending || 0),
    failed: Number(stat.failed || 0),
    sending: Number(stat.sending || 0),
    totalBatches: Number(stat.totalBatches || 0),
    batches: (batchRows as any[]).map(b => ({
      batchNumber: Number(b.batchNumber),
      total: Number(b.total || 0),
      sent: Number(b.sent || 0),
      pending: Number(b.pending || 0),
      failed: Number(b.failed || 0)
    }))
  };
}

