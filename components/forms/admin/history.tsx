export default function History() {
    return (
        <div className="flex flex-col gap-6 p-6 md:p-8">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">History</h1>
                <p className="text-sm text-muted-foreground">Full activity log of all actions taken.</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-8 flex items-center justify-center min-h-[300px] text-muted-foreground text-sm">
                History log goes here.
            </div>
        </div>
    );
}
