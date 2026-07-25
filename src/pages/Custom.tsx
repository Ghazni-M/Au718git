import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PenTool, Palette, Hammer, Sparkles, Send } from 'lucide-react';
import { COMPANY_INFO } from '../constants';
import { useLanguage } from '../lib/LanguageContext';
import CustomPageImg from "../images/HOMEPAGE-AU718.jpg"



export const Custom = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'necklace',
    karat: '18K',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.description) {
      alert("Please fill in your name and project details.");
      return;
    }

    const message = `Custom Order Request from ${formData.name}%0A%0A` +
      `Piece Type: ${formData.type}%0A` +
      `Karat: ${formData.karat}%0A` +
      `Details: ${formData.description}%0A%0A` +
      `Email: ${formData.email || 'Not provided'}`;

    // Correct WhatsApp URL format
    const whatsappNumber = COMPANY_INFO.whatsapp[1]?.number || COMPANY_INFO.whatsapp[0]?.number;

    if (!whatsappNumber) {
      alert("WhatsApp number not configured.");
      return;
    }

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

    window.open(whatsappUrl, '_blank');
  };

  const steps = [
    { icon: PenTool, title: t('custom.step1.title'), desc: t('custom.step1.desc') },
    { icon: Palette, title: t('custom.step2.title'), desc: t('custom.step2.desc') },
    { icon: Hammer, title: t('custom.step3.title'), desc: t('custom.step3.desc') },
    { icon: Sparkles, title: t('custom.step4.title'), desc: t('custom.step4.desc') }
  ];

  return (
    <div className="pt-32 pb-24 bg-luxury-black min-h-screen">
      <div className="container mx-auto px-4 md:px-8">
        {/* Hero */}
        <div className="max-w-4xl mx-auto text-center mb-24">
          <span className="text-gold uppercase tracking-[0.4em] text-xs font-bold block mb-4">{t('custom.tagline')}</span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-8 leading-none uppercase">{t('custom.title')}</h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto font-light leading-relaxed">
            {t('custom.desc')}
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-32">
          {steps.map((step, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative group text-center"
            >
              <div className="relative mb-8 inline-block">
                <div className="w-20 h-20 bg-gold/5 border border-gold/10 rounded-full flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-black transition-all duration-500">
                  <step.icon size={32} />
                </div>
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-black border border-gold text-gold flex items-center justify-center text-xs font-bold">
                  0{i + 1}
                </span>
              </div>
              <h3 className="text-xl font-serif font-bold text-white mb-4">{step.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed max-w-[240px] mx-auto">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Form & Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Form */}
          <div className="bg-neutral-900/70 backdrop-blur-xl p-10 md:p-16 rounded-3xl border border-white/10">
            <h2 className="text-3xl font-serif font-bold text-white mb-10">{t('custom.form.title')}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-white/60 uppercase tracking-widest text-xs font-bold block mb-1">{t('custom.form.name')}</label>
                  <input 
                    required
                    type="text" 
                    className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-gold outline-none transition-all"
                    placeholder={t('custom.form.name.placeholder')}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-white/60 uppercase tracking-widest text-xs font-bold block mb-1">{t('custom.form.type')}</label>
                  <select 
                    className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-gold outline-none transition-all"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="necklace">{t('custom.form.type.option1')}</option>
                    <option value="ring">{t('custom.form.type.option2')}</option>
                    <option value="bracelet">{t('custom.form.type.option3')}</option>
                    <option value="earrings">{t('custom.form.type.option4')}</option>
                    <option value="pendant">{t('custom.form.type.option5')}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-white/60 uppercase tracking-widest text-xs font-bold block mb-1">{t('custom.form.karat')}</label>
                <div className="flex gap-3">
                  {['18K', '21K', '22K', '24K'].map((k) => (
                    <button
                      type="button"
                      key={k}
                      onClick={() => setFormData({ ...formData, karat: k })}
                      className={`flex-1 py-4 rounded-2xl border text-sm font-bold uppercase tracking-widest transition-all ${
                        formData.karat === k 
                          ? 'border-gold bg-gold/10 text-gold' 
                          : 'border-white/10 text-white/60 hover:border-white/30'
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-white/60 uppercase tracking-widest text-xs font-bold block mb-1">{t('custom.form.details')}</label>
                <textarea 
                  required
                  rows={6}
                  className="w-full bg-black border border-white/10 rounded-3xl p-5 text-white focus:border-gold outline-none resize-y min-h-[140px]"
                  placeholder={t('custom.form.details.placeholder')}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <button 
                type="submit"
                className="w-full mt-6 py-5 bg-gold hover:bg-amber-400 text-black font-bold uppercase tracking-widest text-sm rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.985]"
              >
                <Send size={18} />
                {t('custom.form.btn')}
              </button>
            </form>
          </div>

          {/* Image Showcase */}
          <div className="relative rounded-3xl overflow-hidden min-h-[520px] lg:min-h-[620px]">
            <img 
              src={CustomPageImg} 
              alt="Bespoke jewelry" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            
            <div className="absolute bottom-12 left-12 right-12">
              <blockquote className="text-white text-2xl md:text-3xl font-serif italic leading-tight mb-8">
                {t('custom.quote')}
              </blockquote>
              <cite className="text-gold uppercase tracking-widest text-xs font-bold">{t('custom.quote.author')}</cite>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};