import { Link } from "wouter";
import { motion } from "framer-motion";
import { useGetStatsSummary, useGetPopularCelebrities } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { FanCard } from "@/components/fan-card";
import { Star, ShieldCheck, Users, Zap, Award, ChevronRight, Shield, Package, RotateCcw, Bolt } from "lucide-react";
import heroBg from "@/assets/hero-bg.png";

export default function Home() {
  const { data: stats } = useGetStatsSummary();
  const { data: popularCelebs } = useGetPopularCelebrities();

  const testimonials = [
    {
      name: "Sarah J.",
      handle: "@sarah_fanz",
      content: "Got my VIP physical card for Taylor Swift. The holographic finish is insane! It feels so premium — exactly like a real trading card.",
      image: "https://picsum.photos/seed/fan1/100/100"
    },
    {
      name: "Mike T.",
      handle: "@mike_t_sports",
      content: "Bought a Premium card for Cristiano Ronaldo. Owning an official digital card of my idol is a dream come true. Highly recommend.",
      image: "https://picsum.photos/seed/fan2/100/100"
    },
    {
      name: "Elena R.",
      handle: "@elena_reads",
      content: "The digital card shimmer effect looks exactly like a real trading card. Got mine for Zendaya and she loved when I showed her on Instagram!",
      image: "https://picsum.photos/seed/fan3/100/100"
    },
    {
      name: "James K.",
      handle: "@james_drakefan",
      content: "I ordered a VIP card for Drake and the physical metal card arrived in perfect condition. The neon design is absolutely fire 🔥",
      image: "https://picsum.photos/seed/fan4/100/100"
    },
    {
      name: "Priya M.",
      handle: "@priya_swiftie",
      content: "Best fan gift I've ever bought! The Basic card for Beyoncé came with all the digital perks. Already ordered my second one for Ariana Grande.",
      image: "https://picsum.photos/seed/fan5/100/100"
    },
    {
      name: "Carlos D.",
      handle: "@carlosd_ultras",
      content: "Messi fan for life. I got the VIP card and the personalized shoutout was worth every penny. This platform is next level.",
      image: "https://picsum.photos/seed/fan6/100/100"
    },
    {
      name: "Aisha B.",
      handle: "@aisha_riri",
      content: "Ordered a Premium Rihanna card as a birthday gift for my sister. She literally screamed when she saw it. 10/10 would order again.",
      image: "https://picsum.photos/seed/fan7/100/100"
    },
    {
      name: "Tyler W.",
      handle: "@tylerwatches",
      content: "Smooth checkout, card arrived in my email instantly. The fan card design for Tom Holland is stunning. Marvel fans need this!",
      image: "https://picsum.photos/seed/fan8/100/100"
    }
  ];

  const steps = [
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "Find Your Idol",
      description: "Browse our exclusive roster of 50+ top actors, musicians, and athletes from around the world."
    },
    {
      icon: <Award className="h-6 w-6 text-primary" />,
      title: "Choose Your Tier",
      description: "Select from Basic, Premium, or VIP fan card packages with exclusive perks for each level."
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-primary" />,
      title: "Own the Experience",
      description: "Get your personalized digital card instantly, sent to your email with a beautiful design."
    }
  ];

  const trustBadges = [
    { icon: <Shield className="h-5 w-5" />, label: "Secured by Flutterwave" },
    { icon: <Bolt className="h-5 w-5" />, label: "256-bit SSL Encryption" },
    { icon: <RotateCcw className="h-5 w-5" />, label: "Satisfaction Guarantee" },
    { icon: <Package className="h-5 w-5" />, label: "Instant Digital Delivery" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-20">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBg} 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-30 filter contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,215,0,0.1)_0%,rgba(0,0,0,0)_50%)]"></div>
        </div>

        {/* Floating Particles/Stars */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-1 h-1 bg-primary rounded-full animate-pulse-slow"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: Math.random() * 0.5 + 0.3
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
              <Star className="h-4 w-4" /> Official Fan Memberships
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white leading-tight">
              Collect Rare Digital Cards of Your <span className="text-gradient-gold">Favorite Celebrities</span>
            </h1>
            <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Exclusive digital and physical fan cards for the world's biggest celebrities. Your VIP pass starts here.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Link href="/browse">
                <Button size="lg" className="text-lg px-8 py-6 w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] transition-all">
                  Shop Now <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/support">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 w-full sm:w-auto border-border bg-background/50 backdrop-blur hover:bg-muted/50">
                  How it Works
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-y border-border/50 bg-card/30 py-5">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
            {trustBadges.map((badge, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <span className="text-primary">{badge.icon}</span>
                <span>{badge.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      {stats && (
        <section className="border-b border-border/50 bg-card/50 backdrop-blur-sm py-8 relative z-10">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-border/50">
              <div className="px-4">
                <p className="text-3xl md:text-4xl font-serif font-bold text-primary mb-1">{stats.totalCelebrities}+</p>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">Top Celebrities</p>
              </div>
              <div className="px-4">
                <p className="text-3xl md:text-4xl font-serif font-bold text-primary mb-1">{stats.totalFans.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">Active Fans</p>
              </div>
              <div className="px-4">
                <p className="text-3xl md:text-4xl font-serif font-bold text-primary mb-1">{(stats.totalOrders / 1000).toFixed(1)}k+</p>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">Cards Minted</p>
              </div>
              <div className="px-4">
                <p className="text-3xl md:text-4xl font-serif font-bold text-primary mb-1">100%</p>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">Authentic</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Celebrities */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Trending Now</h2>
              <p className="text-muted-foreground text-lg">The most sought-after fan cards this week.</p>
            </div>
            <Link href="/browse" className="hidden md:flex items-center text-primary hover:underline font-medium">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {popularCelebs?.map((celeb, i) => (
              <motion.div
                key={celeb.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/celebrity/${celeb.id}`}>
                  <FanCard
                    name={celeb.name}
                    imageUrl={celeb.imageUrl}
                    category={celeb.category}
                    tier="premium"
                  />
                  <div className="mt-4 text-center">
                    <p className="text-lg font-bold hover:text-primary transition-colors">{celeb.name}</p>
                    <p className="text-sm text-muted-foreground">{celeb.category}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-card relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/50 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Your VIP Journey</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Three simple steps to join the most exclusive fan club on the planet.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="bg-background border border-border p-8 rounded-2xl text-center hover:border-primary/50 transition-colors group"
              >
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">From the Fans</h2>
            <p className="text-muted-foreground text-lg">What our VIP members are saying.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-card border border-border p-6 rounded-2xl relative"
              >
                <div className="absolute top-4 right-4 opacity-20">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full object-cover border-2 border-primary/20" />
                  <div>
                    <p className="font-bold text-sm">{t.name}</p>
                    <p className="text-xs text-primary">{t.handle}</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, s) => <Star key={s} className="h-3 w-3 text-primary fill-primary" />)}
                </div>
                <p className="text-muted-foreground italic leading-relaxed text-sm">"{t.content}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.1)_0%,rgba(0,0,0,0)_70%)]" />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Ready to Step Behind the Velvet Rope?</h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of superfans who already own their exclusive piece of celebrity history.
          </p>
          <Link href="/browse">
            <Button size="lg" className="text-lg px-10 py-8 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_30px_rgba(255,215,0,0.3)] hover:shadow-[0_0_40px_rgba(255,215,0,0.5)] transition-all">
              Start Your Collection
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
