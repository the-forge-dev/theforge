import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SummaryCartDrawer } from "@/components/SummaryCartDrawer";
import { useCart } from "@/lib/context/CartContext";

export default function Privacy() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart } = useCart();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-background text-foreground relative z-10 w-full min-h-screen">
      <Header cartCount={cartCount} onCartClick={() => setIsCartOpen(!isCartOpen)} />

      {/* Main Content */}
      <div className="pt-20 sm:pt-24 pb-20 max-w-4xl mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold italic uppercase mb-10">
          Política de Privacidad
        </h1>

        <div className="space-y-8 text-foreground/80 text-sm sm:text-base">
          <section>
            <h2 className="text-xl sm:text-2xl font-extrabold italic uppercase text-primary mb-4">
              Aviso de Privacidad
            </h2>
            <p className="mb-4">
              THE FORGE es responsable del tratamiento de los datos personales que nos compartes al
              realizar un pedido.
            </p>
            <p className="mb-4">
              La mayoría de estos datos (nombre completo, correo electrónico, número telefónico,
              dirección de envío) nos los compartes directamente en la conversación de WhatsApp con un
              miembro de nuestro equipo al confirmar tu pedido, y no a través de un formulario en este
              sitio web.
            </p>
            <p className="mb-4">
              Como esa conversación ocurre dentro de WhatsApp, tus datos también son tratados por
              WhatsApp/Meta conforme a su propia política de privacidad, ajena a THE FORGE.
            </p>
            <p className="mb-4">
              Los datos personales serán utilizados para procesar pedidos, gestionar envíos, brindar atención al cliente y compartir promociones cuando exista consentimiento.
            </p>
            <p>
              Los usuarios podrán solicitar el acceso, rectificación, cancelación u oposición respecto
              al tratamiento de sus datos personales escribiendo a theforgesupplements@gmail.com.
            </p>
          </section>

        </div>
      </div>

      <Footer />

      <SummaryCartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
