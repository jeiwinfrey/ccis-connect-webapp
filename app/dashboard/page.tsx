import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Page() {
  return (
    <div className="min-h-screen w-full bg-slate-50 px-4 py-12">
      <div className="mx-auto w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">You are signed in.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
