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

  useEffect(() => {
    clearPrerenderReady();
    if (!base || !contentReady) return;
    // Deja que Helmet aplique title/metas en el DOM antes de señalizar.
    const id = requestAnimationFrame(() => setPrerenderReady());
    return () => {
      cancelAnimationFrame(id);
      clearPrerenderReady();
    };
  }, [base, contentReady, page, overrides, jsonLd]);

  if (!base) return null;

  const meta = { ...base, ...overrides };
  // Canónicos sin trailing slash (salvo home).
  const path = page === "/" ? "" : page.replace(/\/+$/, "");
  const canonical = (meta.canonical || `${SITE_URL}${path}`).replace(
    /^(https?:\/\/[^/]+)\/+$/,
    "$1",
  );
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
