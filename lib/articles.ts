export type PublicArticle = {
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  author?: string;
  imageUrl?: string | null;
  publishedAt?: string;
};

export const publicArticles: PublicArticle[] = [
  {
    slug: "osint-triage-for-suspicious-infrastructure",
    title: "OSINT triage for suspicious infrastructure",
    excerpt: "Fast infrastructure triage needs domain, DNS, certificate, URL, and reputation pivots before teams spend time on deeper analysis.",
    content: "Fast infrastructure triage needs domain, DNS, certificate, URL, and reputation pivots before teams spend time on deeper analysis. Good tooling reduces context switching and keeps evidence shareable.",
    author: "Threats.run",
    imageUrl: null,
    publishedAt: "2026-07-17 09:09:33",
  },
  {
    slug: "building-a-practical-cti-tool-stack",
    title: "Building a practical CTI tool stack",
    excerpt: "A practical CTI stack combines enrichment, malware context, infrastructure pivots, vulnerability signal, and detection workflows.",
    content: "A practical CTI stack combines enrichment, malware context, infrastructure pivots, vulnerability signal, and detection workflows.",
    author: "Threats.run",
    imageUrl: null,
    publishedAt: "2026-07-17 09:09:33",
  },
];
