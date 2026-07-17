"use client";

import { useState } from "react";

export function AdminLogin() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("Signing in…");
    const res = await fetch("/api/admin/session", { method: "POST", headers: { "content-type": "application/json" }, credentials: "include", body: JSON.stringify({ password }) });
    if (!res.ok) { const data = await res.json().catch(() => ({})) as { error?: string }; setStatus(data.error || "Sign-in failed"); return; }
    const params = new URLSearchParams(window.location.search);
    window.location.href = params.get("redirect") || "/admin/";
  }
  return <form className="auth-card" onSubmit={submit}>
    <p className="eyebrow">Admin</p>
    <h1>Sign in</h1>
    <p className="muted">Protected admin for live D1 catalog management.</p>
    <label>Password<input className="field" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoFocus /></label>
    <button className="button" type="submit">Sign in</button>
    {status && <p className="form-note">{status}</p>}
  </form>;
}
