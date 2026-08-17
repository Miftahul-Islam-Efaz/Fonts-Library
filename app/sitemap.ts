import type { MetadataRoute } from "next"
import { listFonts } from "@/lib/fonts"
import { SITE_URL } from "@/lib/site"
import { isSupabaseConfigured } from "@/lib/supabase"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const now = new Date()
	const base: MetadataRoute.Sitemap = [
		{
			url: `${SITE_URL}/`,
			lastModified: now,
			changeFrequency: "daily",
			priority: 1,
		},
		{
			url: `${SITE_URL}/pairs`,
			lastModified: now,
			changeFrequency: "weekly",
			priority: 0.7,
		},
		{
			url: `${SITE_URL}/about`,
			lastModified: now,
			changeFrequency: "monthly",
			priority: 0.6,
		},
		{
			url: `${SITE_URL}/privacy`,
			lastModified: now,
			changeFrequency: "yearly",
			priority: 0.3,
		},
	]
	if (!isSupabaseConfigured) return base

	const fonts = await listFonts()
	return [
		...base,
		...fonts.map((font) => ({
			url: `${SITE_URL}/fonts/${font.slug}`,
			lastModified: new Date(font.created_at),
			changeFrequency: "weekly" as const,
			priority: 0.8,
		})),
	]
}
