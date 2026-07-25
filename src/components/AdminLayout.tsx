import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  MessageSquare, 
  Settings, 
  LogOut, 
  ChevronRight,
  Menu,
  Bell,
  Search,
  User,
  Mail
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { Button } from './ui/button';
import { COMPANY_INFO } from '../constants';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

export const AdminLayout = () => {
  const { logout, user, role } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: Tags },
    { name: 'Inquiries', path: '/admin/inquiries', icon: MessageSquare },
    { name: 'Newsletter', path: '/admin/newsletter', icon: Mail },
    { name: 'Team & Authority', path: '/admin/users', icon: User, adminOnly: true },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-emerald-deep border-r border-white/10 w-72">
      <div className="p-6 border-b border-white/10">
        <div className="flex flex-col">
          <span className="text-2xl font-serif font-bold text-gold tracking-tighter">
            {COMPANY_INFO.name || "AU718"}
          </span>
          <span className="text-[10px] uppercase text-white/40 tracking-[2px] font-medium mt-1">
            MANAGEMENT HUB
          </span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems
          .filter(item => !item.adminOnly || role === 'Admin')
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive 
                    ? 'bg-gold/10 text-gold border border-gold/30' 
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon 
                    size={18} 
                    className={isActive ? 'text-gold' : 'text-white/50 group-hover:text-white/80'} 
                  />
                  <span className="uppercase tracking-widest text-xs font-bold">
                    {item.name}
                  </span>
                  <ChevronRight 
                    size={16} 
                    className="ml-auto opacity-0 group-hover:opacity-60 transition-opacity" 
                  />
                </>
              )}
            </NavLink>
          ))}
      </nav>

      <div className="p-4 border-t border-white/10 mt-auto">
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-white/70 hover:text-red-400 hover:bg-red-500/10 h-12"
        >
          <LogOut size={18} />
          <span className="uppercase text-xs font-bold tracking-widest">Logout</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-emerald-deep flex overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block border-r border-white/10">
        <SidebarContent />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-white/10 bg-emerald-deep/80 backdrop-blur-xl flex items-center justify-between px-6 lg:px-8 sticky top-0 z-50">
          <div className="flex items-center gap-4">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="lg:hidden text-white hover:bg-white/10"
                >
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="left" 
                className="p-0 w-72 border-r border-white/10 bg-emerald-deep"
              >
                <SidebarContent />
              </SheetContent>
            </Sheet>

            {/* Search Bar */}
            <div className="hidden md:flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-5 py-2.5 w-80">
              <Search size={18} className="text-white/40" />
              <input 
                type="text" 
                placeholder="Search products, orders..." 
                className="bg-transparent border-none outline-none text-sm text-white placeholder:text-white/40 w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Notification Bell */}
            <button className="relative text-white/70 hover:text-gold transition-colors">
              <Bell size={22} />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-gold rounded-full ring-2 ring-emerald-deep"></span>
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-6 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-white">
                  {user?.email?.split('@')[0] || 'Admin'}
                </div>
                <div className="text-[10px] text-gold uppercase tracking-widest font-medium">
                  {role || 'Administrator'}
                </div>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold to-yellow-500 flex items-center justify-center text-neutral-950 border border-gold/30">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-emerald-deep">
          <Outlet />
        </main>
      </div>
    </div>
  );
};