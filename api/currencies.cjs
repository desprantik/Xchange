const { proxyFreecurrency, sendJson } = require("./lib/freecurrency.cjs");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    sendJson(res, await proxyFreecurrency("/currencies"));
  } catch {
    res.status(500).json({ error: "Failed to fetch currencies" });
  }
};
