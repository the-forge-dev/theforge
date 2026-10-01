import { X } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";
import { formatItemLabel } from "@/lib/utils/formatItemLabel";
import { formatMoney } from "@/lib/utils/formatMoney";

interface SummaryCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// Carrito en modo resumen de solo lectura (sin editar cantidades), usado en
// páginas que no cargan el catálogo de productos: placeholders de navbar
// (Ropa/Accesorios/Marcas/Nosotros) y las páginas de contenido de Compañía
// (Política de Privacidad, Términos, Envíos y Devoluciones, FAQ).
export function SummaryCartDrawer({ isOpen, onClose }: SummaryCartDrawerProps) {
  const { cart, removeFromCart, clearCart } = useCart();

  const total = cart.reduce((sum, item) => sum + (item.itemPrice || item.price) * item.quantity, 0);

  const handleWhatsApp = () => {
    const message = cart
      .map((item) => {
        const variantName = item.selectedVariantId
          ? item.variants?.find((v) => v.id === item.selectedVariantId)?.name
          : undefined;
        const itemPrice = item.itemPrice || item.price;
        return `- ${formatItemLabel(item.name, variantName)} x${item.quantity} ${formatMoney(itemPrice * item.quantity)}`;
      })
      .join("\n");

    const whatsappMessage = encodeURIComponent(
      `Hola, quiero hacer este pedido:\n\n${message}\n\nTotal: ${formatMoney(total)}`
    );

    window.open(`https://wa.me/4434806689?text=${whatsappMessage}`, "_blank");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={onClose}>
      <div
        className="bg-surface-page border-l border-surface-border/10 w-full sm:w-96 h-screen flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-surface-border/10 p-4 sm:p-6 flex justify-between items-center gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="text-xl sm:text-2xl font-extrabold italic uppercase">Tu Carrito</h2>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-foreground/60 hover:text-primary transition text-xs italic underline flex-shrink-0"
              >
                Vaciar carrito
              </button>
            )}
          </div>
          <button onClick={onClose} className="text-foreground hover:text-primary transition flex-shrink-0">
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
                        {" · "}{item.variants?.find((v) => v.id === item.selectedVariantId)?.name}
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
                  {item.quantity} × {formatMoney(item.itemPrice || item.price)}
                </p>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-surface-border/10 p-4 sm:p-6 space-y-4">
            <div className="bg-surface-card p-4 border border-surface-border/10">
              <p className="text-foreground/70 italic text-xs sm:text-sm mb-2">Total</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-primary">{formatMoney(total)}</p>
            </div>
            <button
              onClick={() => {
                handleWhatsApp();
                onClose();
              }}
              className="w-full bg-primary text-primary-foreground py-3 font-extrabold italic uppercase text-sm sm:text-base hover:bg-opacity-90 transition-all"
            >
              Pedir por WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
