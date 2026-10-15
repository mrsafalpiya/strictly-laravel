import { Head } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { CycleCard } from '@/components/cycles/cycle-card';
import { CycleFields } from '@/components/cycles/cycle-fields';
import { Button } from '@/components/ui/button';
import { useWorkspace } from '@/hooks/use-workspace';
import { store } from '@/routes/cycles';
import type { CycleData, PageProps } from '@/generated';
import { useRouteForm } from '@mrsafalpiya/strictly-laravel/react';

export default function CyclesIndex({
    current,
    upcoming,
    past,
    defaults,
}: PageProps<'cycles/index'>) {
    const workspace = useWorkspace();
    const [creating, setCreating] = useState(false);
    const form = useRouteForm(store(workspace), defaults);

    return (
        <>
            <Head title="Cycles" />
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Cycles</h1>
                    {workspace.can.manage && !creating && (
                        <Button size="sm" onClick={() => setCreating(true)}>
                            <Plus className="size-4" /> New cycle
                        </Button>
                    )}
                </div>

                {creating && (
                    <form
                        className="flex flex-col gap-4 rounded-lg border p-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.submit();
                        }}
                    >
                        <CycleFields form={form} />
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    form.reset();
                                    form.clearErrors();
                                    setCreating(false);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                Create cycle
                            </Button>
                        </div>
                    </form>
                )}

                <section className="flex flex-col gap-2">
                    <h2 className="text-sm font-semibold">Current</h2>
                    {current === null ? (
                        <p className="rounded-lg border p-4 text-sm text-muted-foreground">
                            No cycle is running today.
                        </p>
                    ) : (
                        <CycleCard cycle={current} highlight />
                    )}
                </section>

                <CycleGroup title="Upcoming" cycles={upcoming} />
                <CycleGroup title="Past" cycles={past} />
            </div>
        </>
    );
}

function CycleGroup({ title, cycles }: { title: string; cycles: CycleData[] }) {
    if (cycles.length === 0) {
        return null;
    }

    return (
        <section className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold">{title}</h2>
            <div className="grid gap-2 sm:grid-cols-2">
                {cycles.map((cycle) => (
                    <CycleCard key={cycle.id} cycle={cycle} />
                ))}
            </div>
        </section>
    );
}
