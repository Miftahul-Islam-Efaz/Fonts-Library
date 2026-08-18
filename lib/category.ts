import { slugify } from "./fontMeta"
import type { FontRecord } from "./types"

/**
 * Categories are typed by hand, so people write them every way imaginable:
 * "Serif, Display", "serif / display", "Sans-Serif (Geometric / Humanist)".
 * Everything is parsed into parts and always stored and shown joined by " / ",
 * which is what makes filtering by category dependable.
 */

/** Anything a person might reasonably use to separate two categories. */
const SEPARATORS = /[,/|;()\u00b7\u2022\u2013\u2014]+|\s+and\s+/gi

/** Canonical spelling for the categories people type most often. */
const CANONICAL: Record<string, string> = {
	serif: "Serif",
	serifs: "Serif",
	"semi-serif": "Serif",
	sans: "Sans-Serif",
	"sans serif": "Sans-Serif",
	"sans-serif": "Sans-Serif",
	sansserif: "Sans-Serif",
	grotesk: "Grotesk",
	grotesque: "Grotesk",
	neogrotesk: "Grotesk",
	"neo-grotesque": "Grotesk",
	"neo grotesque": "Grotesk",
	slab: "Slab Serif",
	"slab serif": "Slab Serif",
	display: "Display",
	decorative: "Display",
	script: "Script",
	handwriting: "Handwriting",
	handwritten: "Handwriting",
	calligraphy: "Calligraphy",
	calligraphic: "Calligraphy",
	mono: "Monospace",
	monospace: "Monospace",
	monospaced: "Monospace",
	graffiti: "Graffiti",
	blackletter: "Blackletter",
	gothic: "Blackletter",
	techno: "Techno",
	pixel: "Pixel",
	bitmap: "Pixel",
	retro: "Retro",
	vintage: "Retro",
	variable: "Variable",
	geometric: "Geometric",
	humanist: "Humanist",
	condensed: "Condensed",
	rounded: "Rounded",
	stencil: "Stencil",
	experimental: "Experimental",
	cartoon: "Cartoon",
	fantasy: "Fantasy",
	brush: "Brush",
	inline: "Inline",
	outline: "Outline",
	symbol: "Symbols",
	symbols: "Symbols",
	icons: "Symbols",
	dingbat: "Symbols",
	dingbats: "Symbols",
}

/**
 * Head words that absorb their qualifiers, so "Bold Display" and "Elegant
 * Display" both land in Display instead of creating two facets of one font.
 */
const HEAD_WORDS = new Set([
	"serif",
	"sans-serif",
	"display",
	"script",
	"monospace",
	"grotesk",
	"handwriting",
	"calligraphy",
	"blackletter",
	"pixel",
])

/** Title case that leaves hyphenated and already-capitalised words alone. */
function titleCase(part: string): string {
	return part
		.split(/([\s-])/)
		.map((chunk) =>
			/^[\s-]$/.test(chunk) || chunk.length === 0
				? chunk
				: chunk[0].toUpperCase() + chunk.slice(1),
		)
		.join("")
}

/** One raw chunk to its canonical label. */
function canonical(part: string): string {
	const key = part.toLowerCase()
	const exact = CANONICAL[key]
	if (exact) return exact

	// "Bold Display" -> Display, "Elegant Serif" -> Serif.
	const words = key.split(/\s+/)
	if (words.length > 1) {
		const last = words[words.length - 1]
		if (HEAD_WORDS.has(last)) return CANONICAL[last] ?? titleCase(last)
		const mapped = CANONICAL[last]
		if (mapped && HEAD_WORDS.has(mapped.toLowerCase())) return mapped
	}

	return titleCase(part)
}

/** Every category in a raw string, canonicalised and de-duplicated. */
export function categoryParts(raw: string | null | undefined): string[] {
	if (!raw) return []
	const seen = new Map<string, string>()
	for (const chunk of raw.split(SEPARATORS)) {
		const trimmed = chunk.trim().replace(/\s{2,}/g, " ")
		if (!trimmed) continue
		const label = canonical(trimmed)
		const dedupe = label.toLowerCase()
		if (!seen.has(dedupe)) seen.set(dedupe, label)
	}
	return [...seen.values()]
}

/**
 * The stored and displayed form of a category: parts joined by " / ".
 * Used when writing a font and again when reading one, so rows saved before
 * this existed line up with new ones without a migration.
 */
export function normalizeCategory(
	raw: string | null | undefined,
): string | null {
	const parts = categoryParts(raw)
	return parts.length > 0 ? parts.join(" / ") : null
}

/** URL-safe id for one category, e.g. "Sans-Serif" -> "sans-serif". */
export function categorySlug(part: string): string {
	return slugify(part)
}

export type CategoryFacet = {
	slug: string
	label: string
	count: number
}

/** Every category present in a list of families, with counts, busiest first. */
export function categoryFacets(fonts: FontRecord[]): CategoryFacet[] {
	const facets = new Map<string, CategoryFacet>()
	for (const font of fonts) {
		for (const label of categoryParts(font.category)) {
			const slug = categorySlug(label)
			const existing = facets.get(slug)
			if (existing) existing.count += 1
			else facets.set(slug, { slug, label, count: 1 })
		}
	}
	return [...facets.values()].sort(
		(a, b) => b.count - a.count || a.label.localeCompare(b.label),
	)
}

/** True when a family carries the given category slug. */
export function hasCategory(font: FontRecord, slug: string): boolean {
	return categoryParts(font.category).some(
		(label) => categorySlug(label) === slug,
	)
}

/** Families in one category. An unknown slug filters nothing out. */
export function filterByCategory(
	fonts: FontRecord[],
	slug: string | null,
): FontRecord[] {
	if (!slug) return fonts
	return fonts.filter((font) => hasCategory(font, slug))
}
