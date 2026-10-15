export function StatCard({
    label,
    value,
    hint,
}: {
    label: string;
    value: number;
    hint: string;
}) {
    return (
        <div className="flex flex-col gap-1 rounded-lg border p-4">
            <span className="text-xs font-medium text-muted-foreground">
                {label}
            </span>
            <span className="text-3xl font-semibold tabular-nums">{value}</span>
            <span className="text-xs text-muted-foreground">{hint}</span>
        </div>
    );
}
