import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronDown, Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/context/ThemeContext";
import { Footer } from "@/components/Footer";

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
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
    answer: "Una vez enviado tu pedido, recibirás una guía de rastreo por correo electrónico."
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
    answer: "Los métodos de pago disponibles se mostrarán durante el proceso de compra."
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
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="bg-background text-foreground relative z-10 w-full min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur border-b border-secondary/30">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer">
            <img
              src={theme === "light" ? "/imagotipo-dark.svg" : "/imagotipo.svg"}
              alt="THE FORGE"
              className="h-8 sm:h-11 w-auto"
              draggable="false"
              style={{ pointerEvents: 'none' }}
            />
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              className="text-foreground hover:text-primary transition p-2 border border-secondary/30"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link to="/" className="text-foreground/70 hover:text-primary transition">
              <ChevronLeft size={24} />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-20 sm:pt-28 pb-20 max-w-4xl mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold italic uppercase mb-2 sm:mb-4">
          Preguntas Frecuentes
        </h1>
        <p className="text-foreground/70 italic text-sm sm:text-base mb-10 sm:mb-12">
          Aquí encontrarás respuestas a las preguntas más comunes sobre nuestros productos y servicios.
        </p>

        <FAQAccordion />
      </div>

      <Footer />
    </div>
  );
}
