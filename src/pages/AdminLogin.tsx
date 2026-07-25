import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { COMPANY_INFO } from '../constants';
import { Eye, EyeOff, Shield, Loader2 } from 'lucide-react';

export const AdminLogin = () => {
  const [email, setEmail] = useState(import.meta.env.VITE_ADMIN_EMAIL || 'admin@au718.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  const { user, isAdmin, login, signup, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in as admin
  if (user && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isStrongPassword = (pass: string) => pass.length >= 8;

  // Replace your current handleLogin and handleSignUp with these:

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      console.log("🔑 Attempting login with:", trimmedEmail);
     const result = await login(
      email,
      password
    );

    if (result.isAdmin) {
      navigate('/admin');
    } else {
      navigate('/');
    }

      if (!result.isAdmin) {
        await logout();
        toast.error("This account is not authorized for admin access");
        return;
      }

      toast.success("Login successful! Welcome Admin.");
      navigate('/admin', { replace: true });
    } catch (error: any) {
      console.error("❌ Login error:", error);
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      console.log("📝 Attempting signup with:", trimmedEmail);
      const result = await signup(trimmedEmail, password);
      
      console.log("✅ Signup response:", result);

      if (!result.isAdmin) {
        await logout();
        toast.error("Account created but not authorized as admin");
        return;
      }

      toast.success("Admin account created successfully!");
      navigate('/admin', { replace: true });
    } catch (error: any) {
      console.error("❌ Signup error:", error);
      toast.error(error.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-deep px-4 py-12 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gold/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gold/10 rounded-full blur-[140px]" />
      </div>

      <Card className="w-full max-w-md bg-neutral-950 border border-gold/30 shadow-2xl relative z-10">
        <CardHeader className="space-y-6 text-center pt-10 pb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-gold to-yellow-400 rounded-2xl flex items-center justify-center shadow-lg shadow-gold/30">
            <Shield className="w-11 h-11 text-neutral-950" />
          </div>

          <div>
            <CardTitle className="text-4xl font-serif text-white tracking-tighter">
              {COMPANY_INFO.name || "AU718 GOLD STORE"}
            </CardTitle>
            <CardDescription className="text-gold/80 uppercase tracking-[3px] text-sm mt-2">
              ADMINISTRATIVE PORTAL
            </CardDescription>
          </div>
        </CardHeader>

        <Tabs 
          value={activeTab} 
          onValueChange={(v) => {
            setActiveTab(v as 'login' | 'signup');
            setPassword('');
            setShowPassword(false);
          }}
        >
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-2 bg-black border border-white/10 p-1">
              <TabsTrigger value="login" className="py-3 data-[state=active]:bg-neutral-800 data-[state=active]:text-gold">
                Login
              </TabsTrigger>
              <TabsTrigger value="signup" className="py-3 data-[state=active]:bg-neutral-800 data-[state=active]:text-gold">
                Create Admin
              </TabsTrigger>
            </TabsList>
          </div>

          {/* LOGIN TAB */}
          <TabsContent value="login" className="mt-0">
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-5 px-6 pt-8">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-white">Email Address</Label>
                  <Input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="admin@au718.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-neutral-900 border-white/20 text-white placeholder:text-white/50 focus:border-gold"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-white">Password</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-neutral-900 border-white/20 text-white placeholder:text-white/50 focus:border-gold pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="px-6 pb-10">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full gold-gradient text-black font-bold py-6 text-base tracking-wider"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>

          {/* SIGNUP TAB */}
          <TabsContent value="signup" className="mt-0">
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-5 px-6 pt-8">
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-white">Email Address</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    placeholder="admin@au718.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-neutral-900 border-white/20 text-white placeholder:text-white/50 focus:border-gold"
                    required
                  />
                  <p className="text-xs text-amber-400/90">
                    Only authorized emails can create admin accounts
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-white">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Create strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-neutral-900 border-white/20 text-white placeholder:text-white/50 focus:border-gold pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {password && (
                    <p className={`text-xs ${isStrongPassword(password) ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isStrongPassword(password) ? '✓ Strong password' : 'Minimum 8 characters required'}
                    </p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="px-6 pb-10">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full border border-gold/40 hover:bg-gold/10 text-gold font-bold py-6 text-base tracking-wider"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Admin Account"
                  )}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};