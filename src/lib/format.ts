export function formatUsd(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "Unavailable";
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}k`;
  return `$${value.toFixed(2)}`;
}

export function formatAge(days: number): string {
  if (days < 1) return "less than a day";
  if (days < 45) return `${days} days`;
  if (days < 500) return `${Math.round(days / 30)} months`;
  const years = days / 365;
  return `${years >= 10 ? Math.round(years) : years.toFixed(1)} years`;
}

export function formatCount(value: number | null): string {
  if (value === null) return "—";
  return value.toLocaleString("en-US");
}
