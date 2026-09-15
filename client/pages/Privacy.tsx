import { Link } from "react-router-dom";
import { ChevronLeft, Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/context/ThemeContext";
import { Footer } from "@/components/Footer";

export default function Privacy() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="bg-background text-foreground relative z-10 w-full min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur border-b border-secondary/30">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer">
            <img
              src={theme === "light" ? "/imagotipo-dark.svg" : "/imagotipo.svg"}
              alt="THE FORGE"
              className="h-8 sm:h-11 w-auto"
              draggable="false"
              style={{ pointerEvents: 'none' }}
            />
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              className="text-foreground hover:text-primary transition p-2 border border-secondary/30"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link to="/" className="text-foreground/70 hover:text-primary transition">
              <ChevronLeft size={24} />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-20 sm:pt-28 pb-20 max-w-4xl mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold italic uppercase mb-10">
          Política de Privacidad
        </h1>

        <div className="space-y-8 text-foreground/80 text-sm sm:text-base">
          <section>
            <h2 className="text-xl sm:text-2xl font-extrabold italic uppercase text-primary mb-4">
              Aviso de Privacidad
            </h2>
            <p className="mb-4">
              THE FORGE es responsable del tratamiento de los datos personales recabados a través de este sitio web.
            </p>
            <p className="mb-4">
              Podremos recopilar nombre completo, correo electrónico, número telefónico, dirección de envío e información necesaria para procesar pedidos.
            </p>
            <p className="mb-4">
              Los datos personales serán utilizados para procesar pedidos, gestionar envíos, brindar atención al cliente y compartir promociones cuando exista consentimiento.
            </p>
            <p>
              Los usuarios podrán solicitar el acceso, rectificación, cancelación u oposición respecto al tratamiento de sus datos personales mediante solicitud enviada al correo de contacto.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-extrabold italic uppercase text-primary mb-4">
              Política de Envíos
            </h2>
            <p className="mb-4">
              En THE FORGE nos comprometemos a procesar y enviar los pedidos de forma rápida y segura.
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Los pedidos son procesados dentro de 1 a 2 días hábiles posteriores a la confirmación del pago.</li>
              <li>Los tiempos de entrega pueden variar dependiendo de la ubicación del cliente y de la paquetería seleccionada.</li>
              <li>Una vez enviado el pedido, el cliente recibirá un número de rastreo para dar seguimiento a su envío.</li>
            </ul>
            <p className="mb-4 font-bold">
              Cobertura: Realizamos envíos a toda la República Mexicana.
            </p>
            <p className="mb-4">
              THE FORGE no es responsable por retrasos ocasionados por situaciones ajenas a nuestra operación, incluyendo eventos climáticos, incidencias logísticas, temporadas de alta demanda o problemas atribuibles a la empresa de mensajería.
            </p>
            <p className="mb-4">
              Es responsabilidad del cliente proporcionar información correcta y completa para la entrega. En caso de devolución por dirección incorrecta o incompleta, los costos de reenvío correrán por cuenta del cliente.
            </p>
            <p>
              Si tu pedido llega dañado o presenta alguna anomalía, deberás contactarnos dentro de las primeras 48 horas posteriores a la recepción del paquete enviando evidencia fotográfica al correo de atención al cliente.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-extrabold italic uppercase text-primary mb-4">
              Política de Devoluciones y Reembolsos
            </h2>
            <p className="mb-4">
              Debido a la naturaleza de los suplementos alimenticios y por razones de higiene y seguridad, THE FORGE no acepta devoluciones de productos abiertos, usados o con sellos de seguridad alterados.
            </p>
            <p className="mb-4 font-bold">
              Se podrá solicitar una devolución o reemplazo únicamente cuando:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>El producto recibido sea diferente al solicitado.</li>
              <li>El producto haya llegado dañado durante el transporte.</li>
              <li>El pedido se encuentre incompleto por error de preparación.</li>
            </ul>
            <p className="mb-4">
              Las solicitudes deberán realizarse dentro de las primeras 48 horas posteriores a la recepción del pedido.
            </p>
            <p className="mb-4">
              El cliente deberá proporcionar número de pedido, fotografías del producto y descripción del problema.
            </p>
            <p>
              Una vez validada la incidencia, THE FORGE podrá reemplazar el producto, emitir un reembolso parcial o total, u otorgar crédito para compras futuras.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-extrabold italic uppercase text-primary mb-4">
              Términos y Condiciones
            </h2>
            <p className="mb-4">
              Al acceder y utilizar el sitio web de THE FORGE, el usuario acepta los presentes Términos y Condiciones.
            </p>
            <p className="mb-4">
              THE FORGE comercializa suplementos alimenticios, accesorios y productos relacionados con el bienestar físico y deportivo.
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Todos los productos están sujetos a disponibilidad de inventario.</li>
              <li>Todos los precios se muestran en pesos mexicanos (MXN) e incluyen los impuestos aplicables salvo indicación expresa en contrario.</li>
              <li>Los pagos son procesados mediante plataformas externas seguras. THE FORGE no almacena información bancaria ni datos completos de tarjetas de crédito o débito.</li>
              <li>Todo el contenido del sitio, incluyendo logotipos, imágenes, diseños, textos y elementos gráficos, es propiedad de THE FORGE.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-extrabold italic uppercase text-primary mb-4">
              Descargo de Responsabilidad sobre Suplementos
            </h2>
            <p className="mb-4">
              Los productos comercializados por THE FORGE son suplementos alimenticios y no medicamentos.
            </p>
            <p className="mb-4">
              Estos productos no están destinados a diagnosticar, tratar, curar o prevenir enfermedades.
            </p>
            <p className="mb-4">
              Los resultados pueden variar entre individuos dependiendo de factores como alimentación, entrenamiento, descanso, genética y adherencia al programa nutricional.
            </p>
            <p>
              Antes de iniciar el consumo de cualquier suplemento alimenticio, se recomienda consultar con un profesional de la salud.
            </p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
