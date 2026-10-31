import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { pageMetadata, type PageMeta } from "./metadata";
import {
  getOrganizationSchema,
  getWebSiteSchema,
  getBreadcrumbSchema,
} from "./structuredData";
import { clearPrerenderReady, setPrerenderReady } from "./prerenderReady";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "./site";

interface SeoHeadProps {
  page: string;
  overrides?: Partial<PageMeta>;
  jsonLd?: Record<string, unknown>[];
  /** false mientras faltan datos críticos (API); el prerender espera a true. */
  contentReady?: boolean;
}

export default function SeoHead({
  page,
  overrides = {},
  jsonLd = [],
  contentReady = true,
}: SeoHeadProps) {
  const base = pageMetadata[page];
  const meta = base ? { ...base, ...overrides } : null;
  // Netlify Pretty URLs sirve /ruta/ desde ruta/index.html → canónico con slash
  // en páginas públicas indexables (evita pelear con 301 de Pretty URLs).
  const pathBare = page === "/" ? "" : page.replace(/\/+$/, "");
  let canonical = meta?.canonical || `${SITE_URL}${pathBare}`;
  const isPublicIndexable =
    page !== "/" && !(meta?.robots ?? "index, follow").includes("noindex");
  if (isPublicIndexable) {
    canonical = canonical.replace(/\/?$/, "/");
  } else if (page === "/") {
    canonical = SITE_URL;
  }

  useEffect(() => {
    clearPrerenderReady();
    if (!meta || !contentReady) return;
    // Tiempo para que Helmet escriba title/canonical en el DOM.
    const id = window.setTimeout(() => setPrerenderReady(), 250);
    return () => {
      window.clearTimeout(id);
      clearPrerenderReady();
    };
  }, [contentReady, page, meta?.title, canonical, jsonLd]);

  if (!meta) return null;

  const ogImage = meta.ogImage || DEFAULT_OG_IMAGE;
  const robots = meta.robots ?? "index, follow";

  const schemas = [
    getOrganizationSchema(),
    ...(meta.breadcrumbs && meta.breadcrumbs.length > 1
      ? [getBreadcrumbSchema(meta.breadcrumbs)]
      : []),
    ...(page === "/" ? [getWebSiteSchema()] : []),
    ...jsonLd,
  ];

  return (
    <Helmet>
      <html lang="es-CR" />
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="robots" content={robots} />
      <meta name="author" content={SITE_NAME} />
      <meta name="theme-color" content="#003366" />
      <link rel="canonical" href={canonical} />

      <meta property="og:locale" content="es_CR" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={SITE_NAME} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={ogImage} />

      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}
