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

module.exports = { proxyFreecurrency, sendJson };
