import { useState, useEffect, type ReactNode } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { Product } from "@/lib/services/products";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { parseDescription } from "@/lib/utils/parseProductDescription";
import { formatItemLabel } from "@/lib/utils/formatItemLabel";
import { useToast } from "@/hooks/use-toast";

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, variant?: string) => void;
  cartCount: number;
  onCartClick: () => void;
}

const MARKDOWN_COMPONENTS = {
  p: ({ children }: { children?: ReactNode }) => <p className="mb-2">{children}</p>,
  ul: ({ children }: { children?: ReactNode }) => <ul className="list-disc list-inside mb-2 ml-4">{children}</ul>,
  ol: ({ children }: { children?: ReactNode }) => <ol className="list-decimal list-inside mb-2 ml-4">{children}</ol>,
  li: ({ children }: { children?: ReactNode }) => <li className="mb-1">{children}</li>,
  strong: ({ children }: { children?: ReactNode }) => <strong className="font-bold">{children}</strong>,
  em: ({ children }: { children?: ReactNode }) => <em className="italic">{children}</em>,
};

interface AccordionRowProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

function AccordionRow({ title, isOpen, onToggle, children }: AccordionRowProps) {
  return (
    <div className="border-t border-secondary/20 pt-2">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3 text-left"
      >
        <span className="font-bold italic uppercase text-sm sm:text-base">{title}</span>
        <ChevronDown
          size={20}
          className={`flex-shrink-0 text-primary transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="pb-4 text-sm sm:text-base italic text-foreground/80 prose prose-sm prose-invert max-w-none">
          {children}
        </div>
      )}
    </div>
  );
}

export function ProductModal({ product, onClose, onAddToCart, cartCount, onCartClick }: ProductModalProps) {
  const { toast } = useToast();
  const [selectedVariant, setSelectedVariant] = useState<string | null>(
    product.has_variants && product.variants?.length > 0
      ? (product.variants.find(v => v.quantity > 0)?.id || product.variants[0].id)
      : null
  );
  const [quantity, setQuantity] = useState(1);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isHowToUseOpen, setIsHowToUseOpen] = useState(false);
  const [isPerServingOpen, setIsPerServingOpen] = useState(false);
  const [isNutritionOpen, setIsNutritionOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    // Al cambiar de variante, siempre mostrar la primera foto de esa variante
    setPhotoIndex(0);
  }, [selectedVariant]);

  useEffect(() => {
    // Desactivar scroll de la página mientras el modal está abierto
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const getAvailableStock = () => {
    if (product.has_variants && selectedVariant) {
      const variant = product.variants?.find(v => v.id === selectedVariant);
      return variant?.quantity ?? 0;
    }
    return product.quantity;
  };

  const getPrice = () => {
    if (product.has_variants && selectedVariant) {
      const variant = product.variants?.find(v => v.id === selectedVariant);
      return variant?.price ?? product.price;
    }
    return product.price;
  };

  // Todas las fotos disponibles para lo que está seleccionado ahora mismo
  // (si la variante tiene varias fotos propias, se pueden recorrer con photoIndex).
  const getCurrentImages = () => {
    if (product.has_variants && selectedVariant) {
      const variant = product.variants?.find(v => v.id === selectedVariant);
      if (variant?.image_urls && variant.image_urls.length > 0) {
        return variant.image_urls;
      }
      if (variant?.image_url) {
        return [variant.image_url];
      }
    }
    return product.image_url ? [product.image_url] : [];
  };

  const currentImages = getCurrentImages();
  const getImageUrl = () => currentImages[photoIndex] || currentImages[0] || product.image_url;

  const currentStock = getAvailableStock();
  const currentPrice = getPrice();
  const isOutOfStock = currentStock === 0;

  const { main: mainDescription, howToUse, perServing, nutritionFactsUrl: descriptionNutritionFactsUrl } = product.description
    ? parseDescription(product.description)
    : { main: "", howToUse: undefined, perServing: undefined, nutritionFactsUrl: undefined };

  // La tabla nutrimental puede variar por sabor: si la variante seleccionada tiene
  // la suya, se usa esa; si no, se usa la del producto (parseada de la descripción).
  const selectedVariantData = product.has_variants
    ? product.variants?.find(v => v.id === selectedVariant)
    : undefined;
  const nutritionFactsUrl = selectedVariantData?.nutrition_facts_url || descriptionNutritionFactsUrl;

  // Miniaturas: solo variantes con imagen propia
  const thumbnails = product.has_variants
    ? (product.variants ?? []).filter(v => v.image_url)
    : [];

  const selectVariant = (id: string) => {
    setSelectedVariant(id);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product, selectedVariant || undefined);
    }
    const variantName = product.variants?.find(v => v.id === selectedVariant)?.name;
    toast({
      title: "Agregado al carrito",
      description: `${formatItemLabel(product.name, variantName)} se agregó correctamente.`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      {/* Mismo header fijo del sitio */}
      <Header cartCount={cartCount} onCartClick={onCartClick} />

      {/* Espaciador para el header fijo + botón volver */}
      <div className="pt-[73px] sm:pt-[89px]">
        <button
          onClick={onClose}
          className="flex items-center gap-1 px-4 sm:px-8 py-3 text-foreground/70 hover:text-primary transition font-bold italic uppercase text-xs sm:text-sm max-w-7xl mx-auto w-full"
        >
          <ChevronLeft size={18} />
          Volver
        </button>
      </div>

      <div className="max-w-7xl mx-auto md:flex md:items-start md:gap-10 md:px-8 md:pb-10">
        {/* Imagen del producto: al tope, sin fijar, se va con el scroll */}
        <div className="md:w-1/2 md:flex-shrink-0">
          <div className="relative w-full aspect-square max-h-[55vh] md:max-h-none bg-secondary/10 flex items-center justify-center">
            <img
              src={getImageUrl()}
              alt={product.name}
              className="w-full h-full object-contain"
              draggable="false"
              style={{ pointerEvents: "none" }}
            />

            {currentImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setPhotoIndex((i) => (i - 1 + currentImages.length) % currentImages.length)}
                  aria-label="Foto anterior"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/70 hover:bg-background text-foreground p-1.5 border border-secondary/30 transition"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoIndex((i) => (i + 1) % currentImages.length)}
                  aria-label="Siguiente foto"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/70 hover:bg-background text-foreground p-1.5 border border-secondary/30 transition"
                >
                  <ChevronRight size={18} />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {currentImages.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPhotoIndex(i)}
                      aria-label={`Foto ${i + 1}`}
                      className={`w-2 h-2 rounded-full transition ${
                        i === photoIndex ? "bg-primary" : "bg-foreground/30 hover:bg-foreground/60"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {thumbnails.length > 1 && (
            <div className="flex gap-2 mt-3 px-4 sm:px-6 md:px-0 flex-wrap">
              {thumbnails.map((v) => (
                <button
                  key={v.id}
                  onClick={() => selectVariant(v.id)}
                  aria-label={v.name}
                  className={`w-14 h-14 sm:w-16 sm:h-16 bg-secondary/10 overflow-hidden border transition ${
                    selectedVariant === v.id
                      ? "border-primary"
                      : "border-secondary/30 hover:border-primary/50"
                  }`}
                >
                  <img
                    src={v.image_url}
                    alt={v.name}
                    className="w-full h-full object-contain"
                    draggable="false"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Información del producto: fluye normalmente debajo/al lado de la imagen */}
        <div className="p-4 sm:p-6 md:p-0 md:w-1/2 md:self-center space-y-5 md:space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold italic uppercase leading-tight">
            {product.name}
          </h2>

          <div>
            <p className="text-3xl sm:text-4xl font-extrabold text-[#E63946]">
              ${currentPrice.toFixed(2)}
            </p>
            {product.has_variants && selectedVariant && currentPrice !== product.price && (
              <p className="text-xs text-foreground/60 italic mt-1">
                Precio base: ${product.price.toFixed(2)}
              </p>
            )}
          </div>

          {/* Variantes si aplica */}
          {product.has_variants && product.variants && product.variants.length > 0 && (
            <div>
              <p className="text-foreground/60 italic text-xs sm:text-sm uppercase mb-2">
                Selecciona variante
              </p>
              <div className="space-y-2">
                {[
                  ...product.variants.filter(v => v.quantity > 0),
                  ...product.variants.filter(v => v.quantity === 0),
                ].map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => selectVariant(variant.id)}
                    className={`w-full flex justify-between items-center gap-2 p-3 border italic transition ${
                      selectedVariant === variant.id
                        ? "border-primary bg-primary/10"
                        : "border-secondary/30 bg-background hover:border-primary/50"
                    } ${variant.quantity === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={variant.quantity === 0}
                  >
                    <span className="font-bold text-xs sm:text-sm flex-1 text-left">{variant.name}</span>
                    <span className={`text-xs sm:text-sm font-bold flex-shrink-0 whitespace-nowrap ${variant.quantity === 0 ? "text-red-500" : "text-primary"}`}>
                      {variant.quantity === 0 ? "Agotado" : "Disponible"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cantidad + agregar al carrito */}
          {!isOutOfStock ? (
            <div className="space-y-2">
              <p className="text-foreground/60 italic text-xs sm:text-sm uppercase">
                Cantidad
              </p>
              <div className="flex items-stretch gap-3">
                <div className="flex items-center border border-secondary/30">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-foreground w-10 sm:w-12 h-full font-bold hover:bg-secondary/30 transition text-lg"
                  >
                    −
                  </button>
                  <span className="text-lg font-bold w-10 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="text-foreground w-10 sm:w-12 h-full font-bold hover:bg-secondary/30 transition text-lg"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-primary text-primary-foreground px-4 font-extrabold italic uppercase text-xs sm:text-sm hover:bg-opacity-90 transition-all"
                >
                  {`Agregar $${(currentPrice * quantity).toFixed(2)}`}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-secondary/10 border border-secondary/30 p-3 text-center font-extrabold italic uppercase text-foreground/60">
              Agotado
            </div>
          )}

          {/* Descripción, Cómo usar y Por porción: acordeones independientes */}
          {mainDescription && (
            <AccordionRow title="Descripción" isOpen={isDescriptionOpen} onToggle={() => setIsDescriptionOpen(!isDescriptionOpen)}>
              <ReactMarkdown components={MARKDOWN_COMPONENTS}>{mainDescription}</ReactMarkdown>
            </AccordionRow>
          )}

          {howToUse && (
            <AccordionRow title="Cómo Usar" isOpen={isHowToUseOpen} onToggle={() => setIsHowToUseOpen(!isHowToUseOpen)}>
              <ReactMarkdown components={MARKDOWN_COMPONENTS}>{howToUse}</ReactMarkdown>
            </AccordionRow>
          )}

          {perServing && (
            <AccordionRow title="Por Porción" isOpen={isPerServingOpen} onToggle={() => setIsPerServingOpen(!isPerServingOpen)}>
              <ReactMarkdown components={MARKDOWN_COMPONENTS}>{perServing}</ReactMarkdown>
            </AccordionRow>
          )}

          {nutritionFactsUrl && (
            <AccordionRow title="Tabla Nutrimental" isOpen={isNutritionOpen} onToggle={() => setIsNutritionOpen(!isNutritionOpen)}>
              <img
                src={nutritionFactsUrl}
                alt={`Tabla nutrimental de ${product.name}`}
                className="w-full max-w-xs mx-auto"
                draggable="false"
              />
            </AccordionRow>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
