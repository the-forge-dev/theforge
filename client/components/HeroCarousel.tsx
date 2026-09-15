import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface HeroSlide {
  image: string;
  eyebrow?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  ctaText: string;
  ctaLink: string;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
  intervalMs?: number;
}

export function HeroCarousel({ slides, intervalMs = 6000 }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const hasMultiple = slides.length > 1;

  useEffect(() => {
    if (!hasMultiple) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [hasMultiple, slides.length, intervalMs]);

  const goTo = (index: number) => {
    setCurrent(((index % slides.length) + slides.length) % slides.length);
  };

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-background">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === current ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          style={{
            backgroundImage: `url('${slide.image}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ))}

      {/* Overlay: oscurece lo suficiente para leer el texto sin tapar la foto */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

      {/* Contenido del slide actual */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        {slides[current].eyebrow && (
          <p className="text-primary font-bold italic uppercase text-sm sm:text-base mb-3 sm:mb-4 tracking-wide">
            {slides[current].eyebrow}
          </p>
        )}

        <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold italic uppercase mb-6 sm:mb-8 leading-tight drop-shadow-lg">
          {slides[current].title}
          {slides[current].highlight && (
            <>
              <br />
              <span className="text-primary drop-shadow-lg">{slides[current].highlight}</span>
            </>
          )}
        </h2>

        {slides[current].subtitle && (
          <p className="text-sm sm:text-base md:text-lg lg:text-2xl text-foreground/90 mb-8 sm:mb-12 max-w-3xl mx-auto italic font-medium drop-shadow-md">
            {slides[current].subtitle}
          </p>
        )}

        <Link
          to={slides[current].ctaLink}
          className="bg-primary text-primary-foreground px-6 sm:px-10 py-3 sm:py-5 font-extrabold italic uppercase text-sm sm:text-base md:text-lg lg:text-xl hover:bg-opacity-90 transition-all transform hover:scale-110 inline-block shadow-lg border-2 border-primary/50"
        >
          {slides[current].ctaText}
        </Link>
      </div>

      {hasMultiple && (
        <>
          {/* Flechas */}
          <button
            onClick={() => goTo(current - 1)}
            aria-label="Anterior"
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/50 hover:bg-background/80 border border-secondary/30 text-foreground p-2 transition"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => goTo(current + 1)}
            aria-label="Siguiente"
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/50 hover:bg-background/80 border border-secondary/30 text-foreground p-2 transition"
          >
            <ChevronRight size={24} />
          </button>

          {/* Puntos */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goTo(index)}
                aria-label={`Ir al slide ${index + 1}`}
                className={`h-2 transition-all ${
                  index === current ? "w-8 bg-primary" : "w-2 bg-foreground/40 hover:bg-foreground/60"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
