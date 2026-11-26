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

export interface SocialLink {
	id: 'x' | 'bilibili' | 'misskey' | 'github' | 'neteasemusic';
	label: LocalizedText;
	href: string;
	icon: 'x' | 'bilibili' | 'misskey' | 'github' | 'neteasemusic';
}

export interface SiteConfig {
	name: string;
	siteUrl: string;
	neoBlogApiUrl: string;
	title: LocalizedText;
	description: LocalizedText;
	role: LocalizedText;
	ctaLinks: CtaLink[];
	socialLinks: SocialLink[];
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
		zh: 'Snowykami 的个人主页 — Full-stack developer',
		en: 'Snowykami personal homepage — Full-stack developer',
	},
	role: {
		zh: 'Full-stack developer',
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
		{
			id: 'x',
			label: { zh: 'X (Twitter)', en: 'X (Twitter)' },
			href: 'https://x.com/christchisato',
			icon: 'x',
		},
		{
			id: 'bilibili',
			label: { zh: '哔哩哔哩', en: 'Bilibili' },
			href: 'https://space.bilibili.com/233938750',
			icon: 'bilibili',
		},
		{
			id: 'misskey',
			label: { zh: 'Misskey', en: 'Misskey' },
			href: 'https://lab.liteyuki.org/@snowykami',
			icon: 'misskey',
		},
		{
			id: 'github',
			label: { zh: 'GitHub', en: 'GitHub' },
			href: 'https://github.com/snowykami',
			icon: 'github',
		},
		{
			id: 'neteasemusic',
			label: { zh: '网易云音乐', en: 'NetEase Cloud Music' },
			href: 'https://music.163.com/#/user/home?id=1491388449',
			icon: 'neteasemusic',
		},
	],
};
