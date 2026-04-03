import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useGetCelebrity } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { FanCard } from "@/components/fan-card";
import { Loader2, ArrowLeft, Users, Globe, Award, CheckCircle } from "lucide-react";

export default function CelebrityDetail({ params }: { params: { id: string } }) {
  const celebId = parseInt(params.id);
  const [, setLocation] = useLocation();
  const [selectedTier, setSelectedTier] = useState<"basic" | "premium" | "vip">("premium");

  const { data: celebrity, isLoading } = useGetCelebrity(celebId, {
    query: { enabled: !!celebId, queryKey: ['/api/celebrities', celebId] as const }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!celebrity) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Celebrity not found</h2>
        <Button className="mt-4" onClick={() => setLocation("/browse")}>Back to Browse</Button>
      </div>
    );
  }

  const tiers = [
    {
      id: "basic",
      name: "Basic",
      price: 19.99,
      type: "Digital Only",
      color: "border-stone-600 bg-stone-900/50",
      benefits: [
        "Official Digital Fan Card",
        "Unique Serial Number",
        "Verified Ownership",
        "Access to basic fan forums"
      ]
    },
    {
      id: "premium",
      name: "Premium",
      price: 49.99,
      type: "Digital + Perks",
      color: "border-slate-400 bg-slate-900/50 shadow-[0_0_15px_rgba(148,163,184,0.1)]",
      popular: true,
      benefits: [
        "Everything in Basic",
        "Animated Holographic Digital Effect",
        "Priority event access",
        "Exclusive monthly digital content",
        "Premium profile badge"
      ]
    },
    {
      id: "vip",
      name: "VIP",
      price: 99.99,
      type: "Digital + Physical",
      color: "border-primary bg-primary/5 shadow-[0_0_20px_rgba(255,215,0,0.15)]",
      benefits: [
        "Everything in Premium",
        "Physical Gold-Plated Metal Card",
        "Direct shipping to your door",
        "Personalized message inclusion",
        "Annual virtual meet & greet entry",
        "Exclusive merchandise discounts"
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => setLocation("/browse")} className="mb-6 -ml-4 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Directory
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
        {/* Left Column - Card Preview */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-[320px] mx-auto w-full"
          >
            <FanCard 
              name={celebrity.name}
              imageUrl={celebrity.imageUrl}
              category={celebrity.category}
              tier={selectedTier}
              className="shadow-2xl"
            />
            <p className="text-center text-sm text-muted-foreground mt-6 flex items-center justify-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              Live Preview
            </p>
          </motion.div>
        </div>

        {/* Right Column - Details & Purchasing */}
        <div className="lg:col-span-8 space-y-12">
          {/* Bio Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-primary border border-primary/50 bg-primary/10 px-2 py-1 rounded">
                  {celebrity.category}
                </span>
                {celebrity.nationality && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Globe className="h-3 w-3" /> {celebrity.nationality}
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-4">
                {celebrity.name}
              </h1>
              
              <div className="flex flex-wrap gap-4 text-sm border-y border-border py-4 my-6">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Cardholders:</span>
                  <span className="font-bold">{celebrity.fanCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Known for:</span>
                  <span className="font-bold">{celebrity.popularFor || celebrity.category}</span>
                </div>
              </div>

              <p className="text-lg text-muted-foreground leading-relaxed">
                {celebrity.bio}
              </p>
            </div>
          </motion.div>

          {/* Tiers Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-serif font-bold border-b border-border pb-2">Select Your Tier</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tiers.map((tier) => (
                <div 
                  key={tier.id}
                  onClick={() => setSelectedTier(tier.id as any)}
                  className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-300 ${tier.color} ${selectedTier === tier.id ? 'scale-105 z-10 bg-card/80 backdrop-blur-md' : 'opacity-70 hover:opacity-100 hover:bg-card/50'}`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold uppercase tracking-wider">{tier.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{tier.type}</p>
                    <div className="text-3xl font-serif font-bold text-foreground">
                      ${tier.price}
                    </div>
                  </div>
                  
                  <ul className="space-y-3 mb-8 text-sm">
                    {tier.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className={`h-4 w-4 mt-0.5 shrink-0 ${selectedTier === tier.id ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className={selectedTier === tier.id ? 'text-foreground' : 'text-muted-foreground'}>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${selectedTier === tier.id ? 'bg-primary text-primary-foreground' : 'bg-transparent border border-current text-current hover:bg-current/10'}`}
                    variant={selectedTier === tier.id ? 'default' : 'outline'}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation(`/apply/${celebId}/${tier.id}`);
                    }}
                  >
                    {selectedTier === tier.id ? 'Apply Now' : 'Select'}
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
