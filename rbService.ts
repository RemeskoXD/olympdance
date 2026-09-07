import https from 'https';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import crypto from 'crypto';
import pool from './db.ts';
import { generateSchoolPaymentPdf } from './pdfGenerator.ts';

export type SendEmailFn = (
  to: string,
  subject: string,
  html: string,
  attachments?: Array<{ filename: string; content: any; contentType?: string }>
) => Promise<any>;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface RbConfig {
  clientId: string;
  clientSecret?: string;
  accountNumber: string;
  certPassword: string;
  certFilename?: string;
  hasCert: boolean;
  certSource?: 'file' | 'env' | 'none';
}

const CERTS_DIR = path.join(__dirname, 'certs');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
fs.ensureDirSync(CERTS_DIR);
fs.ensureDirSync(UPLOADS_DIR);

export const getRbConfig = async (): Promise<RbConfig> => {
  let dbSettings: any = null;
  try {
    const [rows] = await pool.query('SELECT * FROM settings WHERE id = 1');
    if ((rows as any[]).length > 0) {
      dbSettings = (rows as any[])[0];
    }
  } catch (err) {
    // Database may be initializing
  }

  const clientId = dbSettings?.rbClientId || process.env.RB_CLIENT_ID || '';
  const clientSecret = dbSettings?.rbClientSecret || process.env.RB_CLIENT_SECRET || '';
  const accountNumber = dbSettings?.rbAccountNumber || process.env.RB_ACCOUNT_NUMBER || '1806875329';
  const certPassword = dbSettings?.rbCertPassword || process.env.RB_CERT_PASSWORD || '';
  const certFilename = dbSettings?.rbCertFilename || '';

  // Determine certificate presence (prefer actual uploaded file, then env)
  let hasCert = false;
  let certSource: 'file' | 'env' | 'none' = 'none';

  if (certFilename && fs.existsSync(path.join(UPLOADS_DIR, certFilename)) && fs.statSync(path.join(UPLOADS_DIR, certFilename)).size > 100) {
    hasCert = true;
    certSource = 'file';
  } else if (fs.existsSync(path.join(UPLOADS_DIR, 'rb_cert.p12')) && fs.statSync(path.join(UPLOADS_DIR, 'rb_cert.p12')).size > 100) {
    hasCert = true;
    certSource = 'file';
  } else if (fs.existsSync(path.join(CERTS_DIR, 'rb_cert.p12')) && fs.statSync(path.join(CERTS_DIR, 'rb_cert.p12')).size > 100) {
    hasCert = true;
    certSource = 'file';
  } else if (process.env.RB_CERT_BASE64 && process.env.RB_CERT_BASE64.trim().length > 100) {
    hasCert = true;
    certSource = 'env';
  }

  return {
    clientId,
    clientSecret,
    accountNumber: accountNumber.replace(/\D/g, ''),
    certPassword,
    certFilename,
    hasCert,
    certSource
  };
};

export const getRbCertBuffer = async (): Promise<Buffer | null> => {
  // 1. Check file uploaded in settings (DB)
  try {
    const [rows] = await pool.query('SELECT rbCertFilename FROM settings WHERE id = 1');
    const filename = (rows as any[])[0]?.rbCertFilename;
    if (filename) {
      const p = path.join(UPLOADS_DIR, filename);
      if (fs.existsSync(p)) {
        const buf = fs.readFileSync(p);
        if (buf.length > 100) return buf;
      }
    }
  } catch (e) {}

  // 2. Check standard file paths
  const possiblePaths = [
    path.join(UPLOADS_DIR, 'rb_cert.p12'),
    path.join(CERTS_DIR, 'rb_cert.p12'),
    process.env.RB_CERT_PATH
  ].filter(Boolean) as string[];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      const buf = fs.readFileSync(p);
      if (buf.length > 100) return buf;
    }
  }

  // 3. Fallback to base64 in environment if valid (> 100 chars)
  if (process.env.RB_CERT_BASE64 && process.env.RB_CERT_BASE64.trim().length > 100) {
    try {
      const buf = Buffer.from(process.env.RB_CERT_BASE64.replace(/\s+/g, ''), 'base64');
      if (buf.length > 100) return buf;
    } catch (e) {
      console.error('[RB API] Failed to parse RB_CERT_BASE64:', e);
    }
  }

  return null;
};

// Create TLS agent: attempts OpenSSL extraction to PEM first (prevents Node.js "not enough data" PFX issues)
export function createRbAgent(certBuffer: Buffer, passphrase?: string): https.Agent {
  try {
    const tempCertPath = path.join('/tmp', `rb_cert_${Date.now()}_${Math.random().toString(36).substring(7)}.p12`);
    fs.writeFileSync(tempCertPath, certBuffer);
    try {
      const env = { ...process.env, OPENSSL_PASS: passphrase || '' };
      const certPem = execSync(`openssl pkcs12 -in "${tempCertPath}" -clcerts -nokeys -passin env:OPENSSL_PASS`, {
        env,
        stdio: ['pipe', 'pipe', 'pipe']
      }).toString();
      const keyPem = execSync(`openssl pkcs12 -in "${tempCertPath}" -nocerts -nodes -passin env:OPENSSL_PASS`, {
        env,
        stdio: ['pipe', 'pipe', 'pipe']
      }).toString();
      
      if (certPem && keyPem) {
        return new https.Agent({
          cert: certPem,
          key: keyPem,
          rejectUnauthorized: false,
          keepAlive: false
        });
      }
    } finally {
      try { fs.unlinkSync(tempCertPath); } catch (e) {}
    }
  } catch (err: any) {
    console.warn('[RB API] OpenSSL extraction warning:', err.message);
  }

  // Fallback to direct PFX
  return new https.Agent({
    pfx: certBuffer,
    passphrase: passphrase || '',
    rejectUnauthorized: false,
    keepAlive: false
  });
}

// Low-level mTLS request helper to api.rb.cz
const makeRbRequest = async (
  apiPath: string,
  config: RbConfig,
  certBuffer: Buffer
): Promise<{ status: number; data: any; raw: string }> => {
  return new Promise((resolve, reject) => {
    let agent: https.Agent;
    try {
      agent = createRbAgent(certBuffer, config.certPassword);
    } catch (err: any) {
      return reject(new Error(`Chyba při přípravě certifikátu (ověřte heslo): ${err.message}`));
    }

    const requestId = crypto.randomUUID ? crypto.randomUUID() : `req-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const headers: Record<string, string> = {
      'X-IBM-Client-Id': config.clientId,
      'X-Request-Id': requestId,
      'Accept': 'application/json',
      'User-Agent': 'OlympDance-System/1.0'
    };

    if (config.clientSecret) {
      headers['X-IBM-Client-Secret'] = config.clientSecret;
    }

    const options: https.RequestOptions = {
      hostname: 'api.rb.cz',
      port: 443,
      path: apiPath,
      method: 'GET',
      headers,
      agent
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        let parsed: any = null;
        try {
          parsed = JSON.parse(body);
        } catch (e) {
          parsed = null;
        }

        resolve({
          status: res.statusCode || 0,
          data: parsed,
          raw: body
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Časový limit požadavku na Raiffeisenbank API vypršel (15s).'));
    });

    req.end();
  });
};

// Test connection to Raiffeisenbank API
export const testRbConnection = async () => {
  const config = await getRbConfig();

  if (!config.clientId) {
    return {
      success: false,
      message: 'Chybí Client ID. Zadejte Client ID z developers.rb.cz v nastavení.'
    };
  }

  if (!config.hasCert) {
    return {
      success: false,
      message: 'Chybí klientský certifikát (.p12). Nahrajte soubor certifikátu v nastavení.'
    };
  }

  if (!config.certPassword) {
    return {
      success: false,
      message: 'Chybí heslo k certifikátu (.p12). Zadejte heslo v nastavení.'
    };
  }

  const certBuffer = await getRbCertBuffer();
  if (!certBuffer) {
    return {
      success: false,
      message: 'Certifikát se nepodařilo načíst ze souboru ani z proměnné prostředí.'
    };
  }

  const today = new Date();
  const toDate = today.toISOString().split('T')[0];
  const fromDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Try standard Premium API transaction endpoint
  const accountNum = config.accountNumber;
  const path1 = `/rbcz/premium/api/accounts/${accountNum}/CZK/transactions?from=${fromDate}&to=${toDate}`;
  const path2 = `/x-premium/v1/accounts/${accountNum}/CZK/transactions?from=${fromDate}&to=${toDate}`;

  try {
    let result = await makeRbRequest(path1, config, certBuffer);

    // If 404 on path1, try path2
    if (result.status === 404) {
      result = await makeRbRequest(path2, config, certBuffer);
    }

    if (result.status >= 200 && result.status < 300) {
      const transactions = result.data?.transactions || result.data?.entry || (Array.isArray(result.data) ? result.data : []);
      return {
        success: true,
        message: `Spojení s Raiffeisenbank API proběhlo úspěšně! Účet ${accountNum} byl ověřen a historie plateb je přístupná.`,
        transactionCount: transactions.length,
        data: transactions.slice(0, 3)
      };
    } else if (result.status === 401 || result.status === 403) {
      const rawText = JSON.stringify(result.data || result.raw || '');
      let msg = `Banka odmítla přístup (HTTP ${result.status}).`;
      if (rawText.includes('You cannot consume this service')) {
        msg = `Banka vrátila: "You cannot consume this service". Ověřte prosím na portálu developers.rb.cz v sekci Moje aplikace -> vaše aplikace -> Předplatné (Subscriptions), zda máte aktivován odběr produktu "Premium API" (Default plan). Pokud máte v aplikaci vygenerováno Client Secret (Heslo od API klíče), zadejte jej do pole v nastavení.`;
      } else {
        msg += ` Zkontrolujte Client ID (${config.clientId}), Client Secret a zda má váš certifikát v bankovnictví oprávnění pro účet ${accountNum}.`;
      }
      return {
        success: false,
        message: msg,
        details: result.data || result.raw
      };
    } else {
      return {
        success: false,
        message: `Banka vrátila kód HTTP ${result.status}: ${result.data?.message || result.raw || 'Neznámá chyba'}`,
        details: result.data
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Chyba při komunikaci s Raiffeisenbank: ${err.message}`,
      details: err.stack
    };
  }
};

// Extract Variable Symbol helper
function extractVariableSymbol(tx: any): string {
  // 1. Direct or structured RB Premium API paths
  const premiumVs = tx.entryDetails?.transactionDetails?.remittanceInformation?.creditorReferenceInformation?.variable;
  if (premiumVs && String(premiumVs).trim()) return String(premiumVs).trim();

  const premiumRef = tx.entryDetails?.transactionDetails?.remittanceInformation?.creditorReferenceInformation?.reference;
  if (premiumRef && String(premiumRef).trim()) return String(premiumRef).trim();

  const directCreditorVar = tx.remittanceInformation?.creditorReferenceInformation?.variable;
  if (directCreditorVar && String(directCreditorVar).trim()) return String(directCreditorVar).trim();

  const structRef = tx.remittanceInformation?.structured?.creditorReferenceInformation?.reference;
  if (structRef && String(structRef).trim()) return String(structRef).trim();

  const directCreditorRef = tx.remittanceInformation?.creditorReferenceInformation?.reference;
  if (directCreditorRef && String(directCreditorRef).trim()) return String(directCreditorRef).trim();

  if (tx.variableSymbol && String(tx.variableSymbol).trim()) return String(tx.variableSymbol).trim();
  if (tx.details?.variableSymbol && String(tx.details.variableSymbol).trim()) return String(tx.details.variableSymbol).trim();

  const vsRemit = tx.remittanceInformation?.variableSymbol;
  if (vsRemit && String(vsRemit).trim()) return String(vsRemit).trim();

  // 2. Unstructured, originator message or message regex
  const textToSearch = [
    tx.entryDetails?.transactionDetails?.remittanceInformation?.originatorMessage,
    tx.entryDetails?.transactionDetails?.remittanceInformation?.unstructured,
    tx.remittanceInformation?.unstructured,
    tx.message,
    tx.details?.message,
    tx.additionalInformation
  ].filter(Boolean).join(' ');

  if (textToSearch) {
    // Match "VS: 123456" or "VS123456" or variable symbol pattern
    const vsMatch = textToSearch.match(/(?:VS|vs|v\.s\.|variabilní symbol)[:\s]*(\d{4,10})/i);
    if (vsMatch && vsMatch[1]) return vsMatch[1];

    // Or a merch VS (starts with 80) or camp VS (starts with 26) or 6-10 digit number
    const standaloneMatch = textToSearch.match(/\b(80\d{6}|26\d{6}|20\d{4,8}|\d{6,10})\b/);
    if (standaloneMatch && standaloneMatch[1]) return standaloneMatch[1];
  }

  return '';
}

// Synchronize transactions and match payments
export const syncRbPayments = async (
  sendEmailFn?: SendEmailFn
) => {
  const config = await getRbConfig();
  if (!config.clientId || !config.hasCert || !config.certPassword) {
    return {
      success: false,
      message: 'Raiffeisenbank API není plně nakonfigurováno (chybí Client ID, certifikát nebo heslo).'
    };
  }

  const certBuffer = await getRbCertBuffer();
  if (!certBuffer) {
    return {
      success: false,
      message: 'Klientský certifikát nelze načíst.'
    };
  }

  const today = new Date();
  const toDate = today.toISOString().split('T')[0];
  // Check last 30 days
  const fromDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const accountNum = config.accountNumber;
  const path1 = `/rbcz/premium/api/accounts/${accountNum}/CZK/transactions?from=${fromDate}&to=${toDate}`;
  const path2 = `/x-premium/v1/accounts/${accountNum}/CZK/transactions?from=${fromDate}&to=${toDate}`;

  let result: any;
  try {
    result = await makeRbRequest(path1, config, certBuffer);
    if (result.status === 404) {
      result = await makeRbRequest(path2, config, certBuffer);
    }
  } catch (err: any) {
    console.error('[RB API Sync Error]:', err.message);
    await pool.query('UPDATE settings SET rbLastSync = NOW(), rbSyncStatus = ? WHERE id = 1', [`Chyba: ${err.message}`]);
    return {
      success: false,
      message: `Chyba spojení: ${err.message}`
    };
  }

  if (result.status < 200 || result.status >= 300) {
    const msg = `Banka vrátila kód HTTP ${result.status}`;
    await pool.query('UPDATE settings SET rbLastSync = NOW(), rbSyncStatus = ? WHERE id = 1', [msg]);
    return { success: false, message: msg };
  }

  const transactions: any[] = 
    result.data?.transactions || 
    result.data?.entry || 
    (Array.isArray(result.data) ? result.data : []);

  console.log(`[RB API Sync] Stáhnuto ${transactions.length} transakcí z Raiffeisenbank`);

  let newMatched = 0;
  let alreadyMatched = 0;
  let unmatched = 0;

  for (const tx of transactions) {
    // Determine credit vs debit
    const amountVal = typeof tx.amount === 'object' ? parseFloat(tx.amount.value) : parseFloat(tx.amount || 0);
    const indicator = tx.creditDebitIndication || tx.creditDebitIndicator || (amountVal > 0 ? 'CRDT' : 'DBIT');
    if (indicator !== 'CRDT' && amountVal <= 0) {
      continue; // Skip outgoing payments
    }

    const vs = extractVariableSymbol(tx);
    const rawDate = tx.bookingDate || tx.valueDate || toDate;
    const bookingDate = typeof rawDate === 'string' ? rawDate : toDate;
    const currency = (typeof tx.amount === 'object' ? tx.amount.currency : tx.currency) || 'CZK';

    const message = [
      tx.entryDetails?.transactionDetails?.remittanceInformation?.originatorMessage,
      tx.entryDetails?.transactionDetails?.remittanceInformation?.unstructured,
      tx.remittanceInformation?.unstructured,
      tx.message,
      tx.details?.message
    ].filter(Boolean).join(' ').trim();

    const counterParty = tx.entryDetails?.transactionDetails?.relatedParties?.counterParty;
    const senderName = 
      counterParty?.name || 
      tx.debtor?.name || 
      tx.debtorAccount?.name || 
      '';

    const senderAccount = 
      (counterParty?.account?.accountNumber 
        ? `${counterParty.account.accountNumber}/${counterParty.organisationIdentification?.bankCode || ''}` 
        : '') ||
      tx.debtorAccount?.iban || 
      tx.debtorAccount?.accountNumber || 
      '';

    const txId = String(
      tx.entryReference || 
      tx.transactionId || 
      tx.id || 
      `${bookingDate.slice(0, 10)}_${amountVal}_${vs || 'novs'}`
    );

    // Check if already processed and matched in bank_payments_log
    const [logRows] = await pool.query('SELECT id, status, matchedType FROM bank_payments_log WHERE transactionId = ?', [txId]);
    const existingLog = (logRows as any[])[0];
    if (existingLog && existingLog.matchedType !== 'unmatched' && existingLog.status === 'matched') {
      alreadyMatched++;
      continue;
    }

    let matchedType: 'school' | 'camp' | 'merch' | 'unmatched' = 'unmatched';
    let matchedId = '';
    let matchedName = '';

    // ==========================================
    // 1. MATCH MERCH ORDERS (E-shop)
    // ==========================================
    let merchOrder: any = null;
    if (vs) {
      const cleanVs = vs.replace(/^0+/, '') || vs;
      const [merchRows] = await pool.query(
        'SELECT * FROM merch_orders WHERE variableSymbol = ? OR variableSymbol = ? OR TRIM(LEADING "0" FROM variableSymbol) = ? LIMIT 1',
        [vs, cleanVs, cleanVs]
      );
      if ((merchRows as any[]).length > 0) {
        merchOrder = (merchRows as any[])[0];
      }
    }

    if (!merchOrder && message) {
      // Check if message contains merch order variableSymbol
      const [allMerch] = await pool.query('SELECT * FROM merch_orders WHERE status = "pending"');
      for (const m of (allMerch as any[])) {
        if (m.variableSymbol && message.includes(m.variableSymbol)) {
          merchOrder = m;
          break;
        }
      }
    }

    if (merchOrder) {
      matchedType = 'merch';
      matchedId = String(merchOrder.id);
      matchedName = `${merchOrder.userName} - ${merchOrder.productName}`;

      if (merchOrder.status !== 'paid') {
        await pool.query('UPDATE merch_orders SET status = "paid" WHERE id = ?', [merchOrder.id]);
        newMatched++;
        console.log(`[RB Auto-Match] Merch objednávka ${merchOrder.id} (${merchOrder.productName}) označena jako ZAPLACENO (VS: ${vs || merchOrder.variableSymbol})`);

        // Send informative confirmation email to customer
        if (sendEmailFn && merchOrder.userEmail) {
          const buyerHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
              <div style="background-color: #002B49; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Olymp Dance Olomouc</h1>
                <p style="color: #4ade80; margin: 6px 0 0 0; font-size: 15px; font-weight: bold;">Platba byla úspěšně přijata</p>
              </div>
              <div style="background-color: #ffffff; padding: 32px 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
                <p style="font-size: 16px;">Dobrý den, <strong>${merchOrder.userName}</strong>,</p>
                <p>potvrzujeme, že jsme v pořádku obdrželi Vaši platbu ve výši <strong>${amountVal || merchOrder.totalPrice} Kč</strong> za objednávku klubového merche:</p>
                
                <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 18px; margin: 20px 0;">
                  <h3 style="margin: 0 0 10px 0; color: #166534; font-size: 16px;">✅ Detaily objednávky</h3>
                  <p style="margin: 4px 0; font-size: 14px;"><strong>Položka:</strong> ${merchOrder.productName}</p>
                  <p style="margin: 4px 0; font-size: 14px;"><strong>Velikost / Varianta:</strong> ${merchOrder.size || 'Univerzální'} (${merchOrder.quantity} ks)</p>
                  <p style="margin: 4px 0; font-size: 14px;"><strong>Částka:</strong> <span style="color: #16a34a; font-weight: bold;">${amountVal || merchOrder.totalPrice} Kč</span></p>
                  <p style="margin: 4px 0; font-size: 14px;"><strong>Variabilní symbol:</strong> ${merchOrder.variableSymbol || vs}</p>
                  <p style="margin: 4px 0; font-size: 14px;"><strong>Stav:</strong> <span style="color: #16a34a; font-weight: bold;">Zaplaceno</span></p>
                </div>

                <p style="font-size: 14px; color: #475569;">
                  Objednávku nyní kompletujeme a připravujeme k předání (na tréninku dítěte nebo osobně v sále Olymp Dance dle domluvy).
                </p>
                <p style="font-size: 14px; color: #475569;">
                  Děkujeme za podporu našeho tanečního klubu!
                </p>

                <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
                <p style="font-size: 13px; color: #94a3b8; text-align: center; margin: 0;">
                  Taneční klub Olymp Olomouc • info@olympdance.cz • +420 722 017 700
                </p>
              </div>
            </div>
          `;
          sendEmailFn(merchOrder.userEmail, `Platba přijata: Objednávka merche (${merchOrder.productName}) - Olymp Dance`, buyerHtml).catch(console.error);
        }
      } else {
        alreadyMatched++;
      }
    }

    // ==========================================
    // 2. MATCH CAMP REGISTRATIONS (Tábory)
    // ==========================================
    // As explicitly instructed: Auto-mark as approved / paid in admin, NO automated email!
    if (matchedType === 'unmatched' && (vs || message)) {
      let campReg: any = null;
      if (vs) {
        const cleanVs = vs.replace(/^0+/, '') || vs;
        const [campRows] = await pool.query(
          'SELECT * FROM registrations WHERE variableSymbol = ? OR variableSymbol = ? OR TRIM(LEADING "0" FROM variableSymbol) = ? OR id = ? LIMIT 1',
          [vs, cleanVs, cleanVs, vs]
        );
        if ((campRows as any[]).length > 0) {
          campReg = (campRows as any[])[0];
        }
      }

      if (!campReg && message) {
        const [allCamps] = await pool.query('SELECT * FROM registrations WHERE status != "approved"');
        for (const c of (allCamps as any[])) {
          if (c.variableSymbol && message.includes(c.variableSymbol)) {
            campReg = c;
            break;
          }
          if (c.childName && message.toLowerCase().includes(c.childName.toLowerCase())) {
            campReg = c;
            break;
          }
        }
      }

      if (campReg) {
        matchedType = 'camp';
        matchedId = String(campReg.id);
        matchedName = `${campReg.childName} (${campReg.parentName || 'Rodič'})`;

        if (campReg.status !== 'approved') {
          await pool.query('UPDATE registrations SET status = "approved" WHERE id = ?', [campReg.id]);
          newMatched++;
          console.log(`[RB Auto-Match] Přihláška na tábor ${campReg.id} (${campReg.childName}) označena v adminu jako ZAPLACENO / SCHVÁLENO (VS: ${vs || campReg.variableSymbol})`);
          // NOTE: As requested: "U Tabaru tam neposíláme potvrzení automaticky. Jen automaticky si označíme ze je zaplacený v adminu."
          // Hence NO sendEmailFn call for camps!
        } else {
          alreadyMatched++;
        }
      }
    }

    // ==========================================
    // 3. MATCH SCHOOL REGISTRATIONS (Kroužky)
    // ==========================================
    if (matchedType === 'unmatched' && (vs || message)) {
      let schoolReg: any = null;

      if (vs) {
        const cleanVs = vs.replace(/^0+/, '') || vs;
        // 1. Direct variableSymbol or ID
        const [regRows] = await pool.query(
          'SELECT * FROM school_registrations WHERE variableSymbol = ? OR variableSymbol = ? OR TRIM(LEADING "0" FROM variableSymbol) = ? OR id = ? LIMIT 1',
          [vs, cleanVs, cleanVs, vs]
        );
        if ((regRows as any[]).length > 0) {
          schoolReg = (regRows as any[])[0];
        }

        // 2. Rodné číslo match
        if (!schoolReg) {
          const [rcRows] = await pool.query(
            'SELECT * FROM school_registrations WHERE childRodneCislo = ? OR REPLACE(childRodneCislo, "/", "") = ? OR REPLACE(childRodneCislo, "/", "") = ? LIMIT 1',
            [vs, cleanVs, vs]
          );
          if ((rcRows as any[]).length > 0) {
            schoolReg = (rcRows as any[])[0];
          }
        }
      }

      // 3. Match from message
      if (!schoolReg && message) {
        const [allRegs] = await pool.query('SELECT * FROM school_registrations');
        for (const r of (allRegs as any[])) {
          if (r.variableSymbol && r.variableSymbol.length >= 4 && message.includes(r.variableSymbol)) {
            schoolReg = r;
            break;
          }
          if (r.childRodneCislo) {
            const cleanRc = r.childRodneCislo.replace(/\D/g, '');
            if (cleanRc.length >= 6 && message.replace(/\D/g, '').includes(cleanRc)) {
              schoolReg = r;
              break;
            }
          }
          const surname = (r.childSurname || (r.childName ? r.childName.trim().split(' ').pop() : '') || '').trim().toLowerCase();
          if (surname && surname.length >= 3 && message.toLowerCase().includes(surname)) {
            schoolReg = r;
            break;
          }
        }
      }

      if (schoolReg) {
        matchedType = 'school';
        matchedId = String(schoolReg.id);
        const childFullName = [schoolReg.childName, schoolReg.childSurname].filter(Boolean).join(' ').trim();
        matchedName = `${childFullName} (${schoolReg.parentName || 'Rodič'})`;

        if (schoolReg.status !== 'approved') {
          // Parse current history
          let historyArr: any[] = [];
          try {
            historyArr = typeof schoolReg.history === 'string' ? JSON.parse(schoolReg.history) : (schoolReg.history || []);
          } catch (e) {
            historyArr = [];
          }
          historyArr.push({
            date: new Date().toISOString(),
            message: `Platba ${amountVal} Kč přijata z účtu ${senderAccount || 'banky'} (Raiffeisenbank). Přihláška schválena a potvrzení o úhradě odesláno na e-mail.`
          });

          await pool.query(
            'UPDATE school_registrations SET status = "approved", paidUntil = DATE_ADD(NOW(), INTERVAL 6 MONTH), history = ? WHERE id = ?',
            [JSON.stringify(historyArr), schoolReg.id]
          );
          newMatched++;
          console.log(`[RB Auto-Match] Přihláška na kroužek ${schoolReg.id} (${childFullName}) označena jako ZAPLACENO / SCHVÁLENO (VS: ${vs || schoolReg.variableSymbol})`);

          // Fetch school details
          let schoolName = '';
          if (schoolReg.schoolId) {
            const [scRows] = await pool.query('SELECT name, city FROM schools WHERE id = ?', [schoolReg.schoolId]);
            if ((scRows as any[]).length > 0) {
              const sc = (scRows as any[])[0];
              schoolName = `${sc.name} (${sc.city})`;
            }
          }

          // Generate 1:1 PDF confirmation
          try {
            const pdfBuffer = await generateSchoolPaymentPdf({
              paymentDate: bookingDate,
              senderAccount: senderAccount || '',
              parentName: schoolReg.parentName || senderName || 'Zákonný zástupce',
              childName: schoolReg.childName,
              childSurname: schoolReg.childSurname,
              childBirthDate: schoolReg.childBirthDate,
              childRodneCislo: schoolReg.childRodneCislo,
              amount: amountVal || 1700,
              period: null, // defaults to únor [year] - květen [year]
              issueDate: bookingDate || new Date()
            });

            // Send confirmation email with PDF attached
            if (sendEmailFn && schoolReg.parentEmail) {
              const safeName = (childFullName || 'krouzek').replace(/[^a-zA-Z0-9_-]/g, '_');
              const formattedAmt = (amountVal || 1700).toLocaleString('cs-CZ');
              const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
                  <div style="background-color: #002B49; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Olymp Dance Olomouc</h1>
                    <p style="color: #4ade80; margin: 6px 0 0 0; font-size: 15px; font-weight: bold;">Platba byla úspěšně přijata</p>
                  </div>
                  <div style="background-color: #ffffff; padding: 32px 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
                    <p style="font-size: 16px;">Vážený rodiči, <strong>${schoolReg.parentName || 'paní / pane'}</strong>,</p>
                    <p>potvrzujeme, že jsme z bankovního účtu v pořádku přijali platbu kurzovného za taneční kroužek pro Vaše dítě <strong>${childFullName}</strong>.</p>
                    
                    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 18px; margin: 20px 0;">
                      <h3 style="margin: 0 0 10px 0; color: #166534; font-size: 16px;">✅ Detaily platby a kroužku</h3>
                      <p style="margin: 4px 0; font-size: 14px;"><strong>Účastník:</strong> ${childFullName}</p>
                      ${schoolName ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Kroužek / Škola:</strong> ${schoolName}</p>` : ''}
                      <p style="margin: 4px 0; font-size: 14px;"><strong>Uhrazená částka:</strong> <span style="color: #16a34a; font-weight: bold;">${formattedAmt} Kč</span></p>
                      <p style="margin: 4px 0; font-size: 14px;"><strong>Variabilní symbol:</strong> ${vs || schoolReg.variableSymbol}</p>
                      <p style="margin: 4px 0; font-size: 14px;"><strong>Stav přihlášky:</strong> <span style="color: #16a34a; font-weight: bold;">Zaplaceno / Schváleno</span></p>
                    </div>

                    <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 16px; margin: 20px 0;">
                      <h4 style="margin: 0 0 8px 0; color: #1e40af; font-size: 15px;">📄 Oficiální potvrzení o platbě v příloze</h4>
                      <p style="margin: 0; font-size: 13px; color: #1e3a8a;">
                        V příloze tohoto e-mailu naleznete oficiální <strong>Potvrzení o přijetí platby (PDF)</strong> s razítkem a podpisem statutárního zástupce TK Olymp Olomouc, které můžete přímo předložit své zdravotní pojišťovně pro čerpání finančního příspěvku nebo zaměstnavateli pro proplacení z FKSP.
                      </p>
                    </div>

                    <p style="font-size: 14px; color: #475569;">
                      Ve Školním portálu na našem webu můžete kdykoliv sledovat docházku z tréninků, omlouvat případnou nepřítomnost a stáhnout si toto potvrzení kdykoliv znovu.
                    </p>

                    <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
                    <p style="font-size: 13px; color: #94a3b8; text-align: center; margin: 0;">
                      Taneční klub Olymp Olomouc, z. s. • Jiráskova 25, Olomouc • info@olympdance.cz • +420 722 017 700
                    </p>
                  </div>
                </div>
              `;

              sendEmailFn(
                schoolReg.parentEmail,
                `Potvrzení o přijetí platby – Taneční kroužek (${childFullName}) - Olymp Dance`,
                emailHtml,
                [{
                  filename: `Potvrzeni_o_prijeti_platby_${safeName}.pdf`,
                  content: pdfBuffer,
                  contentType: 'application/pdf'
                }]
              ).catch(console.error);
            }
          } catch (pdfErr: any) {
            console.error('[RB Auto-Match] Chyba při generování PDF pro kroužek:', pdfErr);
          }
        } else {
          alreadyMatched++;
        }
      }
    }

    if (matchedType === 'unmatched') {
      unmatched++;
    }

    // Insert or update log record
    try {
      await pool.query(`
        INSERT INTO bank_payments_log 
          (transactionId, bookingDate, amount, currency, variableSymbol, senderAccount, senderName, message, matchedType, matchedId, matchedName, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          matchedType = VALUES(matchedType),
          matchedId = VALUES(matchedId),
          matchedName = VALUES(matchedName),
          status = VALUES(status),
          variableSymbol = VALUES(variableSymbol),
          senderAccount = VALUES(senderAccount),
          senderName = VALUES(senderName),
          message = VALUES(message)
      `, [
        txId,
        bookingDate,
        amountVal,
        currency,
        vs || null,
        senderAccount || null,
        senderName || null,
        message || null,
        matchedType,
        matchedId || null,
        matchedName || null,
        matchedType === 'unmatched' ? 'unmatched' : 'matched'
      ]);
    } catch (e: any) {
      console.error('[RB API] Error saving payment log:', e.message);
    }
  }

  const summary = `Synchronizace úspěšná. Nalezeno: ${transactions.length}, nově spárováno: ${newMatched}, již spárováno: ${alreadyMatched}, nespárováno: ${unmatched}`;
  console.log(`[RB API] ${summary}`);
  await pool.query('UPDATE settings SET rbLastSync = NOW(), rbSyncStatus = ? WHERE id = 1', [summary]);

  return {
    success: true,
    message: summary,
    totalFetched: transactions.length,
    newMatched,
    alreadyMatched,
    unmatched
  };
};

export const getRbLogs = async (limit = 50) => {
  try {
    const [rows] = await pool.query('SELECT * FROM bank_payments_log ORDER BY createdAt DESC LIMIT ?', [limit]);
    return rows as any[];
  } catch (err) {
    return [];
  }
};

export const processSinglePayment = async (
  paymentData: {
    transactionId?: string;
    amount: number;
    currency?: string;
    variableSymbol?: string;
    senderAccount?: string;
    senderName?: string;
    message?: string;
    bookingDate?: string;
  },
  sendEmailFn?: SendEmailFn
) => {
  const vs = (paymentData.variableSymbol || '').trim();
  const message = (paymentData.message || '').trim();
  const amountVal = Number(paymentData.amount) || 0;
  const currency = paymentData.currency || 'CZK';
  const bookingDate = paymentData.bookingDate || new Date().toISOString().slice(0, 10);
  const txId = paymentData.transactionId || `sim_${Date.now()}_${vs || 'novs'}`;
  const senderAccount = paymentData.senderAccount || 'TEST-ACCOUNT';
  const senderName = paymentData.senderName || 'Testující plátce';

  let matchedType: 'school' | 'camp' | 'merch' | 'unmatched' = 'unmatched';
  let matchedId = '';
  let matchedName = '';

  // 1. Merch orders
  if (vs || message) {
    let merchOrder: any = null;
    if (vs) {
      const cleanVs = vs.replace(/^0+/, '') || vs;
      const [merchRows] = await pool.query(
        'SELECT * FROM merch_orders WHERE variableSymbol = ? OR variableSymbol = ? OR TRIM(LEADING "0" FROM variableSymbol) = ? LIMIT 1',
        [vs, cleanVs, cleanVs]
      );
      if ((merchRows as any[]).length > 0) {
        merchOrder = (merchRows as any[])[0];
      }
    }

    if (!merchOrder && message) {
      const [allMerch] = await pool.query('SELECT * FROM merch_orders WHERE status = "pending"');
      for (const m of (allMerch as any[])) {
        if (m.variableSymbol && message.includes(m.variableSymbol)) {
          merchOrder = m;
          break;
        }
      }
    }

    if (merchOrder) {
      matchedType = 'merch';
      matchedId = String(merchOrder.id);
      matchedName = `${merchOrder.userName} - ${merchOrder.productName}`;
      await pool.query('UPDATE merch_orders SET status = "paid" WHERE id = ?', [merchOrder.id]);

      if (sendEmailFn && merchOrder.userEmail) {
        const buyerHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
            <div style="background-color: #002B49; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Olymp Dance Olomouc</h1>
              <p style="color: #4ade80; margin: 6px 0 0 0; font-size: 15px; font-weight: bold;">Platba byla úspěšně přijata</p>
            </div>
            <div style="background-color: #ffffff; padding: 32px 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="font-size: 16px;">Dobrý den, <strong>${merchOrder.userName}</strong>,</p>
              <p>potvrzujeme, že jsme v pořádku obdrželi Vaši platbu ve výši <strong>${amountVal || merchOrder.totalPrice} Kč</strong> za objednávku klubového merche:</p>
              
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 18px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #166534; font-size: 16px;">✅ Detaily objednávky</h3>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Položka:</strong> ${merchOrder.productName}</p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Velikost / Varianta:</strong> ${merchOrder.size || 'Univerzální'} (${merchOrder.quantity} ks)</p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Částka:</strong> <span style="color: #16a34a; font-weight: bold;">${amountVal || merchOrder.totalPrice} Kč</span></p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Variabilní symbol:</strong> ${merchOrder.variableSymbol || vs}</p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Stav:</strong> <span style="color: #16a34a; font-weight: bold;">Zaplaceno</span></p>
              </div>

              <p style="font-size: 14px; color: #475569;">
                Objednávku nyní kompletujeme a připravujeme k předání (na tréninku dítěte nebo osobně v sále Olymp Dance dle domluvy).
              </p>
              <p style="font-size: 14px; color: #475569;">
                Děkujeme za podporu našeho tanečního klubu!
              </p>

              <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
              <p style="font-size: 13px; color: #94a3b8; text-align: center; margin: 0;">
                Taneční klub Olymp Olomouc • info@olympdance.cz • +420 722 017 700
              </p>
            </div>
          </div>
        `;
        sendEmailFn(merchOrder.userEmail, `Platba přijata: Objednávka merche (${merchOrder.productName}) - Olymp Dance`, buyerHtml).catch(console.error);
      }
    }
  }

  // 2. Camp registrations (Tábory) - mark paid in admin, NO automated email
  if (matchedType === 'unmatched' && (vs || message)) {
    let campReg: any = null;
    if (vs) {
      const cleanVs = vs.replace(/^0+/, '') || vs;
      const [campRows] = await pool.query(
        'SELECT * FROM registrations WHERE variableSymbol = ? OR variableSymbol = ? OR TRIM(LEADING "0" FROM variableSymbol) = ? OR id = ? LIMIT 1',
        [vs, cleanVs, cleanVs, vs]
      );
      if ((campRows as any[]).length > 0) {
        campReg = (campRows as any[])[0];
      }
    }

    if (!campReg && message) {
      const [allCamps] = await pool.query('SELECT * FROM registrations WHERE status != "approved"');
      for (const c of (allCamps as any[])) {
        if (c.variableSymbol && message.includes(c.variableSymbol)) {
          campReg = c;
          break;
        }
        if (c.childName && message.toLowerCase().includes(c.childName.toLowerCase())) {
          campReg = c;
          break;
        }
      }
    }

    if (campReg) {
      matchedType = 'camp';
      matchedId = String(campReg.id);
      matchedName = `${campReg.childName} (${campReg.parentName || 'Rodič'})`;

      await pool.query('UPDATE registrations SET status = "approved" WHERE id = ?', [campReg.id]);
      console.log(`[Auto-Match] Tábor ${campReg.id} označen jako ZAPLACENO / SCHVÁLENO (VS: ${vs || campReg.variableSymbol})`);
      // NOTE: NO email sent for camps as requested by user.
    }
  }

  // 3. School registrations (Kroužky)
  if (matchedType === 'unmatched' && (vs || message)) {
    let schoolReg: any = null;

    if (vs) {
      const cleanVs = vs.replace(/^0+/, '') || vs;
      // 1. Direct variableSymbol or ID
      const [regRows] = await pool.query(
        'SELECT * FROM school_registrations WHERE variableSymbol = ? OR variableSymbol = ? OR TRIM(LEADING "0" FROM variableSymbol) = ? OR id = ? LIMIT 1',
        [vs, cleanVs, cleanVs, vs]
      );
      if ((regRows as any[]).length > 0) {
        schoolReg = (regRows as any[])[0];
      }

      // 2. Rodné číslo match
      if (!schoolReg) {
        const [rcRows] = await pool.query(
          'SELECT * FROM school_registrations WHERE childRodneCislo = ? OR REPLACE(childRodneCislo, "/", "") = ? OR REPLACE(childRodneCislo, "/", "") = ? LIMIT 1',
          [vs, cleanVs, vs]
        );
        if ((rcRows as any[]).length > 0) {
          schoolReg = (rcRows as any[])[0];
        }
      }
    }

    // 3. Match from message
    if (!schoolReg && message) {
      const [allRegs] = await pool.query('SELECT * FROM school_registrations');
      for (const r of (allRegs as any[])) {
        if (r.variableSymbol && r.variableSymbol.length >= 4 && message.includes(r.variableSymbol)) {
          schoolReg = r;
          break;
        }
        if (r.childRodneCislo) {
          const cleanRc = r.childRodneCislo.replace(/\D/g, '');
          if (cleanRc.length >= 6 && message.replace(/\D/g, '').includes(cleanRc)) {
            schoolReg = r;
            break;
          }
        }
        const surname = (r.childSurname || (r.childName ? r.childName.trim().split(' ').pop() : '') || '').trim().toLowerCase();
        if (surname && surname.length >= 3 && message.toLowerCase().includes(surname)) {
          schoolReg = r;
          break;
        }
      }
    }

    if (schoolReg) {
      matchedType = 'school';
      matchedId = String(schoolReg.id);
      const childFullName = [schoolReg.childName, schoolReg.childSurname].filter(Boolean).join(' ').trim();
      matchedName = `${childFullName} (${schoolReg.parentName || 'Rodič'})`;

      if (schoolReg.status !== 'approved') {
        let historyArr: any[] = [];
        try {
          historyArr = typeof schoolReg.history === 'string' ? JSON.parse(schoolReg.history) : (schoolReg.history || []);
        } catch (e) {
          historyArr = [];
        }
        historyArr.push({
          date: new Date().toISOString(),
          message: `Platba ${amountVal} Kč přijata z účtu ${senderAccount || 'banky'}. Přihláška schválena a potvrzení o úhradě odesláno na e-mail.`
        });

        await pool.query(
          'UPDATE school_registrations SET status = "approved", paidUntil = DATE_ADD(NOW(), INTERVAL 6 MONTH), history = ? WHERE id = ?',
          [JSON.stringify(historyArr), schoolReg.id]
        );
        console.log(`[Auto-Match] Přihláška na kroužek ${schoolReg.id} (${childFullName}) označena jako ZAPLACENO / SCHVÁLENO (VS: ${vs || schoolReg.variableSymbol})`);

        // Fetch school details
        let schoolName = '';
        if (schoolReg.schoolId) {
          const [scRows] = await pool.query('SELECT name, city FROM schools WHERE id = ?', [schoolReg.schoolId]);
          if ((scRows as any[]).length > 0) {
            const sc = (scRows as any[])[0];
            schoolName = `${sc.name} (${sc.city})`;
          }
        }

        // Generate 1:1 PDF confirmation
        try {
          const pdfBuffer = await generateSchoolPaymentPdf({
            paymentDate: bookingDate,
            senderAccount: senderAccount || '',
            parentName: schoolReg.parentName || senderName || 'Zákonný zástupce',
            childName: schoolReg.childName,
            childSurname: schoolReg.childSurname,
            childBirthDate: schoolReg.childBirthDate,
            childRodneCislo: schoolReg.childRodneCislo,
            amount: amountVal || 1700,
            period: null,
            issueDate: bookingDate || new Date()
          });

          // Send confirmation email with PDF attached
          if (sendEmailFn && schoolReg.parentEmail) {
            const safeName = (childFullName || 'krouzek').replace(/[^a-zA-Z0-9_-]/g, '_');
            const formattedAmt = (amountVal || 1700).toLocaleString('cs-CZ');
            const emailHtml = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
                <div style="background-color: #002B49; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Olymp Dance Olomouc</h1>
                  <p style="color: #4ade80; margin: 6px 0 0 0; font-size: 15px; font-weight: bold;">Platba byla úspěšně přijata</p>
                </div>
                <div style="background-color: #ffffff; padding: 32px 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
                  <p style="font-size: 16px;">Vážený rodiči, <strong>${schoolReg.parentName || 'paní / pane'}</strong>,</p>
                  <p>potvrzujeme, že jsme z bankovního účtu v pořádku přijali platbu kurzovného za taneční kroužek pro Vaše dítě <strong>${childFullName}</strong>.</p>
                  
                  <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 18px; margin: 20px 0;">
                    <h3 style="margin: 0 0 10px 0; color: #166534; font-size: 16px;">✅ Detaily platby a kroužku</h3>
                    <p style="margin: 4px 0; font-size: 14px;"><strong>Účastník:</strong> ${childFullName}</p>
                    ${schoolName ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Kroužek / Škola:</strong> ${schoolName}</p>` : ''}
                    <p style="margin: 4px 0; font-size: 14px;"><strong>Uhrazená částka:</strong> <span style="color: #16a34a; font-weight: bold;">${formattedAmt} Kč</span></p>
                    <p style="margin: 4px 0; font-size: 14px;"><strong>Variabilní symbol:</strong> ${vs || schoolReg.variableSymbol}</p>
                    <p style="margin: 4px 0; font-size: 14px;"><strong>Stav přihlášky:</strong> <span style="color: #16a34a; font-weight: bold;">Zaplaceno / Schváleno</span></p>
                  </div>

                  <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 16px; margin: 20px 0;">
                    <h4 style="margin: 0 0 8px 0; color: #1e40af; font-size: 15px;">📄 Oficiální potvrzení o platbě v příloze</h4>
                    <p style="margin: 0; font-size: 13px; color: #1e3a8a;">
                      V příloze tohoto e-mailu naleznete oficiální <strong>Potvrzení o přijetí platby (PDF)</strong> s razítkem a podpisem statutárního zástupce TK Olymp Olomouc, které můžete přímo předložit své zdravotní pojišťovně pro čerpání finančního příspěvku nebo zaměstnavateli pro proplacení z FKSP.
                    </p>
                  </div>

                  <p style="font-size: 14px; color: #475569;">
                    Ve Školním portálu na našem webu můžete kdykoliv sledovat docházku z tréninků, omlouvat případnou nepřítomnost a stáhnout si toto potvrzení kdykoliv znovu.
                  </p>

                  <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
                  <p style="font-size: 13px; color: #94a3b8; text-align: center; margin: 0;">
                    Taneční klub Olymp Olomouc, z. s. • Jiráskova 25, Olomouc • info@olympdance.cz • +420 722 017 700
                  </p>
                </div>
              </div>
            `;

            sendEmailFn(
              schoolReg.parentEmail,
              `Potvrzení o přijetí platby – Taneční kroužek (${childFullName}) - Olymp Dance`,
              emailHtml,
              [{
                filename: `Potvrzeni_o_prijeti_platby_${safeName}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf'
              }]
            ).catch(console.error);
          }
        } catch (pdfErr: any) {
          console.error('[Auto-Match] Chyba při generování PDF pro kroužek:', pdfErr);
        }
      }
    }
  }

  // Insert or update log record
  try {
    await pool.query(`
      INSERT INTO bank_payments_log 
        (transactionId, bookingDate, amount, currency, variableSymbol, senderAccount, senderName, message, matchedType, matchedId, matchedName, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        matchedType = VALUES(matchedType),
        matchedId = VALUES(matchedId),
        matchedName = VALUES(matchedName),
        status = VALUES(status),
        variableSymbol = VALUES(variableSymbol),
        senderAccount = VALUES(senderAccount),
        senderName = VALUES(senderName),
        message = VALUES(message)
    `, [
      txId,
      bookingDate,
      amountVal,
      currency,
      vs || null,
      senderAccount || null,
      senderName || null,
      message || null,
      matchedType,
      matchedId || null,
      matchedName || null,
      matchedType === 'unmatched' ? 'unmatched' : 'matched'
    ]);
  } catch (e: any) {
    console.error('[Auto-Match] Error saving payment log:', e.message);
  }

  return {
    success: matchedType !== 'unmatched',
    matchedType,
    matchedId,
    matchedName,
    message: matchedType !== 'unmatched' 
      ? `Platba úspěšně spárována s: ${matchedName} (${matchedType === 'school' ? 'kroužek' : matchedType === 'camp' ? 'tábor' : 'merch'}).${matchedType === 'school' ? ' Vygenerováno oficiální PDF potvrzení a odesláno na e-mail rodiče.' : matchedType === 'merch' ? ' Potvrzovací e-mail byl odeslán zákazníkovi.' : ' Označeno jako zaplaceno v adminu.'}` 
      : `Platba nebyla nalezena (VS: ${vs || 'neuveden'}, zpráva: ${message || 'prázdná'}). Byla zaznamenána jako nespárovaná.`
  };
};
