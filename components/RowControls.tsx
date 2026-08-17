"use client"

import { useRef, useState } from "react"
import {
	DEFAULT_LEADING,
	DEFAULT_SIZE,
	MAX_LEADING,
	MAX_SIZE,
	MIN_LEADING,
	MIN_SIZE,
} from "@/lib/theme"

interface Props {
	/** Family name, used only for accessible labels. */
	fontName: string
	initialSize?: number
	initialLeading?: number
}

/**
 * Per-family preview settings, the way a foundry specimen list works: every row
 * carries its own bold / italic, leading and size.
 *
 * The values are written as custom properties and data attributes on the row
 * element itself, so a row override beats the page-wide setting from the top
 * controls bar while untouched rows keep following it.
 */
export default function RowControls({
	fontName,
	initialSize = DEFAULT_SIZE,
	initialLeading = DEFAULT_LEADING,
}: Props) {
	const ref = useRef<HTMLSpanElement>(null)
	const [size, setSize] = useState(initialSize)
	const [leading, setLeading] = useState(initialLeading)
	const [bold, setBold] = useState(false)
	const [italic, setItalic] = useState(false)
	const [touched, setTouched] = useState(false)

	function row(): HTMLElement | null {
		return ref.current?.closest<HTMLElement>("[data-font-row]") ?? null
	}

	function pickSize(next: number) {
		setSize(next)
		setTouched(true)
		row()?.style.setProperty("--row-size", `${next}px`)
	}

	function pickLeading(next: number) {
		setLeading(next)
		setTouched(true)
		row()?.style.setProperty("--row-leading", String(next / 100))
	}

	function pickBold(next: boolean) {
		setBold(next)
		setTouched(true)
		const node = row()
		if (node) node.dataset.weight = next ? "bold" : "regular"
	}

	function pickItalic(next: boolean) {
		setItalic(next)
		setTouched(true)
		const node = row()
		if (node) node.dataset.slant = next ? "italic" : "normal"
	}

	/** Hand this row back to the page-wide controls. */
	function reset() {
		const node = row()
		if (node) {
			node.style.removeProperty("--row-size")
			node.style.removeProperty("--row-leading")
			delete node.dataset.weight
			delete node.dataset.slant
		}
		setSize(initialSize)
		setLeading(initialLeading)
		setBold(false)
		setItalic(false)
		setTouched(false)
	}

	return (
		<span
			ref={ref}
			className="rowControls"
			role="group"
			aria-label={`Preview settings for ${fontName}`}
			suppressHydrationWarning
		>
			<span className="styleToggles">
				<button
					type="button"
					className="styleToggle boldToggle"
					aria-pressed={bold}
					title={`Preview ${fontName} in bold`}
					onClick={() => pickBold(!bold)}
				>
					Bold
				</button>
				<button
					type="button"
					className="styleToggle italicToggle"
					aria-pressed={italic}
					title={`Preview ${fontName} in italic`}
					onClick={() => pickItalic(!italic)}
				>
					Italic
				</button>
			</span>

			<span className="leadField rowField">
				<span className="leadValue">Leading</span>
				<input
					type="range"
					min={MIN_LEADING}
					max={MAX_LEADING}
					value={leading}
					aria-label={`Leading for ${fontName}`}
					onChange={(event) => pickLeading(Number(event.target.value))}
					suppressHydrationWarning
				/>
			</span>

			<span className="sizeField rowField">
				<span className="sizeValue">{size}px</span>
				<input
					type="range"
					min={MIN_SIZE}
					max={MAX_SIZE}
					value={size}
					aria-label={`Preview size for ${fontName}`}
					onChange={(event) => pickSize(Number(event.target.value))}
					suppressHydrationWarning
				/>
			</span>

			{touched ? (
				<button
					type="button"
					className="rowReset"
					title={`Reset the preview settings for ${fontName}`}
					onClick={reset}
				>
					Reset
				</button>
			) : null}
		</span>
	)
}
