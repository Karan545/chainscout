import type { AccountKind, AgeSource, ChainReport, RiskFlag, ScanResult } from "@/lib/types";

const SAMPLE = 100;

const SAMPLE_NOTE =
  "DEX volume counts the latest 100 transactions on each chain that returned history, and only when they call a major router such as Uniswap, 1inch, 0x, Sushi, QuickSwap, PancakeSwap, or CoW Swap. It is not lifetime volume across every venue.";

type Chain = {
  id: number;
  key: string;
  label: string;
  native: string;
  priceId: string;
  wrapped: string;
  stables: { address: string; decimals: number }[];
  routers: string[];
  rpc: string[];
  archive: string[];
  history: "routescan" | "blockscout" | "none";
  blockscout?: string;
};

const SHARED_ROUTERS = [
  "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad",
  "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45",
  "0x1111111254eeb25477b68fb85ed929f73a960582",
  "0x111111125421ca6dc452d289314280a0f8842a65",
  "0xdef1c0ded9bec7f1a1670819833240f027b25eff",
  "0x1b02da8cb0d097eb8d57a175b88c7d8b47997506",
  "0x9008d19f58aabd9ed0d60971565aa8510560ab41",
];

const CHAINS: Chain[] = [
  {
    id: 1,
    key: "ethereum",
    label: "Ethereum",
    native: "ETH",
    priceId: "coingecko:ethereum",
    wrapped: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    stables: [
      { address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", decimals: 6 },
      { address: "0xdac17f958d2ee523a2206206994597c13d831ec7", decimals: 6 },
      { address: "0x6b175474e89094c44da98b954eedeac495271d0f", decimals: 18 },
    ],
    routers: [
      ...SHARED_ROUTERS,
      "0x7a250d5630b4cf539739df2c5dacb4c659f2488d",
      "0xe592427a0aece92de3edee1f18e0157c05861564",
      "0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f",
    ],
    rpc: ["https://ethereum-rpc.publicnode.com", "https://cloudflare-eth.com"],
    archive: [],
    history: "routescan",
  },
  {
    id: 8453,
    key: "base",
    label: "Base",
    native: "ETH",
    priceId: "coingecko:ethereum",
    wrapped: "0x4200000000000000000000000000000000000006",
    stables: [{ address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", decimals: 6 }],
    routers: [...SHARED_ROUTERS, "0x2626664c2603336e57b271c5c0c8479c2c3d1e"],
    rpc: ["https://base-rpc.publicnode.com", "https://mainnet.base.org"],
    archive: ["https://mainnet.base.org"],
    history: "none",
  },
  {
    id: 42161,
    key: "arbitrum",
    label: "Arbitrum",
    native: "ETH",
    priceId: "coingecko:ethereum",
    wrapped: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
    stables: [
      { address: "0xaf88d065e77c8cc2239327c5edb3a432268e5831", decimals: 6 },
      { address: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", decimals: 6 },
      { address: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", decimals: 6 },
    ],
    routers: [...SHARED_ROUTERS],
    rpc: ["https://arbitrum-one-rpc.publicnode.com", "https://arb1.arbitrum.io/rpc"],
    archive: ["https://arbitrum-one.public.blastapi.io"],
    history: "none",
  },
  {
    id: 10,
    key: "optimism",
    label: "Optimism",
    native: "ETH",
    priceId: "coingecko:ethereum",
    wrapped: "0x4200000000000000000000000000000000000006",
    stables: [
      { address: "0x0b2c639c533813f4aa9d7837caf62653d097ff85", decimals: 6 },
      { address: "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58", decimals: 6 },
    ],
    routers: [...SHARED_ROUTERS],
    rpc: ["https://optimism-rpc.publicnode.com", "https://mainnet.optimism.io"],
    archive: ["https://mainnet.optimism.io"],
    history: "blockscout",
    blockscout: "https://optimism.blockscout.com",
  },
  {
    id: 137,
    key: "polygon",
    label: "Polygon",
    native: "POL",
    priceId: "coingecko:polygon-ecosystem-token",
    wrapped: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
    stables: [
      { address: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359", decimals: 6 },
      { address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174", decimals: 6 },
      { address: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", decimals: 6 },
    ],
    routers: [...SHARED_ROUTERS, "0xa5e0829caced8ffdd4de3c43696c57f7d7a678ff"],
    rpc: ["https://polygon-bor-rpc.publicnode.com", "https://polygon.drpc.org"],
    archive: ["https://polygon.drpc.org"],
    history: "none",
  },
  {
    id: 56,
    key: "bsc",
    label: "BNB Chain",
    native: "BNB",
    priceId: "coingecko:binancecoin",
    wrapped: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
    stables: [
      { address: "0x55d398326f99059ff775485246999027b3197955", decimals: 18 },
      { address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", decimals: 18 },
    ],
    routers: [
      ...SHARED_ROUTERS,
      "0x10ed43c718714eb63d5aa57b78b54704e256024e",
      "0x13f4ea83d0bd40e75c8222255bc855a974568dd4",
    ],
    rpc: ["https://bsc-rpc.publicnode.com", "https://bsc-dataseed.binance.org"],
    archive: ["https://bsc-mainnet.public.blastapi.io"],
    history: "none",
  },
];

const FLAG_LABELS: Record<string, string> = {
  cybercrime: "Cybercrime",
  money_laundering: "Money laundering",
  gas_abuse: "Gas abuse",
  financial_crime: "Financial crime",
  darkweb_transactions: "Darkweb transactions",
  phishing_activities: "Phishing",
  fake_kyc: "Fake KYC",
  blacklist_doubt: "Blacklist doubt",
  stealing_attack: "Theft",
  blackmail_activities: "Blackmail",
  sanctioned: "Sanctioned",
  malicious_mining_activities: "Malicious mining",
  mixer: "Mixer",
  fake_token: "Fake token",
  honeypot_related_address: "Honeypot-related",
  reinit: "Reinitialized contract",
  fake_standard_interface: "Fake token interface",
};

type NormalTx = {
  timeStamp?: string;
  from?: string;
  to?: string;
  value?: string;
  hash?: string;
  isError?: string;
};

type TokenTx = {
  hash?: string;
  from?: string;
  to?: string;
  contractAddress?: string;
  value?: string;
  tokenDecimal?: string;
};

type Dated = { iso: string; days: number };

type History = {
  ok: boolean;
  transactions: number | null;
  tokenTransfers: number | null;
  firstSeen: Dated | null;
  recent: NormalTx[] | null;
  tokens: TokenTx[] | null;
};

const EMPTY_HISTORY: History = {
  ok: false,
  transactions: null,
  tokenTransfers: null,
  firstSeen: null,
  recent: null,
  tokens: null,
};

function createQueue(gapMs: number) {
  let tail: Promise<unknown> = Promise.resolve();
  return function run<T>(job: () => Promise<T>): Promise<T> {
    const result = tail.then(async () => {
      await sleep(gapMs);
      return job();
    });
    tail = result.then(
      () => undefined,
      () => undefined
    );
    return result;
  };
}

const routescanQueue = createQueue(450);
const blockscoutQueue = createQueue(350);
const etherscanQueue = createQueue(220);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getJson(url: string): Promise<unknown | null> {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
      headers: { accept: "application/json" },
    });
    if (!response.ok) return null;
    const text = await response.text();
    const trimmed = text.trimStart();
    if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return null;
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function explorerRows(payload: unknown): { ok: boolean; rows: Record<string, string>[] } {
  if (!payload || typeof payload !== "object") return { ok: false, rows: [] };
  const body = payload as { status?: string; message?: string; result?: unknown };
  if (Array.isArray(body.result)) {
    return {
      ok: true,
      rows: body.result.filter((row): row is Record<string, string> => !!row && typeof row === "object"),
    };
  }
  const text = `${body.message ?? ""} ${typeof body.result === "string" ? body.result : ""}`;
  if (body.status === "0" && /no transactions found|no records found/i.test(text)) {
    return { ok: true, rows: [] };
  }
  return { ok: false, rows: [] };
}

function listUrl(endpoint: string, action: "txlist" | "tokentx", address: string, offset: number, sort: "asc" | "desc"): string {
  const params = new URLSearchParams({
    module: "account",
    action,
    address,
    startblock: "0",
    endblock: "99999999",
    page: "1",
    offset: String(offset),
    sort,
  });
  return `${endpoint}?${params}`;
}

function bigintUnits(raw: bigint, decimals: number): number {
  const scale = BigInt(10) ** BigInt(decimals);
  return Number(raw / scale) + Number(raw % scale) / Number(scale);
}

function decimalUnits(raw: string | undefined, decimals: number): number {
  if (!raw || !/^\d+$/.test(raw)) return 0;
  return bigintUnits(BigInt(raw), decimals);
}

function hexUnits(hex: string, decimals: number): number | null {
  if (!/^0x[0-9a-f]+$/i.test(hex)) return null;
  return bigintUnits(BigInt(hex), decimals);
}

function hexNumber(value: unknown): number | null {
  if (typeof value !== "string" || !/^0x[0-9a-f]+$/i.test(value)) return null;
  const number = Number(BigInt(value));
  return Number.isFinite(number) ? number : null;
}

function countField(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && /^\d+$/.test(value)) return Number(value);
  return null;
}

function isoDays(unixSeconds: number): Dated {
  const iso = new Date(unixSeconds * 1000).toISOString().slice(0, 10);
  const days = Math.max(0, Math.floor((Date.now() - unixSeconds * 1000) / 86_400_000));
  return { iso, days };
}

function accountKind(code: string | null): AccountKind {
  if (!code) return "unknown";
  const normalized = code.toLowerCase();
  if (normalized === "0x" || normalized === "0x0") return "eoa";
  if (normalized.startsWith("0xef0100")) return "delegated";
  return "contract";
}

async function rpc(url: string, method: string, params: unknown[]): Promise<unknown | null> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { result?: unknown; error?: unknown };
    if (body.error || body.result === undefined) return null;
    return body.result;
  } catch {
    return null;
  }
}

async function nonceAt(url: string, address: string, block: number | "latest"): Promise<number | null> {
  const tag = block === "latest" ? "latest" : `0x${block.toString(16)}`;
  return hexNumber(await rpc(url, "eth_getTransactionCount", [address, tag]));
}

async function prices(): Promise<Record<string, number>> {
  const ids = [...new Set(CHAINS.map((chain) => chain.priceId))].join(",");
  const payload = await getJson(`https://coins.llama.fi/prices/current/${ids}`);
  const coins =
    payload && typeof payload === "object" && "coins" in payload
      ? (payload as { coins?: Record<string, { price?: number }> }).coins
      : undefined;
  const out: Record<string, number> = {};
  for (const chain of CHAINS) {
    const price = coins?.[chain.priceId]?.price;
    if (typeof price === "number" && Number.isFinite(price)) out[chain.priceId] = price;
  }
  return out;
}

function securityRecord(payload: unknown, address: string): Record<string, string> | null {
  if (!payload || typeof payload !== "object") return null;
  const body = payload as { code?: number | string; result?: unknown };
  if (body.code !== undefined && String(body.code) !== "1") return null;
  if (!body.result || typeof body.result !== "object") return null;
  const result = body.result as Record<string, unknown>;
  const nested = result[address] ?? result[address.toLowerCase()];
  const record = nested && typeof nested === "object" ? (nested as Record<string, unknown>) : result;
  const entries = Object.entries(record).filter(([, value]) => ["string", "number"].includes(typeof value));
  if (entries.length === 0) return null;
  return Object.fromEntries(entries.map(([key, value]) => [key, String(value)]));
}

async function readSecurity(chain: Chain, address: string): Promise<{ ok: boolean; flags: string[] }> {
  const url = `https://api.gopluslabs.io/api/v1/address_security/${address}?chain_id=${chain.id}`;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const record = securityRecord(await getJson(url), address);
    if (record) {
      const flags = Object.entries(FLAG_LABELS)
        .filter(([key]) => record[key] === "1")
        .map(([, label]) => label);
      const created = Number(record.number_of_malicious_contracts_created ?? "0");
      if (Number.isFinite(created) && created > 0) flags.push("Created malicious contracts");
      return { ok: true, flags };
    }
    await sleep(400);
  }
  return { ok: false, flags: [] };
}

async function readAccount(chain: Chain, address: string): Promise<{
  balance: number | null;
  outgoing: number | null;
  account: AccountKind;
}> {
  for (const url of chain.rpc) {
    const [balance, nonce, code] = await Promise.all([
      rpc(url, "eth_getBalance", [address, "latest"]),
      rpc(url, "eth_getTransactionCount", [address, "latest"]),
      rpc(url, "eth_getCode", [address, "latest"]),
    ]);
    if (typeof balance === "string" || typeof nonce === "string" || typeof code === "string") {
      return {
        balance: typeof balance === "string" ? hexUnits(balance, 18) : null,
        outgoing: hexNumber(nonce),
        account: accountKind(typeof code === "string" ? code : null),
      };
    }
  }
  return { balance: null, outgoing: null, account: "unknown" };
}

async function firstOutgoing(chain: Chain, address: string): Promise<Dated | null> {
  for (const url of chain.archive) {
    try {
      const head = hexNumber(await rpc(url, "eth_blockNumber", []));
      const now = await nonceAt(url, address, "latest");
      if (head === null || now === null || now === 0) continue;
      const mid = await nonceAt(url, address, Math.floor(head / 2));
      if (mid === null) continue;
      let low = 1;
      let high = head;
      for (let step = 0; step < 30 && low < high; step += 1) {
        const point = Math.floor((low + high) / 2);
        const nonce = await nonceAt(url, address, point);
        if (nonce === null) throw new Error("archive gap");
        if (nonce === 0) low = point + 1;
        else high = point;
      }
      const block = await rpc(url, "eth_getBlockByNumber", [`0x${low.toString(16)}`, false]);
      const timestamp =
        block && typeof block === "object" ? hexNumber((block as { timestamp?: unknown }).timestamp) : null;
      if (timestamp && timestamp > 0) return isoDays(timestamp);
    } catch {
      continue;
    }
  }
  return null;
}

function historyFromLists(
  first: { ok: boolean; rows: Record<string, string>[] },
  recent: { ok: boolean; rows: Record<string, string>[] },
  tokens: { ok: boolean; rows: Record<string, string>[] }
): History {
  const stamp = Number(first.rows[0]?.timeStamp ?? "");
  return {
    ok: first.ok || recent.ok,
    transactions: null,
    tokenTransfers: null,
    firstSeen: first.ok && Number.isFinite(stamp) && stamp > 0 ? isoDays(stamp) : null,
    recent: recent.ok ? (recent.rows as NormalTx[]) : null,
    tokens: tokens.ok ? (tokens.rows as TokenTx[]) : null,
  };
}

async function historyEtherscan(chain: Chain, address: string, apiKey: string): Promise<History> {
  const endpoint = "https://api.etherscan.io/v2/api";
  const load = (action: "txlist" | "tokentx", offset: number, sort: "asc" | "desc") =>
    etherscanQueue(() => getJson(`${listUrl(endpoint, action, address, offset, sort)}&chainid=${chain.id}&apikey=${apiKey}`));
  const [first, recent, tokens] = await Promise.all([
    load("txlist", 1, "asc").then(explorerRows),
    load("txlist", SAMPLE, "desc").then(explorerRows),
    load("tokentx", SAMPLE, "desc").then(explorerRows),
  ]);
  return historyFromLists(first, recent, tokens);
}

async function historyEthereum(address: string): Promise<History> {
  const endpoint = "https://api.routescan.io/v2/network/mainnet/evm/1/etherscan/api";
  const profile = await routescanQueue(() =>
    getJson(`https://api.routescan.io/v2/network/mainnet/evm/1/addresses/${encodeURIComponent(address)}`)
  );
  const [first, recent, tokens] = await Promise.all([
    routescanQueue(() => getJson(listUrl(endpoint, "txlist", address, 1, "asc"))).then(explorerRows),
    routescanQueue(() => getJson(listUrl(endpoint, "txlist", address, SAMPLE, "desc"))).then(explorerRows),
    routescanQueue(() => getJson(listUrl(endpoint, "tokentx", address, SAMPLE, "desc"))).then(explorerRows),
  ]);
  const history = historyFromLists(first, recent, tokens);
  const info =
    profile && typeof profile === "object"
      ? (profile as { transactionsCount?: number; erc20TransfersCount?: number })
      : {};
  history.transactions = typeof info.transactionsCount === "number" ? info.transactionsCount : null;
  history.tokenTransfers = typeof info.erc20TransfersCount === "number" ? info.erc20TransfersCount : null;
  history.ok = history.ok || history.transactions !== null;
  return history;
}

async function historyBlockscout(origin: string, address: string): Promise<History> {
  const endpoint = `${origin}/api`;
  const counters = await blockscoutQueue(() => getJson(`${origin}/api/v2/addresses/${address}/counters`));
  const [first, recent, tokens] = await Promise.all([
    blockscoutQueue(() => getJson(listUrl(endpoint, "txlist", address, 1, "asc"))).then(explorerRows),
    blockscoutQueue(() => getJson(listUrl(endpoint, "txlist", address, SAMPLE, "desc"))).then(explorerRows),
    blockscoutQueue(() => getJson(listUrl(endpoint, "tokentx", address, SAMPLE, "desc"))).then(explorerRows),
  ]);
  const history = historyFromLists(first, recent, tokens);
  const info =
    counters && typeof counters === "object"
      ? (counters as { transactions_count?: string; token_transfers_count?: string })
      : {};
  history.transactions = countField(info.transactions_count);
  history.tokenTransfers = countField(info.token_transfers_count);
  history.ok = history.ok || history.transactions !== null;
  return history;
}

async function readHistory(chain: Chain, address: string): Promise<History> {
  const apiKey = process.env.ETHERSCAN_API_KEY?.trim();
  if (apiKey) {
    const scanned = await historyEtherscan(chain, address, apiKey);
    if (scanned.ok) {
      if (chain.history === "routescan") {
        const indexed = await historyEthereum(address);
        scanned.transactions = indexed.transactions;
        scanned.tokenTransfers = indexed.tokenTransfers;
      } else if (chain.history === "blockscout" && chain.blockscout) {
        const counters = await blockscoutQueue(() =>
          getJson(`${chain.blockscout}/api/v2/addresses/${address}/counters`)
        );
        const info =
          counters && typeof counters === "object"
            ? (counters as { transactions_count?: string; token_transfers_count?: string })
            : {};
        const transactions = countField(info.transactions_count);
        const tokenTransfers = countField(info.token_transfers_count);
        if (transactions !== null) scanned.transactions = transactions;
        if (tokenTransfers !== null) scanned.tokenTransfers = tokenTransfers;
      }
      return scanned;
    }
  }
  if (chain.history === "routescan") return historyEthereum(address);
  if (chain.history === "blockscout" && chain.blockscout) return historyBlockscout(chain.blockscout, address);
  return EMPTY_HISTORY;
}

function dexVolume(
  chain: Chain,
  address: string,
  normal: NormalTx[],
  tokens: TokenTx[],
  nativePrice: number
): { swaps: number; usd: number } {
  const wallet = address.toLowerCase();
  const routers = new Set(chain.routers);
  const swapHashes = new Set<string>();
  let nativeUsd = 0;

  for (const tx of normal) {
    if (tx.isError === "1") continue;
    const to = (tx.to ?? "").toLowerCase();
    if (!routers.has(to) || !tx.hash) continue;
    swapHashes.add(tx.hash.toLowerCase());
    if ((tx.from ?? "").toLowerCase() === wallet) nativeUsd += decimalUnits(tx.value, 18) * nativePrice;
  }

  const stables = new Map(chain.stables.map((token) => [token.address, token.decimals]));
  const byHash = new Map<string, TokenTx[]>();
  for (const transfer of tokens) {
    const hash = (transfer.hash ?? "").toLowerCase();
    if (!swapHashes.has(hash)) continue;
    const group = byHash.get(hash) ?? [];
    group.push(transfer);
    byHash.set(hash, group);
  }

  let tokenUsd = 0;
  for (const group of byHash.values()) {
    let sent = 0;
    let received = 0;
    for (const transfer of group) {
      const contract = (transfer.contractAddress ?? "").toLowerCase();
      const listed = stables.get(contract);
      const decimals = listed ?? (contract === chain.wrapped ? 18 : null);
      if (decimals === null) continue;
      const amount = decimalUnits(transfer.value, decimals);
      const usd = listed === undefined ? amount * nativePrice : amount;
      if ((transfer.from ?? "").toLowerCase() === wallet) sent += usd;
      if ((transfer.to ?? "").toLowerCase() === wallet) received += usd;
    }
    tokenUsd += Math.max(sent, received);
  }

  return { swaps: swapHashes.size, usd: nativeUsd + tokenUsd };
}

async function scanChain(chain: Chain, address: string, priceMap: Record<string, number>): Promise<ChainReport> {
  const [security, account, history] = await Promise.all([
    readSecurity(chain, address),
    readAccount(chain, address),
    readHistory(chain, address),
  ]);

  let firstSeen = history.firstSeen;
  let ageSource: AgeSource | null = firstSeen ? "transaction" : null;
  if (!firstSeen && account.outgoing && account.outgoing > 0) {
    const outgoing = await firstOutgoing(chain, address);
    if (outgoing) {
      firstSeen = outgoing;
      ageSource = "outgoing";
    }
  }

  const nativePrice = priceMap[chain.priceId] ?? 0;
  const dex =
    history.recent === null
      ? { swaps: null, usd: null }
      : dexVolume(chain, address, history.recent, history.tokens ?? [], nativePrice);

  const notes: string[] = [];
  if (!security.ok) notes.push("Scam labels were not available.");
  if (!history.ok && ageSource === "outgoing") {
    notes.push("Transaction history was not available. Age is the first outgoing transaction, and DEX volume is not included.");
  } else if (!history.ok && account.outgoing === 0) {
    notes.push("No outgoing transactions. Transaction history was not available, so DEX volume is not included.");
  } else if (!history.ok) {
    notes.push("Transaction history was not available, so age and DEX volume are not included.");
  } else if (dex.swaps && history.tokens === null) {
    notes.push("Token amounts for the sampled swaps were not available.");
  }

  return {
    chain: chain.key,
    label: chain.label,
    transactions: history.transactions,
    tokenTransfers: history.tokenTransfers,
    outgoing: account.outgoing,
    nativeSymbol: chain.native,
    nativeBalance: account.balance,
    nativeUsd: account.balance === null || nativePrice === 0 ? null : account.balance * nativePrice,
    firstSeen: firstSeen?.iso ?? null,
    ageDays: firstSeen?.days ?? null,
    ageSource,
    dexSwapCount: dex.swaps,
    dexVolumeUsd: dex.usd,
    flags: security.flags,
    securityChecked: security.ok,
    account: account.account,
    note: notes.length > 0 ? notes.join(" ") : undefined,
  };
}

export async function scanWallet(address: string): Promise<ScanResult> {
  const priceMap = await prices();
  const chains = await Promise.all(CHAINS.map((chain) => scanChain(chain, address, priceMap)));
  const flags: RiskFlag[] = chains.flatMap((chain) => chain.flags.map((label) => ({ chain: chain.label, label })));
  const dated = chains.filter(
    (chain): chain is ChainReport & { firstSeen: string; ageDays: number; ageSource: AgeSource } =>
      chain.firstSeen !== null && chain.ageDays !== null && chain.ageSource !== null
  );
  dated.sort((left, right) => right.ageDays - left.ageDays);
  const indexed = chains.filter((chain) => chain.transactions !== null);
  const sampled = chains.filter((chain) => chain.dexVolumeUsd !== null);

  return {
    address,
    scannedAt: new Date().toISOString(),
    risk: flags.length > 0 ? "flagged" : chains.every((chain) => chain.securityChecked) ? "clear" : "unknown",
    flags,
    oldest: dated[0]
      ? { chain: dated[0].label, firstSeen: dated[0].firstSeen, ageDays: dated[0].ageDays, source: dated[0].ageSource }
      : null,
    transactions: indexed.length > 0 ? indexed.reduce((sum, chain) => sum + (chain.transactions ?? 0), 0) : null,
    dexVolumeUsd: sampled.length > 0 ? sampled.reduce((sum, chain) => sum + (chain.dexVolumeUsd ?? 0), 0) : null,
    dexSwapCount: sampled.length > 0 ? sampled.reduce((sum, chain) => sum + (chain.dexSwapCount ?? 0), 0) : null,
    chains,
    sampleNote: SAMPLE_NOTE,
  };
}
