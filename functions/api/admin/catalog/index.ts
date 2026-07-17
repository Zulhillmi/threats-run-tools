import { json, requireAdmin, slugify, type PagesContext } from "../../_shared";

type Row = Record<string, any>;

function rowToTool(row: Row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    websiteUrl: row.website_url,
    githubUrl: row.github_url || undefined,
    docsUrl: row.docs_url || undefined,
    screenshotUrl: row.screenshot_url || undefined,
    imageUrl: row.image_url || undefined,
    pricingModel: row.pricing_model,
    toolType: row.tool_type,
    status: row.status,
    featured: Boolean(row.featured),
    sponsorTier: row.sponsor_tier,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    categorySlugs: row.category_slugs ? String(row.category_slugs).split(",").filter(Boolean) : [],
    tags: row.tags ? String(row.tags).split(",").filter(Boolean) : [],
  };
}

export async function onRequestGet(context: PagesContext) {
  const unauthorized = await requireAdmin(context.request, context.env);
  if (unauthorized) return unauthorized;

  const tools = await context.env.DB.prepare(`
    SELECT t.*,
      GROUP_CONCAT(DISTINCT c.slug) AS category_slugs,
      GROUP_CONCAT(DISTINCT tg.slug) AS tags
    FROM tools t
    LEFT JOIN tool_categories tc ON tc.tool_id = t.id
    LEFT JOIN categories c ON c.id = tc.category_id
    LEFT JOIN tool_tags tt ON tt.tool_id = t.id
    LEFT JOIN tags tg ON tg.id = tt.tag_id
    GROUP BY t.id
    ORDER BY t.updated_at DESC, t.name ASC
  `).all<Row>();

  const categories = await context.env.DB.prepare("SELECT * FROM categories ORDER BY name ASC").all<Row>();
  const submissions = await context.env.DB.prepare("SELECT status, COUNT(*) count FROM submissions GROUP BY status").all<Row>();

  return json({
    tools: (tools.results || []).map(rowToTool),
    categories: categories.results || [],
    submissionCounts: submissions.results || [],
  });
}

export { rowToTool, slugify };
