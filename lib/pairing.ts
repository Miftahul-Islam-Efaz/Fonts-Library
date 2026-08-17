import { previewStyles } from "./fonts"
import type { FontRecord } from "./types"

export type FontClass =
	| "serif"
	| "slab"
	| "sans"
	| "grotesque"
	| "mono"
	| "display"
	| "script"
	| "unknown"

const CLASS_WORDS: Array<[RegExp, FontClass]> = [
	[/mono|code|terminal|typewriter/i, "mono"],
	[/script|hand|brush|calligraph|cursive|signature|marker/i, "script"],
	[/display|poster|headline|decor|title|deco|experimental|blackletter/i, "display"],
	[/slab|egyptian|clarendon/i, "slab"],
	[/grotesk|grotesque|neue|helvetica|inter|akzidenz|univers/i, "grotesque"],
	[/serif|garamond|didone|bodoni|caslon|georgia|times|roman|fraunces/i, "serif"],
	[/sans|gothic|geometric|humanist/i, "sans"],
]

/**
 * Classifies a family from its category, notes and name. This is intentionally
 * heuristic: the category you type when adding a font always wins.
 */
export function classifyFont(font: FontRecord): FontClass {
	const haystack = [font.category, font.notes, font.name]
		.filter(Boolean)
		.join(" ")
	for (const [pattern, id] of CLASS_WORDS) {
		if (pattern.test(haystack)) return id
	}
	return "unknown"
}

/** Families that carry a headline well. */
const HEADING_STRENGTH: Record<FontClass, number> = {
	display: 5,
	script: 4,
	slab: 4,
	serif: 3,
	grotesque: 3,
	sans: 3,
	mono: 2,
	unknown: 2,
}

/** Families that stay comfortable in long paragraphs. */
const BODY_STRENGTH: Record<FontClass, number> = {
	sans: 5,
	grotesque: 5,
	serif: 5,
	slab: 3,
	mono: 3,
	unknown: 2,
	display: 1,
	script: 0,
}

/** How well two classes contrast without clashing. */
const CONTRAST: Partial<Record<`${FontClass}|${FontClass}`, number>> = {
	"display|sans": 5,
	"display|grotesque": 5,
	"display|serif": 4,
	"script|sans": 5,
	"script|grotesque": 5,
	"script|serif": 4,
	"serif|sans": 5,
	"serif|grotesque": 5,
	"slab|sans": 4,
	"slab|grotesque": 4,
	"sans|serif": 5,
	"grotesque|serif": 5,
	"mono|sans": 3,
	"mono|serif": 3,
	"display|mono": 3,
	"script|mono": 2,
}

export interface FontPair {
	heading: FontRecord
	body: FontRecord
	headingClass: FontClass
	bodyClass: FontClass
	/** 0-100, higher is a stronger recommendation. */
	score: number
	reason: string
}

function weightSpread(font: FontRecord): number {
	const weights = previewStyles(font)
		.filter((style) => style.real)
		.map((style) => style.weight)
	if (weights.length === 0) return 0
	return Math.max(...weights) - Math.min(...weights)
}

function scorePair(heading: FontRecord, body: FontRecord): FontPair | null {
	if (heading.id === body.id) return null

	const headingClass = classifyFont(heading)
	const bodyClass = classifyFont(body)

	const headingFit = HEADING_STRENGTH[headingClass]
	const bodyFit = BODY_STRENGTH[bodyClass]
	if (bodyFit === 0) return null

	const contrast =
		CONTRAST[`${headingClass}|${bodyClass}`] ??
		CONTRAST[`${bodyClass}|${headingClass}`] ??
		(headingClass === bodyClass ? 1 : 2)

	// A family with many weights can carry both roles, so reward range a little.
	const range = Math.min(3, Math.round(weightSpread(body) / 200))

	// Community signal: liked families surface first among equally good matches.
	const likes = Math.min(
		3,
		Math.round(
			((heading.favorite_count ?? 0) + (body.favorite_count ?? 0)) / 2,
		),
	)

	const raw =
		contrast * 4 + headingFit * 2 + bodyFit * 2 + range + likes
	const score = Math.min(100, Math.round((raw / 44) * 100))

	const reasons: string[] = []
	if (headingClass !== bodyClass && contrast >= 4) {
		reasons.push(`${headingClass} headline against a ${bodyClass} text face`)
	} else if (headingClass === bodyClass) {
		reasons.push(`same ${headingClass} family feel, so it stays quiet`)
	} else {
		reasons.push(`${headingClass} paired with ${bodyClass}`)
	}
	if (weightSpread(body) >= 300) reasons.push("wide weight range for hierarchy")
	if ((heading.favorite_count ?? 0) > 0) reasons.push("already a favorite")

	return {
		heading,
		body,
		headingClass,
		bodyClass,
		score,
		reason: reasons.join(" · "),
	}
}

/**
 * Ranks every possible combination of the families in the library and returns
 * the strongest suggestions, without repeating a heading face too often.
 */
export function bestPairs(fonts: FontRecord[], limit = 12): FontPair[] {
	const pairs: FontPair[] = []
	for (const heading of fonts) {
		for (const body of fonts) {
			const pair = scorePair(heading, body)
			if (pair) pairs.push(pair)
		}
	}

	pairs.sort(
		(a, b) =>
			b.score - a.score ||
			a.heading.name.localeCompare(b.heading.name) ||
			a.body.name.localeCompare(b.body.name),
	)

	const used = new Map<string, number>()
	const picked: FontPair[] = []
	for (const pair of pairs) {
		const seen = used.get(pair.heading.id) ?? 0
		if (seen >= 2) continue
		used.set(pair.heading.id, seen + 1)
		picked.push(pair)
		if (picked.length >= limit) break
	}
	return picked
}

/** Suggestions for one specific family, used on its detail page. */
export function pairsForFont(
	font: FontRecord,
	fonts: FontRecord[],
	limit = 4,
): FontPair[] {
	const options = fonts.filter((other) => other.id !== font.id)
	const asHeading = options
		.map((other) => scorePair(font, other))
		.filter((pair): pair is FontPair => pair !== null)
	const asBody = options
		.map((other) => scorePair(other, font))
		.filter((pair): pair is FontPair => pair !== null)
	return [...asHeading, ...asBody]
		.sort((a, b) => b.score - a.score)
		.slice(0, limit)
}
