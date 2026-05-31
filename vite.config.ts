import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import https from "node:https";
import type { IncomingMessage, ServerResponse } from "node:http";

const API_ROUTES: Record<string, string> = {
  "/api/rates": "/v1/latest",
  "/api/currencies": "/v1/currencies",
};

function apiProxyPlugin(apiKey: string, allowInsecureTls: boolean): Plugin {
  return {
    name: "freecurrencyapi-proxy",
    configureServer(server) {
      server.middlewares.use(createProxyHandler(apiKey, allowInsecureTls));
    },
    configurePreviewServer(server) {
      server.middlewares.use(createProxyHandler(apiKey, allowInsecureTls));
    },
  };
}

function httpsGet(
  url: string,
  apiKey: string,
  allowInsecureTls: boolean,
): Promise<{ status: number; body: string }> {
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

function createProxyHandler(apiKey: string, allowInsecureTls: boolean) {
  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const route = Object.keys(API_ROUTES).find((prefix) =>
      req.url?.startsWith(prefix),
    );

    if (!route) {
      next();
      return;
    }

    if (!apiKey) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          error: "FREECURRENCY_API_KEY is not configured. Copy .env.example to .env.",
        }),
      );
      return;
    }

    const incoming = new URL(req.url!, "http://localhost");
    const apiPath = API_ROUTES[route];
    const apiUrl = new URL(`https://api.freecurrencyapi.com${apiPath}`);

    if (route === "/api/rates") {
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

      apiUrl.searchParams.set("base_currency", baseCurrency);
      apiUrl.searchParams.set("currencies", currencies);
    }

    try {
      const { status, body } = await httpsGet(
        apiUrl.toString(),
        apiKey,
        allowInsecureTls,
      );

      res.statusCode = status;
      res.setHeader("Content-Type", "application/json");
      res.end(body);
    } catch {
      res.statusCode = 502;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Failed to reach FreecurrencyAPI" }));
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      react(),
      tailwindcss(),
      apiProxyPlugin(env.FREECURRENCY_API_KEY ?? "", mode !== "production"),
    ],
  };
});
