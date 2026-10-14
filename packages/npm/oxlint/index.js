// @ts-check
/**
 * The Strictly Laravel oxlint plugin. `strictly:install` registers it in the app's Vite+ lint config
 * (vite.config.ts → lint.jsPlugins) and turns every rule on as an error; suppress one only with a written reason
 * (ADR-0007). oxlint's JS plugins get no type information, so the rules match syntax (P-070).
 *
 * @import { Plugin, Rule, ESTree } from '@oxlint/plugins'
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
    },
};
