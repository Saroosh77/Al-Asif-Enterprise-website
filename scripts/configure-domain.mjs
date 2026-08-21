import { readFile, writeFile } from "node:fs/promises";

const rawDomain = process.argv[2]?.trim().toLowerCase();
if (!rawDomain) {
  console.error("Usage: npm run setup:domain -- example.com");
  process.exit(1);
}

let domain = rawDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
if (domain.startsWith("www.")) domain = domain.slice(4);

if (
  domain.includes("/") ||
  domain.includes(":") ||
  !/^(?=.{4,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain)
) {
  console.error("Enter only a valid root domain, for example: alasifenterprise.com");
  process.exit(1);
}

const siteConfigPath = new URL("../site.config.json", import.meta.url);
const wranglerPath = new URL("../wrangler.jsonc", import.meta.url);
const robotsPath = new URL("../public/robots.txt", import.meta.url);
const sitemapPath = new URL("../public/sitemap.xml", import.meta.url);
const siteConfig = JSON.parse(await readFile(siteConfigPath, "utf8"));
const wrangler = JSON.parse(await readFile(wranglerPath, "utf8"));

siteConfig.domain = domain;
if (/your-domain\.com|example\.com/i.test(siteConfig.emailDelivery.from)) {
  siteConfig.emailDelivery.from = `Al-Asif Enterprise Website <website@${domain}>`;
}

wrangler.routes = [
  { pattern: domain, custom_domain: true },
  { pattern: `www.${domain}`, custom_domain: true },
];

await writeFile(siteConfigPath, `${JSON.stringify(siteConfig, null, 2)}\n`);
await writeFile(wranglerPath, `${JSON.stringify(wrangler, null, 2)}\n`);

const robots = (await readFile(robotsPath, "utf8")).replace(/your-domain\.com/g, domain);
const sitemap = (await readFile(sitemapPath, "utf8")).replace(/your-domain\.com/g, domain);
await writeFile(robotsPath, robots);
await writeFile(sitemapPath, sitemap);

console.log(`Configured ${domain} as the primary domain.`);
console.log(`Configured www.${domain} to redirect to https://${domain}.`);
console.log("Updated public/robots.txt and public/sitemap.xml with the new domain.");
console.log("Next: update the remaining contact and Turnstile values in site.config.json.");
