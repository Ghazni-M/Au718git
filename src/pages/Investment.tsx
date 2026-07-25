import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  TrendingUp, 
  Lock, 
  Award, 
  ChevronRight, 
  Calculator, 
  Plus, 
  Minus,
  CheckCircle2,
} from 'lucide-react';
import { COMPANY_INFO, WHATSAPP_URL } from '../constants';
import { useLanguage } from '../lib/LanguageContext';
import InvestmentImg from '../images/AU718-HOMEPAGE.jpg';



export const Investment = () => {
  const { t } = useLanguage();
  const [selectedWeight, setSelectedWeight] = useState(1);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [basePrice] = useState(78.50); // Simulated live price per gram in USD

  const bars = [
    { weight: '1g', purity: '99.9% 24K', use: t('it.bar1.use'), desc: t('it.bar1.desc'), icon: '🏆' },
    { weight: '5g', purity: '99.9% 24K', use: t('it.bar2.use'), desc: t('it.bar2.desc'), icon: '🏦' },
    { weight: '10g', purity: '99.9% 24K', use: t('it.bar3.use'), desc: t('it.bar3.desc'), icon: '🛡️' },
    { weight: '50g', purity: '99.9% 24K', use: t('it.bar4.use'), desc: t('it.bar4.desc'), icon: '💼' },
    { weight: '100g', purity: '99.9% 24K', use: t('it.bar5.use'), desc: t('it.bar5.desc'), icon: '🏛️' },
    { weight: '1kg', purity: '99.9% 24K', use: t('it.bar6.use'), desc: t('it.bar6.desc'), icon: '👑' },
  ];

  const faqs = [
    { q: t('it.faq1.q'), a: t('it.faq1.a') },
    { q: t('it.faq2.q'), a: t('it.faq2.a') },
    { q: t('it.faq3.q'), a: t('it.faq3.a') },
    { q: t('it.faq4.q'), a: t('it.faq4.a') }
  ];

  return (
    <div className="pt-20 pb-24 bg-emerald-950 min-h-screen text-white overflow-hidden">
      {/* Live Market Ticker */}
      <div className="bg-emerald-900/80 backdrop-blur-md border-b border-amber-400/10 py-2 overflow-hidden whitespace-nowrap sticky top-20 z-40">
        <div className="flex gap-12 animate-marquee items-center">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 text-[10px] uppercase tracking-widest font-bold">
              <span className="text-white/50">{t('invest.ticker.spot')}</span>
              <span className="text-white font-mono tracking-tight">$2,341.{i % 9}0</span>
              <span className="text-emerald-400 font-mono">+0.{i}2% ▲</span>
              <span className="text-white/10 mx-4">|</span>
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 mt-12 md:mt-24">
        {/* Modern Hero Section */}
        <section className="grid lg:grid-cols-2 gap-20 items-center mb-32">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <span className="inline-block px-4 py-1 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-400 text-[10px] font-bold uppercase tracking-[0.3em]">
              {t('invest.division')}
            </span>
            <h1 className="text-4xl md:text-6xl font-serif font-normal leading-tight uppercase">
              {t('invest.title1')} <br />
              <span className="text-amber-400 italic">{t('invest.title2')}</span>
            </h1>
            <p className="text-white/70 text-lg md:text-xl font-light leading-relaxed max-w-xl">
              {t('invest.desc')}
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <a 
                href={WHATSAPP_URL(COMPANY_INFO.whatsapp[0].number, "I'm interested in an investment portfolio consultation.")}
                className="px-10 py-5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold uppercase tracking-widest text-[10px] transition-all hover:scale-[1.02] shadow-xl shadow-amber-500/30"
              >
                {t('invest.btn.start')}
              </a>
              <button 
                onClick={() => document.getElementById('inventory')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-5 border border-white/30 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
              >
                {t('invest.btn.inventory')}
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="relative aspect-square md:aspect-video lg:aspect-square bg-emerald-900 border border-amber-400/20 overflow-hidden rounded-3xl">
              <img 
                src={InvestmentImg}
                alt="Gold Bullion" 
                className="w-full h-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/70 to-transparent"></div>
              
              {/* Floating Data Card */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-12 left-12 p-6 bg-emerald-950/90 backdrop-blur-xl border border-amber-400/20 rounded-2xl hidden md:block"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center">
                    <TrendingUp size={18} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/50 uppercase font-bold tracking-widest">{t('it.fore.tagline')}</p>
                    <p className="text-lg font-bold text-white">{t('it.fore.value')}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "70%" }}
                      transition={{ duration: 2, delay: 1 }}
                      className="h-full bg-amber-400"
                    />
                  </div>
                  <p className="text-[8px] text-white/40 uppercase tracking-widest">{t('it.fore.curve')}</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Investment Calculator */}
        <section className="py-24 border-y border-amber-400/10 mb-34 bg-emerald-900/50">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl font-serif text-white uppercase tracking-tight">{t('it.calc.title')}</h2>
              <p className="text-white/60 text-sm italic">
                {t('it.calc.desc')}
              </p>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/50 mb-4 block">{t('it.calc.weight')}</label>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setSelectedWeight(m => Math.max(1, m - 10))} 
                      className="w-12 h-12 rounded-full border border-amber-400/30 flex items-center justify-center hover:bg-amber-400 hover:text-emerald-950 transition-all cursor-pointer"
                    >
                      <Minus size={18} />
                    </button>
                    <div className="flex-grow bg-emerald-950 border border-amber-400/30 rounded-2xl p-6 text-center focus-within:border-amber-400 transition-all flex items-center justify-center">
                      <input 
                        type="number"
                        value={selectedWeight || ''}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setSelectedWeight(isNaN(val) || val < 0 ? 0 : val);
                        }}
                        className="w-full bg-transparent text-4xl font-serif font-bold text-amber-400 text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        min="0"
                      />
                      <span className="text-4xl font-serif font-bold text-amber-400">g</span>
                    </div>
                    <button 
                      onClick={() => setSelectedWeight(m => m + 10)} 
                      className="w-12 h-12 rounded-full border border-amber-400/30 flex items-center justify-center hover:bg-amber-400 hover:text-emerald-950 transition-all cursor-pointer"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-12 bg-emerald-900 border border-amber-400/20 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Calculator size={120} className="text-amber-400" />
              </div>
              <div className="relative z-10 space-y-8">
                <div className="flex justify-between items-end border-b border-amber-400/10 pb-6">
                  <span className="text-[10px] uppercase tracking-widest text-white/50">{t('it.calc.market')}</span>
                  <span className="text-2xl font-bold font-mono text-white">≈ ${(selectedWeight * basePrice).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-end border-b border-amber-400/10 pb-6">
                  <span className="text-[10px] uppercase tracking-widest text-white/50">{t('it.calc.cert')}</span>
                  <span className="text-2xl font-bold font-mono">$120.00</span>
                </div>
                <div className="flex justify-between items-end pt-4">
                  <span className="text-sm uppercase tracking-[0.3em] font-bold text-amber-400">{t('it.calc.total')}</span>
                  <span className="text-5xl font-serif font-bold text-white">
                    ${(selectedWeight * basePrice + 120).toLocaleString()}
                  </span>
                </div>
                <a 
                  href={WHATSAPP_URL(COMPANY_INFO.whatsapp[0].number, `I've estimated a cost of $${(selectedWeight * basePrice + 120).toLocaleString()} for ${selectedWeight}g of 24K gold. Can you confirm the current quote?`)}
                  className="w-full py-5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold uppercase tracking-widest text-[10px] text-center block rounded-2xl transition-all"
                >
                  {t('it.calc.lock')}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="mb-32">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
            <div>
              <span className="text-amber-400 uppercase tracking-[5px] text-[10px] font-bold mb-4 block">{t('it.guar.tagline')}</span>
              <h2 className="text-4xl md:text-5xl font-serif font-normal uppercase leading-tight">{t('it.guar.title')}</h2>
            </div>
            <div className="h-0.5 w-32 bg-amber-400/10 hidden md:block mb-6"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: ShieldCheck, title: t('it.benefit1.title'), desc: t('it.benefit1.desc') },
              { icon: Lock, title: t('it.benefit2.title'), desc: t('it.benefit2.desc') },
              { icon: Award, title: t('it.benefit3.title'), desc: t('it.benefit3.desc') },
              { icon: CheckCircle2, title: t('it.benefit4.title'), desc: t('it.benefit4.desc') }
            ].map((item, i) => (
              <div key={i} className="group p-10 border border-amber-400/10 hover:border-amber-400/30 transition-all bg-emerald-900/60 rounded-3xl">
                <div className="w-12 h-12 rounded-full bg-amber-400/10 flex items-center justify-center text-amber-400/70 group-hover:text-amber-400 group-hover:bg-amber-400/20 transition-all mb-8">
                  <item.icon size={22} />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-4">{item.title}</h3>
                <p className="text-white/60 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Inventory Table */}
        <section id="inventory" className="mb-32">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-serif text-white uppercase italic">{t('it.catalog.title')}</h2>
            <p className="text-white/50 text-xs uppercase tracking-[0.3em] font-bold">{t('it.catalog.tagline')}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-amber-400/10 border border-amber-400/10 rounded-3xl overflow-hidden">
            {bars.map((bar, i) => (
              <div key={i} className="p-12 hover:bg-emerald-900/70 transition-all relative group bg-emerald-900">
                <span className="absolute top-12 right-12 text-4xl opacity-10 group-hover:opacity-30 transition-opacity">{bar.icon}</span>
                <h4 className="text-4xl font-serif text-white mb-2 leading-none">{bar.weight}</h4>
                <p className="text-amber-400 text-[10px] uppercase font-bold tracking-[0.2em] mb-6">{bar.purity}</p>
                <p className="text-white/60 text-xs leading-relaxed mb-10 max-w-[200px] font-light">
                  {bar.desc || bar.use}
                </p>
                <a 
                  href={WHATSAPP_URL(COMPANY_INFO.whatsapp[0].number, `Inquiry: ${bar.weight} 24K Investment Bar.`)}
                  className="flex items-center gap-3 text-[10px] uppercase font-bold tracking-widest text-white/70 hover:text-amber-400 transition-colors"
                >
                  {t('it.catalog.inquire')} <ChevronRight size={14} />
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-32 max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif text-white uppercase mb-4 tracking-tighter">{t('it.faq.title')}</h2>
            <div className="h-0.5 w-12 bg-amber-400 mx-auto"></div>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-amber-400/10 bg-emerald-900/60 overflow-hidden rounded-2xl">
                <button 
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left group cursor-pointer"
                >
                  <span className={`text-sm font-bold uppercase tracking-widest ${activeFaq === i ? 'text-amber-400' : 'text-white/70 group-hover:text-white'}`}>
                    {faq.q}
                  </span>
                  <Plus size={18} className={`transition-transform duration-300 ${activeFaq === i ? 'rotate-45 text-amber-400' : 'text-white/30'}`} />
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-8 pb-8"
                    >
                      <p className="text-white/60 text-[13px] leading-relaxed border-l-2 border-amber-400/30 pl-6 italic">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="relative p-16 md:p-32 rounded-3xl overflow-hidden bg-gradient-to-br from-amber-400 to-amber-500 text-emerald-950 text-center">
          <div className="relative z-10 space-y-12">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-emerald-950/30 bg-emerald-950/10 text-emerald-950 text-[10px] font-bold uppercase tracking-widest mb-4">
              <ShieldCheck size={14} /> {t('it.cta.tagline')}
            </div>
            <h2 className="text-4xl md:text-7xl font-serif font-normal uppercase leading-tight max-w-4xl mx-auto">
              {t('it.cta.title')}
            </h2>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a 
                href={WHATSAPP_URL(COMPANY_INFO.whatsapp[0].number, "I'd like to open an investment account.")}
                className="px-12 py-6 bg-emerald-950 hover:bg-black text-amber-400 font-bold uppercase tracking-[0.2em] text-[10px] shadow-2xl transition-transform hover:scale-105 rounded-2xl"
              >
                {t('it.cta.btn')}
              </a>
              <div className="flex flex-col items-start gap-1">
                <p className="text-[10px] text-emerald-950/70 uppercase tracking-widest font-bold">{t('it.cta.support')}</p>
                <p className="text-sm font-bold text-emerald-950 tracking-widest">{COMPANY_INFO.whatsapp[0].number}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  );
};
