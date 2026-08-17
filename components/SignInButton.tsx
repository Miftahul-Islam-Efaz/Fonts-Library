"use client"

import { useState } from "react"
import { browserClient } from "@/lib/supabaseBrowser"

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
		const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
		const { error: signInError } = await browserClient().auth.signInWithOAuth({
			provider: "google",
			options: { redirectTo },
		})
		if (signInError) {
			setError(signInError.message)
			setBusy(false)
		}
	}

	return (
		<span className="rowActions">
			<button type="button" className="primary" onClick={signIn} disabled={busy}>
				{busy ? "Redirecting…" : label}
			</button>
			{error ? (
				<span style={{ fontSize: 13, color: "var(--warn-text)" }}>{error}</span>
			) : null}
		</span>
	)
}
