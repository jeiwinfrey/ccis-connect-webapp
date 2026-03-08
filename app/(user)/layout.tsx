import Navbar from "@/components/navbar";
import { AuthProvider } from "@/lib/auth/context";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen w-full bg-background">
        <Navbar />
        <main id="main-content">{children}</main>
      </div>
    </AuthProvider>
  );
}
