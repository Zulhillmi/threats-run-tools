import type { Metadata } from "next";

export const metadata: Metadata = { title: "Submission queue", robots: { index: false, follow: false } };

export default function AdminSubmissionsPage() {
  return (
    <section className="section shell">
      <p className="kicker">Admin</p>
      <h1>Submission queue</h1>
      <div className="notice">Review pending tool submissions before publishing them to the directory.</div>
      <div className="admin-list">
        <div className="row-card"><div><strong>Pending submissions</strong><p>Protected review area for approving, rejecting, and correcting submissions.</p></div></div>
      </div>
    </section>
  );
}
