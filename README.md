# Al-Asif Enterprise — Independent Website

This is the complete self-hosted edition of the Al-Asif Enterprise solar website. It runs on your own computer or server, accepts consultation requests by email, and can use any domain you buy. It has no ChatGPT or ChatGPT Sites runtime dependency.

## Included

- Responsive business website for desktop, tablet and mobile
- Residential, commercial, hybrid, equipment and maintenance services
- Project/equipment gallery with easily replaceable image files
- Direct call, email, WhatsApp and Google Maps links
- Server-side contact form that sends inquiries through your SMTP mailbox
- Input validation, bot honeypot, request-size limit and IP rate limiting
- Privacy page, sitemap, robots file, business structured data and SEO metadata
- Security headers and an unprivileged production container
- Docker Compose deployment with Caddy reverse proxy and automatic HTTPS
- Health endpoint for server monitoring
- Guides for deployment, photos, routine updates and security

## Fast local start

Install Node.js 22 or newer, then run:

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

The website and WhatsApp actions work immediately. To test email delivery, fill the SMTP values in `.env.local`. Never place a normal mailbox password in source code; use an SMTP credential or provider app password.

## Production deployment

The recommended deployment uses a small Linux VPS and the included Docker configuration. Caddy automatically obtains and renews the HTTPS certificate after your domain points to the server.

Follow [DEPLOYMENT.md](DEPLOYMENT.md) from start to finish. The short command, after configuration, is:

```bash
cp .env.example .env.production
# Edit .env.production first
sh deploy/deploy.sh
```

## Configure the email form

Copy `.env.example` to `.env.local` for local use or `.env.production` for the server. Set:

- `CONTACT_TO_EMAIL`: mailbox that receives website inquiries
- `SMTP_HOST` and `SMTP_PORT`: settings from your email provider
- `SMTP_USER` and `SMTP_PASS`: sending account and SMTP credential/app password
- `SMTP_FROM_EMAIL`: normally the same authenticated sending account
- `SITE_URL` and `ALLOWED_ORIGINS`: your real HTTPS domain

The default destination is the official letterhead address, `asifmumtazk@gmail.com`. The package does not contain any real password.

## Change company details

The visible phone, WhatsApp and email values are grouped at the top of `app/page.tsx`. The office address also appears in the business structured data and contact section in that file.

Company details currently included from the letterhead:

- Phone / WhatsApp: `0333 3674788`
- Email: `asifmumtazk@gmail.com`
- Office: Suite 704/A, 7th Floor, Mashriq Center, ST-6/A, Block 14, Gulshan-e-Iqbal, Karachi, Pakistan

## Replace photos

See [PHOTO-GUIDE.md](PHOTO-GUIDE.md). The project gallery has separate filenames, so each placeholder can be replaced independently without rewriting the website.

## Important files

| File | Purpose |
| --- | --- |
| `app/page.tsx` | Main website content, contact details and form interface |
| `app/globals.css` | Branding, layout, image crops and responsive design |
| `app/api/contact/route.ts` | Secure server-side email delivery |
| `app/privacy/page.tsx` | Privacy notice for form submissions |
| `public/images/` | Logo and replaceable solar/project images |
| `.env.example` | Safe template for domain and email settings |
| `Dockerfile` | Production application container |
| `docker-compose.yml` | Application plus automatic HTTPS proxy |
| `deploy/Caddyfile` | Domain, HTTPS and reverse-proxy configuration |

## Verification commands

```bash
npm run typecheck
npm run lint
npm run build
```

For operating and updating a deployed server, read [OPERATIONS.md](OPERATIONS.md). For the safeguards and production responsibilities, read [SECURITY.md](SECURITY.md).
