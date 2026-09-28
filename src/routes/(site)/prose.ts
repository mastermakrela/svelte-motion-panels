/** Class strings shared by the sections, after the upstream docs. */
export const CHIP = 'bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground/90';

export const LEAD = 'max-w-[68ch] text-muted-foreground text-pretty';

export const ASIDE = `${LEAD} mt-6 border-l pl-5 text-[14px]`;

/** Splits prose on `backticks`: odd entries are code. */
export const chips = (text: string) => text.split('`');
