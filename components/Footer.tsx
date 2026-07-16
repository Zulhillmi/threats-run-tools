import { siteConfig } from "@/lib/config";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner shell">
        <div><strong>tools.threats.run</strong><p>A curated cybersecurity tools directory by Threats.run for CTI and security operations workflows.</p></div>
        <div><strong>Explore</strong><a href="/tools/">All tools</a><a href="/categories/cti/">Threat intelligence</a><a href="/categories/osint/">OSINT</a></div>
        <div><strong>Contribute</strong><a href="/submit/">Submit a tool</a></div>
        <div><strong>Threats.run</strong><a href={siteConfig.mainSiteUrl}>Main site</a><a href={`${siteConfig.mainSiteUrl}/product/intel/`}>AI CTI</a></div>
      </div>
    </footer>
  );
}
