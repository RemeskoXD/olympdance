import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import { DataProvider } from './context/DataContext';

// Component to handle scroll restoration and dynamic page titles
const PageHandler = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);

    // Update Page Title
    const baseTitle = 'Olymp Dance Olomouc';
    switch (pathname) {
      case '/':
        document.title = `${baseTitle} | Taneční kroužky a tábory`;
        break;
      case '/krouzky':
        document.title = `Kroužky na školách | ${baseTitle}`;
        break;
      case '/tabory':
        document.title = `Letní Tábory | ${baseTitle}`;
        break;
      case '/galerie':
        document.title = `Fotogalerie | ${baseTitle}`;
        break;
      case '/o-nas':
        document.title = `O nás | ${baseTitle}`;
        break;
      case '/kontakt':
        document.title = `Kontakt | ${baseTitle}`;
        break;
      case '/admin':
        document.title = `Administrace | ${baseTitle}`;
        break;
      case '/merch':
        document.title = `E-shop | ${baseTitle}`;
        break;
      default:
        document.title = baseTitle;
    }
  }, [pathname]);

  return null;
};

// Layout component to keep Navbar and Footer consistent
const Layout = ({ children }: { children?: React.ReactNode }) => (
  <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-brand-red selection:text-white flex flex-col">
    <Navbar />
    <main className="flex-grow pt-24 md:pt-32">
      {children}
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <DataProvider>
      <Router>
        <PageHandler />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/krouzky" element={<Locations />} />
            <Route path="/tabory" element={<Camps />} />
            <Route path="/galerie" element={<Gallery />} />
            <Route path="/o-nas" element={<About />} />
            <Route path="/kontakt" element={<Contact />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/merch" element={<Merch />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </Router>
    </DataProvider>
  );
}

export default App;