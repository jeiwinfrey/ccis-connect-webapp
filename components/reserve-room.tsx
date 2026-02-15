import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";

export default function ReserveRoom() {
  return (
    <div className="px-10 py-4">
      <Card>
        <CardHeader>
          <CardTitle>Reserve Room</CardTitle>
        </CardHeader>
        <CardContent>
          <h1>Reserve Room</h1>
        </CardContent>
      </Card>
    </div>
  );
}