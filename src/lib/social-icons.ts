import socialIconsData from '../data/social-icons.generated.json' with { type: 'json' };
import type { LocalizedText } from '../config/site';

export type SvgChildTag =
	| 'path'
	| 'circle'
	| 'rect'
	| 'polygon'
	| 'polyline'
	| 'line'
	| 'ellipse'
	| 'g';

export interface IconChildNode {
	tag: SvgChildTag;
	attr: Record<string, string>;
	child?: IconChildNode[];
}

export interface ResolvedIconSpec {
	viewBox: string;
	stroke?: boolean;
	nodes: IconChildNode[];
}

export interface RawOwnerLink {
	name?: string;
	icon?: string;
	url?: string;
}

export interface ResolvedSocialLink {
	id: string;
	label: LocalizedText;
	href: string;
	external: boolean;
	spec: ResolvedIconSpec;
}

interface GeneratedSocialIcon {
	id: string;
	label: string;
	words: string;
	spec: ResolvedIconSpec;
}

const BRAND_PREFIX = 'brand:';

const brandMap = new Map<string, GeneratedSocialIcon>(
	(socialIconsData.icons as GeneratedSocialIcon[]).map((item) => [
		`${BRAND_PREFIX}${item.id}`,
		item,
	]),
);

const COMMON_LUCIDE_SPECS: Record<string, { label: LocalizedText; spec: ResolvedIconSpec }> = {
	globe: {
		label: { zh: '网站', en: 'Website' },
		spec: {
			viewBox: '0 0 24 24',
			stroke: true,
			nodes: [
				{ tag: 'circle', attr: { cx: '12', cy: '12', r: '10' } },
				{ tag: 'path', attr: { d: 'M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20' } },
				{ tag: 'path', attr: { d: 'M2 12h20' } },
			],
		},
	},
	mail: {
		label: { zh: '邮箱', en: 'Email' },
		spec: {
			viewBox: '0 0 24 24',
			stroke: true,
			nodes: [
				{ tag: 'rect', attr: { width: '20', height: '16', x: '2', y: '4', rx: '2' } },
				{ tag: 'path', attr: { d: 'm22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7' } },
			],
		},
	},
	phone: {
		label: { zh: '电话', en: 'Phone' },
		spec: {
			viewBox: '0 0 24 24',
			stroke: true,
			nodes: [
				{
					tag: 'path',
					attr: {
						d: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z',
					},
				},
			],
		},
	},
	'message-square': {
		label: { zh: '消息', en: 'Message' },
		spec: {
			viewBox: '0 0 24 24',
			stroke: true,
			nodes: [
				{
					tag: 'path',
					attr: { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
				},
			],
		},
	},
	link: {
		label: { zh: '链接', en: 'Link' },
		spec: {
			viewBox: '0 0 24 24',
			stroke: true,
			nodes: [
				{
					tag: 'path',
					attr: { d: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' },
				},
				{
					tag: 'path',
					attr: { d: 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' },
				},
			],
		},
	},
	rss: {
		label: { zh: 'RSS', en: 'RSS' },
		spec: {
			viewBox: '0 0 24 24',
			stroke: true,
			nodes: [
				{ tag: 'path', attr: { d: 'M4 11a9 9 0 0 1 9 9' } },
				{ tag: 'path', attr: { d: 'M4 4a16 16 0 0 1 16 16' } },
				{ tag: 'circle', attr: { cx: '5', cy: '19', r: '1' } },
			],
		},
	},
};

const ALLOWED_SCHEMES = new Set([
	'http',
	'https',
	'mailto',
	'tel',
	'sms',
	'tg',
	'tencent',
	'mqqapi',
	'mqqwpa',
	'weixin',
	'steam',
	'discord',
	'matrix',
	'xmpp',
	'nostr',
	'irc',
	'ircs',
	'magnet',
]);

const SCHEME_ICON_MAP: Record<string, string> = {
	mailto: 'mail',
	tel: 'phone',
	sms: 'message-square',
	tg: 'brand:telegram',
	tencent: 'brand:qq',
	mqqapi: 'brand:qq',
	mqqwpa: 'brand:qq',
	weixin: 'brand:wechat',
	steam: 'brand:steam',
	discord: 'brand:discord',
	matrix: 'brand:matrix',
	nostr: 'brand:nostr',
};

const HOST_ICON_RULES: [RegExp, string][] = [
	[/(?:^|\.)github\.com$/i, 'brand:github'],
	[/(?:^|\.)(?:x|twitter)\.com$/i, 'brand:x'],
	[/(?:^|\.)(?:bilibili\.com|b23\.tv)$/i, 'brand:bilibili'],
	[/(?:^|\.)misskey\./i, 'brand:misskey'],
	[/^music\.163\.com$/i, 'brand:neteasemusic'],
	[/^(?:t\.me|telegram\.me|telegram\.org)$/i, 'brand:telegram'],
	[/(?:^|\.)(?:steamcommunity|steampowered)\.com$/i, 'brand:steam'],
	[/(?:^|\.)(?:discord\.gg|discord\.com|discordapp\.com)$/i, 'brand:discord'],
	[/(?:^|\.)zhihu\.com$/i, 'brand:zhihu'],
	[/(?:^|\.)(?:xiaohongshu\.com|xhslink\.com)$/i, 'brand:xiaohongshu'],
	[/(?:^|\.)(?:youtube\.com|youtu\.be)$/i, 'brand:youtube'],
	[/(?:^|\.)pixiv\.net$/i, 'brand:pixiv'],
	[/(?:^|\.)(?:bgm\.tv|bangumi\.tv|chii\.in)$/i, 'brand:bangumi'],
	[/(?:^|\.)mastodon\./i, 'brand:mastodon'],
	[/(?:^|\.)bsky\.app$/i, 'brand:bluesky'],
	[/(?:^|\.)v2ex\.com$/i, 'brand:v2ex'],
	[/(?:^|\.)juejin\.cn$/i, 'brand:juejin'],
	[/(?:^|\.)afdian\.(?:com|net)$/i, 'brand:afdian'],
];

function normalizeHost(hostname: string): string {
	return hostname.trim().toLowerCase().replace(/^www\./, '');
}

export function isSelfHomepageUrl(rawUrl: string, siteUrl: string): boolean {
	try {
		const selfHost = normalizeHost(new URL(siteUrl).hostname);
		const target = new URL(rawUrl);
		if (target.protocol !== 'http:' && target.protocol !== 'https:') {
			return false;
		}
		return normalizeHost(target.hostname) === selfHost;
	} catch {
		return false;
	}
}

function isSafeLinkUrl(raw: string): boolean {
	const trimmed = raw.trim();
	if (!trimmed || trimmed.length > 1024 || /[\s\x00-\x20\x7f]/.test(trimmed)) {
		return false;
	}
	const colon = trimmed.indexOf(':');
	if (colon <= 0) return false;
	const scheme = trimmed.slice(0, colon).toLowerCase();
	if (!ALLOWED_SCHEMES.has(scheme)) return false;
	if (scheme === 'http' || scheme === 'https') {
		try {
			return Boolean(new URL(trimmed).hostname);
		} catch {
			return false;
		}
	}
	return trimmed.slice(colon + 1).replace(/^\/+/, '').length > 0;
}

function inferIconFromUrl(rawUrl: string): string | null {
	const colon = rawUrl.indexOf(':');
	if (colon <= 0) return null;
	const scheme = rawUrl.slice(0, colon).toLowerCase();
	if (SCHEME_ICON_MAP[scheme]) return SCHEME_ICON_MAP[scheme];
	if (scheme !== 'http' && scheme !== 'https') return null;
	try {
		const u = new URL(rawUrl);
		const host = u.hostname.toLowerCase();
		for (const [re, icon] of HOST_ICON_RULES) {
			if (re.test(host)) return icon;
		}
		if (/\b(?:rss|atom|feed)\.xml$/i.test(u.pathname)) return 'brand:rss';
	} catch {
		return null;
	}
	return null;
}

function buildLocalizedLabel(rawLabel: string, fallbackIcon: string): LocalizedText {
	if (fallbackIcon === 'brand:neteasemusic') {
		return { zh: '网易云音乐', en: 'NetEase Cloud Music' };
	}
	const match = rawLabel.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
	if (match) {
		const [, main, sub] = match;
		// e.g. "哔哩哔哩 (Bilibili)" -> zh: 哔哩哔哩, en: Bilibili; "X (Twitter)" -> both "X (Twitter)"
		if (/[\u4e00-\u9fa5]/.test(main) && !/[\u4e00-\u9fa5]/.test(sub)) {
			return { zh: main.trim(), en: sub.trim() };
		}
		return { zh: rawLabel.trim(), en: rawLabel.trim() };
	}
	return { zh: rawLabel.trim(), en: rawLabel.trim() };
}

export function resolveSocialLinks(
	links: RawOwnerLink[],
	siteUrl: string,
): ResolvedSocialLink[] {
	const result: ResolvedSocialLink[] = [];

	for (const item of links) {
		const rawUrl = item.url?.trim() || '';
		if (!rawUrl || !isSafeLinkUrl(rawUrl)) continue;

		// Skip links pointing back to this homepage itself ("不要原地 TP")
		if (isSelfHomepageUrl(rawUrl, siteUrl)) continue;

		const rawIcon = item.icon?.trim() || '';
		const effectiveIcon =
			!rawIcon || rawIcon === 'globe' ? inferIconFromUrl(rawUrl) || rawIcon || 'globe' : rawIcon;

		let spec: ResolvedIconSpec | undefined;
		let label: LocalizedText;

		const brandEntry = brandMap.get(effectiveIcon);
		if (brandEntry) {
			spec = brandEntry.spec;
			label = item.name?.trim()
				? { zh: item.name.trim(), en: item.name.trim() }
				: buildLocalizedLabel(brandEntry.label, effectiveIcon);
		} else {
			const lucideEntry = COMMON_LUCIDE_SPECS[effectiveIcon] ?? COMMON_LUCIDE_SPECS.globe;
			spec = lucideEntry.spec;
			const customName = item.name?.trim();
			label = customName ? { zh: customName, en: customName } : lucideEntry.label;
		}

		const isHttp = /^https?:/i.test(rawUrl);
		const cleanId = effectiveIcon.replace(/^brand:/, '');

		result.push({
			id: cleanId,
			label,
			href: rawUrl,
			external: isHttp,
			spec,
		});
	}

	return result;
}
