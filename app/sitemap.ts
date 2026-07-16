import type { MetadataRoute } from "next";
import { categories, getPublishedTools } from "@/data/catalog";
import { absoluteUrl } from "@/lib/config";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["/", "/tools/", "/submit/", "/admin/"];
  return [...staticRoutes.map((path) => ({ url: absoluteUrl(path), lastModified: new Date() })), ...categories.map((category) => ({ url: absoluteUrl(`/categories/${category.slug}/`), lastModified: new Date() })), ...getPublishedTools().map((tool) => ({ url: absoluteUrl(`/tools/${tool.slug}/`), lastModified: new Date() }))];
}
