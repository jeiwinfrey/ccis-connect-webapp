export default function Admin() {
    return (
        <div className="flex flex-col gap-6 p-6 md:p-8">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin</h1>
                <p className="text-sm text-muted-foreground">Manage administrators and system settings.</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-8 flex items-center justify-center min-h-[300px] text-muted-foreground text-sm">
                Admin settings go here.
            </div>
        </div>
    );
}
