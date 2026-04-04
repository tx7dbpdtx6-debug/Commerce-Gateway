import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useListCelebrities, useListCategories } from "@workspace/api-client-react";
import { FanCard } from "@/components/fan-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, Search, Filter, X, Users, Globe, Award, CheckCircle, Star } from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

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
    price: 19.99,
    type: "Digital Only",
    color: "border-stone-500",
    glow: "",
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
    price: 49.99,
    type: "Digital + Perks",
    color: "border-slate-400",
    glow: "shadow-[0_0_20px_rgba(148,163,184,0.2)]",
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
    price: 99.99,
    type: "Digital + Physical",
    color: "border-primary",
    glow: "shadow-[0_0_25px_rgba(255,215,0,0.2)]",
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

export default function Browse() {
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedCeleb, setSelectedCeleb] = useState<Celebrity | null>(null);
  const [selectedTier, setSelectedTier] = useState<"basic" | "premium" | "vip">("premium");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

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

  const handleCelebClick = (celeb: Celebrity) => {
    setSelectedCeleb(celeb);
    setSelectedTier("premium");
  };

  const handleApply = () => {
    if (!selectedCeleb) return;
    if (!user) {
      toast({
        title: "Login required",
        description: "Please sign up or log in to purchase a fan card.",
        variant: "destructive",
      });
      setLocation("/login");
      return;
    }
    setSelectedCeleb(null);
    setLocation(`/apply/${selectedCeleb.id}/${selectedTier}`);
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
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            variant={selectedCategory === "All" ? "default" : "outline"}
            onClick={() => setSelectedCategory("All")}
            className="rounded-full"
            size="sm"
          >
            All
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
          <Button variant="link" onClick={() => { setSearch(""); setSelectedCategory("All"); }} className="mt-4 text-primary">
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

      {/* Celebrity Modal */}
      <Dialog open={!!selectedCeleb} onOpenChange={(open) => !open && setSelectedCeleb(null)}>
        <DialogContent className="max-w-5xl w-full bg-background border-border/60 p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
          {selectedCeleb && (
            <div>
              {/* Header */}
              <div className="relative h-48 md:h-64 overflow-hidden">
                <img
                  src={selectedCeleb.imageUrl}
                  alt={selectedCeleb.name}
                  className="w-full h-full object-cover object-top filter brightness-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-end gap-4">
                    <img
                      src={selectedCeleb.imageUrl}
                      alt={selectedCeleb.name}
                      className="w-20 h-20 rounded-xl border-2 border-primary object-cover object-top shadow-xl flex-shrink-0"
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
                {/* Bio */}
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
                    Choose Your Fan Card for {selectedCeleb.name}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {tiers.map((tier) => (
                      <div
                        key={tier.id}
                        onClick={() => setSelectedTier(tier.id)}
                        className={`relative cursor-pointer rounded-xl border-2 p-5 transition-all duration-300 ${
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

                        {/* Card preview */}
                        <div className="w-full max-w-[120px] mx-auto mb-4">
                          <FanCard
                            name={selectedCeleb.name}
                            imageUrl={selectedCeleb.imageUrl}
                            category={selectedCeleb.category}
                            tier={tier.id}
                          />
                        </div>

                        <div className="text-center mb-4">
                          <h4 className="text-base font-bold uppercase tracking-wider">{tier.name}</h4>
                          <p className="text-xs text-muted-foreground mb-2">{tier.type}</p>
                          <div className={`text-2xl font-serif font-bold ${selectedTier === tier.id ? "text-primary" : "text-foreground"}`}>
                            ${tier.price}
                          </div>
                        </div>

                        <ul className="space-y-1.5 text-xs">
                          {tier.benefits.map((b, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <CheckCircle className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${selectedTier === tier.id ? "text-primary" : "text-muted-foreground"}`} />
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
                    onClick={handleApply}
                    size="lg"
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 text-base py-6 shadow-[0_0_20px_rgba(255,215,0,0.25)] hover:shadow-[0_0_30px_rgba(255,215,0,0.4)] transition-all"
                  >
                    Apply for {selectedCeleb.name} — ${tiers.find(t => t.id === selectedTier)?.price}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setSelectedCeleb(null)}
                    className="sm:w-auto"
                  >
                    <X className="h-4 w-4 mr-2" /> Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
