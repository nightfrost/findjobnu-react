import React, { useEffect } from "react";

export type SeoProps = {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
};

const SITE_NAME = "FindJob.nu";
const BASE_URL = "https://findjob.nu";

function upsertMeta(selector: string, attribute: "name" | "property", value: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`${selector}[${attribute}="${value}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attribute, value);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

const Seo: React.FC<SeoProps> = ({ title, description, path, noIndex, jsonLd }) => {
  useEffect(() => {
    const url = path ? `${BASE_URL}${path}` : BASE_URL;
    const robots = noIndex ? "noindex,nofollow" : "index,follow";

    document.title = title;
    upsertMeta("meta", "name", "description", description);
    upsertMeta("meta", "name", "robots", robots);
    upsertLink("canonical", url);

    upsertMeta("meta", "property", "og:title", title);
    upsertMeta("meta", "property", "og:description", description);
    upsertMeta("meta", "property", "og:type", "website");
    upsertMeta("meta", "property", "og:url", url);
    upsertMeta("meta", "property", "og:site_name", SITE_NAME);

    upsertMeta("meta", "name", "twitter:card", "summary_large_image");
    upsertMeta("meta", "name", "twitter:title", title);
    upsertMeta("meta", "name", "twitter:description", description);

    // Replace any existing JSON-LD scripts we added
    document.head.querySelectorAll<HTMLScriptElement>("script[data-seo-jsonld='true']").forEach((el) => el.remove());
    const jsonList: Array<Record<string, unknown>> = [];
    if (Array.isArray(jsonLd)) {
      jsonList.push(...jsonLd);
    } else if (jsonLd) {
      jsonList.push(jsonLd);
    }

    jsonList.forEach((item, idx) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.seoJsonld = "true";
      script.dataset.seoJsonldIdx = String(idx);
      script.textContent = JSON.stringify(item);
      document.head.appendChild(script);
    });
  }, [title, description, path, noIndex, jsonLd]);

  return null;
};

export default Seo;
