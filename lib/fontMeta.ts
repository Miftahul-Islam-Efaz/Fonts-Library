import type { FaceStyle } from "./types"

export const WEIGHT_OPTIONS: Array<{ value: number; label: string }> = [
	{ value: 100, label: "Thin" },
	{ value: 200, label: "ExtraLight" },
	{ value: 300, label: "Light" },
	{ value: 400, label: "Regular" },
	{ value: 500, label: "Medium" },
	{ value: 600, label: "SemiBold" },
	{ value: 700, label: "Bold" },
	{ value: 800, label: "ExtraBold" },
	{ value: 900, label: "Black" },
]

const WEIGHT_WORDS: Array<[RegExp, number]> = [
	[/thin|hairline/i, 100],
	[/extra[- _]?light|ultra[- _]?light/i, 200],
	[/light/i, 300],
	[/regular|normal|book|roman/i, 400],
	[/medium/i, 500],
	[/semi[- _]?bold|demi[- _]?bold/i, 600],
	[/extra[- _]?bold|ultra[- _]?bold/i, 800],
	[/black|heavy|fat/i, 900],
	[/bold/i, 700],
]

export const FONT_EXTENSIONS = ["woff2", "woff", "otf", "ttf", "ttc", "eot"]

export function fileExtension(nameOrUrl: string): string {
	const clean = nameOrUrl.split(/[?#]/)[0]
	const match = clean.match(/\.([a-z0-9]+)$/i)
	return match ? match[1].toLowerCase() : ""
}

export function isFontFileName(nameOrUrl: string): boolean {
	return FONT_EXTENSIONS.includes(fileExtension(nameOrUrl))
}

/** CSS format() hint for a font file. */
export function cssFormat(nameOrUrl: string): string | null {
	switch (fileExtension(nameOrUrl)) {
		case "woff2":
			return "woff2"
		case "woff":
			return "woff"
		case "otf":
			return "opentype"
		case "ttf":
		case "ttc":
			return "truetype"
		case "eot":
			return "embedded-opentype"
		default:
			return null
	}
}

export function weightName(weight: number): string {
	return (
		WEIGHT_OPTIONS.find((option) => option.value === weight)?.label ??
		String(weight)
	)
}

export function faceLabel(weight: number, style: FaceStyle): string {
	const name = weightName(weight)
	return style === "italic" ? `${name} Italic` : name
}

/** Best-effort weight/style guess from a font file name. */
export function guessFaceMeta(fileName: string): {
	weight: number
	style: FaceStyle
	label: string
} {
	const base = fileName.replace(/\.[a-z0-9]+$/i, "")
	const style: FaceStyle = /italic|oblique/i.test(base) ? "italic" : "normal"

	let weight = 400
	const numeric = base.match(/(?:^|[^0-9])([1-9]00)(?:[^0-9]|$)/)
	if (numeric) {
		weight = Number(numeric[1])
	} else {
		for (const [pattern, value] of WEIGHT_WORDS) {
			if (pattern.test(base)) {
				weight = value
				break
			}
		}
	}

	return { weight, style, label: faceLabel(weight, style) }
}

/** Guess a family name from a font file name. */
export function guessFamilyName(fileName: string): string {
	const base = fileName.replace(/\.[a-z0-9]+$/i, "")
	const cleaned = base
		.replace(
			/[-_ ]?(thin|hairline|extralight|ultralight|light|regular|normal|book|roman|medium|semibold|demibold|extrabold|ultrabold|bold|black|heavy|fat|italic|oblique|variable|vf)\b/gi,
			"",
		)
		.replace(/[-_]([1-9]00)\b/g, "")
		.replace(/[-_]+/g, " ")
		.replace(/([a-z])([A-Z])/g, "$1 $2")
		.trim()
	return cleaned || base
}

export function slugify(value: string): string {
	return (
		value
			.toLowerCase()
			.normalize("NFKD")
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "")
			.slice(0, 60) || "font"
	)
}

/** Styles offered in every preview, even when a family ships only one file. */
export const DEFAULT_PREVIEW_STYLES: Array<{
	weight: number
	style: FaceStyle
}> = [
	{ weight: 400, style: "normal" },
	{ weight: 700, style: "normal" },
	{ weight: 400, style: "italic" },
	{ weight: 700, style: "italic" },
]

export const DEFAULT_SAMPLE_TEXT = "Sphinx of black quartz, judge my vow"
export const GLYPH_SAMPLE =
	"ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 &@#!?$%"
