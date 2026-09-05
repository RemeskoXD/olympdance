import https from 'https';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import crypto from 'crypto';
import pool from './db.ts';

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
  // 1. Direct field
  if (tx.variableSymbol) return String(tx.variableSymbol).trim();
  if (tx.details?.variableSymbol) return String(tx.details.variableSymbol).trim();

  // 2. Structured remittance info
  const structRef = tx.remittanceInformation?.structured?.creditorReferenceInformation?.reference;
  if (structRef) return String(structRef).trim();

  const vsRemit = tx.remittanceInformation?.variableSymbol;
  if (vsRemit) return String(vsRemit).trim();

  // 3. Unstructured or message regex
  const textToSearch = [
    tx.remittanceInformation?.unstructured,
    tx.entryDetails?.transactionDetails?.remittanceInformation?.unstructured,
    tx.message,
    tx.details?.message,
    tx.additionalInformation
  ].filter(Boolean).join(' ');

  if (textToSearch) {
    // Match "VS: 123456" or "VS123456" or variable symbol pattern
    const vsMatch = textToSearch.match(/(?:VS|vs|v\.s\.|variabilní symbol)[:\s]*(\d{4,10})/i);
    if (vsMatch && vsMatch[1]) return vsMatch[1];

    // Or a 6 to 10 digit standalone number
    const standaloneMatch = textToSearch.match(/\b(20\d{4,8}|\d{6,10})\b/);
    if (standaloneMatch && standaloneMatch[1]) return standaloneMatch[1];
  }

  return '';
}

// Synchronize transactions and match payments
export const syncRbPayments = async (
  sendEmailFn?: (to: string, subject: string, html: string) => Promise<any>
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
    const indicator = tx.creditDebitIndicator || (amountVal > 0 ? 'CRDT' : 'DBIT');
    if (indicator !== 'CRDT' && amountVal <= 0) {
      continue; // Skip outgoing payments
    }

    const txId = String(
      tx.entryReference || 
      tx.transactionId || 
      tx.id || 
      `${tx.bookingDate || tx.valueDate || toDate}_${amountVal}_${extractVariableSymbol(tx)}`
    );

    // Check if already in bank_payments_log
    const [logRows] = await pool.query('SELECT id, status FROM bank_payments_log WHERE transactionId = ?', [txId]);
    if ((logRows as any[]).length > 0) {
      alreadyMatched++;
      continue;
    }

    const vs = extractVariableSymbol(tx);
    const bookingDate = tx.bookingDate || tx.valueDate || toDate;
    const currency = (typeof tx.amount === 'object' ? tx.amount.currency : tx.currency) || 'CZK';
    const message = [
      tx.remittanceInformation?.unstructured,
      tx.entryDetails?.transactionDetails?.remittanceInformation?.unstructured,
      tx.message
    ].filter(Boolean).join(' ');
    const senderAccount = tx.debtorAccount?.iban || tx.debtorAccount?.accountNumber || '';
    const senderName = tx.debtor?.name || tx.debtorAccount?.name || '';

    let matchedType = 'unmatched';
    let matchedId = '';
    let matchedName = '';

    // ==========================================
    // 1. MATCH MERCH ORDERS
    // ==========================================
    if (vs) {
      const [merchRows] = await pool.query(
        'SELECT * FROM merch_orders WHERE variableSymbol = ?',
        [vs]
      );
      if ((merchRows as any[]).length > 0) {
        const order = (merchRows as any[])[0];
        matchedType = 'merch';
        matchedId = order.id;
        matchedName = `${order.userName} - ${order.productName}`;

        if (order.status !== 'paid') {
          await pool.query('UPDATE merch_orders SET status = "paid" WHERE id = ?', [order.id]);
          newMatched++;
          console.log(`[RB Auto-Match] Merch objednávka ${order.id} označena jako ZAPLACENO (VS: ${vs})`);

          if (sendEmailFn && order.userEmail) {
            const buyerHtml = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
                <div style="background-color: #002B49; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Olymp Dance Olomouc</h1>
                  <p style="color: #4ade80; margin: 6px 0 0 0; font-weight: bold;">Platba byla úspěšně přijata</p>
                </div>
                <div style="padding: 24px; border: 1px solid #e2e8f0; border-radius: 0 0 12px 12px; background: #fff;">
                  <p>Dobrý den, <strong>${order.userName}</strong>,</p>
                  <p>potvrzujeme přijetí Vaší platby ve výši <strong>${amountVal} Kč</strong> (VS: ${vs}) za objednávku klubového merche:</p>
                  <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
                    <p style="margin: 4px 0;"><strong>Produkt:</strong> ${order.productName}</p>
                    <p style="margin: 4px 0;"><strong>Velikost / kusy:</strong> ${order.size || 'Univerzální'} (${order.quantity} ks)</p>
                    <p style="margin: 4px 0;"><strong>Stav objednávky:</strong> <span style="color: #16a34a; font-weight: bold;">Zaplaceno</span></p>
                  </div>
                  <p>Objednávku nyní připravíme k předání.</p>
                  <p style="margin-top: 24px; color: #64748b; font-size: 13px;">Tým Olymp Dance Olomouc</p>
                </div>
              </div>
            `;
            sendEmailFn(order.userEmail, `Platba přijata: Objednávka merche (${order.productName}) - Olymp Dance`, buyerHtml).catch(console.error);
          }
        }
      }
    }

    // ==========================================
    // 2. MATCH SCHOOL REGISTRATIONS (Kroužky)
    // ==========================================
    if (matchedType === 'unmatched' && (vs || message)) {
      let schoolQuery = '';
      let queryParams: any[] = [];

      if (vs) {
        schoolQuery = 'SELECT * FROM school_registrations WHERE variableSymbol = ? OR id = ? OR childRodneCislo LIKE ?';
        queryParams = [vs, vs, `%${vs}%`];
      } else if (message) {
        schoolQuery = 'SELECT * FROM school_registrations WHERE (? LIKE CONCAT("%", variableSymbol, "%") AND variableSymbol IS NOT NULL AND LENGTH(variableSymbol) >= 4) OR (? LIKE CONCAT("%", childSurname, "%") AND ? LIKE CONCAT("%", childName, "%"))';
        queryParams = [message, message, message];
      }

      if (schoolQuery) {
        const [regRows] = await pool.query(schoolQuery, queryParams);
        if ((regRows as any[]).length > 0) {
          const reg = (regRows as any[])[0];
          matchedType = 'school';
          matchedId = reg.id;
          matchedName = `${reg.childName} ${reg.childSurname || ''} (${reg.parentName})`;

          if (reg.status !== 'approved') {
            await pool.query('UPDATE school_registrations SET status = "approved" WHERE id = ?', [reg.id]);
            newMatched++;
            console.log(`[RB Auto-Match] Přihláška do kroužku ${reg.id} schválena jako ZAPLACENO (VS: ${vs || reg.variableSymbol})`);

            if (sendEmailFn && reg.parentEmail) {
              const parentHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
                  <div style="background-color: #002B49; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Olymp Dance Olomouc</h1>
                    <p style="color: #4ade80; margin: 6px 0 0 0; font-weight: bold;">Platba kurzovného přijata</p>
                  </div>
                  <div style="padding: 24px; border: 1px solid #e2e8f0; border-radius: 0 0 12px 12px; background: #fff;">
                    <p>Vážený rodiči <strong>${reg.parentName}</strong>,</p>
                    <p>potvrzujeme přijetí platby kurzovného ve výši <strong>${amountVal} Kč</strong> pro dítě <strong>${reg.childName} ${reg.childSurname || ''}</strong>.</p>
                    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin: 16px 0;">
                      <p style="margin: 4px 0;"><strong>Stav přihlášky:</strong> <span style="color: #16a34a; font-weight: bold;">Schváleno / Zaplaceno</span></p>
                      <p style="margin: 4px 0;"><strong>Dítě:</strong> ${reg.childName} ${reg.childSurname || ''}</p>
                      <p style="margin: 4px 0;"><strong>Variabilní symbol:</strong> ${vs || reg.variableSymbol || 'Spárováno'}</p>
                    </div>
                    <p>V klientském portálu máte nyní k dispozici kompletní docházku a potvrzení o platbě pro pojišťovnu.</p>
                    <p style="margin-top: 24px; color: #64748b; font-size: 13px;">Tým Olymp Dance Olomouc</p>
                  </div>
                </div>
              `;
              sendEmailFn(reg.parentEmail, `Potvrzení o zaplacení kroužku (${reg.childName}) - Olymp Dance`, parentHtml).catch(console.error);
            }
          }
        }
      }
    }

    // ==========================================
    // 3. MATCH CAMP REGISTRATIONS (Tábory)
    // ==========================================
    if (matchedType === 'unmatched' && (vs || message)) {
      let campQuery = '';
      let campParams: any[] = [];

      if (vs) {
        campQuery = 'SELECT * FROM registrations WHERE variableSymbol = ? OR id = ?';
        campParams = [vs, vs];
      } else if (message) {
        campQuery = 'SELECT * FROM registrations WHERE (? LIKE CONCAT("%", variableSymbol, "%") AND variableSymbol IS NOT NULL AND LENGTH(variableSymbol) >= 4) OR (? LIKE CONCAT("%", childName, "%"))';
        campParams = [message, message];
      }

      if (campQuery) {
        const [campRows] = await pool.query(campQuery, campParams);
        if ((campRows as any[]).length > 0) {
          const reg = (campRows as any[])[0];
          matchedType = 'camp';
          matchedId = reg.id;
          matchedName = `${reg.childName} (${reg.parentName})`;

          if (reg.status !== 'approved') {
            await pool.query('UPDATE registrations SET status = "approved" WHERE id = ?', [reg.id]);
            newMatched++;
            console.log(`[RB Auto-Match] Přihláška na tábor ${reg.id} schválena jako ZAPLACENO (VS: ${vs})`);

            if (sendEmailFn && reg.parentEmail) {
              const campHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
                  <div style="background-color: #002B49; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Olymp Dance Olomouc</h1>
                    <p style="color: #4ade80; margin: 6px 0 0 0; font-weight: bold;">Platba tábora přijata</p>
                  </div>
                  <div style="padding: 24px; border: 1px solid #e2e8f0; border-radius: 0 0 12px 12px; background: #fff;">
                    <p>Vážený rodiči <strong>${reg.parentName}</strong>,</p>
                    <p>potvrzujeme přijetí platby za letní tábor ve výši <strong>${amountVal} Kč</strong> pro dítě <strong>${reg.childName}</strong>.</p>
                    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin: 16px 0;">
                      <p style="margin: 4px 0;"><strong>Stav přihlášky:</strong> <span style="color: #16a34a; font-weight: bold;">Potvrzeno a zaplaceno</span></p>
                      <p style="margin: 4px 0;"><strong>Dítě:</strong> ${reg.childName}</p>
                    </div>
                    <p style="margin-top: 24px; color: #64748b; font-size: 13px;">Tým Olymp Dance Olomouc</p>
                  </div>
                </div>
              `;
              sendEmailFn(reg.parentEmail, `Potvrzení o zaplacení tábora (${reg.childName}) - Olymp Dance`, campHtml).catch(console.error);
            }
          }
        }
      }
    }

    if (matchedType === 'unmatched') {
      unmatched++;
    }

    // Insert log record
    try {
      await pool.query(`
        INSERT INTO bank_payments_log 
          (transactionId, bookingDate, amount, currency, variableSymbol, senderAccount, senderName, message, matchedType, matchedId, matchedName, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          matchedType = VALUES(matchedType),
          matchedId = VALUES(matchedId),
          matchedName = VALUES(matchedName)
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
  sendEmailFn?: (to: string, subject: string, html: string) => Promise<boolean>
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
  if (vs) {
    const [merchRows] = await pool.query('SELECT * FROM merch_orders WHERE variableSymbol = ?', [vs]);
    if ((merchRows as any[]).length > 0) {
      const order = (merchRows as any[])[0];
      matchedType = 'merch';
      matchedId = String(order.id);
      matchedName = `${order.userName} - ${order.productName}`;
      await pool.query('UPDATE merch_orders SET status = "paid" WHERE id = ?', [order.id]);

      if (sendEmailFn && order.userEmail) {
        const buyerHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
            <div style="background-color: #002B49; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Olymp Dance Olomouc</h1>
              <p style="color: #4ade80; margin: 6px 0 0 0; font-weight: bold;">Platba byla úspěšně přijata</p>
            </div>
            <div style="padding: 24px; border: 1px solid #e2e8f0; border-radius: 0 0 12px 12px; background: #fff;">
              <p>Dobrý den, <strong>${order.userName}</strong>,</p>
              <p>potvrzujeme přijetí Vaší platby ve výši <strong>${amountVal} Kč</strong> (VS: ${vs}) za objednávku klubového merche:</p>
              <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p style="margin: 4px 0;"><strong>Produkt:</strong> ${order.productName}</p>
                <p style="margin: 4px 0;"><strong>Stav objednávky:</strong> <span style="color: #16a34a; font-weight: bold;">Zaplaceno</span></p>
              </div>
              <p>Objednávku nyní připravíme k předání.</p>
              <p style="margin-top: 24px; color: #64748b; font-size: 13px;">Tým Olymp Dance Olomouc</p>
            </div>
          </div>
        `;
        sendEmailFn(order.userEmail, `Platba přijata: Objednávka merche (${order.productName}) - Olymp Dance`, buyerHtml).catch(console.error);
      }
    }
  }

  // 2. School registrations
  if (matchedType === 'unmatched' && (vs || message)) {
    let schoolQuery = '';
    let queryParams: any[] = [];

    if (vs) {
      schoolQuery = 'SELECT * FROM school_registrations WHERE variableSymbol = ? OR id = ? OR childRodneCislo LIKE ?';
      queryParams = [vs, vs, `%${vs}%`];
    } else if (message) {
      schoolQuery = 'SELECT * FROM school_registrations WHERE (? LIKE CONCAT("%", variableSymbol, "%") AND variableSymbol IS NOT NULL AND LENGTH(variableSymbol) >= 4) OR (? LIKE CONCAT("%", childSurname, "%") AND ? LIKE CONCAT("%", childName, "%"))';
      queryParams = [message, message, message];
    }

    if (schoolQuery) {
      const [regRows] = await pool.query(schoolQuery, queryParams);
      if ((regRows as any[]).length > 0) {
        const reg = (regRows as any[])[0];
        matchedType = 'school';
        matchedId = String(reg.id);
        matchedName = `${reg.childName} ${reg.childSurname || ''} (${reg.parentName})`;

        await pool.query('UPDATE school_registrations SET status = "approved" WHERE id = ?', [reg.id]);
        console.log(`[Auto-Match] Kroužek ${reg.id} označen jako ZAPLACENO (VS: ${vs || reg.variableSymbol})`);

        if (sendEmailFn && reg.parentEmail) {
          const parentHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
              <div style="background-color: #002B49; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Olymp Dance Olomouc</h1>
                <p style="color: #4ade80; margin: 6px 0 0 0; font-weight: bold;">Platba kurzovného přijata</p>
              </div>
              <div style="padding: 24px; border: 1px solid #e2e8f0; border-radius: 0 0 12px 12px; background: #fff;">
                <p>Vážený rodiči <strong>${reg.parentName}</strong>,</p>
                <p>potvrzujeme přijetí platby kurzovného ve výši <strong>${amountVal} Kč</strong> pro dítě <strong>${reg.childName} ${reg.childSurname || ''}</strong>.</p>
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin: 16px 0;">
                  <p style="margin: 4px 0;"><strong>Stav přihlášky:</strong> <span style="color: #16a34a; font-weight: bold;">Schváleno / Zaplaceno</span></p>
                  <p style="margin: 4px 0;"><strong>Dítě:</strong> ${reg.childName} ${reg.childSurname || ''}</p>
                  <p style="margin: 4px 0;"><strong>Variabilní symbol:</strong> ${vs || reg.variableSymbol || 'Spárováno'}</p>
                </div>
                <p>V klientském portálu máte nyní k dispozici kompletní docházku a potvrzení o platbě pro pojišťovnu.</p>
                <p style="margin-top: 24px; color: #64748b; font-size: 13px;">Tým Olymp Dance Olomouc</p>
              </div>
            </div>
          `;
          sendEmailFn(reg.parentEmail, `Potvrzení o zaplacení kroužku (${reg.childName}) - Olymp Dance`, parentHtml).catch(console.error);
        }
      }
    }
  }

  // 3. Camp registrations
  if (matchedType === 'unmatched' && (vs || message)) {
    let campQuery = '';
    let campParams: any[] = [];

    if (vs) {
      campQuery = 'SELECT * FROM registrations WHERE variableSymbol = ? OR id = ?';
      campParams = [vs, vs];
    } else if (message) {
      campQuery = 'SELECT * FROM registrations WHERE (? LIKE CONCAT("%", variableSymbol, "%") AND variableSymbol IS NOT NULL AND LENGTH(variableSymbol) >= 4) OR (? LIKE CONCAT("%", childName, "%"))';
      campParams = [message, message];
    }

    if (campQuery) {
      const [campRows] = await pool.query(campQuery, campParams);
      if ((campRows as any[]).length > 0) {
        const reg = (campRows as any[])[0];
        matchedType = 'camp';
        matchedId = String(reg.id);
        matchedName = `${reg.childName} (${reg.parentName})`;

        await pool.query('UPDATE registrations SET status = "approved" WHERE id = ?', [reg.id]);
        console.log(`[Auto-Match] Tábor ${reg.id} označen jako ZAPLACENO (VS: ${vs || reg.variableSymbol})`);

        if (sendEmailFn && reg.parentEmail) {
          const campHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
              <div style="background-color: #002B49; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Olymp Dance Olomouc</h1>
                <p style="color: #4ade80; margin: 6px 0 0 0; font-weight: bold;">Platba tábora přijata</p>
              </div>
              <div style="padding: 24px; border: 1px solid #e2e8f0; border-radius: 0 0 12px 12px; background: #fff;">
                <p>Vážený rodiči <strong>${reg.parentName}</strong>,</p>
                <p>potvrzujeme přijetí platby za letní tábor ve výši <strong>${amountVal} Kč</strong> pro účastníka <strong>${reg.childName}</strong>.</p>
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin: 16px 0;">
                  <p style="margin: 4px 0;"><strong>Stav přihlášky:</strong> <span style="color: #16a34a; font-weight: bold;">Schváleno / Zaplaceno</span></p>
                  <p style="margin: 4px 0;"><strong>Účastník:</strong> ${reg.childName}</p>
                  <p style="margin: 4px 0;"><strong>Variabilní symbol:</strong> ${vs || reg.variableSymbol || 'Spárováno'}</p>
                </div>
                <p>V klientském portálu máte nyní k dispozici kompletní informace a potvrzení o platbě pro pojišťovnu nebo zaměstnavatele.</p>
                <p style="margin-top: 24px; color: #64748b; font-size: 13px;">Tým Olymp Dance Olomouc</p>
              </div>
            </div>
          `;
          sendEmailFn(reg.parentEmail, `Potvrzení o zaplacení tábora (${reg.childName}) - Olymp Dance`, campHtml).catch(console.error);
        }
      }
    }
  }

  // Insert log record
  try {
    await pool.query(`
      INSERT INTO bank_payments_log 
        (transactionId, bookingDate, amount, currency, variableSymbol, senderAccount, senderName, message, matchedType, matchedId, matchedName, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        matchedType = VALUES(matchedType),
        matchedId = VALUES(matchedId),
        matchedName = VALUES(matchedName),
        status = VALUES(status)
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
      ? `Platba úspěšně spárována s: ${matchedName} (${matchedType === 'school' ? 'kroužek' : matchedType === 'camp' ? 'tábor' : 'merch'}) a potvrzovací e-mail byl odeslán.` 
      : `Platba nebyla nalezena (VS: ${vs || 'neuveden'}, zpráva: ${message || 'prázdná'}). Byla zaznamenána jako nespárovaná.`
  };
};
