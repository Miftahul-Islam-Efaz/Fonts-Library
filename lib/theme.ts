/**
 * Appearance is two independent axes, like the reference foundry site:
 *   - mode  (light | dark): the base canvas.
 *   - theme (a tint): the ink colour. In the dark base only the text and the
 *     highlighted parts take the tint; the canvas stays black.
 */
export type ModeId = "light" | "dark"
export type ThemeId = "light" | "butter" | "rose" | "mint"
export type AlignId = "left" | "center" | "right"
export type SortId = "new" | "popular" | "alphabetical"

export const MODE_COOKIE = "fl_mode"
export const THEME_COOKIE = "fl_theme"
export const ALIGN_COOKIE = "fl_align"
export const SIZE_COOKIE = "fl_size"

export const DEFAULT_MODE: ModeId = "light"
export const DEFAULT_THEME: ThemeId = "light"
export const DEFAULT_ALIGN: AlignId = "left"
export const DEFAULT_SORT: SortId = "popular"
export const DEFAULT_SIZE = 44
export const MIN_SIZE = 12
export const MAX_SIZE = 160

export const MODES: Array<{ id: ModeId; label: string }> = [
	{ id: "light", label: "Light" },
	{ id: "dark", label: "Dark" },
]

/** The swatch colour is the tint itself: the light canvas, or the dark ink. */
export const THEMES: Array<{ id: ThemeId; label: string; swatch: string }> = [
	{ id: "butter", label: "Butter", swatch: "#ffffe3" },
	{ id: "rose", label: "Rose", swatch: "#fcecec" },
	{ id: "mint", label: "Mint", swatch: "#e2fde6" },
	{ id: "light", label: "Paper", swatch: "#ffffff" },
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

export function isMode(value: unknown): value is ModeId {
	return MODES.some((mode) => mode.id === value)
}

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
