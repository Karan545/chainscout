export type RiskFlag = {
  chain: string;
  label: string;
};

export type AccountKind = "eoa" | "delegated" | "contract" | "unknown";

export type AgeSource = "transaction" | "outgoing";

export type ChainReport = {
  chain: string;
  label: string;
  transactions: number | null;
  tokenTransfers: number | null;
  outgoing: number | null;
  nativeSymbol: string;
  nativeBalance: number | null;
  nativeUsd: number | null;
  firstSeen: string | null;
  ageDays: number | null;
  ageSource: AgeSource | null;
  dexSwapCount: number | null;
  dexVolumeUsd: number | null;
  flags: string[];
  securityChecked: boolean;
  account: AccountKind;
  note?: string;
};

export type ScanResult = {
  address: string;
  scannedAt: string;
  risk: "clear" | "flagged" | "unknown";
  flags: RiskFlag[];
  oldest: { chain: string; firstSeen: string; ageDays: number; source: AgeSource } | null;
  transactions: number | null;
  dexVolumeUsd: number | null;
  dexSwapCount: number | null;
  chains: ChainReport[];
  sampleNote: string;
};

export type ReportResponse = ScanResult & {
  narrative: "written" | "scan";
  report: string;
};
