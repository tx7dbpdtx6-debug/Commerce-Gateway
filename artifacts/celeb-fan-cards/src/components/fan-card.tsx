import { motion } from "framer-motion";

interface FanCardProps {
  name: string;
  imageUrl?: string | null;
  category?: string;
  tier?: "basic" | "premium" | "vip";
  fanName?: string;
  cardNumber?: string;
  className?: string;
}

export function FanCard({ name, imageUrl, category, tier = "basic", fanName, cardNumber, className = "" }: FanCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const getTierColors = (tier: string) => {
    switch (tier) {
      case "vip":
        return "from-primary/80 to-yellow-600/80 border-primary shadow-[0_0_20px_rgba(255,215,0,0.4)]";
      case "premium":
        return "from-slate-400/80 to-slate-600/80 border-slate-400 shadow-[0_0_15px_rgba(148,163,184,0.3)]";
      default:
        return "from-stone-700/80 to-stone-900/80 border-stone-600 shadow-[0_0_10px_rgba(87,83,78,0.3)]";
    }
  };

  const actualImageUrl = imageUrl || `https://picsum.photos/seed/celeb-${name.replace(/\s+/g, '')}/400/500`;

  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.02 }}
      className={`relative w-full aspect-[2.5/3.5] rounded-xl overflow-hidden cursor-pointer group ${className}`}
      style={{ perspective: "1000px" }}
    >
      {/* Base Card */}
      <div className={`absolute inset-0 bg-gradient-to-b ${getTierColors(tier)} border-2 rounded-xl transition-all duration-300 group-hover:shadow-2xl z-0`}></div>
      
      {/* Holographic overlay */}
      <div className="absolute inset-0 holographic-effect opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl z-20 pointer-events-none mix-blend-screen"></div>

      {/* Image */}
      <div className="absolute inset-1 top-1 bottom-[35%] rounded-t-lg rounded-b-sm overflow-hidden z-10 bg-background/50">
        <img
          src={actualImageUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 filter contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
        {category && (
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-xs font-bold px-2 py-1 rounded border border-white/10 uppercase tracking-wider text-white">
            {category}
          </div>
        )}
      </div>

      {/* Content Bottom */}
      <div className="absolute bottom-0 inset-x-0 h-[35%] p-4 flex flex-col justify-between z-10">
        <div>
          <h3 className="font-serif text-xl font-bold leading-tight text-white line-clamp-1">{name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase tracking-widest ${
              tier === 'vip' ? 'bg-primary/20 border-primary/50 text-primary' :
              tier === 'premium' ? 'bg-slate-500/20 border-slate-500/50 text-slate-300' :
              'bg-stone-500/20 border-stone-500/50 text-stone-300'
            }`}>
              {tier}
            </span>
            {fanName && (
              <span className="text-xs text-white/70 truncate">Owner: {fanName}</span>
            )}
          </div>
        </div>
        
        {cardNumber && (
          <div className="font-mono text-[10px] text-white/50 flex justify-between items-end">
            <span>NO. {cardNumber}</span>
            <span className="uppercase text-[8px] tracking-[0.2em] opacity-50">Official</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
