import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuthStore } from "@/lib/auth";
import { useLogout, useGetMe } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ShoppingCart, LogOut, User, Menu, X, Star, MessageCircle } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const WHATSAPP_NUMBER = "17732801545";
const SUPPORT_EMAIL = "support@fanCardHub.com";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const { user, token, logout } = useAuthStore();
  const logoutMutation = useLogout();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logoutMutation.mutate({});
    logout();
    setLocation("/");
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/browse", label: "Browse" },
    { href: "/my-cards", label: "My Cards", requiresAuth: true },
    { href: "/support", label: "Support" },
  ];

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent ${
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-border/50 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Star className="h-6 w-6 text-primary group-hover:animate-spin-slow" />
          <span className="font-serif text-xl font-bold text-gradient-gold tracking-wider">
            CelebFanCards
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(
            (link) =>
              (!link.requiresAuth || user) && (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location === link.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              )
          )}
          {user?.email === "admin@fanCardHub.com" && (
            <Link href="/admin" className="text-sm font-medium text-yellow-400 hover:text-primary transition-colors">
              Admin
            </Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full border border-primary/20 hover:border-primary/50">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user.fullName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      @{user.username}
                    </p>
                  </div>
                </div>
                <DropdownMenuItem onClick={() => setLocation("/my-cards")} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                {user.email === "admin@fanCardHub.com" && (
                  <DropdownMenuItem onClick={() => setLocation("/admin")} className="cursor-pointer text-yellow-400">
                    <Star className="mr-2 h-4 w-4" />
                    <span>Admin Dashboard</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:bg-destructive/10">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => setLocation("/login")}
                className="hover:text-primary hover:bg-primary/10"
              >
                Log In
              </Button>
              <Button
                onClick={() => setLocation("/signup")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(255,215,0,0.3)] hover:shadow-[0_0_25px_rgba(255,215,0,0.5)] transition-all"
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Nav */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-background/95 backdrop-blur-xl border-l-border/50">
            <nav className="flex flex-col gap-4 mt-8">
              {navLinks.map(
                (link) =>
                  (!link.requiresAuth || user) && (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`text-lg font-medium py-2 transition-colors hover:text-primary ${
                        location === link.href
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {link.label}
                    </Link>
                  )
              )}
              {user?.email === "admin@fanCardHub.com" && (
                <Link href="/admin" className="text-lg font-medium py-2 text-yellow-400">Admin</Link>
              )}
              {!user && (
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
                  <Button variant="outline" className="w-full justify-start" onClick={() => setLocation("/login")}>Log In</Button>
                  <Button className="w-full justify-start" onClick={() => setLocation("/signup")}>Sign Up</Button>
                </div>
              )}
              {user && (
                <Button variant="ghost" className="w-full justify-start text-destructive hover:bg-destructive/10 mt-auto" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Log out
                </Button>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background/50 backdrop-blur-sm py-14 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 group inline-flex mb-4">
              <Star className="h-5 w-5 text-primary" />
              <span className="font-serif text-lg font-bold text-gradient-gold">
                CelebFanCards
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm mb-5">
              The premium destination for official digital fan cards. Own a piece of the spotlight and show your true fandom with exclusive VIP benefits.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground mb-5">
              <div>
                <span className="text-foreground font-medium">WhatsApp: </span>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20I%20need%20help%20with%20my%20Fan%20Card`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 transition-colors font-medium"
                >
                  +1 (773) 280-1545
                </a>
              </div>
              <div>
                <span className="text-foreground font-medium">Email: </span>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
                  {SUPPORT_EMAIL}
                </a>
              </div>
            </div>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {[
                { label: "Instagram", href: "#", svg: <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
                { label: "X", href: "#", svg: <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                { label: "Facebook", href: "#", svg: <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
                { label: "TikTok", href: "#", svg: <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.05a8.27 8.27 0 004.84 1.55V7.15a4.85 4.85 0 01-1.07-.46z"/></svg> },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-8 h-8 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all"
                >
                  {social.svg}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4 text-foreground">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">About</Link></li>
              <li><Link href="/browse" className="hover:text-primary transition-colors">Shop</Link></li>
              <li><Link href="/my-cards" className="hover:text-primary transition-colors">My Cards</Link></li>
              <li><Link href="/support" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Payment & Trust */}
          <div>
            <h4 className="font-bold mb-4 text-foreground">Secure Payments</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {/* Visa */}
              <div className="bg-white rounded px-2 py-1 flex items-center" title="Visa">
                <svg viewBox="0 0 48 16" className="h-5 w-10"><text x="0" y="13" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="#1A1F71">VISA</text></svg>
              </div>
              {/* Mastercard */}
              <div className="bg-white rounded px-1.5 py-1 flex items-center gap-0.5" title="Mastercard">
                <div className="w-5 h-5 rounded-full bg-[#EB001B] opacity-90" />
                <div className="w-5 h-5 rounded-full bg-[#F79E1B] opacity-90 -ml-2.5" />
              </div>
              {/* Verve */}
              <div className="bg-[#0A2E73] rounded px-2 py-1 flex items-center" title="Verve">
                <span className="text-white text-[9px] font-bold tracking-wide">VERVE</span>
              </div>
              {/* Flutterwave */}
              <div className="bg-[#F5A623] rounded px-2 py-1 flex items-center" title="Flutterwave">
                <span className="text-black text-[9px] font-bold">FLTRWV</span>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Refund Policy</a></li>
              <li>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 transition-colors"
                >
                  Live WhatsApp Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>&copy; 2026 CelebFanCards. All rights reserved.</p>
          <p className="text-center">
            Fan cards are official collectibles. Not affiliated with celebrity management.
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Refunds</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function SupportButton() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const handleSend = () => {
    if (!message.trim()) return;
    const encoded = encodeURIComponent(
      `Hi, I need help with my Fan Card. Message: ${message}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, "_blank");
    toast({ title: "Opening WhatsApp...", description: "Your message is ready to send!" });
    setMessage("");
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white px-4 py-3 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] transition-all group"
        title="Live Customer Support"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="text-sm font-medium hidden sm:block">Live Support</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-400" />
              Live Customer Support
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Type your message and we'll connect you directly to our WhatsApp support line.
          </p>
          <div className="space-y-3">
            <Label htmlFor="support-msg">Your Message</Label>
            <Textarea
              id="support-msg"
              placeholder="Describe your issue or question..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px] resize-none bg-background/50"
            />
            <Button
              onClick={handleSend}
              className="w-full bg-green-500 hover:bg-green-400 text-white"
              disabled={!message.trim()}
            >
              Send to WhatsApp Support
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              WhatsApp: <a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="text-green-400">+1 (773) 280-1545</a>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { token, setAuth } = useAuthStore();
  const { data: user, isError } = useGetMe({
    request: {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    }
  });

  useEffect(() => {
    if (isError) {
      useAuthStore.getState().logout();
    } else if (user && token) {
      setAuth(user, token);
    }
  }, [user, isError, token, setAuth]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30 selection:text-primary overflow-x-hidden">
      <Navbar />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <Footer />
      <SupportButton />
    </div>
  );
}
