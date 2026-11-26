import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import type { IconName } from '../components/Icons.astro';
import { siteConfig, type CtaLink, type LocalizedText, type SocialLink } from '../config/site';

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

const BRAND_ICON_MAP: Record<
	string,
	{ id: SocialLink['id']; label: LocalizedText; icon: IconName }
> = {
	'brand:x': { id: 'x', label: { zh: 'X (Twitter)', en: 'X (Twitter)' }, icon: 'x' },
	'brand:bilibili': { id: 'bilibili', label: { zh: '哔哩哔哩', en: 'Bilibili' }, icon: 'bilibili' },
	'brand:misskey': { id: 'misskey', label: { zh: 'Misskey', en: 'Misskey' }, icon: 'misskey' },
	'brand:github': { id: 'github', label: { zh: 'GitHub', en: 'GitHub' }, icon: 'github' },
	'brand:neteasemusic': {
		id: 'neteasemusic',
		label: { zh: '网易云音乐', en: 'NetEase Cloud Music' },
		icon: 'neteasemusic',
	},
};

let cachedProfilePromise: Promise<ResolvedProfile> | null = null;

function shortDigest(buf: Buffer): string {
	return crypto.createHash('sha256').update(buf).digest('hex').slice(0, 8);
}

async function fileExists(filePath: string): Promise<boolean> {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
}

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

async function syncHashedAsset(
	prefix: string,
	filename: string,
	encodeFn: () => Promise<Buffer>,
): Promise<Buffer> {
	const root = process.cwd();
	const publicAssetsDir = path.resolve(root, 'public/assets');
	await fs.mkdir(publicAssetsDir, { recursive: true });

	const publicFilePath = path.join(publicAssetsDir, filename);
	let data: Buffer;

	if (await fileExists(publicFilePath)) {
		data = await fs.readFile(publicFilePath);
	} else {
		data = await encodeFn();
		const existing = await fs.readdir(publicAssetsDir);
		await Promise.all(
			existing
				.filter((name) => name.startsWith(`${prefix}.`) && name !== filename)
				.map((stale) => fs.unlink(path.join(publicAssetsDir, stale))),
		);
		await fs.writeFile(publicFilePath, data);
	}

	const distDir = path.resolve(root, 'dist');
	if (await fileExists(distDir)) {
		const distAssetsDir = path.join(distDir, 'assets');
		await fs.mkdir(distAssetsDir, { recursive: true });
		const distExisting = await fs.readdir(distAssetsDir);
		await Promise.all(
			distExisting
				.filter((name) => name.startsWith(`${prefix}.`) && name !== filename)
				.map((stale) => fs.unlink(path.join(distAssetsDir, stale))),
		);
		const distFilePath = path.join(distAssetsDir, filename);
		if (!(await fileExists(distFilePath))) {
			await fs.writeFile(distFilePath, data);
		}
	}

	return data;
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

	const bannerHash = shortDigest(bannerBuf);
	const avatarHash = shortDigest(avatarBuf);
	const bannerFile = `banner.${bannerHash}.webp`;
	const avatarFile = `avatar.${avatarHash}.webp`;

	const [bannerData, bgThumbBuf] = await Promise.all([
		syncHashedAsset('banner', bannerFile, () =>
			sharp(bannerBuf)
				.resize({ width: 760, withoutEnlargement: true })
				.webp({ quality: 70, effort: 6 })
				.toBuffer(),
		),
		// Pre-blur & slightly boost saturation at build time so CSS needs zero runtime GPU blur filter
		sharp(bannerBuf)
			.resize({ width: 96, withoutEnlargement: true })
			.modulate({ saturation: 1.12 })
			.blur(6)
			.webp({ quality: 58, effort: 6 })
			.toBuffer(),
		syncHashedAsset('avatar', avatarFile, () =>
			sharp(avatarBuf)
				.resize({ width: 192, height: 192, fit: 'cover' })
				.webp({ quality: 78, effort: 6 })
				.toBuffer(),
		),
	]);

	const bannerMeta = await sharp(bannerData).metadata();

	return {
		banner: `/assets/${bannerFile}`,
		bannerWidth: bannerMeta.width ?? 760,
		bannerHeight: bannerMeta.height ?? 536,
		bannerBgDataUri: `data:image/webp;base64,${bgThumbBuf.toString('base64')}`,
		avatar: `/assets/${avatarFile}`,
	};
}

async function loadNeoBlogProfile(): Promise<ResolvedProfile> {
	let name = siteConfig.name;
	let remoteAvatar = '';
	let remoteBanner = '';
	let baseUrl = 'https://blog.sfkm.me';
	let enDesc = siteConfig.role.en;
	const mappedLinks: SocialLink[] = [];
	let source: ResolvedProfile['source'] = 'fallback';

	try {
		const res = await fetch(siteConfig.neoBlogApiUrl, {
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

export function fetchNeoBlogProfile(): Promise<ResolvedProfile> {
	if (!cachedProfilePromise) {
		cachedProfilePromise = loadNeoBlogProfile();
	}
	return cachedProfilePromise;
}
