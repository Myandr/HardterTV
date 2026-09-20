"use client";

import { useActionState, useEffect, useState } from "react";
import { MapPin, Phone, Mail, ArrowUpRight } from "lucide-react";
import { BlurTextEffect } from "@/components/ui/blur-text-effect";
import { FadeIn } from "@/components/ui/fade-in";
import { MapsConsentGate } from "@/components/ui/maps-consent-gate";
import { sendeKontaktanfrage, type KontaktResult } from "@/lib/actions/kontakt";
import { KONTAKT_LIMITS } from "@/lib/kontakt-validation";

export type KontaktSectionProps = {
  eyebrow: string;
  headlineTeil1: string;
  headlineTeil2: string;
  intro: string;
  mapsEmbedUrl: string;
  mapsTitel: string;
  erfolgTitel: string;
  erfolgText: string;
  adresse: string;
  telefonLabel: string;
  telefon: string;
  telefonHref: string;
  email: string;
};

export default function KontaktSection({
  eyebrow,
  headlineTeil1,
  headlineTeil2,
  intro,
  mapsEmbedUrl,
  mapsTitel,
  erfolgTitel,
  erfolgText,
  adresse,
  telefonLabel,
  telefon,
  telefonHref,
  email,
}: KontaktSectionProps) {
  const [result, formAction, pending] = useActionState<KontaktResult | null, FormData>(
    sendeKontaktanfrage,
    null,
  );
  const sent = result?.ok === true;
  const fieldErrors = result && !result.ok ? (result.fieldErrors ?? {}) : {};
  const generalError = result && !result.ok ? result.error : null;

  // Nach einem Fehler setzt React 19 das Formular zurück: Eingaben werden deshalb
  // aus dem Action-Ergebnis als defaultValue zurückgespiegelt.
  const values = result && !result.ok ? result.values : null;

  // Kontrolliertes Feld: der Formular-Reset kann den Zeitstempel nicht leeren.
  const [gestartetAm, setGestartetAm] = useState("");
  useEffect(() => {
    setGestartetAm(String(Date.now()));
  }, []);

  const kontaktInfo = [
    { icon: MapPin, label: "Adresse", wert: adresse, href: undefined as string | undefined },
    { icon: Phone, label: telefonLabel, wert: telefon, href: telefonHref },
    { icon: Mail, label: "E-Mail", wert: email, href: `mailto:${email}` },
  ];

  return (
    <section id="contact" className="bg-[#f9f9f7] px-6 py-20 md:px-12 lg:px-20 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <FadeIn>
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-black/30" />
            <span className="text-xs uppercase tracking-[0.2em] text-black/50">
              {eyebrow}
            </span>
          </div>

          <h2 className="font-kanturmuy max-w-xl text-3xl font-normal tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
            <BlurTextEffect>{`${headlineTeil1} `}</BlurTextEffect>
            <span className="relative inline-block">
              <BlurTextEffect>{headlineTeil2}</BlurTextEffect>
              <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
            </span>
          </h2>

          <p className="mt-4 max-w-md text-base font-light text-black/50">
            {intro}
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              {kontaktInfo.map(({ icon: Icon, label, wert, href }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#e1fcad]">
                    <Icon className="size-4 text-black" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-black/35">{label}</p>
                    {href ? (
                      <a href={href} className="mt-0.5 whitespace-pre-line text-sm text-black/70 transition-colors hover:text-black">
                        {wert}
                      </a>
                    ) : (
                      <p className="mt-0.5 whitespace-pre-line text-sm text-black/70">{wert}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-black/[0.06] bg-white p-6">
              {sent ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <div className="flex size-12 items-center justify-center rounded-full bg-[#e1fcad]">
                    <ArrowUpRight className="size-5 text-black" strokeWidth={2} />
                  </div>
                  <p className="font-kanturmuy text-xl tracking-tight text-black">{erfolgTitel}</p>
                  <p className="text-sm text-black/50">{erfolgText}</p>
                </div>
              ) : (
                <form action={formAction} className="flex flex-col gap-4">
                  <input type="hidden" name="gestartetAm" value={gestartetAm} readOnly />
                  <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                    <label htmlFor="htv_hinweis">Dieses Feld bitte leer lassen</label>
                    <input type="text" id="htv_hinweis" name="htv_hinweis" tabIndex={-1} autoComplete="off" />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="kontakt-name" className="text-xs uppercase tracking-widest text-black/40">Name</label>
                      <input
                        type="text"
                        id="kontakt-name"
                        name="name"
                        required
                        maxLength={KONTAKT_LIMITS.nameMax}
                        defaultValue={values?.name ?? ""}
                        aria-invalid={fieldErrors.name ? true : undefined}
                        aria-describedby={fieldErrors.name ? "kontakt-name-fehler" : undefined}
                        className="rounded-xl border border-black/10 bg-black/[0.02] px-4 py-3 text-sm text-black placeholder-black/30 outline-none transition-colors focus:border-black/30 focus:bg-white"
                        placeholder="Dein Name"
                      />
                      {fieldErrors.name && (
                        <p id="kontakt-name-fehler" className="text-xs text-red-600">{fieldErrors.name}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="kontakt-email" className="text-xs uppercase tracking-widest text-black/40">E-Mail</label>
                      <input
                        type="email"
                        id="kontakt-email"
                        name="email"
                        required
                        maxLength={KONTAKT_LIMITS.emailMax}
                        defaultValue={values?.email ?? ""}
                        aria-invalid={fieldErrors.email ? true : undefined}
                        aria-describedby={fieldErrors.email ? "kontakt-email-fehler" : undefined}
                        className="rounded-xl border border-black/10 bg-black/[0.02] px-4 py-3 text-sm text-black placeholder-black/30 outline-none transition-colors focus:border-black/30 focus:bg-white"
                        placeholder="deine@email.de"
                      />
                      {fieldErrors.email && (
                        <p id="kontakt-email-fehler" className="text-xs text-red-600">{fieldErrors.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="kontakt-nachricht" className="text-xs uppercase tracking-widest text-black/40">Nachricht</label>
                    <textarea
                      id="kontakt-nachricht"
                      name="message"
                      required
                      maxLength={KONTAKT_LIMITS.nachrichtMax}
                      defaultValue={values?.nachricht ?? ""}
                      aria-invalid={fieldErrors.nachricht ? true : undefined}
                      aria-describedby={fieldErrors.nachricht ? "kontakt-nachricht-fehler" : undefined}
                      rows={4}
                      className="resize-none rounded-xl border border-black/10 bg-black/[0.02] px-4 py-3 text-sm text-black placeholder-black/30 outline-none transition-colors focus:border-black/30 focus:bg-white"
                      placeholder="Deine Nachricht an den HTV..."
                    />
                    {fieldErrors.nachricht && (
                      <p id="kontakt-nachricht-fehler" className="text-xs text-red-600">{fieldErrors.nachricht}</p>
                    )}
                  </div>
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      id="datenschutz"
                      name="datenschutz"
                      required
                      defaultChecked={values?.datenschutz ?? false}
                      aria-invalid={fieldErrors.datenschutz ? true : undefined}
                      aria-describedby={fieldErrors.datenschutz ? "kontakt-datenschutz-fehler" : undefined}
                      className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[#122023]"
                    />
                    <label htmlFor="datenschutz" className="text-xs leading-relaxed text-black/50">
                      Ich habe die{" "}
                      <a href="/datenschutz" className="text-black underline underline-offset-2 hover:text-black/70">
                        Datenschutzerklärung
                      </a>{" "}
                      gelesen und stimme der Verarbeitung meiner Daten zur Bearbeitung meiner Anfrage zu.
                    </label>
                  </div>
                  {fieldErrors.datenschutz && (
                    <p id="kontakt-datenschutz-fehler" className="text-xs text-red-600">{fieldErrors.datenschutz}</p>
                  )}
                  {generalError && (
                    <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {generalError}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={pending}
                    aria-busy={pending}
                    className="group flex cursor-pointer items-center gap-0 self-start rounded-full border-none bg-transparent px-0 py-0 shadow-none outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="rounded-full bg-[#e1fcad] px-6 py-3 text-sm font-medium text-black duration-500 ease-in-out group-hover:bg-[#122023] group-hover:text-[#e1fcad]">
                      {pending ? "Wird gesendet…" : "Nachricht senden"}
                    </span>
                    <div className="relative flex size-[46px] items-center justify-center overflow-hidden rounded-full bg-[#e1fcad] text-black duration-500 ease-in-out group-hover:bg-[#122023] group-hover:text-[#e1fcad]">
                      <ArrowUpRight className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:translate-x-10" />
                      <ArrowUpRight className="absolute left-1/2 top-1/2 size-4 -translate-x-16 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:-translate-x-1/2" />
                    </div>
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-black/[0.06] min-h-[280px] sm:min-h-[360px] lg:min-h-0">
            <MapsConsentGate
              src={mapsEmbedUrl}
              title={mapsTitel}
              className="h-full w-full"
              style={{ border: 0, minHeight: "280px" }}
            />
          </div>
        </div>
        </FadeIn>
      </div>
    </section>
  );
}
