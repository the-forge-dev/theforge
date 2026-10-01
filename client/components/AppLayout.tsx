import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import AllProducts from "@/pages/AllProducts";
import Admin from "@/pages/Admin";
import Privacy from "@/pages/Privacy";
import Terminos from "@/pages/Terminos";
import EnviosDevoluciones from "@/pages/EnviosDevoluciones";
import FAQ from "@/pages/FAQ";
import Ropa from "@/pages/Ropa";
import Accesorios from "@/pages/Accesorios";
import Marcas from "@/pages/Marcas";
import Nosotros from "@/pages/Nosotros";
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
          <Route path="/terminos" element={<Terminos />} />
          <Route path="/envios-y-devoluciones" element={<EnviosDevoluciones />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/ropa" element={<Ropa />} />
          <Route path="/accesorios" element={<Accesorios />} />
          <Route path="/marcas" element={<Marcas />} />
          <Route path="/blog" element={<Nosotros />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </TooltipProvider>
  );
}
