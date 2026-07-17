import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";

export const dynamic = "force-static";

const aiCrawlerAgents = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-User",
  "anthropic-ai",
  "Google-Extended",
  "GoogleOther",
  "GoogleOther-Image",
  "GoogleOther-Video",
  "PerplexityBot",
  "Perplexity-User",
  "YouBot",
  "Bytespider",
  "Applebot",
  "Applebot-Extended",
  "Meta-ExternalAgent",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/outbound"] },
      ...aiCrawlerAgents.map((userAgent) => ({ userAgent, allow: "/", disallow: ["/admin/", "/api/outbound"] })),
    ],
    sitemap: `${siteConfig.siteUrl}/sitemap.xml`,
  };
}
