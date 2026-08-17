/**
 * Hands a font file to the compress-font Edge Function.
 *
 * The browser does no conversion work at all: the file goes straight to
 * Supabase, the Edge Function converts TrueType and OpenType data to WOFF2 and
 * writes it into the font files bucket, and the response comes back with the
 * stored path. Two useful consequences: the upload never passes through the
 * Next.js server action, so the 4 MB request limit no longer applies, and the
 * conversion runs on Supabase rather than on a member's laptop.
 */

import { browserClient } from "@/lib/supabaseBrowser"

export type PreparedFace = {
	/** Storage path inside the font files bucket. */
	path: string
	/** Original file name, used to guess weight and style. */
	name: string
	storedAs: string
	format: string | null
	before: number
	after: number
	converted: boolean
	note?: string
}

function endpoint() {
	const base = process.env.NEXT_PUBLIC_SUPABASE_URL
	if (!base) throw new Error("Supabase is not configured in this environment.")
	return `${base.replace(/\/$/, "")}/functions/v1/compress-font`
}

/** Uploads one file for server-side compression and returns where it landed. */
export async function prepareFace(file: File): Promise<PreparedFace> {
	const {
		data: { session },
	} = await browserClient().auth.getSession()
	if (!session) throw new Error("Sign in again to upload font files.")

	const body = new FormData()
	body.append("file", file)

	const response = await fetch(endpoint(), {
		method: "POST",
		headers: {
			Authorization: `Bearer ${session.access_token}`,
			apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
		},
		body,
	})

	const payload = (await response.json().catch(() => null)) as
		| (PreparedFace & { error?: string })
		| null

	if (!response.ok || !payload?.path) {
		throw new Error(
			payload?.error ?? `Upload failed for ${file.name} (${response.status}).`,
		)
	}

	return payload
}

/** Percentage saved by conversion, rounded, never below zero. */
export function savedPercent(before: number, after: number): number {
	if (before <= 0 || after >= before) return 0
	return Math.round(((before - after) / before) * 100)
}

export function sizeLabel(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`
	if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
