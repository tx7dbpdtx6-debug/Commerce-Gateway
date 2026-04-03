import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuthStore } from "@/lib/auth";
import { useListOrders } from "@workspace/api-client-react";
import { FanCard } from "@/components/fan-card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Star } from "lucide-react";

export default function MyCards() {
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();

  const { data: orders, isLoading } = useListOrders(
    { userEmail: user?.email },
    { query: { enabled: !!user?.email, queryKey: ['/api/orders', { userEmail: user?.email }] as const } }
  );

  // If not logged in, redirect (handled mostly by router/layout, but safety check)
  if (!user) {
    setLocation("/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Filter for paid orders
  const paidOrders = orders?.filter(o => o.status === 'paid' || o.status === 'processing') || [];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-foreground mb-2 flex items-center gap-3">
            <Star className="h-8 w-8 text-primary" fill="currentColor" />
            My Collection
          </h1>
          <p className="text-muted-foreground text-lg">Your exclusive digital fan cards.</p>
        </div>
        <Button onClick={() => setLocation("/browse")} className="bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/50 transition-all">
          <Plus className="mr-2 h-4 w-4" /> Get New Cards
        </Button>
      </div>

      {paidOrders.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border/50 rounded-2xl shadow-inner">
          <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Star className="h-10 w-10 text-primary/50" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Your collection is empty</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            You don't have any fan cards yet. Browse our selection of celebrities to start your VIP collection.
          </p>
          <Button size="lg" onClick={() => setLocation("/browse")}>
            Browse Celebrities
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {paidOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <FanCard
                name={order.celebName}
                tier={order.cardType as any}
                fanName={order.fullName}
                cardNumber={order.confirmationNumber.substring(0, 8)}
              />
              <div className="mt-4 text-center">
                <p className="text-sm font-medium">{order.celebName}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">{order.cardType} Tier</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
