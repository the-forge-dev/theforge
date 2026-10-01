import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SummaryCartDrawer } from "@/components/SummaryCartDrawer";
import { useCart } from "@/lib/context/CartContext";

export default function EnviosDevoluciones() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart } = useCart();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-background text-foreground relative z-10 w-full min-h-screen">
      <Header cartCount={cartCount} onCartClick={() => setIsCartOpen(!isCartOpen)} />

      {/* Main Content */}
      <div className="pt-20 sm:pt-24 pb-20 max-w-4xl mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold italic uppercase mb-10">
          Envíos y Devoluciones
        </h1>

        <div className="space-y-8 text-foreground/80 text-sm sm:text-base">
          <section>
            <h2 className="text-xl sm:text-2xl font-extrabold italic uppercase text-primary mb-4">
              ¿Cómo Funciona Tu Pedido?
            </h2>
            <p>
              Al armar tu carrito y dar clic en "Pedir por WhatsApp", se genera un mensaje con el detalle
              de tu pedido. Un miembro de nuestro equipo te contactará por ese mismo chat para confirmar
              el método de pago, pedirte tu correo electrónico y dirección de envío, y compartirte tu
              número de pedido.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-extrabold italic uppercase text-primary mb-4">
              Política de Envíos
            </h2>
            <p className="mb-4">
              En THE FORGE nos comprometemos a procesar y enviar los pedidos de forma rápida y segura.
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Los pedidos son procesados dentro de 1 a 2 días hábiles posteriores a la confirmación del pago.</li>
              <li>Los tiempos de entrega pueden variar dependiendo de la ubicación del cliente y de la paquetería seleccionada.</li>
              <li>Una vez enviado el pedido, te compartiremos el número de rastreo por WhatsApp o al correo electrónico que nos hayas proporcionado.</li>
            </ul>
            <p className="mb-4 font-bold">
              Cobertura: Realizamos envíos a toda la República Mexicana.
            </p>
            <p className="mb-4">
              THE FORGE no es responsable por retrasos ocasionados por situaciones ajenas a nuestra operación, incluyendo eventos climáticos, incidencias logísticas, temporadas de alta demanda o problemas atribuibles a la empresa de mensajería.
            </p>
            <p className="mb-4">
              Es responsabilidad del cliente proporcionar información correcta y completa para la entrega. En caso de devolución por dirección incorrecta o incompleta, los costos de reenvío correrán por cuenta del cliente.
            </p>
            <p>
              Si tu pedido llega dañado o presenta alguna anomalía, deberás contactarnos dentro de las primeras 48 horas posteriores a la recepción del paquete enviando evidencia fotográfica al correo de atención al cliente.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-extrabold italic uppercase text-primary mb-4">
              Política de Devoluciones y Reembolsos
            </h2>
            <p className="mb-4">
              Debido a la naturaleza de los suplementos alimenticios y por razones de higiene y seguridad, THE FORGE no acepta devoluciones de productos abiertos, usados o con sellos de seguridad alterados.
            </p>
            <p className="mb-4 font-bold">
              Se podrá solicitar una devolución o reemplazo únicamente cuando:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>El producto recibido sea diferente al solicitado.</li>
              <li>El producto haya llegado dañado durante el transporte.</li>
              <li>El pedido se encuentre incompleto por error de preparación.</li>
            </ul>
            <p className="mb-4">
              Las solicitudes deberán realizarse dentro de las primeras 48 horas posteriores a la recepción del pedido.
            </p>
            <p className="mb-4">
              El cliente deberá proporcionar el número de pedido que le compartimos al confirmar su
              compra, fotografías del producto y descripción del problema.
            </p>
            <p>
              Una vez validada la incidencia, THE FORGE podrá reemplazar el producto, emitir un reembolso parcial o total, u otorgar crédito para compras futuras.
            </p>
          </section>
        </div>
      </div>

      <Footer />

      <SummaryCartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
