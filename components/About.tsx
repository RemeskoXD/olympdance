import React from 'react';
import { Heart, Users, Trophy, Smile } from 'lucide-react';
import RevealOnScroll from './RevealOnScroll';
import { useData } from '../context/DataContext';

const About: React.FC = () => {
  const { siteContent } = useData();
  const defaultAboutText = `<strong>Taneční klub Olymp Olomouc</strong> se již řadu let věnuje práci s dětmi a mládeží. Naším cílem není jen naučit děti taneční kroky, ale především v nich vybudovat <span class="text-brand-red font-bold">lásku k pohybu</span>, která jim vydrží celý život.<br/><br/>Zaměřujeme se na moderní taneční styly, disko tance a street dance. Klademe důraz na týmovou spolupráci, fair play a přátelskou atmosféru na trénincích.`;
  const aboutText = siteContent?.aboutText || defaultAboutText;

  return (
    <section className="py-8 sm:py-12 bg-white overflow-hidden min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Image Banner */}
        <RevealOnScroll>
          <div className="relative rounded-2xl overflow-hidden shadow-xl mb-8 sm:mb-16 transform hover:scale-[1.01] transition-transform duration-700">
             <img 
               src="/images/dance-school.jpg" 
               alt="Taneční skupina Olymp Dance" 
               className="w-full h-48 sm:h-64 md:h-72 object-cover object-center"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end">
                <div className="p-5 sm:p-8">
                  <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-display font-bold">Jsme jeden tým</h2>
                </div>
             </div>
          </div>
        </RevealOnScroll>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <RevealOnScroll className="h-full">
            <div>
              <span className="text-brand-blue font-bold tracking-wider uppercase text-xs sm:text-sm">O nás</span>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-gray-900 mt-2 mb-4 sm:mb-6">
                Více než jen taneční kroužek
              </h3>
              <div className="space-y-4 sm:space-y-6 text-gray-600 text-base sm:text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: aboutText.replace(/\n/g, '<br/>') }}>
              </div>
              
              <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4">
                 <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <h4 className="font-bold text-brand-blue text-lg sm:text-xl mb-1">10+ let</h4>
                    <p className="text-xs sm:text-sm text-gray-600">Zkušeností s výukou</p>
                 </div>
                 <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                    <h4 className="font-bold text-brand-red text-lg sm:text-xl mb-1">30+ škol</h4>
                    <p className="text-xs sm:text-sm text-gray-600">Kde působíme</p>
                 </div>
              </div>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {[
              { icon: Smile, title: "Radost z pohybu", text: "Tréninky vedené zábavnou formou přizpůsobenou věku dětí." },
              { icon: Users, title: "Skvělá parta", text: "Děti si najdou nové kamarády a učí se fungovat v kolektivu." },
              { icon: Trophy, title: "Vystoupení", text: "Pořádáme pravidelná vystoupení a účastníme se soutěží." },
              { icon: Heart, title: "Individuální přístup", text: "Každé dítě je pro nás jedinečné a podporujeme jeho talent." },
            ].map((item, idx) => (
              <RevealOnScroll key={idx} delay={idx * 100}>
                <div className="bg-white p-5 sm:p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow h-full">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-gray rounded-full flex items-center justify-center mb-3 sm:mb-4 text-brand-blue shrink-0">
                    <item.icon size={22} className="sm:w-6 sm:h-6" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1.5 sm:mb-2 text-base sm:text-lg">{item.title}</h4>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{item.text}</p>
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