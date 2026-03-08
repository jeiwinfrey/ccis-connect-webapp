"use client";

import { useState } from "react";
import Link from "next/link";

import {
  IconBook,
  IconCalendar,
  IconMap,
  IconMenu2,
  IconX,
  IconUser,
  IconLogout,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/lib/auth/context";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <nav className="px-4 pb-2 pt-5 md:px-10 md:pt-6" aria-label="Main navigation">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo className="h-7 w-7 text-primary" strokeWidth={1.8} />
          <span className="text-sm font-semibold text-foreground">CCIS Connect</span>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard" className="inline-flex items-center gap-2">
              <IconUser className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/virtual-map" className="inline-flex items-center gap-2">
              <IconMap className="h-4 w-4" />
              Virtual Map
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/borrow" className="inline-flex items-center gap-2">
              <IconBook className="h-4 w-4" />
              Borrow
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/reserve" className="inline-flex items-center gap-2">
              <IconCalendar className="h-4 w-4" />
              Reserve
            </Link>
          </Button>
          {user && (
            <>
              <div className="h-4 w-px bg-border mx-1" />
              <span className="text-xs text-muted-foreground">
                {user.name}
                {user.student_id ? ` (${user.student_id})` : user.username ? ` (${user.username})` : ""}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                aria-label="Logout"
              >
                <IconLogout className="h-4 w-4" aria-hidden="true" />
              </Button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="mobile-nav-menu"
        >
          {open ? <IconX className="h-5 w-5" aria-hidden="true" /> : <IconMenu2 className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-nav-menu" className="md:hidden mt-3 flex flex-col gap-1 border-t border-border/40 pt-3" role="menu">
          {user && (
            <div className="px-3 py-2 mb-1">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">
                {user.student_id || user.username} &middot; {user.role}
              </p>
            </div>
          )}
          <Button variant="ghost" asChild className="w-full justify-start gap-2">
            <Link href="/dashboard" onClick={() => setOpen(false)}>
              <IconUser className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <Button variant="ghost" asChild className="w-full justify-start gap-2">
            <Link href="/virtual-map" onClick={() => setOpen(false)}>
              <IconMap className="h-4 w-4" />
              Virtual Map
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full justify-start gap-2">
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
          {user && (
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 mt-1"
              onClick={() => {
                setOpen(false);
                logout();
              }}
            >
              <IconLogout className="h-4 w-4" />
              Logout
            </Button>
          )}
        </div>
      )}
    </nav>
  );
}
