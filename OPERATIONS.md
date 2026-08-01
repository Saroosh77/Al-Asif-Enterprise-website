# Website Operations

## View status

```bash
docker compose ps
curl -fsS https://yourdomain.com/api/health
```

## View recent logs

```bash
docker compose logs --tail=100 app
docker compose logs --tail=100 caddy
```

The contact endpoint deliberately avoids logging visitor form contents. Do not add passwords or complete customer requests to public logs.

## Restart

```bash
docker compose restart
```

## Apply website changes

Back up the current directory, upload the changed source, then run:

```bash
docker compose --env-file .env.production up -d --build
```

Confirm the homepage, health endpoint and one contact submission afterward.

## Change the contact recipient

Edit `CONTACT_TO_EMAIL` in `.env.production`, then recreate the application container:

```bash
docker compose --env-file .env.production up -d --force-recreate app
```

## Stop the website

```bash
docker compose down
```

Do not add `-v` unless you intentionally want to delete Caddy's stored certificate data. The certificate can be obtained again, but unnecessary deletion may trigger certificate-authority rate limits.

## Backups

Keep protected backups of:

- The complete source package and your real project photos
- `.env.production` in a secure password manager or encrypted backup
- Any future database or uploaded-customer files if those features are added

This version has no customer database. Inquiries are delivered to the configured mailbox.

## Regular maintenance

At least monthly:

- Install VPS security updates
- Review container and application logs for repeated failures
- Confirm HTTPS renewal and contact-form delivery
- Back up new project photographs
- Update Node/Next.js/container dependencies after testing the build locally

Do not run unattended major-version upgrades directly on the live server.
