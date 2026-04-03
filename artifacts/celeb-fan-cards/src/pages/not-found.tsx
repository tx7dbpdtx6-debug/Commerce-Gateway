import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="relative z-10 space-y-6 max-w-md">
        <div className="flex justify-center">
          <Star className="h-16 w-16 text-primary animate-pulse" />
        </div>
        <h1 className="text-8xl font-serif font-bold text-foreground">404</h1>
        <h2 className="text-2xl font-bold">Lost Behind the Velvet Rope</h2>
        <p className="text-muted-foreground">
          The VIP area you're looking for doesn't exist or has been moved. Let's get you back to the main event.
        </p>
        <Link href="/">
          <Button size="lg" className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
            Return to Directory
          </Button>
        </Link>
      </div>
    </div>
  );
}
