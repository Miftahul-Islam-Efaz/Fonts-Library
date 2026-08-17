"use client"

import { useActionState } from "react"
import { addFontAction } from "@/app/actions"
import { emptyState } from "@/lib/actionState"

export default function AddFontForm() {
	const [state, formAction, pending] = useActionState(addFontAction, emptyState)

	return (
		<form action={formAction}>
			<fieldset>
				<legend>Add a font</legend>

				<div className="formGrid">
					<label className="field">
						<span>Family name</span>
						<input type="text" name="name" placeholder="Roc Grotesk" required />
					</label>
					<label className="field">
						<span>Category</span>
						<input
							type="text"
							name="category"
							placeholder="Sans, Serif, Display…"
						/>
					</label>
					<label className="field">
						<span>Font files (.ttf .otf .woff .woff2)</span>
						<input
							type="file"
							name="files"
							multiple
							accept=".ttf,.otf,.ttc,.woff,.woff2,font/*"
						/>
					</label>
					<label className="field">
						<span>Or a URL (stylesheet or font file)</span>
						<input
							type="url"
							name="url"
							placeholder="https://fonts.googleapis.com/css2?family=…"
						/>
					</label>
					<label className="field">
						<span>CSS font-family (only for stylesheet links)</span>
						<input type="text" name="cssFamily" placeholder="Fraunces" />
					</label>
					<label className="field">
						<span>Source page</span>
						<input
							type="url"
							name="sourcePage"
							placeholder="https://fontshare.com/fonts/tanker"
						/>
					</label>
					<label className="field">
						<span>License</span>
						<input type="text" name="license" placeholder="OFL, personal use…" />
					</label>
				</div>

				<label className="field" style={{ marginTop: 12 }}>
					<span>Notes</span>
					<textarea name="notes" placeholder="Where you plan to use it…" />
				</label>

				<div className="rowActions">
					<button className="primary" type="submit" disabled={pending}>
						{pending ? "Saving…" : "Add to library"}
					</button>
					{state.message ? (
						<span
							style={{
								fontSize: 13,
								color: state.ok ? "var(--muted)" : "var(--warn-text)",
							}}
						>
							{state.message}
						</span>
					) : null}
				</div>

				<p className="meta" style={{ marginTop: 12, marginBottom: 0 }}>
					Weights and italics are detected from file names and can be corrected
					below. Keep each upload under about 4 MB, the Vercel request limit.
				</p>
			</fieldset>
		</form>
	)
}
