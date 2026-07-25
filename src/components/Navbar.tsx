
import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X, Phone, ChevronDown } from 'lucide-react';
import { TikTokIcon } from './BrandIcons';
import { motion, AnimatePresence } from 'motion/react';
import { COMPANY_INFO } from '../constants';
import { useLanguage, Language } from '../lib/LanguageContext';
import { FaInstagram } from 'react-icons/fa';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const { language, setLanguage, t, isRtl } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.shop'), path: '/shop' },
    { name: t('nav.investment'), path: '/investment' },
    { name: t('nav.custom'), path: '/custom' },
    { name: t('nav.consultation'), path: '/consultation' },
    { name: t('nav.locations'), path: '/locations' },
  ];

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'ar', name: 'العربية', flag: '🇦🇪' },
  ];

  const currentLangObj = languages.find(l => l.code === language) || languages[0];

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isScrolled ? 'bg-background/90 backdrop-blur-md py-3 border-b border-gold/20' : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
        <Link to="/" className="flex flex-col items-center group">
          <span className="text-2xl sm:text-3xl md:text-[2.5rem] font-serif font-bold tracking-[2px] sm:tracking-[4px] text-gold group-hover:text-gold-bright transition-colors drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">
            AU718
          </span>
        </Link>


        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-10">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `text-[0.75rem] uppercase tracking-[2px] font-semibold transition-all hover:text-gold border-b border-transparent pb-1 ${
                  isActive ? 'text-gold border-gold' : 'text-white/80'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* Desktop Icons + Language Switcher */}
        <div className="hidden md:flex items-center gap-6">
          {/* Social Icons */}
          <a
            href={`https://instagram.com/${COMPANY_INFO.instagram.replace('@', '')}`}
            target="_blank"
            rel="noreferrer"
            className="text-white/70 hover:text-gold transition-colors"
            aria-label="Instagram"
          >
            <FaInstagram size={20} />
          </a>

         <a 
            href="https://www.tiktok.com/@au718goldstore"
            target="_blank"
            rel="noopener norefferer"
            className="w-10 h-10 rounded-full border border-gold/20 flex items-center justify-center text-gold hover:bg-gold transition-all duration-500 hover:text-black"
          >

            <TikTokIcon size={20} />
          </a>


          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1.5 text-[0.75rem] uppercase tracking-[2px] font-bold text-white/80 hover:text-gold transition-colors cursor-pointer py-1"
            >
              <span>{currentLangObj.flag}</span>
              <span>{currentLangObj.code.toUpperCase()}</span>
              <ChevronDown
                size={12}
                className={`transition-transform duration-300 ${isLangOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <AnimatePresence>
              {isLangOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute mt-2 w-40 bg-neutral-900 border border-gold/20 rounded-xl overflow-hidden py-1 shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-50 origin-top-right ${
                      isRtl ? 'left-0' : 'right-0'
                    }`}
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLangOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-gold/10 text-xs transition-colors duration-200 cursor-pointer text-left ${
                          language === lang.code ? 'text-gold font-bold bg-gold/5' : 'text-white/80'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span className="font-sans">{lang.name}</span>
                        </span>
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

         {/* mobile menu button */}
        <button 
          className="md:hidden text-gold"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-gold/20 overflow-hidden"
          >
            <div className="flex flex-col p-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gold uppercase tracking-widest text-sm py-2"
                >
                  {link.name}
                </Link>
              ))}

              {/* Language Switcher in Mobile */}
              <div className="border-t border-gold/15 pt-6 mt-4">
                <span className="text-[10px] uppercase font-semibold text-white/40 tracking-[2px] block mb-3">
                  {t('nav.switch')}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsMenuOpen(false);
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all cursor-pointer ${
                        language === lang.code
                          ? 'border-gold bg-gold/10 text-gold font-bold'
                          : 'border-white/5 bg-white/[0.02] text-gold/70 hover:border-gold/30'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>

                {/* Mobile Social Icons */}
                <div className="flex gap-6 pt-6">
                  <a
                    href={`https://instagram.com/${COMPANY_INFO.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gold hover:text-gold-bright transition-colors"
                  >
                    <FaInstagram size={22} />
                  </a>

                  <a 
                href="https://www.tiktok.com/@au718goldstore"
                className="w-10 h-10 rounded-full border border-gold/20 flex items-center justify-center text-gold hover:bg-gold transition-all duration-500 hover:text-black"
                >
                    <TikTokIcon size={22} />
                  </a>

                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};