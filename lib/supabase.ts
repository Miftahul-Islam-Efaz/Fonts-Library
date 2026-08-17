import { createClient, type SupabaseClient } from "@supabase/supabase-js"

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""

/** Public storage bucket that holds uploaded font files. */
export const FONT_BUCKET = process.env.SUPABASE_FONT_BUCKET ?? "font-files"

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
export const canWrite = Boolean(SUPABASE_URL && SERVICE_ROLE_KEY)

/** Read-only client used during server rendering. */
export function readClient(): SupabaseClient | null {
	if (!isSupabaseConfigured) return null
	return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
		auth: { persistSession: false },
	})
}

/** Server-only client with the service role key. Never import this in a client component. */
export function writeClient(): SupabaseClient {
	if (!canWrite) {
		throw new Error(
			"Missing SUPABASE_SERVICE_ROLE_KEY. Add it to .env.local (and to your Vercel project) before adding or deleting fonts.",
		)
	}
	return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
		auth: { persistSession: false },
	})
}

/** Public URL of an object in the font bucket. */
export function publicFileUrl(path: string): string {
	return `${SUPABASE_URL}/storage/v1/object/public/${FONT_BUCKET}/${path}`
}
