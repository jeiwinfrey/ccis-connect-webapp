import Link from "next/link";

import { IconSchool } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/public/logo";

export default function Login() {
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 gap-0 px-4 py-10 md:grid-cols-2 md:px-8">
        <div className="absolute left-6 top-6 flex items-center gap-2 md:left-10 md:top-10">
          <Logo className="h-7 w-7 text-primary" strokeWidth={1.8} />
          <span className="text-sm font-medium text-foreground">CCIS Connect</span>
        </div>
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md border-none bg-transparent shadow-none">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-2xl text-primary">Sign in</CardTitle>
              <p className="text-sm text-muted-foreground">
                Use your username and password to continue.
              </p>
            </CardHeader>
            <CardContent>
              <form className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" name="username" placeholder="alexsmith" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>
                <Button asChild className="mt-2 w-full">
                  <Link href="/dashboard">Sign in</Link>
                </Button>
                <Button variant="secondary">
                  <Link href="/virtual-map">Explore Virtual Map</Link>
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="hidden items-center justify-center md:flex">
          <div className="w-full max-w-xl rounded-3xl border border-dashed border-border bg-card/40 p-6">
            <div className="mb-6 flex items-center gap-3">
              <IconSchool className="h-6 w-6 text-primary" strokeWidth={1.6} />
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Mariano Marcos State University
                </p>
                <p className="text-sm font-medium text-foreground">
                  College of Computing and Information Sciences
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-muted" />
                <div className="h-3 w-3 rounded-full bg-muted" />
                <div className="h-3 w-10 rounded-full bg-muted" />
              </div>
            </div>

            <div className="grid grid-cols-[150px_1fr] gap-4">
              <div className="space-y-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={`nav-${index}`} className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-muted" />
                    <div className="h-3 w-full rounded-full bg-muted" />
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={`stat-${index}`} className="h-20 rounded-2xl bg-muted/70" />
                  ))}
                </div>
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={`row-${index}`}
                      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
                    >
                      <div className="h-8 w-8 rounded-xl bg-muted/70" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-3/5 rounded-full bg-muted" />
                        <div className="h-3 w-2/5 rounded-full bg-muted" />
                      </div>
                      <div className="h-4 w-16 rounded-full bg-muted/70" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
