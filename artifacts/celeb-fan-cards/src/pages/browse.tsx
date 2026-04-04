import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useListCelebrities, useListCategories, useCreateOrder, useVerifyPayment } from "@workspace/api-client-react";
import { FanCard } from "@/components/fan-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Loader2, Search, Filter, X, Users, Globe, Award,
  CheckCircle, Star, ShieldCheck, CreditCard, Zap, Lock, Sparkles
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    FlutterwaveCheckout?: (config: {
      public_key: string;
      tx_ref: string;
      amount: number;
      currency: string;
      payment_options?: string;
      customer: { email: string; phone_number?: string; name: string };
      customizations: { title: string; description: string; logo?: string };
      meta?: Record<string, string | number>;
      callback: (data: { transaction_id: string | number; tx_ref: string; status: string }) => void;
      onclose: () => void;
    }) => void;
  }
}

const FLW_PUBLIC_KEY = "FLWPUBK-f59cf45ba615d95cda5b1fae895c2a0a-X";

interface Celebrity {
  id: number;
  name: string;
  imageUrl: string;
  category: string;
  bio: string;
  nationality?: string | null;
  popularFor?: string | null;
  fanCount: number;
}

const TIERS = [
  {
    id: "basic" as const,
    label: "BASIC",
    price: 1000,
    type: "Digital Only",
    border: "border-stone-500",
    activeBorder: "border-stone-400",
    activeBg: "bg-stone-900/60",
    activeText: "text-stone-300",
    glow: "shadow-[0_0_20px_rgba(120,113,108,0.4)]",
    badgeBg: "bg-gradient-to-r from-stone-600 to-stone-400",
    benefits: ["Official Digital Fan Card", "Unique Serial Number", "Verified Ownership", "Fan Forum Access"],
  },
  {
    id: "premium" as const,
    label: "PREMIUM",
    price: 1500,
    type: "Digital + Perks",
    border: "border-slate-500",
    activeBorder: "border-slate-400",
    activeBg: "bg-slate-900/60",
    activeText: "text-slate-300",
    glow: "shadow-[0_0_25px_rgba(148,163,184,0.5)]",
    badgeBg: "bg-gradient-to-r from-slate-500 to-slate-300",
    popular: true,
    benefits: ["Everything in Basic", "Holographic Effect", "Priority Event Access", "Monthly Exclusive Content", "Premium Badge"],
  },
  {
    id: "vip" as const,
    label: "VIP",
    price: 2500,
    type: "Digital + Physical",
    border: "border-primary/60",
    activeBorder: "border-primary",
    activeBg: "bg-primary/10",
    activeText: "text-primary",
    glow: "shadow-[0_0_35px_rgba(255,215,0,0.5)]",
    badgeBg: "bg-gradient-to-r from-[#8B6914] to-primary",
    benefits: ["Everything in Premium", "Physical Gold-Plated Card", "Shipped to Your Door", "Personalized Message", "Virtual Meet & Greet", "Merch Discounts"],
  },
];

type ModalStep = "view" | "buy" | "paying" | "success";

export default function Browse() {
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [tierFilter, setTierFilter] = useState<string>("All");
  const [selectedCeleb, setSelectedCeleb] = useState<Celebrity | null>(null);
  const [selectedTier, setSelectedTier] = useState<"basic" | "premium" | "vip">("premium");
  const [modalStep, setModalStep] = useState<ModalStep>("view");
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [confNumber, setConfNumber] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const createOrderMutation = useCreateOrder();
  const verifyPaymentMutation = useVerifyPayment();

  useEffect(() => {
    if (user) {
      setBuyerName(user.fullName || "");
      setBuyerEmail(user.email || "");
    }
  }, [user]);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(search), 400);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [search]);

  const { data: categories } = useListCategories();
  const queryParams = {
    ...(selectedCategory !== "All" && { category: selectedCategory }),
    ...(debouncedSearch && { search: debouncedSearch }),
  };
  const { data: celebrities, isLoading } = useListCelebrities(queryParams, {
    query: { queryKey: ["/api/celebrities", queryParams] as const },
  });

  const activeTier = TIERS.find(t => t.id === selectedTier)!;

  const openModal = (celeb: Celebrity) => {
    setSelectedCeleb(celeb);
    setSelectedTier("premium");
    setModalStep("view");
    setConfNumber("");
  };

  const closeModal = () => {
    setSelectedCeleb(null);
    setModalStep("view");
  };

  const handlePayment = () => {
    if (!buyerEmail.trim() || !buyerName.trim()) {
      toast({ title: "Required", description: "Please enter your name and email.", variant: "destructive" });
      return;
    }
    if (!selectedCeleb) return;

    const txRef = `celebcard-${Date.now()}`;
    setModalStep("paying");

    createOrderMutation.mutate(
      {
        data: {
          celebId: selectedCeleb.id,
          cardType: selectedTier,
          fullName: buyerName,
          email: buyerEmail,
          username: user?.username || buyerEmail.split("@")[0],
        },
      },
      {
        onSuccess: (order) => {
          if (!window.FlutterwaveCheckout) {
            verifyPaymentMutation.mutate(
              { data: { transactionId: `sim_${txRef}`, orderId: order.id } },
              {
                onSuccess: (data) => { setConfNumber(data.confirmationNumber || order.id.toString()); setModalStep("success"); },
                onError: () => { setConfNumber(order.id.toString()); setModalStep("success"); },
              }
            );
            return;
          }

          window.FlutterwaveCheckout({
            public_key: FLW_PUBLIC_KEY,
            tx_ref: txRef,
            amount: activeTier.price,
            currency: "NGN",
            payment_options: "card,banktransfer,mobilemoney,ussd",
            customer: { email: buyerEmail, name: buyerName },
            customizations: {
              title: "CelebFanCards",
              description: `${selectedCeleb.name} — ${selectedTier.toUpperCase()} Fan Card`,
            },
            meta: { tier: selectedTier.toUpperCase(), celebrity: selectedCeleb.name },
            callback: (data) => {
              if (data.status === "successful" || data.status === "completed") {
                verifyPaymentMutation.mutate(
                  { data: { transactionId: String(data.transaction_id), orderId: order.id } },
                  {
                    onSuccess: (res) => { setConfNumber(res.confirmationNumber || order.id.toString()); setModalStep("success"); },
                    onError: () => { setConfNumber(order.id.toString()); setModalStep("success"); },
                  }
                );
              } else {
                toast({ title: "Payment cancelled", variant: "destructive" });
                setModalStep("buy");
              }
            },
            onclose: () => { if (modalStep === "paying") setModalStep("buy"); },
          });
        },
        onError: () => {
          toast({ title: "Order failed", description: "Could not create order. Please try again.", variant: "destructive" });
          setModalStep("buy");
        },
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">The Directory</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover and collect official fan cards from the world's biggest icons.
        </p>
      </div>

      {/* Search + Filters */}
      <div className="max-w-4xl mx-auto mb-12 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search celebrities by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 py-6 text-lg bg-card/50 border-border/50 focus:border-primary"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant={selectedCategory === "All" ? "default" : "outline"} onClick={() => setSelectedCategory("All")} className="rounded-full" size="sm">
            All Categories
          </Button>
          {categories?.map((cat) => (
            <Button key={cat.category} variant={selectedCategory === cat.category ? "default" : "outline"} onClick={() => setSelectedCategory(cat.category)} className="rounded-full" size="sm">
              {cat.category} <span className="opacity-50 ml-1 text-xs">({cat.count})</span>
            </Button>
          ))}
        </div>

        {/* Tier + price filters */}
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { val: "All", label: "All Tiers" },
            { val: "basic", label: "Basic — $1,000" },
            { val: "premium", label: "Premium — $1,500" },
            { val: "vip", label: "VIP — $2,500" },
          ].map(({ val, label }) => (
            <button
              key={val}
              onClick={() => setTierFilter(val)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                tierFilter === val
                  ? val === "vip" ? "bg-primary/20 border-primary text-primary" : val === "premium" ? "bg-slate-500/20 border-slate-400 text-slate-300" : val === "basic" ? "bg-stone-700/20 border-stone-500 text-stone-300" : "bg-primary text-primary-foreground border-primary"
                  : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Celebrity Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : celebrities?.length === 0 ? (
        <div className="text-center py-20 bg-card/30 rounded-2xl border border-border/50">
          <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">No celebrities found</h2>
          <Button variant="link" onClick={() => { setSearch(""); setSelectedCategory("All"); setTierFilter("All"); }} className="mt-4 text-primary">Clear Filters</Button>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          <AnimatePresence>
            {celebrities?.map((celeb, idx) => (
              <motion.div
                layout
                key={celeb.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.3) }}
                className="cursor-pointer group"
                onClick={() => openModal(celeb)}
              >
                <FanCard
                  name={celeb.name}
                  imageUrl={celeb.imageUrl}
                  category={celeb.category}
                  size="small"
                  showPrice
                  className="w-full"
                />
                <div className="mt-2 text-center px-1">
                  <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{celeb.name}</p>
                  <p className="text-xs text-muted-foreground">{celeb.fanCount.toLocaleString()} fans</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ===== PREMIUM MODAL ===== */}
      <AnimatePresence>
        {selectedCeleb && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md"
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="relative bg-background border border-border/60 rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto shadow-2xl"
            >
              {/* Close */}
              <button onClick={closeModal} className="absolute top-3 right-3 z-50 bg-background/90 backdrop-blur border border-border rounded-full p-1.5 hover:bg-muted transition-colors">
                <X className="h-4 w-4" />
              </button>

              {/* ---- SUCCESS ---- */}
              {modalStep === "success" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 px-8 text-center">
                  <div className="h-20 w-20 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center mb-5 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
                    <CheckCircle className="h-10 w-10 text-green-400" />
                  </div>
                  <h2 className="text-3xl font-serif font-bold mb-2">Payment Successful!</h2>
                  <p className="text-muted-foreground text-lg mb-4">Your digital fan card has been added to My Collection.</p>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-6 py-3 mb-8">
                    <p className="text-green-400 font-medium">{selectedCeleb.name} — {selectedTier.toUpperCase()} Fan Card</p>
                    {confNumber && <p className="text-xs text-muted-foreground mt-1">Confirmation: {confNumber}</p>}
                  </div>
                  <div className="w-full max-w-[180px] mx-auto mb-8">
                    <FanCard name={selectedCeleb.name} imageUrl={selectedCeleb.imageUrl} category={selectedCeleb.category} tier={selectedTier} fanName={buyerName} size="small" />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={() => setLocation("/my-cards")} className="bg-primary text-primary-foreground hover:bg-primary/90">View My Collection</Button>
                    <Button variant="outline" onClick={closeModal}>Continue Shopping</Button>
                  </div>
                </motion.div>
              )}

              {/* ---- PAYING ---- */}
              {modalStep === "paying" && (
                <div className="flex flex-col items-center justify-center py-24 text-center px-8">
                  <div className="relative mb-8">
                    <div className="h-24 w-24 rounded-full border-4 border-primary/20 flex items-center justify-center">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                    <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Opening Payment...</h2>
                  <p className="text-muted-foreground">Complete your payment in the Flutterwave window.</p>
                </div>
              )}

              {/* ---- BUY STEP ---- */}
              {modalStep === "buy" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 md:p-8">
                  <button onClick={() => setModalStep("view")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-5">
                    ← Back to card preview
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div>
                      <div className="max-w-[280px] mx-auto">
                        <FanCard name={selectedCeleb.name} imageUrl={selectedCeleb.imageUrl} category={selectedCeleb.category} tier={selectedTier} fanName={buyerName || "YOUR NAME"} showPrice size="large" />
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <h2 className="text-2xl font-serif font-bold mb-1">Complete Purchase</h2>
                        <p className="text-muted-foreground text-sm">{selectedCeleb.name} — <span className={activeTier.activeText + " font-bold uppercase"}>{selectedTier}</span></p>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium block mb-1.5">Full Name</label>
                          <input type="text" value={buyerName} onChange={e => setBuyerName(e.target.value)} placeholder="Your full name" className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary/60 transition-colors" />
                        </div>
                        <div>
                          <label className="text-sm font-medium block mb-1.5">Email Address</label>
                          <input type="email" value={buyerEmail} onChange={e => setBuyerEmail(e.target.value)} placeholder="your@email.com" className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary/60 transition-colors" />
                          <p className="text-xs text-muted-foreground mt-1">Fan card delivered to this email.</p>
                        </div>
                      </div>

                      <div className="bg-card border border-border rounded-xl p-4 text-sm space-y-2">
                        <div className="flex justify-between"><span className="text-muted-foreground">Celebrity</span><span className="font-medium">{selectedCeleb.name}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Tier</span><span className={`font-bold uppercase ${activeTier.activeText}`}>{selectedTier}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span>{activeTier.type}</span></div>
                        <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                          <span>Total</span><span className="text-primary">${activeTier.price.toLocaleString()}</span>
                        </div>
                      </div>

                      <Button
                        onClick={handlePayment}
                        disabled={createOrderMutation.isPending}
                        className="w-full py-6 text-base font-bold bg-[#F5A623] hover:bg-[#E09612] text-black shadow-[0_4px_20px_rgba(245,166,35,0.4)] transition-all"
                      >
                        {createOrderMutation.isPending
                          ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                          : <><CreditCard className="mr-2 h-4 w-4" /> Pay ${activeTier.price.toLocaleString()} with Flutterwave</>
                        }
                      </Button>
                      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <Lock className="h-3 w-3" /> Secured by Flutterwave · 256-bit SSL
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ---- VIEW STEP (Main modal) ---- */}
              {modalStep === "view" && (
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] min-h-[560px]">

                  {/* LEFT — LARGE FAN CARD SHOWCASE */}
                  <div className="relative bg-gradient-to-br from-background to-card/80 p-6 md:p-8 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-border/50 overflow-hidden">
                    {/* Background glow */}
                    <div className={`absolute inset-0 pointer-events-none opacity-20`}
                      style={{
                        background: selectedTier === "vip"
                          ? "radial-gradient(ellipse at center, rgba(212,175,55,0.4) 0%, transparent 70%)"
                          : selectedTier === "premium"
                          ? "radial-gradient(ellipse at center, rgba(148,163,184,0.3) 0%, transparent 70%)"
                          : "radial-gradient(ellipse at center, rgba(120,113,108,0.3) 0%, transparent 70%)"
                      }}
                    />

                    <div className="relative z-10 w-full max-w-[280px]">
                      {/* "What you're getting" label */}
                      <div className="flex items-center gap-2 mb-4 justify-center">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Your Fan Card Preview</span>
                      </div>

                      <FanCard
                        name={selectedCeleb.name}
                        imageUrl={selectedCeleb.imageUrl}
                        category={selectedCeleb.category}
                        tier={selectedTier}
                        showPrice
                        size="large"
                      />

                      {/* Price callout */}
                      <motion.div
                        key={selectedTier}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-5 text-center"
                      >
                        <p className={`text-3xl font-serif font-black ${activeTier.activeText}`}>
                          ${activeTier.price.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">{activeTier.label} · {activeTier.type}</p>
                      </motion.div>
                    </div>
                  </div>

                  {/* RIGHT — INFO + TIER SELECTOR */}
                  <div className="flex flex-col p-6 md:p-8 overflow-y-auto">
                    {/* Celebrity header */}
                    <div className="flex items-start gap-4 mb-5 pb-5 border-b border-border/50">
                      <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-primary/30 flex-shrink-0">
                        <img
                          src={selectedCeleb.imageUrl}
                          alt={selectedCeleb.name}
                          className="w-full h-full object-cover object-top"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCeleb.name)}&size=200&background=1a1a2e&color=d4af37`;
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs font-bold uppercase tracking-widest text-primary border border-primary/40 bg-primary/10 px-2 py-0.5 rounded">
                            {selectedCeleb.category}
                          </span>
                          {selectedCeleb.nationality && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Globe className="h-3 w-3" /> {selectedCeleb.nationality}
                            </span>
                          )}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-serif font-bold leading-tight">{selectedCeleb.name}</h2>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-primary" /> {selectedCeleb.fanCount.toLocaleString()} fans</span>
                          {selectedCeleb.popularFor && <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5 text-primary" /> {selectedCeleb.popularFor}</span>}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed mb-6">{selectedCeleb.bio}</p>

                    {/* Tier selector */}
                    <div className="mb-6">
                      <h3 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Star className="h-4 w-4 text-primary" /> Choose Your Tier
                      </h3>
                      <div className="space-y-2">
                        {TIERS.map((tier) => (
                          <div
                            key={tier.id}
                            onClick={() => setSelectedTier(tier.id)}
                            className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                              selectedTier === tier.id
                                ? `${tier.activeBorder} ${tier.activeBg} ${tier.glow}`
                                : "border-border/40 bg-card/40 hover:border-border"
                            }`}
                          >
                            {tier.popular && selectedTier !== tier.id && (
                              <div className="absolute -top-2.5 left-4 bg-primary text-primary-foreground text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Most Popular
                              </div>
                            )}
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className={`${tier.badgeBg} text-black text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest`}>
                                  {tier.label}
                                </div>
                                <span className="text-xs text-muted-foreground">{tier.type}</span>
                              </div>
                              <span className={`font-serif font-black text-lg ${selectedTier === tier.id ? tier.activeText : "text-foreground"}`}>
                                ${tier.price.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                              {tier.benefits.slice(0, 3).map((b, i) => (
                                <span key={i} className={`text-xs flex items-center gap-1 ${selectedTier === tier.id ? "text-foreground" : "text-muted-foreground"}`}>
                                  <CheckCircle className={`h-3 w-3 flex-shrink-0 ${selectedTier === tier.id ? tier.activeText : "text-muted-foreground/50"}`} />
                                  {b}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTAs */}
                    <div className="mt-auto space-y-3">
                      <Button
                        onClick={() => setModalStep("buy")}
                        size="lg"
                        className="w-full py-6 text-base font-bold bg-[#F5A623] hover:bg-[#E09612] text-black shadow-[0_4px_20px_rgba(245,166,35,0.4)] transition-all"
                      >
                        <Zap className="mr-2 h-5 w-5" />
                        Buy Now — ${activeTier.price.toLocaleString()}
                      </Button>

                      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-green-400" /> Flutterwave Secured</span>
                        <span className="flex items-center gap-1"><Lock className="h-3.5 w-3.5 text-primary" /> 256-bit SSL</span>
                        <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-blue-400" /> Instant Delivery</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
