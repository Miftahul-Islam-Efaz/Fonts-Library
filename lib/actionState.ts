/** Shared result shape for the form actions. Kept out of the "use server" file, which may only export async functions. */
export interface ActionState {
	ok: boolean
	message: string
}

export const emptyState: ActionState = { ok: true, message: "" }
