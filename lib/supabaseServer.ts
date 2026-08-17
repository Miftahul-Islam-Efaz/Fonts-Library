import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./supabase"

export interface SessionUser {
	id: string
	email: string
	name: string | null
	avatar: string | null
}

/**
 * Supabase client bound to the request cookies, so Google sessions survive
 * navigation and work inside server components and server actions.
 */
export async function authServerClient(): Promise<SupabaseClient> {
	const store = await cookies()
	return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
		cookies: {
			getAll() {
				return store.getAll()
			},
			setAll(cookiesToSet) {
				try {
					for (const { name, value, options } of cookiesToSet) {
						store.set(name, value, options)
					}
				} catch {
					// Server components cannot set cookies; the callback route refreshes them.
				}
			},
		},
	})
}

/** The signed-in Google user, or null for anonymous visitors. */
export async function getCurrentUser(): Promise<SessionUser | null> {
	if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null
	const client = await authServerClient()
	const { data, error } = await client.auth.getUser()
	if (error || !data.user) return null
	const meta = data.user.user_metadata ?? {}
	return {
		id: data.user.id,
		email: data.user.email ?? "",
		name: (meta.full_name as string) ?? (meta.name as string) ?? null,
		avatar: (meta.avatar_url as string) ?? (meta.picture as string) ?? null,
	}
}
