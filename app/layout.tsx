import type { Metadata } from "next";
import "./globals.css";
import { siteConfig, absoluteUrl } from "@/lib/config";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: { default: "Threats.run Tools — cybersecurity tools directory", template: "%s | Threats.run Tools" },
  description: siteConfig.description,
  alternates: { canonical: absoluteUrl("/") },
  openGraph: { title: siteConfig.name, description: siteConfig.description, url: siteConfig.siteUrl, siteName: siteConfig.name, type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><Header /><main>{children}</main><Footer /></body></html>;
}
