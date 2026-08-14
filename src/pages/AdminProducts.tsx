import React, { useEffect, useState, useCallback } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { api } from '../lib/api';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from '../components/ui/dialog';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { Package, Plus, Search, Edit2, Trash2, MoreVertical, Eye, Image as ImageIcon, Upload, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from '../components/ui/dropdown-menu';

import { getImageUrl } from '../lib/utils';

interface Product {
  _id?: string;
  id?: string;
  name: string;
  category: string;
  karat: string;
  weight: string | null;
  description: string | null;
  images: string[];
  stock: number;
  status: 'published' | 'draft';
  createdAt?: string;
  updatedAt?: string;
}

export const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');
  
  const [isOpen, setIsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    karat: '18K',
    weight: '',
    description: '',
    images: [] as string[],
    stock: 0,
    status: 'published' as 'published' | 'draft'
  });

  const resetForm = () => {
    setFormData({
      name: '', category: '', karat: '18K', weight: '', 
      description: '', images: [], stock: 0, status: 'published'
    });
    setEditingProduct(null);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        api<Product[]>('/api/products'),
        api<any[]>('/api/categories')
      ]);

      setProducts(productsData || []);
      setCategories(categoriesData.map((c: any) => c.name) || []);
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category || !formData.weight.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      const productId = editingProduct?._id || editingProduct?.id;
      const url = editingProduct 
        ? `/api/db/products/${productId}`
        : '/api/products';

      const method = editingProduct ? 'PUT' : 'POST';

      await api(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      toast.success(editingProduct ? "Product updated successfully" : "Product added successfully");
      setIsOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Operation failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) return toast.error("Please upload a valid image file");
    if (file.size > 10 * 1024 * 1024) return toast.error("Image must be smaller than 10MB");

    setIsUploading(true);
    setUploadProgress(10);

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      const data = await api<{ url: string }>('/api/upload', {
        method: 'POST',
        body: formDataUpload,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!data.url) throw new Error("No image URL returned");

      setFormData(prev => ({ ...prev, images: [...prev.images, data.url] }));
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.name === 'AbortError' ? "Upload timed out" : error.message || "Image upload failed");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product permanently?")) return;
    
    try {
      await api(`/api/products/${id}`, { method: 'DELETE' });
      toast.success("Product deleted successfully");
      fetchData();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Delete operation failed");
    }
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      karat: product.karat,
      weight: product.weight ?? '',
      description: product.description ?? '',
      images: product.images || [],
      stock: product.stock || 0,
      status: product.status || 'published'
    });
    setIsOpen(true);
  };

  const filteredProducts = products
    .filter(p => p && (p.name || p._id || p.id))
    .filter(p => 
      p.name?.toLowerCase().includes(search.toLowerCase()) || 
      p.category?.toLowerCase().includes(search.toLowerCase())
    );

  if (loading && products.length === 0) {
    return <div className="space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-64 w-full" /></div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-white mb-2 uppercase leading-none">Inventory Vault</h1>
          <p className="text-white/40 uppercase tracking-widest text-[10px] font-bold">Manage your exclusive collections</p>
        </div>

        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger>
            <Button className="gold-gradient text-black font-bold uppercase tracking-widest text-xs px-8 py-6">
              <Plus size={16} className="mr-2" /> Add New Piece
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl bg-neutral-950 border-gold/30 text-white max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className={`text-2xl font-serif uppercase transition-colors ${editingProduct ? 'text-gold' : 'text-white'}`}>
                {editingProduct ? 'Edit Piece' : 'Add New Product'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-6 pt-4">
              {/* Form fields remain unchanged */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="bg-neutral-900 border-white/20 text-white"
                    placeholder="e.g. Cuban Link Chain" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v || ''})}>
                    <SelectTrigger className="bg-neutral-900 border-white/20 text-white">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                      <SelectItem value="chains">Chains</SelectItem>
                      <SelectItem value="necklaces">Necklaces</SelectItem>
                      <SelectItem value="rings">Rings</SelectItem>
                      <SelectItem value="watches">Watches</SelectItem>
                      <SelectItem value="bars">Gold Bars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Gold Purity</Label>
                  <Select value={formData.karat} onValueChange={(v) => setFormData({...formData, karat: v || '18K'})}>
                    <SelectTrigger className="bg-neutral-900 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['18K', '21K', '22K', '24K'].map(k => (
                        <SelectItem key={k} value={k}>{k} Solid Gold</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Weight (grams)</Label>
                  <Input 
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    required
                    className="bg-neutral-900 border-white/20 text-white"
                    placeholder="e.g. 5.5g"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Stock Quantity</Label>
                <Input 
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                  required
                  className="bg-neutral-900 border-white/20 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <textarea 
                  className="w-full h-32 bg-neutral-900 border border-white/20 rounded-lg p-4 text-white resize-y"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Detailed description..."
                />
              </div>

              {/* Images section unchanged */}
              <div className="space-y-4">
                <Label>Product Images</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative group">
                    <input 
                      type="file" 
                      id="product-image"
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                    <label 
                      htmlFor="product-image"
                      className={`flex flex-col items-center justify-center w-full aspect-video rounded-xl border-2 border-dashed border-white/20 bg-neutral-900 hover:border-gold/40 transition-all cursor-pointer ${isUploading ? 'opacity-50' : ''}`}
                    >
                      {isUploading ? (
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="w-8 h-8 animate-spin text-gold" />
                          <span className="text-sm text-white/70">Uploading image... {uploadProgress}%</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="w-8 h-8 text-white/40" />
                          <span className="text-sm text-white/60">Upload Image</span>
                        </div>
                      )}
                    </label>
                  </div>

                  <div className="flex items-end gap-2">
                    <Input 
                      id="image-url"
                      placeholder="Or paste image URL"
                      className="bg-neutral-900 border-white/20 text-white"
                    />
                    <Button 
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('image-url') as HTMLInputElement;
                        if (input?.value.trim()) {
                          setFormData(prev => ({ ...prev, images: [...prev.images, input.value.trim()] }));
                          input.value = '';
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {formData.images.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group">
                      <img src={getImageUrl(img)} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          images: prev.images.filter((_, idx) => idx !== i)
                        }))}
                        className="absolute top-1 right-1 bg-red-500/90 text-white p-1 rounded-full opacity-0 group-hover:opacity-100"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between py-4 border-t border-white/10">
                <Label>Status</Label>
                <div className="flex gap-3">
                  {(['published', 'draft'] as const).map((s) => (
                    <Button
                      key={s}
                      type="button"
                      variant={formData.status === s ? "default" : "outline"}
                      onClick={() => setFormData({...formData, status: s})}
                    >
                      {s.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="w-full gold-gradient text-black font-bold py-6"
                >
                  {isSaving ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...</>
                  ) : editingProduct ? 'Update Product' : 'Add to Vault'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Products Table - unchanged */}
      <Card className="bg-neutral-950 border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative max-w-sm w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <Input 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-neutral-900 border-white/20"
            />
          </div>
          <div className="text-sm text-white/50">
            Total: <span className="text-gold font-bold">{filteredProducts.length}</span> pieces
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-neutral-900 border-b border-neutral-700">
              <TableRow>
                <TableHead className="text-white font-medium">Product</TableHead>
                <TableHead className="text-white font-medium">Category</TableHead>
                <TableHead className="text-white font-medium">Purity</TableHead>
                <TableHead className="text-white font-medium">Weight</TableHead>
                <TableHead className="text-white font-medium">Stock</TableHead>
                <TableHead className="text-white font-medium">Status</TableHead>
                <TableHead className="text-white text-right font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((p) => {
                const productId = p._id || p.id;
                return (
                  <TableRow key={productId || Math.random()}>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-900">
                          {p.images?.[0] ? (
                            <img src={getImageUrl(p.images[0])} className="w-full h-full object-cover" alt={p.name} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon size={20} className="text-white/30" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{p.name || 'Untitled Product'}</p>
                          <p className="text-xs text-white/50">
                            ID: {productId ? String(productId).slice(0, 8) : 'N/A'}...
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="secondary" className="capitalize">{p.category}</Badge></TableCell>
                    <TableCell><span className="font-serif text-gold">{p.karat}</span></TableCell>
                    <TableCell><span className="font-serif text-gold">{p.weight ?? ''}</span></TableCell>
                    <TableCell>
                      <span className={`font-bold ${p.stock < 5 ? 'text-red-400' : 'text-gold'}`}>{p.stock}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.status === 'published' ? "default" : "secondary"}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost" size="icon" className="text-white hover:text-white hover:bg-white/10">
                            <MoreVertical size={18} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(p)}>
                            <Edit2 className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-400"
                            onClick={() => handleDelete(String(productId))}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}

              {filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-80 text-center">
                    <Package size={48} className="mx-auto mb-4 text-white/30" />
                    <p className="text-xl">No products found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};