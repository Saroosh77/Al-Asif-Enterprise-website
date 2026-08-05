import vinext from "vinext";
import { defineConfig, loadEnv } from "vite";

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";

export default defineConfig(async ({ command, mode }) => {
  const localEnv = command === "serve" ? loadEnv(mode, process.cwd(), "") : {};
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    server: {
      host: "0.0.0.0",
      allowedHosts: ["terminal.local"],
      ...(isCodexSeatbeltSandbox
        ? { watch: { useFsEvents: false, usePolling: true } }
        : {}),
    },
    plugins: [
      vinext(),
      cloudflare({
        configPath: "./wrangler.jsonc",
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        inspectorPort: false,
        config: {
          main: "./worker/index.ts",
          assets: {
            binding: "ASSETS",
            directory: "./public",
          },
          vars: {
            RESEND_API_KEY: localEnv.RESEND_API_KEY || "",
            TURNSTILE_SECRET_KEY: localEnv.TURNSTILE_SECRET_KEY || "",
            TURNSTILE_SITE_KEY: localEnv.TURNSTILE_SITE_KEY || "",
          },
        },
      }),
    ],
  };
});
