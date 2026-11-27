export type Locale = 'zh' | 'en';

export interface LocalizedText {
	zh: string;
	en: string;
}

export interface CtaLink {
	id: 'blog' | 'projects';
	label: LocalizedText;
	href: string;
	icon: 'blog' | 'projects';
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
	title: LocalizedText;
	description: LocalizedText;
	role: LocalizedText;
	ctaLinks: CtaLink[];
	socialLinks: FallbackSocialLink[];
}

export const siteConfig: SiteConfig = {
	name: 'Snowykami',
	siteUrl: 'https://sfkm.me',
	neoBlogApiUrl:
		import.meta.env.NEO_BLOG_API_URL ||
		'https://blog.sfkm.me/api/v1/misc/public-config?keys=site_info',
	title: {
		zh: 'Snowykami - 个人主页',
		en: 'Snowykami - Personal Website',
	},
	description: {
		zh: 'Snowykami 的个人主页 — 全栈开发者',
		en: 'Snowykami personal homepage — Full-stack developer',
	},
	role: {
		zh: '全栈开发者',
		en: 'Full-stack developer',
	},
	ctaLinks: [
		{
			id: 'blog',
			label: { zh: '博客', en: 'Blog' },
			href: 'https://blog.sfkm.me',
			icon: 'blog',
			external: true,
		},
		{
			id: 'projects',
			label: { zh: '项目', en: 'Projects' },
			href: 'https://github.com/snowykami?tab=repositories',
			icon: 'projects',
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
