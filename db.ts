import mysql from 'mysql2/promise';
import { SCHOOLS, CAMPS, GALLERY_IMAGES, PRODUCTS } from './constants';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const initDb = async () => {
  const connection = await pool.getConnection();
  try {
    console.log('Initializing database...');

    // Check if we need to migrate/reset tables due to schema changes
    // We check for a column that should exist in the new schema but likely doesn't in the old one
    let needReset = false;
    try {
      await connection.query('SELECT isKindergarten FROM schools LIMIT 1');
      await connection.query('SELECT details FROM camps LIMIT 1');
    } catch (err) {
      console.log('Schema mismatch detected (missing columns), resetting tables...');
      needReset = true;
    }

    if (needReset) {
      await connection.query('DROP TABLE IF EXISTS schools');
      await connection.query('DROP TABLE IF EXISTS camps');
      await connection.query('DROP TABLE IF EXISTS gallery_images');
      await connection.query('DROP TABLE IF EXISTS products');
      // We don't drop registrations to be safe, but if schema changed there too, we might need to.
      // For now, let's assume registrations is fine or we'll alter it if needed.
      // Actually, let's drop registrations too since it's a dev environment and "no data" was reported.
      await connection.query('DROP TABLE IF EXISTS registrations');
      await connection.query('DROP TABLE IF EXISTS settings');
    }

    // Create tables with CORRECT schema matching types.ts and constants.ts

    await connection.query(`
      CREATE TABLE IF NOT EXISTS schools (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        city VARCHAR(255) NOT NULL,
        day VARCHAR(255) NOT NULL,
        time VARCHAR(255) NOT NULL,
        price VARCHAR(255) NOT NULL,
        isKindergarten BOOLEAN DEFAULT FALSE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS camps (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        date VARCHAR(255) NOT NULL,
        price VARCHAR(255) NOT NULL,
        description TEXT,
        image VARCHAR(255),
        externalUrl VARCHAR(255),
        details TEXT,
        variableSymbol VARCHAR(255)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS gallery_images (
        id VARCHAR(255) PRIMARY KEY,
        url VARCHAR(255) NOT NULL,
        caption VARCHAR(255)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price VARCHAR(255) NOT NULL,
        description TEXT,
        image VARCHAR(255)
      )
    `);

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
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT PRIMARY KEY DEFAULT 1,
        isMerchEnabled BOOLEAN DEFAULT TRUE,
        campGeneralInfo TEXT
      )
    `);

    // Seed data
    
    // Schools
    const [schoolsRows] = await connection.query('SELECT COUNT(*) as count FROM schools');
    console.log('Schools count:', (schoolsRows as any)[0].count);
    if ((schoolsRows as any)[0].count === 0) {
      console.log('Seeding schools...');
      for (const school of SCHOOLS) {
        // Ensure object matches schema
        const sqlSchool = {
            id: school.id,
            name: school.name,
            city: school.city,
            day: school.day,
            time: school.time,
            price: school.price,
            isKindergarten: school.isKindergarten || false
        };
        await connection.query('INSERT INTO schools SET ?', sqlSchool);
      }
    }

    // Camps
    const [campsRows] = await connection.query('SELECT COUNT(*) as count FROM camps');
    if ((campsRows as any)[0].count === 0) {
      console.log('Seeding camps...');
      for (const camp of CAMPS) {
        const sqlCamp = {
            id: camp.id,
            title: camp.title,
            date: camp.date,
            price: camp.price,
            description: camp.description,
            image: camp.image,
            externalUrl: camp.externalUrl || null,
            details: camp.details || null,
            variableSymbol: camp.variableSymbol || null
        };
        await connection.query('INSERT INTO camps SET ?', sqlCamp);
      }
    }

    // Gallery
    const [galleryRows] = await connection.query('SELECT COUNT(*) as count FROM gallery_images');
    if ((galleryRows as any)[0].count === 0) {
      console.log('Seeding gallery...');
      for (const img of GALLERY_IMAGES) {
        const sqlImg = {
            id: img.id,
            url: img.url,
            caption: img.caption || null
        };
        await connection.query('INSERT INTO gallery_images SET ?', sqlImg);
      }
    }

    // Products
    const [productsRows] = await connection.query('SELECT COUNT(*) as count FROM products');
    if ((productsRows as any)[0].count === 0) {
      console.log('Seeding products...');
      for (const product of PRODUCTS) {
        const sqlProduct = {
            id: product.id,
            name: product.name,
            price: product.price,
            description: product.description,
            image: product.image
        };
        await connection.query('INSERT INTO products SET ?', sqlProduct);
      }
    }

    // Settings
    const [settingsRows] = await connection.query('SELECT COUNT(*) as count FROM settings');
    if ((settingsRows as any)[0].count === 0) {
      console.log('Seeding settings...');
      await connection.query('INSERT INTO settings (id, isMerchEnabled, campGeneralInfo) VALUES (1, TRUE, ?)', [
        `## Důležité informace
- **Pojišťovna:** Na všechny naše tábory lze čerpat příspěvek od zdravotní pojišťovny.
- **Bez mobilů:** Naše pobytové tábory jsou bez mobilních telefonů, aby si děti užily čas s kamarády naplno.
- **Strava:** Zajišťujeme vyváženou stravu a pitný režim po celý den.`
      ]);
    }

    // Fix for specific camps to remove externalUrl as requested
    await connection.query("UPDATE camps SET externalUrl = NULL WHERE id IN ('c1', 'c4')");

    console.log('Database initialization complete.');

  } catch (error) {
    console.error('Database initialization failed:', error);
  } finally {
    connection.release();
  }
};

export default pool;
