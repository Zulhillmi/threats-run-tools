import { siteConfig } from "@/lib/config";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner shell">
        <div className="footer-brand">
          <strong>{siteConfig.name}</strong>
          <p>A curated cybersecurity tools directory by Threats.run for CTI and security operations workflows.</p>
        </div>
        <nav aria-label="Footer explore">
          <strong>Explore</strong>
          <a href="/tools/">All tools</a>
          <a href="/categories/cti/">Threat intelligence</a>
          <a href="/categories/osint/">OSINT</a>
        </nav>
        <nav aria-label="Footer resources">
          <strong>Resources</strong>
          <a href="/blog/">Articles</a>
          <a href="/submit/">Submit a tool</a>
        </nav>
        <nav aria-label="Threats.run links">
          <strong>Threats.run</strong>
          <a href={siteConfig.mainSiteUrl}>Main site</a>
          <a href={`${siteConfig.mainSiteUrl}/product/intel/`}>AI CTI</a>
        </nav>
      </div>
    </footer>
  );
}
