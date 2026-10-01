import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SummaryCartDrawer } from "@/components/SummaryCartDrawer";
import { useCart } from "@/lib/context/CartContext";

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "¿Cómo funciona el proceso de compra?",
    answer: "Agregas los productos a tu carrito y das clic en \"Pedir por WhatsApp\" — esto genera un mensaje con el detalle de tu pedido. Un miembro de nuestro equipo te contactará por ese chat para confirmar el método de pago, pedirte tus datos de envío y compartirte tu número de pedido."
  },
  {
    question: "¿Hacen envíos a todo México?",
    answer: "Sí. Realizamos envíos a toda la República Mexicana."
  },
  {
    question: "¿Cuánto tarda en llegar mi pedido?",
    answer: "Los pedidos suelen procesarse en 1 a 2 días hábiles. El tiempo de entrega dependerá de la paquetería y del destino."
  },
  {
    question: "¿Cómo puedo rastrear mi pedido?",
    answer: "Una vez enviado tu pedido, te compartiremos la guía de rastreo por WhatsApp o al correo electrónico que nos hayas proporcionado."
  },
  {
    question: "¿Puedo devolver un suplemento?",
    answer: "Por razones de higiene y seguridad, no aceptamos devoluciones de productos abiertos o con sellos alterados."
  },
  {
    question: "¿Qué hago si mi pedido llega dañado?",
    answer: "Contáctanos dentro de las primeras 48 horas posteriores a la recepción del paquete enviando fotografías y tu número de pedido a theforgesupplements@gmail.com."
  },
  {
    question: "¿Qué métodos de pago aceptan?",
    answer: "El método de pago se acuerda directamente con nuestro equipo por WhatsApp al confirmar tu pedido."
  },
  {
    question: "¿Los suplementos son originales?",
    answer: "Sí. Todos los productos comercializados por THE FORGE son productos originales y adquiridos a través de canales autorizados."
  },
  {
    question: "¿Puedo cancelar mi pedido?",
    answer: "Las cancelaciones solo podrán realizarse antes de que el pedido haya sido procesado y enviado."
  },
  {
    question: "¿Cómo puedo contactarlos?",
    answer: "Puedes escribirnos a: theforgesupplements@gmail.com"
  },
  {
    question: "¿Los suplementos garantizan resultados?",
    answer: "No. Los resultados dependen de múltiples factores como alimentación, entrenamiento, descanso, genética y constancia."
  }
];

function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3 sm:space-y-4">
      {faqItems.map((item, index) => (
        <div
          key={index}
          className="border border-secondary/30 bg-background/50"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-secondary/10 transition-colors text-left"
          >
            <h3 className="font-bold italic uppercase text-sm sm:text-base text-foreground pr-4">
              {item.question}
            </h3>
            <ChevronDown
              size={20}
              className={`flex-shrink-0 text-primary transition-transform ${
                openIndex === index ? "rotate-180" : ""
              }`}
            />
          </button>

          {openIndex === index && (
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-secondary/20 text-foreground/80 text-sm sm:text-base italic">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function FAQ() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart } = useCart();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-background text-foreground relative z-10 w-full min-h-screen">
      <Header cartCount={cartCount} onCartClick={() => setIsCartOpen(!isCartOpen)} />

      {/* Main Content */}
      <div className="pt-20 sm:pt-24 pb-20 max-w-4xl mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold italic uppercase mb-2 sm:mb-4">
          Preguntas Frecuentes
        </h1>
        <p className="text-foreground/70 italic text-sm sm:text-base mb-10 sm:mb-12">
          Aquí encontrarás respuestas a las preguntas más comunes sobre nuestros productos y servicios.
        </p>

        <FAQAccordion />
      </div>

      <Footer />

      <SummaryCartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
