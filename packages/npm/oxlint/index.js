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

const lintDirective = /^(?:oxlint|eslint)-disable(?:-next-line|-line)?(?=\s|$)/;
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

/** @type {Plugin} */
export default {
    meta: { name: 'strictly' },
    rules: {
        'no-hardcoded-urls': noHardcodedUrls,
        'require-suppression-reason': requireSuppressionReason,
        'typed-inertia-components': typedInertiaComponents,
        'typed-optimistic-updates': typedOptimisticUpdates,
        'typed-prop-names': typedPropNames,
    },
};
