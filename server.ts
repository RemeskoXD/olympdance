import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import pool, { initDb, isDbConfigured } from './db.ts';
import { SCHOOLS, CAMPS, GALLERY_IMAGES, PRODUCTS } from './constants.ts';
import { getRbConfig, testRbConnection, syncRbPayments, getRbLogs, processSinglePayment } from './rbService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, 'uploads');
fs.ensureDirSync(UPLOADS_DIR);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Initialize Database
initDb();

// Seed endpoint
app.get('/api/seed', async (req, res) => {
  try {
    await initDb();
    res.json({ success: true, message: 'Database seeding triggered' });
  } catch (error) {
    console.error('Seeding failed:', error);
    res.status(500).json({ error: 'Seeding failed' });
  }
});

// API Routes

// Upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // In production, this should be a full URL or relative path handled by proxy
  // For this setup, we return a relative path
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl, filename: req.file.filename, originalName: req.file.originalname });
});

// Serve uploads & local images
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/images', express.static(path.join(process.cwd(), 'public', 'images')));

// Data endpoints
app.get('/api/data', async (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  try {
    const [schools] = await pool.query('SELECT * FROM schools');
    const [camps] = await pool.query('SELECT * FROM camps');
    const [galleryImages] = await pool.query('SELECT * FROM gallery_images');
    const [products] = await pool.query('SELECT * FROM products');
    const [registrations] = await pool.query('SELECT * FROM registrations');
    const [schoolRegistrations] = await pool.query('SELECT * FROM school_registrations');
    const [users] = await pool.query('SELECT * FROM users');
    const [excuses] = await pool.query('SELECT * FROM excuses');
    const [attendance] = await pool.query('SELECT * FROM attendance');
    const [settings] = await pool.query('SELECT * FROM settings WHERE id = 1');
    let merchOrders: any[] = [];
    try {
      const [orders] = await pool.query('SELECT * FROM merch_orders ORDER BY createdAt DESC');
      merchOrders = orders as any[];
    } catch (e) {
      // Table may still be initializing
    }

    // Parse fields
    const parsedSchools = (schools as any[]).map(s => ({
      ...s,
      isKindergarten: Boolean(s.isKindergarten),
      trainingDates: typeof s.trainingDates === 'string' ? JSON.parse(s.trainingDates) : (s.trainingDates || [])
    }));

    const parsedProducts = (products as any[]).map(p => ({
      ...p,
      isAction: Boolean(p.isAction),
      originalPrice: p.originalPrice || '',
      actionBadge: p.actionBadge || 'AKCE',
      sizes: typeof p.sizes === 'string' ? JSON.parse(p.sizes) : p.sizes
    }));

    const parsedRegistrations = (registrations as any[]).map(r => ({
      ...r,
      documents: typeof r.documents === 'string' ? JSON.parse(r.documents) : r.documents
    }));

    const parsedAttendance = (attendance as any[]).map(a => ({
      ...a,
      records: typeof a.records === 'string' ? JSON.parse(a.records) : a.records
    }));
    
    const parsedSchoolRegistrations = (schoolRegistrations as any[]).map(r => ({
      ...r,
      history: typeof r.history === 'string' ? JSON.parse(r.history) : (r.history || []),
      afterSchoolClub: Boolean(r.afterSchoolClub)
    }));

    const parsedUsers = (users as any[]).map(u => {
      let schoolIds: string[] = [];
      if (u.schoolIds) {
        schoolIds = typeof u.schoolIds === 'string' ? JSON.parse(u.schoolIds) : (Array.isArray(u.schoolIds) ? u.schoolIds : []);
      } else if (u.schoolId) {
        schoolIds = [u.schoolId];
      }
      return {
        ...u,
        schoolIds,
        schoolId: u.schoolId || (schoolIds.length > 0 ? schoolIds[0] : undefined)
      };
    });
    
    const currentSettings = (settings as any[])[0] || {};

    res.json({
      schools: parsedSchools,
      camps,
      galleryImages,
      products: parsedProducts,
      registrations: parsedRegistrations,
      schoolRegistrations: parsedSchoolRegistrations,
      users: parsedUsers,
      excuses,
      attendance: parsedAttendance,
      merchOrders: merchOrders || [],
      isMerchEnabled: currentSettings.isMerchEnabled === undefined ? true : Boolean(currentSettings.isMerchEnabled),
      isTanecniExpresEnabled: currentSettings.isTanecniExpresEnabled === undefined ? true : Boolean(currentSettings.isTanecniExpresEnabled),
      isCampsEnabled: currentSettings.isCampsEnabled === undefined ? true : Boolean(currentSettings.isCampsEnabled),
      isGalleryEnabled: currentSettings.isGalleryEnabled === undefined ? true : Boolean(currentSettings.isGalleryEnabled),
      isAboutEnabled: currentSettings.isAboutEnabled === undefined ? true : Boolean(currentSettings.isAboutEnabled),
      campGeneralInfo: currentSettings.campGeneralInfo,
      siteContent: typeof currentSettings.siteContent === 'string' ? JSON.parse(currentSettings.siteContent) : (currentSettings.siteContent || {})
    });
  } catch (error) {
    console.error('Error fetching data from MySQL, falling back to static constants:', error);
    // Graceful fallback response so the frontend always works
    res.json({
      schools: SCHOOLS,
      camps: CAMPS,
      galleryImages: GALLERY_IMAGES,
      products: PRODUCTS,
      registrations: [],
      schoolRegistrations: [],
      users: [],
      excuses: [],
      attendance: [],
      isMerchEnabled: true,
      isTanecniExpresEnabled: true,
      isCampsEnabled: true,
      campGeneralInfo: '',
      siteContent: {
        heroTitle: 'Objevte pravou radost z pohybu a tance',
        heroSubtitle: 'Taneční kroužky pro děti přímo na vaší škole. Moderní styly, skvělá parta a profesionální lektoři. Přidejte se k týmu Olymp Dance!',
        aboutText: '<strong>Taneční klub Olymp Olomouc</strong> se již řadu let věnuje práci s dětmi a mládeží. Naším cílem není jen naučit děti taneční kroky, ale především v nich vybudovat <span class="text-brand-red font-bold">lásku k pohybu</span>, která jim vydrží celý život.\n\nZaměřujeme se na moderní taneční styly, disko tance a street dance. Klademe důraz na týmovou spolupráci, fair play a přátelskou atmosféru na trénincích.'
      }
    });
  }
});

// Sync endpoint (Full sync is not ideal for SQL, but we'll adapt specific updates)
// We should refactor the frontend to use specific endpoints, but for now we'll handle the "sync" 
// by checking what changed. However, the frontend sends the WHOLE state.
// To avoid complexity in this step, we will implement specific endpoints and update the frontend context 
// to use them, OR we can try to "upsert" everything (inefficient).

// BETTER APPROACH: The frontend context ALREADY calls this sync endpoint with the FULL data object 
// whenever something changes. This is bad for SQL.
// I will update the server to handle specific entity updates if possible, OR
// I will just implement the specific endpoints that I added to the Context in the previous step?
// Wait, I didn't add specific endpoints to the Context in the previous step, I added a generic `syncData` 
// that sends the whole state.
// I MUST refactor the Context to call specific endpoints.

// Let's implement specific endpoints first.

app.post('/api/schools', async (req, res) => {
  try {
    const school = { ...req.body };
    if (Array.isArray(school.trainingDates)) {
      school.trainingDates = JSON.stringify(school.trainingDates);
    }
    await pool.query('INSERT INTO schools SET ?', school);
    res.json(req.body);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/schools/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const school = { ...req.body };
    if (Array.isArray(school.trainingDates)) {
      school.trainingDates = JSON.stringify(school.trainingDates);
    }
    await pool.query('UPDATE schools SET ? WHERE id = ?', [school, id]);
    res.json(req.body);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/schools/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM schools WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// ... Similar for camps, gallery, products ...

app.post('/api/camps', async (req, res) => {
  try {
    const camp = req.body;
    await pool.query('INSERT INTO camps SET ?', camp);
    res.json(camp);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/camps/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const camp = req.body;
    await pool.query('UPDATE camps SET ? WHERE id = ?', [camp, id]);
    res.json(camp);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/camps/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM camps WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Gallery
app.post('/api/gallery', async (req, res) => {
  try {
    const image = req.body;
    await pool.query('INSERT INTO gallery_images SET ?', image);
    res.json(image);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/gallery/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM gallery_images WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Products
app.post('/api/products', async (req, res) => {
  try {
    const product = req.body;
    const sqlProduct: any = {
      ...product,
      isAction: product.isAction !== undefined ? Boolean(product.isAction) : false,
      originalPrice: product.originalPrice || '',
      actionBadge: product.actionBadge || 'AKCE',
      sizes: product.sizes ? JSON.stringify(product.sizes) : null
    };
    await pool.query('INSERT INTO products SET ?', sqlProduct);
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = req.body;
    const sqlProduct: any = { ...product };
    if (sqlProduct.sizes) {
      sqlProduct.sizes = JSON.stringify(sqlProduct.sizes);
    }
    if (sqlProduct.isAction !== undefined) {
      sqlProduct.isAction = Boolean(sqlProduct.isAction);
    }
    delete sqlProduct.id;
    await pool.query('UPDATE products SET ? WHERE id = ?', [sqlProduct, id]);
    res.json({ ...product, id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

import nodemailer from 'nodemailer';

// Robust Email Transporter (handles Gmail SSL/TLS and App Passwords with spaces)
let currentTransporter: any = null;
let lastSmtpUser = '';
let lastSmtpPass = '';

const getTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = port === 465 || process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === 'ssl';
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

  if (currentTransporter && user === lastSmtpUser && pass === lastSmtpPass) {
    return currentTransporter;
  }

  lastSmtpUser = user;
  lastSmtpPass = pass;
  currentTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  return currentTransporter;
};

const BANK_DETAILS = {
  account: '1806875329/5500',
  accountNumber: '1806875329',
  bankCode: '5500',
  bankName: 'Raiffeisenbank',
  iban: 'CZ0855000000001806875329',
  ibanFormatted: 'CZ08 5500 0000 0018 0687 5329',
  bic: 'RZBCCZPP'
};

// Safe formatting for MySQL DATETIME columns
const toSqlDateTime = (dateVal?: any): string => {
  try {
    const d = dateVal ? new Date(dateVal) : new Date();
    if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 19).replace('T', ' ');
    return d.toISOString().slice(0, 19).replace('T', ' ');
  } catch {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
  }
};

// Generates a standard Czech SPAYD payment QR code URL (compatible with all CZ mobile banking apps: Raiffeisenbank, ČSOB, KB, Spořitelna, AirBank, etc.)
const generateQrPaymentUrl = (amount: number, vs: string, message: string) => {
  const safeAmount = Math.max(0, amount);
  const safeVs = vs.replace(/\D/g, '').slice(0, 10) || '2026';
  const cleanMsg = message.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9\s]/g, '').slice(0, 50);
  const spayd = `SPD*1.0*ACC:CZ0855000000001806875329*AM:${safeAmount.toFixed(2)}*CC:CZK*X-VS:${safeVs}*MSG:${cleanMsg}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=10&data=${encodeURIComponent(spayd)}`;
};

// Admin recipient list (both primary and requested test emails)
const getAdminEmails = (): string[] => {
  const emails = new Set<string>();
  if (process.env.ADMIN_EMAIL) {
    process.env.ADMIN_EMAIL.split(',').forEach(e => {
      const clean = e.trim();
      if (clean && clean.includes('@')) emails.add(clean);
    });
  }
  if (process.env.SMTP_USER) {
    const cleanUser = process.env.SMTP_USER.trim();
    if (cleanUser && cleanUser.includes('@')) emails.add(cleanUser);
  }
  // User explicitly asked for ludvikremesekwork@gmail.com to receive notifications
  emails.add('ludvikremesekwork@gmail.com');
  return Array.from(emails);
};

const getAdminEmail = () => getAdminEmails()[0] || 'ludvikremesekwork@gmail.com';

// Helper to send email safely
const sendEmail = async (to: string, subject: string, html: string) => {
  console.log(`[Email Dispatch] To: ${to} | Subject: "${subject}"`);
  if (!process.env.SMTP_USER) {
    console.log('[Email Simulation] SMTP_USER not set. To:', to, '| Subject:', subject);
    return null;
  }
  try {
    const activeTransporter = getTransporter();
    const info = await activeTransporter.sendMail({
      from: `"Olymp Dance" <${process.env.SMTP_USER.trim()}>`,
      to,
      subject,
      html,
    });
    console.log('[Email Sent] Delivered to:', to, 'MessageId:', info?.messageId);
    return info;
  } catch (error) {
    console.error('[Email Error] Failed sending email to:', to, error);
    // Don't rethrow to avoid breaking user response, but return null
    return null;
  }
};

// Admin test email endpoint to verify Gmail configuration
app.post('/api/test-email', async (req, res) => {
  try {
    if (!process.env.SMTP_USER) {
      return res.status(400).json({
        success: false,
        error: 'V proměnných prostředí chybí nastavený SMTP_USER (váš Gmail, např. vas-ucet@gmail.com). Přidejte jej do Settings -> Secrets.'
      });
    }

    const recipients = getAdminEmails();
    const testHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
        <div style="background-color: #002B49; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Olymp Dance Olomouc</h1>
          <p style="color: #4ade80; margin: 6px 0 0 0; font-size: 15px; font-weight: bold;">Testovací e-mail spojení (Gmail SMTP)</p>
        </div>
        <div style="background-color: #ffffff; padding: 32px 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px;">Dobrý den,</p>
          <p>toto je <strong>testovací zpráva</strong> potvrzující, že Gmail SMTP spojení na webu Olymp Dance je plně funkční a aktivní!</p>
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; color: #166534; font-weight: bold;">✅ SMTP Odesílatel: ${process.env.SMTP_USER || 'Nenastaven'}</p>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #15803d;">Doručeno na: ${recipients.join(', ')}</p>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #15803d;">Čas testu: ${new Date().toLocaleString('cs-CZ')}</p>
          </div>
          <p style="font-size: 13px; color: #64748b;">
            Všechny odchozí e-maily (potvrzení kroužků a táborů s přihlašovacími údaji a QR platbou, obnova hesel s 6místným kódem, zprávy z kontaktního formuláře a objednávky merche) se nyní v pořádku odesílají.
          </p>
        </div>
      </div>
    `;

    let sentCount = 0;
    let lastError: any = null;

    for (const recipient of recipients) {
      try {
        const activeTransporter = getTransporter();
        await activeTransporter.sendMail({
          from: `"Olymp Dance" <${process.env.SMTP_USER.trim()}>`,
          to: recipient,
          subject: 'Testovací e-mail - Olymp Dance SMTP',
          html: testHtml,
        });
        sentCount++;
      } catch (e: any) {
        console.error('Failed sending test email to', recipient, e);
        lastError = e;
      }
    }

    if (sentCount === 0 && lastError) {
      return res.status(500).json({
        success: false,
        error: `Chyba při odesílání přes Gmail: ${lastError.message || 'Neplatné heslo nebo přihlašovací údaje'}`
      });
    }

    res.json({
      success: true,
      recipients,
      message: `Testovací e-mail byl úspěšně odeslán na: ${recipients.join(', ')}`
    });
  } catch (err: any) {
    console.error('Test email error:', err);
    res.status(500).json({ error: `Chyba při odesílání e-mailu: ${err.message}` });
  }
});

// Merch orders endpoints
app.get('/api/merch-orders', async (req, res) => {
  try {
    const [orders] = await pool.query('SELECT * FROM merch_orders ORDER BY createdAt DESC');
    res.json(orders);
  } catch (error) {
    console.error('Error fetching merch orders:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/merch-orders', async (req, res) => {
  try {
    const order = req.body;
    const vs = order.variableSymbol || `80${Date.now().toString().slice(-6)}`;
    const fullOrder = {
      id: order.id || `order-${Date.now()}`,
      productId: String(order.productId || 'merch-item'),
      productName: String(order.productName || 'Klubový merch'),
      productPrice: String(order.productPrice || order.totalPrice || '0 Kč'),
      size: String(order.size || 'M'),
      quantity: Number(order.quantity) || 1,
      totalPrice: Number(order.totalPrice) || 0,
      userId: order.userId || null,
      userName: String(order.userName || ''),
      userEmail: String(order.userEmail || ''),
      userPhone: String(order.userPhone || ''),
      deliveryNote: String(order.deliveryNote || ''),
      variableSymbol: vs,
      status: order.status || 'pending',
      createdAt: toSqlDateTime(order.createdAt)
    };

    await pool.query('INSERT INTO merch_orders SET ?', fullOrder);

    // QR Payment code for the order
    const qrUrl = generateQrPaymentUrl(
      Number(fullOrder.totalPrice) || 0,
      vs,
      `Merch: ${fullOrder.productName.slice(0, 15)} ${fullOrder.userName.slice(0, 15)}`
    );

    // Confirmation email to the buyer
    const buyerHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
        <div style="background-color: #002B49; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Olymp Dance Olomouc</h1>
          <p style="color: #93c5fd; margin: 6px 0 0 0; font-size: 15px;">Potvrzení objednávky klubového merche</p>
        </div>
        <div style="background-color: #ffffff; padding: 32px 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px;">Vážený člene / rodiči <strong>${fullOrder.userName}</strong>,</p>
          <p>děkujeme za Vaši objednávku klubového oblečení tanečního klubu <strong>Olymp Dance</strong>.</p>
          
          <!-- Souhrn položky -->
          <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 18px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 16px;">🛍️ Souhrn objednaného zboží</h3>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Položka:</strong> ${fullOrder.productName}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Velikost:</strong> <span style="font-weight: bold; background: #ffffff; padding: 2px 8px; border-radius: 4px; border: 1px solid #bfdbfe;">${fullOrder.size}</span></p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Počet kusů:</strong> ${fullOrder.quantity} ks</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Celková cena:</strong> <span style="color: #E30613; font-weight: bold; font-size: 16px;">${fullOrder.totalPrice} Kč</span></p>
            ${fullOrder.deliveryNote ? `<p style="margin: 6px 0 0 0; font-size: 13px; color: #475569;"><strong>Způsob předání / poznámka:</strong> ${fullOrder.deliveryNote}</p>` : ''}
          </div>

          <!-- Platební údaje -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #002B49; font-size: 16px;">💳 Platební údaje</h3>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Číslo účtu:</strong> ${BANK_DETAILS.account} (${BANK_DETAILS.bankName})</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>IBAN:</strong> ${BANK_DETAILS.ibanFormatted}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Variabilní symbol:</strong> <span style="font-weight: bold; color: #002B49;">${vs}</span></p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Částka k úhradě:</strong> <span style="color: #E30613; font-weight: bold;">${fullOrder.totalPrice} Kč</span></p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Zpráva pro příjemce:</strong> Merch ${fullOrder.productName} - ${fullOrder.userName}</p>
          </div>

          <!-- QR Platba -->
          <div style="text-align: center; margin: 24px 0; padding: 18px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
            <p style="font-weight: bold; margin: 0 0 10px 0; color: #002B49; font-size: 15px;">📲 Rychlá platba mobilem (QR Platba):</p>
            <img src="${qrUrl}" alt="QR platba" width="220" height="220" style="display: block; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 8px;" />
            <p style="font-size: 12px; color: #64748b; margin: 8px 0 0 0;">Naskenujte v aplikaci své banky (Raiffeisenbank, KB, ČSOB, Spořitelna, AirBank atd.)</p>
          </div>

          <p style="font-size: 14px; color: #475569;">Po přijetí platby zboží připravíme k předání. V případě dotazů nás můžete kdykoliv kontaktovat.</p>
          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
          <p style="font-size: 13px; color: #94a3b8; text-align: center; margin: 0;">
            Taneční klub Olymp Olomouc • info@olympdance.cz
          </p>
        </div>
      </div>
    `;

    sendEmail(fullOrder.userEmail, `Potvrzení objednávky merche (${fullOrder.productName}) - Olymp Dance`, buyerHtml).catch(console.error);

    // Notification to admin
    const adminRecipients = getAdminEmails();
    const adminHtml = `
      <h2>Nová objednávka klubového merche</h2>
      <p><strong>Zákazník:</strong> ${fullOrder.userName}</p>
      <p><strong>Email:</strong> ${fullOrder.userEmail}</p>
      <p><strong>Telefon:</strong> ${fullOrder.userPhone || 'Neuvedeno'}</p>
      <hr />
      <p><strong>Produkt:</strong> ${fullOrder.productName}</p>
      <p><strong>Velikost:</strong> ${fullOrder.size}</p>
      <p><strong>Počet kusů:</strong> ${fullOrder.quantity}</p>
      <p><strong>Celková částka:</strong> ${fullOrder.totalPrice} Kč</p>
      <p><strong>Variabilní symbol:</strong> ${vs}</p>
      <p><strong>Způsob předání / poznámka:</strong> ${fullOrder.deliveryNote || 'Neuvedeno'}</p>
    `;

    for (const adm of adminRecipients) {
      sendEmail(adm, `[Nová objednávka Merch] ${fullOrder.userName} - ${fullOrder.productName}`, adminHtml).catch(console.error);
    }

    res.json(fullOrder);
  } catch (error) {
    console.error('Create merch order error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/merch-orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.status === 'paid') {
      const [rows] = await pool.query('SELECT * FROM merch_orders WHERE id = ?', [id]);
      const order = (rows as any[])[0];
      if (order && order.status !== 'paid') {
        const paidHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
            <div style="background-color: #002B49; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Olymp Dance Olomouc</h1>
              <p style="color: #4ade80; margin: 6px 0 0 0; font-size: 15px; font-weight: bold;">Platba za merch byla přijata!</p>
            </div>
            <div style="background-color: #ffffff; padding: 32px 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="font-size: 16px;">Dobrý den, <strong>${order.userName}</strong>,</p>
              <p>potvrzujeme přijetí Vaší platby za objednávku klubového merche <strong>${order.productName}</strong> (${order.size}) v částce <strong>${order.totalPrice} Kč</strong>.</p>
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 16px; margin: 20px 0;">
                <p style="margin: 0; color: #166534; font-weight: bold;">✅ Objednávka je zaplacena a připravuje se.</p>
                <p style="margin: 6px 0 0 0; font-size: 13px; color: #15803d;">Předání proběhne dle domluvy (na tréninku dítěte nebo osobně v sále).</p>
              </div>
              <p>Děkujeme za podporu našeho klubu!</p>
              <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
              <p style="font-size: 13px; color: #94a3b8; text-align: center; margin: 0;">
                Taneční klub Olymp Olomouc • info@olympdance.cz
              </p>
            </div>
          </div>
        `;
        sendEmail(order.userEmail, `Platba za merch přijata - Olymp Dance (${order.productName})`, paidHtml).catch(console.error);
      }
    }

    await pool.query('UPDATE merch_orders SET ? WHERE id = ?', [updates, id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Update merch order error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/merch-orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM merch_orders WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete merch order error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Raiffeisenbank API Webhook Endpoint (ready for future direct automated bank reconciliation)
app.post('/api/payments/webhook', async (req, res) => {
  try {
    console.log('[Bank Webhook received]:', req.body);
    const { variableSymbol, amount, currency } = req.body;
    
    if (variableSymbol) {
      // 1. Try matching school registrations
      const [schoolRows] = await pool.query(
        'SELECT id, parentEmail, childName FROM school_registrations WHERE variableSymbol = ? OR id = ? OR childRodneCislo LIKE ?',
        [variableSymbol, variableSymbol, `%${variableSymbol}%`]
      );
      if ((schoolRows as any[]).length > 0) {
        const reg = (schoolRows as any[])[0];
        await pool.query('UPDATE school_registrations SET status = "approved" WHERE id = ?', [reg.id]);
        console.log(`[Bank Auto-Match] School registration ${reg.id} approved`);
      }

      // 2. Try matching camp registrations
      const [campRows] = await pool.query(
        'SELECT id, parentEmail, childName FROM registrations WHERE variableSymbol = ? OR id = ?',
        [variableSymbol, variableSymbol]
      );
      if ((campRows as any[]).length > 0) {
        const reg = (campRows as any[])[0];
        await pool.query('UPDATE registrations SET status = "approved" WHERE id = ?', [reg.id]);
        console.log(`[Bank Auto-Match] Camp registration ${reg.id} approved`);
      }

      // 3. Try matching merch orders
      const [merchRows] = await pool.query(
        'SELECT id, userEmail, productName FROM merch_orders WHERE variableSymbol = ?',
        [variableSymbol]
      );
      if ((merchRows as any[]).length > 0) {
        const order = (merchRows as any[])[0];
        await pool.query('UPDATE merch_orders SET status = "paid" WHERE id = ?', [order.id]);
        console.log(`[Bank Auto-Match] Merch order ${order.id} paid`);
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: 'Webhook processing error' });
  }
});

// ==========================================
// Raiffeisenbank Premium API Endpoints
// ==========================================

// Get RB connection status & configuration (sensitive values masked)
app.get('/api/rb/status', async (req, res) => {
  try {
    const config = await getRbConfig();
    const [settingsRows] = await pool.query('SELECT rbLastSync, rbSyncStatus FROM settings WHERE id = 1');
    const settings = (settingsRows as any[])[0] || {};
    const [countRows] = await pool.query('SELECT COUNT(*) as count FROM bank_payments_log');
    const matchedCount = (countRows as any[])[0]?.count || 0;

    res.json({
      clientId: config.clientId ? `${config.clientId.slice(0, 4)}...${config.clientId.slice(-4)}` : '',
      rawClientId: config.clientId || '',
      hasClientSecret: Boolean(config.clientSecret),
      clientSecret: config.clientSecret ? `${config.clientSecret.slice(0, 3)}...${config.clientSecret.slice(-3)}` : '',
      rawClientSecret: config.clientSecret || '',
      accountNumber: config.accountNumber,
      hasCert: config.hasCert,
      certSource: config.certSource,
      certFilename: config.certFilename,
      hasPassword: Boolean(config.certPassword),
      lastSync: settings.rbLastSync || null,
      syncStatus: settings.rbSyncStatus || 'Dosud nespuštěno',
      matchedPaymentsCount: matchedCount
    });
  } catch (err: any) {
    console.error('RB status error:', err);
    res.status(500).json({ error: 'Chyba při načítání stavu RB API' });
  }
});

// Update RB settings & upload certificate
app.post('/api/rb/config', upload.single('certFile'), async (req, res) => {
  try {
    const { clientId, clientSecret, accountNumber, certPassword, certBase64 } = req.body;
    let certFilename = '';

    if (req.file) {
      certFilename = req.file.filename;
      try {
        fs.copyFileSync(req.file.path, path.join(__dirname, 'uploads', 'rb_cert.p12'));
      } catch (e) {}
    } else if (certBase64 && typeof certBase64 === 'string' && certBase64.length > 50) {
      const buffer = Buffer.from(certBase64.replace(/\s+/g, ''), 'base64');
      const targetPath = path.join(__dirname, 'uploads', 'rb_cert.p12');
      fs.writeFileSync(targetPath, buffer);
      certFilename = 'rb_cert.p12';
    }

    const updates: any = {};
    if (clientId !== undefined) updates.rbClientId = clientId.trim();
    if (clientSecret !== undefined) updates.rbClientSecret = clientSecret.trim();
    if (accountNumber !== undefined) updates.rbAccountNumber = accountNumber.trim().replace(/\D/g, '');
    if (certPassword !== undefined) updates.rbCertPassword = certPassword;
    if (certFilename) updates.rbCertFilename = certFilename;

    if (Object.keys(updates).length > 0) {
      await pool.query('UPDATE settings SET ? WHERE id = 1', [updates]);
    }

    res.json({ success: true, message: 'Nastavení Raiffeisenbank API bylo uloženo.' });
  } catch (err: any) {
    console.error('Save RB config error:', err);
    res.status(500).json({ error: 'Chyba při ukládání nastavení: ' + err.message });
  }
});

// Test connection to RB API
app.post('/api/rb/test', async (req, res) => {
  try {
    const result = await testRbConnection();
    res.json(result);
  } catch (err: any) {
    console.error('Test RB error:', err);
    res.status(500).json({ success: false, message: 'Chyba při testu: ' + err.message });
  }
});

// Trigger manual payments sync
app.post('/api/rb/sync', async (req, res) => {
  try {
    const result = await syncRbPayments(sendEmail);
    res.json(result);
  } catch (err: any) {
    console.error('Sync RB error:', err);
    res.status(500).json({ success: false, message: 'Chyba při synchronizaci: ' + err.message });
  }
});

// Get bank payments log
app.get('/api/rb/logs', async (req, res) => {
  try {
    const logs = await getRbLogs(100);
    res.json(logs);
  } catch (err: any) {
    console.error('RB logs error:', err);
    res.status(500).json({ error: 'Chyba při načítání historie plateb' });
  }
});

// Simulate or manually test a single bank payment reconciliation
app.post('/api/rb/simulate-payment', async (req, res) => {
  try {
    const { variableSymbol, amount, senderName, message } = req.body;
    const result = await processSinglePayment({
      variableSymbol,
      amount: Number(amount) || 0,
      senderName: senderName || 'Testovací plátce',
      message: message || ''
    }, sendEmail);
    res.json(result);
  } catch (err: any) {
    console.error('Simulate payment error:', err);
    res.status(500).json({ success: false, message: 'Chyba při simulaci platby: ' + err.message });
  }
});

// Background periodic sync with Raiffeisenbank API every 15 minutes
setInterval(async () => {
  try {
    const config = await getRbConfig();
    if (config.clientId && config.hasCert && config.certPassword) {
      console.log('[Background Task] Periodická kontrola plateb Raiffeisenbank...');
      await syncRbPayments(sendEmail);
    }
  } catch (e: any) {
    console.error('[Background Task RB Sync Error]:', e.message);
  }
}, 15 * 60 * 1000);

// Initial check 10 seconds after server start
setTimeout(async () => {
  try {
    const config = await getRbConfig();
    if (config.clientId && config.hasCert && config.certPassword) {
      console.log('[Startup Task] Počáteční kontrola plateb Raiffeisenbank...');
      await syncRbPayments(sendEmail);
    }
  } catch (e) {}
}, 10000);


// ==========================================
// 1. Password Reset (Forgot Password) Endpoints
// ==========================================

// Request 6-digit verification code (valid for 10 minutes)
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Zadejte prosím platný e-mail.' });
    }
    const normalizedEmail = email.trim().toLowerCase();

    // Verify that the email exists in school_registrations, registrations, or users
    const [schoolRows] = await pool.query('SELECT parentName FROM school_registrations WHERE LOWER(parentEmail) = ? LIMIT 1', [normalizedEmail]);
    const [campRows] = await pool.query('SELECT parentName FROM registrations WHERE LOWER(parentEmail) = ? LIMIT 1', [normalizedEmail]);
    const [userRows] = await pool.query('SELECT name FROM users WHERE LOWER(username) = ? LIMIT 1', [normalizedEmail]);

    if ((schoolRows as any[]).length === 0 && (campRows as any[]).length === 0 && (userRows as any[]).length === 0) {
      return res.status(404).json({ error: 'Zadaný e-mail nebyl v našem systému nalezen. Zkontrolujte prosím správnost e-mailové adresy.' });
    }

    // Generate random 6-digit numeric verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // Expiration: exactly 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Invalidate any older unused codes for this email
    await pool.query('UPDATE password_resets SET used = TRUE WHERE LOWER(email) = ?', [normalizedEmail]);

    // Insert new reset record in MySQL
    await pool.query('INSERT INTO password_resets (email, code, expiresAt) VALUES (?, ?, ?)', [normalizedEmail, code, expiresAt]);
    console.log(`[PASSWORD RESET] Code generated for ${normalizedEmail}: ${code} (expires in 10 minutes)`);

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
        <div style="background-color: #002B49; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Olymp Dance Olomouc</h1>
          <p style="color: #93c5fd; margin: 6px 0 0 0; font-size: 14px;">Obnova zapomenutého hesla</p>
        </div>
        <div style="background-color: #ffffff; padding: 32px 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px;">Dobrý den,</p>
          <p>obdrželi jsme žádost o obnovení hesla k vašemu účtu u tanečního klubu <strong>Olymp Dance</strong>.</p>
          <p>Pro nastavení nového hesla zadejte ve formuláři tento šestimístný ověřovací kód:</p>
          
          <div style="background-color: #f8fafc; border: 2px dashed #0284c7; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
            <span style="font-size: 13px; color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;">Váš ověřovací kód</span>
            <span style="font-family: monospace, Courier, sans-serif; font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #002B49; display: inline-block;">${code}</span>
            <p style="margin: 12px 0 0 0; font-size: 13px; color: #dc2626; font-weight: bold;">
              ⏱️ Kód je platný po dobu 10 minut.
            </p>
          </div>

          <p style="font-size: 14px; color: #64748b;">
            Pokud jste o obnovu hesla nežádali, můžete tento e-mail ignorovat. Vaše stávající heslo zůstane v bezpečí a beze změny.
          </p>
          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
          <p style="font-size: 13px; color: #94a3b8; text-align: center; margin: 0;">
            Taneční klub Olymp Olomouc • info@olympdance.cz
          </p>
        </div>
      </div>
    `;

    // Send email asynchronously
    sendEmail(normalizedEmail, `Obnova hesla - Olymp Dance (${code})`, emailHtml).catch(console.error);

    res.json({ success: true, message: 'Ověřovací kód byl odeslán na váš e-mail.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Chyba serveru při odesílání kódu.' });
  }
});

// Verify 6-digit code and set new password
app.post('/api/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Vyplňte prosím všechny údaje (email, kód a nové heslo).' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();
    const password = newPassword.trim();

    if (password.length < 4) {
      return res.status(400).json({ error: 'Nové heslo musí mít alespoň 4 znaky.' });
    }

    // Find latest unused code for this email
    const [rows] = await pool.query(
      'SELECT * FROM password_resets WHERE LOWER(email) = ? AND code = ? AND used = FALSE ORDER BY id DESC LIMIT 1',
      [normalizedEmail, cleanCode]
    );

    const resetRecord = (rows as any[])[0];
    if (!resetRecord) {
      return res.status(400).json({ error: 'Zadaný ověřovací kód je neplatný nebo již byl použit.' });
    }

    // Verify 10-minute validity
    const now = new Date();
    const expiresAt = new Date(resetRecord.expiresAt);
    if (now > expiresAt) {
      return res.status(400).json({ error: 'Platnost ověřovacího kódu vypršela (kód byl platný 10 minut). Vyžádejte si prosím nový kód.' });
    }

    // Mark reset code as used in MySQL
    await pool.query('UPDATE password_resets SET used = TRUE WHERE id = ?', [resetRecord.id]);

    // Update password in school_registrations, registrations, and users tables
    await pool.query('UPDATE school_registrations SET password = ? WHERE LOWER(parentEmail) = ?', [password, normalizedEmail]);
    await pool.query('UPDATE registrations SET password = ? WHERE LOWER(parentEmail) = ?', [password, normalizedEmail]);
    await pool.query('UPDATE users SET password = ? WHERE LOWER(username) = ?', [password, normalizedEmail]);

    console.log(`[PASSWORD RESET SUCCESS] Password updated in MySQL for ${normalizedEmail}`);

    // Send confirmation email
    const confirmationHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
        <div style="background-color: #002B49; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Olymp Dance Olomouc</h1>
        </div>
        <div style="background-color: #ffffff; padding: 32px 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <h2 style="color: #16a34a; margin-top: 0;">Heslo bylo úspěšně změněno</h2>
          <p>Dobrý den,</p>
          <p>vaše heslo k účtu u <strong>Olymp Dance</strong> bylo v pořádku nastaveno. Nyní se můžete přihlásit se svým novým heslem.</p>
          <p><strong>Přihlašovací e-mail:</strong> ${normalizedEmail}</p>
          <p>Pokud jste tuto změnu neprovedli vy, neprodleně nás kontaktujte.</p>
        </div>
      </div>
    `;
    sendEmail(normalizedEmail, 'Vaše heslo bylo úspěšně změněno - Olymp Dance', confirmationHtml).catch(console.error);

    res.json({ success: true, message: 'Heslo bylo úspěšně změněno. Nyní se můžete přihlásit.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Chyba serveru při ukládání nového hesla do databáze.' });
  }
});

// ==========================================
// 2. Registrations (Camps) Endpoints
// ==========================================

app.post('/api/registrations', async (req, res) => {
  try {
    const registration = req.body;
    
    // Look up camp details first to derive specific variable symbol
    const [campRows] = await pool.query('SELECT * FROM camps WHERE id = ?', [registration.campId]);
    const camp = (campRows as any[])[0] || {};
    const campTitle = camp.title || 'Letní tábor';
    const campPrice = camp.price || 'Cena dle tábora';
    
    // Generate unique dedicated variable symbol (e.g. 262 + 6 digits)
    const baseVs = registration.variableSymbol || (camp.variableSymbol ? `${camp.variableSymbol.replace(/\D/g, '').slice(0, 4)}${Date.now().toString().slice(-5)}` : `262${Date.now().toString().slice(-6)}`);
    const variableSymbol = baseVs.replace(/\D/g, '').slice(0, 10);
    registration.variableSymbol = variableSymbol;

    const sqlRegistration = {
      ...registration,
      variableSymbol,
      createdAt: toSqlDateTime(registration.createdAt),
      documents: JSON.stringify(registration.documents || [])
    };
    await pool.query('INSERT INTO registrations SET ?', sqlRegistration);

    const numericPrice = parseInt((campPrice || '').replace(/\D/g, ''), 10) || 3500;
    const qrUrl = generateQrPaymentUrl(numericPrice, variableSymbol, `${registration.childName} ${campTitle}`);

    // Send confirmation email to parent WITH LOGIN CREDENTIALS & PAYMENT INFO & QR CODE
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
        <div style="background-color: #002B49; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Olymp Dance Olomouc</h1>
          <p style="color: #93c5fd; margin: 6px 0 0 0; font-size: 15px;">Potvrzení přihlášky na letní tábor</p>
        </div>
        <div style="background-color: #ffffff; padding: 32px 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px;">Vážený rodiči <strong>${registration.parentName}</strong>,</p>
          <p>děkujeme za přihlášení dítěte <strong>${registration.childName}</strong> na tábor <strong>${campTitle}</strong>.</p>
          
          <!-- Informace o táboře -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #002B49; font-size: 16px;">🏕️ Informace o táboře</h3>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Název tábora:</strong> ${campTitle}</p>
            ${camp.date ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Termín konání:</strong> ${camp.date}</p>` : ''}
            ${camp.location ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Místo konání:</strong> ${camp.location}</p>` : ''}
            <p style="margin: 4px 0; font-size: 14px;"><strong>Cena:</strong> <span style="color: #E30613; font-weight: bold;">${campPrice}</span></p>
          </div>

          <!-- Přihlašovací údaje -->
          <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 18px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 16px;">🔑 Vaše přihlašovací údaje do Klientského portálu</h3>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Přihlašovací e-mail:</strong> ${registration.parentEmail}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Heslo:</strong> <span style="font-family: monospace; background: #ffffff; padding: 2px 8px; border-radius: 4px; font-weight: bold; border: 1px solid #93c5fd; color: #1e40af;">${registration.password}</span></p>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #475569;">V klientském portálu můžete sledovat stav přihlášky a po schválení stáhnout potvrzení pro pojišťovnu / FKSP.</p>
          </div>

          <!-- Platební údaje -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #002B49; font-size: 16px;">💳 Platební údaje</h3>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Číslo účtu:</strong> ${BANK_DETAILS.account} (${BANK_DETAILS.bankName})</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>IBAN:</strong> ${BANK_DETAILS.ibanFormatted}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>BIC / SWIFT:</strong> ${BANK_DETAILS.bic}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Částka:</strong> <span style="color: #E30613; font-weight: bold;">${campPrice}</span></p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Variabilní symbol:</strong> <span style="font-weight: bold; color: #002B49;">${variableSymbol}</span></p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Zpráva pro příjemce:</strong> ${registration.childName} ${registration.childBirthDate || ''}</p>
          </div>

          <!-- QR Platba -->
          <div style="text-align: center; margin: 20px 0; padding: 16px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
            <p style="font-weight: bold; margin: 0 0 10px 0; color: #002B49; font-size: 15px;">📲 Rychlá platba mobilem (QR kód):</p>
            <img src="${qrUrl}" alt="QR platba" width="220" height="220" style="display: block; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 8px;" />
            <p style="font-size: 12px; color: #64748b; margin: 8px 0 0 0;">Naskenujte v aplikaci své banky (Raiffeisenbank, ČSOB, KB, Spořitelna, AirBank atd.)</p>
          </div>

          <p>Těšíme se na skvělé léto plné tance!</p>
          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
          <p style="font-size: 13px; color: #94a3b8; text-align: center; margin: 0;">
            Taneční klub Olymp Olomouc • info@olympdance.cz
          </p>
        </div>
      </div>
    `;

    // Send emails in background
    (async () => {
      try {
        await sendEmail(registration.parentEmail, `Potvrzení přihlášky na tábor (${registration.childName}) - Olymp Dance`, emailHtml);
        
        // Also notify all admin recipients
        const adminRecipients = getAdminEmails();
        const adminHtml = `
          <h2>Nová přihláška na letní tábor</h2>
          <p><strong>Dítě:</strong> ${registration.childName} (${registration.childBirthDate})</p>
          <p><strong>Tábor:</strong> ${campTitle}</p>
          <p><strong>Rodič:</strong> ${registration.parentName}</p>
          <p><strong>Email:</strong> ${registration.parentEmail}</p>
          <p><strong>Telefon:</strong> ${registration.parentPhone}</p>
          <p><strong>Vygenerované heslo:</strong> ${registration.password}</p>
          <p><strong>Variabilní symbol:</strong> ${variableSymbol}</p>
        `;
        for (const adm of adminRecipients) {
          await sendEmail(adm, `[Nová registrace Tábor] ${registration.childName} - ${campTitle}`, adminHtml);
        }
      } catch (err) {
        console.error('Failed to send camp registration email:', err);
      }
    })();

    res.json(registration);
  } catch (error) {
    console.error('Camp registration error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/registrations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (updates.documents) {
      updates.documents = typeof updates.documents === 'string' ? updates.documents : JSON.stringify(updates.documents);
    }
    
    // Check if status is being updated to 'approved'
    if (updates.status === 'approved') {
      const [rows] = await pool.query('SELECT * FROM registrations WHERE id = ?', [id]);
      const registration = (rows as any[])[0];
      if (registration && registration.status !== 'approved') {
        const [campRows] = await pool.query('SELECT title FROM camps WHERE id = ?', [registration.campId]);
        const campTitle = (campRows as any[])[0]?.title || 'Letní tábor';

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
            <div style="background-color: #002B49; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Olymp Dance Olomouc</h1>
              <p style="color: #4ade80; margin: 6px 0 0 0; font-size: 15px; font-weight: bold;">Platba přijata a přihláška schválena!</p>
            </div>
            <div style="background-color: #ffffff; padding: 32px 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="font-size: 16px;">Dobrý den, <strong>${registration.parentName}</strong>,</p>
              <p>s radostí vám potvrzujeme, že Vaše platba byla úspěšně přijata a přihláška dítěte <strong>${registration.childName}</strong> na tábor <strong>${campTitle}</strong> byla <strong>schválena</strong>.</p>
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 16px; margin: 20px 0;">
                <p style="margin: 0; color: #166534; font-weight: bold;">✅ Místo pro vaše dítě je závazně garantováno.</p>
                <p style="margin: 6px 0 0 0; font-size: 13px; color: #15803d;">V Klientském portálu si nyní můžete stáhnout oficiální Potvrzení o zaplacení a účasti pro zdravotní pojišťovnu nebo zaměstnavatele (FKSP).</p>
              </div>
              <p>Děkujeme a těšíme se na viděnou!</p>
              <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
              <p style="font-size: 13px; color: #94a3b8; text-align: center; margin: 0;">
                Taneční klub Olymp Olomouc • info@olympdance.cz
              </p>
            </div>
          </div>
        `;
        sendEmail(registration.parentEmail, `Potvrzení platby a schválení přihlášky na tábor - Olymp Dance`, emailHtml).catch(console.error);
      }
    }

    await pool.query('UPDATE registrations SET ? WHERE id = ?', [updates, id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Update camp registration error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/registrations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM registrations WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete camp registration error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// ==========================================
// 3. School Registrations (Dance Clubs) Endpoints
// ==========================================

app.post('/api/school-registrations', async (req, res) => {
  try {
    const registration = req.body;
    
    // Determine unique specific variable symbol (RC if available or 261 + 6 digits)
    const cleanRc = (registration.childRodneCislo || '').replace(/\D/g, '').slice(0, 10);
    const vs = (registration.variableSymbol || (cleanRc && cleanRc.length >= 6 ? cleanRc : '') || `261${Date.now().toString().slice(-6)}`).replace(/\D/g, '').slice(0, 10);
    registration.variableSymbol = vs;

    const sqlRegistration = {
      ...registration,
      variableSymbol: vs,
      createdAt: toSqlDateTime(registration.createdAt),
      paidUntil: registration.paidUntil ? toSqlDateTime(registration.paidUntil) : null,
      history: typeof registration.history === 'string' ? registration.history : JSON.stringify(registration.history || [])
    };
    await pool.query('INSERT INTO school_registrations SET ?', sqlRegistration);

    // Look up school details
    const [schoolRows] = await pool.query('SELECT * FROM schools WHERE id = ?', [registration.schoolId]);
    const school = (schoolRows as any[])[0] || {};
    const schoolName = school.name ? `${school.name} (${school.city})` : 'Taneční kroužek';
    const schoolPrice = school.price || 'Dle ceníku školy';
    const numericPrice = parseInt((schoolPrice || '').replace(/\D/g, ''), 10) || 1600;
    const qrUrl = generateQrPaymentUrl(numericPrice, vs, `${registration.childName} ${school.name || ''}`);

    // Send confirmation email to parent WITH LOGIN CREDENTIALS, SCHOOL SCHEDULE, RECAP & QR CODE
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
        <div style="background-color: #002B49; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Olymp Dance Olomouc</h1>
          <p style="color: #93c5fd; margin: 6px 0 0 0; font-size: 15px;">Potvrzení přihlášky do tanečního kroužku</p>
        </div>
        <div style="background-color: #ffffff; padding: 32px 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px;">Vážený rodiči <strong>${registration.parentName}</strong>,</p>
          <p>děkujeme za přihlášení dítěte <strong>${registration.childName} ${registration.childSurname || ''}</strong> do tanečního kroužku v tanečním klubu <strong>Olymp Dance</strong>.</p>
          
          <!-- Informace o kroužku a škole -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #002B49; font-size: 16px;">📍 Informace o kroužku</h3>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Škola / Místo:</strong> ${schoolName}</p>
            ${school.day ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Den tréninků:</strong> ${school.day}</p>` : ''}
            ${school.time ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Čas tréninků:</strong> ${school.time}</p>` : ''}
            <p style="margin: 4px 0; font-size: 14px;"><strong>Pololetní kurzovné:</strong> <span style="color: #E30613; font-weight: bold;">${schoolPrice}</span></p>
          </div>

          <!-- Rekapitulace údajů -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #002B49; font-size: 16px;">📋 Rekapitulace přihlášky</h3>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Dítě:</strong> ${registration.childName} ${registration.childSurname || ''}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Třída:</strong> ${registration.childClass || 'Neuvedeno'}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Datum narození / RČ:</strong> ${registration.childBirthDate || registration.childRodneCislo || 'Neuvedeno'}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Vyzvedávání z družiny:</strong> ${registration.afterSchoolClub ? 'Ano' : 'Ne'}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Zákonný zástupce:</strong> ${registration.parentName}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Telefon:</strong> ${registration.parentPhone}</p>
          </div>

          <!-- Přihlašovací údaje -->
          <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 18px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 16px;">🔑 Vaše přihlašovací údaje do Školního portálu</h3>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Přihlašovací e-mail:</strong> ${registration.parentEmail}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Heslo:</strong> <span style="font-family: monospace; background: #ffffff; padding: 3px 8px; border-radius: 4px; font-weight: bold; border: 1px solid #93c5fd; color: #1e40af;">${registration.password}</span></p>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #475569;">Ve Školním portálu můžete sledovat docházku na všech 14 lekcích, omlouvat dítě z tréninků a stáhnout potvrzení o platbě pro pojišťovnu.</p>
          </div>

          <!-- Platební údaje -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #002B49; font-size: 16px;">💳 Platební údaje (Raiffeisenbank)</h3>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Číslo účtu:</strong> ${BANK_DETAILS.account} (${BANK_DETAILS.bankName})</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>IBAN:</strong> ${BANK_DETAILS.ibanFormatted}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Částka:</strong> <span style="color: #E30613; font-weight: bold; font-size: 15px;">${schoolPrice}</span></p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Variabilní symbol:</strong> <span style="font-weight: bold; color: #002B49;">${vs}</span></p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Zpráva pro příjemce:</strong> ${registration.parentName} ${registration.childName}</p>
          </div>

          <!-- QR Platba -->
          <div style="text-align: center; margin: 20px 0; padding: 16px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
            <p style="font-weight: bold; margin: 0 0 10px 0; color: #002B49; font-size: 15px;">📲 Rychlá platba mobilem (QR kód):</p>
            <img src="${qrUrl}" alt="QR platba" width="220" height="220" style="display: block; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 8px;" />
            <p style="font-size: 12px; color: #64748b; margin: 8px 0 0 0;">Naskenujte v mobilní aplikaci své banky (Raiffeisenbank, ČSOB, KB, Spořitelna, AirBank atd.)</p>
          </div>

          <p>Těšíme se na naše taneční lekce s vaším dítětem!</p>
          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
          <p style="font-size: 13px; color: #94a3b8; text-align: center; margin: 0;">
            Taneční klub Olymp Olomouc • info@olympdance.cz
          </p>
        </div>
      </div>
    `;

    // Send emails in background
    (async () => {
      try {
        await sendEmail(registration.parentEmail, `Potvrzení přihlášky do tanečního kroužku (${registration.childName}) - Olymp Dance`, emailHtml);
        
        // Also notify all admin recipients
        const adminRecipients = getAdminEmails();
        const adminHtml = `
          <h2>Nová přihláška do tanečního kroužku</h2>
          <p><strong>Dítě:</strong> ${registration.childName} ${registration.childSurname || ''} (${registration.childClass || 'Třída neuvedena'})</p>
          <p><strong>Škola:</strong> ${schoolName}</p>
          <p><strong>Den a čas:</strong> ${school.day || ''} ${school.time || ''}</p>
          <p><strong>Vyzvedávání z družiny:</strong> ${registration.afterSchoolClub ? 'Ano' : 'Ne'}</p>
          <p><strong>Rodič:</strong> ${registration.parentName}</p>
          <p><strong>Email:</strong> ${registration.parentEmail}</p>
          <p><strong>Telefon:</strong> ${registration.parentPhone}</p>
          <p><strong>Vygenerované heslo:</strong> ${registration.password}</p>
          <p><strong>Variabilní symbol:</strong> ${vs}</p>
        `;
        for (const adm of adminRecipients) {
          await sendEmail(adm, `[Nová registrace Kroužek] ${registration.childName} - ${schoolName}`, adminHtml);
        }
      } catch (err) {
        console.error('Failed to send school registration email:', err);
      }
    })();

    res.json(registration);
  } catch (error) {
    console.error('School registration error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/school-registrations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (updates.history) {
      updates.history = typeof updates.history === 'string' ? updates.history : JSON.stringify(updates.history);
    }

    // Check if status is being updated to 'approved'
    if (updates.status === 'approved') {
      const [rows] = await pool.query('SELECT * FROM school_registrations WHERE id = ?', [id]);
      const registration = (rows as any[])[0];
      if (registration && registration.status !== 'approved') {
        const [schoolRows] = await pool.query('SELECT name, city FROM schools WHERE id = ?', [registration.schoolId]);
        const school = (schoolRows as any[])[0];
        const schoolName = school ? `${school.name} (${school.city})` : 'Taneční kroužek';

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
            <div style="background-color: #002B49; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Olymp Dance Olomouc</h1>
              <p style="color: #4ade80; margin: 6px 0 0 0; font-size: 15px; font-weight: bold;">Platba přijata a přihláška schválena!</p>
            </div>
            <div style="background-color: #ffffff; padding: 32px 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="font-size: 16px;">Dobrý den, <strong>${registration.parentName}</strong>,</p>
              <p>s radostí vám potvrzujeme, že Vaše platba za taneční kroužek byla úspěšně přijata a přihláška dítěte <strong>${registration.childName}</strong> na škole <strong>${schoolName}</strong> byla <strong>schválena</strong>.</p>
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 16px; margin: 20px 0;">
                <p style="margin: 0; color: #166534; font-weight: bold;">✅ Přihláška je oficiálně potvrzena.</p>
                <p style="margin: 6px 0 0 0; font-size: 13px; color: #15803d;">V portálu můžete kdykoliv sledovat zapsanou docházku z tréninků, omlouvat nepřítomnost a stáhnout si potvrzení pro pojišťovnu.</p>
              </div>
              <p>Děkujeme a těšíme se na trénincích!</p>
              <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
              <p style="font-size: 13px; color: #94a3b8; text-align: center; margin: 0;">
                Taneční klub Olymp Olomouc • info@olympdance.cz
              </p>
            </div>
          </div>
        `;
        sendEmail(registration.parentEmail, `Platba přijata a přihláška do kroužku schválena - Olymp Dance`, emailHtml).catch(console.error);
      }
    }

    await pool.query('UPDATE school_registrations SET ? WHERE id = ?', [updates, id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Update school registration error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/school-registrations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM school_registrations WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete school registration error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Contact message endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, phone, email, topic, message } = req.body;
    const adminRecipients = getAdminEmails();
    
    const html = `
      <h2>Nová zpráva z webu Olymp Dance</h2>
      <p><strong>Jméno:</strong> ${name}</p>
      <p><strong>Telefon:</strong> ${phone || 'Neuvedeno'}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Téma / Škola:</strong> ${topic || 'Obecný dotaz'}</p>
      <p><strong>Zpráva:</strong></p>
      <p style="white-space: pre-wrap; background: #f8fafc; padding: 12px; border-radius: 8px;">${message}</p>
      <p style="font-size: 12px; color: #64748b;">Čas: ${new Date().toLocaleString('cs-CZ')}</p>
    `;
    
    for (const adm of adminRecipients) {
      await sendEmail(adm, `Nová zpráva z webu: ${name} (${topic || 'Kontakt'})`, html);
    }

    // Auto-reply confirmation to sender if email provided
    if (email && email.includes('@')) {
      const userReplyHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
          <div style="background-color: #002B49; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Olymp Dance Olomouc</h1>
            <p style="color: #93c5fd; margin: 6px 0 0 0; font-size: 15px;">Děkujeme za Vaši zprávu</p>
          </div>
          <div style="background-color: #ffffff; padding: 32px 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px;">Dobrý den, <strong>${name}</strong>,</p>
            <p>děkujeme za kontaktování tanečního klubu <strong>Olymp Dance</strong>. Vaši zprávu jsme v pořádku přijali a co nejdříve se Vám ozveme zpět.</p>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin: 20px 0;">
              <p style="margin: 0; font-size: 13px; color: #64748b;"><strong>Předmět:</strong> ${topic || 'Obecný dotaz'}</p>
              <p style="margin: 8px 0 0 0; font-size: 14px; white-space: pre-wrap;">${message}</p>
            </div>
            <p style="font-size: 14px; color: #475569;">V případě naléhavých dotazů nám můžete také zavolat na tel.: <strong>+420 774 227 197</strong>.</p>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
            <p style="font-size: 13px; color: #94a3b8; text-align: center; margin: 0;">
              Taneční klub Olymp Olomouc • info@olympdance.cz
            </p>
          </div>
        </div>
      `;
      sendEmail(email, `Potvrzení přijetí zprávy - Olymp Dance`, userReplyHtml).catch(console.error);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Contact email error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Users
app.post('/api/users', async (req, res) => {
  try {
    const user = req.body;
    const formattedUser = {
      ...user,
      schoolIds: Array.isArray(user.schoolIds) ? JSON.stringify(user.schoolIds) : (user.schoolIds || null),
      schoolId: user.schoolId || (Array.isArray(user.schoolIds) && user.schoolIds[0] ? user.schoolIds[0] : null)
    };
    await pool.query('INSERT INTO users SET ?', formattedUser);
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const formattedUpdates = {
      ...updates
    };
    if (updates.schoolIds !== undefined) {
      formattedUpdates.schoolIds = Array.isArray(updates.schoolIds) ? JSON.stringify(updates.schoolIds) : (updates.schoolIds || null);
      if (Array.isArray(updates.schoolIds) && updates.schoolIds[0]) {
        formattedUpdates.schoolId = updates.schoolIds[0];
      }
    }
    await pool.query('UPDATE users SET ? WHERE id = ?', [formattedUpdates, id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Excuses
app.post('/api/excuses', async (req, res) => {
  try {
    const excuse = req.body;
    await pool.query('INSERT INTO excuses SET ?', excuse);
    res.json(excuse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/excuses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM excuses WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Attendance
app.post('/api/attendance', async (req, res) => {
  try {
    const attendance = req.body;
    const recordsStr = typeof attendance.records === 'string' ? attendance.records : JSON.stringify(attendance.records || {});
    await pool.query(
      'INSERT INTO attendance (id, schoolId, date, records) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE records = VALUES(records)',
      [attendance.id, attendance.schoolId, attendance.date, recordsStr]
    );
    res.json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/attendance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (updates.records) {
      updates.records = typeof updates.records === 'string' ? updates.records : JSON.stringify(updates.records);
    }
    await pool.query('UPDATE attendance SET ? WHERE id = ?', [updates, id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Products
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = req.body;
    const sqlProduct = { ...product };
    if (product.sizes) {
      sqlProduct.sizes = typeof product.sizes === 'string' ? product.sizes : JSON.stringify(product.sizes);
    }
    await pool.query('UPDATE products SET ? WHERE id = ?', [sqlProduct, id]);
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Settings endpoints with no-cache and immediate database sync
app.get('/api/settings', async (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  try {
    const [settings] = await pool.query('SELECT * FROM settings WHERE id = 1');
    const current = (settings as any[])[0] || {};
    res.json({
      isMerchEnabled: current.isMerchEnabled === undefined ? true : Boolean(current.isMerchEnabled),
      isTanecniExpresEnabled: current.isTanecniExpresEnabled === undefined ? true : Boolean(current.isTanecniExpresEnabled),
      isCampsEnabled: current.isCampsEnabled === undefined ? true : Boolean(current.isCampsEnabled),
      isGalleryEnabled: current.isGalleryEnabled === undefined ? true : Boolean(current.isGalleryEnabled),
      isAboutEnabled: current.isAboutEnabled === undefined ? true : Boolean(current.isAboutEnabled),
      campGeneralInfo: current.campGeneralInfo || '',
      siteContent: typeof current.siteContent === 'string' ? JSON.parse(current.siteContent) : (current.siteContent || {})
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const { isMerchEnabled, isTanecniExpresEnabled, isCampsEnabled, isGalleryEnabled, isAboutEnabled, campGeneralInfo, siteContent } = req.body;
    const updates: any = {};
    if (isMerchEnabled !== undefined) updates.isMerchEnabled = isMerchEnabled ? 1 : 0;
    if (isTanecniExpresEnabled !== undefined) updates.isTanecniExpresEnabled = isTanecniExpresEnabled ? 1 : 0;
    if (isCampsEnabled !== undefined) updates.isCampsEnabled = isCampsEnabled ? 1 : 0;
    if (isGalleryEnabled !== undefined) updates.isGalleryEnabled = isGalleryEnabled ? 1 : 0;
    if (isAboutEnabled !== undefined) updates.isAboutEnabled = isAboutEnabled ? 1 : 0;
    if (campGeneralInfo !== undefined) updates.campGeneralInfo = campGeneralInfo;
    if (siteContent !== undefined) updates.siteContent = typeof siteContent === 'object' ? JSON.stringify(siteContent) : siteContent;
    
    if (Object.keys(updates).length > 0) {
      await pool.query('UPDATE settings SET ? WHERE id = 1', updates);
    }

    const [settings] = await pool.query('SELECT * FROM settings WHERE id = 1');
    const current = (settings as any[])[0] || {};
    res.json({
      success: true,
      settings: {
        isMerchEnabled: current.isMerchEnabled === undefined ? true : Boolean(current.isMerchEnabled),
        isTanecniExpresEnabled: current.isTanecniExpresEnabled === undefined ? true : Boolean(current.isTanecniExpresEnabled),
        isCampsEnabled: current.isCampsEnabled === undefined ? true : Boolean(current.isCampsEnabled),
        isGalleryEnabled: current.isGalleryEnabled === undefined ? true : Boolean(current.isGalleryEnabled),
        isAboutEnabled: current.isAboutEnabled === undefined ? true : Boolean(current.isAboutEnabled),
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Legacy generic sync endpoint
app.post('/api/data', async (req, res) => {
  res.status(501).json({ error: 'Please use granular endpoints' });
});

// Helper to fetch global settings payload for HTML injection
async function getGlobalSettingsPayload() {
  try {
    const [settings] = await pool.query('SELECT * FROM settings WHERE id = 1');
    const current = (settings as any[])[0] || {};
    return {
      isMerchEnabled: current.isMerchEnabled === undefined ? true : Boolean(current.isMerchEnabled),
      isTanecniExpresEnabled: current.isTanecniExpresEnabled === undefined ? true : Boolean(current.isTanecniExpresEnabled),
      isCampsEnabled: current.isCampsEnabled === undefined ? true : Boolean(current.isCampsEnabled),
      isGalleryEnabled: current.isGalleryEnabled === undefined ? true : Boolean(current.isGalleryEnabled),
      isAboutEnabled: current.isAboutEnabled === undefined ? true : Boolean(current.isAboutEnabled),
    };
  } catch (e) {
    return {
      isMerchEnabled: true,
      isTanecniExpresEnabled: true,
      isCampsEnabled: true,
      isGalleryEnabled: true,
      isAboutEnabled: true,
    };
  }
}

// Vite integration
if (process.env.NODE_ENV !== 'production') {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);
} else {
  // Serve static files in production
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));
  
  // SPA fallback with server-injected settings
  app.get('*all', async (req, res) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return res.status(404).send('Not found');
    }
    try {
      const settingsPayload = await getGlobalSettingsPayload();
      let html = await fs.readFile(path.join(distPath, 'index.html'), 'utf-8');
      const scriptTag = `<script id="olymp-global-settings">window.__OLYMP_SETTINGS__ = ${JSON.stringify(settingsPayload)};</script>`;
      html = html.replace('</head>', `${scriptTag}</head>`);
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.send(html);
    } catch {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
