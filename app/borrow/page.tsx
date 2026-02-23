import Navbar from "@/components/ui/navbar";
import BorrowEquipment from "@/components/borrow-equipment";

export default function Page() {
  return (
    <div className="min-h-screen w-full bg-background">
      <Navbar />
      <BorrowEquipment />
    </div>
  );
}
