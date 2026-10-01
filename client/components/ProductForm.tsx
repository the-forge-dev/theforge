import { useState } from "react";
import { X, Plus, Trash2, Upload, ChevronUp, ChevronDown as ChevronDownIcon } from "lucide-react";
import { PRODUCT_CATEGORIES } from "@/lib/constants/categories";
import type { Product, ProductVariant } from "@/lib/services/products";
import { uploadProductImage } from "@/lib/services/storage";
import { parseDescription, buildDescription } from "@/lib/utils/parseProductDescription";
import { formatMoney } from "@/lib/utils/formatMoney";
import { useToast } from "@/hooks/use-toast";

interface ProductFormProps {
  product?: Partial<Product> | null;
  imagePreview?: string | null;
  onSave: (data: Partial<Product>) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

interface VariantDraft {
  id: string;
  name: string;
  quantity: number;
  price: number | "";
  images: string[]; // urls existentes o data: URIs pendientes de subir; la primera es la portada
  nutritionUrl: string; // "" si no tiene tabla nutrimental propia
}

function emptyVariantDraft(): VariantDraft {
  return { id: "", name: "", quantity: 0, price: "", images: [], nutritionUrl: "" };
}

function readFilesAsDataUrls(files: FileList): Promise<string[]> {
  return Promise.all(
    Array.from(files).map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    )
  );
}

// Sube a Storage cualquier URL que sea un data: URI (foto nueva sin subir);
// las URLs que ya son remotas (https://...) se dejan tal cual.
async function resolveImageUrl(url: string, pathHint: string): Promise<string> {
  if (!url.startsWith("data:")) return url;
  const blob = await fetch(url).then((r) => r.blob());
  const ext = blob.type.split("/")[1] || "jpg";
  const file = new File([blob], `${pathHint}.${ext}`, { type: blob.type });
  return uploadProductImage(file, pathHint);
}

export function ProductForm({ product, imagePreview: initialPreview, onSave, onClose, loading: savingExternally = false }: ProductFormProps) {
  const { toast } = useToast();
  const parsedDescription = parseDescription(product?.description || "");

  const [formData, setFormData] = useState<Partial<Product>>(
    product || {
      name: "",
      price: 0,
      image_url: "",
      quantity: 0,
      category: PRODUCT_CATEGORIES[0],
      has_variants: false,
      variants: [],
      is_bestseller: false,
    }
  );
  const [descMain, setDescMain] = useState(parsedDescription.main);
  const [descHowToUse, setDescHowToUse] = useState(parsedDescription.howToUse);
  const [descPerServing, setDescPerServing] = useState(parsedDescription.perServing);
  const [productNutritionUrl, setProductNutritionUrl] = useState(parsedDescription.nutritionFactsUrl);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(initialPreview || null);
  const [submitting, setSubmitting] = useState(false);
  const loading = savingExternally || submitting;

  const [variantDraft, setVariantDraft] = useState<VariantDraft>(emptyVariantDraft());
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleProductNutritionChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setProductNutritionUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleVariantImagesAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const dataUrls = await readFilesAsDataUrls(files);
    setVariantDraft((d) => ({ ...d, images: [...d.images, ...dataUrls] }));
    e.target.value = "";
  };

  const handleVariantNutritionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setVariantDraft((d) => ({ ...d, nutritionUrl: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const removeVariantImage = (index: number) => {
    setVariantDraft((d) => ({ ...d, images: d.images.filter((_, i) => i !== index) }));
  };

  const moveVariantImage = (index: number, direction: -1 | 1) => {
    setVariantDraft((d) => {
      const images = [...d.images];
      const target = index + direction;
      if (target < 0 || target >= images.length) return d;
      [images[index], images[target]] = [images[target], images[index]];
      return { ...d, images };
    });
  };

  const handleSaveVariantDraft = () => {
    if (!variantDraft.name.trim()) return;

    const variant: ProductVariant = {
      id: editingVariantId || `temp-${Date.now()}`,
      name: variantDraft.name,
      quantity: variantDraft.quantity,
      price: variantDraft.price === "" ? undefined : Number(variantDraft.price),
      image_url: variantDraft.images[0] || undefined,
      image_urls: variantDraft.images.length > 0 ? variantDraft.images : undefined,
      nutrition_facts_url: variantDraft.nutritionUrl || undefined,
    };

    setFormData((fd) => ({
      ...fd,
      variants: editingVariantId
        ? (fd.variants || []).map((v) => (v.id === editingVariantId ? variant : v))
        : [...(fd.variants || []), variant],
    }));

    setEditingVariantId(null);
    setVariantDraft(emptyVariantDraft());
  };

  const handleEditVariant = (variant: ProductVariant) => {
    setEditingVariantId(variant.id);
    setVariantDraft({
      id: variant.id,
      name: variant.name,
      quantity: variant.quantity,
      price: variant.price ?? "",
      images: variant.image_urls?.length ? variant.image_urls : variant.image_url ? [variant.image_url] : [],
      nutritionUrl: variant.nutrition_facts_url || "",
    });
  };

  const handleCancelEditVariant = () => {
    setEditingVariantId(null);
    setVariantDraft(emptyVariantDraft());
  };

  const handleRemoveVariant = (id: string) => {
    setFormData((fd) => ({ ...fd, variants: fd.variants?.filter((v) => v.id !== id) || [] }));
    if (editingVariantId === id) handleCancelEditVariant();
  };

  const handleToggleVariants = (enabled: boolean) => {
    setFormData((fd) => ({ ...fd, has_variants: enabled, variants: enabled ? fd.variants || [] : [] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      toast({ title: "Error", description: "Completa los campos requeridos", variant: "destructive" });
      return;
    }
    if (formData.has_variants && (!formData.variants || formData.variants.length === 0)) {
      toast({ title: "Error", description: "Agrega al menos una variante al producto", variant: "destructive" });
      return;
    }
    if (!product?.id && !imageFile) {
      toast({ title: "Error", description: "Sube una imagen para el nuevo producto", variant: "destructive" });
      return;
    }

    try {
      setSubmitting(true);
      const productId = product?.id || `temp-${Date.now()}`;

      let imageUrl = formData.image_url;
      if (imageFile) {
        imageUrl = await uploadProductImage(imageFile, productId);
      }

      const variants = await Promise.all(
        (formData.variants || []).map(async (variant) => {
          const images = await Promise.all(
            (variant.image_urls || []).map((url, i) =>
              resolveImageUrl(url, `${productId}-${variant.id}-${i}-${Date.now()}`)
            )
          );
          const nutritionUrl = variant.nutrition_facts_url
            ? await resolveImageUrl(variant.nutrition_facts_url, `${productId}-${variant.id}-nfp-${Date.now()}`)
            : undefined;
          return {
            ...variant,
            image_url: images[0] || undefined,
            image_urls: images.length > 0 ? images : undefined,
            nutrition_facts_url: nutritionUrl,
          };
        })
      );

      const resolvedProductNutritionUrl = !formData.has_variants && productNutritionUrl
        ? await resolveImageUrl(productNutritionUrl, `${productId}-nfp-${Date.now()}`)
        : "";

      const description = buildDescription({
        main: descMain,
        howToUse: descHowToUse,
        perServing: descPerServing,
        nutritionFactsUrl: resolvedProductNutritionUrl,
      });

      await onSave({
        name: formData.name!,
        description,
        price: formData.price!,
        image_url: imageUrl!,
        category: formData.category || PRODUCT_CATEGORIES[0],
        quantity: formData.has_variants ? 0 : (formData.quantity || 0),
        has_variants: formData.has_variants || false,
        variants,
        is_bestseller: formData.is_bestseller || false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al guardar el producto";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-secondary/30 w-full max-w-2xl max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="border-b border-secondary/20 p-6 flex justify-between items-center sticky top-0 bg-background z-10">
          <h2 className="text-2xl font-extrabold italic uppercase">
            {product?.id ? "Editar Producto" : "Nuevo Producto"}
          </h2>
          <button onClick={onClose} className="text-foreground hover:text-primary transition" disabled={loading}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-bold italic uppercase mb-2">Nombre *</label>
            <input
              type="text"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-background border border-secondary/30 px-4 py-2 text-foreground italic placeholder:text-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
              placeholder="Nombre del producto"
              disabled={loading}
              required
            />
          </div>

          {/* Descripción, Cómo usar, Por porción: campos independientes */}
          <div className="space-y-4 border-t border-secondary/20 pt-6">
            <p className="text-xs font-bold italic uppercase text-foreground/50">
              Estos 3 campos se muestran como acordeones separados en la ficha del producto
            </p>
            <div>
              <label className="block text-sm font-bold italic uppercase mb-2">Descripción</label>
              <textarea
                value={descMain}
                onChange={(e) => setDescMain(e.target.value)}
                className="w-full bg-background border border-secondary/30 px-4 py-2 text-foreground italic placeholder:text-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                rows={4}
                placeholder="Descripción general del producto"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-bold italic uppercase mb-2">Cómo Usar</label>
              <textarea
                value={descHowToUse}
                onChange={(e) => setDescHowToUse(e.target.value)}
                className="w-full bg-background border border-secondary/30 px-4 py-2 text-foreground italic placeholder:text-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                rows={3}
                placeholder="Ej: Mezcla 1 scoop con 250ml de agua..."
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-bold italic uppercase mb-2">Por Porción</label>
              <textarea
                value={descPerServing}
                onChange={(e) => setDescPerServing(e.target.value)}
                className="w-full bg-background border border-secondary/30 px-4 py-2 text-foreground italic placeholder:text-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                rows={3}
                placeholder="Ej: 24g de proteína, 5.5g de BCAAs..."
                disabled={loading}
              />
            </div>

            {!formData.has_variants && (
              <div>
                <label className="block text-sm font-bold italic uppercase mb-2">
                  Tabla Nutrimental (opcional)
                </label>
                <div className="relative border-2 border-dashed border-secondary/30 rounded p-4 text-center hover:border-primary/50 transition cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProductNutritionChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={loading}
                  />
                  <div className="pointer-events-none">
                    <Upload size={20} className="mx-auto mb-1 text-foreground/50" />
                    <p className="text-xs font-bold italic uppercase">Clic para subir imagen</p>
                  </div>
                </div>
                {productNutritionUrl && (
                  <div className="mt-2 border border-secondary/30 p-2 relative inline-block">
                    <img src={productNutritionUrl} alt="Tabla nutrimental" className="h-32 object-contain" draggable="false" />
                    <button
                      type="button"
                      onClick={() => setProductNutritionUrl("")}
                      className="mt-2 w-full text-xs text-red-500 hover:text-red-700 font-bold italic uppercase transition"
                    >
                      Eliminar Imagen
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Grid: Precio, Categoría */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold italic uppercase mb-2">Precio *</label>
              <input
                type="number"
                value={formData.price || ""}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full bg-background border border-secondary/30 px-4 py-2 text-foreground italic placeholder:text-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                placeholder="0.00"
                step="0.01"
                min="0"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold italic uppercase mb-2">Categoría *</label>
              <select
                value={formData.category || PRODUCT_CATEGORIES[0]}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-background border border-secondary/30 px-4 py-2 text-foreground italic focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                disabled={loading}
                required
              >
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bestseller */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="bestseller"
              checked={formData.is_bestseller || false}
              onChange={(e) => setFormData({ ...formData, is_bestseller: e.target.checked })}
              className="w-4 h-4 accent-primary"
              disabled={loading}
            />
            <label htmlFor="bestseller" className="text-sm font-bold italic uppercase">
              Marcar como producto más vendido
            </label>
          </div>

          {/* Variantes */}
          <div className="border-t border-secondary/20 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="has-variants"
                checked={formData.has_variants || false}
                onChange={(e) => handleToggleVariants(e.target.checked)}
                className="w-4 h-4 accent-primary"
                disabled={loading}
              />
              <label htmlFor="has-variants" className="text-sm font-bold italic uppercase">
                Este producto tiene variantes (sabores, tamaños, etc.)
              </label>
            </div>

            {formData.has_variants && (
              <div className="space-y-4 bg-secondary/5 p-4 border border-secondary/20">
                {formData.variants && formData.variants.length > 0 && (
                  <div className="space-y-2">
                    {formData.variants.map((variant) => (
                      <div
                        key={variant.id}
                        className={`flex items-center justify-between gap-2 p-3 border transition ${
                          editingVariantId === variant.id
                            ? "bg-primary/10 border-primary"
                            : "bg-background border-secondary/30 hover:border-primary/50"
                        }`}
                      >
                        <div className="flex-1 cursor-pointer flex items-center gap-3" onClick={() => handleEditVariant(variant)}>
                          {variant.image_url && (
                            <img src={variant.image_url} alt={variant.name} className="w-10 h-10 object-contain bg-secondary/10 flex-shrink-0" draggable="false" />
                          )}
                          <div>
                            <p className="font-bold italic text-sm">{variant.name}</p>
                            <div className="flex gap-3 text-xs text-foreground/70 italic flex-wrap">
                              <span>Stock: {variant.quantity}</span>
                              {variant.price && <span>Precio: {formatMoney(variant.price)}</span>}
                              {(variant.image_urls?.length || 0) > 1 && <span>{variant.image_urls!.length} fotos</span>}
                              {variant.nutrition_facts_url && <span>Con tabla nutrimental</span>}
                            </div>
                            {editingVariantId === variant.id && (
                              <p className="text-xs text-primary italic mt-1">Editando...</p>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(variant.id)}
                          className="text-primary hover:text-primary/70 transition flex-shrink-0"
                          disabled={loading}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-3 border-t border-secondary/20 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold italic uppercase mb-1 text-foreground/70">Nombre</label>
                      <input
                        type="text"
                        value={variantDraft.name}
                        onChange={(e) => setVariantDraft((d) => ({ ...d, name: e.target.value }))}
                        placeholder="Ej: Fresa 500g"
                        className="w-full bg-background border border-secondary/30 px-3 py-2 text-sm text-foreground italic placeholder:text-foreground/50 focus:outline-none focus:border-primary/50 transition-all"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold italic uppercase mb-1 text-foreground/70">Stock</label>
                      <input
                        type="number"
                        value={variantDraft.quantity}
                        onChange={(e) => setVariantDraft((d) => ({ ...d, quantity: parseInt(e.target.value) || 0 }))}
                        placeholder="Ej: 25"
                        className="w-full bg-background border border-secondary/30 px-3 py-2 text-sm text-foreground italic placeholder:text-foreground/50 focus:outline-none focus:border-primary/50 transition-all"
                        min="0"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold italic uppercase mb-1 text-foreground/70">Precio (opcional)</label>
                    <input
                      type="number"
                      value={variantDraft.price}
                      onChange={(e) => setVariantDraft((d) => ({ ...d, price: e.target.value ? parseFloat(e.target.value) : "" }))}
                      placeholder="Deja vacío para usar el precio del producto"
                      className="w-full bg-background border border-secondary/30 px-3 py-2 text-sm text-foreground italic placeholder:text-foreground/50 focus:outline-none focus:border-primary/50 transition-all"
                      step="0.01"
                      min="0"
                      disabled={loading}
                    />
                  </div>

                  {/* Fotos de la variante: varias, con la primera como portada */}
                  <div>
                    <label className="block text-xs font-bold italic uppercase mb-1 text-foreground/70">
                      Fotos de esta variante (puedes subir varias)
                    </label>
                    {variantDraft.images.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mb-2">
                        {variantDraft.images.map((url, i) => (
                          <div key={i} className="relative border border-secondary/30 p-1">
                            <img src={url} alt={`Foto ${i + 1}`} className="w-full h-16 object-contain" draggable="false" />
                            {i === 0 && (
                              <span className="absolute top-0 left-0 bg-primary text-primary-foreground text-[9px] font-bold uppercase px-1">
                                Portada
                              </span>
                            )}
                            <div className="flex justify-between mt-1">
                              <div className="flex gap-0.5">
                                <button type="button" onClick={() => moveVariantImage(i, -1)} disabled={i === 0 || loading} className="disabled:opacity-20 text-foreground/70 hover:text-primary">
                                  <ChevronUp size={12} />
                                </button>
                                <button type="button" onClick={() => moveVariantImage(i, 1)} disabled={i === variantDraft.images.length - 1 || loading} className="disabled:opacity-20 text-foreground/70 hover:text-primary">
                                  <ChevronDownIcon size={12} />
                                </button>
                              </div>
                              <button type="button" onClick={() => removeVariantImage(i)} disabled={loading} className="text-red-500 hover:text-red-700">
                                <X size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="relative border-2 border-dashed border-secondary/30 rounded p-3 text-center hover:border-primary/50 transition cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleVariantImagesAdd}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={loading}
                      />
                      <div className="pointer-events-none">
                        <Upload size={18} className="mx-auto mb-1 text-foreground/50" />
                        <p className="text-xs font-bold italic uppercase">
                          {variantDraft.images.length > 0 ? "Agregar más fotos" : "Clic para subir fotos"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tabla nutrimental propia de esta variante */}
                  <div>
                    <label className="block text-xs font-bold italic uppercase mb-1 text-foreground/70">
                      Tabla Nutrimental de esta variante (opcional)
                    </label>
                    <div className="relative border-2 border-dashed border-secondary/30 rounded p-3 text-center hover:border-primary/50 transition cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleVariantNutritionChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={loading}
                      />
                      <div className="pointer-events-none">
                        <Upload size={18} className="mx-auto mb-1 text-foreground/50" />
                        <p className="text-xs font-bold italic uppercase">Clic para subir imagen</p>
                      </div>
                    </div>
                    {variantDraft.nutritionUrl && (
                      <div className="mt-2 border border-secondary/30 p-2 inline-block">
                        <img src={variantDraft.nutritionUrl} alt="Tabla nutrimental de la variante" className="h-24 object-contain" draggable="false" />
                        <button
                          type="button"
                          onClick={() => setVariantDraft((d) => ({ ...d, nutritionUrl: "" }))}
                          className="mt-1 block w-full text-xs text-red-500 hover:text-red-700 font-bold italic uppercase transition"
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSaveVariantDraft}
                      className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2 hover:bg-opacity-90 transition font-bold italic uppercase text-sm disabled:opacity-50"
                      disabled={!variantDraft.name.trim() || loading}
                    >
                      <Plus size={16} />
                      {editingVariantId ? "Guardar Cambios" : "Agregar Variante"}
                    </button>
                    {editingVariantId && (
                      <button
                        type="button"
                        onClick={handleCancelEditVariant}
                        className="px-4 bg-secondary/30 text-foreground py-2 hover:bg-secondary/50 transition font-bold italic uppercase text-sm"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!formData.has_variants && (
              <div>
                <label className="block text-sm font-bold italic uppercase mb-2">Stock Total</label>
                <input
                  type="number"
                  value={formData.quantity ?? ""}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value === "" ? 0 : parseInt(e.target.value) || 0 })}
                  className="w-full bg-background border border-secondary/30 px-4 py-2 text-foreground italic placeholder:text-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                  placeholder="0"
                  min="0"
                  disabled={loading}
                />
              </div>
            )}

            {formData.has_variants && (
              <div className="bg-secondary/5 border border-secondary/20 p-3 rounded">
                <p className="text-xs text-foreground/70 italic">
                  El stock se define a través de las variantes. El producto base no tiene stock independiente.
                </p>
              </div>
            )}
          </div>

          {/* Imagen principal */}
          <div>
            <label className="block text-sm font-bold italic uppercase mb-2">
              Imagen {!product?.id && "*"}
            </label>
            <div className="relative border-2 border-dashed border-secondary/30 rounded p-6 text-center hover:border-primary/50 transition cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={loading}
              />
              <div className="pointer-events-none">
                <Upload size={32} className="mx-auto mb-2 text-foreground/50" />
                <p className="text-sm font-bold italic uppercase mb-1">Clic para subir imagen</p>
                <p className="text-xs text-foreground/50 italic">PNG, JPG, GIF (máx 10MB)</p>
              </div>
            </div>

            {(imagePreview || formData.image_url) && (
              <div className="mt-4 border border-secondary/30 p-2">
                <img src={imagePreview || formData.image_url} alt="Preview" className="w-full h-48 object-cover" draggable="false" />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-secondary/20 pt-6 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-secondary/30 text-foreground px-6 py-3 font-bold italic uppercase hover:bg-secondary/50 transition-all disabled:opacity-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground px-6 py-3 font-bold italic uppercase hover:bg-opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? "Guardando..." : product?.id ? "Guardar Cambios" : "Crear Producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
