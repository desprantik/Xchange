const { proxyFreecurrency, sendJson } = require("./lib/freecurrency.cjs");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const baseCurrency = req.query.base_currency;
  const currencies = req.query.currencies;

  if (
    typeof baseCurrency !== "string" ||
    typeof currencies !== "string" ||
    !baseCurrency ||
    !currencies
  ) {
    res.status(400).json({
      error: "Missing required query params: base_currency, currencies",
    });
    return;
  }

  const params = new URLSearchParams({
    base_currency: baseCurrency,
    currencies,
  });

  try {
    sendJson(res, await proxyFreecurrency("/latest", params));
  } catch {
    res.status(500).json({ error: "Failed to fetch rates" });
  }
};
