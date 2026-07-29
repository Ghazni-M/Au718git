import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Phone, Mail, MessageSquare, ShieldCheck, Gem, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useLanguage } from '../lib/LanguageContext';
import {api} from '../lib/api';

export const Consultation = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    service: 'Bespoke Jewelry Design',
    preferredDate: '',
    message: ''
  });

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    console.log("📤 Sending payload:", {
      customerName: formData.name,
      customerContact: formData.contact,
      serviceRequested: formData.service,
      preferredDate: formData.preferredDate,
    });

    const response = await api('/api/db/inquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: formData.name,
      customerContact: formData.contact,
      type: 'consultation',
      serviceRequested: formData.service,
      preferredDate: formData.preferredDate,
      message: `[CONSULTATION: ${formData.service}] Preferred Date: ${formData.preferredDate}\n\nClient Notes: ${formData.message}`,
      status: 'unread',

      // Optional but recommended:
      createdAt: new Date().toISOString()
    }),
  });

    console.log("📥 Response status:", response.status, response.statusText);

    const result = await response.json().catch(() => ({})); // prevent json parse crash

    if (!response.ok) {
      console.error("❌ API Error:", result);
      throw new Error(result.error || `HTTP ${response.status}`);
    }

    toast.success("Consultation request submitted successfully!");
    
    // Reset form
    setFormData({ name: '', contact: '', service: 'Bespoke Jewelry Design', preferredDate: '', message: '' });
  } catch (error: any) {
    console.error("🚨 Submit error:", error);
    toast.error(error.message || "Failed to submit request. Please try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="bg-emerald-deep min-h-screen text-white">
      <Navbar />
      
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
            
            {/* Info Column */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-12"
            >
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/20 bg-gold/5 text-gold text-xs font-bold uppercase tracking-[0.2em]">
                  <Gem size={14} />
                  {t('consult.tagline')}
                </div>
                <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tighter leading-[0.9] uppercase">
                  {t('nav.consultation')}
                </h1>
                <p className="text-white/60 text-lg leading-relaxed max-w-md">
                  {t('consult.desc')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                  <ShieldCheck className="text-gold" size={24} />
                  <h3 className="font-serif text-lg font-bold">{t('consult.prop1.title')}</h3>
                  <p className="text-xs text-white/40 leading-relaxed uppercase tracking-wider font-medium">{t('consult.prop1.desc')}</p>
                </div>
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                  <MapPin className="text-gold" size={24} />
                  <h3 className="font-serif text-lg font-bold">{t('consult.prop2.title')}</h3>
                  <p className="text-xs text-white/40 leading-relaxed uppercase tracking-wider font-medium">{t('consult.prop2.desc')}</p>
                </div>
              </div>

              <div className="pt-8 border-t border-white/10 flex items-center gap-8">
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2">{t('consult.hours.tagline')}</p>
                  <p className="text-xl font-serif text-gold">{t('consult.hours.time')}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2">{t('consult.whatsapp.tagline')}</p>
                  <p className="text-xl font-serif text-white hover:text-gold transition-colors cursor-pointer">+234 816 018 9572</p>
                </div>
              </div>
            </motion.div>

            {/* Form Column */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-neutral-900 border border-white/10 p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <Gem size={300} className="text-gold" />
              </div>

              <h2 className="text-3xl font-serif font-bold mb-8 relative z-10">{t('consult.form.title')}</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">{t('consult.form.name')}</Label>
                    <div className="relative">
                      <Input 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                        className="bg-black border-white/10 h-14 pl-12 rounded-xl focus:border-gold transition-all text-white"
                        placeholder={t('consult.form.name.placeholder')}
                      />
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">{t('consult.form.contact')}</Label>
                    <div className="relative">
                      <Input 
                        value={formData.contact}
                        onChange={(e) => setFormData({...formData, contact: e.target.value})}
                        required
                        className="bg-black border-white/10 h-14 pl-12 rounded-xl focus:border-gold transition-all text-white"
                        placeholder={t('consult.form.contact.placeholder')}
                      />
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">{t('consult.form.service')}</Label>
                  <select 
                    value={formData.service}
                    onChange={(e) => setFormData({...formData, service: e.target.value})}
                    className="w-full bg-black border border-white/10 h-14 px-4 rounded-xl focus:border-gold transition-all outline-none text-sm text-white"
                  >
                    <option value="Bespoke Jewelry Design">{t('consult.form.service.option1')}</option>
                    <option value="Gold Bar Investment (In-Person)">{t('consult.form.service.option2')}</option>
                    <option value="Asset Authentication">{t('consult.form.service.option3')}</option>
                    <option value="Wholesale Partnerships">{t('consult.form.service.option4')}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">{t('consult.form.date')}</Label>
                  <div className="relative">
                    <Input 
                      type="date"
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({...formData, preferredDate: e.target.value})}
                      required
                      className="bg-black border-white/10 h-14 pl-12 rounded-xl focus:border-gold transition-all text-white"
                    />
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">{t('consult.form.notes')}</Label>
                  <div className="relative">
                    <textarea 
                      className="w-full bg-black border border-white/10 rounded-xl p-4 pl-12 text-sm focus:border-gold outline-none min-h-[120px] transition-all text-white"
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder={t('consult.form.notes.placeholder')}
                      required
                    />
                    <MessageSquare className="absolute left-4 top-4 text-white/20" size={18} />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-16 gold-gradient text-black font-bold uppercase tracking-[0.2em] text-sm rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-gold/10"
                >
                  {loading ? t('consult.form.btn.loading') : t('consult.form.btn.schedule')}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};