import { canWrite, writeClient } from "./supabase"

/**
 * An operational note about this project: which account was used where, which
 * email owns a service, and any reminder worth keeping with the app instead of
 * in a scratch file.
 *
 * The table has row level security enabled with no policies, so only the
 * service role key can touch it. Every call here must sit behind an admin check.
 */
export interface ProjectNote {
	id: string
	label: string
	value: string | null
	detail: string | null
	category: string | null
	sort_order: number
	created_at: string
	updated_at: string
}

export async function listProjectNotes(): Promise<ProjectNote[]> {
	if (!canWrite) return []
	const { data, error } = await writeClient()
		.from("project_notes")
		.select("*")
		.order("sort_order", { ascending: true })
		.order("created_at", { ascending: true })
	if (error) return []
	return (data ?? []) as ProjectNote[]
}
