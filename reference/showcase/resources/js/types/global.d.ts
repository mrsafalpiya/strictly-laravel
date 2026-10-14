// Inertia's shared page props and flash data types are generated from PHP
// (App\Data\SharedProps, App\Data\FlashData) into resources/js/generated/index.ts.

declare module 'react' {
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }

    // CSS custom properties (`style={{ '--sidebar-width': '16rem' }}`) without casting to CSSProperties.
    interface CSSProperties {
        [property: `--${string}`]: string | number | undefined;
    }
}

export {};
