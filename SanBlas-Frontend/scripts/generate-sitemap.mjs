import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE = "https://parroquiasanblas.org";

/** URLs canónicas sin trailing slash (salvo home "/"). Sin lastmod falso. */
const pages = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/sobre-nosotros", priority: "0.8", changefreq: "monthly" },
  { path: "/historia", priority: "0.8", changefreq: "monthly" },
  { path: "/horarios", priority: "0.9", changefreq: "weekly" },
  { path: "/contacto", priority: "0.8", changefreq: "monthly" },
  { path: "/eventos", priority: "0.8", changefreq: "weekly" },
  { path: "/bautizos", priority: "0.7", changefreq: "monthly" },
  { path: "/solicitudes-catequesis", priority: "0.7", changefreq: "monthly" },
  { path: "/solicitudes-cica", priority: "0.7", changefreq: "monthly" },
  {
    path: "/solicitudes-catequesis-bautismo",
    priority: "0.7",
    changefreq: "monthly",
  },
  { path: "/solicitudes-sacramentos", priority: "0.7", changefreq: "monthly" },
  { path: "/donaciones", priority: "0.6", changefreq: "monthly" },
];

const urls = pages
  .map(
    (p) => `  <url>
    <loc>${SITE}${p.path === "/" ? "/" : p.path}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`,
  )
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

const outDist = join(__dirname, "..", "dist", "sitemap.xml");
mkdirSync(dirname(outDist), { recursive: true });
writeFileSync(outDist, xml, "utf8");

console.log(`sitemap.xml → dist (${pages.length} URLs, sin lastmod de build)`);
