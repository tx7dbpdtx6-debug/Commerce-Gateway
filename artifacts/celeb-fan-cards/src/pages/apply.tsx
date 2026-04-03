import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuthStore } from "@/lib/auth";
import { useCreateOrder, useGetCelebrity, CreateOrderBodyCardType } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FanCard } from "@/components/fan-card";
import { Loader2, ArrowLeft, ShieldCheck } from "lucide-react";

export default function Apply({ params }: { params: { celebId: string; cardType: string } }) {
  const celebId = parseInt(params.celebId);
  const cardType = params.cardType as CreateOrderBodyCardType;
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const { data: celebrity, isLoading } = useGetCelebrity(celebId, {
    query: { enabled: !!celebId, queryKey: ['/api/celebrities', celebId] as const }
  });

  const createOrderMutation = useCreateOrder();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    username: user?.username || "",
    phone: "",
    shippingAddress: "",
    specialMessage: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const getPrice = () => {
    if (cardType === "basic") return 19.99;
    if (cardType === "premium") return 49.99;
    return 99.99;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in or sign up to purchase a fan card.",
        variant: "destructive"
      });
      setLocation(`/login`);
      return;
    }

    createOrderMutation.mutate(
      {
        data: {
          celebId,
          cardType,
          ...formData,
        },
      },
      {
        onSuccess: (order) => {
          setLocation(`/checkout/${order.id}`);
        },
        onError: (err) => {
          toast({
            title: "Application failed",
            description: err.error || "Failed to create order.",
            variant: "destructive",
          });
        },
      }
    );
  };

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

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => setLocation(`/celebrity/${celebId}`)} className="mb-6 -ml-4 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to {celebrity.name}
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">Application Form</h1>
            <p className="text-muted-foreground">Complete your application for the {cardType.toUpperCase()} Tier Fan Card.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border p-6 md:p-8 rounded-xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  placeholder="As it will appear on your card"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username/Handle</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="bg-background"
                />
              </div>
            </div>

            {cardType === "vip" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-2 pt-4">
                <Label htmlFor="shippingAddress">Shipping Address (For Physical Card)</Label>
                <Textarea
                  id="shippingAddress"
                  name="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full shipping address..."
                  className="bg-background resize-none h-24"
                />
              </motion.div>
            )}

            <div className="space-y-2 pt-4 border-t border-border">
              <Label htmlFor="specialMessage">Special Message or Request (Optional)</Label>
              <Textarea
                id="specialMessage"
                name="specialMessage"
                value={formData.specialMessage}
                onChange={handleChange}
                placeholder="Include a message to the celebrity or a special request..."
                className="bg-background resize-none h-24"
              />
              <p className="text-xs text-muted-foreground mt-1">For VIP cards, this message may be included in your physical package.</p>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 text-lg py-6"
              disabled={createOrderMutation.isPending}
            >
              {createOrderMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                "Proceed to Payment"
              )}
            </Button>
            
            <div className="flex items-center justify-center text-xs text-muted-foreground gap-2 mt-4">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              Secure 256-bit encryption. Your data is protected.
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <h3 className="font-serif text-xl font-bold border-b border-border pb-2">Order Summary</h3>
            
            <div className="w-full max-w-[280px] mx-auto">
              <FanCard 
                name={celebrity.name}
                category={celebrity.category}
                tier={cardType}
                fanName={formData.fullName || "YOUR NAME"}
                className="shadow-2xl"
              />
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Celebrity</span>
                <span className="font-medium text-right">{celebrity.name}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Card Tier</span>
                <span className="font-medium uppercase text-primary tracking-wider">{cardType}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-border/50 pb-4">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">{cardType === 'vip' ? 'Digital + Physical' : 'Digital Only'}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-lg pt-2">
                <span>Total</span>
                <span>${getPrice()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
