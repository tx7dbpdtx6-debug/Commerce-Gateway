import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useVerifyPayment } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";

export default function Success() {
  const [, setLocation] = useLocation();
  const [searchParams] = useState(new URLSearchParams(window.location.search));
  const transactionId = searchParams.get("transaction_id") || searchParams.get("tx_ref");
  const orderIdParam = searchParams.get("orderId");
  
  const verifyPaymentMutation = useVerifyPayment();
  const [verificationStatus, setVerificationStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [orderId, setOrderId] = useState<number | null>(null);
  const [confirmationNumber, setConfirmationNumber] = useState<string>("");

  useEffect(() => {
    if (!transactionId || !orderIdParam) {
      setVerificationStatus("error");
      return;
    }

    const parsedOrderId = parseInt(orderIdParam, 10);
    if (isNaN(parsedOrderId)) {
      setVerificationStatus("error");
      return;
    }
    
    verifyPaymentMutation.mutate(
      {
        data: {
          transactionId,
          orderId: parsedOrderId
        }
      },
      {
        onSuccess: (data) => {
          setVerificationStatus("success");
          setOrderId(data.orderId);
          setConfirmationNumber(data.confirmationNumber);
          
          // Trigger confetti
          const duration = 3 * 1000;
          const end = Date.now() + duration;

          const frame = () => {
            confetti({
              particleCount: 5,
              angle: 60,
              spread: 55,
              origin: { x: 0 },
              colors: ['#FFD700', '#FF0000', '#FFFFFF']
            });
            confetti({
              particleCount: 5,
              angle: 120,
              spread: 55,
              origin: { x: 1 },
              colors: ['#FFD700', '#FF0000', '#FFFFFF']
            });

            if (Date.now() < end) {
              requestAnimationFrame(frame);
            }
          };
          frame();
        },
        onError: () => {
          // Even if verification fails here, maybe it was already verified
          // We can just show success or direct them to my-cards
          setVerificationStatus("error");
        }
      }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId]);

  if (verificationStatus === "verifying") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h2 className="text-xl font-medium animate-pulse">Verifying your payment...</h2>
      </div>
    );
  }

  if (verificationStatus === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center px-4">
        <div className="h-20 w-20 bg-destructive/20 rounded-full flex items-center justify-center mb-4">
          <Loader2 className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold">Payment Status Unclear</h1>
        <p className="text-muted-foreground max-w-md">
          We couldn't immediately verify your payment. Don't worry, if your account was charged, 
          your card will appear in your dashboard shortly.
        </p>
        <div className="flex gap-4 pt-4">
          <Button variant="outline" onClick={() => setLocation("/support")}>Contact Support</Button>
          <Button onClick={() => setLocation("/my-cards")}>Go to My Cards</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 px-4 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="mb-8"
      >
        <div className="h-24 w-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-primary">
          <CheckCircle className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
          You're on the Inside!
        </h1>
        <p className="text-xl text-muted-foreground">
          Payment Successful! Your Fan Card has been designed and sent to your email!
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-card border border-border p-8 rounded-2xl max-w-md w-full mb-8 shadow-[0_0_30px_rgba(255,215,0,0.1)]"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Confirmation Number</p>
            <p className="font-mono text-xl font-bold tracking-widest text-primary">{confirmationNumber || "CONFIRMED"}</p>
          </div>
          <div className="pt-4 border-t border-border text-left">
            <h3 className="font-bold mb-2">What happens next?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                Your digital card is immediately available in your dashboard
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                A beautifully designed Fan Card image has been sent to your email 🎉
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                Need help? WhatsApp us at <span className="text-green-400">+1 (773) 280-1545</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                If you ordered a VIP physical card, shipping updates will arrive via email
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Button 
          size="lg" 
          className="text-lg px-8 py-6"
          onClick={() => setLocation("/my-cards")}
        >
          View My Cards <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </motion.div>
    </div>
  );
}
