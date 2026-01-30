import { School, Camp, GalleryImage } from './types';

export const SCHOOLS: School[] = [
  { id: '1', name: 'ZŠ Řezníčkova', city: 'Olomouc', day: 'Pondělí', time: '14:00 - 15:00', price: '1800 Kč / pololetí' },
  { id: '2', name: 'ZŠ a MŠ Bohuňovice', city: 'Bohuňovice', day: 'Úterý', time: '13:30 - 14:30', price: '1800 Kč / pololetí', isKindergarten: true },
  { id: '3', name: 'ZŠ Rooseveltova', city: 'Olomouc', day: 'Středa', time: '14:00 - 15:00', price: '1800 Kč / pololetí' },
  { id: '4', name: 'MŠ Vrbátky', city: 'Vrbátky', day: 'Čtvrtek', time: '15:00 - 15:45', price: '1600 Kč / pololetí', isKindergarten: true },
  { id: '5', name: 'ZŠ Sv. Kopeček', city: 'Olomouc', day: 'Pátek', time: '13:00 - 14:00', price: '1800 Kč / pololetí' },
  { id: '6', name: 'ZŠ Hněvotín', city: 'Hněvotín', day: 'Pondělí', time: '13:30 - 14:30', price: '1800 Kč / pololetí' },
  { id: '7', name: 'MŠ Grygov', city: 'Grygov', day: 'Úterý', time: '15:00 - 15:45', price: '1600 Kč / pololetí', isKindergarten: true },
  { id: '8', name: 'ZŠ Lutín', city: 'Lutín', day: 'Středa', time: '14:00 - 15:00', price: '1800 Kč / pololetí' },
  { id: '9', name: 'ZŠ Příkazy', city: 'Příkazy', day: 'Čtvrtek', time: '13:30 - 14:30', price: '1800 Kč / pololetí' },
  { id: '10', name: 'ZŠ Stupkova', city: 'Olomouc', day: 'Pátek', time: '14:00 - 15:00', price: '1800 Kč / pololetí' },
  { id: '11', name: 'ZŠ Štěpánov', city: 'Štěpánov', day: 'Pondělí', time: '13:45 - 14:45', price: '1800 Kč / pololetí' },
  { id: '12', name: 'ZŠ Gorkého', city: 'Olomouc', day: 'Úterý', time: '14:00 - 15:00', price: '1800 Kč / pololetí' },
  { id: '13', name: 'ZŠ Rožňavská', city: 'Olomouc', day: 'Středa', time: '14:00 - 15:00', price: '1800 Kč / pololetí' },
  { id: '14', name: 'ZŠ Samotišky', city: 'Samotišky', day: 'Čtvrtek', time: '13:30 - 14:30', price: '1800 Kč / pololetí' },
  { id: '15', name: 'ZŠ Hálkova', city: 'Olomouc', day: 'Pátek', time: '13:00 - 14:00', price: '1800 Kč / pololetí' },
  { id: '16', name: 'ZŠ E. Valenty', city: 'Prostějov', day: 'Pondělí', time: '14:00 - 15:00', price: '1800 Kč / pololetí' },
  { id: '17', name: 'U Tenisu', city: 'Přerov', day: 'Úterý', time: '15:00 - 16:00', price: '1800 Kč / pololetí' },
  { id: '18', name: 'ZŠ Dr. Horáka', city: 'Prostějov', day: 'Středa', time: '14:00 - 15:00', price: '1800 Kč / pololetí' },
  { id: '19', name: 'ZŠ Melantrichova', city: 'Prostějov', day: 'Čtvrtek', time: '13:30 - 14:30', price: '1800 Kč / pololetí' },
  { id: '20', name: 'ZŠ Palackého', city: 'Prostějov', day: 'Pátek', time: '13:00 - 14:00', price: '1800 Kč / pololetí' },
  { id: '21', name: 'ZŠ Protivanov', city: 'Protivanov', day: 'Pondělí', time: '13:30 - 14:30', price: '1800 Kč / pololetí' },
  { id: '22', name: 'ZŠ Majakovského', city: 'Prostějov', day: 'Úterý', time: '14:00 - 15:00', price: '1800 Kč / pololetí' },
  { id: '23', name: 'ZŠ Troubky', city: 'Troubky', day: 'Středa', time: '13:45 - 14:45', price: '1800 Kč / pololetí' },
  { id: '24', name: 'ZŠ Plumlov', city: 'Plumlov', day: 'Čtvrtek', time: '13:30 - 14:30', price: '1800 Kč / pololetí' },
  { id: '25', name: 'ZŠ a MŠ Přáslavice', city: 'Přáslavice', day: 'Pátek', time: '13:00 - 14:00', price: '1800 Kč / pololetí', isKindergarten: true },
  { id: '26', name: 'ZŠ a MŠ Olšany', city: 'Olšany u Pv', day: 'Pondělí', time: '13:30 - 14:30', price: '1800 Kč / pololetí', isKindergarten: true },
  { id: '27', name: 'ZŠ Tererovo nám.', city: 'Olomouc', day: 'Úterý', time: '14:00 - 15:00', price: '1800 Kč / pololetí' },
  { id: '28', name: 'ZŠ Holečkova', city: 'Olomouc', day: 'Středa', time: '14:00 - 15:00', price: '1800 Kč / pololetí' },
  { id: '29', name: 'ZŠ Spojenců', city: 'Olomouc', day: 'Čtvrtek', time: '15:00 - 16:00', price: '1800 Kč / pololetí' },
  { id: '30', name: 'MŠ Aurora', city: 'Olomouc', day: 'Pátek', time: '10:00 - 10:45', price: '1600 Kč / pololetí', isKindergarten: true },
];

export const CAMPS: Camp[] = [
  {
    id: 'c1',
    title: 'Letní pobytový CAMP - Bílá (1. turnus)',
    date: '19.7. - 24.7.',
    price: '3 500 Kč',
    description: 'Bílá, 1. turnus. Týden plný tance, her a zábavy v krásném prostředí Beskyd.',
    image: 'https://static.wixstatic.com/media/93005c_5baa5ec580a946b0bbdc5c0b06ae0c8b~mv2.jpeg/v1/fill/w_308,h_231,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/IMG_8522.jpeg'
  },
  {
    id: 'c2',
    title: 'Letní příměstský CAMP - Olomouc',
    date: '13.7. - 17.7.',
    price: '3 500 Kč',
    description: 'Intenzivní taneční průprava, moderní styly a zábava přímo v Olomouci.',
    image: 'https://static.wixstatic.com/media/93005c_e279092e065b4500ba586ef831cd966e~mv2.png/v1/fill/w_308,h_231,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/93005c_e279092e065b4500ba586ef831cd966e~mv2.png'
  },
  {
    id: 'c3',
    title: 'Letní pobytový CAMP - Bílá (2. turnus)',
    date: '23.8. - 28.8.',
    price: '3 500 Kč',
    description: 'Bílá, 2. turnus. Zakončení prázdnin tancem a pohybem v přírodě.',
    image: 'https://static.wixstatic.com/media/93005c_c0f4a6edf5834e4eb2abdd3210aade89~mv2.png/v1/fill/w_308,h_231,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/IMG_0059_HEIC.png'
  },
  {
    id: 'c4',
    title: 'Letní příměstský CAMP - Prostějov',
    date: 'Termín bude upřesněn',
    price: '3 500 Kč',
    description: 'Příměstský tábor v Prostějově plný tance pro všechny věkové kategorie.',
    image: 'https://static.wixstatic.com/media/93005c_7b35dfc300bf43649d7ae8b5fbb3fbb1~mv2.png/v1/fill/w_308,h_231,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/IMG_6247%202_HEIC.png'
  }
];

export const GALLERY_IMAGES: GalleryImage[] = [
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

export const CONTACT_INFO = {
  name: "Taneční klub Olymp Olomouc, z. s.",
  address: "Jiráskova 381/25, 779 00, Olomouc - Hodolany",
  ico: "68347286",
  email: "info@olympdance.cz",
  phone: "+420 777 123 456"
};