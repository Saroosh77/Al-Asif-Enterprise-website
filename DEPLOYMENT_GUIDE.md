# Al-Asif Enterprise — Owner Deployment Guide

This guide publishes the website under the company's own domain, Cloudflare account, GitHub repository and email-delivery account.

## 1. Accounts you need

Create these accounts under an email address controlled by the company:

1. A domain registrar account containing the purchased domain.
2. A free Cloudflare account for DNS, the website, HTTPS and Turnstile.
3. A private GitHub repository for source code and automatic updates.
4. A Resend account for contact-form email delivery.

Do not send passwords, API tokens or secret keys to another person. Add them only to the account dashboards or local secret prompts described below.

## 2. Put the domain on Cloudflare

1. In Cloudflare, choose **Add a domain** and enter the purchased root domain, such as `alasifenterprise.com`.
2. Select the Free plan.
3. Cloudflare will give you two nameservers.
4. Open the registrar where you bought the domain and replace its nameservers with the two Cloudflare nameservers.
5. Wait until Cloudflare shows the zone as **Active**.

If the root or `www` hostname already has a CNAME or another website record, remove that conflicting record before the first deployment. Cloudflare Workers Custom Domains will create the required records and HTTPS certificates.

## 3. Configure this project

From the project folder, run:

```bash
npm ci
npm run setup:domain -- alasifenterprise.com
```

Use your actual domain instead of the example. This command adds both custom domains and updates `public/robots.txt` / `public/sitemap.xml`:

- `alasifenterprise.com` — the main website
- `www.alasifenterprise.com` — permanently redirects to the main website

Open `site.config.json` and replace every remaining placeholder:

```json
{
  "domain": "alasifenterprise.com",
  "contact": {
    "email": "asifmumtazk@gmail.com",
    "phoneLabel": "0333 3674788",
    "phoneHref": "+923333674788",
    "whatsappHref": "https://wa.me/923333674788",
    "address": "Shop # 6, 3.C 3/9, Nazimabad # 3, Karachi, Pakistan"
  },
  "emailDelivery": {
    "to": "the-inbox-that-receives-enquiries@example.com",
    "from": "Al-Asif Enterprise Website <website@alasifenterprise.com>"
  },
  "turnstileSiteKey": "your-production-turnstile-site-key"
}
```

`contact.email` is shown publicly. `emailDelivery.to` is the inbox that receives form messages; it can be the same address or a different one. `emailDelivery.from` must use a domain verified in Resend.

## 4. Set up the protected contact form

### Cloudflare Turnstile

1. Open the Cloudflare dashboard and go to **Turnstile**.
2. Add a widget for the root domain and `www` domain.
3. Choose the managed widget mode.
4. Copy the **site key** into `site.config.json` as `turnstileSiteKey`.
5. Keep the **secret key** private; it is added in step 6.

The visible widget is only the first layer. The website also validates every token on the server, rejects cross-site posts, limits form sizes and ages, validates all fields (including the property-type dropdown), and uses a hidden spam field.

### Resend email delivery

1. In Resend, add and verify a sending domain. A subdomain such as `mail.alasifenterprise.com` is a good choice.
2. Add the DNS records shown by Resend to Cloudflare DNS.
3. Wait until Resend marks the domain as verified.
4. Create a Resend API key.
5. Set `emailDelivery.from` to an address on the verified domain, for example `Al-Asif Enterprise Website <website@mail.alasifenterprise.com>`.

The form sends plain-text and HTML versions of each consultation request and sets the customer's address as **Reply-To**. Visitors can also continue the same request on WhatsApp instead, which needs no email configuration.

## 5. Test locally

Copy the example secrets file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set your Resend API key. The included Turnstile values are official testing keys for localhost only.

```dotenv
RESEND_API_KEY=re_your_real_key
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
TURNSTILE_SITE_KEY=1x00000000000000000000AA
```

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Open `http://127.0.0.1:5173`, submit the form, and confirm the message reaches `emailDelivery.to`. Delete `.env.local` before sharing the folder; it is already excluded from Git.

## 6. First manual Cloudflare deployment

Authenticate from the project folder:

```bash
npm run cloudflare -- login
```

Store the two production secrets in Cloudflare. Wrangler asks for each value without saving it in the source code:

```bash
npm run cloudflare -- secret put RESEND_API_KEY
npm run cloudflare -- secret put TURNSTILE_SECRET_KEY
```

Check the configuration:

```bash
npm run verify:config
```

Publish the complete website with one command:

```bash
npm run deploy
```

Cloudflare will build the Worker, attach both custom domains and issue HTTPS certificates. The worker redirects every `www` request to the root domain with status `308` while preserving the path and query string.

## 7. Automatic GitHub deployments

This project already includes a working GitHub Actions workflow at `.github/workflows/deploy.yml`. It automatically:

1. Installs exact locked dependencies.
2. Rejects placeholder production settings (fails the run if `site.config.json` still has `your-domain.com`, `your-email@example.com`, etc.).
3. Builds the website and runs the automated tests (page rendering, redirects, headers, form security).
4. Uploads the two protected Worker secrets.
5. Deploys the tested version to Cloudflare, attaching both custom domains.

It runs on every push to `main`, and can also be triggered manually. **Do this after you've bought the domain and completed steps 2–4 above** — the workflow will fail the "Verify production settings" step until `site.config.json` has real values and `npm run setup:domain` has been run.

### 7.1 Push this project to GitHub

If it isn't already: create a **private** repository on GitHub, then from the project folder:

```bash
git remote add origin https://github.com/your-account/your-repo.git
git push -u origin main
```

If a repository and remote already exist, just make sure your changes are committed and pushed to `main` — that's what triggers the workflow.

### 7.2 Create the Cloudflare API token

1. Go to the Cloudflare dashboard → **My Profile → API Tokens** (`dash.cloudflare.com/profile/api-tokens`).
2. Select **Create Token**.
3. Under **Custom token**, choose the template **Edit Cloudflare Workers**. This grants exactly what `wrangler deploy` needs, including attaching Workers Custom Domains.
4. Under **Account Resources**, scope it to the one Cloudflare account this site lives in (not "All accounts").
5. Under **Zone Resources**, scope it to the specific domain's zone (not "All zones") once the domain has been added to Cloudflare (step 2 of this guide).
6. Create the token and copy it immediately — Cloudflare only shows it once.

### 7.3 Find the Cloudflare Account ID

In the Cloudflare dashboard, open **Workers & Pages**. The **Account ID** is shown in the right-hand sidebar of the overview page. Copy it.

### 7.4 Get the other two secrets

- **`RESEND_API_KEY`**: Resend dashboard → **API Keys → Create API Key**. If Al-Rayyan Engineering's website already uses Resend, you can reuse the same Resend account here — just verify a sending domain for Al-Asif Enterprise too and create a separate API key for this project.
- **`TURNSTILE_SECRET_KEY`**: Cloudflare dashboard → **Turnstile** → open the widget you created in step 4 of this guide → copy the **Secret Key** (not the site key, which goes in `site.config.json` instead).

### 7.5 Add the secrets to GitHub

In the GitHub repository, open **Settings → Secrets and variables → Actions → New repository secret**, and add all four:

| Secret | Value |
|---|---|
| `CLOUDFLARE_API_TOKEN` | The token created in 7.2 |
| `CLOUDFLARE_ACCOUNT_ID` | The account ID from 7.3 |
| `RESEND_API_KEY` | The Resend key from 7.4 |
| `TURNSTILE_SECRET_KEY` | The Turnstile secret key from 7.4 |

Repository secrets are visible to the workflow even though it declares `environment: production` — GitHub creates that environment automatically on first run. You can optionally open **Settings → Environments → production** afterward to add protection rules (e.g. require a manual approval before every deploy), but this is not required to get automatic deployment working.

### 7.6 Trigger a deployment

Push any commit to `main`, or open the **Actions** tab in GitHub, select **Deploy website**, and click **Run workflow** to trigger it manually without a new commit.

### 7.7 If it fails

Open the failed run in the **Actions** tab and read which step failed:

- **"Verify production settings" fails** — `site.config.json` still has placeholder values, or `npm run setup:domain` hasn't been run and committed yet. Fix locally, commit, and push again.
- **"Build and test" fails** — something is broken in the code; the error output points at the failing check.
- **"Deploy to Cloudflare" fails** — usually a token/permission problem (recheck the scopes in 7.2) or the domain's Cloudflare zone isn't **Active** yet (recheck step 2 of this guide).

Because the workflow validates everything before deploying, a failed run never touches the live site — the previous working deployment stays up.

## 8. Replace photos and republish

Replace the matching files in `public/images/` without changing their filenames — see [PHOTO-GUIDE.md](PHOTO-GUIDE.md) for details on each slot. Inspect them locally, then publish:

```bash
npm test
npm run deploy
```

With GitHub automation, commit and push the photo changes instead; the workflow publishes them automatically.

If a real project photo has a different extension, either convert it to `.jpg` or update the matching image path in `app/page.tsx` and `app/globals.css`.

## 9. Security and HTTPS

The Worker applies these protections to every response:

- Content Security Policy restricted to the website and Cloudflare Turnstile
- HTTPS-only browser policy through HSTS
- Clickjacking protection
- MIME-sniffing protection
- Restricted browser permissions
- Strict referrer policy
- Same-origin contact submissions
- Server-side Turnstile validation
- Input length, type and timing checks, including the property-type dropdown
- Hidden spam honeypot

Cloudflare manages and renews the HTTPS certificates. Do not commit `.env.local`, API keys or Turnstile secret keys. If a key does leak, rotate it immediately in the Resend or Cloudflare dashboard and update the corresponding GitHub secret.

## 10. Final checks

After publishing, confirm:

- The root domain opens with a padlock.
- `www` redirects to the root domain.
- Navigation works on a phone and desktop.
- Phone, WhatsApp and "Continue on WhatsApp" buttons open the correct number with a prefilled message.
- The consultation form sends a test enquiry to the chosen inbox.
- Replying to the received email addresses the customer.
- The `/privacy` page opens and its address/contact details are correct.
- All demonstration photos replaced with approved company photos are correctly cropped.

If a deployment fails, open the failed GitHub workflow. Configuration problems are reported before the website is changed, so the previous working deployment remains available.
