import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useListCelebrities, useListCategories } from "@workspace/api-client-react";
import { FanCard } from "@/components/fan-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Filter } from "lucide-react";

export default function Browse() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Add a simple debounce
  useState(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]); // Fix for simple debounce

  const { data: categories, isLoading: isLoadingCategories } = useListCategories();
  
  const queryParams = {
    ...(selectedCategory !== "All" && { category: selectedCategory }),
    ...(debouncedSearch && { search: debouncedSearch })
  };

  const { data: celebrities, isLoading: isLoadingCelebs } = useListCelebrities(queryParams, {
    query: {
      queryKey: ['/api/celebrities', queryParams] as const
    }
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">The Directory</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover and collect official fan cards from the world's biggest icons.
        </p>
      </div>

      <div className="max-w-4xl mx-auto mb-12 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search celebrities by name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 py-6 text-lg bg-card/50 border-border/50 focus:border-primary shadow-sm"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            variant={selectedCategory === "All" ? "default" : "outline"}
            onClick={() => setSelectedCategory("All")}
            className="rounded-full"
          >
            All
          </Button>
          {!isLoadingCategories && categories?.map((cat) => (
            <Button
              key={cat.category}
              variant={selectedCategory === cat.category ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat.category)}
              className="rounded-full"
            >
              {cat.category} <span className="opacity-50 ml-1 text-xs">({cat.count})</span>
            </Button>
          ))}
        </div>
      </div>

      {isLoadingCelebs ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : celebrities?.length === 0 ? (
        <div className="text-center py-20 bg-card/30 rounded-2xl border border-border/50">
          <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">No celebrities found</h2>
          <p className="text-muted-foreground">Try adjusting your search or category filter.</p>
          <Button variant="link" onClick={() => { setSearch(""); setSelectedCategory("All"); }} className="mt-4 text-primary">
            Clear Filters
          </Button>
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
        >
          <AnimatePresence>
            {celebrities?.map((celeb, i) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={celeb.id}
              >
                <Link href={`/celebrity/${celeb.id}`}>
                  <FanCard
                    name={celeb.name}
                    imageUrl={celeb.imageUrl}
                    category={celeb.category}
                  />
                  <div className="mt-3 text-center">
                    <p className="font-bold hover:text-primary transition-colors">{celeb.name}</p>
                    <p className="text-xs text-muted-foreground">{celeb.fanCount.toLocaleString()} fans</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
