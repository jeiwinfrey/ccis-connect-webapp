import Navbar from "@/components/ui/navbar";
import User from "@/components/user";

export default function Page() {
  return (
    <div className="min-h-screen w-full bg-background">
      <Navbar />
      <User />
    </div>
  );
}
