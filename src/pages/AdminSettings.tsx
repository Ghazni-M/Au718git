import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Shield, Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';
import { useAuth } from '../lib/auth';

export const AdminSettings = () => {
 const { user, refreshAuth } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setNewEmail(user.email || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ displayName: displayName.trim() })
      });

      if (!res.ok) throw new Error('Failed to update profile');

      await refreshAuth();
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (newPassword && newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: user.email,
          currentPassword,
          newPassword: newPassword || undefined,
          newEmail: newEmail !== user.email ? newEmail : undefined
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Update failed');
      }

      await refreshAuth();
      toast.success("Security settings updated successfully");
      
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
    } catch (error: any) {
      toast.error(error.message || "Security update failed");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-10 max-w-4xl animate-fade-in">
      <div>
        <h1 className="text-4xl font-serif font-bold text-white mb-2 uppercase leading-none">Security & Control</h1>
        <p className="text-white/40 uppercase tracking-widest text-sm">Manage your administrative identity and access</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Card */}
        <Card className="bg-neutral-950 border-white/10 rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gold/10 rounded-xl">
                <UserIcon className="text-gold" size={22} />
              </div>
              <div>
                <CardTitle className="text-xl text-white">Profile Identity</CardTitle>
                <CardDescription>Visible name in the admin panel</CardDescription>
              </div>
            </div>
          </CardHeader>

          <form onSubmit={handleUpdateProfile}>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Admin Master"
                  className="bg-neutral-900 border-white/20 text-white"
                />
              </div>
            </CardContent>

            <CardFooter>
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full gold-gradient text-black font-bold py-6"
              >
                {loading && <Loader2 className="animate-spin mr-2" />}
                Update Profile
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Security Card */}
        <Card className="bg-neutral-950 border-white/10 rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/10 rounded-xl">
                <Shield className="text-red-400" size={22} />
              </div>
              <div>
                <CardTitle className="text-xl text-white">Access Credentials</CardTitle>
                <CardDescription>Update email and password</CardDescription>
              </div>
            </div>
          </CardHeader>

          <form onSubmit={handleUpdateSecurity}>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail size={16} /> Login Email
                </Label>
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="bg-neutral-900 border-white/20 text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Lock size={16} /> New Password
                  </Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    className="bg-neutral-900 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="bg-neutral-900 border-white/20 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Current Password (for verification)</Label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-neutral-900 border-white/20 text-white"
                  placeholder="Enter current password"
                />
              </div>
            </CardContent>

            <CardFooter>
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full gold-gradient text-black font-bold py-6"
              >
                {loading && <Loader2 className="animate-spin mr-2" />}
                Update Security Settings
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;