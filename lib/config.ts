export const siteConfig = {
  name: "Threats.run Tools",
  shortName: "Tools",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://threats-run-tools.pages.dev",
  mainSiteUrl: process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://threats.run",
  description: "A curated cybersecurity tools directory for CTI, OSINT, malware analysis, detection engineering, Web3 security, security vendors, and vulnerability management workflows.",
  keywords: [
    "cybersecurity tools",
    "threat intelligence tools",
    "OSINT tools",
    "malware analysis tools",
    "detection engineering tools",
    "vulnerability management tools",
    "Web3 security tools",
    "security vendor directory",
  ],
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.siteUrl).toString();
}
