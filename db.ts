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
        image VARCHAR(500)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

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

    // ==========================================
    // 1:1 Synchronization of Static Data to MySQL
    // ==========================================

    // Schools (1:1 sync)
    for (const school of SCHOOLS) {
      await connection.query(`
        INSERT INTO schools (id, name, city, day, time, price, isKindergarten) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          name = VALUES(name),
          city = VALUES(city),
          day = VALUES(day),
          time = VALUES(time),
          price = VALUES(price),
          isKindergarten = VALUES(isKindergarten)
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
    console.log(`1:1 Synced ${SCHOOLS.length} schools into database.`);

    // Camps (1:1 sync)
    for (const camp of CAMPS) {
      await connection.query(`
        INSERT INTO camps (id, title, date, price, description, image, location, externalUrl, details, variableSymbol) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          title = VALUES(title),
          date = VALUES(date),
          price = VALUES(price),
          description = VALUES(description),
          image = VALUES(image),
          location = VALUES(location),
          externalUrl = VALUES(externalUrl),
          details = VALUES(details),
          variableSymbol = VALUES(variableSymbol)
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
    console.log(`1:1 Synced ${CAMPS.length} camps into database.`);

    // Gallery (1:1 sync)
    for (const img of GALLERY_IMAGES) {
      await connection.query(`
        INSERT INTO gallery_images (id, url, caption) 
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          url = VALUES(url),
          caption = VALUES(caption)
      `, [
        img.id,
        img.url,
        img.caption || null
      ]);
    }
    console.log(`1:1 Synced ${GALLERY_IMAGES.length} gallery images into database.`);

    // Products (1:1 sync)
    for (const product of PRODUCTS) {
      await connection.query(`
        INSERT INTO products (id, name, price, description, image) 
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          name = VALUES(name),
          price = VALUES(price),
          description = VALUES(description),
          image = VALUES(image)
      `, [
        product.id,
        product.name,
        product.price,
        product.description || '',
        product.image || ''
      ]);
    }
    console.log(`1:1 Synced ${PRODUCTS.length} products into database.`);

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

    // Users (Ensure default admin exists)
    const [usersRows] = await connection.query('SELECT COUNT(*) as count FROM users');
    if ((usersRows as any)[0].count === 0) {
      await connection.query(`
        INSERT INTO users (id, username, password, role, name) 
        VALUES (?, ?, ?, ?, ?)
      `, ['u_admin', 'admin', 'admin123', 'admin', 'Hlavní administrátor']);
      console.log('Created default admin account (admin / admin123).');
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
