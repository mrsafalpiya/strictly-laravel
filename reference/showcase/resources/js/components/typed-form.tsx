import type {
    FormComponentProps,
    FormComponentSlotProps,
    FormDataKeys,
} from '@inertiajs/core';
import { Form } from '@inertiajs/react';
import type { FormHTMLAttributes, ReactNode } from 'react';
import type { FieldName, WithInput } from '@/lib/routes';
import type { RouteFormDefinition } from '@/wayfinder';

type Slot<TInput extends object> = FormComponentSlotProps<TInput> & {
    /** A typed `name` for an input: `<Input name={field('title')} />` (dotted paths for nested data). */
    field: (name: FormDataKeys<TInput>) => FieldName;
};

type Props<TInput extends object> = RouteFormDefinition<'get' | 'post'> &
    WithInput<TInput> &
    Omit<FormComponentProps<TInput>, 'action' | 'method'> &
    Omit<
        FormHTMLAttributes<HTMLFormElement>,
        keyof FormComponentProps | 'children'
    > & {
        children: ReactNode | ((slot: Slot<TInput>) => ReactNode);
    };

/**
 * Inertia's `<Form>`, typed by the controller action it posts to:
 *
 *     <TypedForm {...store.form(workspace)}>
 *         {({ errors, field }) => <Input name={field('name')} aria-invalid={!!errors.name} />}
 *     </TypedForm>
 *
 * The payload type comes from the route (Wayfinder brands `.form()` with the action's InputData class,
 * see App\Support\Wayfinder\RouteTypes), so `errors`, `field()` and `resetOnSuccess` are checked
 * against it. Routes without an InputData parameter (e.g. Fortify's) need the type spelled out:
 * `<TypedForm<LoginFormData> {...store.form()}>`.
 */
export function TypedForm<TInput extends object>({
    children,
    __input: _input,
    ...props
}: Props<TInput>) {
    const field = (name: FormDataKeys<TInput>): FieldName =>
        `${name}` as FieldName;

    return (
        <Form<TInput> {...props}>
            {typeof children === 'function'
                ? (slot) => children({ ...slot, field })
                : children}
        </Form>
    );
}
