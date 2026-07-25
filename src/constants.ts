import { Phone } from "lucide-react";

export const COMPANY_INFO = {
  name: "AU718 Gold Store",
  tagline: "Own Gold. Wear Power. Invest in Legacy.",
  subtext: "Premium 18K, 21K, 22K & 24K authentic gold jewelry and investment bars.",
  locations: [
    { city: "Dubai", address: "1 Sheikh Mohammed bin Rashid Blvd, Downtown Dubai, Dubai, United Arab Emirates." },
    { city: "Lagos", address: "Tejuosho Ultramodern Market, Yaba" }
  ],
  whatsapp: [
    { label: "Sales & Support", number: "08160189572" },
    { label: "Orders", number: "08160189572" } 
  ],
  phone: [
    { label: "Call Direct", number: "08160189572" },
    {label: "Dubai Hot-Line", hotline: "+46 5681 5685"}
  ],

  instagram: "@au718store",
  delivery: {
    lagos: "2–7 days",
    nationwide: "4–10 days",
    international: "Available"
  }
};

export const WHATSAPP_URL = (number: string, message: string) => 
  `https://wa.me/${number.replace(/\s+/g, '')}?text=${encodeURIComponent(message)}`;
