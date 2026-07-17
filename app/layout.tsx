import type { Metadata } from "next";
import "./globals.css";
import { siteConfig, absoluteUrl } from "@/lib/config";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: { default: "Threats.run Tools — cybersecurity tools directory", template: "%s | Threats.run Tools" },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  applicationName: siteConfig.name,
  authors: [{ name: "Threats.run" }],
  creator: "Threats.run",
  publisher: "Threats.run",
  category: "Cybersecurity",
  alternates: { canonical: absoluteUrl("/") },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 },
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.siteUrl,
    siteName: siteConfig.name,
    type: "website",
    images: [{ url: absoluteUrl("/logo-tr.png"), width: 512, height: 512, alt: "Threats.run Tools" }],
  },
  twitter: { card: "summary", title: siteConfig.name, description: siteConfig.description, images: [absoluteUrl("/logo-tr.png")] },
  icons: { icon: "/logo-tr.png", apple: "/logo-tr.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><Header /><main>{children}</main><Footer /></body></html>;
}
