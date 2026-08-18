import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, X, ChevronLeft, ChevronRight, Search, Instagram, Facebook, Music2, MessageCircle, Layers, FileText, HelpCircle } from "lucide-react";
import { getProducts, type Product } from "@/lib/services/products";
import { ProductModal } from "@/components/ProductModal";
import { PRODUCT_CATEGORIES } from "@/lib/constants/categories";
import { useCart, type CartItem } from "@/lib/context/CartContext";

const ITEMS_PER_PAGE = 20;

export default function AllProducts() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { cart, addToCart, removeFromCart, updateQuantity } = useCart();

  useEffect(() => {
    loadProducts();
  }, []);

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

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const getCartQuantity = (productId: string) => {
    return cart.find((item) => item.id === productId)?.quantity || 0;
  };

  const getAvailableStock = (item: CartItem): number => {
    const product = allProducts.find(p => p.id === item.id);
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
    <div className="bg-background text-foreground relative z-10 w-full min-h-screen">
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

      {/* Main Content */}
      <div className="pt-20 sm:pt-28 pb-20 max-w-7xl mx-auto px-4">
        {/* Title */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold italic uppercase mb-2 sm:mb-4">
            Todos Los Productos
          </h1>
          <p className="text-foreground/70 italic text-sm sm:text-base md:text-lg">
            {loadingProducts ? "Cargando..." : `Encontramos ${filteredProducts.length} producto${filteredProducts.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Layout Container - Grid for desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Sidebar Filters - Hidden on mobile, shown on lg screens */}
          <div className="hidden lg:block space-y-6">
            {/* Search */}
            <div className="relative sticky top-28">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/50" size={20} />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                disabled={loadingProducts}
                className="w-full bg-background border border-secondary/30 px-10 py-3 text-sm text-foreground italic placeholder:text-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all disabled:opacity-50"
              />
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold italic uppercase text-primary">Categorías</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setCurrentPage(1);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-bold italic uppercase transition-all ${
                    selectedCategory === null
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/30 text-foreground hover:bg-secondary/50"
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
                    className={`w-full text-left px-4 py-2 text-xs font-bold italic uppercase transition-all ${
                      selectedCategory === category
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary/30 text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Search and Filter */}
          <div className="lg:hidden mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-foreground/50" size={20} />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                disabled={loadingProducts}
                className="w-full bg-background border border-secondary/30 px-10 sm:px-12 py-3 sm:py-4 text-sm sm:text-base text-foreground italic placeholder:text-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all disabled:opacity-50"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setCurrentPage(1);
                }}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold italic uppercase transition-all ${
                  selectedCategory === null
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/30 text-foreground hover:bg-secondary/50"
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
                  className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold italic uppercase transition-all ${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/30 text-foreground hover:bg-secondary/50"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Products Section */}
          <div className="lg:col-span-3">
            {/* Loading State */}
            {loadingProducts ? (
              <div className="text-center py-12">
                <p className="text-foreground/70 italic">Cargando productos...</p>
              </div>
            ) : (
              <>
                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-10 sm:mb-12">
              {paginatedProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-background border border-secondary/30 overflow-hidden hover:border-primary/50 transition-all group cursor-pointer flex flex-col h-full"
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
                      <h4 className="text-xs sm:text-sm font-extrabold italic uppercase mb-1 line-clamp-2">
                        {product.name}
                      </h4>
                      <p className="text-foreground/60 italic text-xs mb-2 line-clamp-2">
                        {product.description}
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-base sm:text-lg font-extrabold text-primary">
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
                          className="bg-primary text-primary-foreground w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center font-extrabold text-lg hover:bg-opacity-90 transition-all"
                        >
                          +
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
        </div>
      </div>

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
    </div>
  );
}
