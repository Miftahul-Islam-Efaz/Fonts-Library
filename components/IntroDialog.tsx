"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import BrandMark from "@/components/BrandMark"
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site"

const SEEN_KEY = "fl:introSeen"

/**
 * Welcome dialog explaining what the app is and how Google sign-in is used.
 *
 * It renders open in the server HTML on purpose: the OAuth branding review and
 * crawlers both need to see this text without running JavaScript. Once a visitor
 * closes it the choice is remembered in localStorage, so it never returns.
 */
export default function IntroDialog() {
	const [open, setOpen] = useState(true)

	const close = useCallback(() => {
		setOpen(false)
		try {
			window.localStorage.setItem(SEEN_KEY, "1")
		} catch {
			// Private mode or blocked storage: the dialog simply shows again.
		}
	}, [])

	useEffect(() => {
		try {
			if (window.localStorage.getItem(SEEN_KEY)) setOpen(false)
		} catch {
			// Ignore storage errors.
		}
	}, [])

	useEffect(() => {
		if (!open) return
		function onKey(event: KeyboardEvent) {
			if (event.key === "Escape") close()
		}
		document.addEventListener("keydown", onKey)
		return () => document.removeEventListener("keydown", onKey)
	}, [open, close])

	if (!open) return null

	return (
		<div
			className="introBackdrop"
			role="dialog"
			aria-modal="true"
			aria-label={`About ${SITE_NAME}`}
			onClick={close}
		>
			<div className="introModal" onClick={(event) => event.stopPropagation()}>
				<button
					type="button"
					className="introClose"
					onClick={close}
					aria-label="Close"
				>
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path
							d="M6 6l12 12M18 6L6 18"
							stroke="currentColor"
							strokeWidth="2.2"
							strokeLinecap="round"
							fill="none"
						/>
					</svg>
				</button>

				<div className="introTop">
					<BrandMark size={44} />
					<div>
						<h2 className="introTitle">{SITE_NAME}</h2>
						<p className="introTagline">{SITE_TAGLINE}</p>
					</div>
				</div>

				<p className="introText">
					A free web app for collecting typefaces. The families you fall in love
					with end up scattered across zip files, bookmarks and download folders,
					so this is one place to keep them: upload font files or paste a
					stylesheet link from anywhere, and every family gets an organised entry
					with a live preview you can type your own text into. Fonts you add are
					saved to your personal space and also join this public community
					library.
				</p>

				<p className="introFine">
					Browsing needs no account. Google sign-in is used only to keep your own
					space and favourites separate, and the app receives your name, email
					address and profile picture only.
				</p>

				<div className="introActions">
					<button type="button" className="introStart" onClick={close}>
						Start browsing
					</button>
					<Link className="introLink" href="/about" onClick={close}>
						About
					</Link>
					<Link className="introLink" href="/privacy" onClick={close}>
						Privacy
					</Link>
				</div>
			</div>
		</div>
	)
}
