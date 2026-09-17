"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, List, MapPin, Clock, Tag } from "lucide-react";

type Kategorie = "Training" | "Turnier" | "Sonstiges";

type Event = {
  id: number;
  titel: string;
  datum: string; // YYYY-MM-DD
  uhrzeit?: string;
  ort?: string;
  kategorie: Kategorie;
  beschreibung?: string;
};

const EVENTS: Event[] = [
  {
    id: 1,
    titel: "Frühjahrinstandsetzung",
    datum: "2025-04-12",
    uhrzeit: "10:00",
    ort: "Gahlener Str. 204, Dorsten",
    kategorie: "Sonstiges",
  },
  {
    id: 2,
    titel: "Saisoneröffnung",
    datum: "2025-04-26",
    uhrzeit: "14:00",
    ort: "Gahlener Str. 204, Dorsten",
    kategorie: "Sonstiges",
  },
  {
    id: 3,
    titel: "LK-Turnier LK 20 – 25",
    datum: "2025-06-08",
    ort: "Gahlener Str. 204, Dorsten",
    kategorie: "Turnier",
    beschreibung: "Ganztägig",
  },
  {
    id: 4,
    titel: "1. HTV-Tennis Beer Pong Turnier",
    datum: "2025-07-12",
    uhrzeit: "11:00",
    ort: "Gahlener Str. 204, Dorsten",
    kategorie: "Turnier",
  },
  {
    id: 5,
    titel: "LK-Turnier LK 20 – 25",
    datum: "2025-07-13",
    ort: "Gahlener Str. 204, Dorsten",
    kategorie: "Turnier",
    beschreibung: "Ganztägig",
  },
  {
    id: 6,
    titel: "Stadtmeisterschaften der Senioren",
    datum: "2025-09-01",
    ort: "Gahlener Str. 204, Dorsten",
    kategorie: "Turnier",
    beschreibung: "Mehrtägiges Turnier",
  },
  {
    id: 7,
    titel: "Doppel-/Mixed Stadtmeisterschaften",
    datum: "2025-09-20",
    ort: "TV Feldmark",
    kategorie: "Turnier",
    beschreibung: "Mehrtägiges Turnier",
  },
];

const KATEGORIE_FARBE: Record<Kategorie, string> = {
  Training: "bg-blue-100 text-blue-700",
  Turnier: "bg-[#e1fcad] text-[#122023]",
  Sonstiges: "bg-orange-100 text-orange-700",
};

const KATEGORIE_DOT: Record<Kategorie, string> = {
  Training: "bg-blue-500",
  Turnier: "bg-[#4a7c59]",
  Sonstiges: "bg-orange-400",
};

const WOCHENTAGE = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MONATE = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

function formatDatum(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export default function KalenderClient() {
  const today = new Date();
  const [view, setView] = React.useState<"monat" | "liste">("monat");
  const [year, setYear] = React.useState(today.getFullYear());
  const [month, setMonth] = React.useState(today.getMonth());
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);
  const [filterKat, setFilterKat] = React.useState<Kategorie | "Alle">("Alle");

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  // Calendar grid
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  // Monday-start: (0=Sun→6, 1=Mon→0, ...)
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7;
  const cells: (number | null)[] = Array.from({ length: totalCells }, (_, i) => {
    const day = i - startOffset + 1;
    return day >= 1 && day <= lastDay.getDate() ? day : null;
  });

  const eventsForDay = (day: number) => {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return EVENTS.filter(e => e.datum === key);
  };

  const selectedEvents = selectedDate
    ? EVENTS.filter(e => e.datum === selectedDate)
    : [];

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // List view — alle Termine anzeigen
  const filteredEvents = EVENTS
    .filter(e => filterKat === "Alle" || e.kategorie === filterKat)
    .sort((a, b) => a.datum.localeCompare(b.datum));

  return (
    <section className="bg-[#f9f9f7] px-6 py-16 md:px-12 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-7xl">

        {/* View toggle + filter */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Tab toggle */}
          <div className="flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-white p-1.5 w-fit">
            {([["monat", "Monatsansicht", Calendar], ["liste", "Listenansicht", List]] as const).map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors duration-200 ${
                  view === id ? "bg-[#122023] text-white" : "text-black/50 hover:text-black"
                }`}
              >
                <Icon className="size-3.5" strokeWidth={1.5} />
                {label}
              </button>
            ))}
          </div>

          {/* Kategorie filter (list view) */}
          {view === "liste" && (
            <div className="flex flex-wrap gap-2">
              {(["Alle", "Training", "Turnier", "Sonstiges"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setFilterKat(k)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors duration-200 ${
                    filterKat === k
                      ? "bg-[#122023] text-white"
                      : "border border-black/[0.08] bg-white text-black/50 hover:text-black"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {/* ── Monatsansicht ── */}
          {view === "monat" && (
            <motion.div
              key="monat"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 gap-6 lg:grid-cols-3"
            >
              {/* Calendar */}
              <div className="lg:col-span-2">
                <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
                  {/* Month nav */}
                  <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-4">
                    <button
                      onClick={prevMonth}
                      className="flex size-9 items-center justify-center rounded-full bg-[#f9f9f7] text-black/50 transition-colors hover:bg-[#e1fcad] hover:text-black"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <h2 className="font-kanturmuy text-xl font-normal tracking-tight">
                      {MONATE[month]} {year}
                    </h2>
                    <button
                      onClick={nextMonth}
                      className="flex size-9 items-center justify-center rounded-full bg-[#f9f9f7] text-black/50 transition-colors hover:bg-[#e1fcad] hover:text-black"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>

                  {/* Weekday headers */}
                  <div className="grid grid-cols-7 border-b border-black/[0.06]">
                    {WOCHENTAGE.map((d) => (
                      <div key={d} className="py-2.5 text-center text-xs font-medium uppercase tracking-widest text-black/30">
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Days */}
                  <div className="grid grid-cols-7">
                    {cells.map((day, i) => {
                      if (!day) return (
                        <div key={`empty-${i}`} className="h-16 border-b border-r border-black/[0.04] bg-black/[0.01] last:border-r-0" />
                      );
                      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                      const dayEvents = eventsForDay(day);
                      const isToday = dateStr === todayStr;
                      const isSelected = dateStr === selectedDate;
                      return (
                        <button
                          key={day}
                          onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                          className={`relative flex h-16 flex-col items-start gap-1 border-b border-r border-black/[0.04] p-1.5 text-left transition-colors duration-150 last:border-r-0 hover:bg-[#e1fcad]/20 ${
                            isSelected ? "bg-[#e1fcad]/40" : ""
                          } ${(i + 1) % 7 === 0 ? "border-r-0" : ""}`}
                        >
                          <span className={`flex size-6 items-center justify-center rounded-full text-xs font-medium ${
                            isToday
                              ? "bg-[#122023] text-white"
                              : isSelected
                              ? "bg-[#e1fcad] text-black"
                              : "text-black/60"
                          }`}>
                            {day}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {dayEvents.slice(0, 3).map((e) => (
                              <span
                                key={e.id}
                                className={`h-2.5 w-2.5 rounded-full ${KATEGORIE_DOT[e.kategorie]}`}
                              />
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Legend */}
                <div className="mt-4 flex flex-wrap gap-4">
                  {(["Training", "Turnier", "Sonstiges"] as Kategorie[]).map((k) => (
                    <div key={k} className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${KATEGORIE_DOT[k]}`} />
                      <span className="text-xs text-black/40">{k}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar: selected day or upcoming */}
              <div className="flex flex-col gap-4">
                {selectedDate ? (
                  <>
                    <div className="mb-1">
                      <p className="text-xs uppercase tracking-widest text-black/40">Ausgewählter Tag</p>
                      <p className="font-kanturmuy mt-1 text-lg font-normal tracking-tight text-black">
                        {formatDatum(selectedDate)}
                      </p>
                    </div>
                    {selectedEvents.length === 0 ? (
                      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/[0.1] bg-white py-12 text-center">
                        <Calendar className="mb-3 size-8 text-black/20" strokeWidth={1} />
                        <p className="text-sm text-black/40">Keine Termine an diesem Tag</p>
                      </div>
                    ) : (
                      selectedEvents.map((e) => <EventCard key={e.id} event={e} />)
                    )}
                  </>
                ) : (
                  <>
                    <div className="mb-1">
                      <p className="text-xs uppercase tracking-widest text-black/40">Nächste Termine</p>
                    </div>
                    {EVENTS.filter(e => e.datum >= todayStr)
                      .sort((a, b) => a.datum.localeCompare(b.datum))
                      .slice(0, 4)
                      .map((e) => <EventCard key={e.id} event={e} />)
                    }
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* ── Listenansicht ── */}
          {view === "liste" && (
            <motion.div
              key="liste"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {filteredEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/[0.1] bg-white py-24 text-center">
                  <Calendar className="mb-4 size-10 text-black/20" strokeWidth={1} />
                  <p className="text-base text-black/40">Keine Termine gefunden</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredEvents.map((e, i) => {
                    const prevEvent = filteredEvents[i - 1];
                    const showMonthHeader = !prevEvent || prevEvent.datum.slice(0, 7) !== e.datum.slice(0, 7);
                    const [, m] = e.datum.split("-");
                    return (
                      <React.Fragment key={e.id}>
                        {showMonthHeader && (
                          <div className="flex items-center gap-3 pt-4 first:pt-0">
                            <span className="font-kanturmuy text-lg font-normal tracking-tight text-black/40">
                              {MONATE[parseInt(m) - 1]}
                            </span>
                            <span className="h-px flex-1 bg-black/[0.06]" />
                          </div>
                        )}
                        <EventListRow event={e} />
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function EventCard({ event }: { event: Event }) {
  const [, m, d] = event.datum.split("-");
  return (
    <div className="group overflow-hidden rounded-2xl border border-black/[0.06] bg-white transition-shadow duration-300 hover:shadow-md">
      <div className="flex gap-4 p-4">
        <div className="flex flex-col items-center justify-center rounded-xl bg-[#f9f9f7] px-3 py-2 text-center shrink-0">
          <span className="text-xs font-medium uppercase tracking-widest text-black/40">
            {["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"][parseInt(m) - 1]}
          </span>
          <span className="font-kanturmuy text-2xl font-normal text-black leading-tight">{parseInt(d)}</span>
        </div>
        <div className="min-w-0">
          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${KATEGORIE_FARBE[event.kategorie]}`}>
            {event.kategorie}
          </span>
          <p className="mt-1 font-kanturmuy text-base font-normal tracking-tight text-black leading-snug">
            {event.titel}
          </p>
          {event.uhrzeit && (
            <p className="mt-1 flex items-center gap-1 text-xs text-black/40">
              <Clock className="size-3" strokeWidth={1.5} />
              {event.uhrzeit} Uhr
            </p>
          )}
          {event.ort && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-black/40">
              <MapPin className="size-3" strokeWidth={1.5} />
              {event.ort}
            </p>
          )}
        </div>
      </div>
      <div className="h-[2px] w-0 bg-[#e1fcad] transition-all duration-500 ease-out group-hover:w-full" />
    </div>
  );
}

function EventListRow({ event }: { event: Event }) {
  const [, m, d] = event.datum.split("-");
  return (
    <div className="group relative flex items-start gap-4 overflow-hidden rounded-2xl border border-black/[0.06] bg-white p-5 transition-shadow duration-300 hover:shadow-md">
      <div className="flex flex-col items-center justify-center rounded-xl bg-[#f9f9f7] px-3 py-2 text-center shrink-0 w-14">
        <span className="text-xs font-medium uppercase tracking-widest text-black/40">
          {["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"][parseInt(m) - 1]}
        </span>
        <span className="font-kanturmuy text-2xl font-normal text-black leading-tight">{parseInt(d)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-kanturmuy text-lg font-normal tracking-tight text-black">
            {event.titel}
          </h3>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${KATEGORIE_FARBE[event.kategorie]}`}>
            {event.kategorie}
          </span>
        </div>
        {event.beschreibung && (
          <p className="mt-1 text-sm font-light text-black/55">{event.beschreibung}</p>
        )}
        <div className="mt-2 flex flex-wrap gap-4">
          {event.uhrzeit && (
            <span className="flex items-center gap-1.5 text-xs text-black/40">
              <Clock className="size-3" strokeWidth={1.5} />
              {event.uhrzeit} Uhr
            </span>
          )}
          {event.ort && (
            <span className="flex items-center gap-1.5 text-xs text-black/40">
              <MapPin className="size-3" strokeWidth={1.5} />
              {event.ort}
            </span>
          )}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#e1fcad] transition-all duration-500 ease-out group-hover:w-full" />
    </div>
  );
}
