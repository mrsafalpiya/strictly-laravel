import type { ComponentProps } from 'react';

export default function TextField(props: ComponentProps<'input'>) {
    return <input className="text-field" {...props} />;
}
