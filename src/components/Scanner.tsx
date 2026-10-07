"use client";

import { useState } from "react";
import { formatAge, formatCount, formatUsd } from "@/lib/format";
import type { AccountKind, ReportResponse } from "@/lib/types";

const EXAMPLE = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";

function linesOf(report: string): { kind: "h" | "p" | "li"; text: string }[] {
  return report
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      if (line.startsWith("### ")) return { kind: "h" as const, text: line.slice(4) };
      if (line.startsWith("## ")) return { kind: "h" as const, text: line.slice(3) };
      if (line.startsWith("# ")) return { kind: "h" as const, text: line.slice(2) };
      if (line.startsWith("- ")) return { kind: "li" as const, text: line.slice(2).replace(/\*\*/g, "") };
      return { kind: "p" as const, text: line.replace(/\*\*/g, "") };
    });
}

export function Scanner() {
  const [address, setAddress] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<ReportResponse | null>(null);

  async function scan(target: string) {
    const value = target.trim();
    setAddress(value);
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ address: value }),
      });
      const payload = (await response.json()) as ReportResponse & { error?: string };
      if (!response.ok) {
        setReport(null);
        setError(payload.error || "The scan did not finish.");
        return;
      }
      setReport(payload);
    } catch {
      setReport(null);
      setError("The scan did not finish. Check the connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main>
      <header className="top">
        <div className="brand">
          <span className="mark">C</span>
          <div>
            <strong>ChainScout</strong>
            <p>Wallet intelligence</p>
          </div>
        </div>
      </header>

      <section className="hero">
        <h1>Scan a wallet before you trust it.</h1>
        <p className="lede">
          ChainScout checks scam labels, how old the address is, and how much volume its recent trades
          generated on major decentralized exchanges.
        </p>
        <form
          className="scan"
          onSubmit={(event) => {
            event.preventDefault();
            void scan(address);
          }}
        >
          <label htmlFor="address">Wallet address</label>
          <div className="row">
            <input
              id="address"
              value={address}
              autoComplete="off"
              spellCheck={false}
              placeholder="0x…"
              onChange={(event) => setAddress(event.target.value)}
            />
            <button type="submit" disabled={pending || address.trim().length === 0}>
              {pending ? "Scanning" : "Scan"}
            </button>
          </div>
          <button type="button" className="example" onClick={() => void scan(EXAMPLE)} disabled={pending}>
            Try a known address
          </button>
        </form>
        <p className="fine">
          Scam labels come from a public address library. Age and balances are read from the chains. DEX volume
          is a sample of the latest 100 transactions against major routers, not lifetime volume on every venue.
        </p>
        {error ? <p className="error">{error}</p> : null}
        {pending ? (
          <p className="pending">Checking scam labels, first activity, and recent DEX trades.</p>
        ) : null}
      </section>

      {report ? <ReportView report={report} /> : null}
    </main>
  );
}

function accountLabel(account: AccountKind): string | null {
  if (account === "contract") return "Contract";
  if (account === "delegated") return "Delegated";
  return null;
}

function ReportView({ report }: { report: ReportResponse }) {
  const prose = linesOf(report.report);
  return (
    <section className="result">
      <div className="result-head">
        <div>
          <p className="kicker">Report</p>
          <h2 className="address">{report.address}</h2>
        </div>
        <span className={report.risk === "flagged" ? "pill bad" : report.risk === "unknown" ? "pill warn" : "pill ok"}>
          {report.risk === "flagged" ? "Flagged" : report.risk === "unknown" ? "Labels incomplete" : "No scam labels"}
        </span>
      </div>

      <div className="stats">
        <article>
          <p>First seen</p>
          <strong>{report.oldest ? formatAge(report.oldest.ageDays) : "Unknown"}</strong>
          <span>
            {report.oldest
              ? `${report.oldest.firstSeen} on ${report.oldest.chain}${report.oldest.source === "outgoing" ? " · first outgoing" : ""}`
              : "No transaction found"}
          </span>
        </article>
        <article>
          <p>Indexed activity</p>
          <strong>{formatCount(report.transactions)}</strong>
          <span>Transactions on chains that publish a count</span>
        </article>
        <article>
          <p>Recent DEX volume</p>
          <strong>{formatUsd(report.dexVolumeUsd)}</strong>
          <span>
            {report.dexSwapCount === null ? "Sample unavailable" : `${report.dexSwapCount} router swaps in the sample`}
          </span>
        </article>
      </div>

      {report.flags.length > 0 ? (
        <ul className="flags">
          {report.flags.map((flag) => (
            <li key={`${flag.chain}-${flag.label}`}>
              {flag.label}
              <span>{flag.chain}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Chain</th>
              <th>Age</th>
              <th>Transactions</th>
              <th>DEX sample</th>
              <th>Labels</th>
            </tr>
          </thead>
          <tbody>
            {report.chains.map((chain) => (
              <tr key={chain.chain}>
                <td>
                  {chain.label}
                  {accountLabel(chain.account) ? <em>{accountLabel(chain.account)}</em> : null}
                </td>
                <td>
                  {chain.ageDays === null ? "—" : formatAge(chain.ageDays)}
                  {chain.ageSource === "outgoing" ? <small>First outgoing</small> : null}
                </td>
                <td>
                  {chain.transactions !== null
                    ? formatCount(chain.transactions)
                    : chain.outgoing !== null
                      ? `${formatCount(chain.outgoing)} outgoing`
                      : "—"}
                </td>
                <td>
                  {chain.dexVolumeUsd === null ? "Unavailable" : formatUsd(chain.dexVolumeUsd)}
                  {chain.dexSwapCount === null ? null : <small>{chain.dexSwapCount} swaps</small>}
                </td>
                <td>
                  {chain.flags.length > 0 ? chain.flags.join(", ") : chain.securityChecked ? "None" : "Unchecked"}
                  {chain.note ? <small>{chain.note}</small> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <article className="prose">
        <p className="kicker">{report.narrative === "written" ? "Written summary" : "Scan summary"}</p>
        {prose.map((line, index) =>
          line.kind === "h" ? (
            <h3 key={index}>{line.text}</h3>
          ) : line.kind === "li" ? (
            <p key={index} className="bullet">
              {line.text}
            </p>
          ) : (
            <p key={index}>{line.text}</p>
          )
        )}
      </article>
      <p className="fine">{report.sampleNote}</p>
    </section>
  );
}
