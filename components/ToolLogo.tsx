"use client";

import { useMemo, useState } from "react";
import { faviconSources, getToolInitials } from "@/lib/tool-logo";

type ToolLogoProps = {
  name: string;
  websiteUrl: string;
  logoUrl?: string;
  className?: string;
  size?: "card" | "row" | "hero";
};

export function ToolLogo({ name, websiteUrl, logoUrl, className = "", size = "card" }: ToolLogoProps) {
  const sources = useMemo(() => faviconSources(websiteUrl, logoUrl), [websiteUrl, logoUrl]);
  const [imageState, setImageState] = useState({ key: `${name}:${websiteUrl}:${logoUrl || ""}`, sourceIndex: 0 });
  const key = `${name}:${websiteUrl}:${logoUrl || ""}`;
  const sourceIndex = imageState.key === key ? imageState.sourceIndex : 0;
  const src = sources[sourceIndex];
  const initials = getToolInitials(name);
  const classes = ["tool-logo", `tool-logo-${size}`, className].filter(Boolean).join(" ");

  return (
    <span className={classes} aria-hidden="true">
      {src ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setImageState({ key, sourceIndex: sourceIndex + 1 })}
        />
      ) : (
        <span>{initials}</span>
      )}
    </span>
  );
}
