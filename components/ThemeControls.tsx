"use client"

import { useEffect, useState } from "react"
import { DEFAULT_SAMPLE_TEXT } from "@/lib/fontMeta"
import {
	ALIGNMENTS,
	ALIGN_COOKIE,
	DEFAULT_ALIGN,
	DEFAULT_SIZE,
	DEFAULT_THEME,
	MAX_SIZE,
	MIN_SIZE,
	SIZE_COOKIE,
	THEMES,
	THEME_COOKIE,
	type AlignId,
	type ThemeId,
} from "@/lib/theme"

const TEXT_KEY = "fl:sampleText"

function setCookie(name: string, value: string) {
	document.cookie = `${name}=${value}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`
}

/**
 * Progressive enhancement only. The server already rendered the chosen theme,
 * alignment and size from cookies; this updates them live, filters the visible
 * list and remembers everything for the next visit.
 */
export default function ThemeControls({
	theme: initialTheme,
	align: initialAlign,
	size: initialSize,
	searchable = false,
}: {
	theme: ThemeId
	align: AlignId
	size: number
	/** Show the search box and filter the rendered rows. */
	searchable?: boolean
}) {
	const [theme, setTheme] = useState<ThemeId>(initialTheme)
	const [align, setAlign] = useState<AlignId>(initialAlign)
	const [size, setSize] = useState(initialSize)
	const [text, setText] = useState("")
	const [query, setQuery] = useState("")

	useEffect(() => {
		const stored = window.localStorage.getItem(TEXT_KEY)
		if (stored) setText(stored)
	}, [])

	// Sample text: empty means each specimen shows its own family name.
	useEffect(() => {
		const custom = text.trim()
		for (const node of document.querySelectorAll<HTMLElement>(
			"[data-specimen]",
		)) {
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

	function resetAll() {
		pickTheme(DEFAULT_THEME)
		pickAlign(DEFAULT_ALIGN)
		pickSize(DEFAULT_SIZE)
		setText("")
		setQuery("")
	}

	return (
		<div className="controls" role="group" aria-label="Preview settings">
			{searchable ? (
				<input
					type="text"
					value={query}
					aria-label="Search fonts"
					placeholder="Search"
					onChange={(event) => setQuery(event.target.value)}
				/>
			) : (
				<span />
			)}

			<span />
			<span />

			<span className="sizeField">
				<span className="sizeValue">{size}px</span>
				<input
					type="range"
					min={MIN_SIZE}
					max={MAX_SIZE}
					value={size}
					aria-label="Preview size"
					onChange={(event) => pickSize(Number(event.target.value))}
				/>
			</span>

			<input
				type="text"
				value={text}
				aria-label="Your sample text"
				placeholder="Your text"
				onChange={(event) => setText(event.target.value)}
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
				{THEMES.filter((option) => option.id !== "dark").map((option) => (
					<button
						key={option.id}
						type="button"
						className="swatch"
						style={{ background: option.swatch }}
						title={`${option.label} theme`}
						aria-label={`${option.label} theme`}
						aria-pressed={theme === option.id}
						onClick={() => pickTheme(option.id)}
					/>
				))}
				<button
					type="button"
					className="swatch darkToggle"
					title="Dark theme"
					aria-label="Dark theme"
					aria-pressed={theme === "dark"}
					onClick={() => pickTheme(theme === "dark" ? "light" : "dark")}
				/>
			</span>

			<button type="button" className="resetButton" onClick={resetAll}>
				Reset All
			</button>
		</div>
	)
}
