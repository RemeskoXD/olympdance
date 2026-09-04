import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import pool, { initDb, isDbConfigured } from './db.ts';
import { SCHOOLS, CAMPS, GALLERY_IMAGES, PRODUCTS } from './constants.ts';

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

// Serve uploads
app.use('/uploads', express.static(UPLOADS_DIR));

// Data endpoints
app.get('/api/data', async (req, res) => {
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

    // Parse fields
    const parsedSchools = (schools as any[]).map(s => ({
      ...s,
      isKindergarten: Boolean(s.isKindergarten)
    }));

    const parsedProducts = (products as any[]).map(p => ({
      ...p,
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
      isMerchEnabled: currentSettings.isMerchEnabled === undefined ? true : Boolean(currentSettings.isMerchEnabled),
      isTanecniExpresEnabled: currentSettings.isTanecniExpresEnabled === undefined ? true : Boolean(currentSettings.isTanecniExpresEnabled),
      isCampsEnabled: currentSettings.isCampsEnabled === undefined ? true : Boolean(currentSettings.isCampsEnabled),
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
    const school = req.body;
    await pool.query('INSERT INTO schools SET ?', school);
    res.json(school);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/schools/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const school = req.body;
    await pool.query('UPDATE schools SET ? WHERE id = ?', [school, id]);
    res.json(school);
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
    const sqlProduct = {
      ...product,
      sizes: JSON.stringify(product.sizes)
    };
    await pool.query('INSERT INTO products SET ?', sqlProduct);
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

import nodemailer from 'nodemailer';

// ... (existing imports)

// Email Transporter (configure with env vars)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Helper to send email
const sendEmail = async (to: string, subject: string, html: string) => {
  if (!process.env.SMTP_USER) {
    console.log('SMTP not configured, skipping email:', { to, subject });
    return;
  }
  try {
    await transporter.sendMail({
      from: `"Olymp Dance" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log('Email sent to:', to);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// ... (existing code)

// Registrations
app.post('/api/registrations', async (req, res) => {
  try {
    const registration = req.body;
    // Stringify documents for SQL
    const sqlRegistration = {
      ...registration,
      documents: JSON.stringify(registration.documents)
    };
    await pool.query('INSERT INTO registrations SET ?', sqlRegistration);

    // Send confirmation email
    const emailHtml = `
      <h1>Potvrzení registrace</h1>
      <p>Dobrý den,</p>
      <p>děkujeme za registraci na tábor.</p>
      <p><strong>Jméno dítěte:</strong> ${registration.childName}</p>
      <p><strong>Datum narození:</strong> ${registration.childBirthDate}</p>
      <p><strong>Rodič:</strong> ${registration.parentName}</p>
      <p><strong>Heslo do portálu:</strong> ${registration.password}</p>
      <p>Další informace naleznete v klientském portálu.</p>
      <p>S pozdravem,<br>Tým Olymp Dance</p>
    `;
    
    // Send emails in background (fire and forget) with extra safety
    (async () => {
      try {
        await sendEmail(registration.parentEmail, 'Potvrzení registrace - Olymp Dance', emailHtml);
        
        // Send notification to admin (if configured)
        if (process.env.ADMIN_EMAIL) {
            await sendEmail(process.env.ADMIN_EMAIL, 'Nová registrace na tábor', `
                <h1>Nová registrace</h1>
                <p>Jméno: ${registration.childName}</p>
                <p>Rodič: ${registration.parentName}</p>
                <p>Email: ${registration.parentEmail}</p>
            `);
        }
      } catch (emailError) {
        console.error('Failed to send background emails:', emailError);
      }
    })();

    res.json(registration);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/registrations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (updates.documents) {
      updates.documents = JSON.stringify(updates.documents);
    }
    
    // Check if status is being updated to 'approved'
    if (updates.status === 'approved') {
      const [rows] = await pool.query('SELECT * FROM registrations WHERE id = ?', [id]);
      const registration = (rows as any[])[0];
      if (registration && registration.status !== 'approved') {
        const emailHtml = `
          <h1>Potvrzení platby a schválení registrace</h1>
          <p>Dobrý den, ${registration.parentName},</p>
          <p>Vaše platba byla úspěšně přijata a registrace dítěte <strong>${registration.childName}</strong> na tábor byla schválena.</p>
          <p>Děkujeme a těšíme se!</p>
          <p>S pozdravem,<br>Tým Olymp Dance</p>
        `;
        sendEmail(registration.parentEmail, 'Platba přijata - Olymp Dance', emailHtml).catch(console.error);
      }
    }

    await pool.query('UPDATE registrations SET ? WHERE id = ?', [updates, id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// School Registrations
app.post('/api/school-registrations', async (req, res) => {
  try {
    const registration = req.body;
    if (registration.history) {
      registration.history = JSON.stringify(registration.history);
    }
    await pool.query('INSERT INTO school_registrations SET ?', registration);
    res.json(registration);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/school-registrations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (updates.history) {
      updates.history = JSON.stringify(updates.history);
    }

    // Check if status is being updated to 'approved'
    if (updates.status === 'approved') {
      const [rows] = await pool.query('SELECT * FROM school_registrations WHERE id = ?', [id]);
      const registration = (rows as any[])[0];
      if (registration && registration.status !== 'approved') {
        const emailHtml = `
          <h1>Potvrzení platby a schválení registrace</h1>
          <p>Dobrý den, ${registration.parentName},</p>
          <p>Vaše platba byla úspěšně přijata a registrace dítěte <strong>${registration.childName}</strong> na kroužek byla schválena.</p>
          <p>Děkujeme a těšíme se!</p>
          <p>S pozdravem,<br>Tým Olymp Dance</p>
        `;
        sendEmail(registration.parentEmail, 'Platba přijata - Olymp Dance', emailHtml).catch(console.error);
      }
    }

    await pool.query('UPDATE school_registrations SET ? WHERE id = ?', [updates, id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
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

// Attendance
app.post('/api/attendance', async (req, res) => {
  try {
    const attendance = req.body;
    const formattedAttendance = {
      ...attendance,
      records: JSON.stringify(attendance.records)
    };
    await pool.query('INSERT INTO attendance SET ?', formattedAttendance);
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
      updates.records = JSON.stringify(updates.records);
    }
    await pool.query('UPDATE attendance SET ? WHERE id = ?', [updates, id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Settings
app.post('/api/settings', async (req, res) => {
  try {
    const { isMerchEnabled, isTanecniExpresEnabled, isCampsEnabled, campGeneralInfo, siteContent } = req.body;
    const updates: any = {};
    if (isMerchEnabled !== undefined) updates.isMerchEnabled = isMerchEnabled;
    if (isTanecniExpresEnabled !== undefined) updates.isTanecniExpresEnabled = isTanecniExpresEnabled;
    if (isCampsEnabled !== undefined) updates.isCampsEnabled = isCampsEnabled;
    if (campGeneralInfo !== undefined) updates.campGeneralInfo = campGeneralInfo;
    if (siteContent !== undefined) updates.siteContent = JSON.stringify(siteContent);
    
    await pool.query('UPDATE settings SET ? WHERE id = 1', updates);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Legacy generic sync endpoint - we'll keep it for now but it won't work well with SQL
// We will rely on the frontend calling the specific endpoints.
// But wait, the frontend IS calling /api/data with POST in the previous step.
// I MUST update the frontend to call these specific endpoints.

app.post('/api/data', async (req, res) => {
  // This is a fallback if frontend sends everything. 
  // Implementing full sync logic here is complex (diffing).
  // Instead, I will update the frontend to use the granular endpoints.
  res.status(501).json({ error: 'Please use granular endpoints' });
});


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
  
  // SPA fallback
  app.get('*all', (req, res) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return res.status(404).send('Not found');
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
