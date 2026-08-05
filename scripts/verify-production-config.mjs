import { readFile } from "node:fs/promises";

const siteConfig = JSON.parse(await readFile(new URL("../site.config.json", import.meta.url), "utf8"));
const wrangler = JSON.parse(await readFile(new URL("../wrangler.jsonc", import.meta.url), "utf8"));
const errors = [];
const placeholder = /your-|example\.com|replace[_ -]?with|000000/i;
const testSiteKeys = new Set([
  "1x00000000000000000000AA",
  "2x00000000000000000000AB",
  "1x00000000000000000000BB",
  "2x00000000000000000000BB",
  "3x00000000000000000000FF",
]);

const validEmail = (value) => typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const domain = String(siteConfig.domain || "").toLowerCase();

if (placeholder.test(domain) || !/^(?:[a-z0-9-]+\.)+[a-z]{2,63}$/.test(domain)) {
  errors.push("Run: npm run setup:domain -- your-real-domain.com");
}
if (!validEmail(siteConfig.contact?.email) || placeholder.test(siteConfig.contact.email)) {
  errors.push("Set contact.email in site.config.json to the real public email address.");
}
if (!validEmail(siteConfig.emailDelivery?.to) || placeholder.test(siteConfig.emailDelivery.to)) {
  errors.push("Set emailDelivery.to in site.config.json to the inbox that should receive enquiries.");
}
if (placeholder.test(siteConfig.emailDelivery?.from || "") || !String(siteConfig.emailDelivery?.from || "").includes(`@${domain}>`)) {
  errors.push("Set emailDelivery.from to an address on the verified sending domain.");
}
if (placeholder.test(siteConfig.contact?.phoneHref || "") || !/^\+[1-9]\d{7,14}$/.test(siteConfig.contact?.phoneHref || "")) {
  errors.push("Set contact.phoneHref to the real international phone number without spaces.");
}
if (placeholder.test(siteConfig.contact?.whatsappHref || "") || !/^https:\/\/wa\.me\/[1-9]\d{7,14}$/.test(siteConfig.contact?.whatsappHref || "")) {
  errors.push("Set contact.whatsappHref to the real https://wa.me/ international number.");
}
if (!siteConfig.turnstileSiteKey || placeholder.test(siteConfig.turnstileSiteKey) || testSiteKeys.has(siteConfig.turnstileSiteKey)) {
  errors.push("Replace turnstileSiteKey with the production site key from Cloudflare Turnstile.");
}

const routePatterns = new Set((wrangler.routes || []).filter((route) => route.custom_domain).map((route) => route.pattern));
if (!routePatterns.has(domain) || !routePatterns.has(`www.${domain}`)) {
  errors.push("The root and www custom domains are missing from wrangler.jsonc; rerun setup:domain.");
}

if (errors.length) {
  console.error("Production configuration is incomplete:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Production configuration is complete.");
