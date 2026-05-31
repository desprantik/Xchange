const API_BASE = "https://api.freecurrencyapi.com/v1";

async function proxyFreecurrency(path, searchParams) {
  const apiKey = process.env.FREECURRENCY_API_KEY;

  if (!apiKey) {
    return {
      status: 500,
      body: JSON.stringify({
        error:
          "FREECURRENCY_API_KEY is not configured. Add it to your environment variables.",
      }),
    };
  }

  const url = new URL(`${API_BASE}${path}`);
  if (searchParams) {
    searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });
  }

  try {
    const response = await fetch(url, {
      headers: { apikey: apiKey },
    });

    return {
      status: response.status,
      body: await response.text(),
    };
  } catch {
    return {
      status: 502,
      body: JSON.stringify({ error: "Failed to reach FreecurrencyAPI" }),
    };
  }
}

function sendJson(res, result) {
  res.status(result.status);
  res.setHeader("Content-Type", "application/json");
  res.send(result.body);
}

export default async function handler(req, res) {
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
}
