"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import React from "react";
import type { Team } from "@/lib/mannschaften-data";
import TeamPlaceholder from "@/components/ui/team-placeholder";

type Props = {
  herren: Team[];
  damen: Team[];
  gemischt: Team[];
};

const TABS = [
  { id: "herren", label: "Herren" },
  { id: "damen", label: "Damen" },
  { id: "gemischt", label: "Gemischt" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function TeamCard({ team }: { team: Team }) {
  return (
    <Link
      href={`/mannschaften/${team.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white transition-shadow duration-300 hover:shadow-lg"
    >
      <div className="relative h-56 w-full overflow-hidden">
        {team.bild ? (
          <>
            <Image
              src={team.bild}
              alt={team.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </>
        ) : (
          <TeamPlaceholder className="h-56" />
        )}
      </div>

      <div className="flex flex-1 items-center justify-between p-5">
        <div>
          <h3 className="font-kanturmuy text-xl font-normal tracking-tight text-black">
            {team.name}
          </h3>
          <div className="mt-1 flex items-center gap-2">
            <span className="h-[2px] w-4 rounded-full bg-[#e1fcad]" />
            <span className="text-xs font-light text-black/40 uppercase tracking-widest">
              Hardter TV
            </span>
          </div>
        </div>
        <div className="flex size-9 items-center justify-center rounded-full bg-[#f9f9f7] transition-colors duration-300 group-hover:bg-[#e1fcad]">
          <ArrowRight className="size-4 text-black/50 group-hover:text-black" strokeWidth={1.5} />
        </div>
      </div>

      <div className="h-[3px] w-0 bg-[#e1fcad] transition-all duration-500 ease-out group-hover:w-full" />
    </Link>
  );
}

export default function MannschaftenClient({ herren, damen, gemischt }: Props) {
  const [activeTab, setActiveTab] = React.useState<TabId>("herren");

  const teamMap: Record<TabId, Team[]> = { herren, damen, gemischt };
  const activeTeams = teamMap[activeTab];

  return (
    <section className="bg-[#f9f9f7] px-6 py-20 md:px-12 lg:px-20 lg:py-28">
      <div className="mx-auto max-w-7xl">
        {/* Tab bar */}
        <div className="mb-10 flex items-center gap-2 rounded-full border border-black/[0.08] bg-white p-1.5 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative rounded-full px-6 py-2.5 text-sm font-medium transition-colors duration-200 ${
                activeTab === tab.id
                  ? "bg-[#122023] text-white"
                  : "text-black/50 hover:text-black"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.span
                  layoutId="tab-indicator"
                  className="absolute inset-0 rounded-full bg-[#122023] -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Header */}
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px w-8 bg-black/30" />
              <span className="text-xs uppercase tracking-[0.2em] text-black/50">
                {activeTab === "herren"
                  ? "Herren-Teams"
                  : activeTab === "damen"
                  ? "Damen-Teams"
                  : "Gemischt-Teams"}
              </span>
            </div>
            <h2 className="font-kanturmuy text-3xl font-normal tracking-tighter sm:text-4xl md:text-5xl">
              <span className="relative inline-block">
                {activeTab === "herren"
                  ? "Herren"
                  : activeTab === "damen"
                  ? "Damen"
                  : "Gemischt"}
                <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#e1fcad]" />
              </span>
            </h2>
          </div>
          <span className="shrink-0 rounded-full border border-black/[0.08] bg-white px-4 py-2 text-sm text-black/40">
            {activeTeams.length} Teams
          </span>
        </div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {activeTeams.map((team) => (
              <TeamCard key={team.slug} team={team} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
