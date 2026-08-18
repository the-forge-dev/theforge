import { useState, useEffect } from "react";
import { X, Plus, Trash2, Upload } from "lucide-react";
import { PRODUCT_CATEGORIES } from "@/lib/constants/categories";
import type { Product, ProductVariant } from "@/lib/services/products";

interface ProductFormProps {
  product?: Partial<Product> | null;
  imagePreview?: string | null;
  onSave: (data: Partial<Product>, imageFile?: File | null) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

export function ProductForm({ product, imagePreview: initialPreview, onSave, onClose, loading = false }: ProductFormProps) {
  const [formData, setFormData] = useState<Partial<Product>>(
    product || {
      name: "",
      description: "",
      price: 0,
      image_url: "",
      quantity: 0,
      category: PRODUCT_CATEGORIES[0],
      has_variants: false,
      variants: [],
      is_bestseller: false,
    }
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(initialPreview || null);
  const [newVariantName, setNewVariantName] = useState("");
  const [newVariantQty, setNewVariantQty] = useState(0);
  const [newVariantPrice, setNewVariantPrice] = useState<number | "">(0);
  const [newVariantImageFile, setNewVariantImageFile] = useState<File | null>(null);
  const [newVariantImagePreview, setNewVariantImagePreview] = useState<string | null>(null);
  const [variantImageRemoved, setVariantImageRemoved] = useState(false);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleVariantImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewVariantImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewVariantImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddVariant = () => {
    if (!newVariantName.trim()) return;

    if (editingVariantId) {
      // Actualizar variante existente
      setFormData({
        ...formData,
        variants: (formData.variants || []).map((v) =>
          v.id === editingVariantId
            ? {
                ...v,
                name: newVariantName,
                quantity: newVariantQty,
                price: newVariantPrice ? Number(newVariantPrice) : undefined,
                image_url: variantImageRemoved ? undefined : (newVariantImagePreview || v.image_url),
              }
            : v
        ),
      });
      setEditingVariantId(null);
    } else {
      // Crear nueva variante
      const variant: ProductVariant = {
        id: `temp-${Date.now()}`,
        name: newVariantName,
        quantity: newVariantQty,
        price: newVariantPrice ? Number(newVariantPrice) : undefined,
        image_url: newVariantImagePreview || undefined,
      };
      setFormData({
        ...formData,
        variants: [...(formData.variants || []), variant],
      });
    }

    setNewVariantName("");
    setNewVariantQty(0);
    setNewVariantPrice(0);
    setNewVariantImageFile(null);
    setNewVariantImagePreview(null);
    setVariantImageRemoved(false);
  };

  const handleEditVariant = (variant: ProductVariant) => {
    setEditingVariantId(variant.id);
    setNewVariantName(variant.name);
    setNewVariantQty(variant.quantity);
    setNewVariantPrice(variant.price ?? 0);
    setNewVariantImagePreview(variant.image_url || null);
  };

  const handleCancelEditVariant = () => {
    setEditingVariantId(null);
    setNewVariantName("");
    setNewVariantQty(0);
    setNewVariantPrice(0);
    setNewVariantImageFile(null);
    setNewVariantImagePreview(null);
    setVariantImageRemoved(false);
  };

  const handleRemoveVariant = (id: string) => {
    setFormData({
      ...formData,
      variants: formData.variants?.filter((v) => v.id !== id) || [],
    });
    if (editingVariantId === id) {
      handleCancelEditVariant();
    }
  };

  const handleToggleVariants = (enabled: boolean) => {
    setFormData({
      ...formData,
      has_variants: enabled,
      variants: enabled ? formData.variants || [] : [],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData, imageFile);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-secondary/30 w-full max-w-2xl max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="border-b border-secondary/20 p-6 flex justify-between items-center sticky top-0 bg-background">
          <h2 className="text-2xl font-extrabold italic uppercase">
            {product?.id ? "Editar Producto" : "Nuevo Producto"}
          </h2>
          <button
            onClick={onClose}
            className="text-foreground hover:text-primary transition"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-bold italic uppercase mb-2">
              Nombre *
            </label>
            <input
              type="text"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full bg-background border border-secondary/30 px-4 py-2 text-foreground italic placeholder:text-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
              placeholder="Nombre del producto"
              disabled={loading}
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-bold italic uppercase mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full bg-background border border-secondary/30 px-4 py-2 text-foreground italic placeholder:text-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all resize-none"
              rows={3}
              placeholder="Descripción del producto (puedes usar saltos de línea)"
              disabled={loading}
            />
            <p className="text-xs text-foreground/50 italic mt-1">
              Usa saltos de línea para formatear la descripción
            </p>
          </div>

          {/* Grid: Precio, Categoría, Bestseller */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold italic uppercase mb-2">
                Precio *
              </label>
              <input
                type="number"
                value={formData.price || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value),
                  })
                }
                className="w-full bg-background border border-secondary/30 px-4 py-2 text-foreground italic placeholder:text-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                placeholder="0.00"
                step="0.01"
                min="0"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold italic uppercase mb-2">
                Categoría *
              </label>
              <select
                value={formData.category || PRODUCT_CATEGORIES[0]}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full bg-background border border-secondary/30 px-4 py-2 text-foreground italic focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                disabled={loading}
                required
              >
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
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
              onChange={(e) =>
                setFormData({ ...formData, is_bestseller: e.target.checked })
              }
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
                <div className="space-y-2">
                  {formData.variants && formData.variants.length > 0 && (
                    <div className="space-y-2">
                      {formData.variants.map((variant) => (
                        <div
                          key={variant.id}
                          className={`flex items-center justify-between gap-2 p-3 border cursor-pointer transition ${
                            editingVariantId === variant.id
                              ? "bg-primary/10 border-primary"
                              : "bg-background border-secondary/30 hover:border-primary/50"
                          }`}
                        >
                          <div className="flex-1 cursor-pointer" onClick={() => handleEditVariant(variant)}>
                            <p className="font-bold italic text-sm">{variant.name}</p>
                            <div className="flex gap-4 text-xs text-foreground/70 italic">
                              <span>Stock: {variant.quantity}</span>
                              {variant.price && <span>Precio: ${variant.price.toFixed(2)}</span>}
                            </div>
                            {editingVariantId === variant.id && (
                              <p className="text-xs text-primary italic mt-1">Editando...</p>
                            )}
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
                </div>

                <div className="space-y-3 border-t border-secondary/20 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold italic uppercase mb-1 text-foreground/70">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={newVariantName}
                        onChange={(e) => setNewVariantName(e.target.value)}
                        placeholder="Ej: Fresa 500g"
                        className="w-full bg-background border border-secondary/30 px-3 py-2 text-sm text-foreground italic placeholder:text-foreground/50 focus:outline-none focus:border-primary/50 transition-all"
                        disabled={loading}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddVariant();
                          }
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold italic uppercase mb-1 text-foreground/70">
                        Stock
                      </label>
                      <input
                        type="number"
                        value={newVariantQty}
                        onChange={(e) => setNewVariantQty(parseInt(e.target.value) || 0)}
                        placeholder="Ej: 25"
                        className="w-full bg-background border border-secondary/30 px-3 py-2 text-sm text-foreground italic placeholder:text-foreground/50 focus:outline-none focus:border-primary/50 transition-all"
                        min="0"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold italic uppercase mb-1 text-foreground/70">
                      Precio (opcional)
                    </label>
                    <input
                      type="number"
                      value={newVariantPrice}
                      onChange={(e) => setNewVariantPrice(e.target.value ? parseFloat(e.target.value) : "")}
                      placeholder="Ej: 35.00 (deja vacío para usar precio del producto)"
                      className="w-full bg-background border border-secondary/30 px-3 py-2 text-sm text-foreground italic placeholder:text-foreground/50 focus:outline-none focus:border-primary/50 transition-all"
                      step="0.01"
                      min="0"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold italic uppercase mb-1 text-foreground/70">
                      Imagen de variante (opcional)
                    </label>
                    <div className="relative border-2 border-dashed border-secondary/30 rounded p-4 text-center hover:border-primary/50 transition cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleVariantImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={loading}
                      />
                      <div className="pointer-events-none">
                        <Upload size={20} className="mx-auto mb-1 text-foreground/50" />
                        <p className="text-xs font-bold italic uppercase">
                          Clic para subir imagen
                        </p>
                      </div>
                    </div>
                    {newVariantImagePreview && (
                      <div className="mt-2 border border-secondary/30 p-2">
                        <img
                          src={newVariantImagePreview}
                          alt="Variant Preview"
                          className="w-full h-24 object-cover"
                          draggable="false"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setNewVariantImageFile(null);
                            setNewVariantImagePreview(null);
                            setVariantImageRemoved(true);
                          }}
                          className="mt-2 w-full text-xs text-red-500 hover:text-red-700 font-bold italic uppercase transition"
                        >
                          Eliminar Imagen
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2 hover:bg-opacity-90 transition font-bold italic uppercase text-sm disabled:opacity-50"
                      disabled={!newVariantName.trim() || loading}
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
                <label className="block text-sm font-bold italic uppercase mb-2">
                  Stock Total
                </label>
                <input
                  type="number"
                  value={formData.quantity ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: e.target.value === "" ? 0 : parseInt(e.target.value) || 0,
                    })
                  }
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

          {/* Imagen */}
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
                <p className="text-sm font-bold italic uppercase mb-1">
                  Clic para subir imagen
                </p>
                <p className="text-xs text-foreground/50 italic">
                  PNG, JPG, GIF (máx 10MB)
                </p>
              </div>
            </div>

            {(imagePreview || formData.image_url) && (
              <div className="mt-4 border border-secondary/30 p-2">
                <img
                  src={imagePreview || formData.image_url}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                  draggable="false"
                />
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
