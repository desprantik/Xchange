import type { VercelRequest, VercelResponse } from "@vercel/node";
import { proxyFreecurrency, sendJson } from "../lib/freecurrency";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  sendJson(res, await proxyFreecurrency("/currencies"));
}
