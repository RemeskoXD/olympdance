import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
 * e.g. 1550 -> "jeden tisíc pět set padesát korun českých"
 *      1700 -> "jeden tisíc sedm set korun českých"
 */
export function numberToCzechWords(n: number): string {
  const units = ['', 'jeden', 'dva', 'tři', 'čtyři', 'pět', 'šest', 'sedm', 'osm', 'devět'];
  const teens = ['deset', 'jedenáct', 'dvanáct', 'třináct', 'čtrnáct', 'patnáct', 'šestnáct', 'sedmnáct', 'osmnáct', 'devatenáct'];
  const tens = ['', 'deset', 'dvacet', 'třicet', 'čtyřicet', 'padesát', 'šedesát', 'sedmdesát', 'osmdesát', 'devadesát'];
  const hundreds = ['', 'sto', 'dvě stě', 'tři sta', 'čtyři sta', 'pět set', 'šest set', 'sedm set', 'osm set', 'devět set'];

  if (n === 0) return 'nula korun českých';
  let num = Math.floor(Math.abs(n));
  const parts: string[] = [];

  if (num >= 1000) {
    const thousands = Math.floor(num / 1000);
    num %= 1000;
    if (thousands === 1) {
      parts.push('jeden tisíc');
    } else if (thousands === 2) {
      parts.push('dva tisíce');
    } else if (thousands >= 3 && thousands <= 4) {
      parts.push(`${units[thousands]} tisíce`);
    } else if (thousands >= 5 && thousands <= 19) {
      parts.push(thousands < 10 ? `${units[thousands]} tisíc` : `${teens[thousands - 10]} tisíc`);
    } else {
      parts.push(`${thousands} tisíc`);
    }
  }

  if (num >= 100) {
    const h = Math.floor(num / 100);
    num %= 100;
    parts.push(hundreds[h]);
  }

  if (num >= 10 && num <= 19) {
    parts.push(teens[num - 10]);
    num = 0;
  } else if (num >= 20) {
    const t = Math.floor(num / 10);
    num %= 10;
    parts.push(tens[t]);
  }

  if (num > 0 && num < 10) {
    parts.push(units[num]);
  }

  return parts.filter(Boolean).join(' ') + ' korun českých';
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

      // Multi-path font loader to ensure TrueType Czech UTF-8 font is ALWAYS loaded on any server
      const findFont = (filename: string) => {
        const candidates = [
          path.join(process.cwd(), 'fonts', filename),
          path.join(process.cwd(), 'public', 'fonts', filename),
          path.join(process.cwd(), 'dist', 'fonts', filename),
          path.join(__dirname, 'fonts', filename),
          path.join(__dirname, '..', 'fonts', filename),
          `/usr/share/fonts/truetype/liberation/${filename}`,
          `/usr/share/fonts/liberation/${filename}`
        ];
        for (const c of candidates) {
          try {
            if (fs.existsSync(c)) return c;
          } catch {}
        }
        return null;
      };

      const regularFontPath = findFont('LiberationSans-Regular.ttf');
      const boldFontPath = findFont('LiberationSans-Bold.ttf');

      let fontReg = 'Helvetica';
      let fontBld = 'Helvetica-Bold';

      if (regularFontPath && boldFontPath) {
        try {
          doc.registerFont('LiberationSans', regularFontPath);
          doc.registerFont('LiberationSans-Bold', boldFontPath);
          fontReg = 'LiberationSans';
          fontBld = 'LiberationSans-Bold';
        } catch (fontErr) {
          console.error('Failed to register LiberationSans font:', fontErr);
        }
      }

      // 1. PURE WHITE BACKGROUND FOR THE PAGE
      doc.rect(0, 0, 595.28, 841.89).fill('#ffffff');

      // 2. RED HEADER BANNER (Exact match to original TK Olymp document)
      const bannerHeight = 104;
      const olympRed = '#b91c24'; // Rich crimson/red of TK Olymp
      doc.rect(0, 0, 595.28, bannerHeight).fill(olympRed);

      // Header text (White on red banner)
      const headerTextX = 42;
      const headerTextY = 22;

      doc.fillColor('#ffffff')
         .font(fontBld).fontSize(10.5)
         .text('Taneční klub Olymp Olomouc, z. s.', headerTextX, headerTextY);

      doc.fillColor('#ffffff')
         .font(fontReg).fontSize(8.2)
         .text('Jiráskova 25, Olomouc - Hodolany 779 00', headerTextX, headerTextY + 15)
         .text('IČO: 68347286', headerTextX, headerTextY + 28)
         .text('L 4133 vedený u Krajského soudu v Ostravě', headerTextX, headerTextY + 41)
         .text('zastoupený předsedou Mgr. Miroslavem Hýžou', headerTextX, headerTextY + 54);

      // Logo in top right of red header banner (using loloo.png)
      const logoPaths = [
        path.join(process.cwd(), 'public', 'loloo.png'),
        path.join(process.cwd(), 'dist', 'loloo.png'),
        path.join(process.cwd(), 'public', 'tk-olymp-logo-black.png'),
        path.join(process.cwd(), 'dist', 'tk-olymp-logo-black.png'),
        path.join(process.cwd(), 'public', 'logo.png')
      ];
      const selectedLogo = logoPaths.find(p => fs.existsSync(p));
      if (selectedLogo) {
        try {
          doc.image(selectedLogo, 455, 12, { width: 66, height: 80 });
        } catch {}
      }

      // 3. DOCUMENT TITLE
      doc.fillColor('#111827').font(fontBld).fontSize(19)
         .text('Potvrzení o přijetí platby', 45, 160, { width: 505, align: 'center' });

      // 4. MAIN CONTENT
      const textX = 55;
      const textW = 485;

      doc.font(fontReg).fontSize(11).fillColor('#111827')
         .text('Tímto potvrzuji,', textX, 218);

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

      doc.text(mainStatement, textX, 252, { width: textW, lineGap: 4, align: 'left' });

      // Numeric and spelled amount
      const numericAmount = typeof data.amount === 'number' ? data.amount : (parseFloat(String(data.amount).replace(/\s+/g, '')) || 1700);
      const formattedAmount = numericAmount.toLocaleString('cs-CZ');
      const amountWords = numberToCzechWords(numericAmount);

      doc.font(fontBld).text('Částka: ', textX, 328, { continued: true })
         .font(fontReg).text(`Kč ${formattedAmount},- (slovy: ${amountWords})`);

      doc.font(fontReg).text('Účet příjemce: 1806875329/5500 Tanečnímu klubu Olymp Olomouc, z.s.', textX, 356);

      // Period text
      let periodStr = data.period;
      if (!periodStr) {
        const pDate = data.paymentDate ? new Date(data.paymentDate) : new Date();
        const year = !isNaN(pDate.getTime()) ? pDate.getFullYear() : new Date().getFullYear();
        periodStr = `únor ${year} – květen ${year}`;
      }
      doc.text(`za období : ${periodStr}.`, textX, 384);

      // Issue date and location
      const issueDateStr = formatCzechDate(data.issueDate || data.paymentDate || new Date());
      doc.text(`V Olomouci dne ${issueDateStr}`, textX, 440);

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

      // Signatory representative name below stamp
      doc.fillColor('#111827').font(fontBld).fontSize(10)
         .text('Martin Matýsek', stampX, stampY + 104, { width: 195, align: 'center' });

      doc.fillColor('#374151').font(fontReg).fontSize(8.5)
         .text('Taneční klub Olymp Olomouc, z. s.', stampX, stampY + 118, { width: 195, align: 'center' });

      // Finalize document stream
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
