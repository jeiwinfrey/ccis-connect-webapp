import Navbar from "@/components/navbar";
import User from "@/components/user";
import ReserveRoom from "@/components/reserve-room";

export default function Page() {
  return (
    <div className="min-h-screen w-full bg-background">
      <Navbar />
      <User />
      <ReserveRoom />
    </div>
  );
}
