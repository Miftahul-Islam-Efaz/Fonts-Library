import type { MetadataRoute } from "next"
import { listFonts } from "@/lib/fonts"
import { isSupabaseConfigured } from "@/lib/supabase"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const base: MetadataRoute.Sitemap = [
		{ url: `${siteUrl}/`, changeFrequency: "daily", priority: 1 },
	]
	if (!isSupabaseConfigured) return base

	const fonts = await listFonts()
	return [
		...base,
		...fonts.map((font) => ({
			url: `${siteUrl}/fonts/${font.slug}`,
			lastModified: new Date(font.created_at),
			changeFrequency: "weekly" as const,
			priority: 0.8,
		})),
	]
}
