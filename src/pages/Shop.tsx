import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, X, Star, Quote, Package, ChevronLeft, ChevronRight, Maximize2, ShieldCheck, Gift, Truck, Check, Share2, Sparkles } from 'lucide-react';
import { Product, Review } from '../types';
import { COMPANY_INFO, WHATSAPP_URL } from '../constants';
import { Skeleton } from '../components/ui/skeleton';
import { useLanguage } from '../lib/LanguageContext';
import {api} from '../lib/api';

// Fallback placeholder image
const PLACEHOLDER_IMAGE = 'https://picsum.photos/seed/gold/600/800';
const PLACEHOLDER_THUMB = 'https://picsum.photos/seed/gold/200/200';

// Static fallback reviews
const fallbackReviews: Review[] = [
  { id: "1", user: "Ameerat Hussein", comment: "The 24K gold chain is absolutely stunning. Heavy, pure, and the craftsmanship is top tier.", rating: 5 },
  { id: "2", user: "Chibuzor Emmanuel", comment: "Purchased investment bars for my family. Fast delivery and authentic as described.", rating: 5 },
  { id: "3", user: "Michael Thompson", comment: "Bought a custom ring for my wife. The attention to detail is exceptional.", rating: 4 },
  { id: "4", user: "Adelabu Akinsoye", comment: "Best gold shopping experience in Lagos. Will definitely return.", rating: 5 },
];

const ReviewsSection = () => {
  const { t } = useLanguage();
  const [reviews] = useState<Review[]>(fallbackReviews);

  return (
    <section className="py-24 border-t border-amber-400/10 mt-24">
      <div className="text-center mb-16 px-4">
        <span className="text-amber-400 uppercase tracking-[0.4em] text-xs font-bold block mb-4">{t('shop.voices', 'VOICES OF EXCELLENCE')}</span>
        <h2 className="text-4xl md:text-6xl font-serif font-bold text-white">{t('shop.clients', 'Clients & Investors')}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
        {reviews.map((review) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            key={review.id}
            className="p-10 bg-emerald-900/70 border border-amber-400/20 relative group hover:border-amber-400/40 transition-all rounded-2xl backdrop-blur-sm"
          >
            <Quote className="absolute top-6 right-6 text-amber-400/10 group-hover:text-amber-400/30 transition-all" size={40} />
            
            <div className="flex text-amber-400 mb-6 space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={16} 
                  fill={i < Math.floor(review.rating) ? "currentColor" : "none"} 
                />
              ))}
            </div>

            <p className="text-white/70 italic mb-8 leading-relaxed font-light">
              "{review.comment}"
            </p>

            <div className="flex items-center space-x-3">
              <div className="h-px w-8 bg-amber-400"></div>
              <span className="text-white text-sm font-medium">{review.user}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export const Shop = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const initialCat = (searchParams.get('cat') as Product['category'] | 'all') || 'all';

  const [activeCategory, setActiveCategory] = useState<Product['category'] | 'all'>(initialCat);
  const [activeKarat, setActiveKarat] = useState<Product['karat'] | 'all'>('all');
  const [activeWeight, setActiveWeight] = useState<string | 'all'>('all');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['all']);
  const [weights, setWeights] = useState<string[]>(['all']);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const karats = ['all', '18K', '21K', '22K', '24K'];

  useEffect(() => {
    const cat = (searchParams.get('cat') as Product['category'] | 'all') || 'all';
    setActiveCategory(cat);
  }, [searchParams]);

  // Fetch Products & Categories
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setLoadError(false);

      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api('/api/products?status=published'),
          api('/api/categories')   // ← Important: Use /api/categories
        ]);

        let productData: Product[] = [];

        // Products
        if (productsRes.ok) {
          productData = await productsRes.json();
          setProducts(productData);

          const weightData = productData
            .map((p: Product) => p.weight)
            .filter((w): w is string => Boolean(w));

          setWeights(['all', ...Array.from(new Set(weightData))]);
        }

        // Categories
        if (categoriesRes.ok) {
          const catData = await categoriesRes.json();
          
          if (Array.isArray(catData) && catData.length > 0) {
            const catNames = catData.map((c: any) => 
              typeof c === 'string' ? c : (c.name || c.title || '')
            ).filter(Boolean);

            setCategories(['all', ...Array.from(new Set(catNames))]);
          } else {
            // Fallback from products
            const productCats = Array.from(new Set(
              productData.map(p => p.category).filter(Boolean)
            ));
            setCategories(['all', ...productCats]);
          }
        } else {
          // Fallback
          const productCats = Array.from(new Set(
            productData.map(p => p.category).filter(Boolean)
          ));
          setCategories(['all', ...productCats]);
        }
      } catch (error) {
        console.error("Failed to fetch shop data:", error);
        setLoadError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Lock scroll
  useEffect(() => {
    if (isFilterOpen || selectedProduct) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = previousOverflow; };
    }
  }, [isFilterOpen, selectedProduct]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const categoryMatch = activeCategory === 'all' || 
        p.category?.toLowerCase() === activeCategory.toLowerCase();
      const karatMatch = activeKarat === 'all' || p.karat === activeKarat;
      const weightMatch = activeWeight === 'all' || p.weight === activeWeight;
      return categoryMatch && karatMatch && weightMatch;
    });
  }, [products, activeCategory, activeKarat, activeWeight]);

  const clearFilters = () => {
    setActiveCategory('all');
    setActiveKarat('all');
    setActiveWeight('all');
  };

  const hasFilters = activeCategory !== 'all' || activeKarat !== 'all' || activeWeight !== 'all';

  const getRelatedProducts = (product: Product) => {
    return products.filter(p => 
      p.id !== product.id && 
      (p.category?.toLowerCase() === product.category?.toLowerCase() || p.karat === product.karat)
    ).slice(0, 3);
  };

  return (
    <div className="pt-32 pb-24 bg-emerald-950 min-h-screen text-white">
      <div className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <span className="text-amber-400 uppercase tracking-[0.3em] text-xs font-bold mb-4 block">{t('shop.tagline', 'EXQUISITE PURITY')}</span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6">{t('shop.title', 'Our Collection')}</h1>
          <p className="text-white/70 max-w-2xl mx-auto font-light">
            {t('shop.desc', 'Each piece is selected for its superior craftsmanship and timeless appeal. Own a piece of the sun with AU718.')}
          </p>
        </div>

        {/* Filters - Desktop */}
        <div className="hidden lg:block mb-16 px-4 md:px-8 py-8 border-y border-amber-400/10 bg-emerald-900/50">
          <div className="flex flex-col space-y-8">
            <div className="flex items-start lg:items-center space-x-0 lg:space-x-12 flex-col lg:flex-row gap-4 lg:gap-0">
              <span className="text-[10px] uppercase tracking-[3px] font-bold text-amber-400 w-32 shrink-0">{t('shop.collections', 'Collections')}</span>
              <div className="flex flex-wrap gap-x-6 gap-y-4">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat as any)}
                    className={`uppercase tracking-widest text-[10px] font-bold transition-all hover:text-amber-400 ${
                      activeCategory === cat ? 'text-amber-400 border-b border-amber-400 pb-0.5' : 'text-white/60'
                    }`}
                  >
                    {cat === 'all' ? t('btn.all', 'All') : cat.replace(/-/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Purity Filter */}
            <div className="flex items-start lg:items-center space-x-0 lg:space-x-12 flex-col lg:flex-row gap-4 lg:gap-0">
              <span className="text-[10px] uppercase tracking-[3px] font-bold text-amber-400 w-32 shrink-0">{t('shop.purity', 'Purity (Karat)')}</span>
              <div className="flex flex-wrap gap-x-8 gap-y-4">
                {karats.map((k) => (
                  <button
                    key={k}
                    onClick={() => setActiveKarat(k as any)}
                    className={`uppercase tracking-widest text-[10px] font-bold transition-all hover:text-amber-400 ${
                      activeKarat === k ? 'text-amber-400' : 'text-white/60'
                    }`}
                  >
                    {k === 'all' ? t('btn.all', 'All') : k}
                  </button>
                ))}
              </div>
            </div>

            {/* Weight Filter */}
            {weights.length > 1 && (
              <div className="flex items-start lg:items-center space-x-0 lg:space-x-12 flex-col lg:flex-row gap-4 lg:gap-0">
                <span className="text-[10px] uppercase tracking-[3px] font-bold text-amber-400 w-32 shrink-0">{t('shop.weight', 'Weight')}</span>
                <div className="flex flex-wrap gap-x-8 gap-y-4">
                  {weights.map((w) => (
                    <button
                      key={w}
                      onClick={() => setActiveWeight(w)}
                      className={`uppercase tracking-widest text-[10px] font-bold transition-all hover:text-amber-400 ${
                        activeWeight === w ? 'text-amber-400' : 'text-white/60'
                      }`}
                    >
                      {w === 'all' ? t('shop.all_weights', 'All weights') : w}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Active Filters */}
        <AnimatePresence>
          {hasFilters && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 px-6 py-4 bg-emerald-900/70 border border-amber-400/20 gap-4 rounded-xl"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <span className="text-[10px] text-white/50 uppercase tracking-widest">Active Filters:</span>
                <div className="flex flex-wrap gap-2">
                  {activeCategory !== 'all' && (
                    <span className="px-3 py-1 bg-amber-400/10 text-amber-400 text-[10px] uppercase font-bold border border-amber-400/30 flex items-center gap-2 rounded-full">
                      {activeCategory.replace(/-/g, ' ')}
                      <button onClick={() => setActiveCategory('all')}><X size={12} /></button>
                    </span>
                  )}
                  {activeKarat !== 'all' && (
                    <span className="px-3 py-1 bg-amber-400/10 text-amber-400 text-[10px] uppercase font-bold border border-amber-400/30 flex items-center gap-2 rounded-full">
                      {activeKarat}
                      <button onClick={() => setActiveKarat('all')}><X size={12} /></button>
                    </span>
                  )}
                  {activeWeight !== 'all' && (
                    <span className="px-3 py-1 bg-amber-400/10 text-amber-400 text-[10px] uppercase font-bold border border-amber-400/30 flex items-center gap-2 rounded-full">
                      {activeWeight}
                      <button onClick={() => setActiveWeight('all')}><X size={12} /></button>
                    </span>
                  )}
                </div>
              </div>
              <button onClick={clearFilters} className="text-white/60 hover:text-amber-400 text-[10px] uppercase font-bold tracking-widest transition-colors flex items-center gap-2">
                Clear All <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Filter Button */}
        <div className="lg:hidden flex justify-end mb-8">
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-widest border border-amber-400/30 px-4 py-2 rounded-full hover:bg-amber-400/10 transition-colors"
          >
            <Filter size={16} />
            <span>Filter</span>
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 min-h-[400px]">
          {isLoading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[3/4] w-full bg-emerald-900" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : filteredProducts.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <motion.div layout key={product.id} className="group" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  {/* Your product card code remains the same */}
                  <div onClick={() => setSelectedProduct(product)} className="relative aspect-[3/4] overflow-hidden rounded-none border border-amber-400/20 bg-emerald-900 mb-6 cursor-pointer">
                    <img src={product.image ?? product.images?.[0] ?? PLACEHOLDER_IMAGE} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" referrerPolicy="no-referrer" />
                    <div className="absolute top-4 right-4 bg-emerald-950/90 backdrop-blur-md px-3 py-1 rounded-none border border-amber-400/30 z-20">
                      <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">{product.karat}</span>
                    </div>
                    {/* Hover buttons */}
                  </div>
                  <div onClick={() => setSelectedProduct(product)} className="text-center md:text-left px-2 cursor-pointer group">
                    <h3 className="text-white font-serif text-2xl mb-1 group-hover:text-amber-400 transition-colors leading-none uppercase">{product.name}</h3>
                    <div className="flex items-center justify-center md:justify-start space-x-4 text-white/60 text-[10px] uppercase tracking-[2px] font-bold">
                      <span>Weight: {product.weight || '—'}</span>
                      <span className="w-1 h-1 bg-amber-400 rounded-full"></span>
                      <span>Ready to Ship</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="col-span-full py-40 text-center">
              <Package size={48} className="text-amber-400 opacity-20 mb-6 mx-auto" />
              <h3 className="text-3xl font-serif text-white mb-2 uppercase">
                {loadError ? "Something Went Wrong" : "No Items Found"}
              </h3>
              <p className="text-white/60 uppercase tracking-widest text-[10px] font-bold">
                {loadError ? "Please try again later." : "No products match your current filters."}
              </p>
            </div>
          )}
        </div>

        <ReviewsSection />
      </div>

  
    {/* Mobile Filter Sidebar */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-emerald-950/90 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 h-full w-[80%] max-w-sm bg-emerald-950 z-[70] p-8 border-l border-amber-400/20 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-amber-400 font-serif text-2xl uppercase tracking-tighter italic">{t('shop.refine', 'Refine Selection')}</h3>
                <button onClick={() => setIsFilterOpen(false)} className="text-white/60"><X size={24} /></button>
              </div>
              
              <div className="space-y-12">
                <div>
                  <h4 className="text-white/50 text-[10px] uppercase tracking-[3px] font-bold mb-6">{t('shop.collections', 'Collections')}</h4>
                  <div className="flex flex-col space-y-4">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat as any)}
                        className={`text-left uppercase tracking-[0.2em] text-[10px] font-bold transition-all ${
                          activeCategory === cat ? 'text-amber-400' : 'text-white/50'
                        }`}
                      >
                        {cat === 'all' ? t('btn.all', 'All') : cat.replace(/-/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-white/50 text-[10px] uppercase tracking-[3px] font-bold mb-6">{t('shop.purity', 'Purity')}</h4>
                  <div className="flex flex-wrap gap-4">
                    {karats.map((k) => (
                      <button
                        key={k}
                        onClick={() => setActiveKarat(k as any)}
                        className={`px-4 py-2 border text-[10px] uppercase font-bold tracking-widest transition-all rounded-xl ${
                          activeKarat === k 
                            ? 'bg-amber-400 text-emerald-950 border-amber-400' 
                            : 'border-amber-400/30 text-white/70 hover:border-amber-400'
                        }`}
                      >
                        {k === 'all' ? t('btn.all', 'All') : k}
                      </button>
                    ))}
                  </div>
                </div>

                {weights.length > 1 && (
                  <div>
                    <h4 className="text-white/50 text-[10px] uppercase tracking-[3px] font-bold mb-6">{t('shop.weight', 'Weight')}</h4>
                    <div className="flex flex-wrap gap-4">
                      {weights.map((w) => (
                        <button
                          key={w}
                          onClick={() => setActiveWeight(w)}
                          className={`px-4 py-2 border text-[10px] uppercase font-bold tracking-widest transition-all rounded-xl ${
                            activeWeight === w 
                              ? 'bg-amber-400 text-emerald-950 border-amber-400' 
                              : 'border-amber-400/30 text-white/70 hover:border-amber-400'
                          }`}
                        >
                          {w === 'all' ? t('shop.all_weights', 'All weights') : w}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {hasFilters && (
                  <button 
                    onClick={() => { clearFilters(); setIsFilterOpen(false); }}
                    className="w-full py-4 bg-amber-400/10 text-amber-400 border border-amber-400/30 text-[10px] uppercase font-bold tracking-[3px] rounded-xl"
                  >
                    {t('shop.clear_all', 'Clear All')}
                  </button>
                )}

                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full py-4 bg-amber-400 hover:bg-amber-300 text-emerald-950 text-[10px] uppercase font-bold tracking-[3px] rounded-xl transition-colors"
                >
                  {t('shop.apply_filters', 'Apply Filters')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Quick View Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailModal 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
            relatedProducts={getRelatedProducts(selectedProduct)} 
            onSelectProduct={setSelectedProduct}
          />
        )}
      </AnimatePresence>

    </div>
  );
};


const ProductDetailModal = ({ product, onClose, relatedProducts, onSelectProduct }: { 
  product: Product; 
  onClose: () => void; 
  relatedProducts: Product[];
  onSelectProduct: (p: Product) => void;
}) => {
  const { t } = useLanguage();
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sizing and personalization options
  const [selectedSize, setSelectedSize] = useState("");
  const [engravingText, setEngravingText] = useState("");
  const [includeGiftWrap, setIncludeGiftWrap] = useState(true);

  const ENGRAVING_MAX_LENGTH = 40;

  const images = useMemo(() => {
    if (product.images && product.images.length > 0) return product.images;
    if (product.image) return [product.image];
    return [PLACEHOLDER_IMAGE];
  }, [product.images, product.image]);

  // Reset indices and options when product switches
  useEffect(() => {
    setActiveImgIndex(0);
    setEngravingText("");
    setIncludeGiftWrap(true);
    // Also clear any leftover "Copied!" feedback/timer from the previous product —
    // otherwise it could still be showing "Copied!" for content that's no longer on screen.
    setCopied(false);
    if (copiedTimeoutRef.current) {
      clearTimeout(copiedTimeoutRef.current);
      copiedTimeoutRef.current = null;
    }
  }, [product]);

  // Close on Escape — fullscreen lightbox takes priority over the modal itself.
  // Also supports Left/Right arrow keys to flip through images (this previously only
  // worked via the on-screen chevron buttons in the normal gallery view, leaving the
  // fullscreen lightbox with no way to move between images at all).
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
        return;
      }
      if (images.length > 1) {
        if (e.key === 'ArrowLeft') {
          setActiveImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
        } else if (e.key === 'ArrowRight') {
          setActiveImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, onClose, images]);

  // Clean up the "Copied!" timeout if the modal unmounts mid-timer
  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
    };
  }, []);

  // Dynamically generate size options based on product traits
  const sizeOptions = useMemo(() => {
    const nameLower = product.name.toLowerCase();
    const catLower = product.category?.toLowerCase() || "";
    if (nameLower.includes("ring") || catLower.includes("ring")) {
      return ["US 6", "US 7", "US 8", "US 9", "US 10"];
    }
    if (nameLower.includes("chain") || nameLower.includes("necklace") || catLower.includes("chain") || catLower.includes("necklace")) {
      return ['18" (45cm)', '20" (50cm)', '22" (55cm)', '24" (60cm)'];
    }
    return [];
  }, [product.name, product.category]);

  // Handle default selection
  useEffect(() => {
    if (sizeOptions.length > 0) {
      setSelectedSize(sizeOptions[0]);
    } else {
      setSelectedSize("");
    }
  }, [sizeOptions]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  // Compile premium WhatsApp inquiry message
  const customWhatsAppMessage = useMemo(() => {
    let msg = `Hello AU718, I am interested in placing an order or inquiring about this custom piece:\n\n`;
    msg += `✨ *${product.name}*\n`;
    msg += `• *Purity grade:* ${product.karat} High Purity Gold\n`;
    if (product.weight) msg += `• *Net Weight:* ${product.weight}\n`;
    if (selectedSize) msg += `• *Selected Size/Length:* ${selectedSize}\n`;
    if (engravingText.trim()) msg += `• *Custom Engraving:* "${engravingText.trim()}"\n`;
    msg += `• *Luxury Packaging:* ${includeGiftWrap ? "Velvet Display Box included" : "Standard secure packaging"}\n\n`;
    msg += `Please let me know the daily market gold pricing details and booking availability.`;
    return msg;
  }, [product.name, product.karat, product.weight, selectedSize, engravingText, includeGiftWrap]);

  const handleShare = async () => {
    // The category needs to be URL-encoded — an unencoded space or special character
    // (e.g. "Rings & Bracelets") would otherwise produce a broken/truncated link.
    const shareText = `Explore this absolute luxury gold jewelry: *${product.name}* (${product.karat} pure gold). Custom bespoke adjustments are available directly from AU718 Store: ${window.location.origin}/shop?cat=${encodeURIComponent(product.category ?? '')}`;
    try {
      await navigator.clipboard.writeText(shareText);
      // Clear any previous pending "reset" timer first so rapid clicks don't stack timers.
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
      setCopied(true);
      copiedTimeoutRef.current = setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Clipboard write failed:", err);
    }
  };

  return (
    <>
      {/* Background Mask */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-emerald-950/95 backdrop-blur-md z-[100]"
      />
      
      {/* Container Box */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", damping: 30, stiffness: 450 }}
        className="fixed top-10 bottom-6 left-4 right-4 md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:inset-auto md:max-w-4xl md:w-full h-auto max-h-[85vh] md:h-[580px] bg-gradient-to-b from-emerald-950 via-emerald-900/95 to-emerald-950 z-[110] overflow-y-auto md:overflow-hidden flex flex-col md:flex-row border border-amber-400/35 shadow-[0_0_60px_rgba(251,191,36,0.25)] rounded-2xl md:rounded-3xl"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/75 hover:text-amber-400 z-[120] bg-emerald-950/90 p-2.5 border border-amber-400/20 backdrop-blur-md rounded-full transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 shadow-md flex items-center justify-center hover:border-amber-400/55"
        >
          <X size={18} />
        </button>

        {/* Column 1: Image Gallery & Magnifier */}
        <div className="w-full md:w-1/2 flex flex-col h-[280px] xs:h-[320px] sm:h-[380px] md:h-[580px] shrink-0 overflow-hidden bg-emerald-950 border-b md:border-b-0 md:border-r border-amber-400/10">
          <div 
            className="relative h-full flex items-center justify-center p-6 bg-emerald-950 overflow-hidden cursor-zoom-in select-none group/zoom"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
          >
            {/* Ambient luxury radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.06)_0%,transparent_70%)] pointer-events-none" />

            <AnimatePresence mode="wait">
              <motion.img
                key={activeImgIndex}
                src={images[activeImgIndex]}
                alt={product.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl relative z-10 transition-transform duration-75"
                referrerPolicy="no-referrer"
                style={{
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  transform: isZooming ? 'scale(2.4)' : 'scale(1)',
                }}
              />
            </AnimatePresence>

            {/* Hover guidance label */}
            <div className="absolute top-4 left-4 pointer-events-none opacity-0 group-hover/zoom:opacity-100 transition-opacity duration-300 bg-emerald-950/90 backdrop-blur-sm border border-amber-400/20 px-2.5 py-1 text-[8px] tracking-[1.5px] uppercase text-amber-400 font-bold rounded-md z-20">
              {t('shop.hover_inspect', 'Move cursor to inspect purity')}
            </div>

            {/* Lightbox Trigger */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFullscreen(true);
              }}
              className="absolute bottom-4 right-4 p-2.5 rounded-full bg-emerald-950/90 hover:bg-amber-400 hover:text-emerald-950 transition-all duration-200 text-white border border-amber-400/20 z-20 shadow-lg cursor-pointer transform hover:scale-110 active:scale-95"
              title={t('shop.fullscreen_title', 'Fullscreen luxury view')}
            >
              <Maximize2 size={14} />
            </button>

            {/* Picture Swiping Handles */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-emerald-950/90 hover:bg-amber-400 hover:text-emerald-950 transition-all duration-200 text-white border border-amber-400/20 z-20 cursor-pointer shadow-md transform hover:scale-105 active:scale-95"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-emerald-950/90 hover:bg-amber-400 hover:text-emerald-950 transition-all duration-200 text-white border border-amber-400/20 z-20 cursor-pointer shadow-md transform hover:scale-105 active:scale-95"
                  aria-label="Next image"
                >
                  <ChevronRight size={15} />
                </button>
              </>
            )}
          </div>

          {/* Multiple Thumbnails Strip */}
          {images.length > 1 && (
            <div className="flex gap-2.5 p-3.5 bg-emerald-950/90 border-t border-amber-400/10 overflow-x-auto h-[76px] shrink-0 scrollbar-none items-center justify-center">
              {images.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImgIndex(i)}
                  className={`w-11 h-11 shrink-0 border transition-all duration-200 rounded-lg overflow-hidden cursor-pointer ${
                    activeImgIndex === i 
                      ? 'border-amber-400 scale-105 ring-2 ring-amber-400/20' 
                      : 'border-amber-400/10 opacity-55 hover:opacity-100 hover:border-amber-400/40'
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt={`Thumbnail ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Column 2: Details & Configurator */}
        <div className="w-full md:w-1/2 p-6 md:p-9 flex flex-col justify-between overflow-y-auto h-auto md:h-[580px] scrollbar-thin">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-amber-400 uppercase tracking-[4px] text-[10px] font-bold block">{product.karat} {t('shop.purity_grade', 'High-End Purity')}</span>
              <span className="text-white/40 text-[9px] font-mono">ID: #{product.id.slice(0, 5).toUpperCase()}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif text-white mb-4 uppercase leading-tight font-medium tracking-wide">{product.name}</h2>
            
            {/* Spec Matrix */}
            <div className="flex gap-4 sm:gap-6 mb-5 border-y border-amber-400/10 py-3.5">
              <div>
                <span className="text-[9px] text-white/50 uppercase tracking-widest block mb-0.5">{t('shop.grade', 'Standard Grade')}</span>
                <span className="text-amber-400 font-bold text-xs tracking-wider">{product.karat} {t('shop.solid_gold', 'Solid Gold')}</span>
              </div>
              <div className="h-9 w-px bg-amber-400/10"></div>
              <div>
                <span className="text-[9px] text-white/50 uppercase tracking-widest block mb-0.5">{t('shop.authenticity', 'Authenticity')}</span>
                <span className="text-white font-bold text-xs tracking-wider">{t('shop.certified_secure', 'Certified 100% Secure')}</span>
              </div>
              <div className="h-9 w-px bg-amber-400/10"></div>
              <div>
                <span className="text-[9px] text-white/50 uppercase tracking-widest block mb-0.5">{t('shop.net_weight', 'Net Weight')}</span>
                <span className="text-white font-bold text-xs tracking-wider">{product.weight || t('shop.inquiry_only', 'Inquiry Only')}</span>
              </div>
            </div>

            {/* Description quote box */}
            <div className="mb-5">
              <p className="text-white/80 text-xs sm:text-sm leading-relaxed font-light italic border-l-2 border-amber-400/30 pl-4 py-0.5">
                {product.description}
              </p>
            </div>

            {/* Size / length selector (rings & chains/necklaces only) */}
            {sizeOptions.length > 0 && (
              <div className="mb-5">
                <span className="text-[9px] text-white/50 uppercase tracking-widest block mb-2">
                  {t('shop.select_size', 'Select Size / Length')}
                </span>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1.5 border text-[10px] uppercase font-bold tracking-wider rounded-lg transition-all cursor-pointer ${
                        selectedSize === size
                          ? 'bg-amber-400 text-emerald-950 border-amber-400'
                          : 'border-amber-400/30 text-white/70 hover:border-amber-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom engraving */}
            <div className="mb-5">
              <label htmlFor="modal-engraving" className="text-[9px] text-white/50 uppercase tracking-widest block mb-2">
                {t('shop.engraving', 'Custom Engraving (Optional)')}
              </label>
              <input
                id="modal-engraving"
                type="text"
                value={engravingText}
                onChange={(e) => setEngravingText(e.target.value.slice(0, ENGRAVING_MAX_LENGTH))}
                maxLength={ENGRAVING_MAX_LENGTH}
                placeholder={t('shop.engraving_placeholder', 'e.g. "Forever & Always"')}
                className="w-full bg-emerald-950/60 border border-amber-400/20 rounded-lg px-3 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/60 transition-colors"
              />
              <span className="text-[8px] text-white/30 mt-1 block text-right">
                {engravingText.length}/{ENGRAVING_MAX_LENGTH}
              </span>
            </div>
            
            {/* Complimentary package custom checkbox */}
            <div className="mb-6 flex items-center gap-3 bg-emerald-950/40 p-3.5 rounded-xl border border-amber-400/10">
              <input
                type="checkbox"
                id="modal-gift-wrap"
                checked={includeGiftWrap}
                onChange={(e) => setIncludeGiftWrap(e.target.checked)}
                className="w-4 h-4 rounded border-amber-400/30 text-emerald-900 focus:ring-amber-400 bg-emerald-950 accent-amber-400 cursor-pointer shadow-md transition-all h-4 w-4"
              />
              <label htmlFor="modal-gift-wrap" className="text-[10px] sm:text-[11px] text-white/85 tracking-wider font-semibold select-none cursor-pointer hover:text-amber-400 transition-colors flex items-center gap-2">
                <Gift size={14} className="text-amber-400 shrink-0" />
                <span>{t('shop.gift_wrap', 'Include Premium Velvet Presentation Case (Complimentary)')}</span>
              </label>
            </div>
          </div>

          <div>
            {/* Actions: order and share item detail copy */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <a 
                href={WHATSAPP_URL(COMPANY_INFO.whatsapp[0].number, customWhatsAppMessage)}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-4 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold uppercase tracking-widest text-[10px] text-center transition-all duration-200 hover:scale-[1.01] hover:shadow-lg shadow-amber-400/15 flex items-center justify-center gap-2 rounded-xl cursor-pointer"
              >
                {t('shop.inquire_quote', 'Inquire & Quote via WhatsApp')}
              </a>
              
              <button
                onClick={handleShare}
                className={`px-5 py-4 border transition-all duration-200 rounded-xl flex items-center justify-center gap-2 cursor-pointer ${
                  copied 
                    ? 'border-emerald-500 text-emerald-400 bg-emerald-500/15 shadow-md shadow-emerald-500/10' 
                    : 'border-amber-400/30 text-white/80 hover:border-amber-400 hover:text-white bg-emerald-900/10 hover:bg-emerald-900/20'
                } text-[10px] font-bold uppercase tracking-widest`}
              >
                {copied ? (
                  <>
                    <Check size={13} className="text-emerald-400 animate-bounce" />
                    {t('loc.modal.copied', 'Copied!')}
                  </>
                ) : (
                  <>
                    <Share2 size={13} />
                    {t('shop.share_product', 'Share Product')}
                  </>
                )}
              </button>
            </div>

            {/* Certifications Row */}
            <div className="grid grid-cols-3 gap-2 border-t border-amber-400/10 pt-4">
              <div className="flex flex-col items-center justify-center text-center p-2 rounded-xl bg-emerald-950/40 border border-amber-400/5 hover:border-amber-400/15 transition-all duration-200">
                <ShieldCheck size={14} className="text-amber-400 mb-1" />
                <span className="text-[7.5px] text-white/90 font-bold uppercase tracking-wider">{t('shop.genuine_cert', 'Certified 100% Genuine')}</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center p-2 rounded-xl bg-emerald-950/40 border border-amber-400/5 hover:border-amber-400/15 transition-all duration-200">
                <Truck size={14} className="text-amber-400 mb-1" />
                <span className="text-[7.5px] text-white/90 font-bold uppercase tracking-wider">{t('shop.secure_shipping', 'Secure Vault Shipping')}</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center p-2 rounded-xl bg-emerald-950/40 border border-amber-400/5 hover:border-amber-400/15 transition-all duration-200">
                <Sparkles size={14} className="text-amber-400 mb-1" />
                <span className="text-[7.5px] text-white/90 font-bold uppercase tracking-wider">{t('shop.prestige_craft', 'Prestige Craftsmanship')}</span>
              </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <div className="mt-5 pt-4 border-t border-amber-400/10">
                <span className="text-[9px] text-white/50 uppercase tracking-widest block mb-3">
                  {t('shop.related', 'You May Also Like')}
                </span>
                <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
                  {relatedProducts.map((rp) => (
                    <button
                      key={rp.id}
                      onClick={() => onSelectProduct(rp)}
                      className="shrink-0 w-20 text-left group/related cursor-pointer"
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden border border-amber-400/15 group-hover/related:border-amber-400/50 transition-all mb-1.5 bg-emerald-950">
                        <img
                          src={rp.image ?? rp.images?.[0] ?? PLACEHOLDER_THUMB}
                          alt={rp.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="text-[9px] text-white/70 group-hover/related:text-amber-400 uppercase font-bold tracking-wide leading-tight line-clamp-2 block transition-colors">
                        {rp.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Fullscreen distraction-free Lightbox */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/98 z-[150] flex flex-col items-center justify-center p-4 backdrop-blur-lg"
            onClick={() => setIsFullscreen(false)}
          >
            <button
              type="button"
              className="absolute top-6 right-6 text-white/70 hover:text-white p-3 bg-neutral-900/80 border border-white/10 rounded-full z-[160] transition-colors cursor-pointer hover:bg-neutral-800"
              onClick={() => setIsFullscreen(false)}
            >
              <X size={24} />
            </button>

            {/* Prev/Next controls — previously missing, so a multi-image product had
                no way to browse other images once you opened the fullscreen lightbox. */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                  }}
                  className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-neutral-900/80 hover:bg-amber-400 hover:text-emerald-950 text-white border border-white/10 z-[160] transition-colors cursor-pointer"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                  }}
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-neutral-900/80 hover:bg-amber-400 hover:text-emerald-950 text-white border border-white/10 z-[160] transition-colors cursor-pointer"
                  aria-label="Next image"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
            
            <motion.img
              key={activeImgIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={images[activeImgIndex]}
              alt={product.name}
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl relative z-10 select-none"
              onClick={(e) => e.stopPropagation()}
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-8 text-center z-[165]" onClick={(e) => e.stopPropagation()}>
              <h4 className="text-white font-serif tracking-wider text-xl uppercase mb-1">{product.name}</h4>
              <p className="text-amber-400 text-[10px] tracking-widest uppercase font-mono">{product.karat} {t('shop.grade', 'Purity Grade')} • {t('shop.details_view', 'Details View')} {activeImgIndex + 1} of {images.length}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};


export default Shop;