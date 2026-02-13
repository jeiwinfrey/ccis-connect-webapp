import Link from "next/link";

import {
  IconBook,
  IconCalendar,
  IconMap,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/public/logo";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 pb-2 pt-6 md:px-10 md:pt-10">
      <div className="flex items-center gap-2">
        <Logo className="h-7 w-7 text-primary" strokeWidth={1.8} />
        <span className="text-sm font-medium text-foreground">CCIS Connect</span>
      </div>
      <div className="flex items-center gap-2">
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
    </nav>
  );
}
