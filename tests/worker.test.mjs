import assert from "node:assert/strict";
import test from "node:test";

const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
const { default: worker } = await import(workerUrl.href);

const context = { waitUntil() {}, passThroughOnException() {} };
const baseEnv = {
  ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  RESEND_API_KEY: "re_test",
  TURNSTILE_SECRET_KEY: "turnstile_test",
  TURNSTILE_SITE_KEY: "1x00000000000000000000AA",
};

function request(path = "/api/contact", body = {}, origin = "https://example.com") {
  return new Request(`https://example.com${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify({
      name: "Test Customer",
      phone: "03001234567",
      email: "customer@example.net",
      city: "Gulshan-e-Iqbal, Karachi",
      property: "House",
      bill: "PKR 15,000–30,000",
      backup: "Essential loads only",
      preferredContact: "WhatsApp",
      message: "Please contact me about a residential solar installation.",
      consent: "on",
      website: "",
      startedAt: Date.now() - 5_000,
      turnstileToken: "valid-token",
      ...body,
    }),
  });
}

test("homepage renders with production security headers", async () => {
  const response = await worker.fetch(
    new Request("https://example.com/", { headers: { Accept: "text/html" } }),
    baseEnv,
    context,
  );
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.match(response.headers.get("strict-transport-security") || "", /max-age=31536000/);
  assert.match(response.headers.get("content-security-policy") || "", /challenges\.cloudflare\.com/);
});

test("www redirects permanently to the apex domain and preserves the URL", async () => {
  const response = await worker.fetch(
    new Request("https://www.example.com/privacy?ref=footer"),
    baseEnv,
    context,
  );
  assert.equal(response.status, 308);
  assert.equal(response.headers.get("location"), "https://example.com/privacy?ref=footer");
});

test("public HTTP requests redirect to HTTPS", async () => {
  const response = await worker.fetch(
    new Request("http://example.com/quote?source=card"),
    baseEnv,
    context,
  );
  assert.equal(response.status, 308);
  assert.equal(response.headers.get("location"), "https://example.com/quote?source=card");
});

test("health endpoint reports ok", async () => {
  const response = await worker.fetch(
    new Request("https://example.com/api/health"),
    baseEnv,
    context,
  );
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.status, "ok");
});

test("contact configuration exposes only the public Turnstile site key", async () => {
  const response = await worker.fetch(
    new Request("https://example.com/api/contact/config"),
    baseEnv,
    context,
  );
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { siteKey: baseEnv.TURNSTILE_SITE_KEY });
});

test("cross-origin contact submissions are blocked", async () => {
  const response = await worker.fetch(request("/api/contact", {}, "https://attacker.example"), baseEnv, context);
  assert.equal(response.status, 403);
});

test("submissions without consent are rejected", async () => {
  const response = await worker.fetch(request("/api/contact", { consent: "" }), baseEnv, context);
  assert.equal(response.status, 400);
});

test("submissions with an invalid property type are rejected", async () => {
  const response = await worker.fetch(request("/api/contact", { property: "Not a real option" }), baseEnv, context);
  assert.equal(response.status, 400);
});

test("honeypot submissions receive a neutral success without external calls", async () => {
  const originalFetch = globalThis.fetch;
  let externalCalls = 0;
  globalThis.fetch = async () => { externalCalls += 1; return new Response(); };
  try {
    const response = await worker.fetch(request("/api/contact", { website: "spam.example" }), baseEnv, context);
    assert.equal(response.status, 200);
    assert.equal(externalCalls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("failed Turnstile verification prevents email delivery", async () => {
  const originalFetch = globalThis.fetch;
  let emailCalls = 0;
  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.includes("siteverify")) return Response.json({ success: false, "error-codes": ["invalid-input-response"] });
    if (url.includes("api.resend.com")) emailCalls += 1;
    return new Response("Unexpected request", { status: 500 });
  };
  try {
    const response = await worker.fetch(request(), baseEnv, context);
    assert.equal(response.status, 400);
    assert.equal(emailCalls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("a verified submission is delivered through the email API", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    calls.push({ url, init });
    if (url.includes("siteverify")) return Response.json({ success: true, action: "contact" });
    if (url.includes("api.resend.com")) return Response.json({ id: "email_test" });
    return new Response("Unexpected request", { status: 500 });
  };
  try {
    const response = await worker.fetch(request(), baseEnv, context);
    const result = await response.json();
    assert.equal(response.status, 200);
    assert.equal(result.ok, true);
    assert.equal(calls.length, 2);
    assert.match(calls[0].url, /turnstile\/v0\/siteverify/);
    assert.equal(calls[1].url, "https://api.resend.com/emails");
    const email = JSON.parse(calls[1].init.body);
    assert.equal(email.reply_to, "customer@example.net");
    assert.match(email.subject, /Test Customer/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
