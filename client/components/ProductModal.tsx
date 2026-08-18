import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { Product } from "@/lib/services/products";

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, variant?: string) => void;
  cartQuantity?: number;
}

export function ProductModal({ product, onClose, onAddToCart, cartQuantity = 0 }: ProductModalProps) {
  const [selectedVariant, setSelectedVariant] = useState<string | null>(
    product.has_variants && product.variants?.length > 0
      ? (product.variants.find(v => v.quantity > 0)?.id || product.variants[0].id)
      : null
  );
  const [quantity, setQuantity] = useState(1);
  const [isImageSticky, setIsImageSticky] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Desactivar scroll de la página
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsImageSticky(container.scrollTop > 150);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const getAvailableStock = () => {
    if (product.has_variants && selectedVariant) {
      const variant = product.variants?.find(v => v.id === selectedVariant);
      return variant?.quantity ?? 0;
    }
    return product.quantity;
  };

  const getTotalVariantsStock = () => {
    if (product.has_variants && product.variants) {
      return product.variants.reduce((total, v) => total + v.quantity, 0);
    }
    return 0;
  };

  const getPrice = () => {
    if (product.has_variants && selectedVariant) {
      const variant = product.variants?.find(v => v.id === selectedVariant);
      return variant?.price ?? product.price;
    }
    return product.price;
  };

  const getImageUrl = () => {
    if (product.has_variants && selectedVariant) {
      const variant = product.variants?.find(v => v.id === selectedVariant);
      if (variant?.image_url) {
        return variant.image_url;
      }
    }
    return product.image_url;
  };

  const currentStock = getAvailableStock();
  const totalVariantsStock = getTotalVariantsStock();
  const currentPrice = getPrice();
  const isOutOfStock = currentStock === 0;
  const maxAvailable = Math.max(0, currentStock - cartQuantity);

  const handleAddToCart = () => {
    if (quantity > 0 && quantity <= maxAvailable) {
      for (let i = 0; i < quantity; i++) {
        onAddToCart(product, selectedVariant || undefined);
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-background border border-secondary/30 w-full max-w-2xl max-h-[calc(100vh-3rem)] sm:max-h-[calc(100vh-2rem)] flex flex-col">
        {/* Modal Header */}
        <div className="border-b border-secondary/20 p-4 sm:p-6 flex justify-between items-center bg-background flex-shrink-0">
          <h2 className="text-lg sm:text-2xl font-extrabold italic uppercase line-clamp-2">
            {product.name}
          </h2>
          <button
            onClick={onClose}
            className="text-foreground hover:text-primary transition flex-shrink-0"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto relative">
          {/* Sticky Image Container */}
          {isImageSticky && (
            <div className="sticky top-0 bg-background border-b border-secondary/20 p-3 z-10 flex gap-3">
              <div className="w-20 h-20 flex-shrink-0 bg-secondary/10 overflow-hidden">
                <img
                  src={getImageUrl()}
                  alt={product.name}
                  className="w-full h-full object-contain"
                  draggable="false"
                  style={{ pointerEvents: 'none' }}
                />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <h3 className="font-bold text-sm line-clamp-2">{product.name}</h3>
                {product.has_variants && selectedVariant && (
                  <p className="text-xs text-foreground/70 italic">
                    {product.variants?.find(v => v.id === selectedVariant)?.name}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Product Image */}
            <div className="relative h-48 sm:h-64 overflow-hidden bg-secondary/10 flex-shrink-0">
              <img
                src={getImageUrl()}
                alt={product.name}
                className="w-full h-full object-contain"
                draggable="false"
                style={{ pointerEvents: 'none' }}
              />
            </div>

            {/* Product Info */}
            <div className="space-y-4">
              <div>
                <p className="text-foreground/60 italic text-xs sm:text-sm uppercase mb-2">
                  Descripción
                </p>
                <div className="text-sm sm:text-base md:text-lg italic text-foreground prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc list-inside mb-2 ml-4">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside mb-2 ml-4">{children}</ol>,
                      li: ({ children }) => <li className="mb-1">{children}</li>,
                      strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                    }}
                  >
                    {product.description}
                  </ReactMarkdown>
                </div>
              </div>

              <div className="bg-secondary/10 border border-secondary/30 p-4">
                <p className="text-foreground/60 italic text-xs sm:text-sm uppercase mb-2">
                  Precio
                </p>
                <p className="text-3xl sm:text-4xl font-extrabold text-primary">
                  ${currentPrice.toFixed(2)}
                </p>
                {product.has_variants && selectedVariant && currentPrice !== product.price && (
                  <p className="text-xs text-foreground/60 italic mt-2">
                    Precio de variante: ${currentPrice.toFixed(2)} (Precio base: ${product.price.toFixed(2)})
                  </p>
                )}
              </div>

              {/* Variantes si aplica */}
              {product.has_variants && product.variants && product.variants.length > 0 && (
                <div className="bg-secondary/10 border border-secondary/30 p-4">
                  <p className="text-foreground/60 italic text-xs sm:text-sm uppercase mb-3">
                    Selecciona variante
                  </p>
                  <div className="space-y-2">
                    {[
                      ...product.variants.filter(v => v.quantity > 0),
                      ...product.variants.filter(v => v.quantity === 0),
                    ].map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => {
                          setSelectedVariant(variant.id);
                          setQuantity(1);
                        }}
                        className={`w-full flex justify-between items-start gap-2 p-3 border italic transition ${
                          selectedVariant === variant.id
                            ? "border-primary bg-primary/10"
                            : "border-secondary/30 bg-background hover:border-primary/50"
                        } ${variant.quantity === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={variant.quantity === 0}
                      >
                        <span className="font-bold text-xs sm:text-sm flex-1 text-left">{variant.name}</span>
                        <span className={`text-xs sm:text-sm font-bold flex-shrink-0 whitespace-nowrap ${variant.quantity === 0 ? "text-red-500" : "text-primary"}`}>
                          {variant.quantity === 0 ? "Agotado" : `Stock: ${variant.quantity}`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock info */}
              {!isOutOfStock && (
                <div className="bg-secondary/10 border border-secondary/30 p-3 text-xs italic text-foreground/70 space-y-1">
                  {product.has_variants ? (
                    <>
                      <p>Stock total disponible: {totalVariantsStock} unidades</p>
                      <p>Stock de variante seleccionada: {currentStock} unidades</p>
                    </>
                  ) : (
                    <p>Stock disponible: {currentStock} unidades</p>
                  )}
                </div>
              )}

              {/* Quantity selector */}
              {!isOutOfStock && (
                <div className="bg-secondary/10 border border-secondary/30 p-4">
                  <p className="text-foreground/60 italic text-xs sm:text-sm uppercase mb-3">
                    Cantidad
                  </p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="bg-secondary/30 text-foreground px-3 py-2 font-bold hover:bg-secondary/50 transition text-sm"
                    >
                      −
                    </button>
                    <span className="text-2xl font-bold flex-1 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(maxAvailable, quantity + 1))}
                      disabled={quantity >= maxAvailable}
                      className="bg-secondary/30 text-foreground px-3 py-2 font-bold hover:bg-secondary/50 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                  {maxAvailable < currentStock && (
                    <p className="text-xs text-foreground/60 italic mt-2">
                      Máximo disponible: {maxAvailable}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions - Fixed at bottom */}
        <div className="border-t border-secondary/20 p-4 sm:p-6 bg-background flex gap-3 sm:gap-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 bg-secondary/30 text-foreground px-4 sm:px-6 py-2 sm:py-3 font-bold italic uppercase text-xs sm:text-base hover:bg-secondary/50 transition-all"
          >
            Cerrar
          </button>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || quantity === 0}
            className="flex-1 bg-primary text-primary-foreground px-4 sm:px-6 py-2 sm:py-3 font-bold italic uppercase text-xs sm:text-base hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isOutOfStock ? "Agotado" : `Agregar ${quantity} al Carrito`}
          </button>
        </div>
      </div>
    </div>
  );
}
