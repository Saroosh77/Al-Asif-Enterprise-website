"use client";

import { FormEvent, MouseEvent, useState } from "react";
import Image from "next/image";

const PHONE_DISPLAY = "0333 3674788";
const PHONE_LINK = "+923333674788";
const WHATSAPP_NUMBER = "923333674788";
const EMAIL = "asifmumtazk@gmail.com";

const services = [
  { number: "01", title: "Residential solar", text: "Right-sized on-grid, hybrid and battery-ready systems for houses, apartments and shared residential buildings.", tag: "Homes & apartments" },
  { number: "02", title: "Commercial solar", text: "Load-led solar planning for shops, offices, schools, clinics, warehouses and other commercial facilities.", tag: "Business continuity" },
  { number: "03", title: "Hybrid & backup systems", text: "Inverter and battery configurations designed around priority loads, outage duration and future expansion.", tag: "Reliable backup" },
  { number: "04", title: "Equipment supply", text: "Solar panels, inverters, batteries, protection equipment, cabling and balance-of-system components.", tag: "Quality components" },
  { number: "05", title: "Maintenance & upgrades", text: "System health checks, fault finding, cleaning guidance, component replacement and capacity upgrades.", tag: "After-sales support" },
  { number: "06", title: "Technical guidance", text: "Site surveys, load calculations, single-line planning and application guidance subject to current utility requirements.", tag: "Clear planning" },
];

const steps = [
  ["01", "Share your bill", "Send a recent electricity bill, your location and the appliances you want to run."],
  ["02", "Site & load survey", "We review available space, wiring, shade, structure, load profile and backup needs."],
  ["03", "Clear proposal", "Receive a system recommendation with equipment, scope, protections and commercial terms."],
  ["04", "Install & support", "Our team installs, tests and explains the system, then remains available for support."],
];

const faqs = [
  { question: "Which solar system is right for my property?", answer: "It depends on your daytime load, monthly bill, available roof area and required backup. We recommend a system only after reviewing those details." },
  { question: "Do you provide batteries and hybrid systems?", answer: "Yes. We plan hybrid and battery-backed systems for selected priority loads, as well as battery-ready systems that can be expanded later." },
  { question: "Can you work outside Karachi?", answer: "Yes. Al-Asif Enterprise is Karachi-based and evaluates solar project inquiries across Pakistan. Survey and mobilisation details are confirmed according to location and project scope." },
  { question: "Can you repair or upgrade an existing solar setup?", answer: "Yes. We can inspect an existing system, identify faults or bottlenecks, and propose maintenance, protection, battery or capacity upgrades." },
  { question: "What should I send for a quick estimate?", answer: "Send a recent electricity bill, your city and area, property type, roof photos if available, and a list of appliances that must stay on during outages." },
];

function createQuoteMessage(form: FormData) {
  const value = (key: string) => String(form.get(key) || "Not provided");
  return [
    "Assalam-o-Alaikum, I would like a solar consultation from Al-Asif Enterprise.", "",
    `Name: ${value("name")}`, `Phone: ${value("phone")}`, `Email: ${value("email")}`,
    `City / Area: ${value("city")}`,
    `Property: ${value("property")}`, `Monthly electricity bill: ${value("bill")}`,
    `Backup requirement: ${value("backup")}`, `Preferred contact: ${value("preferredContact")}`,
    `Additional details: ${value("message")}`,
  ].join("\n");
}

export default function Home() {
  const [formStatus, setFormStatus] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleQuote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const formData = new FormData(formElement);

    setIsSending(true);
    setFormStatus("Sending your consultation request…");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message || "The request could not be sent.");
      }

      formElement.reset();
      setFormStatus("Thank you. Your request has been emailed to Al-Asif Enterprise.");
    } catch (error) {
      setFormStatus(
        error instanceof Error
          ? `${error.message} You can still contact us through WhatsApp or phone.`
          : "The request could not be sent. Please use WhatsApp or phone.",
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleWhatsApp = () => {
    const formElement = document.getElementById("quote-form") as HTMLFormElement | null;
    if (!formElement || !formElement.reportValidity()) return;
    const message = createQuoteMessage(new FormData(formElement));
    const popup = window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
    if (popup) popup.opener = null;
    setFormStatus("Your request is ready in WhatsApp. Press send there to contact us.");
  };

  const closeMobileMenu = (event: MouseEvent<HTMLAnchorElement>) => {
    const menu = event.currentTarget.closest("details") as HTMLDetailsElement | null;
    if (menu) menu.open = false;
  };

  const structuredData = {
    "@context": "https://schema.org", "@type": "LocalBusiness", name: "Al-Asif Enterprise",
    description: "Karachi-based provider of solar equipment, residential and commercial solar installations, backup systems and maintenance services across Pakistan.",
    telephone: PHONE_LINK, email: EMAIL, areaServed: "Pakistan",
    address: { "@type": "PostalAddress", streetAddress: "Suite 704/A, 7th Floor, Mashriq Center, ST-6/A, Block 14, Gulshan-e-Iqbal", addressLocality: "Karachi", addressCountry: "PK" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <header className="site-header">
        <div className="container header-inner">
          <a className="brand" href="#home" aria-label="Al-Asif Enterprise home">
            <span className="logo-window" aria-hidden="true"><Image src="/images/al-asif-letterhead.jpg" alt="" width={1582} height={2048} priority sizes="56px" /></span>
            <span className="brand-name"><strong>AL-ASIF</strong><small>ENTERPRISE</small></span>
          </a>
          <nav className="desktop-nav" aria-label="Main navigation">
            <a href="#services">Services</a><a href="#projects">Projects</a><a href="#process">How it works</a><a href="#about">About</a>
          </nav>
          <a className="header-cta" href="#quote">Get a quote <span aria-hidden="true">↗</span></a>
          <details className="mobile-menu">
            <summary aria-label="Open navigation"><span /><span /><span /></summary>
            <nav aria-label="Mobile navigation">
              <a href="#services" onClick={closeMobileMenu}>Services</a><a href="#projects" onClick={closeMobileMenu}>Projects</a>
              <a href="#process" onClick={closeMobileMenu}>How it works</a><a href="#about" onClick={closeMobileMenu}>About</a><a href="#quote" onClick={closeMobileMenu}>Get a quote</a>
            </nav>
          </details>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-grid" aria-hidden="true" />
          <div className="container hero-layout">
            <div className="hero-copy">
              <p className="eyebrow light"><span /> Karachi-based solar specialists</p>
              <h1>Solar that works for your <em>real load.</em></h1>
              <p className="hero-lead">Reliable solar equipment, carefully planned installations and responsive support for homes and businesses in Karachi and across Pakistan.</p>
              <div className="hero-actions">
                <a className="button button-primary" href="#quote">Book a site visit <span aria-hidden="true">→</span></a>
                <a className="button button-ghost" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Assalam-o-Alaikum, I would like to discuss a solar project with Al-Asif Enterprise.")}`} target="_blank" rel="noreferrer">WhatsApp us</a>
              </div>
              <div className="hero-points" aria-label="Service highlights">
                <span><i>✓</i> Custom load sizing</span><span><i>✓</i> Safety-first installation</span><span><i>✓</i> Maintenance support</span>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-image-window"><Image src="/images/hero-solar-equipment.png" alt="Solar inverters and battery equipment supplied by Al-Asif Enterprise" width={1080} height={1350} priority sizes="(max-width: 980px) 90vw, 44vw" /></div>
              <div className="hero-badge top-badge"><small>Systems for</small><strong>Home · Shop · Office</strong></div>
              <div className="hero-badge bill-badge"><span aria-hidden="true">↘</span><div><small>Start with your</small><strong>Monthly electricity bill</strong></div></div>
            </div>
          </div>
          <div className="container promise-strip">
            <div><span>01</span><strong>Site survey</strong></div><div><span>02</span><strong>Load planning</strong></div>
            <div><span>03</span><strong>Clean installation</strong></div><div><span>04</span><strong>After-sales support</strong></div>
          </div>
        </section>

        <section className="section services-section" id="services">
          <div className="container">
            <div className="section-heading split-heading"><div><p className="eyebrow"><span /> Solar services</p><h2>One team, from survey to switch-on.</h2></div><p>We combine equipment supply with engineering-led planning, installation and support—so every component works as one safe system.</p></div>
            <div className="services-grid">
              {services.map((service) => <article className="service-card" key={service.number}><div className="service-card-top"><span className="service-number">{service.number}</span><span className="service-arrow" aria-hidden="true">↗</span></div><h3>{service.title}</h3><p>{service.text}</p><span className="service-tag">{service.tag}</span></article>)}
            </div>
          </div>
        </section>

        <section className="section projects-section" id="projects">
          <div className="container">
            <div className="section-heading split-heading inverse"><div><p className="eyebrow light"><span /> Equipment & project work</p><h2>Built around dependable components.</h2></div><p>Inverters, batteries, protection and wiring are selected around the site—not forced into a one-size package.</p></div>
            <div className="equipment-gallery">
              <article className="equipment-card equipment-card-large"><div className="equipment-image equipment-main" role="img" aria-label="Installed Solplanet solar inverter system" /><div className="equipment-caption"><span>Installation</span><h3>Hybrid inverter setup</h3><p>Neat equipment placement with practical access for monitoring and maintenance.</p></div></article>
              <article className="equipment-card"><div className="equipment-image equipment-inverter" role="img" aria-label="Crown solar inverter" /><div className="equipment-caption"><span>Equipment</span><h3>Inverter options</h3><p>Selected for load, operating mode and expansion needs.</p></div></article>
              <article className="equipment-card"><div className="equipment-image equipment-battery" role="img" aria-label="Solar battery backup equipment" /><div className="equipment-caption"><span>Backup</span><h3>Battery solutions</h3><p>Configured around essential loads and expected outage duration.</p></div></article>
            </div>
            <p className="photo-credit">Project and equipment photographs supplied by Al-Asif Enterprise.</p>
          </div>
        </section>

        <section className="section process-section" id="process">
          <div className="container process-layout">
            <div className="process-intro"><p className="eyebrow"><span /> Our process</p><h2>No guesswork. No confusing packages.</h2><p>Every useful proposal starts with your load, your site and what you expect the system to do.</p><a className="text-link" href="#quote">Start your assessment <span aria-hidden="true">→</span></a></div>
            <div className="steps-list">{steps.map(([number, title, text]) => <article className="step" key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
          </div>
        </section>

        <section className="section about-section" id="about">
          <div className="container about-layout">
            <div className="about-panel"><p className="eyebrow light"><span /> About Al-Asif</p><h2>Karachi-based. Pakistan-ready.</h2><p>Al-Asif Enterprise supplies solar equipment and delivers practical solar projects for residential and commercial customers. Our focus is straightforward: honest sizing, clean work and systems that are easier to operate and maintain.</p><div className="about-facts"><div><strong>Karachi</strong><span>Head office</span></div><div><strong>Pakistan</strong><span>Project inquiries</span></div><div><strong>End-to-end</strong><span>Supply to support</span></div></div></div>
            <div className="coverage-card"><div className="coverage-orbit orbit-one" /><div className="coverage-orbit orbit-two" /><div className="coverage-pin karachi-pin"><span /><strong>Karachi</strong><small>Primary service base</small></div><div className="coverage-pin pakistan-pin"><span /><strong>Across Pakistan</strong><small>Projects evaluated by scope</small></div><p>Residential · Commercial · Equipment · Maintenance</p></div>
          </div>
        </section>

        <section className="section quote-section" id="quote">
            <div className="container quote-layout">
            <div className="quote-copy"><p className="eyebrow"><span /> Request a consultation</p><h2>Send your bill. Get a sensible starting point.</h2><p>Complete the short form to email your request directly to Al-Asif Enterprise, or continue on WhatsApp to attach your electricity bill and roof photos.</p><div className="contact-list"><a href={`tel:${PHONE_LINK}`}><span>Call</span><strong>{PHONE_DISPLAY}</strong></a><a href={`mailto:${EMAIL}`}><span>Email</span><strong>{EMAIL}</strong></a><a href="https://www.google.com/maps/search/?api=1&query=Suite+704%2FA+Mashriq+Center+Block+14+Gulshan-e-Iqbal+Karachi" target="_blank" rel="noreferrer"><span>Office</span><strong>Suite 704/A, 7th Floor, Mashriq Center, Block 14, Gulshan-e-Iqbal, Karachi</strong></a></div></div>
            <form className="quote-form" id="quote-form" onSubmit={handleQuote}>
              <div className="field-row"><label>Your name<input name="name" type="text" autoComplete="name" placeholder="Full name" required /></label><label>Phone / WhatsApp<input name="phone" type="tel" autoComplete="tel" placeholder="03xx xxxxxxx" required /></label></div>
              <div className="field-row"><label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" /></label><label>City / Area<input name="city" type="text" autoComplete="address-level2" placeholder="e.g. Gulshan-e-Iqbal, Karachi" required /></label></div>
              <div className="field-row"><label>Property type<select name="property" defaultValue="" required><option value="" disabled>Select one</option><option>House</option><option>Apartment</option><option>Shop</option><option>Office</option><option>Commercial building</option><option>Industrial facility</option><option>Other</option></select></label><label>Approx. monthly bill<select name="bill" defaultValue=""><option value="" disabled>Select a range</option><option>Below PKR 15,000</option><option>PKR 15,000–30,000</option><option>PKR 30,000–60,000</option><option>PKR 60,000–120,000</option><option>Above PKR 120,000</option></select></label></div>
              <div className="field-row"><label>Backup requirement<select name="backup" defaultValue=""><option value="" disabled>Select one</option><option>No battery backup</option><option>Essential loads only</option><option>Most appliances</option><option>Not sure yet</option></select></label><label>Preferred reply method<select name="preferredContact" defaultValue="WhatsApp"><option>WhatsApp</option><option>Phone call</option><option>Email</option></select></label></div>
              <label>Anything else we should know?<textarea name="message" rows={4} placeholder="Tell us about your load, outages, existing equipment or preferred visit time." /></label>
              <label className="honeypot" aria-hidden="true">Leave this field empty<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
              <label className="consent-field"><input name="consent" type="checkbox" required /><span>I agree that my details may be used to answer this request. Read the <a href="/privacy">privacy notice</a>.</span></label>
              <div className="form-actions"><button className="button button-primary" type="submit" disabled={isSending}>{isSending ? "Sending…" : "Email my request"} <span aria-hidden="true">→</span></button><button className="button email-button" type="button" onClick={handleWhatsApp}>Continue on WhatsApp</button></div>
              <p className="form-note">No payment is requested through this form. Your details are used only to respond to your inquiry.</p><p className="form-status" aria-live="polite">{formStatus}</p>
            </form>
          </div>
        </section>

        <section className="section faq-section">
          <div className="container faq-layout"><div><p className="eyebrow"><span /> Common questions</p><h2>A clearer solar decision starts here.</h2></div><div className="faq-list">{faqs.map((faq, index) => <details key={faq.question} open={index === 0}><summary>{faq.question}<span aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>)}</div></div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-top"><div><a className="brand footer-brand" href="#home"><span className="logo-window" aria-hidden="true"><Image src="/images/al-asif-letterhead.jpg" alt="" width={1582} height={2048} sizes="56px" /></span><span className="brand-name"><strong>AL-ASIF</strong><small>ENTERPRISE</small></span></a><p>Solar equipment, projects and support from Karachi to customers across Pakistan.</p></div><div className="footer-links"><div><span>Explore</span><a href="#services">Services</a><a href="#projects">Projects</a><a href="#process">Process</a></div><div><span>Contact</span><a href={`tel:${PHONE_LINK}`}>{PHONE_DISPLAY}</a><a href={`mailto:${EMAIL}`}>{EMAIL}</a><a href="#quote">Request a quote</a></div></div></div>
        <div className="container footer-bottom"><span>© {new Date().getFullYear()} Al-Asif Enterprise. All rights reserved.</span><span><a href="/privacy">Privacy</a> · Karachi, Pakistan</span></div>
      </footer>

      <a className="floating-whatsapp" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Assalam-o-Alaikum, I would like a solar consultation from Al-Asif Enterprise.")}`} target="_blank" rel="noreferrer" aria-label="Chat with Al-Asif Enterprise on WhatsApp"><span aria-hidden="true">WA</span> WhatsApp</a>
    </>
  );
}
