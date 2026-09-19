const MONATE = ["Jan.", "Feb.", "März", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sep.", "Okt.", "Nov.", "Dez."];
const WOCHENTAGE = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

export function toIsoDay(value: string): string {
  return value.slice(0, 10);
}

export function startOfTodayIso(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}T00:00:00.000Z`;
}

function parts(iso: string) {
  const day = toIsoDay(iso);
  const date = new Date(`${day}T12:00:00.000Z`);
  return {
    tag: String(date.getUTCDate()).padStart(2, "0"),
    monat: MONATE[date.getUTCMonth()],
    wochentag: WOCHENTAGE[date.getUTCDay()],
  };
}

export function formatTerminDatum(datum: string, datumEnde?: string | null) {
  const start = parts(datum);
  if (datumEnde && toIsoDay(datumEnde) !== toIsoDay(datum)) {
    const ende = parts(datumEnde);
    return {
      datum: `${start.tag}./${ende.tag}. ${ende.monat}`,
      tag: `${start.wochentag}/${ende.wochentag}`,
    };
  }
  return { datum: `${Number(start.tag)}. ${start.monat}`, tag: start.wochentag };
}
