import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import Locations from './components/Locations';
import Camps from './components/Camps';
import Contact from './components/Contact';
import Gallery from './components/Gallery';
import Admin from './components/Admin';
import NotFound from './components/NotFound';
import Footer from './components/Footer';
import Merch from './components/Merch';
import Webmaster from './components/Webmaster';
import RegistrationForm from './components/RegistrationForm';
import ClientPortal from './components/ClientPortal';
import SchoolPortal from './components/SchoolPortal';
import SchoolRegistrationForm from './components/SchoolRegistrationForm';
import TanecniExpres from './components/TanecniExpres';
import VersionCheck from './components/VersionCheck';
import { FloatingContact } from './components/FloatingContact';
import { LegalPage } from './components/LegalPage';
import { DataProvider, useData } from './context/DataContext';

import { CONTACT_INFO } from './constants';

// Component to handle scroll restoration and dynamic SEO
const PageHandler = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          const yOffset = -90;
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    } else {
      // Scroll to top on route change without hash
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  const baseTitle = 'Olymp Dance Olomouc';
  const baseUrl = 'https://olympdance.cz';
  const defaultImage = 'https://web2.itnahodinu.cz/olympdance/prostejov/img_14_optimized.02.25_00050.jpg';
  
  let title = `${baseTitle} | Taneční kroužky na školách a letní tábory`;
  let description = 'Oficiální stránky tanečního klubu Olymp Dance Olomouc. Taneční kroužky pro děti přímo na ZŠ a MŠ v Olomouci a okolí, letní příměstské a pobytové tábory.';
  let keywords = 'taneční škola, Olymp Dance, Olomouc, taneční kroužky, tanec pro děti, kroužky ZŠ, kroužky MŠ, letní tábory Olomouc, příměstské tábory, moderní tanec, street dance';
  let ogImage = defaultImage;
  let ogType = 'website';
  let robots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
  let jsonLdList: any[] = [];

  // Base Organization & Breadcrumb info
  const organizationSchema = {
    "@type": "SportsClub",
    "@id": `${baseUrl}/#organization`,
    "name": "Olymp Dance Olomouc",
    "legalName": CONTACT_INFO.name,
    "url": baseUrl,
    "logo": "https://web2.itnahodinu.cz/olympdance/logobile.webp",
    "telephone": CONTACT_INFO.phone.replace(/\s/g, ''),
    "email": CONTACT_INFO.email,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Jiráskova 381/25, Hodolany",
      "addressLocality": "Olomouc",
      "postalCode": "77900",
      "addressRegion": "Olomoucký kraj",
      "addressCountry": "CZ"
    }
  };

  switch (pathname) {
    case '/':
      title = `${baseTitle} | Taneční kroužky pro děti a letní tábory`;
      description = 'Taneční klub Olymp Dance Olomouc. Moderní taneční kroužky na školách v Olomouci, Prostějově a okolí. Letní příměstské a pobytové tábory plné zážitků.';
      jsonLdList = [
        {
          "@context": "https://schema.org",
          "@type": "SportsClub",
          "name": "Olymp Dance Olomouc",
          "legalName": CONTACT_INFO.name,
          "description": description,
          "url": baseUrl,
          "telephone": CONTACT_INFO.phone.replace(/\s/g, ''),
          "email": CONTACT_INFO.email,
          "taxID": CONTACT_INFO.ico,
          "address": organizationSchema.address,
          "sameAs": [
            "https://www.facebook.com/olympdance",
            "https://www.instagram.com/olympdance"
          ],
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Nabídka tanečních aktivit",
            "itemListElement": [
              {
                "@type": "OfferCatalog",
                "name": "Taneční kroužky pro děti (ZŠ a MŠ)"
              },
              {
                "@type": "OfferCatalog",
                "name": "Letní příměstské a pobytové tábory"
              },
              {
                "@type": "OfferCatalog",
                "name": "Taneční Expres – Roztančená družina"
              }
            ]
          }
        }
      ];
      break;

    case '/tanecnikrouzky':
      title = `Taneční kroužky na školách Olomouc & okolí | ${baseTitle}`;
      description = 'Pohodlně přímo na vaší základní či mateřské škole bez dojíždění. Street dance, moderní tanec a pohybová průprava pro děti od 4 do 15 let.';
      keywords = 'taneční kroužky Olomouc, taneční kroužky Prostějov, kroužky ZŠ, kroužky MŠ, tanec pro děti, kroužky na školách, street dance děti';
      ogImage = 'https://web2.itnahodinu.cz/olympdance/prostejov/img_08_optimized.02.25_00016.jpg';
      jsonLdList = [
        {
          "@context": "https://schema.org",
          "@type": "Course",
          "name": "Taneční kroužky na školách Olomouc a okolí",
          "description": description,
          "provider": organizationSchema,
          "educationalCredentialAwarded": "Závěrečné taneční vystoupení",
          "hasCourseInstance": {
            "@type": "CourseInstance",
            "courseMode": "In-Person",
            "location": "Olomouc a Olomoucký kraj"
          }
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Domů", "item": baseUrl },
            { "@type": "ListItem", "position": 2, "name": "Taneční kroužky", "item": `${baseUrl}/tanecnikrouzky` }
          ]
        }
      ];
      break;

    case '/tanecni-expres':
      title = `Taneční Expres – Roztančená družina | ${baseTitle}`;
      description = 'Taneční expres přiveze radost z tance, hudby a pohybu přímo do vaší školy, školky nebo družiny v Olomouckém kraji. Zábavný program na míru.';
      keywords = 'taneční expres, roztančená družina, taneční workshop pro školy, animační programy Olomouc, tanec pro družiny';
      jsonLdList = [
        {
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Taneční Expres – Roztančená družina",
          "description": description,
          "provider": organizationSchema,
          "areaServed": "Olomoucký kraj"
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Domů", "item": baseUrl },
            { "@type": "ListItem", "position": 2, "name": "Taneční Expres", "item": `${baseUrl}/tanecni-expres` }
          ]
        }
      ];
      break;

    case '/letnicampy':
      title = `Letní taneční tábory 2026 Olomouc & Prostějov | ${baseTitle}`;
      description = 'Nezapomenutelné letní tábory pro děti – příměstské tábory v Olomouci a Prostějově, pobytové tábory na Horské chatě Bílá v Beskydech. Tanec, hry, aquapark.';
      keywords = 'letní tábory 2026, příměstský tábor Olomouc, příměstský tábor Prostějov, pobytový tábor Beskydy, taneční tábor pro děti, letní camp Olymp Dance';
      ogImage = '/images/IMG_8522.jpg';
      jsonLdList = [
        {
          "@context": "https://schema.org",
          "@type": "EventSeries",
          "name": "Letní taneční tábory a campy Olymp Dance 2026",
          "description": description,
          "organizer": organizationSchema,
          "startDate": "2026-07-13",
          "endDate": "2026-08-28",
          "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
          "eventStatus": "https://schema.org/EventScheduled",
          "location": {
            "@type": "Place",
            "name": "Olomouc, Prostějov, Horská chata Bílá",
            "address": {
              "@type": "PostalAddress",
              "addressRegion": "Olomoucký kraj / Moravskoslezský kraj",
              "addressCountry": "CZ"
            }
          }
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Domů", "item": baseUrl },
            { "@type": "ListItem", "position": 2, "name": "Letní tábory", "item": `${baseUrl}/letnicampy` }
          ]
        }
      ];
      break;

    case '/galerie':
      title = `Fotogalerie a vystoupení | ${baseTitle}`;
      description = 'Prohlédněte si fotky a momentky z tanečních soutěží, vystoupení na školách, soustředění a letních táborů Olymp Dance Olomouc.';
      keywords = 'fotogalerie tanec, fotky kroužky, tábory fotky, taneční vystoupení Olomouc, fotogalerie Olymp Dance';
      jsonLdList = [
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Fotogalerie Olymp Dance Olomouc",
          "description": description,
          "publisher": organizationSchema
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Domů", "item": baseUrl },
            { "@type": "ListItem", "position": 2, "name": "Galerie", "item": `${baseUrl}/galerie` }
          ]
        }
      ];
      break;

    case '/o-nas':
      title = `O klubu a trenérech | ${baseTitle}`;
      description = 'Poznejte náš tým zkušených lektorů, trenérů a vedoucích s více než 10letou tradicí vedení dětí k pohybu, zdravému sebevědomí a radosti ze sportu.';
      keywords = 'o nás, taneční klub Olomouc, lektoři tance, trenéři Olymp Dance, historie klubu, reference tanec';
      jsonLdList = [
        {
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "O klubu Olymp Dance Olomouc",
          "description": description,
          "mainEntity": organizationSchema
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Domů", "item": baseUrl },
            { "@type": "ListItem", "position": 2, "name": "O nás", "item": `${baseUrl}/o-nas` }
          ]
        }
      ];
      break;

    case '/kontakt':
      title = `Kontakt a informace | ${baseTitle}`;
      description = `Máte dotaz k zápisu do kroužků nebo letních táborů? Napište nám na ${CONTACT_INFO.email} nebo zavolejte na ${CONTACT_INFO.phone}. Sídlíme v Olomouci.`;
      keywords = 'kontakt Olymp Dance, telefon tanec Olomouc, email Olymp Dance, adresa taneční škola Olomouc';
      jsonLdList = [
        {
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": "Kontakt – Olymp Dance Olomouc",
          "description": description,
          "mainEntity": {
            ...organizationSchema,
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": CONTACT_INFO.phone.replace(/\s/g, ''),
              "contactType": "customer service",
              "email": CONTACT_INFO.email,
              "availableLanguage": ["Czech", "Slovak", "English"]
            }
          }
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Domů", "item": baseUrl },
            { "@type": "ListItem", "position": 2, "name": "Kontakt", "item": `${baseUrl}/kontakt` }
          ]
        }
      ];
      break;

    case '/merch':
      title = `Klubový E-shop & Merch | ${baseTitle}`;
      description = 'Oficiální klubové oblečení a doplňky Olymp Dance – taneční trička, mikiny s kapucí, batohy, kšiltovky a sportovní láhve pro malé i velké tanečníky.';
      keywords = 'merch Olymp Dance, taneční tričko, mikina Olymp, klubový merch, taneční batoh, kšiltovka';
      ogImage = 'https://web2.itnahodinu.cz/olympdance/dscf0013-enhanced-nr_optimized.webp';
      jsonLdList = [
        {
          "@context": "https://schema.org",
          "@type": "Store",
          "name": "Olymp Dance E-shop & Merch",
          "description": description,
          "parentOrganization": organizationSchema
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Domů", "item": baseUrl },
            { "@type": "ListItem", "position": 2, "name": "E-shop", "item": `${baseUrl}/merch` }
          ]
        }
      ];
      break;

    case '/admin':
    case '/webmaster':
    case '/portal':
    case '/portal-krouzky':
      title = pathname === '/admin' ? `Administrace | ${baseTitle}` :
              pathname === '/webmaster' ? `Webmaster | ${baseTitle}` :
              `Klientský portál | ${baseTitle}`;
      robots = 'noindex, nofollow';
      break;

    case '/gdpr':
      title = `Zásady ochrany osobních údajů (GDPR) | ${baseTitle}`;
      description = 'Zásady zpracování a ochrany osobních údajů v tanečním klubu Olymp Dance Olomouc.';
      break;

    case '/obchodni-podminky':
      title = `Obchodní podmínky a provozní řád | ${baseTitle}`;
      description = 'Všeobecné obchodní podmínky a provozní řád tanečního klubu Olymp Dance Olomouc.';
      break;

    default:
      if (pathname.startsWith('/registrace')) {
        title = `Přihláška na tábor | ${baseTitle}`;
        robots = 'noindex, nofollow';
      } else if (pathname.startsWith('/registrace-krouzek')) {
        title = `Přihláška do tanečního kroužku | ${baseTitle}`;
        robots = 'noindex, nofollow';
      }
  }

  const currentUrl = `${baseUrl}${pathname}`;

  return (
    <Helmet>
      {/* Title & Description */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content="Olymp Dance Olomouc" />
      <meta property="og:locale" content="cs_CZ" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={title} />

      {/* Schema.org Structured Data */}
      {jsonLdList.map((item, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(item)}
        </script>
      ))}
    </Helmet>
  );
};

// Layout component to keep Navbar and Footer consistent
const Layout = ({ children }: { children?: React.ReactNode }) => (
  <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-brand-red selection:text-white flex flex-col">
    <Navbar />
    <VersionCheck />
    <main className="flex-grow pt-20 sm:pt-28 md:pt-32">
      {children}
    </main>
    <FloatingContact />
    <Footer />
  </div>
);

const AppRoutes = () => {
  const { isMerchEnabled, isTanecniExpresEnabled, isCampsEnabled, isGalleryEnabled, isAboutEnabled } = useData();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/tanecnikrouzky" element={<Locations />} />
      
      {/* Dynamic Subpages - when turned off globally in admin, route is blocked and renders 404 NotFound */}
      <Route path="/tanecni-expres" element={isTanecniExpresEnabled ? <TanecniExpres /> : <NotFound />} />
      <Route path="/letnicampy" element={isCampsEnabled ? <Camps /> : <NotFound />} />
      <Route path="/registrace/:campId" element={isCampsEnabled ? <RegistrationForm /> : <NotFound />} />
      <Route path="/portal" element={isCampsEnabled ? <ClientPortal /> : <NotFound />} />
      <Route path="/merch" element={isMerchEnabled ? <Merch /> : <NotFound />} />
      <Route path="/galerie" element={isGalleryEnabled ? <Gallery /> : <NotFound />} />
      <Route path="/o-nas" element={isAboutEnabled ? <About /> : <NotFound />} />
      
      <Route path="/registrace-krouzek/:schoolId" element={<SchoolRegistrationForm />} />
      <Route path="/portal-krouzky" element={<SchoolPortal />} />
      <Route path="/kontakt" element={<Contact />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/webmaster" element={<Webmaster />} />
      <Route path="/gdpr" element={<LegalPage />} />
      <Route path="/obchodni-podminky" element={<LegalPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <HelmetProvider>
      <DataProvider>
        <Router>
          <PageHandler />
          <Layout>
            <AppRoutes />
          </Layout>
        </Router>
      </DataProvider>
    </HelmetProvider>
  );
}

export default App;