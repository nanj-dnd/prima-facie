"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

export default function Nav() {
  const [open, setOpen] = useState(false);

  const navLinks = [
    { label: "How it works", href: "/#how-it-works" },
    { label: "Features", href: "/#features" },
    { label: "Apply", href: "/apply" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1A1A1A] bg-[#0A0A0A]/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold tracking-widest text-[#C9A84C]"
        >
          Prima Facie
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="font-[family-name:var(--font-montserrat)] text-xs tracking-widest uppercase text-[#B0AA9E] hover:text-[#C9A84C] transition-colors duration-300"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/sign-in"
            className="font-[family-name:var(--font-montserrat)] text-xs tracking-widest uppercase text-[#B0AA9E] hover:text-[#C9A84C] transition-colors duration-300"
          >
            Sign in
          </Link>
          <Link
            href="/#premium"
            className="font-[family-name:var(--font-montserrat)] text-xs tracking-widest uppercase text-[#0A0A0A] bg-[#C9A84C] px-4 py-2 hover:bg-[#8A6E2F] transition-colors duration-300"
          >
            Can&apos;t get in?
          </Link>
        </div>

        <button
          className="md:hidden text-[#C9A84C] flex flex-col gap-1.5 p-1"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-px bg-current transition-all duration-300 ${open ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-6 h-px bg-current transition-all duration-300 ${open ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-px bg-current transition-all duration-300 ${open ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden border-t border-[#1A1A1A]"
          >
            <div className="flex flex-col px-6 py-4 gap-5">
              {navLinks.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="font-[family-name:var(--font-montserrat)] text-xs tracking-widest uppercase text-[#B0AA9E] hover:text-[#C9A84C] transition-colors"
                >
                  {label}
                </Link>
              ))}
              <Link
                href="/#premium"
                onClick={() => setOpen(false)}
                className="font-[family-name:var(--font-montserrat)] text-xs tracking-widest uppercase text-[#C9A84C]"
              >
                Can&apos;t get in?
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
