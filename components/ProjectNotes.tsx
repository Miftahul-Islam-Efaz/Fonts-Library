"use client"

import { useActionState, useState } from "react"
import {
	deleteProjectNoteAction,
	saveProjectNoteAction,
} from "@/app/notesActions"
import { emptyState } from "@/lib/actionState"
import type { ProjectNote } from "@/lib/projectNotes"

function KeyGlyph() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" className="noteGlyph">
			<path
				d="M14.5 3a6.5 6.5 0 1 0-2.4 12.6L10 17.7v2.6h2.6l1-1 1.6 1.6 1.6-1.6-1.6-1.6 1-1v-2.2A6.5 6.5 0 0 0 14.5 3Zm2 5.2a1.6 1.6 0 1 1-1.6-1.6 1.6 1.6 0 0 1 1.6 1.6Z"
				fill="currentColor"
			/>
		</svg>
	)
}

function NoteCard({ note }: { note: ProjectNote }) {
	const [saveState, save, saving] = useActionState(
		saveProjectNoteAction,
		emptyState,
	)
	const [deleteState, remove, deleting] = useActionState(
		deleteProjectNoteAction,
		emptyState,
	)
	const [open, setOpen] = useState(false)
	const state = deleteState.message ? deleteState : saveState

	return (
		<div className="noteCard" data-open={open ? "yes" : "no"}>
			<div className="noteFace">
				<div className="noteFaceText">
					<span className="noteLabel">{note.label}</span>
					<span className="noteValue" data-empty={note.value ? "no" : "yes"}>
						{note.value || "Not set yet"}
					</span>
					{note.detail ? (
						<span className="noteDetail">{note.detail}</span>
					) : null}
				</div>
				<div className="noteFaceSide">
					{note.category ? (
						<span className="noteTag">{note.category}</span>
					) : null}
					<button
						type="button"
						className="noteEdit"
						onClick={() => setOpen((value) => !value)}
					>
						{open ? "Close" : "Edit"}
					</button>
				</div>
			</div>

			{open ? (
				<div className="noteEditor">
					<form action={save} className="noteForm">
						<input type="hidden" name="id" value={note.id} />
						<div className="noteGrid">
							<label className="field">
								<span>Label</span>
								<input name="label" type="text" defaultValue={note.label} />
							</label>
							<label className="field">
								<span>Value</span>
								<input
									name="value"
									type="text"
									defaultValue={note.value ?? ""}
									placeholder="name@gmail.com"
								/>
							</label>
							<label className="field">
								<span>Group</span>
								<input
									name="category"
									type="text"
									defaultValue={note.category ?? ""}
									placeholder="Accounts"
								/>
							</label>
							<label className="field">
								<span>Order</span>
								<input
									name="sortOrder"
									type="text"
									defaultValue={String(note.sort_order)}
								/>
							</label>
						</div>
						<label className="field">
							<span>Note</span>
							<textarea
								name="detail"
								rows={2}
								defaultValue={note.detail ?? ""}
								placeholder="What this account is used for"
							/>
						</label>
						<div className="noteActions">
							<button type="submit" className="noteSave" disabled={saving}>
								{saving ? "Saving..." : "Save note"}
							</button>
						</div>
					</form>

					<form action={remove} className="noteDeleteForm">
						<input type="hidden" name="id" value={note.id} />
						<button type="submit" className="noteDelete" disabled={deleting}>
							{deleting ? "Deleting..." : "Delete"}
						</button>
					</form>
				</div>
			) : null}

			{state.message ? (
				<span className={state.ok ? "addStatus" : "addStatus bad"}>
					{state.message}
				</span>
			) : null}
		</div>
	)
}

function NewNote() {
	const [state, save, pending] = useActionState(
		saveProjectNoteAction,
		emptyState,
	)
	return (
		<form action={save} className="noteNew">
			<div className="noteGrid">
				<label className="field">
					<span>Label</span>
					<input
						name="label"
						type="text"
						placeholder="Google Cloud Console account"
						required
					/>
				</label>
				<label className="field">
					<span>Value</span>
					<input name="value" type="text" placeholder="name@gmail.com" />
				</label>
				<label className="field">
					<span>Group</span>
					<input name="category" type="text" placeholder="Accounts" />
				</label>
				<label className="field">
					<span>Order</span>
					<input name="sortOrder" type="text" placeholder="100" />
				</label>
			</div>
			<label className="field">
				<span>Note</span>
				<textarea
					name="detail"
					rows={2}
					placeholder="Anything worth remembering about this account"
				/>
			</label>
			<div className="noteActions">
				<button type="submit" className="noteSave" disabled={pending}>
					{pending ? "Adding..." : "Add note"}
				</button>
				{state.message ? (
					<span className={state.ok ? "addStatus" : "addStatus bad"}>
						{state.message}
					</span>
				) : null}
			</div>
		</form>
	)
}

/**
 * Admin-only project notebook: which account owns which service, stored in
 * Supabase so it travels with the project instead of living in a text file.
 */
export default function ProjectNotes({ notes }: { notes: ProjectNote[] }) {
	return (
		<section className="addPanel notePanel">
			<div className="addPanelHead">
				<span className="addEyebrow">Admin only</span>
				<h2 className="addTitle">
					<KeyGlyph /> Project notes
				</h2>
				<p className="addHint">
					Accounts and settings behind this site. Stored in Supabase with row
					level security and no public policy, so only admin server actions can
					read it. This page is never indexed.
				</p>
			</div>

			<div className="addBody">
				{notes.length === 0 ? (
					<p className="addFootNote">No notes yet. Add the first one below.</p>
				) : (
					<div className="noteList">
						{notes.map((note) => (
							<NoteCard key={note.id} note={note} />
						))}
					</div>
				)}

				<div className="addSection">
					<div className="addSectionHead">
						<span className="addStepNum">+</span>
						<span>New note</span>
					</div>
					<NewNote />
				</div>
			</div>
		</section>
	)
}
