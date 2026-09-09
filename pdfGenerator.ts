import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export interface SchoolPaymentPdfData {
  activityType?: 'krouzek' | 'tabor';
  activityName?: string | null;
  paymentDate?: string | Date | null;
  senderAccount?: string | null;
  parentName?: string | null;
  childName: string;
  childSurname?: string | null;
  childBirthDate?: string | null;
  childRodneCislo?: string | null;
  amount: number | string;
  period?: string | null;
  issueDate?: string | Date | null;
}

/**
 * Converts integer amount to Czech words representation (financial format)
 * e.g. 1700 -> "jedentisícsedmset"
 */
export function numberToCzechWords(n: number): string {
  const units = ['', 'jedna', 'dva', 'tři', 'čtyři', 'pět', 'šest', 'sedm', 'osm', 'devět'];
  const teens = ['deset', 'jedenáct', 'dvanáct', 'třináct', 'čtrnáct', 'patnáct', 'šestnáct', 'sedmnáct', 'osmnáct', 'devatenáct'];
  const tens = ['', 'deset', 'dvacet', 'třicet', 'čtyřicet', 'padesát', 'šedesát', 'sedmdesát', 'osmdesát', 'devadesát'];
  const hundreds = ['', 'sto', 'dvěstě', 'třista', 'čtyřista', 'pětset', 'šestset', 'sedmset', 'osmset', 'devětset'];

  if (n === 0) return 'nula';
  let num = Math.floor(Math.abs(n));
  let words = '';

  if (num >= 100000) {
    const hundredThousands = Math.floor(num / 100000);
    words += hundreds[hundredThousands];
    num %= 100000;
  }

  if (num >= 1000) {
    const thousands = Math.floor(num / 1000);
    num %= 1000;
    if (thousands === 1) {
      words += 'jedentisíc';
    } else if (thousands === 2) {
      words += 'dvatisíce';
    } else if (thousands >= 3 && thousands <= 4) {
      words += units[thousands] + 'tisíce';
    } else if (thousands >= 10 && thousands <= 19) {
      words += teens[thousands - 10] + 'tisíc';
    } else if (thousands >= 20) {
      const t = Math.floor(thousands / 10);
      const u = thousands % 10;
      words += tens[t];
      if (u === 1 || u === 2 || u === 3 || u === 4) {
        words += units[u] + (u === 1 ? 'jedentisíc' : 'tisíce');
      } else {
        words += (u > 0 ? units[u] : '') + 'tisíc';
      }
    } else {
      words += units[thousands] + 'tisíc';
    }
  }

  if (num >= 100) {
    const h = Math.floor(num / 100);
    num %= 100;
    words += hundreds[h];
  }

  if (num >= 10 && num <= 19) {
    words += teens[num - 10];
    num = 0;
  } else if (num >= 20) {
    const t = Math.floor(num / 10);
    num %= 10;
    words += tens[t];
  }

  if (num > 0 && num < 10) {
    words += units[num];
  }

  return words;
}

/**
 * Format a Date or date string to Czech format "D. M. YYYY"
 */
export function formatCzechDate(dateInput?: string | Date | null): string {
  if (!dateInput) {
    const now = new Date();
    return `${now.getDate()}. ${now.getMonth() + 1}. ${now.getFullYear()}`;
  }
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    return String(dateInput);
  }
  return `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`;
}

/**
 * Format rodné číslo with slash if missing
 */
export function formatRodneCislo(rc?: string | null): string {
  if (!rc) return '';
  const clean = rc.replace(/\s+/g, '').replace(/\//g, '');
  if (clean.length === 9 || clean.length === 10) {
    return `${clean.slice(0, 6)}/${clean.slice(6)}`;
  }
  return rc;
}

/**
 * Detects whether dancer is female or male for Czech grammar:
 * "za tanečnici" vs "za tanečníka"
 */
export function getDancerRole(childName: string, childSurname?: string | null): { role: string; fullName: string } {
  const parts = [childName, childSurname].filter(Boolean).map(s => (s as string).trim());
  const fullName = parts.join(' ').replace(/\s+/g, ' ').trim();
  const lastWord = (childSurname || parts[parts.length - 1] || '').trim().toLowerCase();
  const firstWord = (parts[0] || '').trim().toLowerCase();

  // Female surname check in Czech: ends in -ová, -á, -ná, -ská, or first name ends in -a, -ie, -e
  const isFemale = 
    lastWord.endsWith('ová') || 
    lastWord.endsWith('á') || 
    lastWord.endsWith('ska') ||
    firstWord.endsWith('a') || 
    firstWord.endsWith('ie') || 
    firstWord.endsWith('e');

  return {
    role: isFemale ? 'tanečnici' : 'tanečníka',
    fullName
  };
}

/**
 * Generates an official 1:1 Payment Confirmation PDF (Potvrzení o přijetí platby)
 * matching TK Olymp Olomouc standard layout.
 */
export function generateSchoolPaymentPdf(data: SchoolPaymentPdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 0,
        info: {
          Title: 'Potvrzení o přijetí platby - Olymp Dance',
          Author: 'Taneční klub Olymp Olomouc, z. s.',
          Subject: 'Potvrzení o úhradě členského příspěvku a účastnického poplatku',
          Creator: 'Olymp Dance System'
        }
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });
      doc.on('error', (err) => {
        reject(err);
      });

      // Font setup with Liberation Sans (installed system font with full Czech UTF-8 diacritics)
      const libSansRegular = '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf';
      const libSansBold = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf';

      const hasRegularFont = fs.existsSync(libSansRegular);
      const hasBoldFont = fs.existsSync(libSansBold);

      const fontReg = hasRegularFont ? libSansRegular : 'Helvetica';
      const fontBld = hasBoldFont ? libSansBold : 'Helvetica-Bold';

      // 1. PURE WHITE BACKGROUND FOR THE ENTIRE PDF
      doc.rect(0, 0, 595.28, 841.89).fill('#ffffff');

      // Top Header (Dark text on pure white background)
      const headerTopY = 32;
      doc.fillColor('#111827')
         .font(fontBld).fontSize(10.5)
         .text('Taneční klub Olymp Olomouc, z. s.', 46, headerTopY);

      doc.fillColor('#374151')
         .font(fontReg).fontSize(8.5)
         .text('Jiráskova 25, Olomouc - Hodolany 779 00', 46, headerTopY + 14)
         .text('IČO: 68347286', 46, headerTopY + 26)
         .text('L 4133 vedený u Krajského soudu v Ostravě', 46, headerTopY + 38)
         .text('zastoupený předsedou Martinem Matýskem', 46, headerTopY + 50);

      // Club logo in top right header
      const logoPath = path.join(process.cwd(), 'public', 'logo.png');
      if (fs.existsSync(logoPath)) {
        try {
          doc.image(logoPath, 475, headerTopY - 4, { width: 68 });
        } catch {}
      }

      // Subtle divider under header
      doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(46, headerTopY + 72).lineTo(545, headerTopY + 72).stroke();

      // 2. DOCUMENT TITLE
      doc.fillColor('#111827').font(fontBld).fontSize(19)
         .text('Potvrzení o přijetí platby', 45, 145, { width: 505, align: 'center' });

      // 3. MAIN CONTENT
      const textX = 55;
      const textW = 485;

      doc.font(fontReg).fontSize(11).fillColor('#111827')
         .text('Tímto potvrzuji,', textX, 205);

      // Data formatting
      const paymentDateStr = formatCzechDate(data.paymentDate || new Date());
      const senderAccountStr = (data.senderAccount || '').trim() || 'bankovního účtu plátce';
      const parentNameStr = (data.parentName || '').trim() || 'zákonného zástupce';
      const { role, fullName: childFullName } = getDancerRole(data.childName, data.childSurname);

      // Rodné číslo / Datum narození
      let rcLabel = '';
      if (data.childRodneCislo) {
        rcLabel = `(r.č. ${formatRodneCislo(data.childRodneCislo)})`;
      } else if (data.childBirthDate) {
        rcLabel = `(r.č. ${formatCzechDate(data.childBirthDate)})`;
      } else {
        rcLabel = '';
      }

      // Main statement paragraph
      const activityLabel = data.activityType === 'tabor'
        ? `uhrazen účastnický poplatek na letní tábor (${data.activityName || 'Letní taneční tábor'}):`
        : (data.activityName ? `uhrazen členský příspěvek a účastnický poplatek do tanečního kroužku (${data.activityName}):` : `uhrazen členský příspěvek a účastnický poplatek do tanečního kroužku:`);

      const mainStatement = `Že dne ${paymentDateStr} byl z bankovního účtu č. ${senderAccountStr} vedeného na ${parentNameStr} za ${role} ${childFullName} ${rcLabel}`.trim() + 
        ` ${activityLabel}`;

      doc.text(mainStatement, textX, 245, { width: textW, lineGap: 4, align: 'left' });

      // Numeric and spelled amount
      const numericAmount = typeof data.amount === 'number' ? data.amount : (parseFloat(String(data.amount).replace(/\s+/g, '')) || 1700);
      const formattedAmount = numericAmount.toLocaleString('cs-CZ');
      const amountWords = numberToCzechWords(numericAmount);

      doc.text(`Částka: Kč ${formattedAmount},- (slovy: ${amountWords})`, textX, 315);
      doc.text('Účet příjemce: 1806875329/5500 Tanečnímu klubu Olymp Olomouc, z.s.', textX, 345);

      // Period text
      let periodStr = data.period;
      if (!periodStr) {
        const pDate = data.paymentDate ? new Date(data.paymentDate) : new Date();
        const year = !isNaN(pDate.getTime()) ? pDate.getFullYear() : new Date().getFullYear();
        // As in template: "období které platí vždy únor (aktuální rok) - květen (aktuální rok)."
        periodStr = `únor ${year} – květen ${year}`;
      }
      doc.text(`za období : ${periodStr}.`, textX, 375);

      // Issue date and location
      const issueDateStr = formatCzechDate(data.issueDate || data.paymentDate || new Date());
      doc.text(`V Přerově dne ${issueDateStr}`, textX, 430);

      // 5. OFFICIAL CLUB STAMP & SIGNATURE BLOCK (Right aligned)
      const stampX = 335;
      const stampY = 460;
      const stampImagePath = path.join(process.cwd(), 'public', 'stamp-signature.png');

      if (fs.existsSync(stampImagePath)) {
        doc.image(stampImagePath, stampX, stampY, { width: 195 });
      } else {
        // Fallback stamp border
        doc.roundedRect(stampX, stampY, 175, 65, 3).strokeColor('#002B49').lineWidth(1.2).stroke();
        doc.fillColor('#002B49').font(fontBld).fontSize(7.5)
           .text('TANEČNÍ KLUB OLYMP OLOMOUC', stampX + 6, stampY + 6, { width: 160 });
        doc.font(fontReg).fontSize(6.5)
           .text('Jiráskova 25, 779 00 Olomouc', stampX + 6, stampY + 18)
           .text('IČ: 683 47 286', stampX + 6, stampY + 28)
           .text('č.ú.: 1806875329 / 0800', stampX + 6, stampY + 38);
        doc.fontSize(5.5)
           .text('www.tkolymp.cz   tkolymp@tkolymp.cz', stampX + 6, stampY + 48);
      }

      // Signatory representative name & position below stamp
      doc.fillColor('#111827').font(fontBld).fontSize(10)
         .text('Martin Matýsek', stampX, stampY + 106, { width: 195, align: 'center' });

      doc.fillColor('#4b5563').font(fontReg).fontSize(8.5)
         .text('Předseda / Statutární zástupce TK Olymp Olomouc, z. s.', stampX, stampY + 119, { width: 195, align: 'center' });

      // Finalize document stream
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
