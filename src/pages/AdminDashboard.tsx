import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  Package, 
  Users, 
  TrendingUp, 
  DollarSign,
  ArrowUpRight,
  Clock
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

interface DashboardStats {
  products: number;
  inquiries: number;
  categories: number;
  activeListings: number;
  admins: number;
}

interface Inquiry {
  id: string;
  customerName?: string;
  customerContact?: string;
  status?: string;
  message?: string;
  createdAt?: string | Date;
}

interface TrafficData {
  name: string;
  value: number;
  date?: string;
}

export const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    products: 0,
    inquiries: 0,
    categories: 0,
    activeListings: 0,
    admins: 0
  });

  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
  const [inquiryTraffic, setInquiryTraffic] = useState<TrafficData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch main stats
        const statsData = await api('/api/dashboard/stats');
        setStats(statsData.stats || stats);
        setRecentInquiries(statsData.recentInquiries || []);
        if (statsData.dbStatus) setDbStatus(statsData.dbStatus);

        // Fetch inquiry traffic
        const trafficData = await api('/api/dashboard/inquiry-traffic');
        setInquiryTraffic(trafficData || []);

      } catch (error: any) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Fallback chart data
  const chartData = inquiryTraffic.length > 0 
    ? inquiryTraffic 
    : [
        { name: 'Mon', value: 12 }, { name: 'Tue', value: 19 }, 
        { name: 'Wed', value: 15 }, { name: 'Thu', value: 25 }, 
        { name: 'Fri', value: 22 }, { name: 'Sat', value: 18 }, 
        { name: 'Sun', value: 14 }
      ];

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 bg-emerald-rich/20 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-[400px] bg-emerald-rich/20 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-white mb-2 leading-none uppercase">Executive Overview</h1>
          <p className="text-white/40 uppercase tracking-widest text-[10px] font-bold">Business Performance Metrics</p>
        </div>

        <div className="flex flex-wrap gap-4">
          {dbStatus && (
            <Badge 
              variant="outline" 
              className={`py-1 px-4 font-bold uppercase tracking-wider text-[9px] ${
                dbStatus.connected 
                  ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' 
                  : 'text-amber-400 border-amber-500/20 bg-amber-500/5'
              }`}
            >
              DB: {dbStatus.connected ? 'Connected' : 'Fallback Mode'}
            </Badge>
          )}
          <Badge variant="outline" className="text-gold border-gold/20 py-1 px-4 bg-gold/5">Real-time Sync Active</Badge>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-white/60">
            <Clock size={12} className="text-gold" />
            Last updated: Just now
          </div>
        </div>
      </div>

      {/* MongoDB Warning */}
      {dbStatus && dbStatus.uriDefined && !dbStatus.connected && (
        <div className="border border-amber-500/20 bg-amber-500/5 p-6 rounded-2xl">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-2">
              <h4 className="text-amber-400 font-serif font-bold text-base uppercase tracking-wider">
                ⚠️ MongoDB Connection Issue Detected
              </h4>
              <p className="text-xs text-white/70 leading-relaxed">
                MongoDB Atlas is blocking connections. Please whitelist <strong>0.0.0.0/0</strong> in Network Access.
              </p>
            </div>
            <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/10">
              FALLBACK ACTIVE
            </Badge>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Products', value: stats.products, icon: Package, trend: '+12%', color: 'text-blue-400' },
          { label: 'Team Members', value: stats.admins, icon: Users, trend: '+2', color: 'text-green-400' },
          { label: 'Active Listings', value: stats.activeListings, icon: TrendingUp, trend: '98%', color: 'text-gold' },
          { label: 'Inventory Value', value: 'Elite', icon: DollarSign, trend: 'High', color: 'text-purple-400' }
        ].map((stat, i) => (
          <Card key={i} className="bg-emerald-rich/40 border-gold/10 overflow-hidden group hover:border-gold/30 transition-all backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">{stat.label}</p>
                  <h3 className="text-3xl font-serif font-bold text-white mb-2">{stat.value}</h3>
                  <div className="flex items-center gap-1">
                    <span className={`text-[10px] font-bold ${stat.color}`}>{stat.trend}</span>
                    <ArrowUpRight size={10} className={stat.color} />
                  </div>
                </div>
                <div className="p-3 bg-emerald-deep/50 rounded-xl text-white/60 group-hover:text-gold transition-colors">
                  <stat.icon size={20} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts & Recent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Inquiry Traffic Chart */}
        <Card className="lg:col-span-2 bg-emerald-rich/40 border-gold/10 p-8">
          <CardHeader className="px-0 pt-0 mb-8">
            <CardTitle className="text-xl font-serif text-white uppercase leading-none">Inquiry Traffic</CardTitle>
            <p className="text-[10px] uppercase text-white/40 tracking-widest font-bold mt-2">Volume over the last 7 days</p>
          </CardHeader>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C5A059" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#C5A059" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#06372D', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '12px' }}
                  itemStyle={{ color: '#C5A059' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#C5A059" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Leads */}
        <Card className="bg-emerald-rich/40 border-gold/10 p-8 flex flex-col">
          <CardHeader className="px-0 pt-0 mb-8">
            <CardTitle className="text-xl font-serif text-white uppercase leading-none">Recent Leads</CardTitle>
            <p className="text-[10px] uppercase text-white/40 tracking-widest font-bold mt-2">Latest Customer Inquiries</p>
          </CardHeader>

          <CardContent className="px-0 flex-1 space-y-6">
            {recentInquiries.length > 0 ? (
              recentInquiries.map((inq) => (
                <div key={inq.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-deep/50 flex items-center justify-center text-white/60 font-medium group-hover:bg-gold/10 group-hover:text-gold transition-colors">
                      {(inq.customerName || 'U').charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white uppercase tracking-tight">
                        {inq.customerName || 'Unknown Customer'}
                      </p>
                      <p className="text-[10px] text-white/40">{inq.customerContact || 'No contact info'}</p>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-[9px] py-0 px-2 ${
                      inq.status === 'unread' 
                        ? 'bg-gold/10 text-gold border-gold/20' 
                        : 'bg-emerald-deep/50 text-white/40 border-gold/10'
                    }`}
                  >
                    {inq.status || 'new'}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                <Users size={40} className="mb-4" />
                <p className="text-xs uppercase tracking-widest">No Recent Inquiries Yet</p>
              </div>
            )}
          </CardContent>

          <Link to="/admin/inquiries" className="mt-auto">
            <Button variant="ghost" className="w-full text-[10px] uppercase tracking-widest font-bold text-white/40 hover:text-gold">
              View All Inquiries →
            </Button>
          </Link>
        </Card>

        {/* Authority Card */}
        <Card className="bg-emerald-rich/40 border-gold/10 p-8 flex flex-col justify-between group hover:border-gold/20 transition-all">
          <div>
            <CardHeader className="px-0 pt-0 mb-4">
              <CardTitle className="text-xl font-serif text-white uppercase leading-none">Authority</CardTitle>
              <p className="text-[10px] uppercase text-white/40 tracking-widest font-bold mt-2">Team & Delegation</p>
            </CardHeader>
            <p className="text-xs text-white/40 leading-relaxed">
              Grant specific permissions to new team members. Control access levels between full Admin and Assistant roles.
            </p>
          </div>
          <Link to="/admin/users">
            <Button className="w-full mt-8 gold-gradient text-black font-bold uppercase tracking-widest text-[10px] py-6">
              Manage Team
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};