import { AlertTriangle, Instagram, Facebook, MessageCircle } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground overflow-hidden relative">
      {/* Animated background elements using brand colors */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-md mx-auto px-6 text-center">
        {/* Logo section */}
        <div className="mb-8 flex justify-center">
          <img
            alt="THE FORGE"
            src="/logo.png"
            className="h-32 w-auto object-contain drop-shadow-lg"
          />
        </div>

        {/* Alert icon */}
        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-primary/20 border border-primary/50 rounded-full">
            <AlertTriangle className="w-8 h-8 text-primary" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold italic uppercase mb-4 tracking-tight">
          Estamos realizando mejoras
        </h1>

        {/* Description */}
        <p className="text-lg text-foreground/80 mb-8 leading-relaxed">
          Nuestro sistema se encuentra temporalmente en mantenimiento. Por favor intenta
          nuevamente más tarde.
        </p>

        {/* Status badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/30 border border-secondary/50 rounded-full mb-8">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-sm text-foreground/70 font-bold italic">En mantenimiento</span>
        </div>

        {/* Footer text */}
        <p className="text-sm text-foreground/60">
          Gracias por tu paciencia. Volveremos pronto con mejoras emocionantes.
        </p>

        {/* Social Media Links */}
        <div className="mt-12 pt-8 border-t border-secondary/30 space-y-6">
          <div className="flex items-center justify-center gap-6">
            <a
              href="https://www.instagram.com/theforgemx?igsh=MXJkdWtoejB3NXpjZQ=="
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/70 hover:text-primary transition transform hover:scale-110"
              aria-label="Instagram"
            >
              <Instagram size={24} />
            </a>
            <a
              href="https://www.facebook.com/share/1ADFHj1jFi/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/70 hover:text-primary transition transform hover:scale-110"
              aria-label="Facebook"
            >
              <Facebook size={24} />
            </a>
            <a
              href="https://wa.me/4434806689?text=Hola%20THE%20FORGE%20Quiero%20hacer%20un%20pedido"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/70 hover:text-primary transition transform hover:scale-110"
              aria-label="WhatsApp"
            >
              <MessageCircle size={24} />
            </a>
          </div>

          <p className="text-xs text-foreground/50">THE FORGE © 2026</p>
        </div>
      </div>
    </div>
  );
}
