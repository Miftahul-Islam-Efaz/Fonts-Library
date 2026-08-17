"use server"

import { revalidatePath } from "next/cache"
import type { ActionState } from "@/lib/actionState"
import { requireAdmin } from "@/lib/auth"
import { writeClient } from "@/lib/supabase"

function text(formData: FormData, key: string): string {
	const value = formData.get(key)
	return typeof value === "string" ? value.trim() : ""
}

function fail(message: string): ActionState {
	return { ok: false, message }
}

/**
 * Create or update one project note. Admin-only, and the table is reachable
 * exclusively through the service role key.
 */
export async function saveProjectNoteAction(
	_prev: ActionState,
	formData: FormData,
): Promise<ActionState> {
	try {
		await requireAdmin()
		const client = writeClient()

		const id = text(formData, "id")
		const label = text(formData, "label")
		if (!label) return fail("Give the note a label.")

		const payload = {
			label,
			value: text(formData, "value") || null,
			detail: text(formData, "detail") || null,
			category: text(formData, "category") || null,
			sort_order: Number(text(formData, "sortOrder")) || 0,
			updated_at: new Date().toISOString(),
		}

		if (id) {
			const { error } = await client
				.from("project_notes")
				.update(payload)
				.eq("id", id)
			if (error) return fail(error.message)
		} else {
			const { error } = await client.from("project_notes").insert(payload)
			if (error) return fail(error.message)
		}

		revalidatePath("/manage")
		return {
			ok: true,
			message: id ? `Saved "${label}".` : `Added "${label}".`,
		}
	} catch (error) {
		return fail(error instanceof Error ? error.message : "Something went wrong.")
	}
}

/** Remove a project note. Admin-only. */
export async function deleteProjectNoteAction(
	_prev: ActionState,
	formData: FormData,
): Promise<ActionState> {
	try {
		await requireAdmin()
		const id = text(formData, "id")
		if (!id) return fail("Missing note id.")

		const { error } = await writeClient()
			.from("project_notes")
			.delete()
			.eq("id", id)
		if (error) return fail(error.message)

		revalidatePath("/manage")
		return { ok: true, message: "Note deleted." }
	} catch (error) {
		return fail(error instanceof Error ? error.message : "Something went wrong.")
	}
}
