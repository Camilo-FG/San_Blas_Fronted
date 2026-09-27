export function claseResaltePreview(
  activo: boolean,
  tono: "claro" | "oscuro" = "claro",
) {
  if (!activo) return "";
  if (tono === "oscuro") {
    return "rounded-md bg-royal-gold/25 px-1.5 outline-2 outline-offset-2 outline-white shadow-[0_0_0_3px_rgba(212,175,55,0.95),0_0_18px_rgba(212,175,55,0.8)]";
  }
  return "rounded-md bg-royal-gold/20 px-1 outline-2 outline-offset-2 outline-royal-gold shadow-[0_0_0_3px_rgba(212,175,55,0.4)]";
}
