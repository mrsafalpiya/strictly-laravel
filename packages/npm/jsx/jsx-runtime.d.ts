/*
 * The app's JSX types (ADR-0004). `strictly:install` points tsconfig.json's `jsxImportSource` here: they are React's,
 * except that the `name` of a form control the browser submits (`<input>`, `<select>`, `<textarea>`, `<button>`) must
 * be a FieldName, which only `field()` in `<TypedForm>`'s render prop mints. So `<input name="title">`, a name held in
 * a `string`, and a component that passes its own `name: string` through to one fail `tsc`; a component that forwards
 * a name declares it as `name?: FieldName` (P-015).
 *
 * Types only. The installer pins the Vite React plugin to React's own runtime (`react({ jsxImportSource: 'react' })`),
 * so the compiled JSX is unchanged (P-016).
 */
import type { JSX as ReactJSX } from 'react';

import type { FieldName } from '../routes/index.js';

export { Fragment, jsx, jsxs } from 'react/jsx-runtime';

type FormControl = 'input' | 'select' | 'textarea' | 'button';

type WithFieldName<TProps> = Omit<TProps, 'name'> & { name?: FieldName | undefined };

export declare namespace JSX {
    type ElementType = ReactJSX.ElementType;
    interface Element extends ReactJSX.Element {}
    interface ElementClass extends ReactJSX.ElementClass {}
    interface ElementAttributesProperty extends ReactJSX.ElementAttributesProperty {}
    interface ElementChildrenAttribute extends ReactJSX.ElementChildrenAttribute {}
    type LibraryManagedAttributes<C, P> = ReactJSX.LibraryManagedAttributes<C, P>;
    interface IntrinsicAttributes extends ReactJSX.IntrinsicAttributes {}
    interface IntrinsicClassAttributes<T> extends ReactJSX.IntrinsicClassAttributes<T> {}
    interface IntrinsicElements extends Omit<ReactJSX.IntrinsicElements, FormControl> {
        input: WithFieldName<ReactJSX.IntrinsicElements['input']>;
        select: WithFieldName<ReactJSX.IntrinsicElements['select']>;
        textarea: WithFieldName<ReactJSX.IntrinsicElements['textarea']>;
        button: WithFieldName<ReactJSX.IntrinsicElements['button']>;
    }
}
