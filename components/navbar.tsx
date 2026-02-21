"use client";

import { useState } from "react";
import Link from "next/link";

import {
  IconBook,
  IconCalendar,
  IconMap,
  IconMenu2,
  IconX,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/public/logo";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="px-4 pb-2 pt-5 md:px-10 md:pt-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo className="h-7 w-7 text-primary" strokeWidth={1.8} />
          <span className="text-sm font-medium text-foreground">CCIS Connect</span>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2">
          <Button variant="secondary" asChild>
            <Link href="/virtual-map" className="inline-flex items-center gap-2">
              <IconMap className="h-4 w-4" />
              Explore Virtual Map
            </Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/borrow" className="inline-flex items-center gap-2">
              <IconBook className="h-4 w-4" />
              Borrow
            </Link>
          </Button>
          <Button asChild>
            <Link href="/reserve" className="inline-flex items-center gap-2">
              <IconCalendar className="h-4 w-4" />
              Reserve
            </Link>
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <IconX className="h-5 w-5" /> : <IconMenu2 className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden mt-3 flex flex-col gap-2 border-t border-border/40 pt-3">
          <Button variant="secondary" asChild className="w-full justify-start gap-2">
            <Link href="/virtual-map" onClick={() => setOpen(false)}>
              <IconMap className="h-4 w-4" />
              Explore Virtual Map
            </Link>
          </Button>
          <Button variant="secondary" asChild className="w-full justify-start gap-2">
            <Link href="/borrow" onClick={() => setOpen(false)}>
              <IconBook className="h-4 w-4" />
              Borrow
            </Link>
          </Button>
          <Button asChild className="w-full justify-start gap-2">
            <Link href="/reserve" onClick={() => setOpen(false)}>
              <IconCalendar className="h-4 w-4" />
              Reserve
            </Link>
          </Button>
        </div>
      )}
    </nav>
  );
}
