import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { Eye, EyeOff, Shield, Loader2 } from 'lucide-react';

export const AdminLogin = () => {
  const [email, setEmail] = useState(import.meta.env.VITE_ADMIN_EMAIL || 'admin@au718.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  const { user, isAdmin, login, signup, logout } = useAuth();
  const navigate = useNavigate();

  if (user && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const result = await login(email.trim(), password);
      if (!result?.isAdmin) {
        await logout();
        toast.error("This account is not authorized for admin access");
        return;
      }
      toast.success("Login successful! Welcome Admin.");
      navigate('/admin', { replace: true });
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const result = await signup(email.trim(), password);
      if (!result?.isAdmin) {
        await logout();
        toast.error("Account created but not authorized as admin");
        return;
      }
      toast.success("Admin account created successfully!");
      navigate('/admin', { replace: true });
    } catch (error: any) {
      toast.error(error.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a1f1a] px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-amber-400/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-amber-400/10 rounded-full blur-[140px]" />
      </div>

      <Card className="w-full max-w-md bg-neutral-950 border border-amber-400/40 shadow-2xl">
        <CardHeader className="space-y-6 text-center pt-10 pb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-xl">
            <Shield className="w-11 h-11 text-neutral-950" />
          </div>

          <div>
            <CardTitle className="text-4xl font-serif text-white tracking-tighter">
              AU718 Gold Store
            </CardTitle>
            <CardDescription className="text-amber-400 uppercase tracking-[3px] text-sm mt-1">
              ADMINISTRATIVE PORTAL
            </CardDescription>
          </div>
        </CardHeader>

        <div className="px-6 pb-8">
          <Tabs 
            value={activeTab} 
            onValueChange={(value: "login" | "signup") => {
              setActiveTab(value);
              setPassword("");
              setShowPassword(false);
          }}
          >
            <TabsList className="grid w-full grid-cols-2 bg-black border border-white/10 p-1 rounded-xl mb-8">
              <TabsTrigger value="login" className="py-3.5 data-[state=active]:bg-neutral-800 data-[state=active]:text-white">
                Login
              </TabsTrigger>
              <TabsTrigger value="signup" className="py-3.5 data-[state=active]:bg-emerald-900 data-[state=active]:text-amber-400">
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-0 space-y-6">
              <form onSubmit={handleLogin}>
                <div className="space-y-2">
                  <Label className="text-white/70">Email Address</Label>
                  <Input type="email" placeholder="admin@au718.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white border-amber-400/30 h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Password</Label>
                  <div className="relative">
                    <Input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white border-amber-400/30 h-12 pr-12" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60">
                      {showPassword ? <EyeOff size={20} className="text-black" /> : <Eye size={20} className="text-black" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full mt-6 py-6 bg-amber-400 hover:bg-amber-300 text-black font-bold">
                  {loading && <Loader2 className="mr-2 animate-spin" size={20} />}
                  SIGN IN
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-0 space-y-6">
              <form onSubmit={handleSignUp}>
                <div className="space-y-2">
                  <Label className="text-white/70">Email Address</Label>
                  <Input type="email" placeholder="your-email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white border-amber-400/30 h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Choose Password</Label>
                  <div className="relative">
                    <Input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white border-amber-400/30 h-12 pr-12" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60">
                      {showPassword ? <EyeOff size={20} className="text-black" /> : <Eye size={20} className="text-black"/>}
                    </button>
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full mt-6 py-6 border border-amber-400 text-amber-400 hover:bg-amber-400/10 font-bold">
                  {loading && <Loader2 className="mr-2 animate-spin" size={20} />}
                  CREATE ADMIN ACCOUNT
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <div className="px-6 pb-8 text-center text-[9px] text-white/30 uppercase tracking-widest border-t border-white/10 pt-6">
          UNAUTHORIZED ACCESS TO THIS PORTAL IS STRICTLY PROHIBITED AND MONITORED
        </div>
      </Card>
    </div>
  );
};