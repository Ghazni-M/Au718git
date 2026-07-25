import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, ArrowRight, ShieldCheck, Gem, Globe, PenTool } from 'lucide-react';
import { Link } from 'react-router-dom';
import { REVIEWS } from '../types';
import { COMPANY_INFO, WHATSAPP_URL } from '../constants';
import { useLanguage } from '../lib/LanguageContext';

// Public image assets for hero and category sections
import GoldBarsImg from '../images/GOLD-BAR.png';
import NecklacesImg from '../images/AUNECKLACE.jpg';
import BraceletImg from '../images/ÀSÌÁ-BRACELET.jpg';
import RingImg from '../images/AURING-GOLD.jpg';
import BackgroundImg from '../images/AU718-HOMEPAGE.jpg';
import HomeFeatureImg from '../images/AU718-HOMEPAGE-collection.jpg';
export const Home = () => {
  const { t } = useLanguage();

  const categories = [
    { name: t('nav.jewelry_necklace', 'Necklaces'), image: NecklacesImg, path: '/shop?cat=Necklaces' },
    { name: t('nav.jewelry_bracelet', 'Bracelets'), image: BraceletImg, path: '/shop?cat=Bracelets' },
    { name: t('nav.jewelry_gold_bars', 'Gold Bars'), image: GoldBarsImg, path: '/investment' },
    { name: t('nav.jewelry_rings', 'Rings'), image: RingImg, path: '/shop?cat=Rings' },
  ];

  return (
    <div className="pt-0">
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Abstract Particle Background Overlay */}
        <div className="absolute inset-0 z-0 scale-105">
          <img
            src={BackgroundImg}
            alt="Hero Background"
            className="w-full h-full object-cover opacity-60 contrast-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/90 via-emerald-950/60 to-emerald-950"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl pt-24 md:pt-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="block text-amber-400 uppercase tracking-[5px] text-[10px] md:text-xs font-bold mb-6">{t('hero.tagline')}</span>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-[4.5rem] xl:text-[5.5rem] font-serif font-normal tracking-tight text-white mb-8 leading-[1.1] uppercase">
              {t('hero.title1')}<br className="hidden sm:block" />{t('hero.title2')}
            </h1>
            <p className="text-lg md:text-xl text-white/80 font-light mb-10 max-w-2xl mx-auto leading-relaxed">
              {t('hero.desc')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <Link
                to="/shop"
                className="w-full sm:w-auto text-center px-10 py-5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold uppercase tracking-widest text-[0.8rem] transition-all hover:scale-105 shadow-xl shadow-amber-500/30 font-sans"
              >
                {t('hero.btn.jewelry')}
              </Link>
              <Link
                to="/investment"
                className="w-full sm:w-auto text-center px-10 py-5 bg-transparent border border-white/40 text-white font-bold uppercase tracking-widest text-[0.8rem] transition-all hover:bg-white hover:text-emerald-950 font-sans"
              >
                {t('hero.btn.invest')}
              </Link>
            </div>

            {/* Scroll Indicator */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="mt-24 text-white/40 flex flex-col items-center gap-4"
            >
              <span className="uppercase tracking-[0.5em] text-[10px] font-bold">{t('hero.explore')}</span>
              <div className="w-px h-16 bg-gradient-to-b from-amber-400/60 to-transparent"></div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-24 bg-emerald-950">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <span className="text-amber-400 uppercase tracking-widest text-xs font-bold mb-4 block">{t('feat.tagline')}</span>
              <h2 className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight">{t('feat.title')}</h2>
            </div>
            <Link
              to="/shop"
              className="text-amber-400 uppercase tracking-widest text-xs font-bold border-b border-amber-400/40 pb-1 hover:border-amber-400 transition-colors font-sans"
            >
              {t('feat.view_all')}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group relative h-[500px] overflow-hidden rounded-none border border-amber-400/20 bg-emerald-900"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110 opacity-40 group-hover:opacity-70"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-emerald-950 to-transparent pointer-events-none"></div>

                {/* Gold Shimmer Element for visual interest */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] bg-gradient-to-br from-amber-400/10 to-transparent opacity-0 group-hover:opacity-30 transition-opacity rotate-12 -z-10"></div>

                <div className="absolute bottom-10 left-8 right-8">
                  <h3 className="text-3xl font-serif text-white mb-2 leading-none uppercase">{cat.name}</h3>
                  <div className="h-px w-12 bg-amber-400 mb-4 group-hover:w-full transition-all duration-700"></div>
                  <Link
                    to={cat.path}
                    className="inline-flex items-center text-[0.7rem] uppercase tracking-[3px] text-amber-400 hover:text-white transition-colors font-sans"
                  >
                    {t('feat.view_col')} <ArrowRight size={14} className="ml-2" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why AU718 - Value Props */}
      <section className="py-24 bg-emerald-950 border-y border-amber-400/10">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { icon: ShieldCheck, title: t('home.why.title1'), desc: t('home.why.desc1') },
              { icon: Gem, title: t('home.why.title2'), desc: t('home.why.desc2') },
              { icon: PenTool, title: t('home.why.title3'), desc: t('home.why.desc3') },
              { icon: Globe, title: t('home.why.title4'), desc: t('home.why.desc4') }
            ].map((prop, i) => (
              <div key={i} className="stat-item flex flex-col">
                <h4 className="text-2xl md:text-3xl font-serif text-amber-400 mb-2 leading-none">{prop.title}</h4>
                <p className="text-white/60 text-[0.7rem] uppercase tracking-[2px] font-bold">{prop.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gold Investment Highlight */}
      <section className="py-24 relative overflow-hidden bg-emerald-950">
        <div className="container mx-auto px-4 md:px-8 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8 order-2 lg:order-1">
            <span className="text-amber-400 uppercase tracking-[5px] text-xs font-bold">{t('home.standard.tagline')}</span>
            <h2 className="text-5xl md:text-[5rem] font-serif font-normal text-white uppercase leading-none">{t('home.standard.title')}</h2>
            <p className="text-white/80 text-lg leading-relaxed">
              {t('home.standard.desc')}
            </p>
            <Link
              to="/investment"
              className="inline-flex items-center px-10 py-5 bg-transparent border border-amber-400 text-amber-400 font-bold uppercase tracking-widest text-xs hover:bg-amber-400 hover:text-emerald-950 transition-all duration-500 font-sans"
            >
              {t('home.standard.btn')} <ChevronRight size={16} className="ml-2" />
            </Link>
          </div>
          <div className="flex-grow order-1 lg:order-2 flex-1">
            <motion.div
              whileHover={{ y: -10 }}
              className="relative rounded-2xl overflow-hidden aspect-square md:aspect-video lg:aspect-square"
            >
              <img
                src={HomeFeatureImg}
                alt="Gold Investment"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/60 to-transparent"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof / Reviews */}
      <section className="py-24 bg-emerald-950">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <span className="text-amber-400 uppercase tracking-widest text-xs font-bold mb-6 block">{t('home.reviews.tagline')}</span>
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-16 uppercase">{t('home.reviews.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {REVIEWS.map((review) => (
              <div
                key={review.id}
                className="p-10 border border-amber-400/10 rounded-2xl bg-emerald-900/60 text-left backdrop-blur-sm"
              >
                <div className="flex text-amber-400 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Gem size={12} key={i} className="mr-1" fill="currentColor" />
                  ))}
                </div>
                <p className="text-white/80 italic mb-8 leading-relaxed">
                  "{t(`home.reviews.comment.${review.id}`, review.comment)}"
                </p>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400 font-bold text-sm">
                    {review.user.charAt(0)}
                  </div>
                  <span className="font-bold text-white uppercase tracking-widest text-xs">{review.user}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-amber-400 relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-950/10"></div>
        <div className="container mx-auto px-4 md:px-8 relative z-10 text-center">
          <h2 className="text-4xl md:text-7xl font-serif font-bold text-emerald-950 mb-8 leading-tight uppercase">{t('home.cta.title')}</h2>
          <p className="text-emerald-950/80 text-lg md:text-xl font-medium mb-12 max-w-2xl mx-auto">
            {t('home.cta.desc')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <a
              href={WHATSAPP_URL(COMPANY_INFO.whatsapp[0].number, "Hello AU718, I'm ready to own excellence. I'd like to place an order.")}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto text-center px-8 md:px-12 py-5 bg-emerald-950 text-amber-400 font-bold uppercase tracking-widest text-xs md:text-sm rounded-full shadow-2xl hover:scale-105 transition-transform"
            >
              {t('home.cta.whatsapp')}
            </a>
            <a
              href={`https://instagram.com/${COMPANY_INFO.instagram.replace('@', '')}`}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto text-center px-8 md:px-12 py-5 border border-emerald-950 text-emerald-950 font-bold uppercase tracking-widest text-xs md:text-sm rounded-full hover:bg-emerald-950 hover:text-amber-400 transition-all"
            >
              {t('home.cta.instagram')}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
