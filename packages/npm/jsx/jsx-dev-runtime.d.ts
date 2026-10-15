// The app's JSX types under `"jsx": "react-jsxdev"`: the same narrowed JSX namespace as jsx-runtime.d.ts (ADR-0004).
export type { JSX } from './jsx-runtime.js';
export { Fragment, jsxDEV } from 'react/jsx-dev-runtime';
