import { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, MessageCircle, Mail, MapPin, ChevronDown } from "lucide-react";
import { useTheme } from "@/lib/context/ThemeContext";

const WHATSAPP_LINK = "https://wa.me/4434806689?text=Hola%20THE%20FORGE%20Quiero%20hacer%20un%20pedido";
const CONTACT_EMAIL = "theforgesupplements@gmail.com";

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/theforgemx?igsh=MXJkdWtoejB3NXpjZQ==", icon: Instagram },
  { label: "Facebook", href: "https://www.facebook.com/share/1ADFHj1jFi/", icon: Facebook },
  { label: "TikTok", href: "https://www.tiktok.com/@theforgemx?_r=1&_t=ZS-97DuWxpR04a", icon: "tiktok" as const },
  { label: "WhatsApp", href: WHATSAPP_LINK, icon: MessageCircle },
];

const SHOP_LINKS = [
  { label: "Inicio", to: "/" },
  { label: "Suplementos", to: "/productos" },
  { label: "Ropa", to: "/ropa", comingSoon: true },
  { label: "Accesorios", to: "/accesorios", comingSoon: true },
  { label: "Marcas", to: "/marcas", comingSoon: true },
];

// Rutas reales confirmadas en AppLayout.tsx en el momento de este rediseño:
// / /productos /admin /politicas /terminos /envios-y-devoluciones /faq
// /ropa /accesorios /marcas /blog
// "Nosotros" apunta a /blog (misma página que el navbar renombró de "Blog" a
// "Nosotros"). El contenido de /politicas se dividió: Términos y Condiciones
// y Envíos y Devoluciones ahora son páginas propias con el contenido que
// antes vivía dentro de Política de Privacidad.
const COMPANY_LINKS = [
  { label: "Nosotros", to: "/blog" },
  { label: "Política de Privacidad", to: "/politicas" },
  { label: "Términos y Condiciones", to: "/terminos" },
  { label: "Preguntas Frecuentes", to: "/faq" },
  { label: "Envíos y Devoluciones", to: "/envios-y-devoluciones" },
];

const linkClasses =
  "text-sm not-italic font-medium text-foreground/60 hover:text-primary transition-colors duration-200";

function ShopLinksNav() {
  return (
    <nav className="flex flex-col gap-3 sm:gap-2">
      {SHOP_LINKS.map((link) => (
        <Link key={link.label} to={link.to} className={`${linkClasses} flex items-center gap-2`}>
          {link.label}
          {link.comingSoon && (
            <span className="text-[10px] font-semibold not-italic uppercase tracking-wide text-secondary/70 border border-surface-border/20 rounded-full px-1.5 py-0.5 leading-none">
              Próximamente
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}

function CompanyLinksNav() {
  return (
    <nav className="flex flex-col gap-3 sm:gap-2">
      {COMPANY_LINKS.map((link) => (
        <Link key={link.label} to={link.to} className={linkClasses}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

function ContactDetails() {
  return (
    <div className="flex flex-col gap-3.5">
      <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 group">
        <MessageCircle size={17} className="text-foreground/50 group-hover:text-primary transition-colors duration-200 mt-0.5 flex-shrink-0" />
        <span>
          <span className="block text-sm not-italic font-medium text-foreground/85 group-hover:text-primary transition-colors duration-200">
            WhatsApp
          </span>
          <span className="block text-xs not-italic text-foreground/50">
            Escríbenos, estamos para ayudarte.
          </span>
        </span>
      </a>
      <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-start gap-3 group">
        <Mail size={17} className="text-foreground/50 group-hover:text-primary transition-colors duration-200 mt-0.5 flex-shrink-0" />
        <span>
          <span className="block text-sm not-italic font-medium text-foreground/85 group-hover:text-primary transition-colors duration-200 break-all">
            {CONTACT_EMAIL}
          </span>
          <span className="block text-xs not-italic text-foreground/50">
            Respondemos en menos de 24h.
          </span>
        </span>
      </a>
      <div className="flex items-start gap-3">
        <MapPin size={17} className="text-foreground/50 mt-0.5 flex-shrink-0" />
        <span>
          <span className="block text-sm not-italic font-medium text-foreground/85">
            México
          </span>
          <span className="block text-xs not-italic text-foreground/50">
            Envíos a todo el país.
          </span>
        </span>
      </div>
    </div>
  );
}

// Sección expansible usada solo en mobile (< sm) para Tienda/Compañía/Contacto,
// igual que el patrón de acordeón de referencia: título + chevron + contenido
// colapsable, con divider entre secciones. Cerrada por defecto para que el
// footer no ocupe media pantalla en mobile.
function FooterAccordionItem({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-surface-border/10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="text-primary text-[13px] font-bold not-italic uppercase tracking-wide">
          {title}
        </span>
        <ChevronDown
          size={18}
          className={`text-foreground/50 transition-transform duration-200 flex-shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div className={`grid transition-all duration-200 ease-in-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className="pb-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

function SocialLinks() {
  return (
    <div className="flex items-center gap-2.5 pt-1">
      {SOCIAL_LINKS.map((social) => (
        <a
          key={social.label}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={social.label}
          className="flex items-center justify-center w-10 h-10 rounded bg-surface-card border border-surface-border/15 text-foreground/70 hover:text-primary hover:border-primary/40 transition-colors duration-200"
        >
          {social.icon === "tiktok" ? (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.1 1.82 2.89 2.89 0 0 1 2.31-4.64 2.86 2.86 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.54-.05z"/>
            </svg>
          ) : (
            <social.icon size={17} />
          )}
        </a>
      ))}
    </div>
  );
}

export function Footer() {
  const { theme } = useTheme();

  const logo = (
    <img
      src={theme === "light" ? "/imagotipo-dark.svg" : "/imagotipo.svg"}
      alt="THE FORGE"
      className="h-9 w-auto"
      draggable="false"
      style={{ pointerEvents: "none" }}
    />
  );

  return (
    <footer className="bg-surface-page border-t border-surface-border/10">
      <div className="max-w-[1920px] mx-auto px-6 lg:px-[60px] pt-10 sm:pt-12 pb-8 sm:pb-10">
        {/* Mobile (< sm): marca estática + Tienda/Compañía/Contacto como acordeón expansible */}
        <div className="sm:hidden">
          <div className="space-y-4">
            {logo}
            <p className="text-secondary text-[11px] font-semibold not-italic uppercase tracking-[0.18em]">
              Disciplina. Resultados. Sin excusas.
            </p>
            <p className="text-foreground/70 text-sm not-italic max-w-xs leading-relaxed">
              Suplementos deportivos para quienes entrenan con propósito.
            </p>
            <SocialLinks />
          </div>

          <div className="border-t border-surface-border/10 mt-6">
            <FooterAccordionItem title="Tienda">
              <ShopLinksNav />
            </FooterAccordionItem>
            <FooterAccordionItem title="Compañía">
              <CompanyLinksNav />
            </FooterAccordionItem>
            <FooterAccordionItem title="Contacto">
              <ContactDetails />
            </FooterAccordionItem>
          </div>
        </div>

        {/* Tablet/Desktop (>= sm): columnas fijas, sin acordeón */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-[26fr_18fr_22fr_30fr] gap-x-14 xl:gap-x-20 gap-y-10">
          <div className="col-span-2 lg:col-span-1 space-y-4">
            {logo}
            <p className="text-secondary text-[11px] font-semibold not-italic uppercase tracking-[0.18em]">
              Disciplina. Resultados. Sin excusas.
            </p>
            <p className="text-foreground/70 text-sm not-italic max-w-xs leading-relaxed">
              Suplementos deportivos para quienes entrenan con propósito.
            </p>
            <SocialLinks />
          </div>

          <div className="lg:border-l lg:border-surface-border/10 lg:pl-10 space-y-4">
            <h3 className="text-primary text-[13px] font-bold not-italic uppercase tracking-wide leading-none">
              Tienda
            </h3>
            <ShopLinksNav />
          </div>

          <div className="lg:border-l lg:border-surface-border/10 lg:pl-10 space-y-4">
            <h3 className="text-primary text-[13px] font-bold not-italic uppercase tracking-wide leading-none">
              Compañía
            </h3>
            <CompanyLinksNav />
          </div>

          <div className="lg:border-l lg:border-surface-border/10 lg:pl-10 space-y-4">
            <h3 className="text-primary text-[13px] font-bold not-italic uppercase tracking-wide leading-none">
              Contacto
            </h3>
            <ContactDetails />
          </div>
        </div>

        <div className="border-t border-surface-border/10 mt-8 sm:mt-9 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-secondary text-xs not-italic text-center sm:text-left">
            © 2026 The Forge. Todos los derechos reservados.
          </p>
          <p className="text-secondary text-xs not-italic text-center sm:text-right">
            Built Under Pressure.
          </p>
        </div>
      </div>
    </footer>
  );
}
