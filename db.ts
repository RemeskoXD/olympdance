import mysql from 'mysql2/promise';
import { SCHOOLS, CAMPS, GALLERY_IMAGES, PRODUCTS } from './constants.ts';

function getPoolConfig() {
  const connectionUrl = 
    process.env.DATABASE_URL || 
    process.env.DB_URL || 
    process.env.MYSQL_URL || 
    process.env.CLEARDB_DATABASE_URL || 
    process.env.JAWSDB_URL;

  if (connectionUrl) {
    try {
      // Regex match to safely handle passwords with special characters (#, @, !) in URL
      const regex = /^mysql:\/\/(.*?):(.*?)@([^:/]+)(?::(\d+))?\/(.*?)(?:\?(.*))?$/;
      const match = connectionUrl.match(regex);
      if (match) {
        const host = match[3];
        const port = match[4] ? parseInt(match[4], 10) : 3306;
        const user = decodeURIComponent(match[1]);
        const password = decodeURIComponent(match[2]);
        const database = match[5]?.split('?')[0] || 'RemeskoDEV_olymp';
        console.log(`Configuring MySQL connection from URL (regex): host=${host}, user=${user}, db=${database}`);
        return {
          host,
          port,
          user,
          password,
          database,
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
          connectTimeout: 10000,
          enableKeepAlive: true,
          keepAliveInitialDelay: 10000,
          ssl: connectionUrl.includes('ssl=true') ? { rejectUnauthorized: false } : undefined
        };
      }

      const parsed = new URL(connectionUrl);
      console.log(`Configuring MySQL connection from URL: host=${parsed.hostname}, user=${parsed.username}, db=${parsed.pathname.replace(/^\//, '')}`);
      return {
        host: parsed.hostname,
        port: parsed.port ? parseInt(parsed.port, 10) : 3306,
        user: decodeURIComponent(parsed.username || ''),
        password: decodeURIComponent(parsed.password || ''),
        database: parsed.pathname ? decodeURIComponent(parsed.pathname.replace(/^\//, '')) : 'RemeskoDEV_olymp',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 10000,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
        ssl: connectionUrl.includes('ssl=true') ? { rejectUnauthorized: false } : undefined
      };
    } catch (err) {
      console.error('Failed to parse database connection URL, falling back to separate environment variables:', err);
    }
  }

  return {
    host: process.env.DB_HOST || 'databaze1.itnahodinu.cz',
    user: process.env.DB_USER || 'RemeskoDEV_olymp',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'RemeskoDEV_olymp',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
  };
}

const pool = mysql.createPool(getPoolConfig());

export const isDbConfigured = () => {
  return Boolean(
    process.env.DATABASE_URL ||
    process.env.DB_URL ||
    process.env.MYSQL_URL ||
    process.env.DB_PASSWORD ||
    (process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME)
  );
};

export const initDb = async () => {
  let connection: any = null;
  try {
    console.log('Connecting to database...');
    connection = await pool.getConnection();
    console.log('Database connected successfully. Ensuring tables and 1:1 data synchronization...');

    // 1. Schools table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS schools (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        city VARCHAR(255) NOT NULL,
        day VARCHAR(255) NOT NULL,
        time VARCHAR(255) NOT NULL,
        price VARCHAR(255) NOT NULL,
        isKindergarten BOOLEAN DEFAULT FALSE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    try {
      await connection.query('ALTER TABLE schools ADD COLUMN isKindergarten BOOLEAN DEFAULT FALSE');
    } catch (e) {}
    try {
      await connection.query('ALTER TABLE schools ADD COLUMN trainingDates TEXT');
    } catch (e) {}

    // 2. Camps table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS camps (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        date VARCHAR(255) NOT NULL,
        price VARCHAR(255) NOT NULL,
        description TEXT,
        image VARCHAR(500),
        location VARCHAR(255),
        externalUrl VARCHAR(500),
        details TEXT,
        variableSymbol VARCHAR(255)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    try {
      await connection.query('ALTER TABLE camps ADD COLUMN location VARCHAR(255)');
    } catch (e) {}
    try {
      await connection.query('ALTER TABLE camps ADD COLUMN details TEXT');
    } catch (e) {}
    try {
      await connection.query('ALTER TABLE camps ADD COLUMN variableSymbol VARCHAR(255)');
    } catch (e) {}

    // 3. Gallery images table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS gallery_images (
        id VARCHAR(255) PRIMARY KEY,
        url VARCHAR(500) NOT NULL,
        caption VARCHAR(255)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 4. Products table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price VARCHAR(255) NOT NULL,
        description TEXT,
        image VARCHAR(500),
        isAction BOOLEAN DEFAULT FALSE,
        originalPrice VARCHAR(255),
        actionBadge VARCHAR(255) DEFAULT 'AKCE',
        sizes JSON
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    try {
      await connection.query('ALTER TABLE products ADD COLUMN isAction BOOLEAN DEFAULT FALSE');
    } catch (e) {}
    try {
      await connection.query('ALTER TABLE products ADD COLUMN originalPrice VARCHAR(255)');
    } catch (e) {}
    try {
      await connection.query("ALTER TABLE products ADD COLUMN actionBadge VARCHAR(255) DEFAULT 'AKCE'");
    } catch (e) {}
    try {
      await connection.query('ALTER TABLE products ADD COLUMN sizes JSON');
    } catch (e) {}

    // 5. Camp Registrations table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id VARCHAR(255) PRIMARY KEY,
        campId VARCHAR(255) NOT NULL,
        childName VARCHAR(255) NOT NULL,
        childBirthDate VARCHAR(255) NOT NULL,
        parentName VARCHAR(255) NOT NULL,
        parentEmail VARCHAR(255) NOT NULL,
        parentPhone VARCHAR(255) NOT NULL,
        status VARCHAR(255) NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        documents JSON,
        password VARCHAR(255),
        adminNote TEXT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 6. School / Courses Registrations table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS school_registrations (
        id VARCHAR(255) PRIMARY KEY,
        schoolId VARCHAR(255) NOT NULL,
        childName VARCHAR(255) NOT NULL,
        childSurname VARCHAR(255),
        childBirthDate VARCHAR(255),
        childRodneCislo VARCHAR(255),
        childClass VARCHAR(255),
        childPhone VARCHAR(255),
        parentName VARCHAR(255) NOT NULL,
        parentEmail VARCHAR(255) NOT NULL,
        parentPhone VARCHAR(255) NOT NULL,
        parentAddress VARCHAR(255) NOT NULL DEFAULT "",
        afterSchoolClub BOOLEAN DEFAULT FALSE,
        status VARCHAR(255) NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        password VARCHAR(255),
        adminNote TEXT,
        paidUntil DATETIME,
        history JSON
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    try {
      await connection.query('ALTER TABLE school_registrations ADD COLUMN childSurname VARCHAR(255)');
    } catch (e) {}
    try {
      await connection.query('ALTER TABLE school_registrations ADD COLUMN childRodneCislo VARCHAR(255)');
    } catch (e) {}
    try {
      await connection.query('ALTER TABLE school_registrations ADD COLUMN childClass VARCHAR(255)');
    } catch (e) {}
    try {
      await connection.query('ALTER TABLE school_registrations ADD COLUMN childPhone VARCHAR(255)');
    } catch (e) {}
    try {
      await connection.query('ALTER TABLE school_registrations ADD COLUMN parentAddress VARCHAR(255) NOT NULL DEFAULT ""');
    } catch (e) {}
    try {
      await connection.query('ALTER TABLE school_registrations ADD COLUMN afterSchoolClub BOOLEAN DEFAULT FALSE');
    } catch (e) {}
    try {
      await connection.query('ALTER TABLE school_registrations ADD COLUMN history JSON');
    } catch (e) {}

    // 7. Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        schoolId VARCHAR(255),
        schoolIds JSON,
        name VARCHAR(255) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    try {
      await connection.query('ALTER TABLE users ADD COLUMN schoolIds JSON');
    } catch (e) {}

    // 8. Excuses table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS excuses (
        id VARCHAR(255) PRIMARY KEY,
        registrationId VARCHAR(255) NOT NULL,
        schoolId VARCHAR(255) NOT NULL,
        date VARCHAR(255) NOT NULL,
        reason TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 9. Attendance table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id VARCHAR(255) PRIMARY KEY,
        schoolId VARCHAR(255) NOT NULL,
        date VARCHAR(255) NOT NULL,
        records JSON
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 10. Settings table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT PRIMARY KEY DEFAULT 1,
        isMerchEnabled BOOLEAN DEFAULT TRUE,
        isTanecniExpresEnabled BOOLEAN DEFAULT TRUE,
        isCampsEnabled BOOLEAN DEFAULT TRUE,
        campGeneralInfo TEXT,
        siteContent JSON
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    try {
      await connection.query('ALTER TABLE settings ADD COLUMN isTanecniExpresEnabled BOOLEAN DEFAULT TRUE');
    } catch (e) {}
    try {
      await connection.query('ALTER TABLE settings ADD COLUMN isCampsEnabled BOOLEAN DEFAULT TRUE');
    } catch (e) {}
    try {
      await connection.query('ALTER TABLE settings ADD COLUMN siteContent JSON');
    } catch (e) {}
    try {
      await connection.query('ALTER TABLE settings ADD COLUMN rbClientId VARCHAR(255)');
    } catch (e) {}
    try {
      await connection.query('ALTER TABLE settings ADD COLUMN rbClientSecret VARCHAR(255)');
    } catch (e) {}
    try {
      await connection.query('ALTER TABLE settings ADD COLUMN rbAccountNumber VARCHAR(100) DEFAULT "1806875329"');
    } catch (e) {}
    try {
      await connection.query('UPDATE settings SET rbAccountNumber = "1806875329" WHERE rbAccountNumber = "287413002" OR rbAccountNumber IS NULL');
    } catch (e) {}
    try {
      await connection.query('ALTER TABLE settings ADD COLUMN rbCertPassword VARCHAR(255)');
    } catch (e) {}
    try {
      await connection.query('ALTER TABLE settings ADD COLUMN rbCertFilename VARCHAR(255)');
    } catch (e) {}
    try {
      await connection.query('ALTER TABLE settings ADD COLUMN rbLastSync DATETIME');
    } catch (e) {}
    try {
      await connection.query('ALTER TABLE settings ADD COLUMN rbSyncStatus TEXT');
    } catch (e) {}
    try {
      await connection.query('ALTER TABLE settings ADD COLUMN smtpUser VARCHAR(255)');
    } catch (e) {}
    try {
      await connection.query('ALTER TABLE settings ADD COLUMN smtpPass VARCHAR(255)');
    } catch (e) {}
    try {
      await connection.query('ALTER TABLE settings ADD COLUMN smtpHost VARCHAR(255)');
    } catch (e) {}
    try {
      await connection.query('ALTER TABLE settings ADD COLUMN smtpPort VARCHAR(20)');
    } catch (e) {}
    try {
      await connection.query('ALTER TABLE settings ADD COLUMN smtpSecure VARCHAR(20)');
    } catch (e) {}

    // 11. Password Resets table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(10) NOT NULL,
        expiresAt DATETIME NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email_code (email, code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 12. Merch Orders table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS merch_orders (
        id VARCHAR(255) PRIMARY KEY,
        productId VARCHAR(255) NOT NULL,
        productName VARCHAR(255) NOT NULL,
        productPrice VARCHAR(255) NOT NULL,
        size VARCHAR(50),
        quantity INT DEFAULT 1,
        totalPrice INT NOT NULL,
        userId VARCHAR(255),
        userName VARCHAR(255) NOT NULL,
        userEmail VARCHAR(255) NOT NULL,
        userPhone VARCHAR(255),
        deliveryNote TEXT,
        variableSymbol VARCHAR(50),
        status VARCHAR(50) DEFAULT 'pending',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 13. Bank Payments Log table (Raiffeisenbank automated matching history)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bank_payments_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        transactionId VARCHAR(255) NOT NULL,
        bookingDate VARCHAR(50),
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'CZK',
        variableSymbol VARCHAR(50),
        senderAccount VARCHAR(100),
        senderName VARCHAR(255),
        message TEXT,
        matchedType VARCHAR(50) DEFAULT 'unmatched',
        matchedId VARCHAR(255),
        matchedName VARCHAR(255),
        status VARCHAR(50) DEFAULT 'processed',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_tx (transactionId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 14. Uploaded files table (Durable storage in MySQL so photos/PDFs are never lost on container restart/deploy)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS uploaded_files (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        originalName VARCHAR(255) NOT NULL,
        mimeType VARCHAR(100) NOT NULL,
        size INT NOT NULL,
        data LONGBLOB NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ==========================================
    // Synchronization of Initial Static Data to MySQL (ONLY on empty database)
    // ==========================================

    // Schools: Seed initial ONLY if table is completely empty
    const [schoolsCountRow] = await connection.query('SELECT COUNT(*) as count FROM schools');
    if ((schoolsCountRow as any[])[0]?.count === 0) {
      for (const school of SCHOOLS) {
        await connection.query(`
          INSERT IGNORE INTO schools (id, name, city, day, time, price, isKindergarten) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          school.id,
          school.name,
          school.city,
          school.day,
          school.time,
          school.price,
          Boolean(school.isKindergarten)
        ]);
      }
      console.log(`Initial seed: ${SCHOOLS.length} schools inserted.`);
    }

    // Camps: Seed initial ONLY if table is completely empty
    const [campsCountRow] = await connection.query('SELECT COUNT(*) as count FROM camps');
    if ((campsCountRow as any[])[0]?.count === 0) {
      for (const camp of CAMPS) {
        await connection.query(`
          INSERT IGNORE INTO camps (id, title, date, price, description, image, location, externalUrl, details, variableSymbol) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          camp.id,
          camp.title,
          camp.date,
          camp.price,
          camp.description || '',
          camp.image || '',
          camp.location || null,
          camp.externalUrl || null,
          camp.details || null,
          camp.variableSymbol || null
        ]);
      }
      console.log(`Initial seed: ${CAMPS.length} camps inserted.`);
    }

    // Clean up any corrupt or empty entries in gallery_images
    try {
      await connection.query("DELETE FROM gallery_images WHERE id = '' OR id IS NULL OR url LIKE '%photo-test-delete%'");
    } catch (e) {}

    // Gallery: Seed initial ONLY if table is completely empty
    const [galleryCountRow] = await connection.query('SELECT COUNT(*) as count FROM gallery_images');
    if ((galleryCountRow as any[])[0]?.count === 0) {
      for (const img of GALLERY_IMAGES) {
        await connection.query(`
          INSERT IGNORE INTO gallery_images (id, url, caption) 
          VALUES (?, ?, ?)
        `, [
          img.id,
          img.url,
          img.caption || null
        ]);
      }
      console.log(`Initial seed: ${GALLERY_IMAGES.length} gallery images inserted.`);
    }

    // Products: Seed initial ONLY if table is completely empty
    const [productsCountRow] = await connection.query('SELECT COUNT(*) as count FROM products');
    if ((productsCountRow as any[])[0]?.count === 0) {
      for (const product of PRODUCTS) {
        await connection.query(`
          INSERT IGNORE INTO products (id, name, price, description, image) 
          VALUES (?, ?, ?, ?, ?)
        `, [
          product.id,
          product.name,
          product.price,
          product.description || '',
          product.image || ''
        ]);
      }
      console.log(`Initial seed: ${PRODUCTS.length} products inserted.`);
    }

    // Settings (Ensure default row id=1 exists)
    const [settingsRows] = await connection.query('SELECT COUNT(*) as count FROM settings WHERE id = 1');
    if ((settingsRows as any)[0].count === 0) {
      await connection.query(`
        INSERT INTO settings (id, isMerchEnabled, campGeneralInfo, siteContent) 
        VALUES (1, TRUE, ?, ?)
      `, [
        `## Důležité informace
- **Pojišťovna:** Na všechny naše tábory lze čerpat příspěvek od zdravotní pojišťovny.
- **Bez mobilů:** Naše pobytové tábory jsou bez mobilních telefonů, aby si děti užily čas s kamarády naplno.
- **Strava:** Zajišťujeme vyváženou stravu a pitný režim po celý den.`,
        JSON.stringify({
          heroTitle: 'Objevte pravou radost z pohybu a tance',
          heroSubtitle: 'Taneční kroužky pro děti přímo na vaší škole. Moderní styly, skvělá parta a profesionální lektoři. Přidejte se k týmu Olymp Dance!',
          aboutText: '<strong>Taneční klub Olymp Olomouc</strong> se již řadu let věnuje práci s dětmi a mládeží. Naším cílem není jen naučit děti taneční kroky, ale především v nich vybudovat <span class="text-brand-red font-bold">lásku k pohybu</span>, která jim vydrží celý život.\n\nZaměřujeme se na moderní taneční styly, disko tance a street dance. Klademe důraz na týmovou spolupráci, fair play a přátelskou atmosféru na trénincích.'
        })
      ]);
      console.log('Created initial settings record in database.');
    }

    // Users (Ensure admin Martin account exists)
    const [existingAdmin] = await connection.query('SELECT * FROM users WHERE username = ? OR username = ?', ['Martin', 'admin']);
    if ((existingAdmin as any[]).length === 0) {
      await connection.query(`
        INSERT INTO users (id, username, password, role, name) 
        VALUES (?, ?, ?, ?, ?)
      `, ['u_admin', 'Martin', '2026OLtanecjeTOP.*', 'admin', 'Martin (Hlavní administrátor)']);
      console.log('Created admin account Martin.');
    } else {
      await connection.query(
        'UPDATE users SET username = ?, password = ?, name = ? WHERE username = ? OR username = ?',
        ['Martin', '2026OLtanecjeTOP.*', 'Martin (Hlavní administrátor)', 'admin', 'Martin']
      );
    }

    console.log('MySQL Database 1:1 synchronization complete.');

  } catch (error) {
    console.warn('Database initialization warning (will run with fallback if DB is unreachable):', error);
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch (e) {}
    }
  }
};

export default pool;
