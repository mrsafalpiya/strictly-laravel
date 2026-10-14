import { Field } from '@/components/field';
import { Input } from '@/components/ui/input';
import type { CycleFormData } from '@/types';
import type { RouteForm } from '@/lib/requests';

/** Name and date fields shared by the create (index) and edit (show) forms. */
export function CycleFields({ form }: { form: RouteForm<CycleFormData> }) {
    return (
        <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto]">
            <Field label="Name" htmlFor="cycle-name" error={form.errors.name}>
                <Input
                    id="cycle-name"
                    value={form.data.name}
                    maxLength={100}
                    onChange={(event) =>
                        form.setData('name', event.target.value)
                    }
                />
            </Field>
            <Field
                label="Starts on"
                htmlFor="cycle-starts-on"
                error={form.errors.startsOn}
            >
                <Input
                    id="cycle-starts-on"
                    type="date"
                    value={form.data.startsOn}
                    onChange={(event) =>
                        form.setData('startsOn', event.target.value)
                    }
                />
            </Field>
            <Field
                label="Ends on"
                htmlFor="cycle-ends-on"
                error={form.errors.endsOn}
            >
                <Input
                    id="cycle-ends-on"
                    type="date"
                    min={form.data.startsOn}
                    value={form.data.endsOn}
                    onChange={(event) =>
                        form.setData('endsOn', event.target.value)
                    }
                />
            </Field>
        </div>
    );
}
