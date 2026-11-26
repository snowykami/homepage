import type { IconName } from '../components/Icons.astro';
import { siteConfig, type CtaLink, type LocalizedText, type SocialLink } from '../config/site';

const NEO_BLOG_PUBLIC_CONFIG_URL =
	'https://blog.sfkm.me/api/v1/misc/public-config?keys=site_info';

interface NeoBlogLink {
	icon?: string;
	url?: string;
}

interface NeoBlogSiteInfoResponse {
	status?: number;
	data?: {
		site_info?: {
			about_background?: string;
			base_url?: string;
			owner?: {
				name?: string;
				avatar?: string;
				description?: string;
				links?: NeoBlogLink[];
			};
		};
	};
}

export interface ResolvedProfile {
	name: string;
	avatar: string;
	banner: string;
	title: LocalizedText;
	description: LocalizedText;
	role: LocalizedText;
	ctaLinks: CtaLink[];
	socialLinks: SocialLink[];
	source: 'neo-blog-api' | 'fallback';
}

const BRAND_ICON_MAP: Record<string, { id: SocialLink['id']; label: string; icon: IconName }> = {
	'brand:x': { id: 'x', label: 'X (Twitter)', icon: 'x' },
	'brand:bilibili': { id: 'bilibili', label: '哔哩哔哩 (Bilibili)', icon: 'bilibili' },
	'brand:misskey': { id: 'misskey', label: 'Misskey', icon: 'misskey' },
	'brand:github': { id: 'github', label: 'GitHub', icon: 'github' },
	'brand:neteasemusic': { id: 'neteasemusic', label: '网易云音乐', icon: 'neteasemusic' },
};

export async function fetchNeoBlogProfile(): Promise<ResolvedProfile> {
	try {
		const res = await fetch(NEO_BLOG_PUBLIC_CONFIG_URL, {
			signal: AbortSignal.timeout(4000),
			headers: { Accept: 'application/json' },
		});
		if (!res.ok) {
			throw new Error(`HTTP ${res.status}`);
		}

		const json = (await res.json()) as NeoBlogSiteInfoResponse;
		const info = json.data?.site_info;
		const owner = info?.owner;
		if (!info || !owner) {
			throw new Error('Missing site_info.owner');
		}

		const name = owner.name?.trim() || siteConfig.name;
		const avatar = owner.avatar?.trim() || siteConfig.avatar;
		const banner = info.about_background?.trim() || siteConfig.banner;
		const baseUrl = info.base_url?.trim() || 'https://blog.sfkm.me';
		const enDesc = owner.description?.trim() || siteConfig.role.en;

		const mappedLinks: SocialLink[] = [];
		for (const link of owner.links ?? []) {
			if (!link.icon || !link.url) continue;
			const mapped = BRAND_ICON_MAP[link.icon];
			if (!mapped) continue;
			mappedLinks.push({
				id: mapped.id,
				label: mapped.label,
				href: link.url,
				icon: mapped.id,
			});
		}

		const githubUrl = mappedLinks.find((l) => l.id === 'github')?.href;
		const ctaLinks: CtaLink[] = [
			{
				id: 'blog',
				label: { zh: '博客', en: 'Blog' },
				href: baseUrl,
				icon: 'blog',
				external: true,
			},
			{
				id: 'projects',
				label: { zh: '项目', en: 'Projects' },
				href: githubUrl ? `${githubUrl}?tab=repositories` : siteConfig.ctaLinks[1].href,
				icon: 'projects',
				external: true,
			},
		];

		return {
			name,
			avatar,
			banner,
			title: {
				zh: `${name} - 个人主页`,
				en: `${name} - Personal Website`,
			},
			description: {
				zh: `${name} 的个人主页 — ${siteConfig.role.zh}`,
				en: `${name} personal homepage — ${enDesc}`,
			},
			role: {
				zh: siteConfig.role.zh,
				en: enDesc,
			},
			ctaLinks,
			socialLinks: mappedLinks.length > 0 ? mappedLinks : siteConfig.socialLinks,
			source: 'neo-blog-api',
		};
	} catch {
		return {
			...siteConfig,
			source: 'fallback',
		};
	}
}
