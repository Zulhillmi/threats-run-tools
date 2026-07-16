export const siteConfig = {
  name: "Threats.run Tools",
  shortName: "Tools",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://tools.threats.run",
  mainSiteUrl: process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://threats.run",
  description: "A curated directory of cybersecurity, OSINT, CTI, malware analysis, detection engineering, and Web3 security tools.",
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.siteUrl).toString();
}
