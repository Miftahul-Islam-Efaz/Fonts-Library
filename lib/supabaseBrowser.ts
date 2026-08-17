"use client"

import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

let cached: SupabaseClient | null = null

/** Browser client, used only to start the Google OAuth redirect. */
export function browserClient(): SupabaseClient {
	if (!cached) {
		cached = createBrowserClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
		)
	}
	return cached
}
