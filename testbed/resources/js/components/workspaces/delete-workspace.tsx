import { Field } from '@/components/field';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { destroy } from '@/routes/workspace';
import type { CurrentWorkspaceData } from '@/generated';
import { useRouteForm } from '@mrsafalpiya/strictly-laravel/react';

export function DeleteWorkspace({
    workspace,
}: {
    workspace: CurrentWorkspaceData;
}) {
    const form = useRouteForm(destroy(workspace), { confirmName: '' });

    return (
        <section className="space-y-3 rounded-lg border border-red-200 p-4 dark:border-red-900">
            <div>
                <h2 className="font-medium text-red-600 dark:text-red-400">
                    Delete workspace
                </h2>
                <p className="text-sm text-muted-foreground">
                    Permanently deletes {workspace.name} with all its projects,
                    issues and members.
                </p>
            </div>
            <Dialog onOpenChange={() => form.resetAndClearErrors()}>
                <DialogTrigger asChild>
                    <Button variant="destructive">Delete workspace</Button>
                </DialogTrigger>
                <DialogContent>
                    <form
                        className="space-y-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.submit();
                        }}
                    >
                        <DialogTitle>Delete {workspace.name}?</DialogTitle>
                        <DialogDescription>
                            This cannot be undone. Type{' '}
                            <strong>{workspace.name}</strong> to confirm.
                        </DialogDescription>
                        <Field
                            label="Workspace name"
                            htmlFor="confirmName"
                            error={form.errors.confirmName}
                        >
                            <Input
                                id="confirmName"
                                autoComplete="off"
                                value={form.data.confirmName}
                                onChange={(event) =>
                                    form.setData(
                                        'confirmName',
                                        event.target.value,
                                    )
                                }
                            />
                        </Field>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={
                                    form.processing ||
                                    form.data.confirmName !== workspace.name
                                }
                            >
                                Delete forever
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </section>
    );
}
