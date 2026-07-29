import React, { useEffect, useState, useCallback } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from '../components/ui/dialog';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { UserPlus, Trash2, Shield, ShieldAlert, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import { useAuth, AdminRole } from '../lib/auth';
import {api} from '../lib/api';

interface AdminUser {
  _id: string;
  email: string;
  role: AdminRole;
  addedAt?: string;
  addedBy?: string;
}

export const AdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { role: currentRole, user, isAdmin } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    role: 'Assistant admin' as AdminRole
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000); // 7s timeout

      const res = await api('/api/admin/users', { 
        signal: controller.signal 
      });
      
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } else {
        toast.error("Failed to load users");
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        toast.error("Request timed out");
      } else {
        console.error(error);
        toast.error("Failed to load administrative users");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRole !== 'Admin') {
      toast.error("Only full Admins can manage users");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.toLowerCase().trim(),
          role: formData.role
        }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Failed to add user");

      toast.success(`${formData.email} added successfully`);
      setIsAdding(false);
      setFormData({ email: '', role: 'Assistant admin' });
      fetchUsers(); // Refresh list
    } catch (error: any) {
      toast.error(error.message || "Failed to add user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveUser = async (email: string) => {
    if (currentRole !== 'Admin') return toast.error("Access denied");
    if (!confirm(`Revoke access for ${email}?`)) return;

    try {
      const res = await api(`/api/admin/users/${encodeURIComponent(email)}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Access revoked");
        fetchUsers();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to revoke");
      }
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-12 w-40" />
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-white mb-2 uppercase leading-none">Authority Control</h1>
          <p className="text-white/40 uppercase tracking-widest text-sm">Manage administrative access & roles</p>
        </div>
        
        {currentRole === 'Admin' && (
          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger>
              <Button className="gold-gradient text-black font-bold uppercase tracking-widest text-xs px-8 py-6">
                <UserPlus size={16} className="mr-2" />
                Delegate Authority
              </Button>
            </DialogTrigger>

            <DialogContent className="bg-neutral-950 border-white/10 text-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-serif uppercase">Grant Administrative Access</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleAddUser} className="space-y-6 pt-4">
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    placeholder="assistant@au718.com"
                    className="bg-neutral-900 border-white/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(v) => setFormData({...formData, role: v as AdminRole})}
                  >
                    <SelectTrigger className="bg-neutral-900 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin (Full Access)</SelectItem>
                      <SelectItem value="Assistant admin">Assistant Admin (Limited Access)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full gold-gradient text-black font-bold py-6"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Granting Access...</>
                    ) : (
                      "Grant Access"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="bg-neutral-950 border-white/10 overflow-hidden rounded-3xl">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="text-gold" size={20} />
            <h2 className="text-xl font-serif text-white uppercase tracking-tight">Active Administrators</h2>
          </div>
          <Badge variant="outline" className="text-gold border-gold/30">
            {users.length + 1} Authorized
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-8">Identity</TableHead>
                <TableHead>Permission Level</TableHead>
                <TableHead>Access Type</TableHead>
                <TableHead className="text-right pr-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* System Admin */}
              <TableRow className="bg-gradient-to-r from-gold/10 to-transparent border-gold/20">
                <TableCell className="pl-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center text-black font-bold">
                      SYS
                    </div>
                    <div>
                      <p className="font-bold text-white">cssjavascript150@gmail.com</p>
                      <p className="text-xs text-gold">Bootstrap Superuser</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className="bg-gold text-black">Admin</Badge>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-white/50">Immutable System Core</span>
                </TableCell>
                <TableCell className="text-right pr-8 text-white/30 text-xs font-mono">
                  PROTECTED
                </TableCell>
              </TableRow>

              {/* Delegated Users */}
              {users.map((admin) => (
                <TableRow key={admin._id || admin.email} className="hover:bg-white/5 transition-colors">
                  <TableCell className="pl-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center text-white/70 font-medium">
                        {admin.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white">{admin.email}</p>
                        <p className="text-xs text-white/50">Added: {admin.addedAt ? new Date(admin.addedAt).toLocaleDateString() : '—'}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={admin.role === 'Admin' ? "default" : "secondary"}>
                      {admin.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <Mail size={14} /> Email Access
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    {currentRole === 'Admin' && admin.email !== user?.email && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleRemoveUser(admin.email)}
                        className="text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 size={18} />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-52 text-center">
                    <ShieldAlert size={48} className="mx-auto mb-4 text-white/30" />
                    <p className="text-white/60">No delegated administrators yet</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {!isAdmin && (
        <Card className="p-8 bg-red-500/5 border-red-500/20 text-center">
          <p className="text-red-400 font-medium">You do not have permission to manage administrative users.</p>
        </Card>
      )}
    </div>
  );
};