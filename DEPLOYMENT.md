# Deploy on Your Own Server and Domain

This guide deploys the website independently on a Linux VPS. The server can be from any provider that gives you a public IP address and permits ports 80 and 443. A basic server with 1 GB RAM is enough for this website.

## 1. Buy the domain and server

You need:

- A domain, for example `al-asifenterprise.com`
- A Linux VPS with a public IPv4 address
- SSH/root or sudo access to the VPS
- A mailbox or SMTP service for contact-form delivery

This package requires a Node.js-capable server. Very limited shared hosting that supports only static HTML/PHP is not suitable unless it also provides Node.js or Docker.

## 2. Point the domain to the VPS

At the company where you bought the domain, open DNS management and add:

| Type | Name | Value | Purpose |
| --- | --- | --- | --- |
| A | `@` | Your VPS IPv4 address | Main domain |
| A | `www` | Your VPS IPv4 address | Optional `www` address |

DNS may take from a few minutes to several hours to update. You can deploy before it completes, but HTTPS becomes available only after the domain resolves to the server.

The included configuration serves the exact value in `DOMAIN`. For the simplest setup, use the main domain without `www`. If you prefer `www`, set `DOMAIN=www.yourdomain.com`.

## 3. Install Docker on the VPS

Connect by SSH:

```bash
ssh your-user@YOUR_SERVER_IP
```

Install Docker Engine and the Docker Compose plugin using your VPS provider's current instructions or Docker's official installation guide. Confirm both are available:

```bash
docker --version
docker compose version
```

If Docker requires sudo on your server, add `sudo` before every `docker` command in this guide.

## 4. Upload and extract the package

Upload this ZIP to the server with your provider's file manager, SFTP, or `scp`. Then extract it and enter the directory:

```bash
unzip Al-Asif-Enterprise-Standalone.zip
cd Al-Asif-Enterprise-Standalone
```

## 5. Create the production settings

```bash
cp .env.example .env.production
nano .env.production
```

Replace every placeholder. A typical configuration is:

```dotenv
DOMAIN=yourdomain.com
SITE_URL=https://yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com
LETSENCRYPT_EMAIL=your-admin-email@example.com

CONTACT_TO_EMAIL=asifmumtazk@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=asifmumtazk@gmail.com
SMTP_PASS=your-provider-app-password
SMTP_FROM_NAME=Al-Asif Enterprise Website
SMTP_FROM_EMAIL=asifmumtazk@gmail.com
```

For Gmail, use an app password or another SMTP credential supported by the account; do not use or publish the normal Google account password. Other providers can be used by changing the SMTP host, port and secure mode.

Save the file and protect it:

```bash
chmod 600 .env.production
```

## 6. Open the firewall

Keep SSH open and allow web traffic. If your server uses UFW:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 443/udp
sudo ufw enable
```

Also allow ports 80 and 443 in the VPS provider's network firewall, if it has one.

## 7. Start the website

From the project directory:

```bash
sh deploy/deploy.sh
```

The script builds the website and starts both the application and Caddy. Caddy obtains and renews the HTTPS certificate automatically.

Check status:

```bash
docker compose ps
docker compose logs --tail=100 app
docker compose logs --tail=100 caddy
```

Visit `https://yourdomain.com` and test:

- Homepage on desktop and mobile
- Phone link
- WhatsApp link
- Contact form email delivery
- Privacy page
- `https://yourdomain.com/api/health`

## 8. Test the contact form safely

Submit one inquiry from the live website. Confirm it reaches `CONTACT_TO_EMAIL` and that replying goes to the visitor's email when they supplied one. If it fails, inspect only the application logs; never paste SMTP credentials into chat or public tickets.

Common causes are an incorrect app password, blocked SMTP access, a wrong port, or `ALLOWED_ORIGINS` not matching the exact live domain.

## 9. Optional `www` redirect

If both DNS records exist and you want `www.yourdomain.com` to redirect to the main domain, add this block below the existing block in `deploy/Caddyfile`:

```caddyfile
www.yourdomain.com {
  redir https://yourdomain.com{uri} permanent
}
```

Then run:

```bash
docker compose restart caddy
```

## What is independent here?

The website runs from your server, domain, Docker installation and chosen mailbox. Source code, images, form processing, HTTPS, logs and updates are under your control. ChatGPT is not involved when visitors use the deployed site.
