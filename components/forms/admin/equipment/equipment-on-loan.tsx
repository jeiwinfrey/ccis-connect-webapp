export default function EquipmentOnLoan() {
    return (
        <div className="flex flex-col gap-6 p-6 md:p-8">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Equipment Inventory — On Loan</h1>
                <p className="text-sm text-muted-foreground">Equipment currently borrowed by students.</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-8 flex items-center justify-center min-h-[300px] text-muted-foreground text-sm">
                On-loan equipment goes here.
            </div>
        </div>
    );
}
