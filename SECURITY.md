# Security Notes

The package includes sensible safeguards for a small business website, but the server owner remains responsible for operating the VPS and mailbox securely.

## Included safeguards

- SMTP credentials stay in environment files, outside source code
- Server-side field validation and length limits
- 16 KB request-body limit
- Hidden bot honeypot
- Per-IP in-memory rate limit on email requests
- Same-origin check for browser submissions
- Escaping of visitor text in HTML email
- No database or public form-data storage
- Restricted browser security headers
- HTTPS and automatic certificate renewal through Caddy
- Application runs as an unprivileged user in a read-only container with Linux capabilities dropped
- Health monitoring endpoint that exposes no secrets

## Production responsibilities

- Use unique SSH keys; disable password-based root login when practical.
- Keep the VPS, Docker and website dependencies patched.
- Never commit or email `.env.production`.
- Use an SMTP app password or narrowly scoped credential, not the mailbox's normal password.
- Limit access to the VPS and domain registrar accounts and enable two-factor authentication.
- Keep port 3000 private. Only ports 80 and 443 should be publicly exposed for the website.
- Review unusual contact volume and consider a managed CAPTCHA if abuse becomes persistent.
- Keep confirmed customer/project data in an appropriate business system rather than website logs.

## Rate-limit scope

The included limiter is intentionally simple and appropriate for one application container. It resets when the container restarts. If the website later runs on multiple servers or receives significant traffic, replace it with a shared limiter such as Redis or a managed edge firewall.

## Incident response

If SMTP or server credentials may have leaked:

1. Rotate the affected credential immediately.
2. Replace it in `.env.production`.
3. Recreate the app container.
4. Review mailbox, server, DNS and registrar access logs.
5. Remove unknown accounts, keys, DNS records or forwarding rules.

Never publish secrets in screenshots, support tickets or source repositories.
