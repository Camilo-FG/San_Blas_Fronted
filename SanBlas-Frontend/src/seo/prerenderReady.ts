/** Señal explícita para el script de prerender (Playwright). */
export function clearPrerenderReady() {
  if (typeof document === "undefined") return;
  delete document.documentElement.dataset.prerender;
}

export function setPrerenderReady() {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.prerender = "ready";
}
