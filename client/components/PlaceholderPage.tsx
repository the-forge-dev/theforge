import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SummaryCartDrawer } from "@/components/SummaryCartDrawer";
import { useCart } from "@/lib/context/CartContext";

interface PlaceholderPageProps {
  title: string;
}

// Página mínima para secciones del navbar que todavía no tienen contenido
// real (Ropa, Accesorios, Marcas, Blog). Usa el mismo Header/Footer que el
// resto del sitio; el carrito se muestra en modo resumen (sin editar
// cantidades) ya que estas páginas no cargan el catálogo de productos.
export function PlaceholderPage({ title }: PlaceholderPageProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart } = useCart();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-surface-page text-foreground relative z-10 w-full min-h-screen flex flex-col">
      <Header cartCount={cartCount} onCartClick={() => setIsCartOpen(!isCartOpen)} />

      <div className="flex-1 flex flex-col items-center justify-center pt-16 sm:pt-20 px-4 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold italic uppercase mb-4">
          {title}
        </h1>
        <p className="text-foreground/60 italic text-lg sm:text-xl">
          Próximamente
        </p>
      </div>

      <Footer />

      <SummaryCartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
