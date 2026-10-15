import { Head } from '@inertiajs/react';
import { Field } from '@/components/field';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DeleteWorkspace } from '@/components/workspaces/delete-workspace';
import {
    issueViews,
    issueViewValues,
    notificationSettingKeys,
    notificationSettings,
    weekStarts,
    weekStartValues,
} from '@/components/workspaces/settings-options';
import { useWorkspace } from '@/hooks/use-workspace';
import { update } from '@/routes/workspace/settings';
import type { PageProps } from '@/generated';
import { useRouteForm } from '@mrsafalpiya/strictly-laravel/react';

export default function WorkspacesSettings({
    defaults,
    can,
}: PageProps<'workspaces/settings'>) {
    const workspace = useWorkspace();
    // One nested form: paths like 'settings.notifications.onAssign' are typed for setData and errors.
    const form = useRouteForm(update(workspace), defaults);

    return (
        <>
            <Head title="Workspace settings" />
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 p-4">
                <form
                    className="flex flex-col gap-6"
                    onSubmit={(event) => {
                        event.preventDefault();
                        // Uses the URL of the page we're on: a changed slug only applies after saving.
                        form.submit({
                            preserveScroll: true,
                            // Saved values become the new baseline for `isDirty`.
                            onSuccess: () => form.setDefaults(),
                        });
                    }}
                >
                    <h1 className="text-xl font-semibold">
                        Workspace settings
                    </h1>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                            label="Name"
                            htmlFor="name"
                            error={form.errors.name}
                        >
                            <Input
                                id="name"
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                            />
                        </Field>
                        <Field
                            label="URL"
                            htmlFor="slug"
                            error={form.errors.slug}
                        >
                            <Input
                                id="slug"
                                value={form.data.slug}
                                onChange={(event) =>
                                    form.setData('slug', event.target.value)
                                }
                            />
                        </Field>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                            label="Default issue view"
                            error={form.errors['settings.defaultView']}
                        >
                            <Select
                                value={form.data.settings.defaultView}
                                onValueChange={(value) =>
                                    form.setData(
                                        'settings.defaultView',
                                        issueViewValues.find(
                                            (view) => view === value,
                                        ) ?? 'list',
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {issueViewValues.map((view) => (
                                        <SelectItem key={view} value={view}>
                                            {issueViews[view]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field
                            label="Weeks start on"
                            error={form.errors['settings.weekStartsOn']}
                        >
                            <Select
                                value={form.data.settings.weekStartsOn}
                                onValueChange={(value) =>
                                    form.setData(
                                        'settings.weekStartsOn',
                                        weekStartValues.find(
                                            (day) => day === value,
                                        ) ?? 'monday',
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {weekStartValues.map((day) => (
                                        <SelectItem key={day} value={day}>
                                            {weekStarts[day]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                    </div>

                    <div className="grid gap-1.5">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="allowGuests"
                                checked={form.data.settings.allowGuests}
                                onCheckedChange={(checked) =>
                                    form.setData(
                                        'settings.allowGuests',
                                        checked === true,
                                    )
                                }
                            />
                            <Label htmlFor="allowGuests">
                                Allow guests (read-only members)
                            </Label>
                        </div>
                        <InputError
                            message={form.errors['settings.allowGuests']}
                        />
                    </div>

                    <fieldset className="flex flex-col gap-3">
                        <legend className="mb-2 font-medium">
                            Notifications
                        </legend>
                        {notificationSettingKeys.map((key) => (
                            <div key={key} className="grid gap-1">
                                <div className="flex items-start gap-2">
                                    <Checkbox
                                        id={`notifications-${key}`}
                                        checked={
                                            form.data.settings.notifications[
                                                key
                                            ]
                                        }
                                        onCheckedChange={(checked) =>
                                            form.setData(
                                                `settings.notifications.${key}`,
                                                checked === true,
                                            )
                                        }
                                    />
                                    <div className="grid gap-0.5">
                                        <Label htmlFor={`notifications-${key}`}>
                                            {notificationSettings[key].label}
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            {
                                                notificationSettings[key]
                                                    .description
                                            }
                                        </p>
                                    </div>
                                </div>
                                <InputError
                                    message={
                                        form.errors[
                                            `settings.notifications.${key}`
                                        ]
                                    }
                                />
                            </div>
                        ))}
                    </fieldset>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={form.processing || !form.isDirty}
                        >
                            Save settings
                        </Button>
                    </div>
                </form>

                {can.delete && <DeleteWorkspace workspace={workspace} />}
            </div>
        </>
    );
}
