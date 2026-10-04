/**
 * A deliberately tiny highlighter for the snippets on this page: one regex
 * pass into `[kind, text]` tokens, rendered with monochrome tones from
 * app.css (`.tok-*`). It ships no grammar and runs the same on the server and
 * in the browser.
 */
export type Lang = 'svelte' | 'ts' | 'css' | 'sh';

const KEYWORDS =
	'import|from|export|const|let|var|function|return|type|interface|if|else|as|new|true|false|null|undefined|await|async|of|for|satisfies|typeof|keyof';

const RULES: [string, string][] = [
	['comment', String.raw`<!--[\s\S]*?-->|\/\*[\s\S]*?\*\/|(?<![:\w])\/\/[^\n]*`],
	['string', String.raw`"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|` + '`(?:[^`\\\\]|\\\\.)*`'],
	['tag', String.raw`<\/?[A-Za-z][\w.:-]*|\/?>`],
	['keyword', String.raw`\{[#:/@][a-z]+|\b(?:${KEYWORDS})\b`],
	['rune', String.raw`\$[a-z][\w.]*`],
	['attr', String.raw`\b[a-zA-Z][\w:-]*(?=\s*=[^=>])|(?<=^\s*)[a-z-]+(?=\s*:\s)`],
	['number', String.raw`\b\d+(?:\.\d+)?(?:px|%|ms|s|em|rem)?\b`],
	['punct', String.raw`[{}()[\];,]|=>|[=|&?]`]
];

const SHELL: [string, string][] = [
	['comment', String.raw`#[^\n]*`],
	['keyword', String.raw`^(?:bun|npm|pnpm|npx|bunx)\b`],
	['string', String.raw`"[^"\n]*"|'[^'\n]*'`]
];

const compile = (rules: [string, string][]) =>
	new RegExp(rules.map(([name, source]) => `(?<${name}>${source})`).join('|'), 'gmu');

const PATTERNS = {
	css: compile(RULES),
	sh: compile(SHELL),
	svelte: compile(RULES),
	ts: compile(RULES)
};

export type Token = [kind: string, text: string];

export const highlight = (code: string, lang: Lang): Token[] => {
	const tokens: Token[] = [];
	let last = 0;
	for (const match of code.matchAll(PATTERNS[lang])) {
		const kind = Object.entries(match.groups ?? {}).find(([, value]) => value !== undefined)?.[0];
		if (match.index > last) {
			tokens.push(['plain', code.slice(last, match.index)]);
		}
		tokens.push([kind ?? 'plain', match[0]]);
		last = match.index + match[0].length;
	}
	if (last < code.length) {
		tokens.push(['plain', code.slice(last)]);
	}

	return tokens;
};

/** A demo's own file as a reader would write it: imports from the package. */
export const source = (raw: string) =>
	raw
		.replaceAll("'#lib/index.js'", "'svelte-motion-panels'")
		.replaceAll("'./shared/index.js'", "'./shared'")
		.trim();
