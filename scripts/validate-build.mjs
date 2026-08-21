import assert from "node:assert/strict";
import { access } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const workerPath = new URL("dist/server/index.js", root);
const clientPath = new URL("dist/client/", root);

await access(workerPath);
await access(clientPath);

const workerUrl = new URL(workerPath.href);
workerUrl.searchParams.set("validation", `${process.pid}-${Date.now()}`);
const compiledWorker = await import(workerUrl.href);
assert.equal(typeof compiledWorker.default?.fetch, "function", "Worker must export default.fetch");

const response = await compiledWorker.default.fetch(
  new Request("https://example.com/", { headers: { Accept: "text/html" } }),
  { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
  { waitUntil() {}, passThroughOnException() {} },
);

assert.equal(response.status, 200, "Homepage must render successfully");
assert.match(response.headers.get("content-type") || "", /^text\/html/i);
assert.equal(response.headers.get("x-content-type-options"), "nosniff");
assert.equal(response.headers.get("x-frame-options"), "DENY");
assert.match(response.headers.get("content-security-policy") || "", /frame-ancestors 'none'/);

console.log("Validated independent Cloudflare Worker build.");
