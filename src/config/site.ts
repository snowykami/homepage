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
	label: string;
	href: string;
	icon: 'x' | 'bilibili' | 'misskey' | 'github' | 'neteasemusic';
}

export interface SiteConfig {
	name: string;
	avatar: string;
	banner: string;
	title: LocalizedText;
	description: LocalizedText;
	role: LocalizedText;
	ctaLinks: CtaLink[];
	socialLinks: SocialLink[];
}

export const siteConfig: SiteConfig = {
	name: 'Snowykami',
	avatar: '/avatar.webp',
	banner: '/banner.jpg',
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
			label: 'X (Twitter)',
			href: 'https://x.com/christchisato',
			icon: 'x',
		},
		{
			id: 'bilibili',
			label: '哔哩哔哩 (Bilibili)',
			href: 'https://space.bilibili.com/233938750',
			icon: 'bilibili',
		},
		{
			id: 'misskey',
			label: 'Misskey',
			href: 'https://lab.liteyuki.org/@snowykami',
			icon: 'misskey',
		},
		{
			id: 'github',
			label: 'GitHub',
			href: 'https://github.com/snowykami',
			icon: 'github',
		},
		{
			id: 'neteasemusic',
			label: '网易云音乐',
			href: 'https://music.163.com/#/user/home?id=1491388449',
			icon: 'neteasemusic',
		},
	],
};
