# Al-Asif Enterprise Website

Independent production website for Al-Asif Enterprise. It runs in the company's own Cloudflare account and can use the company's own domain. It has no dependency on any hosted site builder.

## Included

- Responsive solar business website for desktop, tablet and mobile
- Residential, commercial, hybrid backup and equipment-supply services
- Project/equipment gallery with easily replaceable image files
- Cloudflare Workers deployment configuration
- One-command publishing with `npm run deploy`
- Automatic GitHub deployment on every push to `main`
- Root-domain and `www` custom-domain support
- Permanent `www` to root-domain redirect
- Automatic HTTPS through Cloudflare
- Security headers on every response
- Direct contact-form email delivery through Resend
- Cloudflare Turnstile, honeypot and server-side form validation
- Privacy page, sitemap and robots file
- Replaceable logo and project photographs
- Automated production tests

## Run locally

Requirements: Node.js 22 and npm.

```bash
npm ci
npm run dev -- --host 127.0.0.1
```

Open `http://127.0.0.1:5173`.

For local contact-form testing, copy `.env.example` to `.env.local`, add a Resend API key, and keep the supplied Cloudflare test keys. Never commit `.env.local`.

## Configure the company details

Edit `site.config.json`. It contains the public domain, email, phone, WhatsApp, office address, recipient email, sender email, and public Turnstile site key.

After buying the domain, configure the root and `www` addresses automatically:

```bash
npm run setup:domain -- alasifenterprise.com
```

Then replace the remaining placeholder values in `site.config.json`. This also updates `public/robots.txt` and `public/sitemap.xml` with the new domain.

Company details currently included, taken from the company's letterhead and business card:

- Phone / WhatsApp: `0333 3674788`
- Email: `asifmumtazk@gmail.com`
- Office: Shop # 6, 3.C 3/9, Nazimabad # 3, Karachi, Pakistan

## Replace photos

Replace files in `public/images/` while keeping the same filenames:

| Website area | Filename | Recommended shape |
|---|---|---|
| Company logo | `al-asif-letterhead.jpg` | Keep unless a separate high-resolution logo becomes available |
| Main banner | `hero-solar-equipment.jpg` | Strong equipment or completed installation photo, at least 1600 px wide |
| Hybrid inverter project | `project-hybrid-inverter.jpg` | Clean inverter/battery installation, preferably landscape |
| Inverter equipment | `project-inverter-options.jpg` | Inverter or equipment close-up |
| Battery solutions | `project-battery-solutions.jpg` | Battery bank or backup installation |

See [PHOTO-GUIDE.md](PHOTO-GUIDE.md) for full guidance, including image quality and privacy notes. Keep each web image below roughly 1 MB. After replacement, run `npm run dev` to inspect cropping on desktop and mobile.

## Verify and publish

```bash
npm test
npm run deploy
```

`npm run deploy` first checks that no production placeholder remains, builds the website, and publishes it through the company's Cloudflare account.

For first-time account, domain, email and GitHub setup, follow [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).

## Main files

- `site.config.json` — domain and public contact configuration
- `app/page.tsx` — website content, contact details and form interface
- `app/privacy/page.tsx` — privacy notice for form submissions
- `app/globals.css` — design and responsive styling
- `public/images/` — logo and project photography
- `lib/contact.ts` — shared field validation and email-body building
- `worker/contact.ts` — protected contact-form delivery (Turnstile + Resend)
- `worker/index.ts` — redirects, API routing and security headers
- `wrangler.jsonc` — Cloudflare deployment and custom domains
- `.github/workflows/deploy.yml` — automatic GitHub publishing
