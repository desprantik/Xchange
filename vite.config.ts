import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import https from "node:https";
import type { IncomingMessage, ServerResponse } from "node:http";
import { proxyFreecurrency } from "./api/lib/freecurrency.js";

function apiProxyPlugin(allowInsecureTls: boolean): Plugin {
  return {
    name: "freecurrencyapi-proxy",
    configureServer(server) {
      server.middlewares.use(createProxyHandler(allowInsecureTls));
    },
    configurePreviewServer(server) {
      server.middlewares.use(createProxyHandler(allowInsecureTls));
    },
  };
}

function httpsGet(url: string, apiKey: string, allowInsecureTls: boolean): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const request = https.get(
      url,
      {
        headers: { apikey: apiKey },
        rejectUnauthorized: !allowInsecureTls,
      },
      (response) => {
        let body = "";
        response.on("data", (chunk: Buffer) => {
          body += chunk.toString();
        });
        response.on("end", () => {
          resolve({ status: response.statusCode ?? 502, body });
        });
      },
    );
    request.on("error", reject);
  });
}

async function proxyWithNodeTls(
  path: string,
  searchParams: URLSearchParams | undefined,
  allowInsecureTls: boolean,
): Promise<{ status: number; body: string }> {
  const apiKey = process.env.FREECURRENCY_API_KEY;
  if (!apiKey) {
    return proxyFreecurrency(path, searchParams);
  }

  try {
    const url = new URL(`https://api.freecurrencyapi.com/v1${path}`);
    searchParams?.forEach((value, key) => url.searchParams.set(key, value));
    return await httpsGet(url.toString(), apiKey, allowInsecureTls);
  } catch {
    return proxyFreecurrency(path, searchParams);
  }
}

function createProxyHandler(allowInsecureTls: boolean) {
  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (!req.url?.startsWith("/api/")) {
      next();
      return;
    }

    const incoming = new URL(req.url, "http://localhost");

    try {
      let result: { status: number; body: string };

      if (incoming.pathname === "/api/currencies") {
        result = await proxyWithNodeTls("/currencies", undefined, allowInsecureTls);
      } else if (incoming.pathname === "/api/rates") {
        const baseCurrency = incoming.searchParams.get("base_currency");
        const currencies = incoming.searchParams.get("currencies");

        if (!baseCurrency || !currencies) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              error: "Missing required query params: base_currency, currencies",
            }),
          );
          return;
        }

        const params = new URLSearchParams({
          base_currency: baseCurrency,
          currencies,
        });
        result = await proxyWithNodeTls("/latest", params, allowInsecureTls);
      } else {
        next();
        return;
      }

      res.statusCode = result.status;
      res.setHeader("Content-Type", "application/json");
      res.end(result.body);
    } catch {
      res.statusCode = 502;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Failed to reach FreecurrencyAPI" }));
    }
  };
}

export default defineConfig(({ mode }) => {
  loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), tailwindcss(), apiProxyPlugin(mode !== "production")],
  };
});
