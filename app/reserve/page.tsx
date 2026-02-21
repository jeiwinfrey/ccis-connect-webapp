import Navbar from "@/components/navbar";
import ReserveRoom from "@/components/reserve-room";

export default function Page() {
  return (
    <div className="min-h-screen w-full bg-background">
      <Navbar />
      <ReserveRoom />
    </div>
  );
}
