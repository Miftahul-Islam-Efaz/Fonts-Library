import { NextResponse } from "next/server"
import { authServerClient } from "@/lib/supabaseServer"

/** Google sends the user back here; swap the code for a cookie session. */
export async function GET(request: Request) {
	const url = new URL(request.url)
	const code = url.searchParams.get("code")
	const next = url.searchParams.get("next") ?? "/"
	const error = url.searchParams.get("error_description")

	if (error) {
		return NextResponse.redirect(
			new URL(`/login?error=${encodeURIComponent(error)}`, url.origin),
		)
	}

	if (code) {
		const client = await authServerClient()
		const { error: exchangeError } = await client.auth.exchangeCodeForSession(code)
		if (exchangeError) {
			return NextResponse.redirect(
				new URL(
					`/login?error=${encodeURIComponent(exchangeError.message)}`,
					url.origin,
				),
			)
		}
	}

	return NextResponse.redirect(new URL(next, url.origin))
}
