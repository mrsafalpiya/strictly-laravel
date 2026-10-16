// The fixture app doesn't install @laravel/echo-react, which `php artisan install:broadcasting` adds to an app that
// broadcasts. Unresolved, every value the component takes from it is an error type, which the type-aware rules against
// an unsafe `any` reject (P-175, P-193). This declares the part of its 2.6 API the component calls, as its own types
// do; with the real package installed (the Testbed App) the component passes lint as well.
declare module '@laravel/echo-react' {
    interface PrivateChannel {
        listenForWhisper(
            event: string,
            callback: CallableFunction,
        ): PrivateChannel;
        stopListeningForWhisper(
            event: string,
            callback?: CallableFunction,
        ): PrivateChannel;
        whisper(
            eventName: string,
            data: Record<string, unknown>,
        ): PrivateChannel;
    }

    export function useChannel(channelName: string): {
        leaveChannel: (leaveAll?: boolean) => void;
        channel: () => PrivateChannel | null;
    };

    export const echo: () => {
        private(channel: string): PrivateChannel;
        socketId(): string | undefined;
    };
}
