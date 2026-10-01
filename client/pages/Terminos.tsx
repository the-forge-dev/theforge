import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SummaryCartDrawer } from "@/components/SummaryCartDrawer";
import { useCart } from "@/lib/context/CartContext";

export default function Terminos() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart } = useCart();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-background text-foreground relative z-10 w-full min-h-screen">
      <Header cartCount={cartCount} onCartClick={() => setIsCartOpen(!isCartOpen)} />

      {/* Main Content */}
      <div className="pt-20 sm:pt-24 pb-20 max-w-4xl mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold italic uppercase mb-10">
          Términos y Condiciones
        </h1>

        <div className="space-y-8 text-foreground/80 text-sm sm:text-base">
          <section>
            <p className="mb-4">
              Al acceder y utilizar el sitio web de THE FORGE, el usuario acepta los presentes Términos y Condiciones.
            </p>
            <p className="mb-4">
              THE FORGE comercializa suplementos alimenticios, accesorios y productos relacionados con el bienestar físico y deportivo.
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Todos los productos están sujetos a disponibilidad de inventario.</li>
              <li>Todos los precios se muestran en pesos mexicanos (MXN) e incluyen los impuestos aplicables salvo indicación expresa en contrario.</li>
              <li>El método de pago se acuerda directamente con un miembro de nuestro equipo por WhatsApp al confirmar tu pedido. THE FORGE no recolecta ni almacena información bancaria ni datos de tarjetas de crédito o débito a través del sitio web.</li>
              <li>Todo el contenido del sitio, incluyendo logotipos, imágenes, diseños, textos y elementos gráficos, es propiedad de THE FORGE.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-extrabold italic uppercase text-primary mb-4">
              Descargo de Responsabilidad sobre Suplementos
            </h2>
            <p className="mb-4">
              Los productos comercializados por THE FORGE son suplementos alimenticios y no medicamentos.
            </p>
            <p className="mb-4">
              Estos productos no están destinados a diagnosticar, tratar, curar o prevenir enfermedades.
            </p>
            <p className="mb-4">
              Los resultados pueden variar entre individuos dependiendo de factores como alimentación, entrenamiento, descanso, genética y adherencia al programa nutricional.
            </p>
            <p>
              Antes de iniciar el consumo de cualquier suplemento alimenticio, se recomienda consultar con un profesional de la salud.
            </p>
          </section>
        </div>
      </div>

      <Footer />

      <SummaryCartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
