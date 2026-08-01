# Independent Conversion Summary

## What changed

- Replaced the platform-specific runtime with a standard self-hosted Next.js application.
- Added a real server-side contact endpoint that emails the configured company mailbox through SMTP.
- Kept WhatsApp, phone, email and map contact methods as fallbacks.
- Added privacy consent, validation, anti-bot controls, rate limiting and safe HTML email formatting.
- Added a privacy page, sitemap, robots instructions, canonical metadata and security headers.
- Separated the gallery into individually replaceable project-image files.
- Added a production Docker image, Docker Compose stack, Caddy reverse proxy and automatic HTTPS renewal.
- Added health monitoring, environment templates, deployment instructions, update procedures and security guidance.
- Removed any need for ChatGPT hosting, authentication, storage or runtime services from the downloadable package.

## Information still required from the owner

Before going live, supply these private or future values in `.env.production`:

- Purchased domain name
- Server public IP and SSH access
- HTTPS administration email
- SMTP/app-password credential for the sending mailbox
- Any replacement project photographs

No real password or server credential is included in this package.

## Recommended next step

Read `DEPLOYMENT.md`, buy the domain and VPS, update `.env.production`, then run `sh deploy/deploy.sh` on the server.
