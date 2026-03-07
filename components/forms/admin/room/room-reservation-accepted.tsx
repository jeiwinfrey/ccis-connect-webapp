export default function RoomReservationAccepted() {
    return (
        <div className="flex flex-col gap-6 p-6 md:p-8">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Room Reservations — Accepted</h1>
                <p className="text-sm text-muted-foreground">All currently accepted room reservations.</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-8 flex items-center justify-center min-h-[300px] text-muted-foreground text-sm">
                Accepted room reservations go here.
            </div>
        </div>
    );
}
