import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Menu, X, ShoppingCart, MessageCircle, FileText, HelpCircle, Sun, Moon, Search } from "lucide-react";
import { useTheme } from "@/lib/context/ThemeContext";

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
}

const NAV_LINKS = [
  { label: "Suplementos", to: "/productos" },
  { label: "Ropa", to: "/ropa" },
  { label: "Accesorios", to: "/accesorios" },
  { label: "Marcas", to: "/marcas" },
  { label: "Nosotros", to: "/blog" },
];

export function Header({ cartCount, onCartClick }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Si ya estamos en /productos con ?q=, refleja ese valor en el buscador del navbar
  useEffect(() => {
    if (location.pathname === "/productos") {
      setSearchInput(searchParams.get("q") || "");
    }
  }, [location.pathname, searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim();
    navigate(query ? `/productos?q=${encodeURIComponent(query)}` : "/productos");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-nav border-b border-surface-border/10">
      <div className="relative max-w-[1920px] mx-auto px-6 lg:px-[60px] h-16 sm:h-20 flex items-center gap-6 sm:gap-10">
        {/* Menú hamburguesa: solo hasta lg (la navegación completa no cabe antes) */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menú"
          className="lg:hidden text-foreground hover:text-primary transition flex-shrink-0"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo centrado solo en la versión mobile/tablet (hasta lg, donde
            está el menú hamburguesa); desde lg vuelve a su posición normal
            en el flujo, junto al menú de navegación. */}
        <Link
          to="/"
          className="absolute left-1/2 -translate-x-1/2 lg:static lg:left-auto lg:translate-x-0 flex items-center gap-2 hover:opacity-80 transition cursor-pointer flex-shrink-0"
        >
          <img
            src={theme === "light" ? "/imagotipo-dark.svg" : "/imagotipo.svg"}
            alt="THE FORGE"
            className="h-8 sm:h-[54px] w-auto"
            draggable="false"
            style={{ pointerEvents: "none" }}
          />
        </Link>

        {/* Navegación principal: una sola línea, visible desde lg (1024px).
            lg:ml-10 se suma al gap-10 del contenedor para separarla más del
            logo (~80px) sin tocar el gap interno entre links (gap-8) ni el
            gap hacia el grupo de buscador/tema/carrito. */}
        <nav className="hidden lg:flex items-center gap-8 flex-shrink-0 lg:ml-10">
          {NAV_LINKS.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`pb-1 border-b-2 text-sm font-medium not-italic uppercase transition-colors ${
                  isActive
                    ? "border-primary text-foreground"
                    : "border-transparent text-foreground/60 hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Buscador + tema + carrito: pegados al extremo derecho */}
        <div className="ml-auto flex items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative hidden lg:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar productos..."
              className="w-[270px] h-[42px] bg-surface-card border border-surface-border/20 rounded pl-9 pr-3 text-sm not-italic text-foreground placeholder:text-foreground/50 focus:outline-none focus:border-primary/50 transition-all"
            />
          </form>

          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
            className="flex items-center justify-center w-[42px] h-[42px] rounded bg-surface-card border border-surface-border/20 text-foreground hover:text-primary transition flex-shrink-0"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={onCartClick}
            aria-label="Carrito"
            // Shark fijo (no --primary: en modo oscuro es Molten Red, y aquí
            // se pidió expresamente el cuadro en Shark en ambos temas).
            className="relative flex items-center justify-center w-14 h-[42px] rounded bg-[#23282D] text-[#DCE6D7] hover:bg-[#23282D]/85 transition-all flex-shrink-0"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              // Molten Red fijo + halo para que el badge resalte con fuerza
              // sobre el cuadro Shark.
              <span className="absolute -top-2 -right-2 bg-[#E63946] text-white border-2 border-surface-nav shadow-[0_0_10px_2px_rgba(230,57,70,0.65)] w-5 h-5 rounded-full text-xs flex items-center justify-center font-extrabold">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Menú desplegable de navegación (hasta lg) */}
      {isMenuOpen && (
        <div className="lg:hidden bg-surface-nav border-t border-surface-border/10 px-4 py-4 space-y-1">
          <form onSubmit={handleSearchSubmit} className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full h-[42px] bg-surface-card border border-surface-border/20 rounded pl-9 pr-3 text-sm not-italic text-foreground placeholder:text-foreground/50 focus:outline-none focus:border-primary/50 transition-all"
            />
          </form>

          {NAV_LINKS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setIsMenuOpen(false)}
              className={`block px-2 py-3 font-medium not-italic uppercase text-sm transition ${
                location.pathname === item.to ? "text-primary" : "hover:text-primary"
              }`}
            >
              {item.label}
            </Link>
          ))}

          <div className="border-t border-surface-border/10 my-2" />

          <Link
            to="/faq"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-2 px-2 py-3 font-medium not-italic uppercase text-sm hover:text-primary transition"
          >
            <HelpCircle size={16} />
            Preguntas Frecuentes
          </Link>
          <Link
            to="/politicas"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-2 px-2 py-3 font-medium not-italic uppercase text-sm hover:text-primary transition"
          >
            <FileText size={16} />
            Política de Privacidad
          </Link>
          <a
            href="https://wa.me/4434806689?text=Hola%20THE%20FORGE%20Quiero%20hacer%20un%20pedido"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-2 py-3 font-medium not-italic uppercase text-sm text-primary hover:text-primary/80 transition"
          >
            <MessageCircle size={16} />
            Escríbenos por WhatsApp
          </a>
        </div>
      )}
    </header>
  );
}
