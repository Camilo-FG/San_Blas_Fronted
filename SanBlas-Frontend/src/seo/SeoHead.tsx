import { Helmet } from 'react-helmet-async';
import { pageMetadata } from './metadata';
import type { PageMeta } from './metadata';
import { getOrganizationSchema, getWebSiteSchema, getBreadcrumbSchema } from './structuredData';

interface SeoHeadProps {
  page: string;
  overrides?: Partial<PageMeta>;
  jsonLd?: Record<string, unknown>[];
}

const SITE = 'https://sanblasfrontend.netlify.app';
const OG_IMAGE = 'https://sanblasfrontend.netlify.app/logo.png';

export default function SeoHead({ page, overrides = {}, jsonLd = [] }: SeoHeadProps) {
  const base = pageMetadata[page];
  if (!base) return null;

  const meta = { ...base, ...overrides };
  const schemas = [
    getOrganizationSchema(),
    ...(meta.breadcrumbs?.length > 1 ? [getBreadcrumbSchema(meta.breadcrumbs)] : []),
    ...(page === '/' ? [getWebSiteSchema()] : []),
    ...jsonLd,
  ];

  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      {meta.robots && <meta name="robots" content={meta.robots} />}
      <link rel="canonical" href={meta.canonical || `${SITE}${page}`} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={meta.ogImage || OG_IMAGE} />
      <meta property="og:url" content={meta.canonical || `${SITE}${page}`} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={meta.ogImage || OG_IMAGE} />
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}