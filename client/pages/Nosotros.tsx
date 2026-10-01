import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SummaryCartDrawer } from "@/components/SummaryCartDrawer";
import { useCart } from "@/lib/context/CartContext";

// Contenido basado en el Manual de Identidad 2026 (V.01) de THE FORGE: origen
// del logotipo, "El Mensaje" y "El Manifiesto" (condensado) son texto de
// marca real, no redactado por Claude. No se repite la sección de valores
// ("Lo Que Nos Define") porque ya vive en la home — esta página no debe
// duplicarla.
export default function Nosotros() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart } = useCart();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-background text-foreground relative z-10 w-full min-h-screen">
      <Header cartCount={cartCount} onCartClick={() => setIsCartOpen(!isCartOpen)} />

      {/* Hero: origen del nombre/logotipo, sobre la placa con el isotipo grabado */}
      <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 overflow-hidden bg-surface-page">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/products-hero-bg.webp')",
            backgroundSize: "cover",
            backgroundPosition: "right center",
            opacity: 0.55,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(90deg,
              hsl(var(--surface-page)) 0%, hsl(var(--surface-page)) 42%,
              hsl(var(--surface-page) / 0.55) 62%, hsl(var(--surface-page) / 0.15) 80%,
              transparent 92%)`,
          }}
        />
        <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-[60px]">
          <p className="text-primary font-semibold italic uppercase text-xs sm:text-sm tracking-[0.2em] mb-4">
            Quiénes Somos
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold italic uppercase leading-none mb-6">
            The Forge
          </h1>
          <p className="text-foreground/80 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl drop-shadow-md">
            THE FORGE no es solo una marca de ropa deportiva y distribución de suplementos
            alimenticios; es un símbolo de transformación. El logotipo nace del concepto de una
            grieta en el metal. La "F" angulosa representa la fractura profunda que ocurre en un
            bloque de acero tras ser golpeado repetidamente en el yunque.
          </p>
        </div>
      </section>

      {/* El Mensaje + Manifiesto (condensado) */}
      <section className="bg-surface-page py-16 sm:py-24 border-t border-b border-border/20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-secondary text-xs font-semibold not-italic uppercase tracking-[0.25em] mb-6">
            El Mensaje
          </p>
          <p className="text-foreground/85 text-sm sm:text-base italic mb-8 max-w-lg mx-auto">
            Así como el metal se purifica y fortalece bajo el calor y los golpes, el atleta se
            construye a través del esfuerzo implacable:
          </p>
          <p className="text-3xl sm:text-4xl md:text-5xl font-extrabold italic uppercase leading-tight mb-10">
            "Nos rompemos para <span className="text-primary">reconstruirnos</span> más fuertes"
          </p>
          <p className="text-foreground/85 text-sm sm:text-base italic max-w-md mx-auto">
            No estamos aquí por la comodidad. La comodidad no forja nada.
          </p>
          <p className="text-primary font-extrabold italic uppercase text-base sm:text-lg mt-8">
            The Forge
            <br />
            Built Under Pressure
          </p>
        </div>
      </section>

      <Footer />

      <SummaryCartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
