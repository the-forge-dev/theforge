import { useState } from "react";
import { X } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
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
  const { cart, removeFromCart } = useCart();

  const total = cart.reduce((sum, item) => sum + (item.itemPrice || item.price) * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleWhatsApp = () => {
    const message = cart
      .map((item) => {
        const variantName = item.selectedVariantId
          ? ` (${item.variants?.find((v) => v.id === item.selectedVariantId)?.name})`
          : "";
        const itemPrice = item.itemPrice || item.price;
        return `- ${item.name}${variantName} x${item.quantity} $${(itemPrice * item.quantity).toFixed(2)}`;
      })
      .join("\n");

    const whatsappMessage = encodeURIComponent(
      `Hola, quiero hacer este pedido:\n\n${message}\n\nTotal: $${total.toFixed(2)}`
    );

    window.open(`https://wa.me/4434806689?text=${whatsappMessage}`, "_blank");
  };

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

      {/* Carrito: resumen de solo lectura (sin catálogo cargado en esta página) */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={() => setIsCartOpen(false)}>
          <div
            className="bg-surface-page border-l border-surface-border/10 w-full sm:w-96 h-screen flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-surface-border/10 p-4 sm:p-6 flex justify-between items-center">
              <h2 className="text-xl sm:text-2xl font-extrabold italic uppercase">Tu Carrito</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-foreground hover:text-primary transition">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {cart.length === 0 ? (
                <p className="text-foreground/70 italic text-center py-8 text-sm sm:text-base">
                  Tu carrito está vacío
                </p>
              ) : (
                cart.map((item) => (
                  <div key={`${item.id}-${item.selectedVariantId || ""}`} className="border border-surface-border/10 p-3 sm:p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold italic uppercase text-xs sm:text-sm">
                        {item.name}
                        {item.selectedVariantId && (
                          <span className="text-foreground/70">
                            {" "}({item.variants?.find((v) => v.id === item.selectedVariantId)?.name})
                          </span>
                        )}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.id, item.selectedVariantId)}
                        className="text-primary hover:text-primary/70 transition flex-shrink-0"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <p className="text-foreground/70 italic text-xs sm:text-sm">
                      {item.quantity} × ${(item.itemPrice || item.price).toFixed(2)}
                    </p>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-surface-border/10 p-4 sm:p-6 space-y-4">
                <div className="bg-surface-card p-4 border border-surface-border/10">
                  <p className="text-foreground/70 italic text-xs sm:text-sm mb-2">Total</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-primary">${total.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => {
                    handleWhatsApp();
                    setIsCartOpen(false);
                  }}
                  className="w-full bg-primary text-primary-foreground py-3 font-extrabold italic uppercase text-sm sm:text-base hover:bg-opacity-90 transition-all"
                >
                  Pedir por WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
