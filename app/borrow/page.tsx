import Navbar from "@/components/navbar";
import User from "@/components/user";
import BorrowEquipment from "@/components/borrow-equipment";

export default function Page() {
  return (
    <div className="min-h-screen w-full bg-background">
      <Navbar />
      <User />
      <BorrowEquipment />
    </div>
  );
}
