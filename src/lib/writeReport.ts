import https from "node:https";
import { formatAge, formatUsd } from "@/lib/format";
import type { ScanResult } from "@/lib/types";

const HOST = "agentrouter.org";
const PRIMARY = ["gpt-6-astra", "claude-opus-5", "claude-opus-4-8"];
const LAST_RESORT = "deepseek-v4-flash";
const ANTHROPIC = new Set(["claude-opus-5", "claude-opus-4-8", "deepseek-v4-flash"]);
const MODEL_BUDGET_MS = 24_000;

type Upstream = { status: number; text: string };

function joinLabels(labels: string[]): string {
  if (labels.length <= 1) return labels[0] ?? "";
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")}, and ${labels[labels.length - 1]}`;
}

export function scanSummary(scan: ScanResult): string {
  const risk =
    scan.risk === "flagged"
      ? `Security labels were found: ${scan.flags.map((flag) => `${flag.label} on ${flag.chain}`).join(", ")}.`
      : scan.risk === "clear"
        ? "No phishing, theft, sanctions, mixer, or other scam labels were returned for this address on Ethereum, Base, Arbitrum, Optimism, Polygon, or BNB Chain."
        : "Scam labels could not be checked on every chain. No label was returned by the chains that did answer.";

  const age = scan.oldest
    ? scan.oldest.source === "outgoing"
      ? `The earliest activity found is an outgoing transaction on ${scan.oldest.firstSeen} on ${scan.oldest.chain}, about ${formatAge(scan.oldest.ageDays)} ago. An outgoing date can be later than the first time the address received funds.`
      : `The earliest transaction found is ${scan.oldest.firstSeen} on ${scan.oldest.chain}, about ${formatAge(scan.oldest.ageDays)} ago.`
    : "No first transaction was found on the scanned chains.";

  const indexed = scan.chains.filter((chain) => chain.transactions !== null);
  const activity = indexed.length
    ? `Indexed activity: ${indexed.map((chain) => `${chain.label} ${(chain.transactions ?? 0).toLocaleString("en-US")}`).join(", ")}.`
    : "No chain returned an indexed transaction count.";

  const outgoing = scan.chains.filter((chain) => chain.transactions === null && chain.outgoing !== null);
  const outgoingLine = outgoing.length
    ? `Outgoing transactions where an indexed total was not available: ${outgoing.map((chain) => `${chain.label} ${chain.outgoing}`).join(", ")}.`
    : "";

  const held = scan.chains
    .filter((chain) => chain.nativeUsd !== null && chain.nativeUsd >= 1 && chain.nativeBalance !== null)
    .map((chain) => `${chain.nativeBalance?.toFixed(4)} ${chain.nativeSymbol} on ${chain.label} (${formatUsd(chain.nativeUsd)})`);
  const balances = held.length ? `Native balances worth at least $1: ${held.join("; ")}.` : "";

  const sampled = scan.chains.filter((chain) => chain.dexVolumeUsd !== null);
  const missed = scan.chains.filter((chain) => chain.dexVolumeUsd === null).map((chain) => chain.label);
  const dex = sampled.length
    ? `The recent DEX sample on ${joinLabels(sampled.map((chain) => chain.label))} is ${formatUsd(scan.dexVolumeUsd)} across ${scan.dexSwapCount ?? 0} router swaps.${missed.length ? ` History was not available on ${joinLabels(missed)}, so those chains are not in the sample.` : ""} ${scan.sampleNote}`
    : `No DEX sample was available. ${scan.sampleNote}`;

  return [risk, age, activity, outgoingLine, balances, dex].filter(Boolean).join("\n\n");
}

function promptFor(scan: ScanResult): string {
  return `Write a wallet report for ${scan.address}. Use only the facts below. Do not invent holdings, counterparties, or labels.

Treat null as unknown, never as zero. When ageSource is "outgoing", call that date the first outgoing transaction.

Facts:
${JSON.stringify(scan)}

Use these markdown headings, in order:
## Risk
## Address quality
## DEX activity
## Summary

The summary is two or three sentences. Start the report with the Risk heading.`;
}

function acceptable(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 240) return false;
  const opening = trimmed.slice(0, 280).toLowerCase();
  if (/^(we need|i need|let me|the user|facts:|analysis|thinking|sure|okay|here is my)/.test(opening)) return false;
  if (opening.includes("must use only") || opening.includes("wallet intelligence report")) return false;
  if (/agentrouter|\bsk-[a-z0-9]/i.test(trimmed)) return false;
  if (/gpt-6-astra|claude-opus|deepseek-v4/i.test(trimmed)) return false;
  return /\brisk\b/i.test(trimmed) && /\b(dex|volume)\b/i.test(trimmed);
}

function textFrom(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (!Array.isArray(value)) return "";
  return value
    .map((part) => {
      if (typeof part === "string") return part;
      if (!part || typeof part !== "object") return "";
      const block = part as { type?: string; text?: string };
      if (block.type === "thinking") return "";
      return block.text ?? "";
    })
    .join("\n\n")
    .trim();
}

function extractText(raw: string): string {
  const trimmed = raw.replace(/^\uFEFF/, "").trim();
  if (!trimmed.startsWith("{")) return "";
  try {
    const json = JSON.parse(trimmed) as {
      choices?: { message?: { content?: unknown } }[];
      content?: unknown;
    };
    const content = textFrom(json.choices?.[0]?.message?.content) || textFrom(json.content);
    return acceptable(content) ? content : "";
  } catch {
    return "";
  }
}

function post(path: string, body: string, apiKey: string, anthropic: boolean, timeoutMs: number): Promise<Upstream> {
  return new Promise((resolve, reject) => {
    const headers: Record<string, string> = {
      "content-type": "application/json",
      accept: "application/json",
      authorization: `Bearer ${apiKey}`,
      "user-agent": "opencode/1.18.25",
      "Content-Length": String(Buffer.byteLength(body)),
    };
    if (anthropic) {
      headers["x-api-key"] = apiKey;
      headers["anthropic-version"] = "2023-06-01";
    }
    const req = https.request(
      { hostname: HOST, path, method: "POST", family: 4, headers },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () =>
          resolve({ status: res.statusCode ?? 0, text: Buffer.concat(chunks).toString("utf8") })
        );
      }
    );
    req.setTimeout(timeoutMs, () => req.destroy(new Error("timeout")));
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function ask(model: string, scan: ScanResult, apiKey: string, deadline: number): Promise<"html" | "fail" | string> {
  const wires: Array<"chat" | "messages"> = model.startsWith("claude")
    ? ["messages", "chat"]
    : ANTHROPIC.has(model)
      ? ["chat", "messages"]
      : ["chat"];
  for (const wire of wires) {
    const remaining = deadline - Date.now();
    if (remaining < 2_500) return "fail";
    const path = wire === "chat" ? "/v1/chat/completions" : "/v1/messages";
    const body =
      wire === "chat"
        ? JSON.stringify({
            model,
            temperature: 0.2,
            max_tokens: 900,
            stream: false,
            messages: [
              {
                role: "system",
                content:
                  "You write finished wallet reports from supplied facts. Start with the report. Do not plan, and do not add data that was not provided.",
              },
              { role: "user", content: promptFor(scan) },
            ],
          })
        : JSON.stringify({
            model,
            temperature: 0.2,
            max_tokens: 900,
            stream: false,
            system:
              "You write finished wallet reports from supplied facts. Start with the report. Do not plan, and do not add data that was not provided.",
            messages: [{ role: "user", content: promptFor(scan) }],
          });
    try {
      const upstream = await post(path, body, apiKey, wire === "messages", Math.min(12_000, remaining));
      const start = upstream.text.replace(/^\uFEFF/, "").trimStart();
      if (start.startsWith("<")) return "html";
      if (upstream.status === 401 || upstream.status === 402 || upstream.status === 403) return "fail";
      const text = extractText(upstream.text);
      if (text) return text;
    } catch {
      continue;
    }
  }
  return "fail";
}

export async function writeReport(
  scan: ScanResult,
  apiKey: string
): Promise<{ narrative: "written" | "scan"; report: string }> {
  const fallback = { narrative: "scan" as const, report: scanSummary(scan) };
  if (!apiKey) return fallback;
  const deadline = Date.now() + MODEL_BUDGET_MS;
  for (const model of [...PRIMARY, LAST_RESORT]) {
    if (deadline - Date.now() < 2_500) break;
    const report = await ask(model, scan, apiKey, deadline);
    if (report === "html") return fallback;
    if (report !== "fail") return { narrative: "written", report };
  }
  return fallback;
}
