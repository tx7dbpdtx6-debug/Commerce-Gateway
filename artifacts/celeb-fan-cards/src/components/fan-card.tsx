import { useState } from "react";
import { motion } from "framer-motion";

interface FanCardProps {
  name: string;
  imageUrl?: string | null;
  category?: string;
  tier?: "basic" | "premium" | "vip";
  fanName?: string;
  cardNumber?: string;
  price?: number;
  showPrice?: boolean;
  size?: "small" | "large";
  className?: string;
}

const TIER_CONFIG = {
  vip: {
    label: "VIP",
    price: 2500,
    gradient: "from-[#8B6914] via-[#D4AF37] to-[#8B6914]",
    cardBg: "from-[#1a0f00] via-[#2d1f00] to-[#0d0800]",
    border: "border-[#D4AF37]",
    glow: "shadow-[0_0_40px_rgba(212,175,55,0.6),0_0_80px_rgba(212,175,55,0.3)]",
    badgeBg: "bg-gradient-to-r from-[#8B6914] to-[#D4AF37]",
    badgeText: "text-black",
    shineColor: "rgba(212,175,55,0.15)",
    priceColor: "text-[#D4AF37]",
    accent: "#D4AF37",
  },
  premium: {
    label: "PREMIUM",
    price: 1500,
    gradient: "from-slate-600 via-slate-400 to-slate-600",
    cardBg: "from-[#0f1523] via-[#1a2035] to-[#080d18]",
    border: "border-slate-400",
    glow: "shadow-[0_0_30px_rgba(148,163,184,0.5),0_0_60px_rgba(148,163,184,0.2)]",
    badgeBg: "bg-gradient-to-r from-slate-500 to-slate-300",
    badgeText: "text-black",
    shineColor: "rgba(148,163,184,0.12)",
    priceColor: "text-slate-300",
    accent: "#94A3B8",
  },
  basic: {
    label: "BASIC",
    price: 1000,
    gradient: "from-stone-700 via-stone-500 to-stone-700",
    cardBg: "from-[#1a1510] via-[#2a201a] to-[#0d0a07]",
    border: "border-stone-500",
    glow: "shadow-[0_0_20px_rgba(120,113,108,0.4)]",
    badgeBg: "bg-gradient-to-r from-stone-600 to-stone-400",
    badgeText: "text-white",
    shineColor: "rgba(120,113,108,0.1)",
    priceColor: "text-stone-300",
    accent: "#78716C",
  },
};

export function FanCard({ name, imageUrl, category, tier = "basic", fanName, cardNumber, price, showPrice, size = "small", className = "" }: FanCardProps) {
  const [imgError, setImgError] = useState(false);
  const config = TIER_CONFIG[tier];
  const displayPrice = price ?? config.price;
  const shouldShowPrice = showPrice ?? (size === "large");

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();

  const actualImageUrl = (!imgError && imageUrl)
    ? imageUrl
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=400&background=1a1a2e&color=d4af37&font-size=0.4&bold=true&format=svg`;

  if (size === "large") {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        className={`relative w-full rounded-2xl overflow-hidden cursor-pointer group ${config.border} border-2 ${config.glow} ${className}`}
        style={{ aspectRatio: "2.5/3.5", perspective: "1000px" }}
      >
        {/* Card background */}
        <div className={`absolute inset-0 bg-gradient-to-b ${config.cardBg}`} />

        {/* Shine overlay (always partially visible on large) */}
        <div
          className="absolute inset-0 opacity-40 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none z-20"
          style={{
            background: `linear-gradient(135deg, transparent 30%, ${config.shineColor} 50%, transparent 70%)`,
            backgroundSize: "200% 200%",
          }}
        />

        {/* Holographic shimmer */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 pointer-events-none rounded-2xl holographic-effect mix-blend-screen" />

        {/* Top bar: tier badge + serial */}
        <div className="absolute top-0 inset-x-0 p-3 flex items-center justify-between z-30">
          <div className={`${config.badgeBg} ${config.badgeText} text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-[0.15em] shadow-lg`}>
            {config.label}
          </div>
          <div className="text-[9px] font-mono opacity-50 text-white tracking-widest">
            #{cardNumber || Math.floor(Math.random() * 9999).toString().padStart(4, "0")}
          </div>
        </div>

        {/* Celebrity image — takes up ~65% of card */}
        <div className="absolute inset-x-0 top-0 bottom-[32%] z-10 overflow-hidden">
          <img
            src={actualImageUrl}
            alt={name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/10 to-transparent" />
          {/* Decorative side lines */}
          <div className="absolute inset-y-0 left-0 w-0.5 opacity-30" style={{ background: `linear-gradient(to bottom, transparent, ${config.accent}, transparent)` }} />
          <div className="absolute inset-y-0 right-0 w-0.5 opacity-30" style={{ background: `linear-gradient(to bottom, transparent, ${config.accent}, transparent)` }} />
        </div>

        {/* Bottom info panel */}
        <div className="absolute bottom-0 inset-x-0 h-[32%] z-20 flex flex-col justify-between p-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {category && (
                <span className="text-[9px] uppercase tracking-widest opacity-60 text-white font-medium">{category}</span>
              )}
            </div>
            <h3 className="font-serif font-black text-white leading-tight line-clamp-1" style={{ fontSize: "clamp(14px, 2.5vw, 22px)" }}>
              {name}
            </h3>
            {fanName && (
              <p className="text-[10px] text-white/50 mt-0.5 truncate">Owner: {fanName}</p>
            )}
          </div>

          <div className="flex items-center justify-between border-t pt-2" style={{ borderColor: `${config.accent}30` }}>
            {shouldShowPrice && (
              <div>
                <p className="text-[9px] uppercase tracking-widest text-white/40 leading-none mb-0.5">Price</p>
                <p className={`font-serif font-black ${config.priceColor}`} style={{ fontSize: "clamp(16px, 2.8vw, 26px)" }}>
                  ${displayPrice.toLocaleString()}
                </p>
              </div>
            )}
            <div className="ml-auto text-right">
              <p className="text-[8px] uppercase tracking-[0.2em] text-white/30 leading-none">Official</p>
              <p className="text-[8px] uppercase tracking-[0.2em] text-white/30">Fan Card</p>
            </div>
          </div>
        </div>

        {/* Corner decorations */}
        <div className="absolute top-10 left-0 right-0 z-10 pointer-events-none opacity-20">
          <div className="h-px mx-4" style={{ background: `linear-gradient(to right, transparent, ${config.accent}, transparent)` }} />
        </div>
      </motion.div>
    );
  }

  // Small variant (grid cards)
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      className={`relative w-full aspect-[2.5/3.5] rounded-xl overflow-hidden cursor-pointer group ${config.border} border-2 transition-all duration-300 ${className}`}
      style={{ perspective: "1000px" }}
    >
      <div className={`absolute inset-0 bg-gradient-to-b ${config.cardBg}`} />
      <div className="absolute inset-0 holographic-effect opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl z-20 pointer-events-none mix-blend-screen" />

      <div className="absolute inset-x-0 top-0 bottom-[33%] z-10 overflow-hidden">
        <img
          src={actualImageUrl}
          alt={name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110 filter contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        {category && (
          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-[9px] font-bold px-1.5 py-0.5 rounded border border-white/10 uppercase tracking-wider text-white">
            {category}
          </div>
        )}
      </div>

      <div className="absolute bottom-0 inset-x-0 h-[33%] p-3 flex flex-col justify-between z-10">
        <div>
          <h3 className="font-serif text-sm font-bold leading-tight text-white line-clamp-1">{name}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`${config.badgeBg} ${config.badgeText} text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest`}>
              {config.label}
            </span>
          </div>
        </div>
        <div className={`font-serif font-bold text-sm ${config.priceColor}`}>
          ${displayPrice.toLocaleString()}
        </div>
      </div>
    </motion.div>
  );
}
