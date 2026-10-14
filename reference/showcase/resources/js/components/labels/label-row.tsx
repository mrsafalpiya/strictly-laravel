import { Check, Pencil, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { LabelPill } from '@/components/domain/label-pill';
import InputError from '@/components/input-error';
import { ColorPicker } from '@/components/projects/color-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWorkspace } from '@/hooks/use-workspace';
import { destroy, update } from '@/routes/labels';
import type { LabelListItemData } from '@/types';
import { TypedForm } from '@/components/typed-form';

export function LabelRow({ label }: { label: LabelListItemData }) {
    const workspace = useWorkspace();
    const [editing, setEditing] = useState(false);
    const route = { workspace, label };

    if (!editing) {
        return (
            <li className="flex items-center gap-3 px-3 py-2 text-sm">
                <LabelPill label={label} />
                <span className="text-xs text-muted-foreground">
                    {label.issuesCount === 1
                        ? '1 issue'
                        : `${label.issuesCount} issues`}
                </span>
                {workspace.can.manage && (
                    <div className="ml-auto flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Edit ${label.name}`}
                            onClick={() => setEditing(true)}
                        >
                            <Pencil className="size-3.5" />
                        </Button>
                        <TypedForm
                            {...destroy.form(route)}
                            options={{ preserveScroll: true }}
                            onBefore={() =>
                                confirm(
                                    `Delete “${label.name}”? It will be removed from ${label.issuesCount} issues.`,
                                )
                            }
                        >
                            {({ processing }) => (
                                <Button
                                    type="submit"
                                    variant="ghost"
                                    size="icon"
                                    disabled={processing}
                                    aria-label={`Delete ${label.name}`}
                                >
                                    <Trash2 className="size-3.5 text-destructive" />
                                </Button>
                            )}
                        </TypedForm>
                    </div>
                )}
            </li>
        );
    }

    return (
        <li className="px-3 py-2">
            {/* Explicit type argument: <TypedForm> can't infer TForm from a Wayfinder `{ action, method }`. */}
            <TypedForm
                {...update.form(route)}
                options={{ preserveScroll: true }}
                onSuccess={() => setEditing(false)}
                className="flex flex-col gap-2"
            >
                {({ errors, processing, field }) => (
                    <>
                        <div className="flex flex-wrap items-center gap-3">
                            <Input
                                name={field('name')}
                                defaultValue={label.name}
                                aria-label="Name"
                                maxLength={50}
                                autoFocus
                                className="h-8 w-48"
                            />
                            <ColorPicker
                                name={field('color')}
                                defaultValue={label.color}
                                size="sm"
                            />
                            <div className="ml-auto flex items-center gap-1">
                                <Button
                                    type="submit"
                                    size="icon"
                                    variant="ghost"
                                    disabled={processing}
                                    aria-label="Save"
                                >
                                    <Check className="size-4" />
                                </Button>
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    aria-label="Cancel"
                                    onClick={() => setEditing(false)}
                                >
                                    <X className="size-4" />
                                </Button>
                            </div>
                        </div>
                        {/* errors is inferred from labels.update (UpdateLabelData): errors.nmae would not compile. */}
                        <InputError message={errors.name} />
                        <InputError message={errors.color} />
                    </>
                )}
            </TypedForm>
        </li>
    );
}
