import Link from "next/link"
import AddFontForm from "@/components/AddFontForm"
import FontAdminRow from "@/components/FontAdminRow"
import ProjectNotes from "@/components/ProjectNotes"
import SignInButton from "@/components/SignInButton"
import { adminLockEnabled, isAdminUser } from "@/lib/auth"
import { listAllFonts, listMyFonts } from "@/lib/fonts"
import { listProjectNotes } from "@/lib/projectNotes"
import { canWrite, isSupabaseConfigured } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/supabaseServer"

export const dynamic = "force-dynamic"

export const metadata = {
	title: "Add and manage fonts",
	robots: { index: false, follow: false },
}

export default async function ManagePage() {
	if (!isSupabaseConfigured) {
		return (
			<main>
				<h1>Manage</h1>
				<div className="notice error">
					Add your Supabase keys to <code>.env.local</code> first.
				</div>
			</main>
		)
	}

	const user = await getCurrentUser()
	if (!user) {
		return (
			<main>
				<h1>Manage</h1>
				<p className="lede">
					Sign in with Google to add fonts. Anyone signed in can contribute; only
					the admin can delete.
				</p>
				<SignInButton next="/manage" />
			</main>
		)
	}

	const isAdmin = isAdminUser(user)
	const fonts =
		isAdmin && canWrite
			? await listAllFonts("alphabetical")
			: await listMyFonts(user.id, "alphabetical")
	const notes = isAdmin && canWrite ? await listProjectNotes() : []

	return (
		<main>
			<h1>Add and manage fonts</h1>
			<p className="lede">
				Signed in as {user.email}
				{isAdmin ? " (admin)" : " (contributor)"}. Upload font files or paste a
				link, and fix any weight the importer guessed wrong.{" "}
				<Link href="/my">My space</Link> ·{" "}
				<Link href="/">Public library</Link>
			</p>

			{!canWrite ? (
				<div className="notice error">
					<code>SUPABASE_SERVICE_ROLE_KEY</code> is missing, so saving is disabled.
					Add it to <code>.env.local</code> and to your Vercel environment
					variables.
				</div>
			) : null}

			{!adminLockEnabled() ? (
				<div className="notice">
					<code>ADMIN_EMAILS</code> is empty, so every signed-in account currently
					counts as admin and can delete fonts. Set it to your own Google address
					before sharing the site.
				</div>
			) : null}

			<div className="notice">
				The first copy of a family joins the public library. If someone already
				added it, your copy is saved to your space only.{" "}
				{isAdmin
					? "As admin you can edit and delete any family, including private copies."
					: "You can edit the families you added; deleting is reserved for the admin."}
			</div>

			<AddFontForm />

			{isAdmin && canWrite ? <ProjectNotes notes={notes} /> : null}

			<h2 style={{ marginTop: 32 }}>
				{isAdmin ? "All families" : "Families you added"} ({fonts.length})
			</h2>
			{fonts.length === 0 ? (
				<p className="meta">Nothing here yet. Add your first family above.</p>
			) : null}
			{fonts.map((font) => (
				<FontAdminRow
					key={font.id}
					font={font}
					canDelete={isAdmin}
					canEdit={isAdmin || !font.added_by || font.added_by === user.id}
				/>
			))}
		</main>
	)
}
