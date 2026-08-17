"use client"

import { useEffect, useState } from "react"
import { TEXT_EVENT } from "@/components/EditableSpecimen"
import { DEFAULT_SAMPLE_TEXT } from "@/lib/fontMeta"
import {
	ALIGNMENTS,
	ALIGN_COOKIE,
	DEFAULT_ALIGN,
	DEFAULT_LEADING,
	DEFAULT_MODE,
	DEFAULT_SIZE,
	DEFAULT_THEME,
	LEADING_COOKIE,
	MAX_LEADING,
	MAX_SIZE,
	MIN_LEADING,
	MIN_SIZE,
	MODE_COOKIE,
	SIZE_COOKIE,
	THEMES,
	THEME_COOKIE,
	type AlignId,
	type ModeId,
	type ThemeId,
} from "@/lib/theme"

const TEXT_KEY = "fl:sampleText"

function setCookie(name: string, value: string) {
	document.cookie = `${name}=${value}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`
}

/**
 * Progressive enhancement only. The server already rendered the chosen base,
 * tint, alignment, size and leading from cookies; this updates them live,
 * filters the visible list and remembers everything for the next visit.
 */
export default function ThemeControls({
	theme: initialTheme,
	align: initialAlign,
	size: initialSize,
	leading: initialLeading = DEFAULT_LEADING,
	searchable = false,
}: {
	theme: ThemeId
	align: AlignId
	size: number
	/** Line height as a percentage of the font size. */
	leading?: number
	/** Show the search box and filter the rendered rows. */
	searchable?: boolean
}) {
	const [mode, setMode] = useState<ModeId>(DEFAULT_MODE)
	const [theme, setTheme] = useState<ThemeId>(initialTheme)
	const [align, setAlign] = useState<AlignId>(initialAlign)
	const [size, setSize] = useState(initialSize)
	const [leading, setLeading] = useState(initialLeading)
	const [bold, setBold] = useState(false)
	const [italic, setItalic] = useState(false)
	const [text, setText] = useState("")
	const [query, setQuery] = useState("")

	// Read the base from the document so the first paint cannot mismatch.
	useEffect(() => {
		const current = document.documentElement.dataset.mode
		if (current === "dark" || current === "light") setMode(current)
	}, [])

	useEffect(() => {
		const stored = window.localStorage.getItem(TEXT_KEY)
		if (stored) setText(stored)
	}, [])

	// Typing directly on a specimen broadcasts here, so the box stays in sync.
	useEffect(() => {
		function follow(event: Event) {
			setText((event as CustomEvent<string>).detail ?? "")
		}
		window.addEventListener(TEXT_EVENT, follow)
		return () => window.removeEventListener(TEXT_EVENT, follow)
	}, [])

	// Sample text: empty means each specimen shows its own family name. The
	// focused specimen is skipped so typing in place never loses the caret.
	useEffect(() => {
		const custom = text.trim()
		for (const node of document.querySelectorAll<HTMLElement>(
			"[data-specimen]",
		)) {
			if (node === document.activeElement) continue
			node.textContent =
				custom.length > 0
					? text
					: node.dataset.default ?? DEFAULT_SAMPLE_TEXT
		}
		window.localStorage.setItem(TEXT_KEY, text)
	}, [text])

	// Client-side filtering of the server-rendered rows.
	useEffect(() => {
		if (!searchable) return
		const needle = query.trim().toLowerCase()
		let shown = 0
		for (const node of document.querySelectorAll<HTMLElement>(
			"[data-font-row]",
		)) {
			const haystack = `${node.dataset.name ?? ""} ${node.dataset.category ?? ""}`
			const match = needle.length === 0 || haystack.includes(needle)
			node.hidden = !match
			if (match) shown += 1
		}
		const counter = document.querySelector<HTMLElement>("[data-font-count]")
		if (counter) counter.textContent = String(shown)
	}, [query, searchable])

	/** Base only. The tint is left exactly as it is. */
	function pickMode(next: ModeId) {
		setMode(next)
		document.documentElement.dataset.mode = next
		setCookie(MODE_COOKIE, next)
	}

	/** Tint only. The base is left exactly as it is. */
	function pickTheme(next: ThemeId) {
		setTheme(next)
		document.documentElement.dataset.theme = next
		setCookie(THEME_COOKIE, next)
	}

	function pickAlign(next: AlignId) {
		setAlign(next)
		document.documentElement.dataset.align = next
		setCookie(ALIGN_COOKIE, next)
	}

	function pickSize(next: number) {
		setSize(next)
		document.documentElement.style.setProperty("--specimen-size", `${next}px`)
		setCookie(SIZE_COOKIE, String(next))
	}

	function pickLeading(next: number) {
		setLeading(next)
		document.documentElement.style.setProperty(
			"--specimen-leading",
			String(next / 100),
		)
		setCookie(LEADING_COOKIE, String(next))
	}

	function pickBold(next: boolean) {
		setBold(next)
		if (next) document.documentElement.dataset.weight = "bold"
		else delete document.documentElement.dataset.weight
	}

	function pickItalic(next: boolean) {
		setItalic(next)
		if (next) document.documentElement.dataset.slant = "italic"
		else delete document.documentElement.dataset.slant
	}

	function resetAll() {
		pickMode(DEFAULT_MODE)
		pickTheme(DEFAULT_THEME)
		pickAlign(DEFAULT_ALIGN)
		pickSize(DEFAULT_SIZE)
		pickLeading(DEFAULT_LEADING)
		pickBold(false)
		pickItalic(false)
		setText("")
		setQuery("")
	}

	return (
		<div
			className="controls"
			role="group"
			aria-label="Preview settings"
			suppressHydrationWarning
		>
			{searchable ? (
				<input
					type="text"
					value={query}
					aria-label="Search fonts"
					placeholder="Search"
					onChange={(event) => setQuery(event.target.value)}
					suppressHydrationWarning
				/>
			) : (
				<span />
			)}

			<span className="styleToggles">
				<button
					type="button"
					className="styleToggle boldToggle"
					aria-pressed={bold}
					title="Preview every family in bold"
					onClick={() => pickBold(!bold)}
				>
					Bold
				</button>
				<button
					type="button"
					className="styleToggle italicToggle"
					aria-pressed={italic}
					title="Preview every family in italic"
					onClick={() => pickItalic(!italic)}
				>
					Italic
				</button>
			</span>

			<span className="leadField">
				<span className="leadValue">Leading {leading}%</span>
				<input
					type="range"
					min={MIN_LEADING}
					max={MAX_LEADING}
					value={leading}
					aria-label="Preview leading"
					onChange={(event) => pickLeading(Number(event.target.value))}
					suppressHydrationWarning
				/>
			</span>

			<span className="sizeField">
				<span className="sizeValue">{size}px</span>
				<input
					type="range"
					min={MIN_SIZE}
					max={MAX_SIZE}
					value={size}
					aria-label="Preview size"
					onChange={(event) => pickSize(Number(event.target.value))}
					suppressHydrationWarning
				/>
			</span>

			<input
				type="text"
				value={text}
				aria-label="Your sample text"
				placeholder="Your text, or click any preview"
				onChange={(event) => setText(event.target.value)}
				suppressHydrationWarning
			/>

			<span className="iconGroup">
				{ALIGNMENTS.map((option) => (
					<button
						key={option.id}
						type="button"
						className={`iconButton align-${option.id}`}
						aria-label={option.label}
						aria-pressed={align === option.id}
						onClick={() => pickAlign(option.id)}
					>
						<i aria-hidden="true" />
						<i aria-hidden="true" />
						<i aria-hidden="true" />
					</button>
				))}
			</span>

			<span className="swatches">
				{THEMES.map((option) => (
					<button
						key={option.id}
						type="button"
						className="swatch"
						style={{ background: option.swatch }}
						title={`${option.label} colour`}
						aria-label={`${option.label} colour`}
						aria-pressed={theme === option.id}
						onClick={() => pickTheme(option.id)}
					/>
				))}
				<button
					type="button"
					className="swatch darkToggle"
					title={mode === "dark" ? "Switch to light base" : "Switch to dark base"}
					aria-label={
						mode === "dark" ? "Switch to light base" : "Switch to dark base"
					}
					aria-pressed={mode === "dark"}
					onClick={() => pickMode(mode === "dark" ? "light" : "dark")}
				/>
			</span>

			<button type="button" className="resetButton" onClick={resetAll}>
				Reset All
			</button>
		</div>
	)
}
