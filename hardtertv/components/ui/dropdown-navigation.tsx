"use client";

import { useState } from "react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowUpRight } from "lucide-react";
import Image from "next/image";

type NavItem = {
  id: number;
  label: string;
  subMenus?: {
    title: string;
    items: {
      label: string;
      description: string;
      icon: React.ElementType;
      href?: string;
    }[];
  }[];
  link?: string;
  image?: string;
  imageLabel?: string;
  cta?: { label: string; href: string; description?: string };
};

type Props = {
  navItems: NavItem[];
};

export function DropdownNavigation({ navItems }: Props) {
  const [openMenu, setOpenMenu] = React.useState<string | null>(null);
  const [isHover, setIsHover] = useState<number | null>(null);
  const [direction, setDirection] = useState(0);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevMenuRef = React.useRef<string | null>(null);

  const handleHover = (menuLabel: string | null) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (menuLabel) {
      const prevIdx = navItems.findIndex((n) => n.label === prevMenuRef.current);
      const nextIdx = navItems.findIndex((n) => n.label === menuLabel);
      if (prevMenuRef.current && prevMenuRef.current !== menuLabel) {
        setDirection(nextIdx > prevIdx ? 1 : -1);
      }
      prevMenuRef.current = menuLabel;
      setOpenMenu(menuLabel);
    } else {
      closeTimer.current = setTimeout(() => {
        setOpenMenu(null);
        prevMenuRef.current = null;
      }, 150);
    }
  };

  return (
    <>
      <ul className="relative flex items-center space-x-0">
        {navItems.map((navItem) => (
          <li
            key={navItem.label}
            className="relative"
            onMouseEnter={() => handleHover(navItem.label)}
            onMouseLeave={() => handleHover(null)}
          >
            <a
              href={navItem.link ?? "#"}
              onClick={(e) => { if (navItem.subMenus || !navItem.link || navItem.link === "#") e.preventDefault(); }}
              className="text-sm py-1.5 px-4 flex cursor-pointer group transition-colors duration-300 items-center justify-center gap-1 text-gray-500 hover:text-gray-900 relative"
              onMouseEnter={() => setIsHover(navItem.id)}
              onMouseLeave={() => setIsHover(null)}
            >
              <span>{navItem.label}</span>
              {navItem.subMenus && (
                <ChevronDown
                  className={`h-4 w-4 group-hover:rotate-180 duration-300 transition-transform
                    ${openMenu === navItem.label ? "rotate-180" : ""}`}
                />
              )}
              {(isHover === navItem.id || openMenu === navItem.label) && (
                <motion.div
                  layoutId="hover-bg"
                  className="absolute inset-0 size-full bg-black/5"
                  style={{ borderRadius: 99 }}
                />
              )}
            </a>
          </li>
        ))}
      </ul>

      {/* Mega menu — single persistent panel, only mounts/unmounts when going open↔closed */}
      <AnimatePresence>
        {(() => {
          const activeItem = navItems.find(
            (n) => n.label === openMenu && n.subMenus
          );
          if (!activeItem) return null;
          return (
            <motion.div
              key="mega-panel"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="fixed left-0 right-0 top-14 z-40 border-b border-gray-200 bg-white shadow-xl"
              onMouseEnter={() => {
                if (closeTimer.current) clearTimeout(closeTimer.current);
              }}
              onMouseLeave={() => handleHover(null)}
            >
              <div className="mx-auto max-w-7xl overflow-hidden px-4 py-8 sm:px-6">
                <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeItem.label}
                  initial={{ opacity: 0, x: direction * 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -40 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="grid grid-cols-12 gap-6"
                >

                  {/* Featured image */}
                  {activeItem.image && (
                    <div className="col-span-3">
                      <div className="relative h-full min-h-48 overflow-hidden rounded-xl">
                        <Image
                          key={activeItem.image}
                          src={activeItem.image}
                          alt={activeItem.imageLabel ?? activeItem.label}
                          fill
                          className="object-cover object-center transition-opacity duration-200"
                          sizes="300px"
                        />
                        {activeItem.imageLabel && (
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                        )}
                        {activeItem.imageLabel && (
                          <span className="absolute bottom-4 left-4 text-sm font-medium text-white">
                            {activeItem.imageLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Link groups */}
                  {activeItem.subMenus!.map((sub) => (
                    <div
                      key={sub.title}
                      className={activeItem.image ? "col-span-3" : "col-span-4"}
                    >
                      <h3 className="mb-4 text-xs font-medium uppercase tracking-widest text-black/40">
                        {sub.title}
                      </h3>
                      <ul className="space-y-1">
                        {sub.items.map((item) => {
                          const Icon = item.icon;
                          return (
                            <li key={item.label}>
                              <a
                                href={item.href ?? "#"}
                                className="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-gray-50"
                              >
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors group-hover:border-gray-300 group-hover:bg-white group-hover:text-gray-900">
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {item.label}
                                  </p>
                                  <p className="text-xs text-gray-400 group-hover:text-gray-600 transition-colors">
                                    {item.description}
                                  </p>
                                </div>
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}

                  {/* CTA column */}
                  {activeItem.cta && (
                    <div className="col-span-3 flex flex-col justify-between rounded-xl bg-[#f5fde8] p-6">
                      <div>
                        <div className="mb-3 inline-flex rounded-full bg-[#e1fcad] px-3 py-1 text-xs font-medium text-black/70">
                          {activeItem.label}
                        </div>
                        {activeItem.cta.description && (
                          <p className="text-sm font-light text-black/60">
                            {activeItem.cta.description}
                          </p>
                        )}
                      </div>
                      <a
                        href={activeItem.cta.href}
                        className="group mt-6 flex w-fit items-center gap-0"
                      >
                        <span className="rounded-full bg-[#e1fcad] px-5 py-2.5 text-sm font-medium text-black duration-300 group-hover:bg-[#122023] group-hover:text-[#e1fcad]">
                          {activeItem.cta.label}
                        </span>
                        <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e1fcad] text-black duration-300 group-hover:bg-[#122023] group-hover:text-[#e1fcad]">
                          <ArrowUpRight className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 group-hover:translate-x-8" />
                          <ArrowUpRight className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-12 -translate-y-1/2 transition-all duration-300 group-hover:-translate-x-1/2" />
                        </div>
                      </a>
                    </div>
                  )}

                </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </>
  );
}
