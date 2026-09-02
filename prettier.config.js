/** @type {import("prettier").Config} */
export default {
    // Match AGENTS.md coding conventions
    tabWidth: 4,
    useTabs: false,
    singleQuote: true,
    trailingComma: 'all',
    semi: true,
    printWidth: 100,
    bracketSpacing: true,
    arrowParens: 'always',
    endOfLine: 'lf',

    // Per-file overrides
    overrides: [
        {
            files: ['*.json', '*.jsonc'],
            options: {
                tabWidth: 4,
            },
        },
        {
            files: ['*.md', '*.mdx'],
            options: {
                proseWrap: 'always',
                printWidth: 80,
            },
        },
        {
            files: ['*.yml', '*.yaml'],
            options: {
                tabWidth: 2,
                singleQuote: false,
            },
        },
    ],
};
