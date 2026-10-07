import { NextRequest, NextResponse } from "next/server";
import { scanWallet } from "@/lib/scan";
import { writeReport } from "@/lib/writeReport";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const address = String(
    body && typeof body === "object" && "address" in body ? (body as { address?: unknown }).address ?? "" : ""
  )
    .trim()
    .toLowerCase();

  if (!/^0x[0-9a-f]{40}$/.test(address)) {
    return NextResponse.json(
      { error: "Enter a wallet address: 0x followed by 40 hex characters." },
      { status: 400 }
    );
  }

  try {
    const scan = await scanWallet(address);
    const answered = scan.chains.some(
      (chain) =>
        chain.securityChecked ||
        chain.nativeBalance !== null ||
        chain.outgoing !== null ||
        chain.transactions !== null ||
        chain.firstSeen !== null
    );
    if (!answered) {
      return NextResponse.json(
        { error: "The chain indexes did not answer. Try the scan again in a moment." },
        { status: 502 }
      );
    }
    const written = await writeReport(scan, process.env.AGENTROUTER_API_KEY ?? "");
    return NextResponse.json({ ...scan, ...written });
  } catch {
    return NextResponse.json(
      { error: "The scan failed before a report was ready. Try again." },
      { status: 500 }
    );
  }
}
