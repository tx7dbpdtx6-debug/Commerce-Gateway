import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";

// Pages
import Home from "@/pages/home";
import Browse from "@/pages/browse";
import CelebrityDetail from "@/pages/celebrity";
import Apply from "@/pages/apply";
import Checkout from "@/pages/checkout";
import Success from "@/pages/success";
import MyCards from "@/pages/my-cards";
import Support from "@/pages/support";
import Login from "@/pages/auth/login";
import Signup from "@/pages/auth/signup";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/browse" component={Browse} />
        <Route path="/celebrity/:id" component={CelebrityDetail} />
        <Route path="/apply/:celebId/:cardType" component={Apply} />
        <Route path="/checkout/:orderId" component={Checkout} />
        <Route path="/success" component={Success} />
        <Route path="/my-cards" component={MyCards} />
        <Route path="/support" component={Support} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
