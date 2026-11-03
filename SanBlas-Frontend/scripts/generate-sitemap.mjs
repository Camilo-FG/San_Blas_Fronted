import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Sitemap vacío: el sitio no debe indexarse en motores de búsqueda. */
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>
`;

const outDist = join(__dirname, "..", "dist", "sitemap.xml");
mkdirSync(dirname(outDist), { recursive: true });
writeFileSync(outDist, xml, "utf8");

console.log("sitemap.xml → dist (vacío; sitio noindex)");
