import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Loader2, Users, ShoppingBag, MessageSquare, DollarSign,
  Star, LogOut, RefreshCw, ChevronDown, ChevronUp, Phone,
  MapPin, CreditCard, Hash, Mail, Calendar, Award, TrendingUp,
  AlertCircle, CheckCircle2, XCircle, Clock, BarChart3, Search, Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ADMIN_EMAIL = "admin@fanCardHub.com";

interface RevenueByTier {
  [tier: string]: { count: number; revenue: number };
}

interface TopCelebrity {
  name: string;
  count: number;
  revenue: number;
}

interface AdminStats {
  totalUsers: number;
  totalCelebrities: number;
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  failedOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  todayOrders: number;
  totalMessages: number;
  revenueByTier: RevenueByTier;
  topCelebrities: TopCelebrity[];
  revenueByDay: Record<string, number>;
  users: Array<{ id: number; fullName: string; email: string; username: string; createdAt: string }>;
  orders: Array<{
    id: number; confirmationNumber: string; celebId: number; celebName: string;
    cardType: string; price: number; status: string;
    fullName: string; email: string; username: string;
    phone: string | null; shippingAddress: string | null;
    specialMessage: string | null; paymentMethod: string | null;
    transactionId: string | null; createdAt: string; updatedAt: string;
  }>;
  messages: Array<{ id: number; name: string; email: string; subject: string; message: string; createdAt: string }>;
}

type Tab = "overview" | "users" | "orders" | "messages" | "revenue";

function StatCard({ label, value, icon, color, sub }: { label: string; value: string | number; icon: React.ReactNode; color: string; sub?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border ${color} rounded-xl p-4`}
    >
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</span></div>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </motion.div>
  );
}

function OrderRow({ order }: { order: AdminStats["orders"][0] }) {
  const [expanded, setExpanded] = useState(false);

  const statusColor =
    order.status === "paid" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
    order.status === "failed" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
    "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";

  const statusIcon =
    order.status === "paid" ? <CheckCircle2 className="h-3 w-3" /> :
    order.status === "failed" ? <XCircle className="h-3 w-3" /> :
    <Clock className="h-3 w-3" />;

  const tierColor =
    order.cardType === "vip" ? "text-primary" :
    order.cardType === "premium" ? "text-slate-300" : "text-stone-400";

  return (
    <>
      <tr
        className="border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        <td className="p-3">
          <div className="flex items-center gap-1">
            {expanded ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
            <span className="font-mono text-xs text-primary">{order.confirmationNumber}</span>
          </div>
        </td>
        <td className="p-3">
          <p className="font-medium text-sm">{order.fullName}</p>
          <p className="text-xs text-primary">{order.email}</p>
        </td>
        <td className="p-3 text-sm">{order.celebName}</td>
        <td className="p-3">
          <span className={`text-xs font-bold uppercase ${tierColor}`}>{order.cardType}</span>
        </td>
        <td className="p-3 text-primary font-bold text-sm">${order.price.toFixed(2)}</td>
        <td className="p-3">
          <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit ${statusColor}`}>
            {statusIcon}{order.status}
          </span>
        </td>
        <td className="p-3 text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
      </tr>
      <AnimatePresence>
        {expanded && (
          <motion.tr
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <td colSpan={7} className="bg-muted/30 border-b border-border/50 p-0">
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <DetailItem icon={<Hash className="h-4 w-4 text-primary" />} label="Order ID" value={`#${order.id}`} />
                <DetailItem icon={<Hash className="h-4 w-4 text-primary" />} label="Confirmation #" value={order.confirmationNumber} mono />
                <DetailItem icon={<Users className="h-4 w-4 text-blue-400" />} label="Username" value={`@${order.username}`} />
                <DetailItem icon={<Mail className="h-4 w-4 text-green-400" />} label="Email" value={order.email} />
                <DetailItem icon={<Phone className="h-4 w-4 text-yellow-400" />} label="Phone" value={order.phone || "—"} />
                <DetailItem icon={<MapPin className="h-4 w-4 text-red-400" />} label="Shipping Address" value={order.shippingAddress || "—"} />
                <DetailItem icon={<CreditCard className="h-4 w-4 text-purple-400" />} label="Payment Method" value={order.paymentMethod || "—"} />
                <DetailItem icon={<Hash className="h-4 w-4 text-orange-400" />} label="Transaction ID" value={order.transactionId || "—"} mono />
                <DetailItem icon={<Calendar className="h-4 w-4 text-muted-foreground" />} label="Last Updated" value={new Date(order.updatedAt).toLocaleString()} />
                {order.specialMessage && (
                  <div className="sm:col-span-2 lg:col-span-3 bg-card border border-border rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><MessageSquare className="h-3 w-3" /> Special Message from Buyer</p>
                    <p className="text-sm italic text-foreground/90">"{order.specialMessage}"</p>
                  </div>
                )}
              </div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
}

function DetailItem({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-sm font-medium break-all ${mono ? "font-mono text-xs" : ""}`}>{value}</p>
      </div>
    </div>
  );
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-muted/40 rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
      <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
    </div>
  );
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const { user, token, logout } = useAuthStore();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [userSearch, setUserSearch] = useState("");

  const fetchStats = useCallback(async (silent = false) => {
    if (!user || !token) return;
    if (!silent) setLoading(true);
    else setRefreshing(true);

    const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, "");
    try {
      const r = await fetch(`${baseUrl}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error("Unauthorized");
      const data = await r.json();
      setStats(data as AdminStats);
    } catch {
      toast({ title: "Access Denied", description: "You don't have admin access.", variant: "destructive" });
      setLocation("/");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, token]);

  useEffect(() => {
    if (!user || !token) { setLocation("/login"); return; }
    if (user.email !== ADMIN_EMAIL) {
      toast({ title: "Access Denied", description: "This area is restricted to admins.", variant: "destructive" });
      setLocation("/");
      return;
    }
    fetchStats();
  }, [user, token]);

  if (!user || user.email !== ADMIN_EMAIL) return null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  const paidOrders = stats?.orders.filter(o => o.status === "paid") ?? [];

  const filteredOrders = (stats?.orders ?? []).filter(o => {
    const matchesStatus = orderStatusFilter === "all" || o.status === orderStatusFilter;
    const search = orderSearch.toLowerCase();
    const matchesSearch = !search ||
      o.fullName.toLowerCase().includes(search) ||
      o.email.toLowerCase().includes(search) ||
      o.celebName.toLowerCase().includes(search) ||
      o.confirmationNumber.toLowerCase().includes(search) ||
      (o.phone && o.phone.includes(search)) ||
      (o.transactionId && o.transactionId.toLowerCase().includes(search));
    return matchesStatus && matchesSearch;
  });

  const filteredUsers = (stats?.users ?? [])
    .filter(u => u.email !== ADMIN_EMAIL)
    .filter(u => {
      const s = userSearch.toLowerCase();
      return !s || u.fullName.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || u.username.toLowerCase().includes(s);
    });

  const maxTierRevenue = Math.max(...Object.values(stats?.revenueByTier ?? {}).map(t => t.revenue), 1);
  const maxCelebRevenue = Math.max(...(stats?.topCelebrities ?? []).map(c => c.revenue), 1);

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: "overview", label: "Overview", icon: <Star className="h-4 w-4" /> },
    { key: "revenue", label: "Revenue", icon: <BarChart3 className="h-4 w-4" /> },
    { key: "orders", label: "Orders", icon: <ShoppingBag className="h-4 w-4" />, count: stats?.totalOrders },
    { key: "users", label: "Users", icon: <Users className="h-4 w-4" />, count: stats?.totalUsers },
    { key: "messages", label: "Messages", icon: <MessageSquare className="h-4 w-4" />, count: stats?.totalMessages },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-gradient-gold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user.fullName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            className="border-border hover:border-primary/50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { logout(); setLocation("/"); }}
            className="border-destructive text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total Revenue" value={`$${(stats?.totalRevenue ?? 0).toFixed(2)}`} icon={<DollarSign className="h-5 w-5 text-green-400" />} color="border-green-500/30 bg-green-500/5" sub={`${paidOrders.length} paid orders`} />
        <StatCard label="Today's Revenue" value={`$${(stats?.todayRevenue ?? 0).toFixed(2)}`} icon={<TrendingUp className="h-5 w-5 text-primary" />} color="border-primary/30 bg-primary/5" sub={`${stats?.todayOrders ?? 0} orders today`} />
        <StatCard label="Total Users" value={stats?.totalUsers ?? 0} icon={<Users className="h-5 w-5 text-blue-400" />} color="border-blue-500/30 bg-blue-500/5" sub={`${stats?.totalCelebrities ?? 0} celebrities`} />
        <StatCard label="Pending Orders" value={stats?.pendingOrders ?? 0} icon={<AlertCircle className="h-5 w-5 text-yellow-400" />} color="border-yellow-500/30 bg-yellow-500/5" sub={`${stats?.failedOrders ?? 0} failed`} />
      </div>

      {/* Order Status Summary Bar */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-green-400 shrink-0" />
          <div>
            <p className="text-2xl font-bold text-green-400">{stats?.paidOrders ?? 0}</p>
            <p className="text-xs text-muted-foreground">Paid / Successful</p>
          </div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex items-center gap-3">
          <Clock className="h-6 w-6 text-yellow-400 shrink-0" />
          <div>
            <p className="text-2xl font-bold text-yellow-400">{stats?.pendingOrders ?? 0}</p>
            <p className="text-xs text-muted-foreground">Pending Payment</p>
          </div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-3">
          <XCircle className="h-6 w-6 text-red-400 shrink-0" />
          <div>
            <p className="text-2xl font-bold text-red-400">{stats?.failedOrders ?? 0}</p>
            <p className="text-xs text-muted-foreground">Failed / Cancelled</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:border-primary/50"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? "bg-white/20" : "bg-muted text-muted-foreground"}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <ShoppingBag className="text-primary h-5 w-5" /> Recent Orders
              </h3>
              {(stats?.orders ?? []).slice(0, 8).map(order => (
                <div key={order.id} className="flex items-start justify-between py-2.5 border-b border-border/50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{order.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{order.email}</p>
                    <p className="text-xs text-muted-foreground">{order.celebName} · <span className="uppercase font-medium">{order.cardType}</span> · <span className="text-primary font-semibold">${order.price}</span></p>
                  </div>
                  <div className="text-right ml-2 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full block mb-1 ${order.status === "paid" ? "bg-green-500/20 text-green-400" : order.status === "failed" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                      {order.status}
                    </span>
                    <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {(stats?.orders ?? []).length === 0 && <p className="text-center py-6 text-muted-foreground text-sm">No orders yet</p>}
            </div>

            {/* Recent Signups */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Users className="text-blue-400 h-5 w-5" /> Recent Signups
              </h3>
              {filteredUsers.slice(0, 8).map(u => (
                <div key={u.id} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{u.fullName}</p>
                    <p className="text-xs text-primary truncate">{u.email}</p>
                    <p className="text-xs text-muted-foreground">@{u.username}</p>
                  </div>
                  <p className="text-xs text-muted-foreground shrink-0 ml-2">{new Date(u.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
              {filteredUsers.length === 0 && <p className="text-center py-6 text-muted-foreground text-sm">No users yet</p>}
            </div>
          </div>

          {/* Top Celebrities */}
          {(stats?.topCelebrities ?? []).length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Award className="text-primary h-5 w-5" /> Top Selling Celebrities
              </h3>
              <div className="space-y-3">
                {(stats?.topCelebrities ?? []).map((c, i) => (
                  <div key={c.name} className="flex items-center gap-3">
                    <span className={`text-sm font-mono font-bold w-5 ${i === 0 ? "text-primary" : "text-muted-foreground"}`}>#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{c.name}</span>
                        <span className="text-sm text-primary font-bold">${c.revenue.toFixed(2)}</span>
                      </div>
                      <MiniBar value={c.revenue} max={maxCelebRevenue} color={i === 0 ? "bg-primary" : "bg-muted-foreground/50"} />
                    </div>
                    <span className="text-xs text-muted-foreground w-16 text-right">{c.count} sale{c.count !== 1 ? "s" : ""}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === "revenue" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 bg-card border border-border rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CreditCard className="text-primary h-5 w-5" /> Revenue by Tier
              </h3>
              <div className="space-y-4">
                {Object.entries(stats?.revenueByTier ?? {}).map(([tier, data]) => {
                  const tierColor = tier === "vip" ? "bg-primary" : tier === "premium" ? "bg-slate-400" : "bg-stone-500";
                  const textColor = tier === "vip" ? "text-primary" : tier === "premium" ? "text-slate-300" : "text-stone-400";
                  return (
                    <div key={tier}>
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${tierColor}`} />
                          <span className={`text-sm font-bold uppercase ${textColor}`}>{tier}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold">${data.revenue.toFixed(2)}</span>
                          <span className="text-xs text-muted-foreground ml-2">({data.count} sales)</span>
                        </div>
                      </div>
                      <MiniBar value={data.revenue} max={maxTierRevenue} color={tierColor} />
                    </div>
                  );
                })}
                {Object.keys(stats?.revenueByTier ?? {}).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No paid orders yet</p>
                )}
              </div>
            </div>

            <div className="md:col-span-2 bg-card border border-border rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Award className="text-primary h-5 w-5" /> Top 10 Celebrities by Revenue
              </h3>
              <div className="space-y-3">
                {(stats?.topCelebrities ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No paid orders yet</p>
                )}
                {(stats?.topCelebrities ?? []).map((c, i) => (
                  <div key={c.name} className="flex items-center gap-3">
                    <span className={`font-mono font-bold text-sm w-6 ${i === 0 ? "text-primary" : "text-muted-foreground"}`}>#{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{c.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">{c.count} card{c.count !== 1 ? "s" : ""}</span>
                          <span className="text-sm font-bold text-primary">${c.revenue.toFixed(2)}</span>
                        </div>
                      </div>
                      <MiniBar value={c.revenue} max={maxCelebRevenue} color={i === 0 ? "bg-primary" : i < 3 ? "bg-primary/60" : "bg-muted-foreground/40"} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Revenue Summary Table */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <BarChart3 className="text-primary h-5 w-5" /> Revenue Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Revenue", value: `$${(stats?.totalRevenue ?? 0).toFixed(2)}`, color: "text-green-400" },
                { label: "Today's Revenue", value: `$${(stats?.todayRevenue ?? 0).toFixed(2)}`, color: "text-primary" },
                { label: "Avg Order Value", value: `$${stats && paidOrders.length > 0 ? (stats.totalRevenue / paidOrders.length).toFixed(2) : "0.00"}`, color: "text-blue-400" },
                { label: "Conversion Rate", value: `${stats && stats.totalOrders > 0 ? ((stats.paidOrders / stats.totalOrders) * 100).toFixed(1) : 0}%`, color: "text-purple-400" },
              ].map(item => (
                <div key={item.label} className="bg-muted/30 rounded-lg p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                  <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, email, celebrity, order ID..."
                value={orderSearch}
                onChange={e => setOrderSearch(e.target.value)}
                className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
              <select
                value={orderStatusFilter}
                onChange={e => setOrderStatusFilter(e.target.value)}
                className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
              >
                <option value="all">All Status ({stats?.totalOrders ?? 0})</option>
                <option value="paid">Paid ({stats?.paidOrders ?? 0})</option>
                <option value="pending">Pending ({stats?.pendingOrders ?? 0})</option>
                <option value="failed">Failed ({stats?.failedOrders ?? 0})</option>
              </select>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{filteredOrders.length}</span> orders
                <span className="text-xs ml-2">(Click any row to expand full buyer details)</span>
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left p-3 font-medium">Order</th>
                    <th className="text-left p-3 font-medium">Buyer</th>
                    <th className="text-left p-3 font-medium">Celebrity</th>
                    <th className="text-left p-3 font-medium">Tier</th>
                    <th className="text-left p-3 font-medium">Price</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(o => <OrderRow key={o.id} order={o} />)}
                </tbody>
              </table>
              {filteredOrders.length === 0 && (
                <p className="text-center py-12 text-muted-foreground">No orders found</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users by name, email, or username..."
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50"
            />
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{filteredUsers.length}</span> registered users
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left p-4 font-medium">#</th>
                    <th className="text-left p-4 font-medium">Full Name</th>
                    <th className="text-left p-4 font-medium">Email</th>
                    <th className="text-left p-4 font-medium">Username</th>
                    <th className="text-left p-4 font-medium">Joined</th>
                    <th className="text-left p-4 font-medium">Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, idx) => {
                    const userOrders = (stats?.orders ?? []).filter(o => o.email === u.email);
                    const userPaid = userOrders.filter(o => o.status === "paid");
                    return (
                      <tr key={u.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="p-4 text-muted-foreground text-xs">{idx + 1}</td>
                        <td className="p-4 font-medium">{u.fullName}</td>
                        <td className="p-4 text-primary">{u.email}</td>
                        <td className="p-4 text-muted-foreground">@{u.username}</td>
                        <td className="p-4 text-muted-foreground text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="p-4">
                          <span className="text-xs">
                            {userOrders.length > 0 ? (
                              <span>
                                <span className="text-green-400 font-medium">{userPaid.length} paid</span>
                                {userOrders.length !== userPaid.length && <span className="text-muted-foreground"> / {userOrders.length} total</span>}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">No orders</span>
                            )}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <p className="text-center py-12 text-muted-foreground">No users found</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === "messages" && (
        <div className="space-y-4">
          {(stats?.messages ?? []).length === 0 && (
            <div className="text-center py-16">
              <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No contact messages yet</p>
            </div>
          )}
          {(stats?.messages ?? []).map(m => (
            <div key={m.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-base">{m.name}</p>
                  <p className="text-sm text-primary">{m.email}</p>
                </div>
                <p className="text-xs text-muted-foreground shrink-0 ml-4">{new Date(m.createdAt).toLocaleString()}</p>
              </div>
              <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                <span className="text-muted-foreground">Subject:</span>
                <span>{m.subject}</span>
              </p>
              <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-4 leading-relaxed">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
