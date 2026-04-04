import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuthStore } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Loader2, Users, ShoppingBag, MessageSquare, DollarSign, Star, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ADMIN_EMAIL = "admin@fanCardHub.com";

interface AdminStats {
  totalUsers: number;
  totalCelebrities: number;
  totalOrders: number;
  totalRevenue: number;
  totalMessages: number;
  users: Array<{ id: number; fullName: string; email: string; username: string; createdAt: string }>;
  orders: Array<{
    id: number; confirmationNumber: string; celebName: string; cardType: string; price: number;
    status: string; fullName: string; email: string; phone: string | null; shippingAddress: string | null;
    specialMessage: string | null; transactionId: string | null; createdAt: string;
  }>;
  messages: Array<{ id: number; name: string; email: string; subject: string; message: string; createdAt: string }>;
}

type Tab = "overview" | "users" | "orders" | "messages";

export default function Admin() {
  const [, setLocation] = useLocation();
  const { user, token, logout } = useAuthStore();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  useEffect(() => {
    if (!user || !token) {
      setLocation("/login");
      return;
    }
    if (user.email !== ADMIN_EMAIL) {
      toast({ title: "Access Denied", description: "This area is restricted to admins.", variant: "destructive" });
      setLocation("/");
      return;
    }

    const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, "");
    fetch(`${baseUrl}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Unauthorized");
        return r.json();
      })
      .then((data) => {
        setStats(data as AdminStats);
        setLoading(false);
      })
      .catch(() => {
        toast({ title: "Access Denied", description: "You don't have admin access.", variant: "destructive" });
        setLocation("/");
      });
  }, [user, token]);

  if (!user || user.email !== ADMIN_EMAIL) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const paidOrders = stats?.orders.filter(o => o.status === "paid") ?? [];
  const pendingOrders = stats?.orders.filter(o => o.status === "pending") ?? [];

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <Star className="h-4 w-4" /> },
    { key: "users", label: `Users (${stats?.totalUsers ?? 0})`, icon: <Users className="h-4 w-4" /> },
    { key: "orders", label: `Orders (${stats?.totalOrders ?? 0})`, icon: <ShoppingBag className="h-4 w-4" /> },
    { key: "messages", label: `Messages (${stats?.totalMessages ?? 0})`, icon: <MessageSquare className="h-4 w-4" /> },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-gradient-gold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user.fullName} (Aigbe)</p>
        </div>
        <Button
          variant="outline"
          onClick={() => { logout(); setLocation("/"); }}
          className="border-destructive text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4 mr-2" /> Logout
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Users", value: stats?.totalUsers ?? 0, icon: <Users className="h-5 w-5 text-blue-400" />, color: "border-blue-500/30 bg-blue-500/5" },
          { label: "Total Orders", value: stats?.totalOrders ?? 0, icon: <ShoppingBag className="h-5 w-5 text-primary" />, color: "border-primary/30 bg-primary/5" },
          { label: "Paid Orders", value: paidOrders.length, icon: <ShoppingBag className="h-5 w-5 text-green-400" />, color: "border-green-500/30 bg-green-500/5" },
          { label: "Total Revenue", value: `$${(stats?.totalRevenue ?? 0).toFixed(2)}`, icon: <DollarSign className="h-5 w-5 text-green-400" />, color: "border-green-500/30 bg-green-500/5" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`border ${stat.color} rounded-xl p-4`}
          >
            <div className="flex items-center gap-2 mb-2">{stat.icon}<span className="text-sm text-muted-foreground">{stat.label}</span></div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
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
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><ShoppingBag className="text-primary h-5 w-5" /> Recent Orders</h3>
            {(stats?.orders ?? []).slice(0, 5).map(order => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <p className="font-medium text-sm">{order.fullName}</p>
                  <p className="text-xs text-muted-foreground">{order.celebName} · {order.cardType.toUpperCase()} · ${order.price}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${order.status === "paid" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Users className="text-blue-400 h-5 w-5" /> Recent Signups</h3>
            {(stats?.users ?? []).filter(u => u.email !== ADMIN_EMAIL).slice(0, 5).map(u => (
              <div key={u.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <p className="font-medium text-sm">{u.fullName}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                <p className="text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left p-4 font-medium">Name</th>
                  <th className="text-left p-4 font-medium">Email</th>
                  <th className="text-left p-4 font-medium">Username</th>
                  <th className="text-left p-4 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.users ?? []).filter(u => u.email !== ADMIN_EMAIL).map(u => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="p-4 font-medium">{u.fullName}</td>
                    <td className="p-4 text-muted-foreground">{u.email}</td>
                    <td className="p-4 text-muted-foreground">@{u.username}</td>
                    <td className="p-4 text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(stats?.users ?? []).filter(u => u.email !== ADMIN_EMAIL).length === 0 && (
              <p className="text-center py-8 text-muted-foreground">No users yet</p>
            )}
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left p-4 font-medium">Order ID</th>
                  <th className="text-left p-4 font-medium">Buyer</th>
                  <th className="text-left p-4 font-medium">Celebrity</th>
                  <th className="text-left p-4 font-medium">Tier</th>
                  <th className="text-left p-4 font-medium">Price</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.orders ?? []).map(o => (
                  <tr key={o.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="p-4 font-mono text-xs text-primary">{o.confirmationNumber}</td>
                    <td className="p-4">
                      <p className="font-medium">{o.fullName}</p>
                      <p className="text-xs text-muted-foreground">{o.email}</p>
                    </td>
                    <td className="p-4">{o.celebName}</td>
                    <td className="p-4 capitalize">{o.cardType}</td>
                    <td className="p-4 text-primary font-medium">${o.price}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${o.status === "paid" ? "bg-green-500/20 text-green-400" : o.status === "failed" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(stats?.orders ?? []).length === 0 && (
              <p className="text-center py-8 text-muted-foreground">No orders yet</p>
            )}
          </div>
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === "messages" && (
        <div className="space-y-4">
          {(stats?.messages ?? []).length === 0 && (
            <p className="text-center py-12 text-muted-foreground">No contact messages yet</p>
          )}
          {(stats?.messages ?? []).map(m => (
            <div key={m.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold">{m.name}</p>
                  <p className="text-sm text-primary">{m.email}</p>
                </div>
                <p className="text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleDateString()}</p>
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Subject: {m.subject}</p>
              <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
