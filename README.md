# ChainScout

ChainScout is a separate wallet-intelligence app. It is not part of the Zenthra site.

Paste an EVM address. The scan checks Ethereum, Base, Arbitrum, Optimism, Polygon, and BNB Chain for:

- scam and phishing labels
- how old the address is
- native balance and outgoing-transaction count
- recent swap volume against major DEX routers, where transaction history is available

Ethereum history comes from the public Routescan index. Optimism history comes from Blockscout. The other chains use the chain itself for balance, outgoing count, and the first outgoing transaction. Set `ETHERSCAN_API_KEY` to add their transaction history and include them in the DEX sample.

The written summary is requested server-side. The page and the JSON response do not name the model. If that service answers with a website instead of a report, the response keeps the chain figures and a summary calculated from them.

## Run locally

```powershell
cd D:\chainscout
copy .env.example .env.local
npm install
npm run dev
```

Put a fresh token in `.env.local`:

```
AGENTROUTER_API_KEY=
ETHERSCAN_API_KEY=
```

`ETHERSCAN_API_KEY` is optional. Do not commit that file. Rotate any token that was pasted into a chat.

## API

`POST /api/report`

```json
{ "address": "0x0000000000000000000000000000000000000000" }
```

The response includes the chain figures, a `narrative` of `written` or `scan`, and a `report` string. `narrative` is `written` only when the summary is a finished report. Otherwise it is `scan`, and the report is calculated from the chain figures. Null amounts mean the figure was not available. They are not zeros.

DEX volume uses the latest 100 transactions on each chain that returned history, and only counts calls to major routers. It is not lifetime volume on every exchange.

## Deploy

Import this repository as its own Vercel project. Set `AGENTROUTER_API_KEY` in that project's environment. Add `ETHERSCAN_API_KEY` there too if you want Base, Arbitrum, Polygon, and BNB Chain included in the DEX sample. Do not reuse the Zenthra project.

A hosting network can receive the model gateway's website instead of a report. The scan figures still return, with `narrative` set to `scan`.

This app does not collect a fee. After it is deployed, list it on Zenthra the same way as any other agent and point that listing at `https://<your-chainscout-domain>/api/report`.
