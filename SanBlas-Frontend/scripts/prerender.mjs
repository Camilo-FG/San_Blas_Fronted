/**
 * Post-build: visita rutas públicas con Playwright y guarda HTML en dist/
 * para que crawlers vean title/h1/texto sin ejecutar JS en el cliente.
 *
 * Hidratación del cliente: createRoot (no hydrateRoot) — el HTML es para
 * crawlers; React remonta el árbol. TanStack Router + Playwright (Vite 8).
 */
import { spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dist = join(root, "dist");
const HOST = "127.0.0.1";
const PORT = 4179;
const BASE = `http://${HOST}:${PORT}`;

const ROUTES = [
  "/",
  "/sobre-nosotros",
  "/historia",
  "/horarios",
  "/contacto",
  "/eventos",
  "/bautizos",
  "/solicitudes-catequesis",
  "/solicitudes-cica",
  "/solicitudes-catequesis-bautismo",
  "/solicitudes-sacramentos",
  "/donaciones",
  "/404",
];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, attempts = 40) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404) return;
    } catch {
      // reintentar
    }
    await wait(250);
  }
  throw new Error(`Preview no respondió en ${url}`);
}

function outPathFor(route) {
  if (route === "/") return join(dist, "index.html");
  if (route === "/404") return join(dist, "404.html");
  // Pretty URL sin trailing slash: /horarios → horarios/index.html
  return join(dist, route.slice(1), "index.html");
}

function apiBaseUrl() {
  return (
    process.env.VITE_API_URL?.replace(/\/+$/, "") ||
    process.env.API_URL?.replace(/\/+$/, "") ||
    ""
  );
}

/** Falla el build si la API no responde (evita publicar defaults en silencio). */
async function assertApiReachable() {
  const allowOffline = process.env.PRERENDER_ALLOW_OFFLINE === "1";
  const base = apiBaseUrl();
  if (!base) {
    if (allowOffline) {
      console.warn(
        "[prerender] Sin VITE_API_URL y PRERENDER_ALLOW_OFFLINE=1 — se continúa sin healthcheck.",
      );
      return;
    }
    throw new Error(
      "[prerender] Falta VITE_API_URL. Defínela en el build de Netlify, o usa PRERENDER_ALLOW_OFFLINE=1 solo en local.",
    );
  }

  const url = `${base}/landing`;
  let lastError = "";
  for (let i = 0; i < 5; i++) {
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(15_000),
      });
      if (res.ok) {
        console.log(`[prerender] API OK: ${url}`);
        return;
      }
      lastError = `HTTP ${res.status}`;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
    await wait(1000 * (i + 1));
  }

  if (allowOffline) {
    console.warn(
      `[prerender] API no alcanzable (${url}: ${lastError}) — PRERENDER_ALLOW_OFFLINE=1, se continúa.`,
    );
    return;
  }

  throw new Error(
    `[prerender] API no alcanzable en ${url} (${lastError}). No se publican defaults silenciosos. Reintenta cuando Railway esté arriba, o PRERENDER_ALLOW_OFFLINE=1 solo en local.`,
  );
}

/** Conserva solo la primera o la última coincidencia. */
function keepOne(html, regex, which) {
  const matches = html.match(regex) || [];
  if (matches.length <= 1) return html;
  let i = 0;
  return html.replace(regex, (match) => {
    i += 1;
    if (which === "first") return i === 1 ? match : "";
    return i === matches.length ? match : "";
  });
}

/** Quita el host del preview y deduplica title/metas. */
function cleanHtml(html) {
  let out = html.replaceAll(BASE, "");
  // No persistir la señal de prerender (evitar falsos "ready" en visitas siguientes).
  out = out.replace(/\s*data-prerender="[^"]*"/gi, "");
  out = keepOne(out, /<title>[\s\S]*?<\/title>/gi, "first");
  out = keepOne(out, /<meta[^>]*name=["']description["'][^>]*>/gi, "last");
  out = keepOne(out, /<meta[^>]*name=["']robots["'][^>]*>/gi, "last");
  out = keepOne(out, /<link[^>]*rel=["']canonical["'][^>]*>/gi, "last");
  out = keepOne(out, /<meta[^>]*property=["']og:title["'][^>]*>/gi, "last");
  out = keepOne(out, /<meta[^>]*property=["']og:description["'][^>]*>/gi, "last");
  out = keepOne(out, /<meta[^>]*property=["']og:url["'][^>]*>/gi, "last");
  out = keepOne(out, /<meta[^>]*property=["']og:image["'][^>]*>/gi, "last");
  out = keepOne(out, /<meta[^>]*name=["']twitter:title["'][^>]*>/gi, "last");
  out = keepOne(out, /<meta[^>]*name=["']twitter:description["'][^>]*>/gi, "last");
  out = keepOne(out, /<meta[^>]*name=["']twitter:image["'][^>]*>/gi, "last");
  return out;
}

/** Mata preview + hijos (en Netlify el shell/pnpm deja vite vivo si solo kill al padre). */
function killPreviewTree(child) {
  if (!child?.pid) return;
  try {
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
        stdio: "ignore",
        windowsHide: true,
      });
      return;
    }
    // Grupo de procesos (requiere detached al spawn).
    process.kill(-child.pid, "SIGKILL");
  } catch {
    try {
      child.kill("SIGKILL");
    } catch {
      // ya cerrado
    }
  }
}

async function main() {
  await assertApiReachable();

  const preview = spawn(
    "pnpm",
    ["exec", "vite", "preview", "--host", HOST, "--port", String(PORT), "--strictPort"],
    {
      cwd: root,
      shell: true,
      // detached: grupo propio → se puede matar el árbol en Linux/Netlify
      detached: process.platform !== "win32",
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, BROWSER: "none" },
    },
  );

  let previewLog = "";
  preview.stdout?.on("data", (chunk) => {
    previewLog += String(chunk);
  });
  preview.stderr?.on("data", (chunk) => {
    previewLog += String(chunk);
  });

  let browser;
  let failed = false;

  try {
    // Shell limpio de Vite (sin data-prerender). Evita que el fallback SPA
    // sirva un index.html ya prerenderizado con ready=true de otra ruta.
    const spaShell = await readFile(join(dist, "index.html"), "utf8");

    await waitForServer(BASE);
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    let homeHtml = null;

    for (const route of ROUTES) {
      const file = outPathFor(route);
      // Quitar HTML previo de esta ruta para forzar el boot SPA desde el shell.
      if (route !== "/") {
        await rm(file, { force: true });
        if (route !== "/404") {
          await rm(dirname(file), { recursive: true, force: true });
        }
      }
      await writeFile(join(dist, "index.html"), spaShell, "utf8");

      const page = await context.newPage();
      const response = await page.goto(`${BASE}${route}`, {
        waitUntil: "domcontentloaded",
        timeout: 60_000,
      });
      // ready + último canonical de la ruta (Helmet puede dejar varios links).
      await page.waitForFunction(
        (expectedRoute) => {
          if (document.documentElement.dataset.prerender !== "ready") {
            return false;
          }
          const links = [
            ...document.querySelectorAll('link[rel="canonical"]'),
          ];
          const href = links.at(-1)?.getAttribute("href") || "";
          try {
            const path = new URL(href).pathname.replace(/\/+$/, "") || "/";
            const want = expectedRoute.replace(/\/+$/, "") || "/";
            if (path !== want) return false;
          } catch {
            return false;
          }
          // Home: el shell de Vite ya tiene title/canonical; exigir h1 montado.
          if (expectedRoute === "/" || expectedRoute === "/404") {
            return Boolean(document.querySelector("h1"));
          }
          return true;
        },
        route,
        { timeout: 60_000 },
      );
      const html = cleanHtml(await page.content());
      await mkdir(dirname(file), { recursive: true });
      await writeFile(file, html, "utf8");
      if (route === "/") homeHtml = html;
      const status = response?.status() ?? "?";
      console.log(`prerender ${route} → ${file.replace(root, ".")} (${status})`);
      await page.close();
    }

    // Dejar index.html = home prerenderizado (el loop lo sobrescribe con el shell).
    if (homeHtml) {
      await writeFile(join(dist, "index.html"), homeHtml, "utf8");
    }

    console.log(`Prerender listo (${ROUTES.length} rutas).`);
  } catch (error) {
    failed = true;
    console.error("Prerender falló:", error);
    console.error(previewLog.slice(-2000));
  } finally {
    try {
      await browser?.close();
    } catch {
      // ignore
    }
    killPreviewTree(preview);
    // Evitar que pipes del preview mantengan el event loop vivo.
    preview.stdout?.destroy();
    preview.stderr?.destroy();
    await wait(200);
  }

  // Netlify se queda en Building si Node no sale (vite/playwright huérfanos).
  process.exit(failed ? 1 : 0);
}

main().catch((error) => {
  console.error("Prerender falló:", error);
  process.exit(1);
});
