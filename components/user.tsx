"use client";

/**
 * User component
 * this component will be used to display the user's information 
 * Sample data:
 * {
 *   name: "John Doe",
 *   role: "admin", "faculty", "student"
 *   id: 23-140028,
 * }
*/

// Edit this component to display the user's information. Make it better

import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import Link from "next/link";
import { IconLogout } from "@tabler/icons-react";

export default function User() {
  // Sample user data
  const user = {
    name: "John Doe",
    role: "admin",
    id: "23-140028",
  };

  return (
    <div className="px-10 py-4">
      <Card>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
              </div>
            </div>
            <Button variant="destructive" size="sm" asChild>
              <Link href="/">
                <IconLogout />
                Logout
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
