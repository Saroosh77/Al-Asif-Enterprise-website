import siteConfig from "../site.config.json";
import { buildContactHtml, buildContactText, validateContactPayload, type ContactSubmission } from "../lib/contact";

export interface WorkerEnv {
  ASSETS: Fetcher;
  RESEND_API_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  TURNSTILE_SITE_KEY?: string;
}

type TurnstileResponse = {
  success?: boolean;
  action?: string;
  "error-codes"?: string[];
};

const MAX_BODY_BYTES = 12_000;
const MIN_FORM_TIME_MS = 1_500;
const MAX_FORM_AGE_MS = 2 * 60 * 60 * 1_000;

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex",
};

export const SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "base-uri 'self'",
    "connect-src 'self' https://challenges.cloudflare.com",
    "font-src 'self' data:",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src https://challenges.cloudflare.com",
    "img-src 'self' data:",
    "object-src 'none'",
    "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
    "style-src 'self' 'unsafe-inline'",
  ].join("; "),
  "Permissions-Policy": "camera=(), geolocation=(), microphone=(), payment=(), usb=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

function jsonResponse(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS,
  });
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("Origin");
  if (!origin) return false;

  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

async function verifyTurnstile(
  token: string,
  request: Request,
  secret: string,
): Promise<boolean> {
  const form = new URLSearchParams({
    secret,
    response: token,
    idempotency_key: crypto.randomUUID(),
  });
  const remoteIp = request.headers.get("CF-Connecting-IP");
  if (remoteIp) form.set("remoteip", remoteIp);

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    },
  );

  if (!response.ok) return false;
  const result = (await response.json()) as TurnstileResponse;
  return result.success === true && (!result.action || result.action === "contact");
}

async function deliverEmail(data: ContactSubmission, apiKey: string): Promise<boolean> {
  const subject = `Solar inquiry: ${data.name} — ${data.city}`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: siteConfig.emailDelivery.from,
      to: [siteConfig.emailDelivery.to],
      reply_to: data.email || undefined,
      subject,
      text: buildContactText(data),
      html: buildContactHtml(data),
    }),
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    console.error("Contact email delivery failed", response.status, detail);
  }
  return response.ok;
}

export function contactConfigResponse(env: WorkerEnv): Response {
  return jsonResponse(200, {
    siteKey: env.TURNSTILE_SITE_KEY || siteConfig.turnstileSiteKey,
  });
}

export async function handleContactRequest(
  request: Request,
  env: WorkerEnv,
): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { ...JSON_HEADERS, Allow: "POST" },
    });
  }

  if (!isSameOrigin(request)) {
    return jsonResponse(403, {
      ok: false,
      message: "This request was blocked for security reasons.",
    });
  }

  if (!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) {
    return jsonResponse(415, {
      ok: false,
      message: "Unsupported request format.",
    });
  }

  const declaredLength = Number(request.headers.get("Content-Length") || 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return jsonResponse(413, { ok: false, message: "The message is too large." });
  }

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return jsonResponse(413, { ok: false, message: "The message is too large." });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { ok: false, message: "The form data is invalid." });
  }

  const validation = validateContactPayload(body);
  if (!validation.ok) {
    return jsonResponse(400, { ok: false, message: validation.message });
  }

  // A filled honeypot is treated as success so automated submitters receive no clue.
  if (validation.isBot) {
    return jsonResponse(200, {
      ok: true,
      message: "Your request has been received.",
    });
  }

  const startedAt = typeof body.startedAt === "number" ? body.startedAt : Number(body.startedAt);
  const formAge = Date.now() - startedAt;
  if (!Number.isFinite(startedAt) || formAge < MIN_FORM_TIME_MS || formAge > MAX_FORM_AGE_MS) {
    return jsonResponse(400, {
      ok: false,
      message: "Please refresh the page and try again.",
    });
  }

  const turnstileToken = stringValue(body.turnstileToken);
  if (!turnstileToken || turnstileToken.length > 2_048) {
    return jsonResponse(400, {
      ok: false,
      message: "Please complete the security verification first.",
    });
  }

  if (!env.TURNSTILE_SECRET_KEY || !env.RESEND_API_KEY) {
    console.error("Contact form secrets are not configured.");
    return jsonResponse(503, {
      ok: false,
      message: "The contact form is temporarily unavailable. Please call or email us directly.",
    });
  }

  let verified = false;
  try {
    verified = await verifyTurnstile(turnstileToken, request, env.TURNSTILE_SECRET_KEY);
  } catch (error) {
    console.error("Turnstile verification failed", error);
  }
  if (!verified) {
    return jsonResponse(400, {
      ok: false,
      message: "Verification failed. Please try again.",
    });
  }

  try {
    const delivered = await deliverEmail(validation.data, env.RESEND_API_KEY);
    if (!delivered) throw new Error("Email provider rejected the message");
  } catch (error) {
    console.error("Contact submission failed", error);
    return jsonResponse(502, {
      ok: false,
      message: "We could not send your enquiry right now. Please call or email us directly.",
    });
  }

  return jsonResponse(200, {
    ok: true,
    message: "Thank you. Your request has been emailed successfully.",
  });
}

export function withSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(name, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
