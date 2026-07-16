import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default function AdminPage() {
  return (
    <section className="section shell">
      <p className="kicker">Admin</p>
      <h1>Tools admin</h1>
      <div className="grid">
        <a className="card" href="/admin/submissions/"><h3>Submission queue</h3><p>Review pending tool submissions before publishing.</p></a>
        <a className="card" href="/admin/tools/"><h3>Published tools</h3><p>Manage featured status, categories, and tool metadata.</p></a>
      </div>
    </section>
  );
}
