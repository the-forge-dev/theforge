import { useEffect, useRef } from "react";

// Al abrir un modal que no cambia la URL (ej. ficha de producto), el botón
// "atrás" del navegador normalmente sale de la página entera en vez de solo
// cerrar el modal. Este hook agrega una entrada de historial mientras el
// modal está abierto para que "atrás" lo cierre primero (vuelva a la lista),
// y solo en un segundo "atrás" salga de la página, como se espera.
export function useModalBackClose(isOpen: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    window.history.pushState({ modalOpen: true }, "");

    const handlePopState = () => onCloseRef.current();
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isOpen]);
}
