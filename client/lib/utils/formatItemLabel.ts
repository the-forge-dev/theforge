// Combina nombre de producto + variante para mostrarlo en un solo texto
// (mensajes de WhatsApp, notificaciones). Antes se envolvía la variante entre
// paréntesis, lo que producía paréntesis anidados cuando el nombre de la
// variante ya traía los suyos (ej. "Vainilla - 4 LBS (48 Serv.)").
export function formatItemLabel(name: string, variantName?: string | null): string {
  return variantName ? `${name} · ${variantName}` : name;
}
