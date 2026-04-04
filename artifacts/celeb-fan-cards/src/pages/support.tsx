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
import { Mail, MessageSquare, Phone, CheckCircle } from "lucide-react";

const WHATSAPP_NUMBER = "17732801545";
const SUPPORT_EMAIL = "support@fanCardHub.com";

export default function Support() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, "");
      const res = await fetch(`${baseUrl}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSubmitted(true);
        toast({
          title: "Message Sent!",
          description: "Our VIP support team will get back to you via WhatsApp shortly.",
        });
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        throw new Error("Failed");
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to send your message. Please try WhatsApp directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      q: "How do I access my digital card?",
      a: "Once your payment is verified, your digital card will instantly appear in the 'My Cards' section of your dashboard. You'll also receive a beautifully designed fan card via email."
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
    },
    {
      q: "What payment methods do you accept?",
      a: "We use Flutterwave for secure payment processing, which accepts all major credit/debit cards, bank transfers, and many local payment methods worldwide."
    },
    {
      q: "Will I receive a confirmation email?",
      a: "Yes! After a successful payment, we automatically generate your personalized fan card design and send it to your email address along with your order confirmation."
    },
    {
      q: "How do I contact support?",
      a: "You can reach us via the contact form on this page, WhatsApp at +1 (773) 280-1545, or email us at support@fanCardHub.com. We typically respond within 24 hours."
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
          
          {submitted ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Message Received!</h3>
              <p className="text-muted-foreground">Our VIP support team will get back to you via WhatsApp or email shortly.</p>
              <Button className="mt-6" onClick={() => setSubmitted(false)}>Send Another Message</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" required value={form.name} onChange={handleChange} className="bg-background/50" placeholder="Your full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={form.email} onChange={handleChange} className="bg-background/50" placeholder="your@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" required value={form.subject} onChange={handleChange} className="bg-background/50" placeholder="How can we help?" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" required value={form.message} onChange={handleChange} className="min-h-[120px] resize-none bg-background/50" placeholder="Describe your issue or question in detail..." />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-4"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          )}

          <div className="mt-8 pt-8 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a 
              href={`mailto:${SUPPORT_EMAIL}`}
              className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Mail className="h-5 w-5 text-primary flex-shrink-0" />
              <span>{SUPPORT_EMAIL}</span>
            </a>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20I%20need%20help%20with%20my%20Fan%20Card`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm text-muted-foreground hover:text-green-400 transition-colors"
            >
              <Phone className="h-5 w-5 text-green-400 flex-shrink-0" />
              <span>+1 (773) 280-1545</span>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
