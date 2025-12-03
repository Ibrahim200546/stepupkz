import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { CartProvider } from "./hooks/useCart";
import { usePresence } from "./hooks/usePresence";
import SEOHead from "./components/SEOHead";
import "./i18n";

// Lazy load pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const Catalog = lazy(() => import("./pages/Catalog"));
const Product = lazy(() => import("./pages/Product"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Auth = lazy(() => import("./pages/Auth"));
const Account = lazy(() => import("./pages/Account"));
const Admin = lazy(() => import("./pages/Admin"));
const SlashAdminIframe = lazy(() => import("./pages/SlashAdminIframe"));
const About = lazy(() => import("./pages/About"));
const Delivery = lazy(() => import("./pages/Delivery"));
const Returns = lazy(() => import("./pages/Returns"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Chat = lazy(() => import("./pages/Chat"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const VendorRegister = lazy(() => import("./pages/VendorRegister"));
const VendorProducts = lazy(() => import("./pages/VendorProducts"));
const AIChatWidget = lazy(() => import("./components/chat/AIChatWidget").then(m => ({ default: m.AIChatWidget })));
const FlickChat = lazy(() => import("./pages/FlickChat"));
const AdminTest = lazy(() => import("./pages/AdminTest"));
const FlickLogin = lazy(() => import("./pages/FlickLogin"));
const FlickRegister = lazy(() => import("./pages/FlickRegister"));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const queryClient = new QueryClient();

const AppContent = () => {
  // Track online presence
  usePresence();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/account" element={<Account />} />
        {/* Admin Panel - улучшенная версия */}
        <Route path="/admin/*" element={<Admin />} />
        <Route path="/admin-test" element={<AdminTest />} />
        <Route path="/about" element={<About />} />
        <Route path="/delivery" element={<Delivery />} />
        <Route path="/returns" element={<Returns />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/flick-chat" element={<FlickChat />} />
        <Route path="/flick-login" element={<FlickLogin />} />
        <Route path="/flick-register" element={<FlickRegister />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/vendor/register" element={<VendorRegister />} />
        <Route path="/vendor/products" element={<VendorProducts />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* AI Chat Widget - available on all pages */}
      <AIChatWidget />
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SEOHead />
        <AuthProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
