import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useGetOrder, useVerifyPayment } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, ShieldCheck, CreditCard, CheckCircle } from "lucide-react";
import { FanCard } from "@/components/fan-card";

const FLW_PUBLIC_KEY = "FLWPUBK-f59cf45ba615d95cda5b1fae895c2a0a-X";

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
      callback: (data: { transaction_id: string; tx_ref: string; status: string }) => void;
      onclose: () => void;
    }) => void;
  }
}

function generateTxRef(): string {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `FCH-${Date.now()}-${rand}`;
}

export default function Checkout({ params }: { params: { orderId: string } }) {
  const orderId = parseInt(params.orderId);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentClosed, setPaymentClosed] = useState(false);
  const txRefRef = useRef<string>(generateTxRef());

  const { data: order, isLoading } = useGetOrder(orderId, {
    query: { enabled: !!orderId, queryKey: ["/api/orders", orderId] as const },
  });

  const verifyPaymentMutation = useVerifyPayment();

  // Load Flutterwave inline script
  useEffect(() => {
    if (document.getElementById("flutterwave-script")) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "flutterwave-script";
    script.src = "https://checkout.flutterwave.com/v3.js";
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      // Fallback: still mark loaded for simulation mode
      setScriptLoaded(true);
    };
    document.head.appendChild(script);
    return () => {};
  }, []);

  const handleVerify = (transactionId: string) => {
    setIsProcessing(true);
    verifyPaymentMutation.mutate(
      { data: { transactionId, orderId } },
      {
        onSuccess: (data) => {
          if (data.status === "paid") {
            setLocation(`/success?orderId=${orderId}&conf=${data.confirmationNumber}`);
          } else {
            toast({
              title: "Payment not confirmed",
              description: "Your payment could not be verified. Please contact support.",
              variant: "destructive",
            });
            setIsProcessing(false);
          }
        },
        onError: () => {
          toast({
            title: "Verification failed",
            description: "Could not verify payment. Please WhatsApp us: +1 (773) 280-1545",
            variant: "destructive",
          });
          setIsProcessing(false);
        },
      }
    );
  };

  const handlePayNow = () => {
    if (!order) return;

    if (!window.FlutterwaveCheckout) {
      // Fallback simulation mode (no internet / script blocked)
      toast({ title: "Processing payment...", description: "Simulating payment in test mode." });
      setTimeout(() => {
        handleVerify(`simulated_${txRefRef.current}`);
      }, 1500);
      return;
    }

    window.FlutterwaveCheckout({
      public_key: FLW_PUBLIC_KEY,
      tx_ref: txRefRef.current,
      amount: order.price,
      currency: "NGN",
      payment_options: "card,ussd,banktransfer",
      customer: {
        email: order.email,
        name: order.fullName,
        phone_number: order.phone || "",
      },
      customizations: {
        title: "CelebFanCards",
        description: `${order.celebName} — ${order.cardType.toUpperCase()} Fan Card`,
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Brad_Pitt_2019_by_Glenn_Francis.jpg/100px-Brad_Pitt_2019_by_Glenn_Francis.jpg",
      },
      callback: (data) => {
        if (data.status === "successful" || data.status === "completed") {
          handleVerify(String(data.transaction_id));
        } else {
          toast({
            title: "Payment cancelled",
            description: "Your payment was not completed.",
            variant: "destructive",
          });
        }
      },
      onclose: () => {
        setPaymentClosed(true);
      },
    });
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

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-4 border-primary/20 flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Verifying Payment</h2>
          <p className="text-muted-foreground">Confirming your transaction with Flutterwave...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-serif font-bold mb-2">Complete Your Purchase</h1>
        <p className="text-muted-foreground flex items-center justify-center gap-2">
          <Lock className="h-4 w-4" /> Secured by Flutterwave · 256-bit SSL Encryption
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card border border-border p-6 rounded-2xl shadow-lg space-y-6"
        >
          <h2 className="font-bold text-lg border-b border-border pb-4">Order Summary</h2>

          <div className="w-full max-w-[200px] mx-auto">
            <FanCard
              name={order.celebName}
              tier={order.cardType as any}
              className="w-full shadow-2xl"
            />
          </div>

          <div className="text-center">
            <h3 className="font-bold text-xl">{order.celebName}</h3>
            <p className="text-sm text-muted-foreground uppercase tracking-wider mt-1">
              {order.cardType} Fan Card
            </p>
          </div>

          <div className="space-y-3 text-sm border-t border-border pt-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order ID</span>
              <span className="font-mono text-xs">{order.id.toString().padStart(6, "0")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Recipient</span>
              <span className="font-medium truncate max-w-[160px] text-right">{order.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="text-xs truncate max-w-[160px] text-right">{order.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span>{order.cardType === "vip" ? "Digital + Physical" : "Digital Only"}</span>
            </div>
            <div className="flex justify-between font-bold text-xl pt-4 border-t border-border">
              <span>Total Due</span>
              <span className="text-primary">${order.price.toFixed(2)}</span>
            </div>
          </div>
        </motion.div>

        {/* Payment Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="bg-card border border-border p-6 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="h-6 w-6 text-muted-foreground" />
              <h2 className="font-bold text-lg">Secure Payment</h2>
            </div>

            {paymentClosed && (
              <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm text-yellow-400">
                Payment window was closed. Click below to try again.
              </div>
            )}

            <Button
              onClick={handlePayNow}
              disabled={!scriptLoaded || isProcessing}
              className="w-full py-8 text-lg bg-[#F5A623] hover:bg-[#E09612] text-black font-bold shadow-[0_4px_20px_rgba(245,166,35,0.4)] hover:shadow-[0_4px_30px_rgba(245,166,35,0.6)] transition-all active:scale-95"
            >
              {!scriptLoaded ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading payment...</>
              ) : (
                <>
                  <CreditCard className="mr-2 h-5 w-5" />
                  Pay ${order.price.toFixed(2)} with Flutterwave
                </>
              )}
            </Button>

            <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
              {[
                { icon: <ShieldCheck className="h-4 w-4 text-green-400" />, text: "256-bit SSL secure" },
                { icon: <CheckCircle className="h-4 w-4 text-blue-400" />, text: "Instant confirmation" },
                { icon: <Lock className="h-4 w-4 text-primary" />, text: "No card data stored" },
                { icon: <CreditCard className="h-4 w-4 text-purple-400" />, text: "All cards accepted" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  {item.icon} <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border p-5 rounded-2xl text-sm text-muted-foreground space-y-2">
            <p className="font-medium text-foreground">After payment you'll receive:</p>
            <ul className="space-y-1">
              <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-primary flex-shrink-0" /> Your fan card emailed instantly</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-primary flex-shrink-0" /> Digital card in your dashboard</li>
              {order.cardType === "vip" && (
                <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-primary flex-shrink-0" /> Physical card shipped to your address</li>
              )}
            </ul>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Problems? WhatsApp: <a href="https://wa.me/17732801545" className="text-green-400 hover:underline">+1 (773) 280-1545</a> · <a href="mailto:support@fanCardHub.com" className="text-primary hover:underline">support@fanCardHub.com</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
