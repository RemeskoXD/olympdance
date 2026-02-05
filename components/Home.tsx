import React from 'react';
import Hero from './Hero';
import RevealOnScroll from './RevealOnScroll';
import { Link } from 'react-router-dom';
import { ArrowRight, Music, Sun, Users, Star, Quote, Clock, Heart, Wallet, Trophy } from 'lucide-react';

const TESTIMONIALS = [
  { 
    name: 'Petra Nováková', 
    role: 'Maminka', 
    text: 'Dcera chodí na kroužek už třetím rokem a je naprosto nadšená. Líbí se mi přátelský přístup lektorů a to, že se děti nejen hýbou, ale učí se i týmovosti.' 
  },
  { 
    name: 'Martin Svoboda', 
    role: 'Tatínek', 
    text: 'Letní tábor byl prý nejlepší zážitek prázdnin. Syn se vrátil plný energie a nových tanečních kroků. Příští rok jedeme určitě zase.' 
  },
  { 
    name: 'Jana Dvořáková', 
    role: 'Maminka', 
    text: 'Oceňuji skvělou komunikaci a organizaci. Závěrečné vystoupení bylo dojemné a profesionálně připravené. Děkujeme!' 
  },
];

const BENEFITS = [
  {
    icon: Clock,
    title: "Šetříme váš čas",
    description: "Lekce probíhají přímo ve školách a družinách. Nemusíte dělat taxikáře – lektor si děti vyzvedne a po tréninku je zase vrátí.",
    color: "bg-blue-50 text-brand-blue"
  },
  {
    icon: Wallet,
    title: "Rozumná cena",
    description: "Kvalitní taneční výuka nemusí být drahá. Nabízíme profesionální vedení za ceny dostupné pro každou rodinu.",
    color: "bg-green-50 text-green-600"
  },
  {
    icon: Heart,
    title: "Přátelská atmosféra",
    description: "Néstresujeme děti soutěživostí za každou cenu. Hlavní je radost z pohybu, budování přátelství a týmového ducha.",
    color: "bg-red-50 text-brand-red"
  },
  {
    icon: Trophy,
    title: "Vystoupení a show",
    description: "Každý rok pořádáme velké závěrečné show v profesionálním divadle, kde každé dítě zažije svůj hvězdný moment.",
    color: "bg-purple-50 text-purple-600"
  }
];

const Home: React.FC = () => {
  return (
    <>
      <Hero />
      
      {/* Programs Teaser Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900">Co u nás najdete?</h2>
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-lg">
                Provedeme vaše děti světem tance od prvních krůčků až po vystoupení na pódiu.
                Vyberte si program, který vám nejvíce vyhovuje.
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Krouzky Card */}
            <RevealOnScroll delay={100}>
              <div className="group relative rounded-2xl overflow-hidden shadow-xl aspect-[4/3] md:aspect-[16/9] cursor-pointer">
                <img 
                  src="https://static.wixstatic.com/media/93005c_4ab5a66bf36d4345a999b8a126bff477~mv2.jpg/v1/fill/w_1000,h_600,al_c,q_85/dance-school.jpg" 
                  alt="Taneční kroužky" 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8 text-left">
                  <div className="flex items-center text-brand-lightBlue mb-3">
                    <Music className="w-5 h-5 mr-2" />
                    <span className="uppercase tracking-wider text-xs font-bold bg-white/10 px-2 py-1 rounded backdrop-blur-md">Školní rok 2026/2027</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Taneční kroužky na školách</h3>
                  <p className="text-gray-200 mb-6 max-w-md hidden sm:block">
                    Pohodlně přímo ve vaší škole bez nutnosti dojíždění. Moderní styly, street dance, disko a skvělá parta.
                  </p>
                  <Link to="/krouzky" className="inline-flex items-center text-white font-bold hover:text-brand-lightBlue transition-colors group-hover:translate-x-2 duration-300">
                    Najít moji školu <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </div>
              </div>
            </RevealOnScroll>

            {/* Camps Card */}
            <RevealOnScroll delay={300}>
              <div className="group relative rounded-2xl overflow-hidden shadow-xl aspect-[4/3] md:aspect-[16/9] cursor-pointer">
                <img 
                  src="https://static.wixstatic.com/media/93005c_573dc43953b84fde95242482a4c20b9c~mv2.jpg/v1/fill/w_1000,h_600,al_c,q_85/summer-camp.jpg" 
                  alt="Letní tábory" 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8 text-left">
                  <div className="flex items-center text-orange-400 mb-3">
                    <Sun className="w-5 h-5 mr-2" />
                    <span className="uppercase tracking-wider text-xs font-bold bg-white/10 px-2 py-1 rounded backdrop-blur-md">Léto 2026</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Letní taneční tábory</h3>
                  <p className="text-gray-200 mb-6 max-w-md hidden sm:block">
                    Týden plný zážitků, her a tance v přírodě nebo ve městě. Příměstské i pobytové varianty pro všechny.
                  </p>
                  <Link to="/tabory" className="inline-flex items-center text-white font-bold hover:text-orange-400 transition-colors group-hover:translate-x-2 duration-300">
                    Vybrat turnus <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* NEW Benefits Section */}
      <section className="py-20 bg-gray-50 relative overflow-hidden">
         {/* Decorative elements */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-red/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>

         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <RevealOnScroll>
              <div className="text-center mb-16">
                 <span className="text-brand-red font-bold tracking-wider uppercase text-sm">Proč Olymp Dance?</span>
                 <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mt-2">Děláme to jinak. Děláme to srdcem.</h2>
              </div>
            </RevealOnScroll>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
               {BENEFITS.map((benefit, idx) => (
                  <RevealOnScroll key={idx} delay={idx * 150}>
                     <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group h-full hover:-translate-y-2">
                        <div className={`w-14 h-14 ${benefit.color} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                           <benefit.icon size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                        <p className="text-gray-600 leading-relaxed text-sm">
                           {benefit.description}
                        </p>
                     </div>
                  </RevealOnScroll>
               ))}
            </div>
         </div>
      </section>

      {/* Stats/Trust Section */}
      <section className="py-20 bg-brand-blue text-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mt-32 blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-red/20 rounded-full -mr-32 -mb-32 blur-3xl animate-float-delayed"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                <RevealOnScroll delay={0}>
                  <div className="flex flex-col items-center">
                      <div className="bg-white/10 p-4 rounded-full mb-4 text-brand-lightBlue hover:rotate-12 transition-transform duration-300">
                          <Star className="w-8 h-8" />
                      </div>
                      <div className="text-4xl md:text-5xl font-bold font-display mb-2">30+</div>
                      <div className="text-blue-100 text-sm font-semibold uppercase tracking-wide">Partnerských škol</div>
                  </div>
                </RevealOnScroll>
                
                <RevealOnScroll delay={100}>
                  <div className="flex flex-col items-center">
                      <div className="bg-white/10 p-4 rounded-full mb-4 text-brand-lightBlue hover:rotate-12 transition-transform duration-300">
                          <Users className="w-8 h-8" />
                      </div>
                      <div className="text-4xl md:text-5xl font-bold font-display mb-2">500+</div>
                      <div className="text-blue-100 text-sm font-semibold uppercase tracking-wide">Spokojených dětí</div>
                  </div>
                </RevealOnScroll>

                <RevealOnScroll delay={200}>
                   <div className="flex flex-col items-center">
                      <div className="bg-white/10 p-4 rounded-full mb-4 text-brand-lightBlue hover:rotate-12 transition-transform duration-300">
                          <Music className="w-8 h-8" />
                      </div>
                      <div className="text-4xl md:text-5xl font-bold font-display mb-2">10</div>
                      <div className="text-blue-100 text-sm font-semibold uppercase tracking-wide">Let tradice</div>
                  </div>
                </RevealOnScroll>

                <RevealOnScroll delay={300}>
                   <div className="flex flex-col items-center">
                      <div className="bg-white/10 p-4 rounded-full mb-4 text-brand-lightBlue hover:rotate-12 transition-transform duration-300">
                          <Sun className="w-8 h-8" />
                      </div>
                      <div className="text-4xl md:text-5xl font-bold font-display mb-2">100%</div>
                      <div className="text-blue-100 text-sm font-semibold uppercase tracking-wide">Radosti z pohybu</div>
                  </div>
                </RevealOnScroll>
            </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <RevealOnScroll>
             <div className="text-center mb-16">
               <span className="text-brand-blue font-bold tracking-wider uppercase text-sm">Reference</span>
               <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mt-2">Co o nás říkají rodiče</h2>
             </div>
           </RevealOnScroll>

           <div className="grid md:grid-cols-3 gap-8">
             {TESTIMONIALS.map((item, idx) => (
                <RevealOnScroll key={idx} delay={idx * 150}>
                  <div className="bg-gray-50 p-8 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col relative hover:shadow-md transition-shadow">
                     <Quote className="absolute top-6 right-6 text-brand-gray w-10 h-10 opacity-50" />
                     <p className="text-gray-600 mb-6 italic relative z-10">"{item.text}"</p>
                     <div className="mt-auto flex items-center">
                        <div className="w-10 h-10 bg-brand-blue/10 rounded-full flex items-center justify-center text-brand-blue font-bold mr-3">
                          {item.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{item.name}</div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide">{item.role}</div>
                        </div>
                     </div>
                  </div>
                </RevealOnScroll>
             ))}
           </div>
        </div>
      </section>

      {/* CTA Section */}
       <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
           <RevealOnScroll>
             <div className="inline-block p-4 bg-brand-red/10 rounded-full mb-6">
                <Users className="w-8 h-8 text-brand-red" />
             </div>
             <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-6">Přidejte se k nám!</h2>
             <p className="text-xl text-gray-600 mb-10 leading-relaxed">
               Nevíte, který kroužek je pro vaše dítě ten pravý? Nebo máte dotaz k táborům?
               Napište nám, rádi vám se vším poradíme.
             </p>
             <Link to="/kontakt" className="inline-flex items-center bg-brand-red text-white hover:bg-red-800 font-bold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:shadow-red-200 text-lg group transform hover:-translate-y-1">
               Kontaktovat nás <ArrowRight className="ml-2 w-5 h-5 group-hover:ml-3 transition-all" />
             </Link>
           </RevealOnScroll>
        </div>
      </section>
    </>
  );
};
export default Home;