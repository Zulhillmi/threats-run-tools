export type PricingModel = "free" | "open-source" | "freemium" | "paid" | "enterprise";
export type ToolStatus = "published" | "draft" | "archived";

export type Tool = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  websiteUrl: string;
  githubUrl?: string;
  docsUrl?: string;
  logoUrl?: string;
  imageUrl?: string;
  pricingModel: PricingModel;
  toolType: string;
  tags: string[];
  categorySlugs: string[];
  featured?: boolean;
  sponsorTier?: "none" | "community" | "sponsor" | "partner";
  status: ToolStatus;
};

export type Category = {
  slug: string;
  name: string;
  description: string;
  seoTitle: string;
};
