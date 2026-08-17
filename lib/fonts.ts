import { cssFormat, DEFAULT_PREVIEW_STYLES } from "./fontMeta"
import { favoriteCounts } from "./favorites"
import {
	isSupabaseConfigured,
	publicFileUrl,
	readClient,
	writeClient,
} from "./supabase"
import { authServerClient } from "./supabaseServer"
import type { SortId } from "./theme"
import type { FaceStyle, FontFaceRecord, FontRecord } from "./types"

const SELECT = "*, faces:font_faces(*)"

function sortFaces(font: FontRecord): FontRecord {
	const faces = [...(font.faces ?? [])].sort(
		(a, b) => a.weight - b.weight || a.style.localeCompare(b.style),
	)
	return { ...font, faces }
}

function applySort(fonts: FontRecord[], sort: SortId): FontRecord[] {
	const list = [...fonts]
	if (sort === "new") {
		return list.sort((a, b) => b.created_at.localeCompare(a.created_at))
	}
	if (sort === "popular") {
		return list.sort(
			(a, b) =>
				(b.favorite_count ?? 0) - (a.favorite_count ?? 0) ||
				a.name.localeCompare(b.name),
		)
	}
	return list.sort((a, b) => a.name.localeCompare(b.name))
}

async function withCounts(fonts: FontRecord[]): Promise<FontRecord[]> {
	const counts = await favoriteCounts()
	return fonts.map((font) => ({
		...font,
		favorite_count: counts.get(font.id) ?? 0,
	}))
}

/** The public library: one row per family, kept by whoever added it first. */
export async function listFonts(
	sort: SortId = "alphabetical",
): Promise<FontRecord[]> {
	const client = readClient()
	if (!client) return []
	const { data, error } = await client
		.from("fonts")
		.select(SELECT)
		.eq("is_public", true)
	if (error) throw new Error(error.message)
	const fonts = await withCounts((data as FontRecord[]).map(sortFaces))
	return applySort(fonts, sort)
}

/** One person's space: everything they added, public entry or private copy. */
export async function listMyFonts(
	userId: string,
	sort: SortId = "alphabetical",
): Promise<FontRecord[]> {
	if (!isSupabaseConfigured) return []
	const client = await authServerClient()
	const { data, error } = await client
		.from("fonts")
		.select(SELECT)
		.eq("added_by", userId)
	if (error) throw new Error(error.message)
	const fonts = await withCounts((data as FontRecord[]).map(sortFaces))
	return applySort(fonts, sort)
}

/** Admin view: every family, including other people's private copies. */
export async function listAllFonts(
	sort: SortId = "alphabetical",
): Promise<FontRecord[]> {
	const { data, error } = await writeClient().from("fonts").select(SELECT)
	if (error) throw new Error(error.message)
	const fonts = await withCounts((data as FontRecord[]).map(sortFaces))
	return applySort(fonts, sort)
}

/**
 * A single family by slug, read through the visitor's own session so people can
 * open their private copies while everyone else only sees public families.
 */
export async function getFontBySlug(slug: string): Promise<FontRecord | null> {
	if (!isSupabaseConfigured) return null
	const client = await authServerClient()
	const { data, error } = await client
		.from("fonts")
		.select(SELECT)
		.eq("slug", slug)
		.maybeSingle()
	if (error) throw new Error(error.message)
	if (!data) return null
	const [font] = await withCounts([sortFaces(data as FontRecord)])
	return font
}

/** URL a browser can load this face from. */
export function faceUrl(face: FontFaceRecord): string | null {
	if (face.file_url) return face.file_url
	if (face.file_path) return publicFileUrl(face.file_path)
	return null
}

/** CSS font-family value used to render a family. */
export function cssFamily(font: FontRecord): string {
	if (font.source_type === "link" && font.css_url) {
		return font.css_family || font.name
	}
	return `fl-${font.slug}`
}

/** Server-rendered @font-face rules so previews work without any JavaScript. */
export function fontFaceCss(fonts: FontRecord[]): string {
	const rules: string[] = []
	for (const font of fonts) {
		if (font.source_type === "link" && font.css_url) continue
		for (const face of font.faces) {
			const url = faceUrl(face)
			if (!url) continue
			const format = face.format ?? cssFormat(url)
			const src = format
				? `url("${url}") format("${format}")`
				: `url("${url}")`
			rules.push(
				[
					"@font-face{",
					`font-family:"${cssFamily(font)}";`,
					`src:${src};`,
					`font-weight:${face.weight};`,
					`font-style:${face.style};`,
					"font-display:swap;",
					"}",
				].join(""),
			)
		}
	}
	return rules.join("\n")
}

/** Stylesheet URLs for families loaded from a web foundry. */
export function styleSheetUrls(fonts: FontRecord[]): string[] {
	const urls = fonts
		.filter((font) => font.source_type === "link" && font.css_url)
		.map((font) => font.css_url as string)
	return Array.from(new Set(urls))
}

export interface PreviewStyle {
	weight: number
	style: FaceStyle
	label: string
	/** False when the browser has to synthesize the style from another file. */
	real: boolean
}

/** Preview rows for a family: its real files first, then synthesized extras. */
export function previewStyles(font: FontRecord): PreviewStyle[] {
	const rows: PreviewStyle[] = font.faces.map((face) => ({
		weight: face.weight,
		style: face.style,
		label: face.label || `${face.weight} ${face.style}`,
		real: true,
	}))

	const hasStyle = (weight: number, style: FaceStyle) =>
		rows.some((row) => row.weight === weight && row.style === style)

	for (const preset of DEFAULT_PREVIEW_STYLES) {
		if (!hasStyle(preset.weight, preset.style)) {
			rows.push({
				weight: preset.weight,
				style: preset.style,
				label:
					preset.style === "italic"
						? `${preset.weight} Italic`
						: `${preset.weight}`,
				real: font.source_type === "link" && Boolean(font.css_url),
			})
		}
	}

	return rows.sort(
		(a, b) => a.style.localeCompare(b.style) || a.weight - b.weight,
	)
}
