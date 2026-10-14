import type {
    Errors,
    FormDataErrors,
    GlobalEvent,
    GlobalEventNames,
    GlobalEventResult,
    Method,
    ReloadOptions,
    RequestPayload,
    UseFormSubmitOptions,
    UseHttpSubmitOptions,
    VisitOptions,
} from '@inertiajs/core';
import { router, useForm, useHttp } from '@inertiajs/react';
import { useCallback, useLayoutEffect, useRef } from 'react';
import type { InertiaFormProps, SetDataAction } from '@inertiajs/react';
import type { InputKey, InputOf, WithInput, WithResponse } from '@/lib/routes';
import type { RouteDefinition } from '@/wayfinder';

/*
 * Requests typed by the route they go to. Wayfinder brands every route with its controller action's input
 * (InputData / QueryData / config/types.php) and, for JSON endpoints, its response (App\Support\Wayfinder\RouteTypes),
 * so the payload, the validation errors and the response all come from the route — never from a type argument
 * picked by hand. Lint (`type-safety/typed-requests`) rejects Inertia's untyped `router.post(url, data)`,
 * `useForm()` and `useHttp()` elsewhere.
 *
 *     submit(update(route), { status }, { preserveScroll: true });   // payload: UpdateIssueData
 *     visit(destroy(route));                                         // no payload
 *     const form = useRouteForm(store(workspace), defaults);         // data/errors: StoreIssueData
 *     const http = useRouteHttp(search(workspace), { q: null });     // response: SearchResultsData
 */

type Route = RouteDefinition<Method>;

/*
 * The casts this module needs (lint allows them only in such boundary modules):
 *
 * - Inertia's useForm/useHttp constrain their type parameter to FormDataType<T>, which a *type parameter* can't
 *   be shown to satisfy; every concrete input type does (they are generated from PHP Data classes).
 * - Inertia types validation errors as `Record<string, string>`. That they are keyed by the action's input is
 *   what the recorded validation contracts prove for every error the server returns.
 */
const useFormOf = useForm as <TForm extends Record<string, unknown>>(
    data: TForm,
) => InertiaFormProps<TForm>;

const useHttpOf = useHttp as <TForm extends Record<string, unknown>, TResponse>(
    data: TForm,
) => Omit<RouteHttp<TForm, TResponse>, 'submit'> & {
    submit: (
        route: Route,
        options?: UseHttpSubmitOptions<TResponse, TForm>,
    ) => Promise<TResponse>;
};

/**
 * A function that always calls the latest `call` but keeps its identity across renders, so `submit` can sit in
 * effect dependencies without re-running them on every render.
 */
function useStable<TArgs extends unknown[], TResult>(
    call: (...args: TArgs) => TResult,
): (...args: TArgs) => TResult {
    const latest = useRef(call);

    useLayoutEffect(() => {
        latest.current = call;
    });

    return useCallback((...args: TArgs) => latest.current(...args), []);
}

function typedErrors<TInput, TOptions extends { onError?: unknown }>(
    options: WithTypedErrors<TOptions, TInput> | undefined,
): TOptions | undefined {
    const onError = options?.onError;

    return (options && {
        ...options,
        onError:
            onError &&
            ((errors: Errors) => onError(errors as ErrorsOf<TInput>)),
    }) as TOptions | undefined;
}

/**
 * Validation errors of an action, keyed by its input's fields — the only keys the server can report
 * (tests/Support/InertiaContracts.php checks every error key it returns).
 */
export type ErrorsOf<TInput> = Partial<Record<InputKey<TInput>, string>>;

/** Form state of an input: a file field is empty (`null`) until one is picked; the server still requires it. */
export type FormState<TInput> = {
    [K in keyof TInput]: TInput[K] extends File ? TInput[K] | null : TInput[K];
};

type WithTypedErrors<TOptions, TInput> = Omit<TOptions, 'onError'> & {
    onError?: (errors: ErrorsOf<TInput>) => void;
};

export type SubmitOptions<TInput> = WithTypedErrors<
    Omit<VisitOptions, 'method' | 'data'>,
    TInput
>;

/** An Inertia visit sending the action's input: `submit(update(route), { status })`. */
export function submit<TInput extends RequestPayload>(
    route: Route & WithInput<TInput>,
    data: TInput,
    options: SubmitOptions<TInput> = {},
): void {
    router.visit(route, {
        ...typedErrors<TInput, Omit<VisitOptions, 'method' | 'data'>>(options),
        method: route.method,
        data,
    });
}

/**
 * An Inertia visit without a payload: a GET (its query is typed by the route: `index(workspace, { query })`),
 * or an action that takes no input (`destroy(route)`). A route that takes a payload must use `submit()`.
 */
export function visit<TRoute extends Route>(
    route: TRoute &
        (TRoute['method'] extends 'get'
            ? unknown
            : [InputOf<TRoute>] extends [never]
              ? unknown
              : { __takesPayload: 'use submit(route, data)' }),
    options: Omit<VisitOptions, 'method' | 'data'> = {},
): void {
    router.visit(route, { ...options, method: route.method });
}

/** Reloads the current page (`reload({ only: page.only('comments') })`). */
export function reload(options: ReloadOptions = {}): void {
    router.reload(options);
}

/**
 * Follows a URL the *server* sent (a redirect target in a JSON response). URLs the client builds come from
 * Wayfinder routes: `visit(route)`.
 */
export function followServerUrl(url: string): void {
    router.visit(url);
}

/** Listens to a router event; `'flash'` events carry the generated FlashData. */
export function onRouterEvent<TEventName extends GlobalEventNames>(
    type: TEventName,
    callback: (event: GlobalEvent<TEventName>) => GlobalEventResult<TEventName>,
): VoidFunction {
    return router.on(type, callback);
}

/** Forgets every cached page and prefetch (on logout). */
export function flushCache(): void {
    router.flushAll();
}

type Submitters = 'submit' | 'get' | 'post' | 'put' | 'patch' | 'delete';

export type RouteForm<TInput extends Record<string, unknown>> = Omit<
    InertiaFormProps<FormState<TInput>>,
    Submitters | 'withPrecognition'
> & {
    /** Submits to the route the form was made for. */
    submit: (options?: WithTypedErrors<UseFormSubmitOptions, TInput>) => void;
};

/**
 * `useForm()` for one route: its data and errors are the action's input type, and `submit()` sends them there.
 * Send the initial state from the page, typed as the input class (`public StoreIssueData $defaults`).
 */
export function useRouteForm<TInput extends Record<string, unknown>>(
    route: Route & WithInput<TInput>,
    defaults: FormState<TInput>,
): RouteForm<TInput> {
    const form = useFormOf(defaults);
    const submit = useStable(
        (options?: WithTypedErrors<UseFormSubmitOptions, TInput>) =>
            form.submit(
                route,
                typedErrors<TInput, UseFormSubmitOptions>(options),
            ),
    );

    return { ...form, submit };
}

export type RouteHttp<TInput extends Record<string, unknown>, TResponse> = {
    data: TInput;
    setData: SetDataAction<TInput>;
    errors: FormDataErrors<TInput>;
    processing: boolean;
    /** The last successful response (null before the first one). */
    response: TResponse | null;
    cancel: () => void;
    /** Calls the route; resolves with its declared response type. */
    submit: (
        options?: UseHttpSubmitOptions<TResponse, TInput>,
    ) => Promise<TResponse>;
};

/**
 * `useHttp()` for one JSON endpoint: request data from the route's input, the response from the type its
 * controller declares (or config/types.php for controllers you don't own). Without a declared response the
 * response is `unknown`, so it can't be used without checking it.
 */
export function useRouteHttp<
    TInput extends Record<string, unknown>,
    TResponse = unknown,
>(
    route: Route & WithInput<TInput> & WithResponse<TResponse>,
    defaults: TInput,
): RouteHttp<TInput, TResponse> {
    const http = useHttpOf<TInput, TResponse>(defaults);
    const submit = useStable(
        (options?: UseHttpSubmitOptions<TResponse, TInput>) =>
            http.submit(route, options),
    );

    return { ...http, submit };
}
