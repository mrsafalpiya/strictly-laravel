// @ts-check
/**
 * The Strictly Laravel oxlint plugin. `strictly:install` registers it in the app's Vite+ lint config
 * (vite.config.ts → lint.jsPlugins) and turns every rule on as an error; suppress one only with a written reason
 * (ADR-0007). oxlint's JS plugins get no type information, so the rules match syntax (P-070).
 *
 * @import { Context, Plugin, Rule, ESTree, Visitor } from '@oxlint/plugins'
 */

/**
 * The text a string literal or a template literal starts with, or null for anything else.
 *
 * @param {ESTree.Node | null | undefined} node
 * @returns {string | null}
 */
function leadingText(node) {
    if (node?.type === 'Literal' && typeof node.value === 'string') {
        return node.value;
    }

    if (node?.type === 'TemplateLiteral') {
        return node.quasis[0]?.value.cooked ?? null;
    }

    return null;
}

/**
 * @param {ESTree.Node | null | undefined} node
 * @returns {string | null}
 */
function nameOf(node) {
    if (node?.type === 'Identifier' || node?.type === 'JSXIdentifier') {
        return node.name;
    }

    return null;
}

/**
 * `location` or `<anything>.location`.
 *
 * @param {ESTree.Node} node
 */
function isLocation(node) {
    return nameOf(node) === 'location' || (node.type === 'MemberExpression' && nameOf(node.property) === 'location');
}

/** Callees whose first argument is a URL: `visit(url)`, `fetch(url)`. */
const urlFunctions = new Set(['visit', 'fetch']);

/**
 * P-007: URLs come from Wayfinder (`@/routes/…`, `@/actions/…`), so a renamed or removed route fails to compile. A
 * string that starts with a single `/` (an app-relative path) where a URL is expected is rejected: in `href` and
 * `action` attributes, as the first argument of `visit`, `fetch`, `router.*`, `location.assign` and `location.replace`,
 * as either of the first two arguments of `submit` (Inertia's `form.submit(method, url)`), and assigned to `location`
 * or `.href`. Both branches of `??`, `||` and `? :` are checked, as is
 * the left side of a `+` concatenation.
 *
 * @type {Rule}
 */
const noHardcodedUrls = {
    meta: {
        type: 'problem',
        docs: { description: 'Use Wayfinder route functions instead of hard-coded URLs.' },
    },
    create(context) {
        /** @param {ESTree.Node | null | undefined} node */
        const check = (node) => {
            if (node?.type === 'LogicalExpression') {
                check(node.left);
                check(node.right);
            } else if (node?.type === 'ConditionalExpression') {
                check(node.consequent);
                check(node.alternate);
            } else if (node?.type === 'BinaryExpression' && node.operator === '+') {
                check(node.left);
            } else if (node?.type === 'JSXExpressionContainer') {
                check(node.expression);
            } else if (node !== null && node !== undefined) {
                const text = leadingText(node);

                if (text !== null && /^\/(?!\/)/.test(text)) {
                    context.report({
                        node,
                        message: `Hard-coded URL "${text}": use the Wayfinder route function (\`@/routes/…\` or \`@/actions/…\`) so a renamed or removed route fails to compile.`,
                    });
                }
            }
        };

        return {
            JSXAttribute(node) {
                const name = nameOf(node.name);

                if (name === 'href' || name === 'action') {
                    check(node.value);
                }
            },
            CallExpression(node) {
                const callee = node.callee;
                const takesUrl =
                    urlFunctions.has(nameOf(callee) ?? '') ||
                    (callee.type === 'MemberExpression' &&
                        (nameOf(callee.object) === 'router' ||
                            (isLocation(callee.object) && ['assign', 'replace'].includes(nameOf(callee.property) ?? ''))));

                if (takesUrl) {
                    check(node.arguments[0]);
                } else if (nameOf(callee) === 'submit' || (callee.type === 'MemberExpression' && nameOf(callee.property) === 'submit')) {
                    // Inertia's `form.submit(method, url)`; also a `submit(url, …)` helper.
                    check(node.arguments[0]);
                    check(node.arguments[1]);
                }
            },
            AssignmentExpression(node) {
                const target = node.left;

                if (
                    nameOf(target) === 'location' ||
                    (target.type === 'MemberExpression' && ['href', 'location'].includes(nameOf(target.property) ?? ''))
                ) {
                    check(node.right);
                }
            },
        };
    },
};

/** Where `forPage()` comes from, as the messages name it. */
const reactHelpers = '@mrsafalpiya/strictly-laravel/react';

/**
 * The key of a non-computed object property (`only` in `{ only: … }` or `{ 'only': … }`), or null.
 *
 * @param {ESTree.Node} node
 * @returns {string | null}
 */
function propertyKey(node) {
    if (node.type !== 'Property' || node.computed) {
        return null;
    }

    return nameOf(node.key) ?? (node.key.type === 'Literal' && typeof node.key.value === 'string' ? node.key.value : null);
}

/**
 * Whether a value is a call to a method named $method on anything: `page.only('stats')` for `only`.
 *
 * @param {ESTree.Node | null | undefined} node
 * @param {string} method
 */
function isMethodCall(node, method) {
    const value = node?.type === 'JSXExpressionContainer' ? node.expression : node;

    return value?.type === 'CallExpression' && value.callee.type === 'MemberExpression' && nameOf(value.callee.property) === method;
}

/**
 * Report every `<key>: …` property and `<key>={…}` JSX attribute whose value isn't a `<page>.<key>(…)` call.
 *
 * @param {Context} context
 * @param {Set<string>} keys
 * @param {(key: string) => string} message
 * @returns {Visitor}
 */
function requireTypedValue(context, keys, message) {
    return {
        Property(node) {
            const key = propertyKey(node);

            if (key !== null && keys.has(key) && !isMethodCall(node.value, key)) {
                context.report({ node: node.value, message: message(key) });
            }
        },
        JSXAttribute(node) {
            const key = nameOf(node.name);

            if (key !== null && keys.has(key) && !isMethodCall(node.value, key)) {
                context.report({ node, message: message(key) });
            }
        },
    };
}

/**
 * P-045: prop names for partial reloads (`only`, `except`, `reset`, in a visit's options or on `<Link>`) must come from
 * `forPage<'component'>()`, so each is checked against the page's props and a renamed prop fails to compile. A literal
 * list, a `satisfies` list or a variable is rejected.
 *
 * @type {Rule}
 */
const typedPropNames = {
    meta: {
        type: 'problem',
        docs: { description: 'Prop names for partial reloads must come from forPage<…>() so they are type-checked.' },
    },
    create(context) {
        return requireTypedValue(
            context,
            new Set(['only', 'except', 'reset']),
            (key) =>
                `\`${key}\` must be \`page.${key}(…)\` with \`const page = forPage<'component'>()\` from '${reactHelpers}', so a renamed prop fails to compile.`,
        );
    },
};

/** Inertia's components that name props with plain strings, which forPage() returns typed. */
const untypedComponents = new Set(['Deferred', 'WhenVisible', 'InfiniteScroll']);

/**
 * P-045: Inertia's `<Deferred>`, `<WhenVisible>` and `<InfiniteScroll>` take any string in `data`; the ones
 * `forPage<'component'>()` returns take only the page's prop names. Importing (or re-exporting) Inertia's is rejected.
 *
 * @type {Rule}
 */
const typedInertiaComponents = {
    meta: {
        type: 'problem',
        docs: { description: "Use forPage<…>()'s typed Deferred, WhenVisible and InfiniteScroll instead of Inertia's." },
    },
    create(context) {
        /** @param {ESTree.ImportDeclaration | ESTree.ExportNamedDeclaration} node */
        const check = (node) => {
            if (node.source?.value !== '@inertiajs/react') {
                return;
            }

            for (const specifier of node.specifiers) {
                const imported = specifier.type === 'ImportSpecifier' ? specifier.imported : specifier.type === 'ExportSpecifier' ? specifier.local : null;
                const name = nameOf(imported);

                if (name !== null && untypedComponents.has(name)) {
                    context.report({
                        node: specifier,
                        message: `Use \`page.${name}\` from \`const page = forPage<'component'>()\` ('${reactHelpers}') instead of Inertia's untyped \`${name}\`, so its \`data\` must name a prop of the page.`,
                    });
                }
            }
        };

        return { ImportDeclaration: check, ExportNamedDeclaration: check };
    },
};

/**
 * P-059: `usePage().props` is typed from the generated shared props (the app's shared props Data class) and, for a
 * page's own props, `PageProps<'component'>`. Inertia's `usePage<T>()` trusts any type it is given, so a hand-written
 * one (`usePage<{ features: { boards: boolean } }>()`) types a server setting or feature flag nothing sends. A type
 * argument on Inertia's `usePage` (imported by name, renamed or through a namespace import) is rejected unless it is
 * exactly a generated `PageProps<…>`.
 *
 * @type {Rule}
 */
const typedPageProps = {
    meta: {
        type: 'problem',
        docs: { description: "Type usePage() from the generated shared props and Page classes, not a hand-written type argument." },
    },
    create(context) {
        /** Local names of Inertia's `usePage`, and of namespace imports of `@inertiajs/react`. */
        const usePageNames = new Set();
        const namespaces = new Set();

        return {
            ImportDeclaration(node) {
                if (node.source.value !== '@inertiajs/react') {
                    return;
                }

                for (const specifier of node.specifiers) {
                    if (specifier.type === 'ImportNamespaceSpecifier') {
                        namespaces.add(specifier.local.name);
                    } else if (specifier.type === 'ImportSpecifier' && nameOf(specifier.imported) === 'usePage') {
                        usePageNames.add(specifier.local.name);
                    }
                }
            },
            CallExpression(node) {
                const callee = node.callee;
                const isUsePage =
                    usePageNames.has(nameOf(callee) ?? '') ||
                    (callee.type === 'MemberExpression' && !callee.computed && namespaces.has(nameOf(callee.object) ?? '') && nameOf(callee.property) === 'usePage');
                const typeArgument = node.typeArguments?.params[0];

                if (!isUsePage || typeArgument === undefined) {
                    return;
                }

                const isGeneratedPageProps =
                    typeArgument.type === 'TSTypeReference' && nameOf(typeArgument.typeName) === 'PageProps' && (typeArgument.typeArguments?.params.length ?? 0) > 0;

                if (!isGeneratedPageProps) {
                    context.report({
                        node: node.typeArguments ?? node,
                        message:
                            "`usePage()` takes its props' type from the generated shared props and Page classes: drop the type argument. A server setting or feature flag every page needs is a property of the shared props Data class (App\\Data\\SharedProps); a page's own props are `PageProps<'component'>` from `@/generated`.",
                    });
                }
            },
        };
    },
};

/**
 * P-045: an optimistic update receives the page's props and returns the ones to change. Inertia types those props as
 * an index signature, and `router.optimistic<TProps>()` trusts any type it is given, so a renamed prop silently
 * updates nothing. Rejects `router.optimistic()` and an `optimistic` option or `<Form optimistic>` that isn't
 * `page.optimistic(…)`.
 *
 * @type {Rule}
 */
const typedOptimisticUpdates = {
    meta: {
        type: 'problem',
        docs: { description: 'Optimistic updates must come from forPage<…>().optimistic() so they are typed by the page.' },
    },
    create(context) {
        const typed = requireTypedValue(
            context,
            new Set(['optimistic']),
            () => `\`optimistic\` must be \`page.optimistic(…)\` with \`const page = forPage<'component'>()\` from '${reactHelpers}', so the props it reads and returns are the page's.`,
        );

        return {
            ...typed,
            CallExpression(node) {
                const callee = node.callee;

                if (callee.type === 'MemberExpression' && nameOf(callee.object) === 'router' && nameOf(callee.property) === 'optimistic') {
                    context.report({
                        node,
                        message: `\`router.optimistic()\` trusts any props type: pass \`optimistic: page.optimistic(…)\` (\`const page = forPage<'component'>()\` from '${reactHelpers}') in the visit's options.`,
                    });
                }
            },
        };
    },
};

/** The modules Inertia's request APIs are imported from. */
const inertiaModules = new Set(['@inertiajs/react', '@inertiajs/core']);

/** `router.<method>()` calls that send a request, with the typed helper to use instead. */
const untypedRouterMethods = new Map([
    ['get', 'visit(route)'],
    ['post', 'submit(route, data)'],
    ['put', 'submit(route, data)'],
    ['patch', 'submit(route, data)'],
    ['delete', 'visit(route)` (or `submit(route, data)` when the action takes an input'],
]);

/**
 * P-014: requests go through the typed helpers of `@mrsafalpiya/strictly-laravel/react`, which take the payload, the
 * error keys and the target from the Wayfinder route (`useRouteForm(route, defaults)`, `submit(route, data)`,
 * `visit(route)`). Inertia's own request APIs accept any payload, so they are rejected when imported from
 * `@inertiajs/react` or `@inertiajs/core` (by name, renamed or through a namespace import): `useForm()`, `useHttp()`
 * (P-048: `useRouteHttp(route, init)` types a JSON endpoint's response), `router.get/post/put/patch/delete()`, `router.visit()` given `data` or `method`, and `<Link data>`. Other router
 * methods (`reload`, `on`, `visit(route)` alone) stay allowed. Matching is syntactic: an alias such as
 * `const r = router` escapes it (P-070).
 *
 * @type {Rule}
 */
const typedRequests = {
    meta: {
        type: 'problem',
        docs: { description: "Send requests through the route-typed helpers instead of Inertia's untyped request APIs." },
    },
    create(context) {
        /** Local name → imported name, for the names imported from an Inertia module. */
        const imported = new Map();
        /** Local names of namespace imports of an Inertia module. */
        const namespaces = new Set();

        /**
         * The Inertia export a node refers to (`useForm`, `router`, `Link`), or null.
         *
         * @param {ESTree.Node} node
         * @returns {string | null}
         */
        const inertiaExport = (node) => {
            const name = nameOf(node);

            if (name !== null) {
                return imported.get(name) ?? null;
            }

            if (node.type === 'MemberExpression' && !node.computed && namespaces.has(nameOf(node.object) ?? '')) {
                return nameOf(node.property);
            }

            if (node.type === 'JSXMemberExpression' && namespaces.has(nameOf(node.object) ?? '')) {
                return nameOf(node.property);
            }

            return null;
        };

        return {
            ImportDeclaration(node) {
                if (!inertiaModules.has(String(node.source.value))) {
                    return;
                }

                for (const specifier of node.specifiers) {
                    if (specifier.type === 'ImportNamespaceSpecifier') {
                        namespaces.add(specifier.local.name);
                    } else if (specifier.type === 'ImportSpecifier') {
                        const name = nameOf(specifier.imported) ?? (specifier.imported.type === 'Literal' ? String(specifier.imported.value) : null);

                        if (name !== null) {
                            imported.set(specifier.local.name, name);
                        }
                    }
                }
            },
            CallExpression(node) {
                const callee = node.callee;

                if (inertiaExport(callee) === 'useForm') {
                    context.report({
                        node,
                        message:
                            "Inertia's `useForm()` is untyped: use `useRouteForm(route, defaults)` from `@mrsafalpiya/strictly-laravel/react`, which takes the payload and error keys from the route.",
                    });

                    return;
                }

                if (inertiaExport(callee) === 'useHttp') {
                    context.report({
                        node,
                        message:
                            "Inertia's `useHttp()` is untyped: use `useRouteHttp(route, init)` from `@mrsafalpiya/strictly-laravel/react`, which takes the request from the route's input and the response from the Data class its action returns.",
                    });

                    return;
                }

                if (callee.type !== 'MemberExpression' || inertiaExport(callee.object) !== 'router') {
                    return;
                }

                const method = nameOf(callee.property) ?? '';
                const helper = untypedRouterMethods.get(method);

                if (helper !== undefined) {
                    context.report({
                        node,
                        message: `\`router.${method}()\` is untyped: use \`${helper}\` from \`@mrsafalpiya/strictly-laravel/react\`, which takes the payload and target from the route.`,
                    });
                } else if (method === 'visit') {
                    const options = node.arguments[1];
                    const sendsPayload =
                        options?.type === 'ObjectExpression' &&
                        options.properties.some(
                            (property) => property.type === 'Property' && ['data', 'method'].includes(nameOf(property.key) ?? ''),
                        );

                    if (sendsPayload) {
                        context.report({
                            node,
                            message:
                                '`router.visit()` with `data` or `method` is untyped: use `submit(route, data)` or `visit(route)` from `@mrsafalpiya/strictly-laravel/react`, which take the payload and method from the route.',
                        });
                    }
                }
            },
            JSXOpeningElement(node) {
                if (inertiaExport(node.name) !== 'Link') {
                    return;
                }

                for (const attribute of node.attributes) {
                    if (attribute.type === 'JSXAttribute' && nameOf(attribute.name) === 'data') {
                        context.report({
                            node: attribute,
                            message:
                                '`<Link data>` is untyped: send a payload with `submit(route, data)` from `@mrsafalpiya/strictly-laravel/react`, which takes its type from the route.',
                        });
                    }
                }
            },
        };
    },
};

/** What the form rules point to. */
const typedForm = `\`<TypedForm {...route.form()}>\` from \`${reactHelpers}\``;

/**
 * P-096: forms go through `<TypedForm {...route.form()}>`, which takes the payload, the field names and the error keys
 * from the Wayfinder route. Inertia's `<Form>` takes any of them, so importing or re-exporting it from
 * `@inertiajs/react`, or using it through a namespace import (`<Inertia.Form>`), is rejected.
 *
 * P-100: the payload comes from the route, never from a type argument. `<TypedForm<LoginData> {...store.form()}>`
 * names it by hand, which nothing checks against what the server validates, so a type argument on `<TypedForm>` (or
 * an alias of it) is rejected too. A vendor route gets its payload from config/strictly.php instead.
 *
 * @type {Rule}
 */
const typedForms = {
    meta: {
        type: 'problem',
        docs: { description: "Use <TypedForm> instead of Inertia's untyped <Form>, and let it take its payload from the route." },
    },
    create(context) {
        const message = `Inertia's \`<Form>\` is untyped: use ${typedForm}, which takes the payload, the field names and the error keys from the route.`;
        const typeArgumentMessage =
            "`<TypedForm>`'s payload comes from the route it submits to: drop the type argument. A route without an input brand takes an input class in its action, or, for a vendor action, the one config/strictly.php declares for it (`vendor_inputs`).";
        /** Local names of namespace imports of `@inertiajs/react`. */
        const namespaces = new Set();
        /** Local names `<TypedForm>` is used under: its own and any alias it is imported as. */
        const formNames = new Set(['TypedForm']);

        /** @param {ESTree.ImportDeclaration | ESTree.ExportNamedDeclaration} node */
        const check = (node) => {
            if (node.type === 'ImportDeclaration' && node.source?.value === reactHelpers) {
                for (const specifier of node.specifiers) {
                    if (specifier.type === 'ImportSpecifier' && nameOf(specifier.imported) === 'TypedForm') {
                        formNames.add(specifier.local.name);
                    }
                }
            }

            if (node.source?.value !== '@inertiajs/react') {
                return;
            }

            for (const specifier of node.specifiers) {
                if (specifier.type === 'ImportNamespaceSpecifier') {
                    namespaces.add(specifier.local.name);

                    continue;
                }

                const imported = specifier.type === 'ImportSpecifier' ? specifier.imported : specifier.type === 'ExportSpecifier' ? specifier.local : null;

                if (nameOf(imported) === 'Form') {
                    context.report({ node: specifier, message });
                }
            }
        };

        return {
            ImportDeclaration: check,
            ExportNamedDeclaration: check,
            JSXOpeningElement(node) {
                if (node.name.type === 'JSXMemberExpression' && namespaces.has(nameOf(node.name.object) ?? '') && nameOf(node.name.property) === 'Form') {
                    context.report({ node, message });
                }

                const typeArguments = 'typeArguments' in node ? node.typeArguments : null;

                if (typeArguments && formNames.has(nameOf(node.name) ?? '')) {
                    context.report({ node: typeArguments, message: typeArgumentMessage });
                }
            },
        };
    },
};

/**
 * P-015: a form control's name comes from `field()` in `<TypedForm>`'s render prop, a `FieldName` checked against the
 * route's input. `tsc` enforces it on raw controls and on components that declare `name` as a FieldName (the app's
 * JSX types, ADR-0004); this rule is the backstop for third-party components that type `name` as a plain string:
 * inside `<TypedForm>`, a literal `name` on any element is rejected (the form element's own attributes aside).
 *
 * @type {Rule}
 */
const typedFormFields = {
    meta: {
        type: 'problem',
        docs: { description: 'Field names inside <TypedForm> must come from field() so they are type-checked.' },
    },
    create(context) {
        /** Local names `<TypedForm>` is used under: its own and any alias it is imported as. */
        const formNames = new Set(['TypedForm']);
        let depth = 0;

        /** @param {ESTree.Node} node */
        const isTypedForm = (node) => node.type === 'JSXElement' && formNames.has(nameOf(node.openingElement.name) ?? '');

        return {
            ImportDeclaration(node) {
                for (const specifier of node.specifiers) {
                    if (specifier.type === 'ImportSpecifier' && nameOf(specifier.imported) === 'TypedForm') {
                        formNames.add(specifier.local.name);
                    }
                }
            },
            JSXElement(node) {
                if (isTypedForm(node)) {
                    depth++;
                }
            },
            'JSXElement:exit'(node) {
                if (isTypedForm(node)) {
                    depth--;
                }
            },
            JSXOpeningElement(node) {
                if (depth === 0 || formNames.has(nameOf(node.name) ?? '')) {
                    return;
                }

                for (const attribute of node.attributes) {
                    if (attribute.type !== 'JSXAttribute' || nameOf(attribute.name) !== 'name') {
                        continue;
                    }

                    const value = attribute.value?.type === 'JSXExpressionContainer' ? attribute.value.expression : attribute.value;
                    const text = leadingText(value);

                    if (text !== null) {
                        context.report({
                            node: attribute,
                            message: `Untyped field name "${text}": use \`name={field('…')}\` from \`<TypedForm>\`'s render prop, so it is checked against the route's input.`,
                        });
                    }
                }
            },
        };
    },
};

const lintDirective =/^(?:oxlint|eslint)-disable(?:-next-line|-line)?(?=\s|$)/;
const tsDirective = /^@ts-(?:expect-error|ignore|nocheck)(?=[\s:]|$)/;

/**
 * ADR-0007: a suppression is the only way out of a check, so it must say why. Rejects an `oxlint-disable…` or
 * `eslint-disable…` comment that names no rule or has no ` -- reason` after the rule names, and a `@ts-expect-error`,
 * `@ts-ignore` or `@ts-nocheck` with no reason after the directive (`// @ts-expect-error: why` or `-- why`).
 *
 * @type {Rule}
 */
const requireSuppressionReason = {
    meta: {
        type: 'problem',
        docs: { description: 'Suppressions must name what they suppress and give a written reason.' },
    },
    create(context) {
        return {
            Program() {
                for (const comment of context.sourceCode.getAllComments()) {
                    const text = comment.value.trim();
                    const lint = lintDirective.exec(text);

                    if (lint !== null) {
                        const rest = text.slice(lint[0].length);
                        const separator = /(?:^|\s)--(?:\s|$)/.exec(rest);
                        const rules = (separator === null ? rest : rest.slice(0, separator.index)).trim();
                        const reason = separator === null ? '' : rest.slice(separator.index + separator[0].length).trim();

                        if (rules === '') {
                            context.report({
                                node: comment,
                                message: `\`${lint[0]}\` must name the rules it suppresses and give a reason: \`${lint[0]} <rule> -- <why>\`.`,
                            });
                        } else if (reason === '') {
                            context.report({
                                node: comment,
                                message: `\`${lint[0]}\` needs a written reason: \`${lint[0]} ${rules} -- <why>\`.`,
                            });
                        }

                        continue;
                    }

                    const ts = tsDirective.exec(text);

                    if (ts !== null && text.slice(ts[0].length).replace(/^[\s:-]+/, '').trim() === '') {
                        context.report({
                            node: comment,
                            message: `\`${ts[0]}\` needs a written reason: \`// ${ts[0]}: <why>\`.`,
                        });
                    }
                }
            },
        };
    },
};

/** Echo's React hooks that listen for an event by any name, with a payload type the caller names. */
const untypedEchoHooks = new Set(['useEcho', 'useEchoPresence', 'useEchoPublic']);

/**
 * P-142: Echo's React hooks that read a framework broadcast (a notification's `toBroadcast()`, a model's
 * `BroadcastsEvents`), whose payload no Data class types, keyed by what the app broadcasts alongside instead.
 */
const frameworkBroadcastHooks = new Map([
    ['useEchoNotification', { reads: "a broadcast notification's", alongside: 'the notification' }],
    ['useEchoModel', { reads: "a model broadcast's", alongside: 'the model change' }],
]);

/** P-145: Echo's React hook that hands out a presence channel, whose members' data its callbacks type by hand. */
const untypedPresenceHook = 'usePresenceChannel';

/**
 * P-145: whether a call to Echo's `useChannel()` asks for a presence channel (`useChannel(name, 'presence')`), which
 * hands it out as `usePresenceChannel()` does. Another visibility, or one only known at runtime, is left alone.
 *
 * @param {ESTree.CallExpression} node
 */
function joinsPresence(node) {
    const visibility = node.arguments[1];

    if (visibility === undefined) {
        return false;
    }

    if (visibility.type === 'Literal') {
        return visibility.value === 'presence';
    }

    return visibility.type === 'TemplateLiteral' && visibility.expressions.length === 0 && visibility.quasis[0]?.value.cooked === 'presence';
}

/**
 * P-052, P-053, P-142, P-145: broadcast events are listened for through `useChannelEvent(channel, event, callback)` from
 * `@/generated/broadcasting`, which takes only an event the app broadcasts and types its payload from the event's Data
 * class. Echo's own `useEcho()`, `useEchoPresence()` and `useEchoPublic()` take any event name and any payload type,
 * and its `useEchoNotification()` and `useEchoModel()` read broadcast notifications and model broadcasts, whose
 * payloads have no generated type, so calling any of them when imported from `@laravel/echo-react` (by name, renamed or
 * through a namespace import) is rejected: a notification or model change broadcasts an app event with a
 * `BroadcastsData` payload alongside. A presence channel's members are followed through `usePresence(channel, { here,
 * joining, leaving })`, which types them from the Data class the channel's callback returns, so Echo's
 * `usePresenceChannel()`, whose channel's `here()`, `joining()` and `leaving()` take hand-typed members, is rejected
 * too, and so is its `useChannel(name, 'presence')`, which hands out the same channel. Its other hooks stay allowed:
 * channels and connection state carry no typed data.
 *
 * @type {Rule}
 */
const typedBroadcasts = {
    meta: {
        type: 'problem',
        docs: { description: "Listen for broadcast events through useChannelEvent(), and follow presence members through usePresence(), instead of Echo's untyped hooks." },
    },
    create(context) {
        /** Local name → imported name, for the hooks imported from `@laravel/echo-react`. */
        const imported = new Map();
        /** Local names of namespace imports of `@laravel/echo-react`. */
        const namespaces = new Set();

        return {
            ImportDeclaration(node) {
                if (node.source.value !== '@laravel/echo-react') {
                    return;
                }

                for (const specifier of node.specifiers) {
                    if (specifier.type === 'ImportNamespaceSpecifier') {
                        namespaces.add(specifier.local.name);
                    } else if (specifier.type === 'ImportSpecifier') {
                        const name = nameOf(specifier.imported) ?? (specifier.imported.type === 'Literal' ? String(specifier.imported.value) : null);

                        if (name !== null) {
                            imported.set(specifier.local.name, name);
                        }
                    }
                }
            },
            CallExpression(node) {
                const callee = node.callee;
                const local = nameOf(callee);
                const hook =
                    local !== null
                        ? imported.get(local)
                        : callee.type === 'MemberExpression' && !callee.computed && namespaces.has(nameOf(callee.object) ?? '')
                          ? nameOf(callee.property)
                          : null;

                if (hook === null || hook === undefined) {
                    return;
                }

                const framework = frameworkBroadcastHooks.get(hook);

                if (untypedEchoHooks.has(hook)) {
                    context.report({
                        node,
                        message: `Echo's \`${hook}()\` takes any event name and a hand-typed payload: use \`useChannelEvent(channel, event, callback)\` from \`@/generated/broadcasting\`, which takes only an event the app broadcasts and types its payload from the event's Data class.`,
                    });
                } else if (hook === untypedPresenceHook || (hook === 'useChannel' && joinsPresence(node))) {
                    context.report({
                        node,
                        message: `Echo's \`${hook === untypedPresenceHook ? `${hook}()` : "useChannel(name, 'presence')"}\` hands out a presence channel whose members are typed by hand: use \`usePresence(channel, { here, joining, leaving })\` from \`@/generated/broadcasting\`, which types its members from the Data class the channel's callback returns.`,
                    });
                } else if (framework !== undefined) {
                    context.report({
                        node,
                        message: `Echo's \`${hook}()\` reads ${framework.reads} hand-typed payload: broadcast an app event with a \`BroadcastsData\` payload alongside ${framework.alongside}, and listen for it with \`useChannelEvent(channel, event, callback)\` from \`@/generated/broadcasting\`, which types its payload from the event's Data class.`,
                    });
                }
            },
        };
    },
};

/** @type {Plugin} */
export default {
    meta: { name: 'strictly' },
    rules: {
        'no-hardcoded-urls': noHardcodedUrls,
        'require-suppression-reason': requireSuppressionReason,
        'typed-broadcasts': typedBroadcasts,
        'typed-form-fields': typedFormFields,
        'typed-forms': typedForms,
        'typed-inertia-components': typedInertiaComponents,
        'typed-optimistic-updates': typedOptimisticUpdates,
        'typed-page-props': typedPageProps,
        'typed-prop-names': typedPropNames,
        'typed-requests': typedRequests,
    },
};
