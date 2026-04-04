import { useEffect, useRef, useState } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useGetOrder } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Star, Home, ShoppingBag, Mail } from "lucide-react";
import confetti from "canvas-confetti";

function StarBurst() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
            x: Math.cos((i * 30 * Math.PI) / 180) * 80,
            y: Math.sin((i * 30 * Math.PI) / 180) * 80,
          }}
          transition={{ duration: 1.2, delay: i * 0.05, ease: "easeOut" }}
          className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-primary -translate-x-1/2 -translate-y-1/2"
        />
      ))}
    </div>
  );
}

export default function Success() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] || "");
  const orderId = parseInt(params.get("orderId") || "0");
  const [showCard, setShowCard] = useState(false);
  const hasFired = useRef(false);

  const { data: order } = useGetOrder(orderId, {
    query: { enabled: !!orderId, queryKey: ["/api/orders", orderId] as const },
  });

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;

    // Confetti burst
    const fire = (particleRatio: number, opts: object) => {
      try {
        confetti({
          origin: { y: 0.7 },
          particleCount: Math.floor(200 * particleRatio),
          ...opts,
        });
      } catch {
        // ignore if canvas-confetti not available
      }
    };

    setTimeout(() => {
      fire(0.25, { spread: 26, startVelocity: 55, colors: ["#FFD700", "#FFA500"] });
      fire(0.2, { spread: 60, colors: ["#FFD700", "#ffffff"] });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ["#FFD700", "#FF6B6B"] });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, colors: ["#FFD700"] });
      fire(0.1, { spread: 120, startVelocity: 45, colors: ["#FFD700", "#C0C0C0"] });
    }, 300);

    setTimeout(() => setShowCard(true), 800);
  }, []);

  const tierColors: Record<string, string> = {
    basic: "from-stone-700 to-stone-900",
    premium: "from-slate-600 to-slate-900",
    vip: "from-yellow-700 via-yellow-900 to-black",
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.08)_0%,transparent_70%)] pointer-events-none" />

      {/* Check mark burst */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        className="relative mb-6"
      >
        <StarBurst />
        <div className="h-28 w-28 bg-primary/20 rounded-full flex items-center justify-center border-4 border-primary shadow-[0_0_40px_rgba(255,215,0,0.4)]">
          <CheckCircle className="h-14 w-14 text-primary" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center max-w-2xl"
      >
        <h1 className="text-4xl md:text-6xl font-serif font-bold mb-3 text-gradient-gold">
          You're In! 🎉
        </h1>
        <p className="text-xl text-muted-foreground mb-2">
          Payment confirmed — your exclusive fan card is ready!
        </p>
        <p className="text-sm text-muted-foreground">
          A beautifully designed fan card has been sent to your email. Check your inbox!
        </p>
      </motion.div>

      {/* Fan Card Display */}
      <AnimatePresence>
        {showCard && order && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6, rotateY: 90 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ type: "spring", stiffness: 150, damping: 20, delay: 0.1 }}
            className="my-8 w-full max-w-sm"
          >
            <div className={`relative rounded-2xl p-6 bg-gradient-to-br ${tierColors[order.cardType] || tierColors.basic} border-2 border-primary/50 shadow-[0_0_40px_rgba(255,215,0,0.3)] overflow-hidden`}>
              {/* Shimmer overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(255,215,0,0.08)_50%,transparent_60%)]" />

              <div className="relative z-10 text-center space-y-3">
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary/80">CelebFanCards</p>

                {order.celebName && (
                  <p className="text-lg font-bold text-white/80">Fan of {order.celebName}</p>
                )}

                <div className="border-t border-primary/30 pt-3">
                  <p className="text-2xl md:text-3xl font-serif font-bold text-white">{order.fullName}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-primary/70 border-t border-primary/20 pt-3 mt-3">
                  <span className="uppercase tracking-widest font-bold">{order.cardType} Tier</span>
                  <span className="font-mono text-primary">${order.price.toFixed(2)}</span>
                </div>

                <p className="text-[10px] font-mono text-primary/50 tracking-wider">{order.confirmationNumber}</p>
                <p className="text-[10px] text-primary/40 tracking-[0.2em] uppercase">✦ Official CelebFanCard 2026 ✦</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* What happens next */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full mb-8"
      >
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" /> What's Next
        </h3>
        <ul className="space-y-3">
          {[
            "Your fan card design has been emailed to you",
            "Your digital card is live in 'My Cards'",
            order?.cardType === "vip" ? "Your physical metal card will be shipped within 2–3 weeks" : null,
            "Need help? WhatsApp: +1 (773) 280-1545",
          ].filter(Boolean).map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex flex-col sm:flex-row gap-3 w-full max-w-lg"
      >
        <Link href="/my-cards" className="flex-1">
          <Button size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            <ShoppingBag className="mr-2 h-4 w-4" /> View My Collection
          </Button>
        </Link>
        <Link href="/browse" className="flex-1">
          <Button size="lg" variant="outline" className="w-full border-border hover:border-primary/50">
            <Star className="mr-2 h-4 w-4" /> Get Another Card
          </Button>
        </Link>
        <Link href="/" className="sm:w-auto">
          <Button size="lg" variant="ghost" className="w-full">
            <Home className="h-4 w-4" />
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
