import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { X, ChevronLeft, ChevronRight, ChevronDown, Heart, ShoppingCart, LayoutGrid, List as ListIcon, SlidersHorizontal, Flame, Star } from "lucide-react";
import { getProducts, type Product } from "@/lib/services/products";
import { ProductModal } from "@/components/ProductModal";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PRODUCT_CATEGORIES } from "@/lib/constants/categories";
import { useCart, type CartItem } from "@/lib/context/CartContext";
import { MAX_UNITS_PER_PRODUCT } from "@/lib/constants/cart";
import { useFavorites } from "@/hooks/use-favorites";

const ITEMS_PER_PAGE = 20;

type SortOption = "relevancia" | "precio-asc" | "precio-desc" | "nombre-asc";

const SORT_LABELS: Record<SortOption, string> = {
  relevancia: "Relevancia",
  "precio-asc": "Precio: menor a mayor",
  "precio-desc": "Precio: mayor a menor",
  "nombre-asc": "Nombre A-Z",
};

export default function AllProducts() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("relevancia");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { cart, addToCart, removeFromCart, updateQuantity } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    loadProducts();
  }, []);

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
    return allProducts.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, allProducts]);

  const sortedProducts = useMemo(() => {
    const arr = [...filteredProducts];
    switch (sortBy) {
      case "precio-asc":
        arr.sort((a, b) => a.price - b.price);
        break;
      case "precio-desc":
        arr.sort((a, b) => b.price - a.price);
        break;
      case "nombre-asc":
        arr.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    return arr;
  }, [filteredProducts, sortBy]);

  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = sortedProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (product.has_variants) {
      // Con variantes hace falta elegir sabor/tamaño, así que abrimos la ficha
      setSelectedProduct(product);
      return;
    }
    addToCart(product);
  };

  const getBadge = (product: Product): { label: string; className: string; icon?: boolean } | null => {
    if (product.is_bestseller) {
      return { label: "Más vendido", className: "bg-amber-500 text-black", icon: true };
    }
    if (product.has_variants) {
      return { label: "Variantes", className: "bg-primary text-primary-foreground" };
    }
    return null;
  };

  // $949, $1,029 — formato de miles sin alterar el valor real del precio.
  const formatPrice = (price: number) =>
    `$${price.toLocaleString("es-MX", { maximumFractionDigits: 2 })}`;

  const getCartQuantity = (productId: string) => {
    return cart.find((item) => item.id === productId)?.quantity || 0;
  };

  const getAvailableStock = (item: CartItem): number => {
    const product = allProducts.find(p => p.id === item.id);
    if (!product) return 0;

    const stock = item.selectedVariantId && product.variants
      ? (product.variants.find(v => v.id === item.selectedVariantId)?.quantity ?? 0)
      : product.quantity;
    return Math.min(stock, MAX_UNITS_PER_PRODUCT);
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
          <p className="text-foreground/80 italic text-xs sm:text-sm md:text-base max-w-[490px] leading-relaxed drop-shadow-md">
            Potencia tu rendimiento. Encuentra los mejores suplementos, de las mejores marcas.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="pb-20 max-w-[1920px] mx-auto px-6 lg:px-[60px]">
        {/* Barra de filtros: categorías, orden y vista */}
        <div className="mt-[10px] mb-4 space-y-3">
          {/* Fila 1: Filtrar + categorías (una sola línea, sin wrap) + Ordenar pegado a la derecha */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
            <div className="flex items-center gap-6 overflow-x-auto flex-1 min-w-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex-shrink-0 flex items-center justify-center gap-2.5 h-12 w-[155px] px-4 rounded border border-surface-border/20 text-foreground/80 text-sm font-semibold not-italic uppercase">
                <SlidersHorizontal size={18} />
                Filtrar
              </div>
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

            {/* Ordenar por: pegado al extremo derecho, nunca se encoge */}
            <div className="relative flex-shrink-0 w-full sm:w-auto sm:ml-2">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="w-full sm:w-[220px] flex items-center justify-between gap-3 h-12 rounded bg-surface-card border border-surface-border/20 px-4 text-sm not-italic uppercase hover:border-primary/50 transition-all whitespace-nowrap"
              >
                <span>
                  <span className="font-medium">Ordenar: </span>
                  <span className="font-semibold">{SORT_LABELS[sortBy]}</span>
                </span>
                <ChevronDown size={16} className={`flex-shrink-0 transition-transform ${isSortOpen ? "rotate-180" : ""}`} />
              </button>
              {isSortOpen && (
                <div className="absolute right-0 mt-1 w-64 bg-surface-card border border-surface-border/20 rounded z-10">
                  {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSortBy(option);
                        setIsSortOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-4 py-3 text-xs sm:text-sm font-medium not-italic uppercase transition-all ${
                        sortBy === option
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "hover:bg-surface-elevated"
                      }`}
                    >
                      {SORT_LABELS[option]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Fila 2: vista, alineada al extremo derecho debajo de Ordenar */}
          <div className="flex items-center justify-end">
            {/* Vista: cuadrícula / lista */}
            <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setViewMode("grid")}
                aria-label="Vista de cuadrícula"
                className={`flex items-center justify-center w-9 h-9 rounded transition-all ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-surface-card text-foreground/60 hover:text-foreground"}`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                aria-label="Vista de lista"
                className={`flex items-center justify-center w-9 h-9 rounded transition-all ${viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-surface-card text-foreground/60 hover:text-foreground"}`}
              >
                <ListIcon size={16} />
              </button>
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
            {/* Products Grid / List */}
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10 sm:mb-12"
                  : "flex flex-col gap-3 sm:gap-4 mb-10 sm:mb-12"
              }
            >
              {paginatedProducts.map((product) => {
                const badge = getBadge(product);
                const isSoldOut = product.quantity === 0 && !product.has_variants;

                if (viewMode === "list") {
                  return (
                    <div
                      key={product.id}
                      className="rounded bg-surface-card border border-surface-border/10 hover:border-primary/50 hover:bg-surface-elevated transition-all group cursor-pointer flex items-center gap-4 p-3 sm:p-4"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <div className="relative w-20 h-20 sm:w-28 sm:h-28 flex-shrink-0 bg-secondary/10 flex items-center justify-center overflow-hidden">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          draggable="false"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {badge && (
                            <span className={`px-2 py-0.5 text-[10px] font-bold italic uppercase ${badge.className}`}>
                              {badge.label}
                            </span>
                          )}
                          <p className="text-primary/80 text-[10px] sm:text-xs font-bold uppercase italic">
                            {product.category}
                          </p>
                        </div>
                        <h4 className="text-xs sm:text-sm font-extrabold italic uppercase mb-1 line-clamp-1">
                          {product.name}
                        </h4>
                        <span className="text-base sm:text-lg font-extrabold text-primary">
                          ${product.price}
                        </span>
                        {isSoldOut && (
                          <span className="ml-2 text-xs sm:text-sm font-extrabold text-foreground/50 italic">
                            Agotado
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(product.id);
                          }}
                          aria-label="Favorito"
                          className="p-2 text-foreground/60 hover:text-primary transition"
                        >
                          <Heart size={18} className={isFavorite(product.id) ? "fill-primary text-primary" : ""} />
                        </button>
                        <button
                          onClick={(e) => handleQuickAdd(e, product)}
                          disabled={isSoldOut}
                          className="hidden sm:flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 font-extrabold italic uppercase text-xs hover:bg-opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <ShoppingCart size={14} />
                          Agregar
                        </button>
                      </div>
                    </div>
                  );
                }

                const hasRating = product.rating != null && product.reviewCount != null;

                return (
                  <div
                    key={product.id}
                    className="rounded bg-surface-card border border-surface-border/10 overflow-hidden hover:border-primary/40 transition-colors duration-200 group cursor-pointer flex flex-col h-full"
                    onClick={() => setSelectedProduct(product)}
                  >
                    {/* Zona de imagen: superficie base de la card */}
                    <div className="relative w-full h-44 sm:h-52 md:h-60 lg:h-72 xl:h-[310px] overflow-hidden bg-surface-card px-5 py-4 flex items-center justify-center">
                      {badge && (
                        <div
                          className={`absolute top-3 left-3 inline-flex items-center gap-1 h-7 px-3 rounded-[6px] text-xs font-semibold not-italic uppercase ${badge.className}`}
                        >
                          {badge.icon && <Flame size={12} />}
                          {badge.label}
                        </div>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(product.id);
                        }}
                        aria-label="Favorito"
                        className="absolute top-3 right-3 flex items-center justify-center w-9 h-9 rounded bg-surface-page/40 text-foreground/90 hover:bg-surface-page/70 hover:text-primary transition-colors"
                      >
                        <Heart size={16} className={isFavorite(product.id) ? "fill-primary text-primary" : ""} />
                      </button>

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
                      <h4 className="text-[15px] sm:text-base font-bold not-italic uppercase text-foreground leading-tight mb-3 line-clamp-2 min-h-[40px]">
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
                        <span className="text-xl sm:text-[22px] font-extrabold text-primary">
                          {formatPrice(product.price)}
                        </span>
                        {isSoldOut && (
                          <span className="text-xs sm:text-sm font-bold text-foreground/50 not-italic">
                            Agotado
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => handleQuickAdd(e, product)}
                        disabled={isSoldOut}
                        className="mt-auto w-full flex items-center justify-center gap-2 h-11 bg-primary text-primary-foreground font-bold not-italic uppercase text-[13px] hover:bg-opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <ShoppingCart size={16} />
                        Agregar al Carrito
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
              <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 sm:gap-2 bg-primary text-primary-foreground px-3 sm:px-4 py-2 font-bold italic text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-90 transition-all"
                >
                  <ChevronLeft size={16} />
                  <span className="hidden sm:inline">Anterior</span>
                </button>

                <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto max-w-xs sm:max-w-none">
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
                  className="flex items-center gap-1 sm:gap-2 bg-primary text-primary-foreground px-3 sm:px-4 py-2 font-bold italic text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-90 transition-all"
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <ChevronRight size={16} />
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
          cartQuantity={getCartQuantity(selectedProduct.id)}
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
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedVariantId, allProducts)}
                          className="bg-secondary/30 text-foreground px-2 py-1 font-bold hover:bg-secondary/50 transition text-xs"
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-bold text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedVariantId, allProducts)}
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
                          Cantidad máxima alcanzada
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

      <Footer />
    </div>
  );
}
