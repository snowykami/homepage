import { localizedFrom, type LocalizedText } from '../i18n';

export interface CtaLink {
	id: 'blog' | 'status';
	label: LocalizedText;
	href: string;
	icon: 'blog' | 'status';
	external?: boolean;
}

export interface FallbackSocialLink {
	name?: string;
	icon: string;
	url: string;
}

export interface SiteConfig {
	name: string;
	siteUrl: string;
	neoBlogApiUrl: string;
	ctaLinks: CtaLink[];
	socialLinks: FallbackSocialLink[];
}

export const siteConfig: SiteConfig = {
	name: 'Snowykami',
	siteUrl: 'https://sfkm.me',
	neoBlogApiUrl:
		import.meta.env.NEO_BLOG_API_URL ||
		'https://blog.sfkm.me/api/v1/misc/public-config?keys=site_info',
	ctaLinks: [
		{
			id: 'blog',
			label: localizedFrom((m) => m.cta.blog),
			href: 'https://blog.sfkm.me',
			icon: 'blog',
			external: true,
		},
		{
			id: 'status',
			label: localizedFrom((m) => m.cta.status),
			href: 'https://status.sfkm.me/',
			icon: 'status',
			external: true,
		},
	],
	socialLinks: [
		{ icon: 'brand:x', url: 'https://x.com/christchisato' },
		{ icon: 'brand:bilibili', url: 'https://space.bilibili.com/233938750' },
		{ icon: 'brand:misskey', url: 'https://lab.liteyuki.org/@snowykami' },
		{ icon: 'brand:github', url: 'https://github.com/snowykami' },
		{ icon: 'brand:neteasemusic', url: 'https://music.163.com/#/user/home?id=1491388449' },
	],
};
