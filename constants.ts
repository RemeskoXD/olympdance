import { School, Camp, GalleryImage, Product } from './types';

// Helper to calculate end time (start + 45 mins)
// Note: This is static data, in a real app this might be calculated dynamically.
// I have manually adjusted times based on "45 min" rule where applicable or kept logic consistent.

export const SCHOOLS: School[] = [
  { id: '1', name: 'ZŠ Řezníčkova', city: 'Olomouc', day: 'Pondělí', time: '14:00 - 14:45', price: '1700 Kč / pololetí' },
  { id: '2', name: 'ZŠ a MŠ Bohuňovice', city: 'Bohuňovice', day: 'Úterý', time: '13:30 - 14:15', price: '1700 Kč / pololetí', isKindergarten: true }, // Standard ZŠ price
  { id: '3', name: 'ZŠ Rooseveltova', city: 'Olomouc', day: 'Středa', time: '14:00 - 14:45', price: '1700 Kč / pololetí' },
  { id: '4', name: 'MŠ Vrbátky', city: 'Vrbátky', day: 'Čtvrtek', time: '15:00 - 15:45', price: '1550 Kč / pololetí', isKindergarten: true }, // MŠ Standard
  { id: '5', name: 'ZŠ Sv. Kopeček', city: 'Olomouc', day: 'Pátek', time: '13:00 - 13:45', price: '1700 Kč / pololetí' },
  { id: '6', name: 'ZŠ Hněvotín', city: 'Hněvotín', day: 'Pondělí', time: '13:30 - 14:15', price: '1700 Kč / pololetí' },
  { id: '7', name: 'MŠ Grygov', city: 'Grygov', day: 'Úterý', time: '15:00 - 15:45', price: '1400 Kč / pololetí', isKindergarten: true }, // Exception: 1400
  { id: '8', name: 'ZŠ Lutín', city: 'Lutín', day: 'Středa', time: '14:00 - 14:45', price: '1550 Kč / pololetí' }, // Exception: 1550
  { id: '9', name: 'ZŠ Příkazy', city: 'Příkazy', day: 'Čtvrtek', time: '13:30 - 14:15', price: '1700 Kč / pololetí' },
  { id: '10', name: 'ZŠ Stupkova', city: 'Olomouc', day: 'Pátek', time: '14:00 - 14:45', price: '1700 Kč / pololetí' },
  { id: '11', name: 'ZŠ Štěpánov', city: 'Štěpánov', day: 'Pondělí', time: '13:45 - 14:30', price: '1700 Kč / pololetí' },
  { id: '12', name: 'ZŠ Gorkého', city: 'Olomouc', day: 'Úterý', time: '14:00 - 14:45', price: '1700 Kč / pololetí' },
  { id: '13', name: 'ZŠ Rožňavská', city: 'Olomouc', day: 'Středa', time: '14:00 - 14:45', price: '1700 Kč / pololetí' },
  { id: '14', name: 'ZŠ Samotišky', city: 'Samotišky', day: 'Čtvrtek', time: '13:30 - 14:15', price: '1700 Kč / pololetí' },
  { id: '15', name: 'ZŠ Hálkova', city: 'Olomouc', day: 'Pátek', time: '13:00 - 13:45', price: '1550 Kč / pololetí' }, // Exception: 1550
  { id: '16', name: 'ZŠ E. Valenty', city: 'Prostějov', day: 'Pondělí', time: '14:00 - 14:45', price: '1700 Kč / pololetí' },
  { id: '17', name: 'U Tenisu', city: 'Přerov', day: 'Úterý', time: '15:00 - 15:45', price: '1500 Kč / pololetí' }, // Exception: 1500
  { id: '18', name: 'ZŠ Dr. Horáka', city: 'Prostějov', day: 'Středa', time: '14:00 - 14:45', price: '1600 Kč / pololetí' }, // Exception: 1600
  { id: '19', name: 'ZŠ Melantrichova', city: 'Prostějov', day: 'Čtvrtek', time: '13:30 - 14:15', price: '1700 Kč / pololetí' },
  { id: '20', name: 'ZŠ Palackého', city: 'Prostějov', day: 'Pátek', time: '13:00 - 13:45', price: '1700 Kč / pololetí' },
  { id: '21', name: 'ZŠ Protivanov', city: 'Protivanov', day: 'Pondělí', time: '13:30 - 14:15', price: '1600 Kč / pololetí' }, // Exception: 1600
  { id: '22', name: 'ZŠ Majakovského', city: 'Prostějov', day: 'Úterý', time: '14:00 - 14:45', price: '1700 Kč / pololetí' },
  { id: '23', name: 'ZŠ Troubky', city: 'Troubky', day: 'Středa', time: '13:45 - 14:30', price: '1500 Kč / pololetí' }, // Exception: 1500
  { id: '24', name: 'ZŠ Plumlov', city: 'Plumlov', day: 'Čtvrtek', time: '13:30 - 14:15', price: '1700 Kč / pololetí' },
  { id: '25', name: 'MŠ Přáslavice', city: 'Přáslavice', day: 'Čtvrtek', time: '15:00 - 15:45', price: '1700 Kč / pololetí', isKindergarten: true }, 
  // Split Olšany
  { id: '26', name: 'ZŠ Olšany', city: 'Olšany u Pv', day: 'Pondělí', time: '13:30 - 14:15', price: '1500 Kč / pololetí' }, 
  { id: '26b', name: 'MŠ Olšany', city: 'Olšany u Pv', day: 'Pondělí', time: '14:30 - 15:15', price: '1500 Kč / pololetí', isKindergarten: true }, 
  { id: '27', name: 'ZŠ Tererovo nám.', city: 'Olomouc', day: 'Úterý', time: '14:00 - 14:45', price: '1700 Kč / pololetí' },
  { id: '28', name: 'ZŠ Holečkova', city: 'Olomouc', day: 'Středa', time: '14:00 - 14:45', price: '1700 Kč / pololetí' },
  { id: '29', name: 'ZŠ Spojenců', city: 'Olomouc', day: 'Čtvrtek', time: '15:00 - 15:45', price: '1700 Kč / pololetí' },
  { id: '30', name: 'MŠ Aurora', city: 'Olomouc', day: 'Pátek', time: '10:00 - 10:45', price: '1550 Kč / pololetí', isKindergarten: true }, // MŠ Standard
];

export const CAMPS: Camp[] = [
  {
    id: 'c2',
    title: 'Letní příměstský CAMP - Prostějov',
    date: '13.7. - 17.7. 2026',
    price: '3 890 Kč',
    description: 'Příměstský tábor v Prostějově plný tance pro všechny věkové kategorie.',
    image: 'https://static.wixstatic.com/media/93005c_7b35dfc300bf43649d7ae8b5fbb3fbb1~mv2.png/v1/fill/w_308,h_231,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/IMG_6247%202_HEIC.png'
  },
  {
    id: 'c1',
    title: 'Letní pobytový CAMP - Bílá (1. turnus)',
    date: '19.7. - 24.7. 2026',
    price: '5 990 Kč',
    description: 'Bílá, 1. turnus. Týden plný tance, her a zábavy v krásném prostředí Beskyd.',
    image: 'https://static.wixstatic.com/media/93005c_5baa5ec580a946b0bbdc5c0b06ae0c8b~mv2.jpeg/v1/fill/w_308,h_231,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/IMG_8522.jpeg'
  },
  {
    id: 'c3',
    title: 'Letní příměstský CAMP - Olomouc',
    date: '20.7. - 24.7. 2026',
    price: '3 990 Kč',
    description: 'Intenzivní taneční průprava, moderní styly a zábava přímo v Olomouci.',
    image: 'https://static.wixstatic.com/media/93005c_e279092e065b4500ba586ef831cd966e~mv2.png/v1/fill/w_308,h_231,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/93005c_e279092e065b4500ba586ef831cd966e~mv2.png'
  },
  {
    id: 'c4',
    title: 'Letní pobytový CAMP - Bílá (2. turnus)',
    date: '23.8. - 28.8. 2026',
    price: '5 990 Kč',
    description: 'Bílá, 2. turnus. Zakončení prázdnin tancem a pohybem v přírodě.',
    image: 'https://static.wixstatic.com/media/93005c_c0f4a6edf5834e4eb2abdd3210aade89~mv2.png/v1/fill/w_308,h_231,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/IMG_0059_HEIC.png'
  }
];

export const GALLERY_IMAGES: GalleryImage[] = [
  // New images from Prostejov
  { id: 'gp1', url: "https://web2.itnahodinu.cz/olympdance/prostejov/img_08_optimized.02.25_00016.jpg" },
  { id: 'gp2', url: "https://web2.itnahodinu.cz/olympdance/prostejov/img_08_optimized.02.25_00030.jpg" },
  { id: 'gp3', url: "https://web2.itnahodinu.cz/olympdance/prostejov/img_08_optimized.02.25_00049.jpg" },
  { id: 'gp4', url: "https://web2.itnahodinu.cz/olympdance/prostejov/img_14_optimized.02.25_00001.jpg" },
  { id: 'gp5', url: "https://web2.itnahodinu.cz/olympdance/prostejov/img_14_optimized.02.25_00014.jpg" },
  { id: 'gp6', url: "https://web2.itnahodinu.cz/olympdance/prostejov/img_14_optimized.02.25_00028.jpg" },
  { id: 'gp7', url: "https://web2.itnahodinu.cz/olympdance/prostejov/img_14_optimized.02.25_00050.jpg" },
  // Existing images
  { id: 'g1', url: "https://static.wixstatic.com/media/93005c_4ab5a66bf36d4345a999b8a126bff477~mv2.jpg/v1/fill/w_1000,h_600,al_c,q_85/dance-school.jpg" },
  { id: 'g2', url: "https://static.wixstatic.com/media/93005c_573dc43953b84fde95242482a4c20b9c~mv2.jpg/v1/fill/w_1000,h_600,al_c,q_85/summer-camp.jpg" },
  { id: 'g3', url: "https://static.wixstatic.com/media/93005c_362da366b610451abefc712af9703b80~mv2.jpg/v1/fill/w_1901,h_231,al_c,q_85/banner.jpg" },
  { id: 'g4', url: "https://static.wixstatic.com/media/93005c_5baa5ec580a946b0bbdc5c0b06ae0c8b~mv2.jpeg/v1/fill/w_600,h_450,al_c,q_80/camp1.jpeg" },
  { id: 'g5', url: "https://static.wixstatic.com/media/93005c_e279092e065b4500ba586ef831cd966e~mv2.png/v1/fill/w_600,h_450,al_c,q_85/camp2.png" },
  { id: 'g6', url: "https://static.wixstatic.com/media/93005c_c0f4a6edf5834e4eb2abdd3210aade89~mv2.png/v1/fill/w_600,h_450,al_c,q_85/camp3.png" },
  { id: 'g7', url: "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=800" },
  { id: 'g8', url: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?auto=format&fit=crop&q=80&w=800" },
  { id: 'g9', url: "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&q=80&w=800" },
];

export const PRODUCTS: Product[] = [
    { 
        id: 'p1', 
        name: 'Taneční tričko Olymp 2026', 
        price: '350 Kč', 
        description: 'Kvalitní bavlněné tričko s logem pro tréninky i volný čas.', 
        image: 'https://web2.itnahodinu.cz/olympdance/dscf0013-enhanced-nr_optimized.webp' 
    },
    { 
        id: 'p2', 
        name: 'Mikina s kapucí', 
        price: '890 Kč', 
        description: 'Hřejivá mikina, která tě udrží v teple po každém tréninku.', 
        image: 'https://web2.itnahodinu.cz/olympdance/dscf0040-enhanced-nr_optimized.webp' 
    },
    { 
        id: 'p3', 
        name: 'Taneční batoh', 
        price: '650 Kč', 
        description: 'Stylový batoh na taneční boty a oblečení.', 
        image: 'https://web2.itnahodinu.cz/olympdance/dscf0483-enhanced-nr_optimized.webp' 
    },
    { 
        id: 'p4', 
        name: 'Sportovní láhev', 
        price: '250 Kč', 
        description: 'Dodržuj pitný režim stylově s naší týmovou lahví.', 
        image: 'https://web2.itnahodinu.cz/olympdance/dscf0221-enhanced-nr_optimized (1).jpg' 
    },
    { 
        id: 'p5', 
        name: 'Kšiltovka Snapback', 
        price: '450 Kč', 
        description: 'Street dance styl pro každého tanečníka.', 
        image: 'https://web2.itnahodinu.cz/olympdance/dscf0192-enhanced-nr_optimized (1).jpg' 
    },
    { 
        id: 'p6', 
        name: 'Týmová souprava', 
        price: '1200 Kč', 
        description: 'Kompletní souprava na soutěže a vystoupení.', 
        image: 'https://web2.itnahodinu.cz/olympdance/dscf0499-enhanced-nr_optimized (1).jpg' 
    },
];

export const CONTACT_INFO = {
  name: "Taneční klub Olymp Olomouc, z. s.",
  address: "ZŠ Holečkova 10, 779 00, Olomouc",
  ico: "68347286",
  email: "info@olympdance.cz",
  phone: "+420 722 017 700"
};