// src/lib/seed.ts
import ClassicMiamiChainImg from '../images/BIG2AU718.jpg';
import { api } from './api';

const SAMPLE_PRODUCTS = [
  {
    name: "Classic Miami Cuban Link Chain",
    category: "Necklaces",
    karat: "18K",
    price: 1450,
    description: "A timeless 18K solid gold Cuban link chain. Hand-polished for a mirror-like finish. Perfect for daily wear or special occasions.",
    images: [ClassicMiamiChainImg],
    stock: 5,
    status: "published" as const,
  },
  {
    name: "Standard 24K Gold Bar (10g)",
    category: "Investment Bars",
    karat: "24K",
    price: 890,
    description: "Certified 10g fine gold bar. 999.9 purity. Comes with a certificate of authenticity and unique serial number. Ideal for building high-purity wealth.",
    images: ["https://picsum.photos/seed/gold-bar-10g/800/1000"],
    stock: 20,
    status: "published" as const,
  },
  {
    name: "Royal 24K Gold Bar (100g)",
    category: "Investment Bars",
    karat: "24K",
    price: 8850,
    description: "Investment-grade 100g 24K gold bar. The ultimate asset for legacy preservation and serious gold investors.",
    images: ["https://picsum.photos/seed/gold-bar-100/800/1000"],
    stock: 5,
    status: "published" as const,
  },
  {
    name: "Diamond Accented Signet Ring",
    category: "Rings",
    karat: "21K",
    price: 2100,
    description: "Bold 21K gold signet ring featuring a center-set VS1 diamond. A symbol of authority and success in fine craftsmanship.",
    images: ["https://picsum.photos/seed/gold-ring-1/800/1000"],
    stock: 3,
    status: "published" as const,
  },
  {
    name: "Eternity Wedding Band",
    category: "Rings",
    karat: "18K",
    price: 750,
    description: "A seamless 18K gold band representing eternal love. Comfort-fit interior and high-polish exterior.",
    images: ["https://picsum.photos/seed/gold-ring-band/800/1000"],
    stock: 15,
    status: "published" as const,
  },
  {
    name: "Italian Rope Bracelet",
    category: "Bracelets",
    karat: "18K",
    price: 680,
    description: "Intricately woven 18K gold rope bracelet. Lightweight yet durable, featuring a secure lobster claw clasp.",
    images: ["https://picsum.photos/seed/gold-bracelet-1/800/1000"],
    stock: 8,
    status: "published" as const,
  },
  {
    name: "Classic Tennis Bracelet",
    category: "Bracelets",
    karat: "18K",
    price: 1800,
    description: "Exquisite 18K gold tennis bracelet with high-brilliance finish. A staple of modern elegance.",
    images: ["https://picsum.photos/seed/gold-tennis/800/1000"],
    stock: 4,
    status: "published" as const,
  },
  {
    name: "Majestic Purity 24K Bangle",
    category: "Bracelets",
    karat: "24K",
    price: 3200,
    description: "Exquisite 24K pure gold bangle with traditional Nigerian etched patterns. A masterpiece of ancestral craftsmanship.",
    images: ["https://picsum.photos/seed/gold-bangle-24k/800/1000"],
    stock: 2,
    status: "published" as const,
  },
  {
    name: "Heritage Cross Pendant",
    category: "Necklaces",
    karat: "21K",
    price: 580,
    description: "Solid 21K gold cross pendant. Deeply engraved with classic filigree work. A legacy piece for your personal collection.",
    images: ["https://picsum.photos/seed/gold-cross/800/1000"],
    stock: 12,
    status: "published" as const,
  },
  {
    name: "Medallion Chain Set",
    category: "Necklaces",
    karat: "21K",
    price: 2450,
    description: "Bold 21K gold chain with a matching sunburst medallion pendant. Heavy-weight luxury for the modern elite.",
    images: ["https://picsum.photos/seed/gold-medallion/800/1000"],
    stock: 3,
    status: "published" as const,
  },
  {
    name: "Teardrop Dangle Earrings",
    category: "Earrings",
    karat: "21K",
    price: 920,
    description: "Graceful 21K gold teardrop earrings. Elegant movement and brilliant light reflection. Perfect for special nights out.",
    images: ["https://picsum.photos/seed/gold-earring-tear/800/1000"],
    stock: 6,
    status: "published" as const,
  }
];

const CATEGORIES = ["Necklaces", "Bracelets", "Rings", "Earrings", "Investment Bars"];

export const seedDatabase = async () => {
  try {
    console.log("🔄 Checking if database needs seeding...");

    // Check if products already exist
    const existingProducts = await api<any[]>('/api/products?limit=5');

    if (existingProducts.length > 0) {
      console.log(`✅ Database already has ${existingProducts.length} products. Skipping seed.`);
      return;
    }

    console.log("🌱 Seeding initial data...");

    // Seed Categories
    for (const catName of CATEGORIES) {
      try {
        await api('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: catName }),
        });
      } catch (err) {
        console.warn(`Failed to seed category "${catName}":`, err);
      }
    }
    console.log("📂 Categories seeded.");

    // Seed Products
    for (const product of SAMPLE_PRODUCTS) {
      try {
        await api('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product),
        });
      } catch (err) {
        console.warn(`Failed to seed product "${product.name}":`, err);
      }
    }

    console.log("🎉 Database seeded successfully with sample products!");
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
};