import React, { useState } from 'react';
import { ShoppingBag, ArrowRight, X, CheckCircle2, QrCode, Copy, Check, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Product, MerchOrder } from '../types';
import { BANK_INFO } from '../constants';

const Merch: React.FC = () => {
  const { products, isMerchEnabled, addMerchOrder } = useData();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [completedOrder, setCompletedOrder] = useState<MerchOrder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form state
  const [size, setSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const isOneSizeProduct = (name: string) => {
    const n = name.toLowerCase();
    return n.includes('vak') || n.includes('čepice') || n.includes('lahev') || n.includes('láhev');
  };

  const handleOpenOrder = (product: Product) => {
    setSelectedProduct(product);
    setSize(isOneSizeProduct(product.name) ? 'Univerzální' : '140 (9-10 let)');
    setQuantity(1);
    setDeliveryNote('');
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !userName || !userEmail) return;

    setIsSubmitting(true);
    try {
      const numericPrice = parseInt(selectedProduct.price.replace(/\D/g, ''), 10) || 450;
      const total = numericPrice * quantity;

      const fullNote = deliveryNote 
        ? `Osobní odběr na tréninku: ${deliveryNote}` 
        : 'Osobní odběr na tréninku';

      const created = await addMerchOrder({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        productPrice: selectedProduct.price,
        size,
        quantity,
        totalPrice: total,
        userName,
        userEmail,
        userPhone,
        deliveryNote: fullNote
      });

      setCompletedOrder(created);
      setSelectedProduct(null);
    } catch (err) {
      console.error('Order submission error:', err);
      alert('Došlo k chybě při odesílání objednávky. Zkuste to prosím znovu.');
    } finally {
      setIsSubmitting(false);
    }
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

  // Generate QR Code URL for completed order
  const getQrCodeUrl = (order: MerchOrder) => {
    const iban = (BANK_INFO.iban || '').replace(/\s/g, '');
    const vs = order.variableSymbol;
    const msg = encodeURIComponent(`Merch: ${order.productName}`);
    const spayd = `SPD*1.0*ACC:${iban}*AM:${order.totalPrice.toFixed(2)}*CC:CZK*X-VS:${vs}*MSG:${msg}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(spayd)}`;
  };

  return (
    <section className="bg-white min-h-screen">
      {/* Hero Header */}
      <div className="bg-gray-900 text-white py-12 sm:py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-brand-blue/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-60 sm:w-80 h-60 sm:h-80 bg-brand-red/20 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="inline-flex items-center gap-1.5 py-1 px-3.5 rounded-full bg-brand-red/20 text-brand-red border border-brand-red/30 text-xs font-bold uppercase tracking-widest mb-3 sm:mb-4">
            <Sparkles size={13} /> Official Merch
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-display font-extrabold mb-4 sm:mb-6">
            Ukaž, že patříš k <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-lightBlue">Olympu</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed">
            Stylové oblečení a doplňky pro trénink i volný čas. 
            Vybav se na novou sezónu v barvách svého týmu s rychlým potvrzením na e-mail a platbou přes QR kód.
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {products.map((product) => (
              <div key={product.id} className="group bg-white rounded-2xl border border-gray-100 shadow-md sm:shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1">
                <div className="relative aspect-square sm:aspect-[4/3] overflow-hidden bg-gray-50 flex items-center justify-center p-4">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                  />
                  {product.isAction && (
                    <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-gradient-to-r from-red-600 to-rose-500 text-white font-black text-xs sm:text-sm px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 uppercase tracking-wider border border-red-400/40">
                      <Sparkles size={14} className="text-yellow-300" />
                      {product.actionBadge || 'AKCE'}
                    </div>
                  )}
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex flex-col items-end gap-1">
                    <div className={`backdrop-blur-md px-3.5 py-1.5 rounded-full font-black text-sm sm:text-base shadow-md border ${
                      product.isAction 
                        ? 'bg-red-600 text-white border-red-500' 
                        : 'bg-white/95 text-brand-red border-red-100'
                    }`}>
                      {product.price}
                    </div>
                    {product.isAction && product.originalPrice && (
                      <span className="bg-gray-900/80 backdrop-blur-md text-gray-300 line-through text-xs px-2.5 py-0.5 rounded-full font-semibold shadow-sm">
                        {product.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="p-4 sm:p-6 flex flex-col flex-grow">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5 sm:mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6 flex-grow leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                  
                  <button 
                    onClick={() => handleOpenOrder(product)}
                    className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-brand-blue transition-colors flex items-center justify-center group/btn text-sm sm:text-base cursor-pointer shadow-md hover:shadow-lg"
                  >
                    Objednat zboží
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
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Jak nákup funguje?</h3>
          <p className="text-gray-600 text-xs sm:text-sm md:text-base max-w-2xl mx-auto mb-6 sm:mb-8">
            Vyberte si zboží, klikněte na „Objednat zboží“, zvolte velikost a vyplňte své kontaktní údaje. 
            Ihned po odeslání se vám zobrazí QR kód pro platbu a všechny platební údaje odejdou na váš e-mail.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs sm:text-sm font-medium text-gray-600 mb-6">
            <span className="flex items-center bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-sm"><div className="w-2.5 h-2.5 bg-green-500 rounded-full mr-2 shrink-0"></div> Osobní odběr na tréninku</span>
            <span className="flex items-center bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-sm"><div className="w-2.5 h-2.5 bg-brand-blue rounded-full mr-2 shrink-0"></div> Okamžitá QR platba v mobilu</span>
            <span className="flex items-center bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-sm"><div className="w-2.5 h-2.5 bg-purple-500 rounded-full mr-2 shrink-0"></div> Potvrzení přímo do e-mailu</span>
          </div>

          <div className="pt-6 border-t border-gray-200/60 max-w-xl mx-auto text-xs sm:text-sm text-gray-500">
            <p>
              Potřebujete poradit s výběrem velikosti nebo objednávkou? Napište nám na{' '}
              <a href="mailto:info@olympdance.cz" className="text-brand-blue font-bold hover:underline">info@olympdance.cz</a>{' '}
              nebo volejte <a href="tel:+420722017700" className="text-brand-blue font-bold hover:underline">+420 722 017 700</a>.
            </p>
          </div>
        </div>
      </div>

      {/* Order Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl my-8 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={22} />
            </button>

            <div className="flex items-center gap-4 pb-5 border-b border-gray-100 mb-6">
              <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-200 p-1 flex items-center justify-center shrink-0">
                <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-red">Objednávka</span>
                  {selectedProduct.isAction && (
                    <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {selectedProduct.actionBadge || 'AKCE'}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-extrabold text-gray-900">{selectedProduct.name}</h3>
                <div className="flex items-center gap-2">
                  <p className="text-brand-red font-extrabold text-base">{selectedProduct.price}</p>
                  {selectedProduct.isAction && selectedProduct.originalPrice && (
                    <span className="text-xs text-gray-400 line-through font-semibold">
                      {selectedProduct.originalPrice}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Velikost</label>
                  {isOneSizeProduct(selectedProduct.name) ? (
                    <div className="w-full px-3 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700">
                      Univerzální velikost
                    </div>
                  ) : (
                    <select 
                      value={size} 
                      onChange={e => setSize(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-blue outline-none"
                    >
                      <optgroup label="Dětské velikosti">
                        <option value="116 (5-6 let)">116 (5-6 let)</option>
                        <option value="128 (7-8 let)">128 (7-8 let)</option>
                        <option value="140 (9-10 let)">140 (9-10 let)</option>
                        <option value="152 (11-12 let)">152 (11-12 let)</option>
                        <option value="164 (13-14 let)">164 (13-14 let)</option>
                      </optgroup>
                      <optgroup label="Dospělé velikosti">
                        <option value="XS">XS</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                      </optgroup>
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Počet kusů</label>
                  <input 
                    type="number" 
                    min={1} 
                    max={20}
                    value={quantity} 
                    onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-blue outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Jméno a příjmení kupujícího *</label>
                <input 
                  type="text" 
                  required
                  placeholder="např. Jana Nováková"
                  value={userName} 
                  onChange={e => setUserName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">E-mail pro potvrzení a QR kód *</label>
                  <input 
                    type="email" 
                    required
                    placeholder="vas@email.cz"
                    value={userEmail} 
                    onChange={e => setUserEmail(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Telefonní číslo *</label>
                  <input 
                    type="tel" 
                    required
                    placeholder="+420 777 000 111"
                    value={userPhone} 
                    onChange={e => setUserPhone(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Způsob předání</label>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3">
                  <span className="text-xl">🤝</span>
                  <div>
                    <span className="text-xs font-bold text-emerald-900 block">Osobní odběr na tréninku / v klubu</span>
                    <span className="text-[11px] text-emerald-700 block mt-0.5">Merch předáme dítěti přímo na tréninku tanečního kroužku nebo v tanečním sále v Olomouci.</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  Poznámka k předání (např. škola dítěte, kroužek nebo jméno lektora)
                </label>
                <textarea 
                  rows={2}
                  placeholder="Uveďte jméno dítěte, školu / kroužek, kam dochází, nebo den tréninku..."
                  value={deliveryNote} 
                  onChange={e => setDeliveryNote(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                />
              </div>

              {/* Total preview */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500 font-medium">Celková částka k úhradě:</span>
                  <div className="text-xs text-gray-400">{quantity}x {selectedProduct.name} ({size})</div>
                </div>
                <div className="text-xl font-extrabold text-brand-red">
                  {(parseInt(selectedProduct.price.replace(/\D/g, ''), 10) || 450) * quantity} Kč
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-brand-red text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span>Odesílám objednávku...</span>
                ) : (
                  <>
                    <span>Závazně objednat & vygenerovat QR platbu</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Order Confirmation & QR Payment Modal */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl my-8 border border-gray-100 text-center animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setCompletedOrder(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={22} />
            </button>

            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={36} />
            </div>

            <h3 className="text-2xl font-extrabold text-gray-900 mb-1">Děkujeme za objednávku!</h3>
            <p className="text-gray-600 text-sm mb-6">
              Objednávka <strong className="text-gray-900">č. {completedOrder.variableSymbol}</strong> byla úspěšně přijata. Potvrzení a pokyny k platbě jsme odeslali na e-mail <strong className="text-brand-blue">{completedOrder.userEmail}</strong>.
            </p>

            {/* QR Payment Box */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-6">
              <div className="flex items-center justify-center gap-2 text-sm font-bold text-gray-800 mb-3">
                <QrCode size={18} className="text-brand-blue" />
                <span>Naskenujte v mobilním bankovnictví:</span>
              </div>
              <img 
                src={getQrCodeUrl(completedOrder)} 
                alt="QR Platba" 
                className="w-48 h-48 mx-auto rounded-xl border border-gray-200 shadow-sm mb-3 bg-white p-2"
              />
              <p className="text-xs text-gray-500 mb-4">Platba přes Raiffeisenbank / SPAYD standard</p>

              <div className="space-y-2 text-left text-xs sm:text-sm bg-white p-3.5 rounded-xl border border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Číslo účtu:</span>
                  <div className="flex items-center gap-1 font-bold text-gray-900">
                    <span>{BANK_INFO.account}</span>
                    <button onClick={() => copyToClipboard(BANK_INFO.account, 'acc')} className="p-1 hover:text-brand-blue">
                      {copiedField === 'acc' ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Částka:</span>
                  <span className="font-extrabold text-brand-red text-base">{completedOrder.totalPrice} Kč</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Variabilní symbol:</span>
                  <div className="flex items-center gap-1 font-bold text-gray-900">
                    <span>{completedOrder.variableSymbol}</span>
                    <button onClick={() => copyToClipboard(completedOrder.variableSymbol, 'vs')} className="p-1 hover:text-brand-blue">
                      {copiedField === 'vs' ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Položka:</span>
                  <span className="font-medium text-gray-800">{completedOrder.quantity}x {completedOrder.productName} ({completedOrder.size})</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setCompletedOrder(null)}
              className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
            >
              Rozumím, zavřít okno
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default Merch;
