import React, { useState } from 'react';
import { 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';
import { FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { TikTokIcon, WhatsAppIcon } from './BrandIcons';
import { Link } from 'react-router-dom';
import { COMPANY_INFO, WHATSAPP_URL } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';
import {api} from '../lib/api';

export const Footer = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = email ? emailRegex.test(email) : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!isValid) {
      setStatus('error');
      setFeedback(t('footer.newsletter.invalid') || "Please enter a valid email address");
      return;
    }

    setStatus('loading');
    setFeedback('');

    try {
      const res = await api('/api/newsletter/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.error?.toLowerCase().includes('already') || result.error?.includes('exist')) {
          setStatus('error');
          setFeedback(t('footer.newsletter.already') || "You're already subscribed!");
        } else {
          throw new Error(result.error || 'Subscription failed');
        }
        return;
      }

      setStatus('success');
      setFeedback(t('footer.newsletter.success') || "Thank you! You're now part of the Inner Circle.");
      
      setEmail('');
      setTouched(false);

      setTimeout(() => setStatus('idle'), 5000);

    } catch (error: any) {
      console.error("Newsletter subscription error:", error);
      setStatus('error');
      setFeedback(t('footer.newsletter.error') || "Something went wrong. Please try again.");
    }
  };

  return (
    <footer className="bg-emerald-deep text-white pt-20 pb-10 border-t border-gold/10">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex flex-col">
              <span className="text-2xl font-serif font-bold tracking-tighter text-gold">AU718 GOLD</span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/50">{t('hero.explore')}</span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              {t('footer.brand_desc')}
            </p>
            <div className="flex space-x-4">
              <a 
                href={`https://instagram.com/${COMPANY_INFO.instagram.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full border border-gold/20 flex items-center justify-center text-gold hover:bg-gold transition-all duration-500 hover:text-black"
              >
                <FaInstagram size={18} />
              </a>
              <a 
                href={WHATSAPP_URL(COMPANY_INFO.whatsapp[0].number, "Hello, I'm reaching out from your website footer.")}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full border border-gold/20 flex items-center justify-center text-gold hover:bg-gold transition-all duration-500 hover:text-black"
              >
                <WhatsAppIcon size={18} />
              </a>
              <a
                href="https://www.tiktok.com/@au718goldstore"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-gold/20 flex items-center justify-center text-gold hover:bg-gold transition-all duration-500 hover:text-black"
              >
                <TikTokIcon size={18} />
              </a>
              <a 
                href="https://x.com/Au718golds7516"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-gold/20 flex items-center justify-center text-gold hover:bg-gold transition-all duration-500 hover:text-black"
              >
                <FaXTwitter size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-gold uppercase tracking-widest text-xs font-bold font-sans">{t('footer.quick_links')}</h4>
            <ul className="space-y-3">
              <li><Link to="/shop" className="text-white/60 hover:text-gold text-sm transition-colors font-sans">{t('footer.link_shop')}</Link></li>
              <li><Link to="/investment" className="text-white/60 hover:text-gold text-sm transition-colors font-sans">{t('footer.link_invest')}</Link></li>
              <li><Link to="/custom" className="text-white/60 hover:text-gold text-sm transition-colors font-sans">{t('footer.link_custom')}</Link></li>
              <li><Link to="/consultation" className="text-white/60 hover:text-gold text-sm transition-colors font-sans">{t('footer.link_consult')}</Link></li>
              <li><Link to="/locations" className="text-white/60 hover:text-gold text-sm transition-colors font-sans">{t('footer.link_stores')}</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h4 className="text-gold uppercase tracking-widest text-xs font-bold font-sans">{t('footer.inner_circle')}</h4>
            <p className="text-white/40 text-xs leading-relaxed uppercase tracking-widest font-medium">
              {t('footer.newsletter.title')}
            </p>
            <form onSubmit={handleSubmit} className="space-y-3" noValidate>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error' || status === 'success') {
                      setStatus('idle');
                      setFeedback('');
                    }
                  }}
                  onBlur={() => setTouched(true)}
                  placeholder={t('footer.newsletter.placeholder')}
                  required
                  className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-sm outline-none transition-all placeholder:text-white/20 pr-10 ${
                    touched && email
                      ? isValid ? 'border-emerald-500/50 focus:border-emerald-400' : 'border-red-500/50 focus:border-red-400'
                      : 'border-gold/20 focus:border-gold'
                  }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                  {touched && email && (
                    isValid ? (
                      <CheckCircle2 size={16} className="text-emerald-400" />
                    ) : (
                      <AlertCircle size={16} className="text-red-400" />
                    )
                  )}
                </div>
              </div>

              <AnimatePresence>
                {touched && email && !isValid && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-[11px] text-red-400/90 flex items-center gap-1.5"
                  >
                    <AlertCircle size={12} />
                    <span>{t('footer.validation_format')}</span>
                  </motion.p>
                )}
              </AnimatePresence>

              <button 
                type="submit"
                disabled={status === 'loading'}
                className="w-full gold-gradient text-black font-extrabold uppercase tracking-widest text-[9px] py-4 rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    <span>{t('footer.newsletter.btn_loading') || "SUBSCRIBING..."}</span>
                  </>
                ) : (
                  <span>{t('footer.newsletter.button')}</span>
                )}
              </button>

              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`p-4 rounded-xl border text-xs font-medium ${
                      status === 'success' 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                        : 'bg-red-500/10 border-red-500/30 text-red-300'
                    }`}
                  >
                    {feedback}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>

          {/* Locations */}
          <div className="space-y-6">
            <h4 className="text-gold uppercase tracking-widest text-xs font-bold font-sans">{t('footer.visit_us')}</h4>
            <div className="space-y-4">
              {COMPANY_INFO.locations.map((loc) => (
                <div key={loc.city} className="flex items-start space-x-3">
                  <MapPin size={16} className="text-gold mt-1 flex-shrink-0" />
                  <div>
                    <span className="block text-white text-xs font-bold uppercase tracking-wider">{loc.city}</span>
                    <span className="text-white/60 text-xs">{loc.address}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-gold/10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-white/60">
          <div>© {new Date().getFullYear()} AU718 GOLD STORE PRESTIGE</div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            SECURE WORLDWIDE DELIVERY
          </div>
        </div>
      </div>
    </footer>
  );
};