import { mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const logDirectory = fileURLToPath(new URL("../.wrangler/logs/", import.meta.url));
const wranglerEntry = fileURLToPath(new URL("../node_modules/wrangler/bin/wrangler.js", import.meta.url));

await mkdir(logDirectory, { recursive: true });

const child = spawn(process.execPath, [wranglerEntry, ...process.argv.slice(2)], {
  cwd: projectRoot,
  stdio: "inherit",
  env: {
    ...process.env,
    WRANGLER_WRITE_LOGS: "false",
    WRANGLER_LOG_PATH: `${logDirectory}/wrangler.log`,
    MINIFLARE_REGISTRY_PATH: fileURLToPath(new URL("../.wrangler/registry", import.meta.url)),
  },
});

child.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});

child.on("exit", (code, signal) => {
  if (signal) {
    console.error(`Wrangler stopped with signal ${signal}.`);
    process.exitCode = 1;
  } else {
    process.exitCode = code ?? 1;
  }
});
