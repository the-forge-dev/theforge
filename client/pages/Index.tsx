import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, X, ChevronRight, Instagram, Facebook, Music2, MessageCircle, Layers, FileText, HelpCircle } from "lucide-react";
import { getProducts, type Product } from "@/lib/services/products";
import { ProductModal } from "@/components/ProductModal";
import { useCart, type CartItem } from "@/lib/context/CartContext";

export default function Index() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { cart, addToCart, removeFromCart, updateQuantity } = useCart();

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

  const getCartQuantity = (productId: string) => {
    return cart.find((item) => item.id === productId)?.quantity || 0;
  };

  const getAvailableStock = (item: CartItem): number => {
    const product = products.find(p => p.id === item.id);
    if (!product) return 0;

    if (item.selectedVariantId && product.variants) {
      return product.variants.find(v => v.id === item.selectedVariantId)?.quantity ?? 0;
    }
    return product.quantity;
  };

  const total = cart.reduce((sum, item) => sum + (item.itemPrice || item.price) * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleWhatsApp = () => {
    const message = cart
      .map((item) => {
        const variantName = item.selectedVariantId
          ? ` (${item.variants?.find(v => v.id === item.selectedVariantId)?.name})`
          : "";
        const itemPrice = item.itemPrice || item.price;
        return `- ${item.name}${variantName} x${item.quantity} $${(itemPrice * item.quantity).toFixed(2)}`;
      })
      .join("\n");
    
    const whatsappMessage = encodeURIComponent(
      `Hola, quiero hacer este pedido:\n\n${message}\n\nTotal: $${total.toFixed(2)}`
    );
    
    window.open(
      `https://wa.me/4434806689?text=${whatsappMessage}`,
      "_blank"
    );
  };

  return (
    <div className="bg-background text-foreground relative z-10 w-full">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur border-b border-secondary/30">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer">
            <img
              src="/logo.png"
              alt="THE FORGE"
              className="h-8 sm:h-10 w-auto"
              draggable="false"
              style={{ pointerEvents: 'none' }}
            />
          </Link>

          <button
            onClick={() => setIsCartOpen(!isCartOpen)}
            className="relative flex items-center gap-2 bg-primary text-primary-foreground px-3 sm:px-4 py-2 font-bold italic hover:bg-opacity-90 transition-all text-sm sm:text-base"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-secondary text-foreground w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="min-h-screen flex items-center justify-center pt-20 overflow-hidden relative bg-background"
        style={{
          backgroundImage: "url('/hero-banner.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: window.innerWidth >= 768 ? "fixed" : "scroll"
        }}
      >
        {/* Background overlay with gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/60 opacity-85"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background opacity-70"></div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <div className="mb-8 sm:mb-12 flex justify-center" style={{ pointerEvents: 'none', userSelect: 'none', WebkitUserDrag: 'none' }}>
            <img
              src="/logo.png"
              alt="THE FORGE Logo"
              className="h-24 sm:h-32 md:h-40 lg:h-56 w-auto drop-shadow-2xl"
              draggable="false"
            />
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold italic uppercase mb-6 sm:mb-8 leading-tight drop-shadow-lg">
            Built
            <br />
            <span className="text-primary drop-shadow-lg">Under Pressure</span>
          </h2>

          <p className="text-sm sm:text-base md:text-lg lg:text-2xl text-foreground/90 mb-8 sm:mb-12 max-w-3xl mx-auto italic font-medium drop-shadow-md">
            De la presión forjamos fuerza. Cada repetición, cada gota de sudor, cada momento de duda se convierte en combustible para la transformación.
          </p>

          <Link
            to="/productos"
            className="bg-primary text-primary-foreground px-6 sm:px-10 py-3 sm:py-5 font-extrabold italic uppercase text-sm sm:text-base md:text-lg lg:text-xl hover:bg-opacity-90 transition-all transform hover:scale-110 inline-block shadow-lg border-2 border-primary/50"
          >
            Ver Productos
          </Link>
        </div>
      </section>


      {/* Values Section */}
      <section className="py-12 sm:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold italic uppercase text-center mb-10 sm:mb-16">
            Valores
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <div className="border border-primary/30 p-6 sm:p-8 bg-background/50">
              <h4 className="text-lg sm:text-xl md:text-2xl font-extrabold italic text-primary uppercase mb-3">
                Resiliencia
              </h4>
              <p className="text-sm sm:text-base text-foreground/80 italic">
                Capacidad de soportar la presión sin quebrarse.
              </p>
            </div>

            <div className="border border-primary/30 p-6 sm:p-8 bg-background/50">
              <h4 className="text-lg sm:text-xl md:text-2xl font-extrabold italic text-primary uppercase mb-3">
                Disciplina
              </h4>
              <p className="text-sm sm:text-base text-foreground/80 italic">
                El fuego que mantiene la forja encendida cuando la motivación se apaga.
              </p>
            </div>

            <div className="border border-primary/30 p-6 sm:p-8 bg-background/50">
              <h4 className="text-lg sm:text-xl md:text-2xl font-extrabold italic text-primary uppercase mb-3">
                Fuerza Real
              </h4>
              <p className="text-sm sm:text-base text-foreground/80 italic">
                No estética, sino funcional y mental.
              </p>
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
                      <div className="relative w-full aspect-square overflow-hidden bg-secondary/10">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          draggable="false"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-30"></div>
                        {product.has_variants && (
                          <div className="absolute top-2 right-2 bg-primary/90 backdrop-blur-sm px-2 py-1 rounded flex items-center gap-1 text-xs font-bold italic text-primary-foreground">
                            <Layers size={12} />
                            Variantes
                          </div>
                        )}
                      </div>

                      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between">
                        <div>
                          <h4 className="text-sm sm:text-base font-extrabold italic uppercase mb-1 line-clamp-2">
                            {product.name}
                          </h4>
                          <p className="text-foreground/70 italic text-xs mb-2 line-clamp-2">
                            {product.description}
                          </p>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <span className="text-lg sm:text-xl font-extrabold text-primary">
                            ${product.price}
                          </span>
                          {product.quantity === 0 && !product.has_variants ? (
                            <span className="text-xs sm:text-sm font-extrabold text-foreground/50 italic">
                              Agotado
                            </span>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (product.has_variants) {
                                  setSelectedProduct(product);
                                } else {
                                  addToCart(product);
                                }
                              }}
                              className="bg-primary text-primary-foreground w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-extrabold text-lg hover:bg-opacity-90 transition-all"
                            >
                              +
                            </button>
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

      {/* Footer */}
      <footer className="bg-background border-t border-secondary/20 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-4">
          {/* Social Links */}
          <div className="flex justify-center items-center gap-4">
            <a
              href="https://www.instagram.com/theforgemx?igsh=MXJkdWtoejB3NXpjZQ=="
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/70 hover:text-primary transition"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
            <a
              href="https://www.facebook.com/share/1ADFHj1jFi/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/70 hover:text-primary transition"
              aria-label="Facebook"
            >
              <Facebook size={20} />
            </a>
            <a
              href="https://www.tiktok.com/@theforgemx?_r=1&_t=ZS-97DuWxpR04a"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/70 hover:text-primary transition"
              aria-label="TikTok"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.1 1.82 2.89 2.89 0 0 1 2.31-4.64 2.86 2.86 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.54-.05z"/>
              </svg>
            </a>
            <a
              href="https://wa.me/4434806689?text=Hola%20THE%20FORGE%20Quiero%20hacer%20un%20pedido"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/70 hover:text-primary transition"
              aria-label="WhatsApp"
            >
              <MessageCircle size={20} />
            </a>
          </div>

          {/* Policy and FAQ Links */}
          <div className="flex justify-center items-center gap-4 mb-4">
            <Link
              to="/politicas"
              className="flex items-center gap-2 text-foreground/70 hover:text-primary transition text-xs sm:text-sm font-bold italic"
            >
              <FileText size={16} />
              Política de Privacidad
            </Link>
            <div className="w-px h-4 bg-secondary/30"></div>
            <Link
              to="/faq"
              className="flex items-center gap-2 text-foreground/70 hover:text-primary transition text-xs sm:text-sm font-bold italic"
            >
              <HelpCircle size={16} />
              Preguntas Frecuentes
            </Link>
          </div>

          <p className="text-xs sm:text-sm text-foreground/70 italic">
            The Forge © 2026 / Built Under Pressure
          </p>
        </div>
      </footer>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
          cartQuantity={getCartQuantity(selectedProduct.id)}
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
            <div className="border-b border-secondary/20 p-4 sm:p-6 flex justify-between items-center">
              <h2 className="text-xl sm:text-2xl font-extrabold italic uppercase">Tu Carrito</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-foreground hover:text-primary transition"
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
                              {" "}({item.variants?.find(v => v.id === item.selectedVariantId)?.name})
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
                        ${(item.itemPrice || item.price).toFixed(2)}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedVariantId, products)}
                          className="bg-secondary/30 text-foreground px-2 py-1 font-bold hover:bg-secondary/50 transition text-xs"
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-bold text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedVariantId, products)}
                          disabled={item.quantity >= getAvailableStock(item)}
                          className="bg-secondary/30 text-foreground px-2 py-1 font-bold hover:bg-secondary/50 transition text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-secondary/20 pt-2 space-y-2">
                      <p className="text-primary font-bold italic text-sm">
                        Subtotal: ${((item.itemPrice || item.price) * item.quantity).toFixed(2)}
                      </p>
                      {item.quantity >= getAvailableStock(item) && (
                        <p className="text-xs text-red-500 italic font-bold">
                          Límite de stock alcanzado
                        </p>
                      )}
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
                    ${total.toFixed(2)}
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
