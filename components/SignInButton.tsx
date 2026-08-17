"use client"

import { useState } from "react"
import { browserClient } from "@/lib/supabaseBrowser"

function GoogleGlyph() {
	return (
		<span className="googleChip" aria-hidden="true">
			<svg viewBox="0 0 48 48" role="img">
				<path
					fill="#EA4335"
					d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.5 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.3 17.6 9.5 24 9.5z"
				/>
				<path
					fill="#4285F4"
					d="M46.1 24.6c0-1.6-.1-2.8-.4-4.1H24v9.1h12.5c-.3 2.1-1.6 5.2-4.7 7.3l7.6 5.9c4.5-4.2 6.7-10.3 6.7-18.2z"
				/>
				<path
					fill="#FBBC05"
					d="M10.4 28.7A14.5 14.5 0 019.6 24c0-1.6.3-3.2.8-4.7l-7.8-6.1A24 24 0 000 24c0 3.9.9 7.5 2.6 10.8l7.8-6.1z"
				/>
				<path
					fill="#34A853"
					d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2 1.4-4.8 2.4-8.3 2.4-6.4 0-11.7-3.8-13.6-9.1l-7.8 6.1C6.5 42.6 14.6 48 24 48z"
				/>
			</svg>
		</span>
	)
}

/** Starts the Google OAuth redirect. */
export default function SignInButton({
	next = "/",
	label = "Continue with Google",
}: {
	next?: string
	label?: string
}) {
	const [busy, setBusy] = useState(false)
	const [error, setError] = useState("")

	async function signIn() {
		setBusy(true)
		setError("")
		// Uses the current origin, so it works on 3000, 3001 and production.
		const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
		const { error: signInError } = await browserClient().auth.signInWithOAuth({
			provider: "google",
			options: { redirectTo, queryParams: { prompt: "select_account" } },
		})
		if (signInError) {
			setError(signInError.message)
			setBusy(false)
		}
	}

	return (
		<span className="signInRow">
			<button
				type="button"
				className="googleButton"
				onClick={signIn}
				disabled={busy}
			>
				<GoogleGlyph />
				<span>{busy ? "Redirecting..." : label}</span>
			</button>
			{error ? <span className="signInError">{error}</span> : null}
		</span>
	)
}
