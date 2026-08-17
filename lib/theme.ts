export type ThemeId = "light" | "dark" | "rose" | "butter" | "mint" | "sky"
export type AlignId = "left" | "center" | "right"
export type SortId = "new" | "popular" | "alphabetical"

export const THEME_COOKIE = "fl_theme"
export const ALIGN_COOKIE = "fl_align"
export const SIZE_COOKIE = "fl_size"

export const DEFAULT_THEME: ThemeId = "light"
export const DEFAULT_ALIGN: AlignId = "left"
export const DEFAULT_SORT: SortId = "popular"
export const DEFAULT_SIZE = 44
export const MIN_SIZE = 12
export const MAX_SIZE = 160

/** Swatch colours mirror each theme's canvas, like the picker in the reference UI. */
export const THEMES: Array<{ id: ThemeId; label: string; swatch: string }> = [
	{ id: "rose", label: "Rose", swatch: "#fdeced" },
	{ id: "butter", label: "Butter", swatch: "#fdf6e0" },
	{ id: "mint", label: "Mint", swatch: "#e9fbf0" },
	{ id: "sky", label: "Sky", swatch: "#e8f9fd" },
	{ id: "light", label: "Paper", swatch: "#ffffff" },
	{ id: "dark", label: "Dark", swatch: "#191919" },
]

export const ALIGNMENTS: Array<{ id: AlignId; label: string }> = [
	{ id: "left", label: "Align left" },
	{ id: "center", label: "Align centre" },
	{ id: "right", label: "Align right" },
]

export const SORTS: Array<{ id: SortId; label: string }> = [
	{ id: "new", label: "New" },
	{ id: "popular", label: "Popular" },
	{ id: "alphabetical", label: "Alphabetical" },
]

export function isTheme(value: unknown): value is ThemeId {
	return THEMES.some((theme) => theme.id === value)
}

export function isAlign(value: unknown): value is AlignId {
	return ALIGNMENTS.some((option) => option.id === value)
}

export function isSort(value: unknown): value is SortId {
	return SORTS.some((option) => option.id === value)
}

export function clampSize(value: unknown): number {
	const size = Number(value)
	if (!Number.isFinite(size)) return DEFAULT_SIZE
	return Math.min(MAX_SIZE, Math.max(MIN_SIZE, Math.round(size)))
}
