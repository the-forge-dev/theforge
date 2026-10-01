import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { X, ChevronLeft, ChevronRight, SlidersHorizontal, Flame, Star, Check } from "lucide-react";
import { getProducts, type Product } from "@/lib/services/products";
import { ProductModal } from "@/components/ProductModal";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PRODUCT_CATEGORIES } from "@/lib/constants/categories";
import { useCart } from "@/lib/context/CartContext";
import { useModalBackClose } from "@/hooks/use-modal-back-close";
import { formatItemLabel } from "@/lib/utils/formatItemLabel";
import { formatMoney } from "@/lib/utils/formatMoney";

const ITEMS_PER_PAGE = 20;

export default function AllProducts() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart } = useCart();
  useModalBackClose(!!selectedProduct, () => setSelectedProduct(null));
  const [searchParams] = useSearchParams();

  useEffect(() => {
    loadProducts();
  }, []);

  // Al cambiar de página, el scroll se quedaba donde estaba (ej. hasta abajo
  // en la página 1), dejando al usuario en medio de la nueva página.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  // El buscador del navbar navega a /productos?q=... — lo tomamos de la URL
  // en vez de duplicar la lógica de búsqueda, que ya vive en filteredProducts.
  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
    setCurrentPage(1);
  }, [searchParams]);

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const data = await getProducts();
      setAllProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const matches = allProducts.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    // Los más vendidos van primero (orden estable: el resto conserva su orden original).
    return [...matches].sort((a, b) => Number(b.is_bestseller) - Number(a.is_bestseller));
  }, [searchQuery, selectedCategory, allProducts]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const getBadge = (product: Product): { label: string; className: string; icon?: boolean } | null => {
    if (product.is_bestseller) {
      return { label: "Más vendido", className: "bg-[#C9A227] text-[#23282D]", icon: true };
    }
    if (product.has_variants) {
      return { label: "Variantes", className: "bg-primary text-primary-foreground" };
    }
    return null;
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
    <div className="bg-surface-page text-foreground relative z-10 w-full min-h-screen">
      <Header cartCount={cartCount} onCartClick={() => setIsCartOpen(!isCartOpen)} />

      {/* Hero / banner de la sección de productos: la barra de navegación (fixed, arriba)
          queda sólida sobre el fondo de la página; el banner empieza justo debajo, sin que
          la imagen se asome por detrás del header. */}
      <section className="relative w-full h-[210px] sm:h-[225px] md:h-[250px] pt-14 sm:pt-16 overflow-hidden bg-surface-page">
        <div
          className="absolute inset-x-0 top-14 sm:top-[77px] bottom-0"
          style={{
            backgroundImage: "url('/products-hero-bg.webp')",
            backgroundSize: "cover",
            backgroundPosition: "right 38%",
          }}
        />
        {/* Desvanecido horizontal: la foto "emerge" del fondo sólido del hero (misma
            variable --surface-page del tema) en vez de un corte recto. */}
        <div
          className="absolute inset-x-0 top-14 sm:top-[77px] bottom-0"
          style={{
            backgroundImage: `linear-gradient(
              90deg,
              hsl(var(--surface-page)) 0%,
              hsl(var(--surface-page)) 45%,
              hsl(var(--surface-page) / 0.55) 60%,
              hsl(var(--surface-page) / 0.12) 75%,
              transparent 88%
            )`,
          }}
        />
        {/* Desvanecido vertical: la foto también se funde hacia abajo con el fondo,
            para que el hero se sienta continuo con la toolbar en vez de un
            rectángulo con un borde inferior duro. */}
        <div
          className="absolute inset-x-0 top-14 sm:top-[77px] bottom-0"
          style={{
            backgroundImage: `linear-gradient(
              to bottom,
              transparent 0%,
              transparent 65%,
              hsl(var(--surface-page) / 0.35) 78%,
              hsl(var(--surface-page) / 0.8) 90%,
              hsl(var(--surface-page)) 100%
            )`,
          }}
        />
        <div className="relative z-10 h-full max-w-[1920px] mx-auto px-6 lg:px-[60px] flex flex-col justify-center pt-6 sm:pt-8">
          <p className="text-primary font-semibold italic uppercase text-xs sm:text-sm tracking-[0.2em] mb-4">
            Suplementos
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[57px] font-extrabold italic uppercase leading-none mb-3 drop-shadow-lg">
            Todos Los Productos
          </h1>
          <p className="text-foreground/80 italic text-xs sm:text-sm md:text-base leading-relaxed drop-shadow-md">
            Potencia tu rendimiento. Encuentra los mejores suplementos, de las mejores marcas.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="pb-20 max-w-[1920px] mx-auto px-6 lg:px-[60px]">
        {/* Barra de filtros: categorías, orden y vista */}
        <div className="mt-[10px] mb-4 space-y-3">
          {/* Fila 1: categorías (una sola línea, sin wrap) */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
            {/* Mobile: las categorías no caben en una fila, Filtrar abre un panel */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="sm:hidden flex-shrink-0 flex items-center justify-center gap-2.5 h-12 w-full px-4 rounded border border-surface-border/20 text-foreground/80 text-sm font-semibold not-italic uppercase hover:border-primary/50 transition-colors"
            >
              <SlidersHorizontal size={18} />
              {selectedCategory ? `Filtrar: ${selectedCategory}` : "Filtrar"}
            </button>

            {/* Tablet/Desktop: solo categorías en línea (sin CTA "Filtrar", no aportaba nada ahí) */}
            <div className="hidden sm:flex items-center gap-6 overflow-x-auto flex-1 min-w-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setCurrentPage(1);
                  }}
                  className={`flex-shrink-0 h-11 px-4 rounded text-sm font-medium not-italic uppercase transition-all ${
                    selectedCategory === null
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-card text-foreground hover:bg-surface-elevated"
                  }`}
                >
                  Todas
                </button>
                {PRODUCT_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setCurrentPage(1);
                    }}
                    className={`flex-shrink-0 h-11 px-4 rounded text-sm font-medium not-italic uppercase transition-all whitespace-nowrap ${
                      selectedCategory === category
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface-card text-foreground hover:bg-surface-elevated"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Products Section */}
        {loadingProducts ? (
          <div className="text-center py-12">
            <p className="text-foreground/70 italic">Cargando productos...</p>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10 sm:mb-12">
              {paginatedProducts.map((product) => {
                const badge = getBadge(product);
                const isSoldOut = product.quantity === 0 && !product.has_variants;
                const hasRating = product.rating != null && product.reviewCount != null;

                return (
                  <div
                    key={product.id}
                    className="rounded bg-surface-card border border-surface-border/10 overflow-hidden hover:border-primary/40 transition-colors duration-200 group cursor-pointer flex flex-col h-full"
                    onClick={() => setSelectedProduct(product)}
                  >
                    {/* Zona de imagen: superficie base de la card */}
                    <div className="relative w-full h-52 sm:h-52 md:h-60 lg:h-72 xl:h-[310px] overflow-hidden bg-surface-card px-5 pt-9 pb-4 sm:py-4 flex items-center justify-center">
                      {badge && (
                        <div
                          className={`absolute top-3 left-3 inline-flex items-center gap-1 h-5 px-2 sm:h-7 sm:px-3 rounded-[6px] text-[10px] sm:text-xs font-semibold not-italic uppercase ${badge.className}`}
                        >
                          {badge.icon && <Flame size={10} className="animate-flame sm:hidden" />}
                          {badge.icon && <Flame size={12} className="animate-flame hidden sm:block" />}
                          {badge.label}
                        </div>
                      )}

                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="max-w-full max-h-full object-contain group-hover:scale-[1.02] transition-transform duration-200"
                        draggable="false"
                      />
                    </div>

                    {/* Zona de info: tono apenas más claro que la imagen, para separar sin marcar */}
                    <div className="bg-surface-elevated/25 p-[18px] flex flex-col flex-1">
                      <p className="text-secondary text-xs font-medium uppercase tracking-[0.12em] mb-2">
                        {product.category}
                      </p>
                      <h4 className="text-[15px] sm:text-base font-bold not-italic uppercase text-foreground leading-tight mb-3 line-clamp-2 h-10 overflow-hidden">
                        {product.name}
                      </h4>

                      {hasRating && (
                        <div className="flex items-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              size={13}
                              className={i <= Math.round(product.rating!) ? "fill-primary text-primary" : "text-secondary/30"}
                            />
                          ))}
                          <span className="text-xs text-secondary ml-1">({product.reviewCount})</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xl sm:text-[22px] font-extrabold text-[#E63946]">
                          {formatMoney(product.price)}
                        </span>
                        {isSoldOut && (
                          <span className="text-xs sm:text-sm font-bold text-foreground/50 not-italic">
                            Agotado
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProduct(product);
                        }}
                        className="mt-auto w-full flex items-center justify-center gap-2 h-11 bg-primary text-primary-foreground font-bold not-italic uppercase text-[13px] opacity-100 pointer-events-auto sm:opacity-0 sm:pointer-events-none sm:group-hover:opacity-100 sm:group-hover:pointer-events-auto transition-opacity duration-200 hover:bg-opacity-90"
                      >
                        Vista Rápida
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {paginatedProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-foreground/70 italic text-sm sm:text-base md:text-lg">
                  {searchQuery ? "No encontramos productos que coincidan con tu búsqueda." : "No hay productos disponibles."}
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-row justify-center items-center gap-2 sm:gap-4">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 sm:gap-2 bg-primary text-primary-foreground px-2 sm:px-3 py-1 sm:py-2 font-bold italic text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-90 transition-all"
                >
                  <ChevronLeft size={14} />
                  <span className="hidden sm:inline">Anterior</span>
                </button>

                <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto max-w-[140px] sm:max-w-none">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-2 sm:px-3 py-1 sm:py-2 font-bold italic text-xs sm:text-sm transition-all ${
                        currentPage === page
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary/20 text-foreground hover:bg-secondary/40"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 sm:gap-2 bg-primary text-primary-foreground px-2 sm:px-3 py-1 sm:py-2 font-bold italic text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-90 transition-all"
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

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
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={() => setIsCartOpen(false)}>
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

      {/* Panel de filtros (mobile): categorías, ya que ahí no caben en una fila */}
      {isFilterOpen && (
        <div
          className="sm:hidden fixed inset-0 bg-black/50 z-50 flex items-end"
          onClick={() => setIsFilterOpen(false)}
        >
          <div
            className="bg-surface-page border-t border-surface-border/10 w-full max-h-[75vh] rounded-t-lg flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-surface-border/10 p-4 flex justify-between items-center flex-shrink-0">
              <h2 className="text-lg font-extrabold italic uppercase">Filtrar por categoría</h2>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="text-foreground hover:text-primary transition"
                aria-label="Cerrar"
              >
                <X size={22} />
              </button>
            </div>
            <div className="overflow-y-auto p-2">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setCurrentPage(1);
                  setIsFilterOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded text-sm font-medium not-italic uppercase transition-colors ${
                  selectedCategory === null ? "text-primary" : "text-foreground hover:bg-surface-card"
                }`}
              >
                Todas
                {selectedCategory === null && <Check size={18} />}
              </button>
              {PRODUCT_CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setCurrentPage(1);
                    setIsFilterOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded text-sm font-medium not-italic uppercase transition-colors ${
                    selectedCategory === category ? "text-primary" : "text-foreground hover:bg-surface-card"
                  }`}
                >
                  {category}
                  {selectedCategory === category && <Check size={18} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
