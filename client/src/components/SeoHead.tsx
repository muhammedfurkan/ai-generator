import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

interface SeoHeadProps {
  pageSlug?: string;
}

export function SeoHead({ pageSlug }: SeoHeadProps) {
  const [location] = useLocation();

  // Determine current page slug from location if not provided
  const currentSlug = pageSlug || location.replace(/^\//, "") || "home";

  // Fetch page-specific SEO settings
  const { data: pageSeo } = trpc.seo.getPage.useQuery(
    { pageSlug: currentSlug },
    { enabled: !!currentSlug }
  );

  // Fetch global SEO settings
  const { data: globalSeo } = trpc.seo.getGlobalConfig.useQuery();

  // Fetch public settings for dynamic favicon/logo
  const { data: publicSettings } = trpc.settings.getPublicSettings.useQuery();

  useEffect(() => {
    if (!pageSeo && !globalSeo) return;

    const setMetaTag = (
      name: string,
      content: string | null | undefined,
      property?: boolean
    ) => {
      if (!content) return;

      const attr = property ? "property" : "name";
      let meta = document.querySelector(
        `meta[${attr}="${name}"]`
      ) as HTMLMetaElement;

      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Helper to update or create link tag
    const setLinkTag = (rel: string, href: string | null | undefined) => {
      if (!href) return;

      let link = document.querySelector(
        `link[rel="${rel}"]`
      ) as HTMLLinkElement;

      if (!link) {
        link = document.createElement("link");
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.href = href;
    };

    // Set document title
    const title =
      pageSeo?.metaTitle || globalSeo?.defaultMetaTitle || "Lumiohan";
    document.title = title;

    // Basic meta tags
    setMetaTag(
      "description",
      pageSeo?.metaDescription || globalSeo?.defaultMetaDescription
    );
    setMetaTag(
      "keywords",
      pageSeo?.metaKeywords || globalSeo?.defaultMetaKeywords
    );
    setMetaTag("author", globalSeo?.siteName || "Lumiohan");

    // Robots
    if (pageSeo?.robotsIndex !== undefined) {
      const robotsContent = [
        pageSeo.robotsIndex ? "index" : "noindex",
        pageSeo.robotsFollow ? "follow" : "nofollow",
      ].join(", ");
      setMetaTag("robots", robotsContent);
    }

    // Canonical URL
    setLinkTag("canonical", pageSeo?.canonicalUrl);

    // Dynamic favicon from site settings
    const faviconUrl = publicSettings?.find(
      s => s.key === "site_favicon_url"
    )?.value;
    if (faviconUrl) {
      setLinkTag("icon", faviconUrl);
      setLinkTag("shortcut icon", faviconUrl);
      setLinkTag("apple-touch-icon", faviconUrl);
    }
    // Open Graph (Facebook)
    setMetaTag("og:type", "website", true);
    setMetaTag("og:site_name", globalSeo?.siteName || "Lumiohan", true);
    setMetaTag(
      "og:title",
      pageSeo?.ogTitle || pageSeo?.metaTitle || title,
      true
    );
    setMetaTag(
      "og:description",
      pageSeo?.ogDescription ||
        pageSeo?.metaDescription ||
        globalSeo?.defaultMetaDescription,
      true
    );
    setMetaTag("og:image", pageSeo?.ogImage || globalSeo?.defaultOgImage, true);
    setMetaTag("og:url", pageSeo?.canonicalUrl || window.location.href, true);
    setMetaTag(
      "og:locale",
      globalSeo?.defaultLanguage === "tr" ? "tr_TR" : "en_US",
      true
    );

    // Twitter Card
    setMetaTag("twitter:card", "summary_large_image", true);
    setMetaTag("twitter:site", globalSeo?.defaultTwitterSite, true);
    setMetaTag("twitter:creator", globalSeo?.defaultTwitterCreator, true);
    setMetaTag(
      "twitter:title",
      pageSeo?.twitterTitle || pageSeo?.ogTitle || pageSeo?.metaTitle || title,
      true
    );
    setMetaTag(
      "twitter:description",
      pageSeo?.twitterDescription ||
        pageSeo?.ogDescription ||
        pageSeo?.metaDescription,
      true
    );
    setMetaTag(
      "twitter:image",
      pageSeo?.twitterImage || pageSeo?.ogImage || globalSeo?.defaultOgImage,
      true
    );

    // Structured Data (JSON-LD)
    if (pageSeo?.structuredData) {
      let script = document.querySelector(
        'script[type="application/ld+json"]'
      ) as HTMLScriptElement;

      if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }

      try {
        // Validate JSON before setting
        JSON.parse(pageSeo.structuredData);
        script.textContent = pageSeo.structuredData;
      } catch {
        // Invalid JSON, skip
      }
    }

    // Cleanup function
    return () => {
      // Optional: Remove dynamic tags on unmount
      // This is usually not needed as we update them on route change
    };
  }, [pageSeo, globalSeo, publicSettings]);

  return null; // This component doesn't render anything
}

// Hook for programmatic SEO updates
export function useSeo(options: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}) {
  useEffect(() => {
    if (options.title) {
      document.title = options.title;

      let ogTitle = document.querySelector(
        'meta[property="og:title"]'
      ) as HTMLMetaElement;
      if (!ogTitle) {
        ogTitle = document.createElement("meta");
        ogTitle.setAttribute("property", "og:title");
        document.head.appendChild(ogTitle);
      }
      ogTitle.content = options.title;
    }

    if (options.description) {
      let desc = document.querySelector(
        'meta[name="description"]'
      ) as HTMLMetaElement;
      if (!desc) {
        desc = document.createElement("meta");
        desc.name = "description";
        document.head.appendChild(desc);
      }
      desc.content = options.description;

      let ogDesc = document.querySelector(
        'meta[property="og:description"]'
      ) as HTMLMetaElement;
      if (!ogDesc) {
        ogDesc = document.createElement("meta");
        ogDesc.setAttribute("property", "og:description");
        document.head.appendChild(ogDesc);
      }
      ogDesc.content = options.description;
    }

    if (options.image) {
      let ogImage = document.querySelector(
        'meta[property="og:image"]'
      ) as HTMLMetaElement;
      if (!ogImage) {
        ogImage = document.createElement("meta");
        ogImage.setAttribute("property", "og:image");
        document.head.appendChild(ogImage);
      }
      ogImage.content = options.image;
    }

    if (options.url) {
      let canonical = document.querySelector(
        'link[rel="canonical"]'
      ) as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
      }
      canonical.href = options.url;
    }
  }, [options.title, options.description, options.image, options.url]);
}
