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
import VersionCheck from './components/VersionCheck';
import { DataProvider } from './context/DataContext';

// Component to handle scroll restoration and dynamic SEO
const PageHandler = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);
  }, [pathname]);

  const baseTitle = 'Olymp Dance Olomouc';
  const baseUrl = 'https://olympdance.cz';
  let title = baseTitle;
  let description = 'Taneční škola Olymp Dance Olomouc. Taneční kroužky pro děti na základních a mateřských školách, letní příměstské a pobytové tábory.';
  let keywords = 'taneční škola, Olymp Dance, Olomouc, taneční kroužky, tanec pro děti, letní tábory, příměstské tábory, taneční tábor';
  let jsonLd = null;

  switch (pathname) {
    case '/':
      title = `${baseTitle} | Taneční kroužky a tábory`;
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "SportsActivityLocation",
        "name": "Olymp Dance Olomouc",
        "description": description,
        "url": baseUrl,
        "telephone": "+420123456789",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Olomouc",
          "addressRegion": "Olomoucký kraj",
          "addressCountry": "CZ"
        },
        "sameAs": [
          "https://www.facebook.com/olympdance",
          "https://www.instagram.com/olympdance"
        ]
      };
      break;
    case '/tanecnikrouzky':
      title = `Kroužky na školách | ${baseTitle}`;
      description = 'Taneční kroužky pro děti přímo na základních a mateřských školách v Olomouci a okolí. Pohybová průprava a moderní tanec.';
      keywords = 'taneční kroužky, tanec na školách, pohybová průprava, MŠ, ZŠ, Olymp Dance kroužky';
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Taneční kroužky na školách",
        "provider": {
          "@type": "Organization",
          "name": "Olymp Dance Olomouc"
        },
        "description": description
      };
      break;
    case '/letnicampy':
      title = `Letní Tábory | ${baseTitle}`;
      description = 'Zábavné letní příměstské a pobytové tábory pro děti plné tance, pohybu a nových kamarádů.';
      keywords = 'letní tábory, příměstský tábor, pobytový tábor, taneční tábor, tábory pro děti, Olomouc';
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "EventSeries",
        "name": "Letní Tábory Olymp Dance",
        "description": description,
        "organizer": {
          "@type": "Organization",
          "name": "Olymp Dance Olomouc"
        }
      };
      break;
    case '/galerie':
      title = `Fotogalerie | ${baseTitle}`;
      description = 'Podívejte se na fotky z našich tanečních vystoupení, kroužků a letních táborů.';
      keywords = 'fotogalerie, fotky, taneční vystoupení, taneční kroužky, letní tábory, Olymp Dance';
      break;
    case '/o-nas':
      title = `O nás | ${baseTitle}`;
      description = 'Jsme taneční škola s dlouholetou tradicí. Předáváme dětem radost z pohybu a tance.';
      keywords = 'o nás, taneční škola, tradice, lektoři, taneční klub, Olymp Dance, Olomouc';
      break;
    case '/kontakt':
      title = `Kontakt | ${baseTitle}`;
      description = 'Kontaktujte nás. Rádi zodpovíme vaše dotazy ohledně tanečních kroužků a táborů.';
      keywords = 'kontakt, taneční škola, Olymp Dance, Olomouc, telefon, email';
      break;
    case '/admin':
      title = `Administrace | ${baseTitle}`;
      break;
    case '/merch':
      title = `E-shop | ${baseTitle}`;
      description = 'Pořiďte si stylové oblečení a doplňky z naší kolekce Olymp Dance.';
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "Store",
        "name": "Olymp Dance E-shop",
        "description": description
      };
      break;
    default:
      if (pathname.startsWith('/registrace')) {
        title = `Přihláška | ${baseTitle}`;
      } else if (pathname.startsWith('/portal')) {
        title = `Klientský portál | ${baseTitle}`;
      }
  }

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={`${baseUrl}${pathname}`} />
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

// Layout component to keep Navbar and Footer consistent
const Layout = ({ children }: { children?: React.ReactNode }) => (
  <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-brand-red selection:text-white flex flex-col">
    <Navbar />
    <VersionCheck />
    <main className="flex-grow pt-24 md:pt-32">
      {children}
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <HelmetProvider>
      <DataProvider>
        <Router>
          <PageHandler />
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tanecnikrouzky" element={<Locations />} />
              <Route path="/letnicampy" element={<Camps />} />
              <Route path="/registrace/:campId" element={<RegistrationForm />} />
              <Route path="/registrace-krouzek/:schoolId" element={<SchoolRegistrationForm />} />
              <Route path="/portal" element={<ClientPortal />} />
              <Route path="/portal-krouzky" element={<SchoolPortal />} />
              <Route path="/galerie" element={<Gallery />} />
              <Route path="/o-nas" element={<About />} />
              <Route path="/kontakt" element={<Contact />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/webmaster" element={<Webmaster />} />
              <Route path="/merch" element={<Merch />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </Router>
      </DataProvider>
    </HelmetProvider>
  );
}

export default App;