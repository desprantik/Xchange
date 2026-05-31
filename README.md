# Xchange

A mobile currency converter app built from the [Figma design](https://www.figma.com/design/qX3lsVqCI3JeMDiZTEpOI8/Figma-MCP-test?node-id=17041-4), powered by live exchange rates from [FreecurrencyAPI](https://freecurrencyapi.com/).

## Features

- Live conversion across **33 supported currencies** (AUD, BGN, BRL, CAD, CHF, CNY, CZK, DKK, EUR, GBP, HKD, HRK, HUF, IDR, ILS, INR, ISK, JPY, KRW, MXN, MYR, NOK, NZD, PHP, PLN, RON, RUB, SEK, SGD, THB, TRY, USD, ZAR)
- Searchable currency picker with names and symbols
- Interactive numeric keypad
- Real-time exchange rate display
- Refresh button to fetch latest rates
- Responsive mobile-first UI matching the Figma mockup

## Setup

1. Copy the environment template and add your API key:

```bash
cp .env.example .env
```

2. Set `FREECURRENCY_API_KEY` in `.env` to your key from the [FreecurrencyAPI dashboard](https://freecurrencyapi.com/).

3. Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## How it works

The frontend calls a local `/api/rates` proxy (configured in `vite.config.ts`) so your API key stays server-side and is never exposed in the browser bundle. Rates are fetched on load, when you change the source currency, or when you tap the refresh icon.

## Tech stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- FreecurrencyAPI
