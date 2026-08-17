import { getCurrentUser, type SessionUser } from "./supabaseServer"

/** Google accounts allowed to delete fonts and edit anyone's entries. */
export function adminEmails(): string[] {
	return (process.env.ADMIN_EMAILS ?? "")
		.split(",")
		.map((email) => email.trim().toLowerCase())
		.filter(Boolean)
}

export function adminLockEnabled(): boolean {
	return adminEmails().length > 0
}

/**
 * Admins are listed in ADMIN_EMAILS. If that list is empty the first signed-in
 * account is treated as the admin, so the app still works before configuration.
 */
export function isAdminUser(user: SessionUser | null): boolean {
	if (!user) return false
	const list = adminEmails()
	if (list.length === 0) return true
	return list.includes(user.email.toLowerCase())
}

/** Any signed-in Google user may contribute fonts. */
export async function requireUser(): Promise<SessionUser> {
	const user = await getCurrentUser()
	if (!user) throw new Error("Sign in with Google first.")
	return user
}

/** Deleting, and editing someone else's font, is admin-only. */
export async function requireAdmin(): Promise<SessionUser> {
	const user = await requireUser()
	if (!isAdminUser(user)) {
		throw new Error("Only the library admin can do that.")
	}
	return user
}
