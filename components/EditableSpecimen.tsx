"use client"

import { useEffect, useRef } from "react"

/** Shared with ThemeControls so the sample text survives navigation. */
const TEXT_KEY = "fl:sampleText"

/** Broadcast so every other specimen and the controls bar stay in sync. */
export const TEXT_EVENT = "fl:sampleText"

interface Props {
	/** The @font-face family name to set the preview in. */
	family: string
	/** Shown when no custom text is typed - normally the family name. */
	defaultText: string
	className?: string
}

/**
 * A specimen you can type into directly, like a foundry layout editor.
 *
 * The text is rendered on the server so crawlers and the OAuth branding
 * reviewer read a real family name. Editing is layered on top after hydration:
 * typing here writes to localStorage and broadcasts an event, so all other
 * specimens and the size / leading controls follow the same string.
 */
export default function EditableSpecimen({
	family,
	defaultText,
	className,
}: Props) {
	const ref = useRef<HTMLParagraphElement>(null)

	// Restore a previously typed string on first paint after hydration.
	useEffect(() => {
		const node = ref.current
		if (!node) return
		const stored = window.localStorage.getItem(TEXT_KEY) ?? ""
		if (stored.trim().length > 0) node.textContent = stored
	}, [])

	// Follow edits made in any other specimen or in the controls bar.
	useEffect(() => {
		function apply(event: Event) {
			const node = ref.current
			if (!node || node === document.activeElement) return
			const next = (event as CustomEvent<string>).detail ?? ""
			node.textContent = next.trim().length > 0 ? next : defaultText
		}
		window.addEventListener(TEXT_EVENT, apply)
		return () => window.removeEventListener(TEXT_EVENT, apply)
	}, [defaultText])

	function publish(value: string) {
		window.localStorage.setItem(TEXT_KEY, value)
		window.dispatchEvent(new CustomEvent(TEXT_EVENT, { detail: value }))
	}

	return (
		<p
			ref={ref}
			className={className}
			data-specimen=""
			data-editable=""
			data-default={defaultText}
			contentEditable
			suppressContentEditableWarning
			spellCheck={false}
			role="textbox"
			aria-label={`Preview text for ${defaultText}`}
			title="Click and type to test this font"
			style={{ fontFamily: `"${family}", var(--sys)` }}
			onInput={(event) => publish(event.currentTarget.textContent ?? "")}
			onKeyDown={(event) => {
				// One line only, and Escape puts the family name back.
				if (event.key === "Enter") {
					event.preventDefault()
					event.currentTarget.blur()
				}
				if (event.key === "Escape") {
					event.preventDefault()
					event.currentTarget.textContent = defaultText
					publish("")
					event.currentTarget.blur()
				}
			}}
			onBlur={(event) => {
				if ((event.currentTarget.textContent ?? "").trim().length > 0) return
				event.currentTarget.textContent = defaultText
				publish("")
			}}
		>
			{defaultText}
		</p>
	)
}
