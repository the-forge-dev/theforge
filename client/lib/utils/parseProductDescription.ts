// La descripción de un producto se guarda como un solo texto con secciones
// marcadas en negrita ("**Cómo usar:** ..." / "**Por porción:** ..." /
// "**Tabla Nutrimental:** <url-imagen>"). Esto permite editarlas y mostrarlas
// como campos/acordeones independientes sin necesitar columnas nuevas en la
// base de datos.

export interface ParsedDescription {
  main: string;
  howToUse: string;
  perServing: string;
  nutritionFactsUrl: string;
}

export function parseDescription(description: string): ParsedDescription {
  const parts = (description || "").split(
    /\*\*(Cómo usar|Por porción|Tabla Nutrimental):?\*\*\s*/i,
  );
  const main = parts[0]?.trim() || "";
  const sections: { label: string; content: string }[] = [];
  for (let i = 1; i < parts.length; i += 2) {
    const label = parts[i];
    const content = parts[i + 1]?.trim();
    if (label && content) sections.push({ label, content });
  }
  return {
    main,
    howToUse: sections.find((s) => /cómo usar/i.test(s.label))?.content || "",
    perServing: sections.find((s) => /por porción/i.test(s.label))?.content || "",
    nutritionFactsUrl:
      sections.find((s) => /tabla nutrimental/i.test(s.label))?.content || "",
  };
}

export function buildDescription(parts: ParsedDescription): string {
  let desc = (parts.main || "").trim();
  if (parts.howToUse?.trim()) {
    desc += `${desc ? "\n\n" : ""}**Cómo usar:** ${parts.howToUse.trim()}`;
  }
  if (parts.perServing?.trim()) {
    desc += `${desc ? "\n\n" : ""}**Por porción:** ${parts.perServing.trim()}`;
  }
  if (parts.nutritionFactsUrl?.trim()) {
    desc += `${desc ? "\n\n" : ""}**Tabla Nutrimental:** ${parts.nutritionFactsUrl.trim()}`;
  }
  return desc;
}
