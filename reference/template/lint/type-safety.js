/**
 * Lint rules for the places where Inertia identifies props or form fields with plain strings, which
 * TypeScript can't check on its own. Loaded by oxlint (vite.config.ts → lint.jsPlugins).
 */

const isStringLiteral = (node) =>
    (node?.type === 'Literal' && typeof node.value === 'string') ||
    (node?.type === 'TemplateLiteral' && node.expressions.length === 0);

const literalText = (node) =>
    node?.type === 'Literal' && typeof node.value === 'string'
        ? node.value
        : node?.type === 'TemplateLiteral'
          ? node.quasis[0].value.cooked
          : null;

const filenameOf = (context) =>
    (context.filename ?? context.getFilename()).replaceAll('\\', '/');

const unwrap = (node) =>
    node?.type === 'JSXExpressionContainer' ? node.expression : node;

const jsxName = (node) =>
    node?.type === 'JSXIdentifier'
        ? node.name
        : node?.type === 'JSXMemberExpression'
          ? `${jsxName(node.object)}.${node.property.name}`
          : null;

/** `page.only('a', 'b')` — a call to the typed helper of forPage<…>(). */
const isTypedNameCall = (node, key) =>
    node?.type === 'CallExpression' &&
    node.callee.type === 'MemberExpression' &&
    node.callee.property.name === key;

const propNameKeys = new Set(['only', 'except', 'reset']);

/**
 * `only` / `except` / `reset` must be written as `page.only(…)` etc. (forPage<…>() from '@/lib/page').
 * A literal list, a `satisfies` list or a variable is rejected, so every name is type-checked at the call.
 */
const typedPropNames = {
    meta: {
        type: 'problem',
        docs: {
            description:
                'Prop names for partial reloads must come from forPage<…>() so they are type-checked.',
        },
    },
    create(context) {
        if (
            (context.filename ?? context.getFilename())
                .replaceAll('\\', '/')
                .endsWith('lib/page.tsx')
        ) {
            return {};
        }

        const message = (key) =>
            `\`${key}\` must be \`page.${key}(…)\` with \`const page = forPage<'component'>()\` from '@/lib/page', so renamed props fail to compile.`;

        return {
            Property(node) {
                const key = node.key?.name ?? node.key?.value;

                if (
                    propNameKeys.has(key) &&
                    !isTypedNameCall(node.value, key)
                ) {
                    context.report({ node: node.value, message: message(key) });
                }
            },
            JSXAttribute(node) {
                const key = node.name?.name;

                if (
                    propNameKeys.has(key) &&
                    !isTypedNameCall(unwrap(node.value), key)
                ) {
                    context.report({ node, message: message(key) });
                }
            },
        };
    },
};

/** Inertia components that take prop or field names as strings must be used through the typed wrappers. */
const typedInertiaComponents = {
    meta: {
        type: 'problem',
        docs: {
            description:
                'Use the typed wrappers for Inertia components that take prop or field names.',
        },
    },
    create(context) {
        const filename = (context.filename ?? context.getFilename()).replaceAll(
            '\\',
            '/',
        );
        const wrappers = {
            Deferred: [
                'lib/page.tsx',
                "forPage<'component'>().Deferred from '@/lib/page'",
            ],
            WhenVisible: [
                'lib/page.tsx',
                "forPage<'component'>().WhenVisible from '@/lib/page'",
            ],
            InfiniteScroll: [
                'lib/page.tsx',
                "forPage<'component'>().InfiniteScroll from '@/lib/page'",
            ],
            Form: [
                'components/typed-form.tsx',
                "TypedForm from '@/components/typed-form'",
            ],
            useForm: [
                'lib/requests.ts',
                "useRouteForm from '@/lib/requests' (typed by the route it submits to)",
            ],
            useHttp: [
                'lib/requests.ts',
                "useRouteHttp from '@/lib/requests' (typed by the route it calls)",
            ],
        };

        return {
            ImportDeclaration(node) {
                if (node.source.value !== '@inertiajs/react') {
                    return;
                }

                for (const specifier of node.specifiers) {
                    const wrapper = wrappers[specifier.imported?.name];

                    if (wrapper && !filename.endsWith(wrapper[0])) {
                        context.report({
                            node: specifier,
                            message: `Import ${wrapper[1]} instead of Inertia's untyped \`${specifier.imported.name}\`.`,
                        });
                    }
                }
            },
        };
    },
};

/**
 * Form field names must come from `field('…')` (TypedForm), which returns the branded FieldName type. `tsc`
 * enforces it on our form controls (Input, Checkbox, Select, …) and on React's own <input>/<select>/<textarea>/
 * <button> (their JSX types require FieldName: resources/js/types/jsx/jsx-runtime.d.ts). This rule is the
 * backstop for third-party components that type `name` as a plain string: inside <TypedForm>, a literal
 * `name="…"` on any element is rejected.
 */
const typedFormFields = {
    meta: {
        type: 'problem',
        docs: {
            description:
                'Form field names must come from field() so they are type-checked.',
        },
    },
    create(context) {
        let typedFormDepth = 0;

        return {
            JSXElement(node) {
                if (jsxName(node.openingElement.name) === 'TypedForm') {
                    typedFormDepth++;
                }
            },
            'JSXElement:exit'(node) {
                if (jsxName(node.openingElement.name) === 'TypedForm') {
                    typedFormDepth--;
                }
            },
            JSXAttribute(node) {
                const value = unwrap(node.value);

                if (
                    node.name?.name === 'name' &&
                    typedFormDepth > 0 &&
                    isStringLiteral(value)
                ) {
                    context.report({
                        node,
                        message: `Untyped field name "${value.value ?? value.quasis[0].value.cooked}": use name={field('…')} from the <TypedForm> render prop.`,
                    });
                }
            },
        };
    },
};

/**
 * Requests go through '@/lib/requests', which types the payload, the validation errors and the response by
 * the route: `submit(route, data)`, `visit(route)`, `useRouteForm()`, `useRouteHttp()`. Inertia's own
 * `router.post(url, data)` accepts any payload, and `router.optimistic<TProps>()` any props type.
 */
const typedRequests = {
    meta: {
        type: 'problem',
        docs: {
            description:
                'Requests must be typed by their route (submit/visit from @/lib/requests).',
        },
    },
    create(context) {
        if (filenameOf(context).endsWith('lib/requests.ts')) {
            return {};
        }

        const verbs = new Set(['get', 'post', 'put', 'patch', 'delete']);

        return {
            CallExpression(node) {
                const callee = node.callee;

                if (
                    callee.type !== 'MemberExpression' ||
                    callee.object.type !== 'Identifier' ||
                    callee.object.name !== 'router'
                ) {
                    return;
                }

                const method = callee.property.name;
                const options = node.arguments[1];

                if (verbs.has(method)) {
                    context.report({
                        node,
                        message: `\`router.${method}()\` sends an untyped payload: use \`submit(route, data)\` or \`visit(route)\` from '@/lib/requests'.`,
                    });
                } else if (method === 'optimistic') {
                    context.report({
                        node,
                        message:
                            "`router.optimistic<TProps>()` trusts any props type: pass `optimistic: page.optimistic(…)` (forPage from '@/lib/page') to `submit()`.",
                    });
                } else if (
                    method === 'visit' &&
                    options?.type === 'ObjectExpression' &&
                    options.properties.some((property) =>
                        ['data', 'method'].includes(
                            property.key?.name ?? property.key?.value,
                        ),
                    )
                ) {
                    context.report({
                        node,
                        message:
                            "`router.visit()` with a payload is untyped: use `submit(route, data)` from '@/lib/requests'.",
                    });
                }
            },
            JSXAttribute(node) {
                if (
                    node.name?.name === 'data' &&
                    jsxName(node.parent?.name) === 'Link'
                ) {
                    context.report({
                        node,
                        message:
                            "`<Link data>` is an untyped payload: use a button calling `submit(route, data)` from '@/lib/requests'.",
                    });
                }
            },
        };
    },
};

/** URLs come from Wayfinder (`@/routes/…`), so a renamed or removed route fails to compile. */
const noHardcodedUrls = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Use Wayfinder routes instead of hard-coded URLs.',
        },
    },
    create(context) {
        const report = (node) => {
            const text = literalText(node);

            if (text !== null && /^\/(?!\/)/.test(text)) {
                context.report({
                    node,
                    message: `Hard-coded URL "${text}": use the Wayfinder route function (\`@/routes/…\`) so a renamed or removed route fails to compile.`,
                });
            }
        };

        // `a ?? '/x'`, `cond ? '/x' : y`: check every branch.
        const check = (node) => {
            if (node?.type === 'LogicalExpression') {
                check(node.left);
                check(node.right);
            } else if (node?.type === 'ConditionalExpression') {
                check(node.consequent);
                check(node.alternate);
            } else {
                report(node);
            }
        };

        const urlCallees = new Set(['visit', 'submit', 'fetch']);

        return {
            JSXAttribute(node) {
                if (['href', 'action'].includes(node.name?.name)) {
                    check(unwrap(node.value));
                }
            },
            CallExpression(node) {
                const callee = node.callee;
                const takesUrl =
                    (callee.type === 'Identifier' &&
                        urlCallees.has(callee.name)) ||
                    (callee.type === 'MemberExpression' &&
                        ((callee.object.type === 'Identifier' &&
                            callee.object.name === 'router') ||
                            ['assign', 'replace'].includes(
                                callee.property.name,
                            )));

                if (takesUrl) {
                    check(node.arguments[0]);
                }
            },
            AssignmentExpression(node) {
                const target = node.left;

                if (
                    target.type === 'MemberExpression' &&
                    (target.property.name === 'href' ||
                        target.property.name === 'location')
                ) {
                    check(node.right);
                }
            },
        };
    },
};

/**
 * Modules at the edge of the type system, where a cast states something the compiler can't see (each one says
 * why in a comment): the FieldName brand, Inertia's untyped errors/props/form constraints.
 */
const castBoundaries = [
    'lib/requests.ts',
    'lib/page.tsx',
    'components/typed-form.tsx',
];

/** No `x as T`, `<T>x` or `x!` outside the boundary modules (`as const` is fine: it only narrows). */
const noTypeAssertions = {
    meta: {
        type: 'problem',
        docs: { description: 'Type assertions skip type checking.' },
    },
    create(context) {
        const filename = filenameOf(context);

        if (castBoundaries.some((boundary) => filename.endsWith(boundary))) {
            return {};
        }

        const isConst = (type) =>
            type?.type === 'TSTypeReference' && type.typeName?.name === 'const';
        const message = (what) =>
            `${what} skips type checking: narrow the value instead (a type guard, \`satisfies\`, \`enumValues\`/\`allOf()\` for value lists). Casts belong in ${castBoundaries.join(', ')}.`;

        return {
            TSAsExpression(node) {
                if (!isConst(node.typeAnnotation)) {
                    context.report({ node, message: message('`as`') });
                }
            },
            TSTypeAssertion(node) {
                if (!isConst(node.typeAnnotation)) {
                    context.report({ node, message: message('`<T>value`') });
                }
            },
            TSNonNullExpression(node) {
                context.report({
                    node,
                    message: message('A non-null assertion (`!`)'),
                });
            },
        };
    },
};

export default {
    meta: { name: 'type-safety' },
    rules: {
        'typed-prop-names': typedPropNames,
        'typed-inertia-components': typedInertiaComponents,
        'typed-form-fields': typedFormFields,
        'typed-requests': typedRequests,
        'no-hardcoded-urls': noHardcodedUrls,
        'no-type-assertions': noTypeAssertions,
    },
};
