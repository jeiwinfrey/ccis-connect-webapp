import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";

export default function BorrowEquipment() {
  return (
    <div className="px-10 py-4">
      <Card>
        <CardHeader>
          <CardTitle>Borrow Equipment</CardTitle>
        </CardHeader>
        <CardContent>
          <h1>Borrow Equipment</h1>
        </CardContent>
      </Card>
    </div>
  );
}