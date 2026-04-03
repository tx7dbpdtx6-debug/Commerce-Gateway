import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, MessageSquare, Phone } from "lucide-react";

export default function Support() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Message Sent",
        description: "Our VIP support team will get back to you shortly.",
      });
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  const faqs = [
    {
      q: "How do I access my digital card?",
      a: "Once your payment is verified, your digital card will instantly appear in the 'My Cards' section of your dashboard. You can view, screenshot, or showcase it at any time."
    },
    {
      q: "Is the VIP physical card real?",
      a: "Yes! Our VIP tier includes a premium, heavy-weight metal/holographic physical card shipped directly to your provided address. Production typically takes 2-3 weeks."
    },
    {
      q: "How long does delivery take for physical items?",
      a: "Physical VIP cards take 2-3 weeks for production and 3-5 business days for shipping within the US. International shipping may take 7-14 business days."
    },
    {
      q: "Can I get a refund?",
      a: "Due to the custom and immediate digital nature of our cards, all sales are final. However, if there is an error on your card or a defect in a physical item, please contact support for a replacement."
    },
    {
      q: "Can I buy cards for multiple celebrities?",
      a: "Absolutely. There is no limit to how many fan cards you can collect. Expand your portfolio and own a piece of every fandom."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-foreground">VIP Support</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          We're here to ensure your experience is nothing short of extraordinary.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* FAQ Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <MessageSquare className="text-primary" /> Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border/50">
                <AccordionTrigger className="text-left font-medium hover:text-primary transition-colors">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Contact Form */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card/50 backdrop-blur-sm border border-border p-8 rounded-2xl shadow-xl"
        >
          <h2 className="text-2xl font-bold mb-6">Contact Concierge</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" required className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" required className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" required className="min-h-[120px] resize-none bg-background/50" />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-border grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Mail className="h-5 w-5 text-primary" />
              <span>vip@celebfancards.com</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Phone className="h-5 w-5 text-primary" />
              <span>1-800-FAN-VIP</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
