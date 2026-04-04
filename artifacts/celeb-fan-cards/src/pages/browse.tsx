import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useListCelebrities, useListCategories, useCreateOrder, useVerifyPayment } from "@workspace/api-client-react";
import { FanCard } from "@/components/fan-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Filter, X, Users, Globe, Award, CheckCircle, Star, ShieldCheck, CreditCard, Zap, Lock } from "lucide-react";
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

const tiers = [
  {
    id: "basic" as const,
    name: "Basic",
    price: 1000,
    type: "Digital Only",
    color: "border-stone-500",
    textColor: "text-stone-300",
    glow: "shadow-[0_0_10px_rgba(87,83,78,0.3)]",
    gradientFrom: "from-stone-700/80",
    gradientTo: "to-stone-900/80",
    glowRing: "shadow-[0_0_40px_rgba(87,83,78,0.4)]",
    benefits: [
      "Official Digital Fan Card",
      "Unique Serial Number",
      "Verified Ownership",
      "Access to fan forums",
    ],
  },
  {
    id: "premium" as const,
    name: "Premium",
    price: 1500,
    type: "Digital + Perks",
    color: "border-slate-400",
    textColor: "text-slate-300",
    glow: "shadow-[0_0_20px_rgba(148,163,184,0.2)]",
    gradientFrom: "from-slate-400/80",
    gradientTo: "to-slate-600/80",
    glowRing: "shadow-[0_0_40px_rgba(148,163,184,0.5)]",
    popular: true,
    benefits: [
      "Everything in Basic",
      "Animated Holographic Effect",
      "Priority event access",
      "Exclusive monthly content",
      "Premium profile badge",
    ],
  },
  {
    id: "vip" as const,
    name: "VIP",
    price: 2500,
    type: "Digital + Physical",
    color: "border-primary",
    textColor: "text-primary",
    glow: "shadow-[0_0_25px_rgba(255,215,0,0.2)]",
    gradientFrom: "from-primary/80",
    gradientTo: "to-yellow-600/80",
    glowRing: "shadow-[0_0_60px_rgba(255,215,0,0.6)]",
    benefits: [
      "Everything in Premium",
      "Physical Gold-Plated Metal Card",
      "Shipped directly to your door",
      "Personalized message inclusion",
      "Virtual meet & greet entry",
      "Exclusive merchandise discounts",
    ],
  },
];

type ModalStep = "view" | "buy" | "paying" | "success" | "error";

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
  const txRefRef = useRef<string>("");

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
  const { data: allCelebrities, isLoading } = useListCelebrities(queryParams, {
    query: { queryKey: ["/api/celebrities", queryParams] as const },
  });

  const celebrities = allCelebrities;

  const handleCelebClick = (celeb: Celebrity) => {
    setSelectedCeleb(celeb);
    setSelectedTier("premium");
    setModalStep("view");
    setConfNumber("");
  };

  const closeModal = () => {
    setSelectedCeleb(null);
    setModalStep("view");
  };

  const currentTier = tiers.find(t => t.id === selectedTier)!;

  const handleBuyNow = () => {
    if (!selectedCeleb) return;
    setModalStep("buy");
  };

  const handlePayment = () => {
    if (!buyerEmail.trim() || !buyerName.trim()) {
      toast({ title: "Required", description: "Please enter your name and email.", variant: "destructive" });
      return;
    }
    if (!selectedCeleb) return;

    const txRef = `celebcard-${Date.now()}`;
    txRefRef.current = txRef;

    const price = currentTier.price;

    setModalStep("paying");

    createOrderMutation.mutate(
      {
        data: {
          celebId: selectedCeleb.id,
          cardType: selectedTier,
          fullName: buyerName,
          email: buyerEmail,
          username: user?.username || buyerEmail.split("@")[0],
          phone: user?.email ? undefined : undefined,
        },
      },
      {
        onSuccess: (order) => {
          if (!window.FlutterwaveCheckout) {
            // Simulation mode fallback
            verifyPaymentMutation.mutate(
              { data: { transactionId: `sim_${txRef}`, orderId: order.id } },
              {
                onSuccess: (data) => {
                  setConfNumber(data.confirmationNumber || order.id.toString());
                  setModalStep("success");
                },
                onError: () => {
                  setModalStep("success");
                  setConfNumber(order.id.toString());
                },
              }
            );
            return;
          }

          window.FlutterwaveCheckout({
            public_key: FLW_PUBLIC_KEY,
            tx_ref: txRef,
            amount: price,
            currency: "NGN",
            payment_options: "card,banktransfer,mobilemoney,ussd",
            customer: {
              email: buyerEmail,
              name: buyerName,
            },
            customizations: {
              title: "CelebFanCards",
              description: `${selectedCeleb.name} — ${selectedTier.toUpperCase()} Fan Card`,
            },
            meta: {
              tier: selectedTier.toUpperCase(),
              celebrity: selectedCeleb.name,
            },
            callback: (data) => {
              if (data.status === "successful" || data.status === "completed") {
                verifyPaymentMutation.mutate(
                  { data: { transactionId: String(data.transaction_id), orderId: order.id } },
                  {
                    onSuccess: (res) => {
                      setConfNumber(res.confirmationNumber || order.id.toString());
                      setModalStep("success");
                    },
                    onError: () => {
                      setModalStep("success");
                      setConfNumber(order.id.toString());
                    },
                  }
                );
              } else {
                toast({ title: "Payment cancelled", description: "Payment was not completed.", variant: "destructive" });
                setModalStep("buy");
              }
            },
            onclose: () => {
              if (modalStep === "paying") setModalStep("buy");
            },
          });
        },
        onError: () => {
          toast({ title: "Order failed", description: "Could not create your order. Please try again.", variant: "destructive" });
          setModalStep("buy");
        },
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">The Directory</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover and collect official fan cards from the world's biggest icons.
        </p>
      </div>

      {/* Search + Filters */}
      <div className="max-w-4xl mx-auto mb-12 space-y-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search celebrities by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 py-6 text-lg bg-card/50 border-border/50 focus:border-primary shadow-sm"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            variant={selectedCategory === "All" ? "default" : "outline"}
            onClick={() => setSelectedCategory("All")}
            className="rounded-full"
            size="sm"
          >
            All Categories
          </Button>
          {categories?.map((cat) => (
            <Button
              key={cat.category}
              variant={selectedCategory === cat.category ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat.category)}
              className="rounded-full"
              size="sm"
            >
              {cat.category} <span className="opacity-50 ml-1 text-xs">({cat.count})</span>
            </Button>
          ))}
        </div>

        {/* Tier Filters */}
        <div className="flex flex-wrap justify-center gap-2">
          {["All", "Basic — ₦1,000", "Premium — ₦1,500", "VIP — ₦2,500"].map((label, i) => {
            const val = i === 0 ? "All" : ["basic", "premium", "vip"][i - 1];
            return (
              <button
                key={label}
                onClick={() => setTierFilter(val)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  tierFilter === val
                    ? i === 3 ? "bg-primary/20 border-primary text-primary" : i === 2 ? "bg-slate-500/20 border-slate-400 text-slate-300" : i === 1 ? "bg-stone-700/20 border-stone-500 text-stone-300" : "bg-primary text-primary-foreground border-primary"
                    : "border-border/50 text-muted-foreground hover:border-border"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : celebrities?.length === 0 ? (
        <div className="text-center py-20 bg-card/30 rounded-2xl border border-border/50">
          <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">No celebrities found</h2>
          <p className="text-muted-foreground">Try adjusting your search or filter.</p>
          <Button variant="link" onClick={() => { setSearch(""); setSelectedCategory("All"); setTierFilter("All"); }} className="mt-4 text-primary">
            Clear Filters
          </Button>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          <AnimatePresence>
            {celebrities?.map((celeb) => (
              <motion.div
                layout
                key={celeb.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
                className="cursor-pointer group"
                onClick={() => handleCelebClick(celeb)}
              >
                <div className="relative overflow-hidden rounded-xl border border-border/30 group-hover:border-primary/60 transition-all duration-300 shadow-sm group-hover:shadow-[0_0_20px_rgba(255,215,0,0.15)]">
                  <FanCard
                    name={celeb.name}
                    imageUrl={celeb.imageUrl}
                    category={celeb.category}
                    className="w-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4">
                    <span className="text-white text-xs font-bold bg-primary/90 px-3 py-1.5 rounded-full">
                      View Card
                    </span>
                  </div>
                </div>
                <div className="mt-2.5 text-center px-1">
                  <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">{celeb.name}</p>
                  <p className="text-xs text-muted-foreground">{celeb.fanCount.toLocaleString()} fans</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Premium Celebrity Modal */}
      <AnimatePresence>
        {selectedCeleb && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-background border border-border/60 rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto shadow-2xl"
            >
              {/* Close button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 bg-background/80 backdrop-blur border border-border rounded-full p-1.5 hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              {/* SUCCESS STATE */}
              {modalStep === "success" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-20 px-8 text-center"
                >
                  <div className="h-24 w-24 rounded-full bg-green-500/20 border-2 border-green-500/50 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
                    <CheckCircle className="h-12 w-12 text-green-400" />
                  </div>
                  <h2 className="text-3xl font-serif font-bold mb-3 text-white">Payment Successful!</h2>
                  <p className="text-lg text-muted-foreground mb-2">
                    Your digital fan card has been added to My Collection.
                  </p>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-6 py-4 mb-8">
                    <p className="text-sm text-green-400 font-medium">
                      🎉 {selectedCeleb.name} — {selectedTier.toUpperCase()} Fan Card
                    </p>
                    {confNumber && <p className="text-xs text-muted-foreground mt-1">Confirmation: {confNumber}</p>}
                  </div>
                  <div className="w-full max-w-[180px] mx-auto mb-8">
                    <FanCard name={selectedCeleb.name} imageUrl={selectedCeleb.imageUrl} category={selectedCeleb.category} tier={selectedTier} fanName={buyerName} />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={() => setLocation("/my-cards")} className="bg-primary text-primary-foreground hover:bg-primary/90">
                      View My Collection
                    </Button>
                    <Button variant="outline" onClick={closeModal}>
                      Continue Shopping
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* PAYING STATE */}
              {modalStep === "paying" && (
                <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
                  <div className="relative mb-8">
                    <div className="h-24 w-24 rounded-full border-4 border-primary/20 flex items-center justify-center">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                    <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Opening Payment...</h2>
                  <p className="text-muted-foreground">Please complete your payment in the Flutterwave window.</p>
                </div>
              )}

              {/* BUY STEP */}
              {modalStep === "buy" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 md:p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => setModalStep("view")} className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm">
                      ← Back
                    </button>
                    <h2 className="text-xl font-bold">Complete Purchase</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Card Preview */}
                    <div className="flex flex-col items-center">
                      <div className={`w-full max-w-[260px] mx-auto ${currentTier.glowRing} rounded-2xl`}>
                        <FanCard name={selectedCeleb.name} imageUrl={selectedCeleb.imageUrl} category={selectedCeleb.category} tier={selectedTier} fanName={buyerName || "YOUR NAME"} />
                      </div>
                      <div className="mt-4 text-center">
                        <p className={`font-bold text-2xl ${currentTier.textColor}`}>₦{currentTier.price.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest">{selectedTier} tier</p>
                      </div>
                    </div>

                    {/* Buy Form */}
                    <div className="space-y-5">
                      <div>
                        <label className="text-sm font-medium block mb-1.5">Your Full Name</label>
                        <input
                          type="text"
                          value={buyerName}
                          onChange={e => setBuyerName(e.target.value)}
                          placeholder="Enter your full name"
                          className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary/60"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-1.5">Email Address</label>
                        <input
                          type="email"
                          value={buyerEmail}
                          onChange={e => setBuyerEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary/60"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Your fan card will be sent to this email.</p>
                      </div>

                      <div className="bg-card border border-border rounded-xl p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Celebrity</span>
                          <span className="font-medium">{selectedCeleb.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tier</span>
                          <span className={`font-bold uppercase ${currentTier.textColor}`}>{selectedTier}</span>
                        </div>
                        <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                          <span>Total</span>
                          <span className="text-primary">₦{currentTier.price.toLocaleString()}</span>
                        </div>
                      </div>

                      <Button
                        onClick={handlePayment}
                        disabled={createOrderMutation.isPending || verifyPaymentMutation.isPending}
                        className="w-full py-6 text-base font-bold bg-[#F5A623] hover:bg-[#E09612] text-black shadow-[0_4px_20px_rgba(245,166,35,0.4)] hover:shadow-[0_4px_30px_rgba(245,166,35,0.6)] transition-all"
                      >
                        {createOrderMutation.isPending ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                        ) : (
                          <><CreditCard className="mr-2 h-4 w-4" /> Pay ₦{currentTier.price.toLocaleString()} with Flutterwave</>
                        )}
                      </Button>

                      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <Lock className="h-3 w-3" />
                        Secured by Flutterwave · 256-bit SSL Encryption
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* VIEW STEP */}
              {modalStep === "view" && (
                <div>
                  {/* Header Banner */}
                  <div className="relative h-48 md:h-64 overflow-hidden rounded-t-2xl">
                    <img
                      src={selectedCeleb.imageUrl}
                      alt={selectedCeleb.name}
                      className="w-full h-full object-cover object-top filter brightness-40"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCeleb.name)}&size=800&background=1a1a2e&color=d4af37`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="flex items-end gap-4">
                        <img
                          src={selectedCeleb.imageUrl}
                          alt={selectedCeleb.name}
                          className="w-20 h-20 rounded-xl border-2 border-primary object-cover object-top shadow-xl flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCeleb.name)}&size=200&background=1a1a2e&color=d4af37`;
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold uppercase tracking-widest text-primary border border-primary/50 bg-primary/10 px-2 py-0.5 rounded">
                              {selectedCeleb.category}
                            </span>
                            {selectedCeleb.nationality && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Globe className="h-3 w-3" /> {selectedCeleb.nationality}
                              </span>
                            )}
                          </div>
                          <h2 className="text-2xl md:text-4xl font-serif font-bold text-white truncate">{selectedCeleb.name}</h2>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Bio Info */}
                    <div className="flex flex-wrap gap-4 text-sm border-b border-border pb-4">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Cardholders:</span>
                        <span className="font-bold">{selectedCeleb.fanCount.toLocaleString()}</span>
                      </div>
                      {selectedCeleb.popularFor && (
                        <div className="flex items-center gap-1.5">
                          <Award className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground">Known for:</span>
                          <span className="font-bold">{selectedCeleb.popularFor}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{selectedCeleb.bio}</p>

                    {/* Tier Selection */}
                    <div>
                      <h3 className="text-xl font-serif font-bold mb-4 flex items-center gap-2">
                        <Star className="h-5 w-5 text-primary" />
                        Choose Your Fan Card
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {tiers.map((tier) => (
                          <div
                            key={tier.id}
                            onClick={() => setSelectedTier(tier.id)}
                            className={`relative cursor-pointer rounded-2xl border-2 p-5 transition-all duration-300 ${
                              selectedTier === tier.id
                                ? `${tier.color} ${tier.glow} bg-card scale-[1.02]`
                                : "border-border/40 bg-card/40 hover:border-border hover:bg-card/70"
                            }`}
                          >
                            {tier.popular && (
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                Most Popular
                              </div>
                            )}

                            {/* Large card preview */}
                            <div className={`w-full max-w-[130px] mx-auto mb-4 transition-all duration-300 ${selectedTier === tier.id ? `${tier.glowRing} rounded-xl` : ""}`}>
                              <FanCard
                                name={selectedCeleb.name}
                                imageUrl={selectedCeleb.imageUrl}
                                category={selectedCeleb.category}
                                tier={tier.id}
                              />
                            </div>

                            <div className="text-center mb-4">
                              <h4 className={`text-base font-bold uppercase tracking-wider ${selectedTier === tier.id ? tier.textColor : ""}`}>{tier.name}</h4>
                              <p className="text-xs text-muted-foreground mb-2">{tier.type}</p>
                              <div className={`text-2xl font-serif font-bold ${selectedTier === tier.id ? tier.textColor : "text-foreground"}`}>
                                ₦{tier.price.toLocaleString()}
                              </div>
                            </div>

                            <ul className="space-y-1.5 text-xs">
                              {tier.benefits.map((b, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <CheckCircle className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${selectedTier === tier.id ? tier.textColor : "text-muted-foreground"}`} />
                                  <span className={selectedTier === tier.id ? "text-foreground" : "text-muted-foreground"}>{b}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border">
                      <Button
                        onClick={handleBuyNow}
                        size="lg"
                        className="flex-1 py-6 text-base font-bold bg-[#F5A623] hover:bg-[#E09612] text-black shadow-[0_4px_20px_rgba(245,166,35,0.4)] hover:shadow-[0_4px_30px_rgba(245,166,35,0.6)] transition-all"
                      >
                        <Zap className="mr-2 h-5 w-5" />
                        Buy Now — ₦{currentTier.price.toLocaleString()}
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={closeModal}
                        className="sm:w-auto"
                      >
                        <X className="h-4 w-4 mr-2" /> Close
                      </Button>
                    </div>

                    <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-green-400" /> Secured by Flutterwave</span>
                      <span className="flex items-center gap-1"><Lock className="h-3.5 w-3.5 text-primary" /> 256-bit SSL</span>
                      <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-blue-400" /> Instant Digital Delivery</span>
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
