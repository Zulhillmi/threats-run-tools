export function getToolInitials(name: string) {
  const parts = name
    .replace(/[^a-zA-Z0-9\s.]/g, " ")
    .split(/[\s.]+/)
    .filter(Boolean);
  const letters = (parts.length > 1 ? parts.slice(0, 2).map((part) => part[0]) : [name[0], name[1]])
    .filter(Boolean)
    .join("");
  return letters.toUpperCase() || "TR";
}

export function hostnameFromUrl(value: string) {
  try {
    const url = new URL(value);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function faviconSources(websiteUrl: string, logoUrl?: string) {
  const host = hostnameFromUrl(websiteUrl);
  const sources = logoUrl ? [logoUrl] : [];
  if (!host) return sources;

  return [
    ...sources,
    `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`,
    `https://icons.duckduckgo.com/ip3/${encodeURIComponent(host)}.ico`,
  ];
}
