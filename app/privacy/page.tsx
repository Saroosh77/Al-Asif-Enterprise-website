import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy notice",
  description: "How Al-Asif Enterprise handles information submitted through its solar consultation form.",
  alternates: { canonical: "/privacy" },
};

const EMAIL = "asifmumtazk@gmail.com";
const PHONE = "+92 333 3674788";

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <div className="legal-shell">
        <Link className="legal-back" href="/">← Back to Al-Asif Enterprise</Link>
        <p className="eyebrow"><span /> Privacy notice</p>
        <h1>Your inquiry stays your inquiry.</h1>
        <p className="legal-intro">
          This notice explains how information submitted through the Al-Asif Enterprise website is used when you request a solar consultation.
        </p>

        <section className="legal-section">
          <h2>Information we receive</h2>
          <p>Depending on what you enter, we may receive your name, phone number, email address, city or area, property type, electricity-bill range, backup requirement and project notes.</p>
        </section>

        <section className="legal-section">
          <h2>Why we use it</h2>
          <p>We use these details only to review your request, contact you, prepare an initial recommendation, arrange a survey and keep a business record of the inquiry.</p>
        </section>

        <section className="legal-section">
          <h2>How the form is delivered</h2>
          <p>The email form sends your details to the company mailbox configured by the website owner. If you choose WhatsApp, your browser opens WhatsApp with a prepared message and you decide whether to send it.</p>
        </section>

        <section className="legal-section">
          <h2>Retention and sharing</h2>
          <p>Inquiry details should be kept only as long as needed for the project, quotation, customer service or legal business records. Al-Asif Enterprise does not sell website inquiry details.</p>
        </section>

        <section className="legal-section">
          <h2>Your choices</h2>
          <p>You may ask whether your inquiry is still held, request a correction, or request deletion where no legal or contractual reason requires retention.</p>
        </section>

        <section className="legal-section">
          <h2>Contact</h2>
          <p>Al-Asif Enterprise, Shop # 6, 3.C 3/9, Nazimabad # 3, Karachi, Pakistan.</p>
          <ul>
            <li>Email: <a href={`mailto:${EMAIL}`}>{EMAIL}</a></li>
            <li>Phone: <a href="tel:+923333674788">{PHONE}</a></li>
          </ul>
        </section>

        <section className="legal-section">
          <p>Last updated: August 2026.</p>
        </section>
      </div>
    </main>
  );
}
