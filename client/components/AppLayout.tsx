import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import AllProducts from "@/pages/AllProducts";
import Admin from "@/pages/Admin";
import Privacy from "@/pages/Privacy";
import FAQ from "@/pages/FAQ";
import NotFound from "@/pages/NotFound";

export default function AppLayout() {
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <div className="dark">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/productos" element={<AllProducts />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/politicas" element={<Privacy />} />
          <Route path="/faq" element={<FAQ />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </TooltipProvider>
  );
}
