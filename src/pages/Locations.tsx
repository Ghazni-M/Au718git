import React, { useState } from 'react';
import { 
  MapPin, 
  Phone,  
  Clock, 
  Truck, 
  Globe, 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Navigation 
} from 'lucide-react';
import { FaInstagram } from 'react-icons/fa';
import { COMPANY_INFO } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useLanguage } from '../lib/LanguageContext';
import LagosLocationImg from '../images/Lagos718-unsplash.jpg';
import DubaiImg from '../images/DubaiAu718-unsplash.jpg';

export const Locations = () => {
  const { t } = useLanguage();
  const [activeLocation, setActiveLocation] = useState<typeof COMPANY_INFO.locations[number] | null>(null);
  const [copied, setCopied] = useState(false);

  // Map each city to its correct image
  const locationImages: Record<string, string> = {
    "Lagos": LagosLocationImg,
    "Dubai": DubaiImg,
  };

  const handleCopyAddress = (addressStr: string) => {
    navigator.clipboard.writeText(addressStr);
    setCopied(true);
    toast.success(t('success.copied', 'Store address copied to clipboard!'));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pt-32 pb-24 bg-luxury-black min-h-screen">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-24">
           <span className="text-gold uppercase tracking-[0.3em] text-xs font-bold block mb-4">{t('loc.tagline', 'Our Presence')}</span>
           <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-8 uppercase">{t('loc.title', 'Store Locations')}</h1>
           <p className="text-white/60 max-w-2xl mx-auto font-light leading-relaxed">
             {t('loc.desc', 'Experience the weight of pure gold in person. Visit our premium showrooms for a private viewing and consultation.')}
           </p>
        </div>

        {/* Locations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-32">
          {COMPANY_INFO.locations.map((loc, i) => {
            // Get the correct image for this location (fallback to Lagos if not found)
            const imageSrc = locationImages[loc.city] || LagosLocationImg;

            return (
              <div 
                key={i} 
                className="group relative bg-neutral-900/50 rounded-3xl overflow-hidden border border-white/5 hover:border-gold/30 transition-all duration-300"
              >
                <div className="h-64 relative overflow-hidden">
                  <img 
                    src={imageSrc}
                    alt={`${loc.city} Store Location`}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 opacity-60 group-hover:opacity-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent"></div>
                  <div className="absolute bottom-10 left-10">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-white">{t('loc.city.' + loc.city, loc.city)}</h2>
                  </div>
                </div>
               
                <div className="p-10 space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold flex-shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-2">{t('loc.address_label', 'Address')}</h4>
                      <p className="text-white/60 text-lg">{t('loc.address.' + loc.city, loc.address)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold flex-shrink-0">
                        <Clock size={20} />
                      </div>
                      <div>
                        <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-2">{t('loc.working_hours_title', 'Opening Hours')}</h4>
                        <p className="text-white/60 text-sm">{t('loc.working_hours_details', 'Mon - Sat: 9:00 AM - 6:00 PM')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold flex-shrink-0">
                        <Phone size={20} />
                      </div>
                      <div>
                        <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-2">{t('loc.direct_contact', 'Direct Contact')}</h4>
                        <p className="text-white/60 text-sm">
                          {COMPANY_INFO.whatsapp?.[i]?.number || t('loc.whatsapp_contact', 'Contact via WhatsApp')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setActiveLocation(loc)}
                    className="w-full py-4 border border-gold/30 text-gold uppercase tracking-widest text-xs font-bold rounded-xl hover:bg-gold hover:text-black hover:border-gold transition-all duration-300 cursor-pointer"
                  >
                    {t('loc.get_directions')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Delivery Info */}
        <div className="bg-neutral-900/40 p-12 md:p-20 rounded-[3rem] border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 text-gold/5 pointer-events-none">
            <Globe size={400} />
          </div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-8 leading-tight">
                {t('loc.cant_visit_title', "Can't Visit Us In Store?")}
              </h2>
              <p className="text-white/60 text-lg mb-10 leading-relaxed">
                {t('loc.cant_visit_desc', 'We offer discrete and secure nationwide and international shipping. Every package is fully insured from our vault to your door.')}
              </p>
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-3">
                  <Truck className="text-gold" size={20} />
                  <span className="text-white text-xs font-bold uppercase tracking-widest">{t('loc.global_shipping', 'Global Shipping')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FaInstagram className="text-gold" size={20} />
                  <span className="text-white text-xs font-bold uppercase tracking-widest">{t('loc.video_consults', 'Video Consults')}</span>
                </div>
              </div>
            </div>
             
            <div className="space-y-6">
              <div className="p-8 bg-black rounded-2xl border border-white/5">
                <h4 className="text-gold text-sm font-bold uppercase tracking-widest mb-4">{t('loc.lagos_shipping', 'Lagos Shipping')}</h4>
                <p className="text-white/60 text-xs">{t('loc.lagos_shipping_desc', 'Express same-day or -5 day delivery via luxury courier. Secure handling guaranteed.')}</p>
              </div>
              <div className="p-8 bg-black rounded-2xl border border-white/5">
                <h4 className="text-gold text-sm font-bold uppercase tracking-widest mb-4">{t('loc.nationwide_delivery', 'Nationwide Delivery')}</h4>
                <p className="text-white/60 text-xs">{t('loc.nationwide_delivery_desc', '3-10 business days to any major city in Nigeria with real-time tracking.')}</p>
              </div>
              <div className="p-8 bg-black rounded-2xl border border-white/5">
                <h4 className="text-gold text-sm font-bold uppercase tracking-widest mb-4">{t('loc.intl_shipping', 'International')}</h4>
                <p className="text-white/60 text-xs">{t('loc.intl_shipping_desc', 'Available upon request via specialized international carriers.')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Directions & Interactive Map Modal overlay */}
      <AnimatePresence>
        {activeLocation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveLocation(null)}
              className="absolute inset-0 bg-emerald-deep/95 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-4xl bg-emerald-950 border-gold/15 overflow-hidden flex flex-col md:flex-row shadow-2xl z-10 max-h-[90vh] md:max-h-none"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveLocation(null)}
                className="absolute top-4 right-4 md:top-6 md:right-6 bg-white/60 hover:bg-gold/20 text-white hover:text-gold p-2.5 rounded-full transition-all z-25 cursor-pointer border border-white/5 hover:border-gold/30"
                aria-label="Close directions modal"
              >
                <X size={16} />
              </button>

              {/* Map Holder */}
              <div className="w-full md:w-[55%] h-[240px] sm:h-[300px] md:h-[480px] relative bg-neutral-950 border-b md:border-b-0 md:border-r border-gold/10">
                <iframe
                  title={`${t('loc.city.' + activeLocation.city, activeLocation.city)} Map`}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(`${activeLocation.address}, ${activeLocation.city}, Nigeria`)}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                  className="w-full h-full border-0 brightness-[0.7] contrast-[1.2] invert"
                  allowFullScreen
                  loading="lazy"
                />
                 <div className="absolute top-4 left-4 bg-black/65 backdrop-blur-md border border-white/5 px-4 py-2 rounded-xl flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-white/80">{t('loc.active_gps')}</span>
                </div>
              </div>

              {/* Text / Actions Panel */}
              <div className="w-full md:w-[45%] p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[calc(90vh-240px)] md:max-h-[480px] bg-neutral-950/40">
                <div className="space-y-6">
                  <div>
                    <span className="text-gold uppercase tracking-[0.3em] text-[10px] font-black block mb-1 font-sans">
                      {t('loc.modal.access')}
                    </span>
                    <h3 className="text-3xl font-serif font-bold text-white mb-2">
                      {t('loc.city.' + activeLocation.city, activeLocation.city)} {t('loc.modal.showroom')}
                    </h3>
                  </div>

                  {/* Address Section */}
                  <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 space-y-3">
                    <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-gold tracking-wider font-sans">
                      <MapPin size={12} />
                      <span>{t('loc.modal.address_details')}</span>
                    </div>
                    <p className="text-sm text-white/80 font-light leading-relaxed">
                      {t('loc.address.' + activeLocation.city, activeLocation.address)}
                    </p>
                    <button
                      onClick={() => handleCopyAddress(`${activeLocation.address}, ${activeLocation.city}`)}
                      className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-white/50 hover:text-gold transition-colors duration-200 cursor-pointer font-sans"
                    >
                      {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{copied ? t('loc.modal.copied') : t('loc.modal.copy_address')}</span>
                    </button>
                  </div>

                  {/* Operational Information */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-white/60 text-xs font-light">
                      <Clock size={14} className="text-gold flex-shrink-0" />
                      <span>{t('loc.working_hours_details', 'Mon - Sat: 9:00 AM - 6:00 PM')}</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/60 text-xs font-light">
                      <Phone size={14} className="text-gold flex-shrink-0" />
                      <span>{COMPANY_INFO.whatsapp?.[COMPANY_INFO.locations.indexOf(activeLocation)]?.number || "08160189572"}</span>
                    </div>
                  </div>
                </div>

                {/* Direct Action Navigation triggers */}
                <div className="space-y-3 mt-6">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${activeLocation.address}, ${activeLocation.city}, Nigeria`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 bg-gold hover:bg-yellow-500 text-black uppercase tracking-widest text-xs font-black rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-sans"
                  >
                    <Navigation size={14} />
                    <span>{t('loc.modal.gmaps')}</span>
                    <ExternalLink size={10} className="opacity-60" />
                  </a>

                  <a
                    href={`https://maps.apple.com/maps?daddr=${encodeURIComponent(`${activeLocation.address}, ${activeLocation.city}, Nigeria`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 border border-white/10 hover:border-gold/30 text-white hover:text-gold uppercase tracking-widest text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-sans"
                  >
                    <span>{t('loc.modal.amaps')}</span>
                    <ExternalLink size={10} className="opacity-40" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
