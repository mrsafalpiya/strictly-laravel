import { Head } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import InputError from '@/components/input-error';
import { LabelRow } from '@/components/labels/label-row';
import { ColorPicker } from '@/components/projects/color-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWorkspace } from '@/hooks/use-workspace';
import { store } from '@/routes/labels';
import type { PageProps } from '@/types';
import { TypedForm } from '@/components/typed-form';

export default function LabelsIndex({ labels }: PageProps<'labels/index'>) {
    const workspace = useWorkspace();

    return (
        <>
            <Head title="Labels" />
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4">
                <h1 className="text-xl font-semibold">Labels</h1>

                {workspace.can.manage && (
                    // Explicit type argument: without it errors is Record<string, any>.
                    <TypedForm
                        {...store.form(workspace)}
                        options={{ preserveScroll: true }}
                        resetOnSuccess={['name']}
                        className="flex flex-col gap-2 rounded-lg border p-3"
                    >
                        {({ errors, processing, field }) => (
                            <>
                                <div className="flex flex-wrap items-center gap-3">
                                    <Input
                                        name={field('name')}
                                        placeholder="New label"
                                        aria-label="Name"
                                        maxLength={50}
                                        className="h-8 w-48"
                                    />
                                    <ColorPicker
                                        name={field('color')}
                                        defaultValue="slate"
                                        size="sm"
                                    />
                                    <Button
                                        type="submit"
                                        size="sm"
                                        className="ml-auto"
                                        disabled={processing}
                                    >
                                        <Plus className="size-4" /> Add label
                                    </Button>
                                </div>
                                <InputError message={errors.name} />
                                <InputError message={errors.color} />
                            </>
                        )}
                    </TypedForm>
                )}

                {labels.length === 0 ? (
                    <p className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
                        No labels yet.
                    </p>
                ) : (
                    <ul className="divide-y rounded-lg border">
                        {labels.map((label) => (
                            <LabelRow key={label.id} label={label} />
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
}
