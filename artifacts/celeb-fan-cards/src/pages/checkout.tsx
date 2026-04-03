import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useGetOrder, useInitializePayment } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, ShieldCheck, CreditCard } from "lucide-react";
import { FanCard } from "@/components/fan-card";

export default function Checkout({ params }: { params: { orderId: string } }) {
  const orderId = parseInt(params.orderId);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: order, isLoading } = useGetOrder(orderId, {
    query: { enabled: !!orderId, queryKey: ['/api/orders', orderId] as const }
  });

  const initializePaymentMutation = useInitializePayment();

  const handlePayment = () => {
    if (!order) return;

    // Generate redirect URL based on current environment
    const currentOrigin = window.location.origin;
    const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
    const redirectUrl = `${currentOrigin}${basePath}/success?orderId=${order.id}`;

    initializePaymentMutation.mutate(
      {
        data: {
          orderId: order.id,
          amount: order.price,
          currency: "USD",
          email: order.email,
          fullName: order.fullName,
          phone: order.phone,
          redirectUrl,
        }
      },
      {
        onSuccess: (data) => {
          // Redirect to Flutterwave
          window.location.href = data.paymentLink;
        },
        onError: (err) => {
          toast({
            title: "Payment initialization failed",
            description: err.error || "Could not connect to payment gateway.",
            variant: "destructive"
          });
        }
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

  if (!order) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Order not found</h2>
        <Button className="mt-4" onClick={() => setLocation("/browse")}>Back to Browse</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-serif font-bold mb-2">Complete Your Payment</h1>
        <p className="text-muted-foreground flex items-center justify-center gap-2">
          <Lock className="h-4 w-4" /> Secure SSL Encrypted Checkout
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Order Summary */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card border border-border p-6 rounded-xl shadow-lg space-y-6"
        >
          <h2 className="font-bold text-lg border-b border-border pb-4">Order Summary</h2>
          
          <div className="flex items-center gap-4 py-4">
            <div className="w-20">
              <FanCard 
                name={order.celebName}
                tier={order.cardType as any}
                className="w-full"
              />
            </div>
            <div>
              <h3 className="font-bold text-lg">{order.celebName}</h3>
              <p className="text-sm text-muted-foreground uppercase tracking-wider">{order.cardType} Fan Card</p>
            </div>
          </div>

          <div className="space-y-3 text-sm border-t border-border pt-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order ID</span>
              <span className="font-mono">{order.id.toString().padStart(6, '0')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account</span>
              <span>{order.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${order.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-4 border-t border-border">
              <span>Total Due</span>
              <span className="text-primary">${order.price.toFixed(2)}</span>
            </div>
          </div>
        </motion.div>

        {/* Payment Action */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="bg-card border border-border p-6 rounded-xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="h-6 w-6 text-muted-foreground" />
              <h2 className="font-bold text-lg">Payment Method</h2>
            </div>
            
            <Button
              onClick={handlePayment}
              disabled={initializePaymentMutation.isPending}
              className="w-full py-8 text-lg bg-[#F5A623] hover:bg-[#E09612] text-black font-bold shadow-[0_4px_14px_rgba(245,166,35,0.39)] transition-transform active:scale-95"
            >
              {initializePaymentMutation.isPending ? (
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              ) : (
                <>
                  Pay ${order.price.toFixed(2)} with <span className="ml-2 font-black tracking-tight">Flutterwave</span>
                </>
              )}
            </Button>
            
            <div className="mt-6 flex flex-col items-center gap-3 opacity-60">
              <ShieldCheck className="h-8 w-8" />
              <p className="text-xs text-center">
                Payments are processed securely by Flutterwave.<br />
                We do not store your credit card information.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
