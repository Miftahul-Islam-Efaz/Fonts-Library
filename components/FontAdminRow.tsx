"use client"

import { useActionState } from "react"
import {
	deleteFaceAction,
	deleteFontAction,
	updateFontAction,
} from "@/app/actions"
import { emptyState } from "@/lib/actionState"
import { WEIGHT_OPTIONS } from "@/lib/fontMeta"
import type { FontRecord } from "@/lib/types"

function Status({ ok, message }: { ok: boolean; message: string }) {
	if (!message) return null
	return (
		<span
			style={{ fontSize: 13, color: ok ? "var(--muted)" : "var(--warn-text)" }}
		>
			{message}
		</span>
	)
}

/**
 * Anyone signed in can edit the families they added; deleting is admin-only, so
 * the destructive controls are not even rendered for contributors.
 */
export default function FontAdminRow({
	font,
	canDelete = false,
	canEdit = true,
}: {
	font: FontRecord
	canDelete?: boolean
	canEdit?: boolean
}) {
	const [updateState, updateAction, updating] = useActionState(
		updateFontAction,
		emptyState,
	)
	const [deleteState, deleteAction, deleting] = useActionState(
		deleteFontAction,
		emptyState,
	)
	const [faceState, faceAction, removingFace] = useActionState(
		deleteFaceAction,
		emptyState,
	)

	return (
		<article className="fontCard">
			<div className="cardTop">
				<h3>{font.name}</h3>
				<span className={font.source_type === "file" ? "badge file" : "badge"}>
					{font.source_type === "file" ? "Files" : "Link"}
				</span>
				{font.added_by_name ? (
					<span className="meta" style={{ margin: 0 }}>
						added by {font.added_by_name}
					</span>
				) : null}
				<a href={`/fonts/${font.slug}`}>View specimen</a>
			</div>

			{!canEdit ? (
				<p className="meta">
					Someone else added this family, so only the admin can change it.
				</p>
			) : (
				<form action={updateAction}>
					<input type="hidden" name="id" value={font.id} />
					<div className="formGrid">
						<label className="field">
							<span>Name</span>
							<input type="text" name="name" defaultValue={font.name} required />
						</label>
						<label className="field">
							<span>Category</span>
							<input
								type="text"
								name="category"
								defaultValue={font.category ?? ""}
								placeholder="serif, sans, display, script, mono"
							/>
						</label>
						<label className="field">
							<span>Stylesheet or font URL</span>
							<input type="url" name="url" defaultValue={font.css_url ?? ""} />
						</label>
						<label className="field">
							<span>CSS font-family</span>
							<input
								type="text"
								name="cssFamily"
								defaultValue={font.css_family ?? ""}
							/>
						</label>
						<label className="field">
							<span>Source page</span>
							<input
								type="url"
								name="sourcePage"
								defaultValue={font.source_page ?? ""}
							/>
						</label>
						<label className="field">
							<span>License</span>
							<input type="text" name="license" defaultValue={font.license ?? ""} />
						</label>
						<label className="field">
							<span>Add more style files</span>
							<input
								type="file"
								name="files"
								multiple
								accept=".ttf,.otf,.ttc,.woff,.woff2,font/*"
							/>
						</label>
					</div>

					<label className="field" style={{ marginTop: 12 }}>
						<span>Notes</span>
						<textarea name="notes" defaultValue={font.notes ?? ""} />
					</label>

					{font.faces.length > 0 ? (
						<div style={{ marginTop: 16 }}>
							<p className="styleLabel">Stored styles</p>
							{font.faces.map((face) => (
								<div className="faceEdit" key={face.id}>
									<span style={{ minWidth: 140, color: "var(--muted)" }}>
										{face.label || "Style"}
									</span>
									<select
										name={`face-${face.id}-weight`}
										defaultValue={String(face.weight)}
										aria-label={`Weight for ${face.label ?? "style"}`}
									>
										{WEIGHT_OPTIONS.map((option) => (
											<option key={option.value} value={option.value}>
												{option.value} {option.label}
											</option>
										))}
									</select>
									<select
										name={`face-${face.id}-style`}
										defaultValue={face.style}
										aria-label={`Slant for ${face.label ?? "style"}`}
									>
										<option value="normal">Upright</option>
										<option value="italic">Italic</option>
									</select>
								</div>
							))}
						</div>
					) : null}

					<div className="rowActions">
						<button className="primary" type="submit" disabled={updating}>
							{updating ? "Saving…" : "Save changes"}
						</button>
						<Status ok={updateState.ok} message={updateState.message} />
					</div>
				</form>
			)}

			{canDelete && font.faces.length > 0 ? (
				<form action={faceAction} className="rowActions">
					<input type="hidden" name="slug" value={font.slug} />
					<label className="field">
						<span>Remove one style</span>
						<select name="faceId" aria-label="Style to remove">
							{font.faces.map((face) => (
								<option key={face.id} value={face.id}>
									{face.label || `${face.weight} ${face.style}`}
								</option>
							))}
						</select>
					</label>
					<button type="submit" disabled={removingFace}>
						{removingFace ? "Removing…" : "Remove style"}
					</button>
					<Status ok={faceState.ok} message={faceState.message} />
				</form>
			) : null}

			{canDelete ? (
				<form action={deleteAction} className="rowActions">
					<input type="hidden" name="id" value={font.id} />
					<input type="hidden" name="slug" value={font.slug} />
					<button className="danger" type="submit" disabled={deleting}>
						{deleting ? "Deleting…" : `Delete ${font.name}`}
					</button>
					<Status ok={deleteState.ok} message={deleteState.message} />
				</form>
			) : (
				<p className="meta" style={{ marginTop: 12, marginBottom: 0 }}>
					Only the library admin can delete a family.
				</p>
			)}
		</article>
	)
}
