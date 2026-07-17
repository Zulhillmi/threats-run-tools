import { siteConfig } from "@/lib/config";

export function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href="/" aria-label="Threats.run Tools home">
          <img src="/logo-tr.png" alt="" className="brand-mark" width={32} height={32} />
          <span>tools.threats.run</span>
        </a>
        <form className="header-search" action="/tools/" role="search" aria-label="Search cybersecurity tools">
          <label className="sr-only" htmlFor="header-tool-search">Search cybersecurity tools</label>
          <input id="header-tool-search" name="q" type="search" placeholder="Search tools…" autoComplete="off" />
          <button type="submit" aria-label="Search">⌕</button>
        </form>
        <nav className="nav" aria-label="Primary">
          <a href="/tools/">Tools</a>
          <a href="/categories/cti/">Categories</a>
          <a href="/submit/">Submit</a>
          <a href={siteConfig.mainSiteUrl}>Threats.run</a>
        </nav>
        <a className="header-cta" href="/submit/">Submit tool</a>
      </div>
    </header>
  );
}
