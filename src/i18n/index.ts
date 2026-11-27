import en from './en.json' with { type: 'json' };
import ja from './ja.json' with { type: 'json' };
import zh from './zh.json' with { type: 'json' };

export type Locale = 'zh' | 'en' | 'ja';
export type LocalizedText = Record<Locale, string>;
export type Messages = typeof zh;

export const LOCALE_OPTIONS: { value: Locale; label: string }[] = [
	{ value: 'zh', label: '中文' },
	{ value: 'en', label: 'English' },
	{ value: 'ja', label: '日本語' },
];

export const messages: Record<Locale, Messages> = {
	zh,
	en,
	ja,
};

export function formatTemplate(template: string, vars: Record<string, string>): string {
	return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? '');
}

export function localizedFrom(
	select: (m: Messages) => string,
	vars?: Record<string, string>,
): LocalizedText {
	const apply = (val: string) => (vars ? formatTemplate(val, vars) : val);
	return {
		zh: apply(select(messages.zh)),
		en: apply(select(messages.en)),
		ja: apply(select(messages.ja)),
	};
}
