"use client";

import { DropdownNavigation } from "@/components/ui/dropdown-navigation";
import { Equal, X, ChevronDown } from "lucide-react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Newspaper,
  Calendar,
  Users,
  Mail,
  BookOpen,
  UserCheck,
  Dumbbell,
  MapPin,
  Home,
  Trophy,
} from "lucide-react";

const NAV_ITEMS = [
  {
    id: 1,
    label: "Home",
    image: "/images/hero-new.png",
    imageLabel: "Hardter Tennisverein",
    cta: {
      label: "Zur Startseite",
      href: "/",
      description: "Entdecke alles rund um den Hardter TV — Neuigkeiten, Termine und mehr.",
    },
    subMenus: [
      {
        title: "Seiten",
        items: [
          {
            label: "Startseite",
            description: "Zur Hauptseite des HTV",
            icon: Home,
            href: "/",
          },
          {
            label: "Vorstand",
            description: "Das Führungsteam des HTV",
            icon: Users,
            href: "/vorstand",
          },
          {
            label: "Kalender",
            description: "Alle Termine & Veranstaltungen",
            icon: Calendar,
            href: "/kalender",
          },
        ],
      },
      {
        title: "Aktuelles",
        items: [
          {
            label: "Neuigkeiten",
            description: "Aktuelle Vereinsnachrichten",
            icon: Newspaper,
            href: "/#news",
          },
          {
            label: "Termine",
            description: "Unsere nächsten Events",
            icon: BookOpen,
            href: "/#termine",
          },
          {
            label: "Kontakt",
            description: "So erreichst du uns",
            icon: Mail,
            href: "/#contact",
          },
        ],
      },
    ],
  },
  {
    id: 2,
    label: "Training",
    image: "/images/training-828726_960_720.jpg",
    imageLabel: "Training & Kurse",
    cta: {
      label: "Zum Training",
      href: "/training",
      description: "Finde das passende Training für dein Niveau — von Anfänger bis Fortgeschrittener.",
    },
    subMenus: [
      {
        title: "Seite",
        items: [
          {
            label: "Trainingsseite",
            description: "Zur Übersicht aller Trainingsinfos",
            icon: Trophy,
            href: "/training",
          },
        ],
      },
      {
        title: "Abschnitte",
        items: [
          {
            label: "Trainingsangebote",
            description: "Einzel-, Gruppen- & Mannschaftstraining",
            icon: Dumbbell,
            href: "/training#angebote",
          },
          {
            label: "Unser Trainer",
            description: "André Albert — seit 2005 beim HTV",
            icon: UserCheck,
            href: "/training#trainer",
          },
          {
            label: "Tennishalle Kirchhellen",
            description: "4 Plätze — ganzjähriges Training",
            icon: MapPin,
            href: "/training#anlage",
          },
        ],
      },
    ],
  },
  {
    id: 3,
    label: "Mannschaften",
    link: "/mannschaften",
  },
  {
    id: 4,
    label: "Shop",
    link: "https://matchpoint24.de/collections/tennisclub-hardter-tv",
  },
  {
    id: 5,
    label: "Galerie",
    link: "/galerie",
  },
  {
    id: 6,
    label: "Eisstockschießen",
    link: "/eisstock",
  },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [openSubmenu, setOpenSubmenu] = React.useState<number | null>(null);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/images/logo1-transparent.png"
              alt="Hardter TV Logo"
              width={80}
              height={36}
              style={{ width: "auto", height: 36 }}
              className="object-contain"
            />
            <span className="text-sm font-semibold text-gray-900">Hardter TV</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:block">
            <DropdownNavigation navItems={NAV_ITEMS} />
          </nav>

          {/* Hamburger button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close Menu" : "Open Menu"}
            className="relative z-20 flex h-9 w-9 cursor-pointer items-center justify-center lg:hidden"
          >
            <motion.div
              animate={menuOpen ? { rotate: 90, opacity: 0, scale: 0 } : { rotate: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="absolute"
            >
              <Equal className="size-6" />
            </motion.div>
            <motion.div
              animate={menuOpen ? { rotate: 0, opacity: 1, scale: 1 } : { rotate: -90, opacity: 0, scale: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute"
            >
              <X className="size-6" />
            </motion.div>
          </button>

          <div className="hidden lg:block w-24" />
        </div>
      </header>

      {/* Mobile overlay menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed left-0 right-0 top-14 z-40 lg:hidden"
          >
            <div className="mx-4 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-200/50">
              <div className="px-4 py-2">
                {NAV_ITEMS.map((item) => (
                  <div key={item.id} className="border-b border-gray-100 last:border-0">
                    {item.subMenus ? (
                      <>
                        <button
                          onClick={() =>
                            setOpenSubmenu(openSubmenu === item.id ? null : item.id)
                          }
                          className="flex w-full items-center justify-between py-3 text-sm font-medium text-gray-700 hover:text-gray-900"
                        >
                          <span>{item.label}</span>
                          <motion.div
                            animate={{ rotate: openSubmenu === item.id ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          </motion.div>
                        </button>

                        <AnimatePresence initial={false}>
                          {openSubmenu === item.id && (
                            <motion.div
                              key={`sub-${item.id}`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-4 pb-4 pl-2">
                                {item.subMenus.map((sub) => (
                                  <div key={sub.title}>
                                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                                      {sub.title}
                                    </p>
                                    <ul className="space-y-1">
                                      {sub.items.map((subItem) => {
                                        const Icon = subItem.icon;
                                        return (
                                          <li key={subItem.label}>
                                            <a
                                              href={subItem.href ?? "#"}
                                              className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                                            >
                                              <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-gray-200">
                                                <Icon className="h-3.5 w-3.5 text-gray-500" />
                                              </div>
                                              <span>{subItem.label}</span>
                                            </a>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <a
                        href={item.link ?? "#"}
                        onClick={(e) => { if (!item.link || item.link === "#") e.preventDefault(); }}
                        className="block py-3 text-sm font-medium text-gray-700 hover:text-gray-900"
                      >
                        {item.label}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 top-14 z-30 bg-black/10 backdrop-blur-[2px] lg:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
}
