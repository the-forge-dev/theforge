import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LogOut, Plus, Edit2, Trash2, Eye, EyeOff, AlertCircle, Menu, X as XIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMaintenanceMode } from "@/hooks/use-maintenance";
import { getProducts, createProduct, updateProduct, deleteProduct, type Product } from "@/lib/services/products";
import { uploadProductImage } from "@/lib/services/storage";
import { useToast } from "@/hooks/use-toast";
import { ProductForm } from "@/components/ProductForm";
import { PRODUCT_CATEGORIES } from "@/lib/constants/categories";

export default function Admin() {
  const { user, isLoggedIn, login, logout, loading: authLoading } = useAuth();
  const { maintenanceMode, loading: maintenanceLoading, error: maintenanceError, tableExists, fetchMaintenanceMode, toggleMaintenanceMode } = useMaintenanceMode();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load products and maintenance mode on mount
  useEffect(() => {
    if (isLoggedIn) {
      loadProductsFromSupabase();
      fetchMaintenanceMode();
    }
  }, [isLoggedIn, fetchMaintenanceMode]);

  const loadProductsFromSupabase = async () => {
    try {
      setLoadingProducts(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error loading products";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    
    try {
      await login(email, password);
      setEmail("");
      setPassword("");
      toast({
        title: "Éxito",
        description: "Sesión iniciada correctamente",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al iniciar sesión";
      setLoginError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Éxito",
        description: "Sesión cerrada correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cerrar sesión",
        variant: "destructive",
      });
    }
  };

  const handleToggleMaintenance = async () => {
    try {
      const newValue = !maintenanceMode;
      await toggleMaintenanceMode(newValue);
      toast({
        title: "Éxito",
        description: newValue
          ? "Modo mantenimiento activado"
          : "Modo mantenimiento desactivado",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al cambiar modo mantenimiento";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setImagePreview(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setImagePreview(product.image_url);
    setIsFormOpen(true);
  };

  const handleSaveProduct = async (formData: Partial<Product>, imageFile?: File | null) => {
    if (!formData.name || !formData.price) {
      toast({
        title: "Error",
        description: "Completa los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    if (formData.has_variants && (!formData.variants || formData.variants.length === 0)) {
      toast({
        title: "Error",
        description: "Agrega al menos una variante al producto",
        variant: "destructive",
      });
      return;
    }

    if (!editingProduct && !imageFile) {
      toast({
        title: "Error",
        description: "Sube una imagen para el nuevo producto",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploadingImage(true);
      let imageUrl = formData.image_url;

      if (imageFile) {
        const tempId = editingProduct?.id || "temp-" + Date.now();
        imageUrl = await uploadProductImage(imageFile, tempId);
      }

      const productId = editingProduct?.id || "temp-" + Date.now();
      const variants = await Promise.all(
        (formData.variants || []).map(async (variant) => {
          let variantImageUrl = variant.image_url;

          // Si image_url es undefined, significa que fue eliminada
          if (variant.image_url === undefined) {
            variantImageUrl = undefined;
          } else if (variant.image_url && variant.image_url.startsWith("data:")) {
            // Si es base64, subir a storage
            const file = new File(
              [await fetch(variant.image_url).then(r => r.blob())],
              `variant-${variant.id}.jpg`
            );
            variantImageUrl = await uploadProductImage(file, `${productId}-${variant.id}`);
          }

          return {
            ...variant,
            image_url: variantImageUrl,
          };
        })
      );

      const productData = {
        name: formData.name!,
        description: formData.description || "",
        price: formData.price!,
        image_url: imageUrl!,
        category: formData.category || PRODUCT_CATEGORIES[0],
        quantity: formData.has_variants ? 0 : (formData.quantity || 0),
        has_variants: formData.has_variants || false,
        variants: variants,
        is_bestseller: formData.is_bestseller || false,
      };

      if (editingProduct?.id) {
        const updated = await updateProduct(editingProduct.id, productData);
        setProducts(products.map((p) => (p.id === editingProduct.id ? updated : p)));
        toast({
          title: "Éxito",
          description: "Producto actualizado",
        });
      } else {
        const created = await createProduct(productData);
        setProducts([...products, created]);
        toast({
          title: "Éxito",
          description: "Producto creado",
        });
      }

      setIsFormOpen(false);
      setEditingProduct(null);
      setImagePreview(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error saving product";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      return;
    }

    try {
      await deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      toast({
        title: "Éxito",
        description: "Producto eliminado",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al eliminar producto",
        variant: "destructive",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="bg-background text-foreground relative z-10 w-full min-h-screen flex items-center justify-center">
        <p className="text-foreground/70 italic">Cargando...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="bg-background text-foreground relative z-10 w-full min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md mx-auto px-4">
          <div className="text-center mb-12">
            <img
              src="/logo.png"
              alt="THE FORGE"
              className="h-16 w-auto mx-auto mb-6"
              draggable="false"
            />
            <h1 className="text-4xl font-extrabold italic uppercase mb-2">
              Panel Admin
            </h1>
            <p className="text-foreground/70 italic">THE FORGE</p>
          </div>

          <form onSubmit={handleLogin} className="border border-secondary/30 p-8 space-y-6">
            <div>
              <label className="block text-sm font-bold italic uppercase mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@theforge.com"
                className="w-full bg-background border border-secondary/30 px-4 py-2 text-foreground italic placeholder:text-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                disabled={loginLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-bold italic uppercase mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-background border border-secondary/30 px-4 py-2 text-foreground italic placeholder:text-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                  disabled={loginLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground/50 hover:text-foreground transition"
                  disabled={loginLoading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="bg-primary/10 border border-primary/30 text-primary p-3 text-sm italic rounded">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-primary text-primary-foreground py-3 font-extrabold italic uppercase hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginLoading ? "Ingresando..." : "Ingresar"}
            </button>

            <Link
              to="/"
              className="block text-center text-foreground/50 hover:text-primary text-sm italic transition"
            >
              Volver al inicio
            </Link>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground relative z-10 w-full min-h-screen pb-20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur border-b border-secondary/30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer">
            <img
              src="/logo.png"
              alt="THE FORGE"
              className="h-8 sm:h-10 w-auto"
              draggable="false"
              style={{ pointerEvents: 'none' }}
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            <span className="text-xs text-foreground/70 italic">{user?.email}</span>

            {maintenanceMode !== null && (
              <button
                onClick={handleToggleMaintenance}
                disabled={maintenanceLoading}
                className={`flex items-center gap-2 px-3 py-2 font-bold italic text-sm transition-all ${
                  maintenanceMode
                    ? "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                    : "bg-green-500/20 text-green-500 hover:bg-green-500/30"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={maintenanceMode ? "Modo mantenimiento ACTIVO" : "Modo mantenimiento inactivo"}
              >
                <AlertCircle size={16} />
                {maintenanceLoading ? "..." : maintenanceMode ? "ON" : "OFF"}
              </button>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 font-bold italic hover:bg-opacity-90 transition-all text-sm"
            >
              <LogOut size={18} />
              Salir
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex items-center gap-2 bg-primary text-primary-foreground px-3 py-2 font-bold italic hover:bg-opacity-90 transition-all"
          >
            {isMobileMenuOpen ? <XIcon size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-background border-t border-secondary/30 px-4 py-4 space-y-4">
            <div className="text-xs text-foreground/70 italic truncate">
              {user?.email}
            </div>

            {maintenanceMode !== null && (
              <button
                onClick={() => {
                  handleToggleMaintenance();
                  setIsMobileMenuOpen(false);
                }}
                disabled={maintenanceLoading}
                className={`w-full flex items-center gap-2 px-3 py-2 font-bold italic text-sm transition-all ${
                  maintenanceMode
                    ? "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                    : "bg-green-500/20 text-green-500 hover:bg-green-500/30"
                } disabled:opacity-50 disabled:cursor-not-allowed justify-center`}
                title={maintenanceMode ? "Modo mantenimiento ACTIVO" : "Modo mantenimiento inactivo"}
              >
                <AlertCircle size={16} />
                {maintenanceLoading ? "..." : maintenanceMode ? "MANTENIMIENTO ON" : "MANTENIMIENTO OFF"}
              </button>
            )}

            <button
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 font-bold italic hover:bg-opacity-90 transition-all"
            >
              <LogOut size={18} />
              Salir
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="pt-24 max-w-7xl mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold italic uppercase mb-4">
            Panel Admin
          </h1>
          <p className="text-foreground/70 italic text-lg">
            Gestiona tus productos y catálogo
          </p>
        </div>

        {/* Maintenance Mode Alert */}
        {maintenanceMode && (
          <div className="mb-12 border-2 border-red-500 bg-red-500/10 p-6 rounded">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-extrabold italic uppercase text-lg text-red-500 mb-2">
                  Modo Mantenimiento Activo
                </h3>
                <p className="text-foreground/70 italic">
                  El sitio está en mantenimiento. Los usuarios no autenticados verán una página de mantenimiento.
                  Puedes seguir gestionando productos y el sitio volverá a funcionar normalmente cuando desactives este modo.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Add Product Button */}
        <div className="mb-12">
          <button
            onClick={handleAddProduct}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-extrabold italic uppercase hover:bg-opacity-90 transition-all disabled:opacity-50"
            disabled={loadingProducts}
          >
            <Plus size={20} />
            Agregar Nuevo Producto
          </button>
        </div>

        {/* Products Table */}
        {loadingProducts ? (
          <div className="text-center py-12">
            <p className="text-foreground/70 italic">Cargando productos...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="border border-secondary/30 bg-background/50 hover:border-primary/50 transition-all p-4 flex flex-col h-full"
                >
                  {/* Product Image */}
                  <div className="relative h-40 overflow-hidden bg-secondary/10 mb-4">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      draggable="false"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="space-y-2 flex-1">
                    <h4 className="text-lg font-extrabold italic uppercase line-clamp-2">
                      {product.name}
                    </h4>
                    <p className="text-sm text-foreground/70 italic line-clamp-2">
                      {product.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <p className="text-xs text-foreground/60 italic uppercase">Precio</p>
                        <p className="text-2xl font-extrabold text-primary">${product.price}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-foreground/60 italic uppercase">Cantidad</p>
                        <p className={`text-2xl font-extrabold ${
                          (product.has_variants
                            ? (product.variants?.reduce((sum, v) => sum + v.quantity, 0) ?? 0)
                            : product.quantity) === 0
                            ? 'text-red-500'
                            : 'text-primary'
                        }`}>
                          {product.has_variants
                            ? (product.variants?.reduce((sum, v) => sum + v.quantity, 0) ?? 0)
                            : product.quantity}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border-t border-secondary/20 pt-4 mt-4 flex gap-2">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="flex-1 flex items-center justify-center gap-2 bg-secondary/30 text-foreground py-2 hover:bg-secondary/50 transition font-bold italic uppercase text-sm"
                    >
                      <Edit2 size={16} />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-primary/30 text-primary py-2 hover:bg-primary/50 transition font-bold italic uppercase text-sm"
                    >
                      <Trash2 size={16} />
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-foreground/70 italic mb-4">No hay productos</p>
                <button
                  onClick={handleAddProduct}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-extrabold italic uppercase mx-auto hover:bg-opacity-90 transition-all"
                >
                  <Plus size={20} />
                  Crear Primer Producto
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Product Form Modal */}
      {isFormOpen && (
        <ProductForm
          product={editingProduct}
          imagePreview={imagePreview}
          onSave={handleSaveProduct}
          onClose={() => {
            setIsFormOpen(false);
            setEditingProduct(null);
            setImagePreview(null);
          }}
          loading={uploadingImage}
        />
      )}
    </div>
  );
}
