/*
 * The JSX types of this app (tsconfig.json → "jsxImportSource": "@/types/jsx"): React's, except that a form
 * control's `name` — on <input>, <select>, <textarea> and <button>, whose name/value the browser submits — must
 * be a FieldName, which only `field('…')` (TypedForm) produces. So `<input name="title">`, or a component passing
 * its own `name: string` through to one, fails to compile; a component that forwards a name declares it as
 * `name?: FieldName` (see components/ui/input.tsx).
 *
 * Types only: Vite compiles JSX with React's runtime (vite.config.ts → react({ jsxImportSource: 'react' })).
 */
import type { JSX as ReactJSX } from 'react';
import type { FieldName } from '@/lib/routes';

export { Fragment, jsx, jsxs } from 'react/jsx-runtime';

type FormControls = 'input' | 'select' | 'textarea' | 'button';

type WithFieldName<TProps> = Omit<TProps, 'name'> & {
    name?: FieldName | undefined;
};

export declare namespace JSX {
    type ElementType = ReactJSX.ElementType;
    interface Element extends ReactJSX.Element {}
    interface ElementClass extends ReactJSX.ElementClass {}
    interface ElementAttributesProperty
        extends ReactJSX.ElementAttributesProperty {}
    interface ElementChildrenAttribute
        extends ReactJSX.ElementChildrenAttribute {}
    type LibraryManagedAttributes<C, P> = ReactJSX.LibraryManagedAttributes<
        C,
        P
    >;
    interface IntrinsicAttributes extends ReactJSX.IntrinsicAttributes {}
    interface IntrinsicClassAttributes<
        T,
    > extends ReactJSX.IntrinsicClassAttributes<T> {}
    interface IntrinsicElements extends Omit<
        ReactJSX.IntrinsicElements,
        FormControls
    > {
        input: WithFieldName<ReactJSX.IntrinsicElements['input']>;
        select: WithFieldName<ReactJSX.IntrinsicElements['select']>;
        textarea: WithFieldName<ReactJSX.IntrinsicElements['textarea']>;
        button: WithFieldName<ReactJSX.IntrinsicElements['button']>;
    }
}
