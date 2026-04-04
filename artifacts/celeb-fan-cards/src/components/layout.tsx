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
    <footer className="border-t border-border/50 bg-background/50 backdrop-blur-sm py-12 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 group inline-flex mb-4">
              <Star className="h-5 w-5 text-primary" />
              <span className="font-serif text-lg font-bold text-gradient-gold">
                CelebFanCards
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              The premium destination for official digital fan cards. Own a piece of the spotlight and show your true fandom with exclusive VIP benefits.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
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
          </div>
          <div>
            <h4 className="font-bold mb-4 text-foreground">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/browse" className="hover:text-primary transition-colors">Browse Celebrities</Link></li>
              <li><Link href="/my-cards" className="hover:text-primary transition-colors">My Cards</Link></li>
              <li><Link href="/support" className="hover:text-primary transition-colors">Support & FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-foreground">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Refund Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/50 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground">
          <p>&copy; 2026 CelebFanCards. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-primary transition-colors">Twitter</a>
            <a href="#" className="hover:text-primary transition-colors">Instagram</a>
            <a href="#" className="hover:text-primary transition-colors">TikTok</a>
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
