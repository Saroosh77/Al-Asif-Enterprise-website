/** Independent Cloudflare Worker entry point for the website. */
import handler from "vinext/server/app-router-entry";
import {
  contactConfigResponse,
  handleContactRequest,
  withSecurityHeaders,
  type WorkerEnv,
} from "./contact";

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

const worker = {
  async fetch(request: Request, env: WorkerEnv, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.hostname.toLowerCase().startsWith("www.")) {
      const apex = url.hostname.slice(4);
      const destination = new URL(request.url);
      destination.protocol = "https:";
      destination.hostname = apex;
      destination.port = "";
      return withSecurityHeaders(Response.redirect(destination.toString(), 308));
    }

    const localHosts = new Set(["localhost", "127.0.0.1", "0.0.0.0", "terminal.local"]);
    if (url.protocol === "http:" && !localHosts.has(url.hostname.toLowerCase())) {
      const destination = new URL(request.url);
      destination.protocol = "https:";
      destination.port = "";
      return withSecurityHeaders(Response.redirect(destination.toString(), 308));
    }

    if (url.pathname === "/api/health" && request.method === "GET") {
      return withSecurityHeaders(Response.json(
        { status: "ok", service: "al-asif-enterprise", timestamp: new Date().toISOString() },
        { headers: { "Cache-Control": "no-store" } },
      ));
    }

    if (url.pathname === "/api/contact/config" && request.method === "GET") {
      return withSecurityHeaders(contactConfigResponse(env));
    }

    if (url.pathname === "/api/contact") {
      return withSecurityHeaders(await handleContactRequest(request, env));
    }

    return withSecurityHeaders(await handler.fetch(request, env, ctx));
  },
};

export default worker;
