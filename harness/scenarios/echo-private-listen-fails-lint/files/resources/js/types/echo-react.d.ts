// The fixture app doesn't install @laravel/echo-react, which `php artisan install:broadcasting` adds to an app that
// broadcasts. Unresolved, every value the component takes from it is an error type, which the type-aware rules against
// an unsafe `any` reject (P-175, P-193), so they would report it next to the rule this scenario shows. This declares the
// part of its 2.6 API the component calls, as its own types do.
declare module '@laravel/echo-react' {
    interface PrivateChannel {
        listen(event: string, callback: CallableFunction): PrivateChannel;
    }

    export const echo: () => {
        private(channel: string): PrivateChannel;
        leave(channel: string): void;
    };
}
