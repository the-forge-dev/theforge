import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, ChevronRight, Layers, Mountain, BarChart3, Zap } from "lucide-react";
import { getProducts, type Product } from "@/lib/services/products";
import { ProductModal } from "@/components/ProductModal";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroCarousel, type HeroSlide } from "@/components/HeroCarousel";
import { useCart } from "@/lib/context/CartContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useModalBackClose } from "@/hooks/use-modal-back-close";
import { formatItemLabel } from "@/lib/utils/formatItemLabel";
import { formatMoney } from "@/lib/utils/formatMoney";

const HERO_SLIDES: HeroSlide[] = [
  {
    image: "/hero-triptych.webp",
    title: "Built",
    highlight: "Under Pressure",
    subtitle:
      "De la presión forjamos fuerza. Cada repetición, cada gota de sudor, cada momento de duda se convierte en combustible para la transformación.",
    ctaText: "Ver Productos",
    ctaLink: "/productos",
  },
  {
    image: "/hero-squat.webp",
    title: "Fuerza",
    highlight: "Real",
    subtitle: "No estética, sino funcional y mental.",
    ctaText: "Ver Productos",
    ctaLink: "/productos",
  },
  {
    image: "/hero-shaker.webp",
    title: "Recupera",
    highlight: "Con Propósito",
    subtitle:
      "Después del esfuerzo viene la recuperación. Encuentra los suplementos que tu cuerpo necesita para seguir adelante.",
    ctaText: "Ver Productos",
    ctaLink: "/productos",
  },
  {
    image: "/hero-plate-20kg.webp",
    title: "Cada Repetición",
    highlight: "Cuenta",
    subtitle: "La disciplina se construye kilo a kilo, día tras día.",
    ctaText: "Ver Productos",
    ctaLink: "/productos",
  },
];

export default function Index() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart } = useCart();
  const isMobile = useIsMobile();
  useModalBackClose(!!selectedProduct, () => setSelectedProduct(null));
  const heroSlides = isMobile
    ? HERO_SLIDES.filter((slide) => slide.image !== "/hero-triptych.webp")
    : HERO_SLIDES;

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.itemPrice || item.price) * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleWhatsApp = () => {
    const message = cart
      .map((item) => {
        const variantName = item.selectedVariantId
          ? item.variants?.find(v => v.id === item.selectedVariantId)?.name
          : undefined;
        const itemPrice = item.itemPrice || item.price;
        return `- ${formatItemLabel(item.name, variantName)} x${item.quantity} ${formatMoney(itemPrice * item.quantity)}`;
      })
      .join("\n");

    const whatsappMessage = encodeURIComponent(
      `Hola, quiero hacer este pedido:\n\n${message}\n\nTotal: ${formatMoney(total)}`
    );
    
    window.open(
      `https://wa.me/4434806689?text=${whatsappMessage}`,
      "_blank"
    );
  };

  return (
    <div className="bg-background text-foreground relative z-10 w-full">
      <Header cartCount={cartCount} onCartClick={() => setIsCartOpen(!isCartOpen)} />

      {/* Hero Section */}
      <HeroCarousel slides={heroSlides} />


      {/* Values Section: franja "Lo Que Nos Define", sin cards */}
      <section className="border-t border-b border-border/20 py-10 sm:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-secondary text-xs font-semibold not-italic uppercase tracking-[0.25em] text-center mb-6 sm:mb-8">
            Lo Que Nos Define
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/20">
            <div className="flex items-start gap-4 sm:gap-5 py-6 sm:py-0 first:pt-0 last:pb-0 sm:px-6 lg:px-10 first:sm:pl-0 last:sm:pr-0">
              <Mountain size={32} strokeWidth={1.5} className="text-foreground flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold italic uppercase text-foreground text-base sm:text-lg mb-2">
                  Resiliencia
                </h4>
                <p className="text-foreground/70 text-sm sm:text-base leading-relaxed">
                  Capacidad de soportar la presión sin quebrarse.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 sm:gap-5 py-6 sm:py-0 first:pt-0 last:pb-0 sm:px-6 lg:px-10 first:sm:pl-0 last:sm:pr-0">
              <BarChart3 size={32} strokeWidth={1.5} className="text-foreground flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold italic uppercase text-foreground text-base sm:text-lg mb-2">
                  Disciplina
                </h4>
                <p className="text-foreground/70 text-sm sm:text-base leading-relaxed">
                  El fuego que mantiene la forja encendida cuando la motivación se apaga.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 sm:gap-5 py-6 sm:py-0 first:pt-0 last:pb-0 sm:px-6 lg:px-10 first:sm:pl-0 last:sm:pr-0">
              <Zap size={32} strokeWidth={1.5} className="text-foreground flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold italic uppercase text-foreground text-base sm:text-lg mb-2">
                  Fuerza Real
                </h4>
                <p className="text-foreground/70 text-sm sm:text-base leading-relaxed">
                  No estética, sino funcional y mental.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section - Top 3 Bestsellers */}
      <section id="products" className="py-12 sm:py-20 bg-secondary/5 border-t border-secondary/20">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold italic uppercase text-center mb-10 sm:mb-16">
            Productos Más Vendidos
          </h3>

          {loadingProducts ? (
            <div className="text-center py-12">
              <p className="text-foreground/70 italic">Cargando productos...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-10 sm:mb-12">
                {products
                  .filter((p) => p.is_bestseller)
                  .slice(0, 3)
                  .map((product) => (
                    <div
                      key={product.id}
                      className="bg-background border border-secondary/30 overflow-hidden hover:border-primary/50 transition-all group flex flex-col h-full cursor-pointer"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <div className="relative w-full aspect-square overflow-hidden bg-secondary/10 p-6 sm:p-8 flex items-center justify-center">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          draggable="false"
                        />
                        {product.has_variants && (
                          <div className="absolute top-2 right-2 bg-primary/90 backdrop-blur-sm px-2 py-1 rounded flex items-center gap-1 text-xs font-bold italic text-primary-foreground">
                            <Layers size={12} />
                            Variantes
                          </div>
                        )}

                        {/* Vista rápida: aparece al pasar el mouse */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProduct(product);
                          }}
                          className="absolute left-1/2 bottom-4 -translate-x-1/2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all bg-background text-foreground border border-secondary/50 px-4 py-2 text-[10px] sm:text-xs font-bold italic uppercase whitespace-nowrap hover:border-primary/50"
                        >
                          Vista Rápida
                        </button>
                      </div>

                      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between">
                        <div>
                          <p className="text-primary/80 text-[10px] sm:text-xs font-bold uppercase italic mb-1">
                            {product.category}
                          </p>
                          <h4 className="text-sm sm:text-base font-extrabold italic uppercase mb-1 line-clamp-2">
                            {product.name}
                          </h4>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <span className="text-lg sm:text-xl font-extrabold text-[#E63946]">
                            {formatMoney(product.price)}
                          </span>
                          {product.quantity === 0 && !product.has_variants && (
                            <span className="text-xs sm:text-sm font-extrabold text-foreground/50 italic">
                              Agotado
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Ver Todos Button */}
              <div className="text-center">
                <Link
                  to="/productos"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 sm:px-8 py-3 sm:py-4 font-extrabold italic uppercase text-sm sm:text-base md:text-lg hover:bg-opacity-90 transition-all transform hover:scale-105"
                >
                  Ver Todos Los Productos
                  <ChevronRight size={20} />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
          cartCount={cartCount}
          onCartClick={() => setIsCartOpen(true)}
        />
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div
            className="bg-background border-l border-secondary/30 w-full sm:w-96 h-screen flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cart Header */}
            <div className="border-b border-secondary/20 p-4 sm:p-6 flex justify-between items-center gap-3">
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
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-foreground hover:text-primary transition flex-shrink-0"
              >
                <X size={24} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {cart.length === 0 ? (
                <p className="text-foreground/70 italic text-center py-8 text-sm sm:text-base">
                  Tu carrito está vacío
                </p>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="border border-secondary/30 p-3 sm:p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold italic uppercase text-xs sm:text-sm">
                          {item.name}
                          {item.selectedVariantId && (
                            <span className="text-foreground/70">
                              {" · "}{item.variants?.find(v => v.id === item.selectedVariantId)?.name}
                            </span>
                          )}
                        </h4>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id, item.selectedVariantId)}
                        className="text-primary hover:text-primary/70 transition"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="flex justify-between items-center gap-2">
                      <span className="text-foreground/70 italic text-xs sm:text-sm">
                        {formatMoney(item.itemPrice || item.price)}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedVariantId)}
                          className="bg-secondary/30 text-foreground px-2 py-1 font-bold hover:bg-secondary/50 transition text-xs"
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-bold text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedVariantId)}
                          className="bg-secondary/30 text-foreground px-2 py-1 font-bold hover:bg-secondary/50 transition text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-secondary/20 pt-2 space-y-2">
                      <p className="text-primary font-bold italic text-sm">
                        Subtotal: {formatMoney((item.itemPrice || item.price) * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="border-t border-secondary/20 p-4 sm:p-6 space-y-4">
                <div className="bg-secondary/10 p-4 border border-secondary/30">
                  <p className="text-foreground/70 italic text-xs sm:text-sm mb-2">Total</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-primary">
                    {formatMoney(total)}
                  </p>
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
