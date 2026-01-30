import React from 'react';
import { Heart, Users, Trophy, Smile } from 'lucide-react';
import RevealOnScroll from './RevealOnScroll';

const About: React.FC = () => {
  return (
    <section className="py-12 bg-white overflow-hidden min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Image Banner */}
        <RevealOnScroll>
          <div className="relative rounded-2xl overflow-hidden shadow-xl mb-16 transform hover:scale-[1.01] transition-transform duration-700">
             <img 
               src="https://static.wixstatic.com/media/93005c_4ab5a66bf36d4345a999b8a126bff477~mv2.jpg/v1/fill/w_1901,h_288,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/93005c_4ab5a66bf36d4345a999b8a126bff477~mv2.jpg" 
               alt="Taneční skupina Olymp Dance" 
               className="w-full h-auto object-cover"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
                <div className="p-8">
                  <h2 className="text-white text-3xl md:text-4xl font-display font-bold">Jsme jeden tým</h2>
                </div>
             </div>
          </div>
        </RevealOnScroll>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <RevealOnScroll className="h-full">
            <div>
              <span className="text-brand-blue font-bold tracking-wider uppercase text-sm">O nás</span>
              <h3 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mt-2 mb-6">
                Více než jen taneční kroužek
              </h3>
              <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
                <p>
                  <strong>Taneční klub Olymp Olomouc</strong> se již řadu let věnuje práci s dětmi a mládeží. 
                  Naším cílem není jen naučit děti taneční kroky, ale především v nich vybudovat 
                  <span className="text-brand-red font-bold"> lásku k pohybu</span>, která jim vydrží celý život.
                </p>
                <p>
                  Zaměřujeme se na moderní taneční styly, disko tance a street dance. 
                  Klademe důraz na týmovou spolupráci, fair play a přátelskou atmosféru na trénincích.
                </p>
              </div>
              
              <div className="mt-8 grid grid-cols-2 gap-4">
                 <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <h4 className="font-bold text-brand-blue text-xl mb-1">10+ let</h4>
                    <p className="text-sm text-gray-600">Zkušeností s výukou</p>
                 </div>
                 <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                    <h4 className="font-bold text-brand-red text-xl mb-1">30+ škol</h4>
                    <p className="text-sm text-gray-600">Kde působíme</p>
                 </div>
              </div>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { icon: Smile, title: "Radost z pohybu", text: "Tréninky vedené zábavnou formou přizpůsobenou věku dětí." },
              { icon: Users, title: "Skvělá parta", text: "Děti si najdou nové kamarády a učí se fungovat v kolektivu." },
              { icon: Trophy, title: "Vystoupení", text: "Pořádáme pravidelná vystoupení a účastníme se soutěží." },
              { icon: Heart, title: "Individuální přístup", text: "Každé dítě je pro nás jedinečné a podporujeme jeho talent." },
            ].map((item, idx) => (
              <RevealOnScroll key={idx} delay={idx * 100}>
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow h-full">
                  <div className="w-12 h-12 bg-brand-gray rounded-full flex items-center justify-center mb-4 text-brand-blue">
                    <item.icon size={24} />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.text}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default About;