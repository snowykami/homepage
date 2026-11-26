import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
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
	bannerWidth: number;
	bannerHeight: number;
	bannerBgDataUri: string;
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

async function fetchBufferWithFallback(url: string, fallbackPath: string): Promise<Buffer> {
	if (url) {
		try {
			const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
			if (res.ok) {
				return Buffer.from(await res.arrayBuffer());
			}
		} catch {
			// Fall back to local asset
		}
	}
	return fs.readFile(fallbackPath);
}

async function writeToTargets(filename: string, data: Buffer): Promise<void> {
	const root = process.cwd();
	const publicDir = path.resolve(root, 'public');
	await fs.mkdir(publicDir, { recursive: true });
	await fs.writeFile(path.join(publicDir, filename), data);

	const distDir = path.resolve(root, 'dist');
	try {
		const stat = await fs.stat(distDir);
		if (stat.isDirectory()) {
			await fs.writeFile(path.join(distDir, filename), data);
		}
	} catch {
		// dist/ does not exist during dev
	}
}

async function optimizeLocalImages(
	bannerUrl: string,
	avatarUrl: string,
): Promise<{
	banner: string;
	bannerWidth: number;
	bannerHeight: number;
	bannerBgDataUri: string;
	avatar: string;
}> {
	const root = process.cwd();
	const [bannerBuf, avatarBuf] = await Promise.all([
		fetchBufferWithFallback(bannerUrl, path.resolve(root, 'src/assets/fallback-banner.jpg')),
		fetchBufferWithFallback(avatarUrl, path.resolve(root, 'src/assets/fallback-avatar.webp')),
	]);

	const bannerOut = await sharp(bannerBuf)
		.resize({ width: 800, withoutEnlargement: true })
		.webp({ quality: 82 })
		.toBuffer({ resolveWithObject: true });

	const bgThumbBuf = await sharp(bannerBuf)
		.resize({ width: 64, withoutEnlargement: true })
		.webp({ quality: 60 })
		.toBuffer();

	const avatarOutBuf = await sharp(avatarBuf)
		.resize({ width: 192, height: 192, fit: 'cover' })
		.webp({ quality: 85 })
		.toBuffer();

	await Promise.all([
		writeToTargets('banner.webp', bannerOut.data),
		writeToTargets('avatar.webp', avatarOutBuf),
	]);

	return {
		banner: '/banner.webp',
		bannerWidth: bannerOut.info.width,
		bannerHeight: bannerOut.info.height,
		bannerBgDataUri: `data:image/webp;base64,${bgThumbBuf.toString('base64')}`,
		avatar: '/avatar.webp',
	};
}

export async function fetchNeoBlogProfile(): Promise<ResolvedProfile> {
	let name = siteConfig.name;
	let remoteAvatar = '';
	let remoteBanner = '';
	let baseUrl = 'https://blog.sfkm.me';
	let enDesc = siteConfig.role.en;
	let mappedLinks: SocialLink[] = [];
	let source: ResolvedProfile['source'] = 'fallback';

	try {
		const res = await fetch(NEO_BLOG_PUBLIC_CONFIG_URL, {
			signal: AbortSignal.timeout(4000),
			headers: { Accept: 'application/json' },
		});
		if (res.ok) {
			const json = (await res.json()) as NeoBlogSiteInfoResponse;
			const info = json.data?.site_info;
			const owner = info?.owner;
			if (info && owner) {
				name = owner.name?.trim() || siteConfig.name;
				remoteAvatar = owner.avatar?.trim() || '';
				remoteBanner = info.about_background?.trim() || '';
				baseUrl = info.base_url?.trim() || baseUrl;
				enDesc = owner.description?.trim() || enDesc;

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
				source = 'neo-blog-api';
			}
		}
	} catch {
		// Use fallback metadata
	}

	const optimized = await optimizeLocalImages(remoteBanner, remoteAvatar);
	const socialLinks = mappedLinks.length > 0 ? mappedLinks : siteConfig.socialLinks;
	const githubUrl = socialLinks.find((l) => l.id === 'github')?.href;

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
		avatar: optimized.avatar,
		banner: optimized.banner,
		bannerWidth: optimized.bannerWidth,
		bannerHeight: optimized.bannerHeight,
		bannerBgDataUri: optimized.bannerBgDataUri,
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
		socialLinks,
		source,
	};
}
