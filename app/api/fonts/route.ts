import { NextResponse } from "next/server"
import { cssFamily, faceUrl, listFonts } from "@/lib/fonts"
import { isSupabaseConfigured } from "@/lib/supabase"
import { DEFAULT_SORT, isSort } from "@/lib/theme"

export const dynamic = "force-dynamic"

/** Machine-readable index of the library, for scripts, agents and AI models. */
export async function GET(request: Request) {
	if (!isSupabaseConfigured) {
		return NextResponse.json(
			{ error: "Supabase is not configured", fonts: [] },
			{ status: 503 },
		)
	}

	const sortParam = new URL(request.url).searchParams.get("sort") ?? undefined
	const sort = isSort(sortParam) ? sortParam : DEFAULT_SORT
	const fonts = await listFonts(sort)

	return NextResponse.json(
		{
			count: fonts.length,
			sort,
			generatedAt: new Date().toISOString(),
			fonts: fonts.map((font) => ({
				name: font.name,
				slug: font.slug,
				url: `/fonts/${font.slug}`,
				category: font.category,
				notes: font.notes,
				sourceType: font.source_type,
				cssFamily: cssFamily(font),
				cssUrl: font.css_url,
				sourcePage: font.source_page,
				license: font.license,
				favoriteCount: font.favorite_count ?? 0,
				createdAt: font.created_at,
				styles: font.faces.map((face) => ({
					label: face.label,
					weight: face.weight,
					style: face.style,
					format: face.format,
					fileUrl: faceUrl(face),
				})),
			})),
		},
		{
			headers: {
				"Cache-Control": "public, max-age=0, s-maxage=60",
				"Access-Control-Allow-Origin": "*",
			},
		},
	)
}
