import { readClient } from "./supabase"
import { authServerClient } from "./supabaseServer"

/** Public like counts per font, aggregated by a database view. */
export async function favoriteCounts(): Promise<Map<string, number>> {
	const client = readClient()
	const counts = new Map<string, number>()
	if (!client) return counts
	const { data } = await client
		.from("font_favorite_counts")
		.select("font_id, favorite_count")
	for (const row of data ?? []) {
		counts.set(row.font_id as string, Number(row.favorite_count) || 0)
	}
	return counts
}

/** Font ids the signed-in user has liked. Empty when nobody is signed in. */
export async function myFavoriteIds(): Promise<Set<string>> {
	const client = await authServerClient()
	const { data: userData } = await client.auth.getUser()
	if (!userData.user) return new Set()
	const { data } = await client.from("favorites").select("font_id")
	return new Set((data ?? []).map((row) => row.font_id as string))
}
