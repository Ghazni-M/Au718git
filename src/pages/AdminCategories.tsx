import React, { useEffect, useState, useMemo } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { Tags, Plus, Edit2, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import {api} from '../lib/api';

interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
}

export const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  // Fetch Categories
 const fetchCategories = async () => {
  setLoading(true);
  try {
    const [catRes, prodRes] = await Promise.all([
      api('/api/db/categories'),
      api('/api/db/products')
    ]);
    if (!catRes.ok) throw new Error('Failed to fetch categories');
    if (!prodRes.ok) throw new Error('Failed to fetch products');

    const catData = await catRes.json();
    const prodData = await prodRes.json();

    // Count products per category, matching by id OR by name
    // (covers whichever field your product form actually saves)
    const countsById = new Map<string, number>();
    const countsByName = new Map<string, number>();

    prodData.forEach((p: any) => {
      const catId = p.categoryId || p.category?.id;
      const catName = (typeof p.category === 'string' ? p.category : p.category?.name || p.categoryName);

      if (catId) countsById.set(catId, (countsById.get(catId) || 0) + 1);
      if (catName) {
        const key = catName.toLowerCase().trim();
        countsByName.set(key, (countsByName.get(key) || 0) + 1);
      }
    });

    const catsWithCounts = catData.map((cat: any) => {
      const id = cat.id || cat._id || '';
      const name = cat.name || '';
      const count = countsById.get(id) ?? countsByName.get(name.toLowerCase().trim()) ?? 0;
      return {
        id,
        name,
        description: cat.description || '',
        productCount: count
      };
    });

    setCategories(catsWithCounts);
  } catch (error) {
    console.error("Failed to load categories:", error);
    toast.error("Failed to load categories");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter and unique categories
  const filteredCategories = useMemo(() => {
    const uniqueMap = new Map<string, Category>();

    categories.forEach(cat => {
      const key = cat.name.toLowerCase().trim();
      if (!uniqueMap.has(key) || cat.productCount > (uniqueMap.get(key)?.productCount || 0)) {
        uniqueMap.set(key, cat);
      }
    });

    const sorted = Array.from(uniqueMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name)
    );

    return sorted.filter(cat =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  // Create Category
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Collection name is required");
      return;
    }

    try {
      const res = await api('/api/db/categories', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim()
        })
      });

      if (!res.ok) throw new Error('Failed to create');

      toast.success("Collection created successfully");
      setIsAdding(false);
      setFormData({ name: '', description: '' });
      fetchCategories();
    } catch (error) {
      toast.error("Failed to create collection");
    }
  };

  // Update Category
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !formData.name.trim()) return;

    try {
      const res = await api(`/api/db/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim()
        })
      });

      if (!res.ok) throw new Error('Failed to update');

      toast.success("Collection updated successfully");
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
      fetchCategories();
    } catch (error) {
      toast.error("Failed to update collection");
    }
  };

  // Delete Category
  const handleDelete = async (id: string, name: string) => {
    const cat = categories.find(c => c.id === id);
    if (cat && cat.productCount > 0) {
      toast.error(`Cannot delete "${name}" - it contains ${cat.productCount} products.`);
      return;
    }

    if (!confirm(`Delete collection "${name}"?`)) return;

    try {
      const res = await api(`/api/db/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');

      toast.success("Collection deleted successfully");
      fetchCategories();
    } catch (error) {
      toast.error("Failed to delete collection");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-white mb-2 uppercase leading-none">Collections</h1>
          <p className="text-white/40 uppercase tracking-widest text-[10px] font-bold">Manage product categories and inventory groups</p>
        </div>

        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger>
            <Button className="bg-gold text-black hover:bg-gold-bright transition-all font-black uppercase text-[10px] tracking-widest h-12 px-8 rounded-xl">
              <Plus size={18} className="mr-2" />
              New Collection
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-emerald-rich border-gold/20 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif font-bold text-gold uppercase tracking-tight">Create New Collection</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-6 py-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Name</Label>
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Luxury Necklaces"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Description</Label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this collection..."
                  className="w-full min-h-[120px] bg-emerald-deep border border-gold/10 rounded-lg p-4 text-white"
                />
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full bg-gold text-black font-black uppercase tracking-widest">
                  Create Collection
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-emerald-rich/40 border-gold/10 backdrop-blur-xl overflow-hidden rounded-3xl">
        <CardContent className="p-0">
          <div className="p-6 border-b border-gold/10 flex items-center gap-4 bg-emerald-deep/20">
            <Search size={18} className="text-white/30" />
            <Input 
              type="text" 
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus-visible:ring-0 textwhite placeholder:text-white/40"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow className="border-gold/10">
                <TableHead className="pl-8">Icon</TableHead>
                <TableHead>Collection Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-center">Products</TableHead>
                <TableHead className="text-right pr-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-12 w-12 rounded-2xl" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-80" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-12 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-9 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredCategories.length > 0 ? (
                filteredCategories.map((cat) => (
                  <TableRow key={cat.id} className="hover:bg-gold/5 transition-colors">
                    <TableCell className="pl-8">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-deep/70 flex items-center justify-center text-gold">
                        <Tags size={22} />
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-white text-lg">{cat.name}</TableCell>
                    <TableCell className="text-white/60 text-sm">{cat.description || 'No description'}</TableCell>
                    <TableCell className="text-center">
                      <span className="inline-block px-3 py-1 bg-emerald-900/70 text-gold text-xs font-bold rounded-full border border-gold/20">
                        {cat.productCount}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingCategory(cat);
                            setFormData({ name: cat.name, description: cat.description });
                          }}
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="text-red-400 hover:bg-red-400/10"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-24 text-center text-white/40">
                    No collections found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent className="bg-emerald-rich border-gold/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-gold">Edit Collection</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Description</Label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full min-h-[100px] bg-emerald-deep border border-gold/20 rounded-lg p-3 text-white"
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-gold text-black w-full">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};