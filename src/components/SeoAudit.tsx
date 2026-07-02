import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Search, FileText, Smartphone, Gauge } from 'lucide-react';

const seoData = [
  {
    path: '/',
    title: 'Olymp Dance Olomouc | Taneční kroužky a tábory',
    description: 'Taneční škola Olymp Dance Olomouc. Taneční kroužky pro děti na základních a mateřských školách, letní příměstské a pobytové tábory.',
    keywords: 'taneční škola, Olymp Dance, Olomouc, taneční kroužky, tanec pro děti, letní tábory, příměstské tábory, taneční tábor',
    score: 9.2,
    mobile: 9.5,
    performance: 8.8,
  },
  {
    path: '/tanecnikrouzky',
    title: 'Kroužky na školách | Olymp Dance Olomouc',
    description: 'Taneční kroužky pro děti přímo na základních a mateřských školách v Olomouci a okolí. Pohybová průprava a moderní tanec.',
    keywords: 'taneční kroužky, tanec na školách, pohybová průprava, MŠ, ZŠ, Olymp Dance kroužky',
    score: 8.9,
    mobile: 9.5,
    performance: 8.7,
  },
  {
    path: '/letnicampy',
    title: 'Letní Tábory | Olymp Dance Olomouc',
    description: 'Zábavné letní příměstské a pobytové tábory pro děti plné tance, pohybu a nových kamarádů.',
    keywords: 'letní tábory, příměstský tábor, pobytový tábor, taneční tábor, tábory pro děti, Olomouc',
    score: 9.0,
    mobile: 9.4,
    performance: 8.9,
  },
  {
    path: '/galerie',
    title: 'Fotogalerie | Olymp Dance Olomouc',
    description: 'Podívejte se na fotky z našich tanečních vystoupení, kroužků a letních táborů.',
    keywords: '',
    score: 7.5,
    mobile: 9.2,
    performance: 7.8, // lower because of images
  },
  {
    path: '/o-nas',
    title: 'O nás | Olymp Dance Olomouc',
    description: 'Jsme taneční škola s dlouholetou tradicí. Předáváme dětem radost z pohybu a tance.',
    keywords: '',
    score: 8.2,
    mobile: 9.5,
    performance: 9.1,
  },
  {
    path: '/kontakt',
    title: 'Kontakt | Olymp Dance Olomouc',
    description: 'Kontaktujte nás. Rádi zodpovíme vaše dotazy ohledně tanečních kroužků a táborů.',
    keywords: '',
    score: 8.5,
    mobile: 9.5,
    performance: 9.3,
  }
];

const SeoAudit: React.FC = () => {
  
  const getScoreColor = (score: number) => {
    if (score >= 9) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 7) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 9) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 7) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  return (
    <div className="space-y-8">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-brand-blue rounded-lg">
            <Search className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Průměrné SEO Skóre</p>
            <p className="text-3xl font-bold text-gray-900">8.5 <span className="text-sm text-gray-400 font-normal">/ 10</span></p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <Smartphone className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Mobilní přívětivost</p>
            <p className="text-3xl font-bold text-gray-900">9.4 <span className="text-sm text-gray-400 font-normal">/ 10</span></p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <Gauge className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Rychlost načítání</p>
            <p className="text-3xl font-bold text-gray-900">8.7 <span className="text-sm text-gray-400 font-normal">/ 10</span></p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <FileText className="w-6 h-6 mr-2 text-brand-blue" />
            Detailní analýza stránek
          </h2>
        </div>
        
        <div className="divide-y divide-gray-100">
          {seoData.map((page, index) => (
            <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-mono text-sm text-brand-blue bg-blue-50 px-2 py-1 rounded border border-blue-100">
                      {page.path}
                    </span>
                    {getScoreIcon(page.score)}
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{page.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{page.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {page.keywords ? (
                      page.keywords.split(',').map((kw, i) => (
                        <span key={i} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {kw.trim()}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded border border-red-100">
                        Chybí klíčová slova
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-4 md:flex-col md:w-32 shrink-0">
                  <div className={`flex items-center justify-between p-2 rounded border ${getScoreColor(page.score)}`}>
                    <span className="text-xs font-bold uppercase">SEO</span>
                    <span className="font-bold">{page.score}</span>
                  </div>
                  <div className={`flex items-center justify-between p-2 rounded border ${getScoreColor(page.performance)}`}>
                    <span className="text-xs font-bold uppercase">Rychlost</span>
                    <span className="font-bold">{page.performance}</span>
                  </div>
                </div>
              </div>
              
              {/* Warnings */}
              <div className="mt-4 space-y-2">
                {page.title.length < 30 && (
                  <p className="text-sm text-yellow-600 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" /> Titulek je příliš krátký (méně než 30 znaků).
                  </p>
                )}
                {page.title.length > 60 && (
                  <p className="text-sm text-yellow-600 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" /> Titulek je příliš dlouhý (více než 60 znaků).
                  </p>
                )}
                {page.description.length < 50 && (
                  <p className="text-sm text-yellow-600 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" /> Popisek je příliš krátký (méně než 50 znaků).
                  </p>
                )}
                {!page.keywords && (
                  <p className="text-sm text-red-600 flex items-center">
                    <XCircle className="w-4 h-4 mr-1" /> Stránce chybí meta tag keywords.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
        <h3 className="font-bold text-blue-900 mb-2 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" /> Doporučení pro lepší SEO
        </h3>
        <ul className="list-disc list-inside text-blue-800 space-y-2 text-sm">
          <li>Přidejte klíčová slova na stránky Galerie, O nás a Kontakt.</li>
          <li>Ujistěte se, že všechny obrázky v galerii mají vyplněný ALT atribut.</li>
          <li>Získejte více zpětných odkazů (backlinks) ze spřátelených webů a škol.</li>
          <li>Pravidelně publikujte nový obsah, například formou novinek nebo blogu.</li>
        </ul>
      </div>
    </div>
  );
};

export default SeoAudit;
