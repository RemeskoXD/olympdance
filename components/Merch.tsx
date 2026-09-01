import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

const Merch: React.FC = () => {
  const { products, isMerchEnabled } = useData();
  const navigate = useNavigate();

  const handleBuy = (productName: string) => {
    navigate(`/kontakt?skola=${encodeURIComponent('Mám zájem o: ' + productName)}`);
  };

  if (!isMerchEnabled) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <ShoppingBag size={64} className="text-gray-300 mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">E-shop je momentálně uzavřen</h1>
        <p className="text-gray-600 mb-8">Právě připravujeme novou kolekci. Vraťte se brzy!</p>
        <Link to="/" className="text-brand-blue font-bold hover:underline">Zpět na úvod</Link>
      </div>
    );
  }

  return (
    <section className="bg-white min-h-screen">
      {/* Hero Header */}
      <div className="bg-gray-900 text-white py-12 sm:py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-brand-blue/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-60 sm:w-80 h-60 sm:h-80 bg-brand-red/20 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-brand-red/20 text-brand-red border border-brand-red/30 text-xs font-bold uppercase tracking-widest mb-3 sm:mb-4">
            Official Merch
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-display font-extrabold mb-4 sm:mb-6">
            Ukaž, že patříš k <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-lightBlue">Olympu</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed">
            Stylové oblečení a doplňky pro trénink i volný čas. 
            Vybav se na novou sezónu v barvách svého týmu.
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {products.map((product) => (
                <div key={product.id} className="group bg-white rounded-2xl border border-gray-100 shadow-md sm:shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1">
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-brand-red font-bold text-xs sm:text-sm shadow-sm">
                    {product.price}
                    </div>
                </div>
                
                <div className="p-4 sm:p-6 flex flex-col flex-grow">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5 sm:mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6 flex-grow leading-relaxed">
                    {product.description}
                    </p>
                    
                    <button 
                    onClick={() => handleBuy(product.name)}
                    className="w-full py-2.5 sm:py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-brand-blue transition-colors flex items-center justify-center group/btn text-sm sm:text-base"
                    >
                    Objednat
                    <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform shrink-0" />
                    </button>
                </div>
                </div>
            ))}
            </div>
        ) : (
            <div className="text-center py-16 sm:py-20">
                <p className="text-gray-500 text-sm sm:text-base">Zatím zde nejsou žádné produkty.</p>
            </div>
        )}

        {/* Info Box */}
        <div className="mt-12 sm:mt-20 bg-gray-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center border border-gray-100">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Jak objednat?</h3>
            <p className="text-gray-600 text-xs sm:text-sm md:text-base max-w-2xl mx-auto mb-6 sm:mb-8">
                Vyberte si zboží, klikněte na tlačítko "Objednat" a budete přesměrováni na kontaktní formulář. 
                Do zprávy nám napište požadovanou velikost a počet kusů. Ozveme se vám s potvrzením a informacemi k platbě.
            </p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm font-medium text-gray-500">
                <span className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-2 shrink-0"></div> Osobní odběr na tréninku</span>
                <span className="flex items-center"><div className="w-2 h-2 bg-brand-blue rounded-full mr-2 shrink-0"></div> Platba převodem</span>
            </div>
        </div>
      </div>
    </section>
  );
};

export default Merch;