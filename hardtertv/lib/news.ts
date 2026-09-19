import { toIsoDay } from "./events";

const MONATE_LANG = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

/** Payload speichert reine Datumsfelder um 12:00 UTC — deshalb konsequent UTC lesen. */
export function formatNewsDatum(datum: string): string {
  const date = new Date(`${toIsoDay(datum)}T12:00:00.000Z`);
  return `${date.getUTCDate()}. ${MONATE_LANG[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}
