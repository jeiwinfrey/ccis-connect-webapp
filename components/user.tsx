/**
 * User component
 * this component will be used to display the user's information 
 * Sample data:
 * {
 *   name: "John Doe",
 *   role: "admin", "faculty", "student"
 *   id: 23-140028,
 *   image: "https://example.com/image.jpg",
 * }
*/

// Edit this component to display the user's information

import { Card, CardHeader, CardTitle } from "./ui/card";

export default function User() {
  return (
    <div className="px-10">
      <Card>
        <CardHeader>
          <CardTitle>User</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}

