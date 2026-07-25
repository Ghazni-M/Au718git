
import React from 'react';
import { WhatsAppIcon } from './BrandIcons';
import { COMPANY_INFO, WHATSAPP_URL } from '../constants';
import { motion } from 'motion/react';

export const FloatingWhatsApp = () => {
  return (
    <motion.a
      href={WHATSAPP_URL(COMPANY_INFO.whatsapp[0].number, "Hello AU718 Gold Store, I'm interested in your collections.")}
      target="_blank"
      rel="noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ 
        scale: 1.15,
        boxShadow: "0 0 25px rgba(37, 211, 102, 0.5)"
      }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-8 right-8 z-[100] bg-[#25D366] text-white p-4 rounded-full shadow-2xl transition-all flex items-center justify-center hover:bg-[#20bd5a]"
      aria-label="Contact via WhatsApp"
    >
      <WhatsAppIcon size={28} />
      <span className="absolute -top-1 -right-1 flex h-4 w-4">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
        <span className="relative inline-flex rounded-full h-4 w-4 bg-gold"></span>
      </span>
    </motion.a>
  );
};
