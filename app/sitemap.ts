import type { MetadataRoute } from "next";
import { categories, getPublishedTools } from "@/data/catalog";
import { absoluteUrl } from "@/lib/config";
import { publicArticles } from "@/lib/articles";

export const dynamic = "force-static";

const lastModified = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/tools/"), lastModified, changeFrequency: "daily", priority: 0.95 },
    { url: absoluteUrl("/submit/"), lastModified, changeFrequency: "monthly", priority: 0.35 },
    { url: absoluteUrl("/blog/"), lastModified, changeFrequency: "weekly", priority: 0.7 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: absoluteUrl(`/categories/${category.slug}/`),
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const toolRoutes: MetadataRoute.Sitemap = getPublishedTools().map((tool) => ({
    url: absoluteUrl(`/tools/${tool.slug}/`),
    lastModified,
    changeFrequency: "weekly" as const,
    priority: tool.featured ? 0.8 : 0.65,
  }));

  const articleRoutes: MetadataRoute.Sitemap = publicArticles.map((article) => ({
    url: absoluteUrl(`/blog/${article.slug}/`),
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...toolRoutes, ...articleRoutes];
}
