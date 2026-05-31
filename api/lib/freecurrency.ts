const API_BASE = "https://api.freecurrencyapi.com/v1";

type ProxyResult = {
  status: number;
  body: string;
};

type ApiResponse = {
  status(code: number): ApiResponse;
  setHeader(name: string, value: string): void;
  send(body: string): void;
};

export async function proxyFreecurrency(
  path: string,
  searchParams?: URLSearchParams,
): Promise<ProxyResult> {
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
  searchParams?.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

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

export function sendJson(res: ApiResponse, result: ProxyResult) {
  res.status(result.status);
  res.setHeader("Content-Type", "application/json");
  res.send(result.body);
}
