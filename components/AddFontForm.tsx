"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { addFontAction } from "@/app/actions"
import { emptyState } from "@/lib/actionState"
import { isFontFileName } from "@/lib/fontMeta"

function UploadGlyph() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path
				d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M4 15v2.5A2.5 2.5 0 0 0 6.5 20h11a2.5 2.5 0 0 0 2.5-2.5V15"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.8"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

function PlusGlyph() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path
				d="M12 5v14M5 12h14"
				fill="none"
				stroke="currentColor"
				strokeWidth="2.2"
				strokeLinecap="round"
			/>
		</svg>
	)
}

function sizeLabel(bytes: number) {
	if (bytes < 1024) return `${bytes} B`
	if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** One entry per file, so the same name cannot be added twice. */
function keyOf(file: File) {
	return `${file.name}:${file.size}`
}

/** Three-step panel for adding a family from local files or a web link. */
export default function AddFontForm() {
	const [state, formAction, pending] = useActionState(addFontAction, emptyState)
	const [picked, setPicked] = useState<File[]>([])
	const [dragging, setDragging] = useState(false)
	const inputRef = useRef<HTMLInputElement>(null)

	/**
	 * A file input replaces its selection on every pick, so the accumulated list
	 * is kept in state and written back into the input through a DataTransfer.
	 * That way several drops or several trips through the file dialog all end up
	 * in one submission.
	 */
	function sync(files: File[]) {
		setPicked(files)
		const input = inputRef.current
		if (!input || typeof DataTransfer === "undefined") return
		const bag = new DataTransfer()
		for (const file of files) bag.items.add(file)
		input.files = bag.files
	}

	function add(incoming: FileList | File[] | null) {
		const fresh = Array.from(incoming ?? []).filter((file) =>
			isFontFileName(file.name),
		)
		if (fresh.length === 0) return
		const seen = new Set(picked.map(keyOf))
		const merged = [...picked]
		for (const file of fresh) {
			if (seen.has(keyOf(file))) continue
			seen.add(keyOf(file))
			merged.push(file)
		}
		sync(merged)
	}

	function remove(key: string) {
		sync(picked.filter((file) => keyOf(file) !== key))
	}

	// Clear the queue once a family has been saved.
	useEffect(() => {
		if (state.ok) sync([])
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [state])

	const totalBytes = picked.reduce((sum, file) => sum + file.size, 0)

	return (
		<form action={formAction} className="addPanel">
			<div className="addPanelHead">
				<div>
					<span className="addEyebrow">Add a font</span>
					<h2 className="addTitle">Bring a family into the library</h2>
					<p className="addHint">
						Upload the files you downloaded, or paste a stylesheet link. Previews
						are generated for every weight and italic you provide.
					</p>
				</div>
				<div className="addSteps">
					<span className="addStepChip">
						<span className="addStepNum">1</span> Name it
					</span>
					<span className="addStepChip">
						<span className="addStepNum">2</span> Source
					</span>
					<span className="addStepChip">
						<span className="addStepNum">3</span> Save
					</span>
				</div>
			</div>

			<div className="addBody">
				<section className="addSection">
					<div className="addSectionHead">
						<span className="addStepDot">1</span>
						<h3>Identity</h3>
						<small>Only the family name is required</small>
					</div>
					<div className="addGrid">
						<label className="field">
							<span>Family name</span>
							<input
								type="text"
								name="name"
								placeholder="Roc Grotesk"
								autoComplete="off"
								required
							/>
						</label>
						<label className="field">
							<span>Category</span>
							<input
								type="text"
								name="category"
								placeholder="Sans, Serif, Display..."
								autoComplete="off"
							/>
						</label>
						<label className="field">
							<span>License</span>
							<input
								type="text"
								name="license"
								placeholder="OFL, personal use..."
								autoComplete="off"
							/>
						</label>
					</div>
				</section>

				<section className="addSection">
					<div className="addSectionHead">
						<span className="addStepDot">2</span>
						<h3>Where the font lives</h3>
						<small>Files or a link - either one works</small>
					</div>

					<div className="dropField">
						<label
							className="dropZone"
							data-dragging={dragging ? "true" : undefined}
							onDragOver={(event) => {
								event.preventDefault()
								setDragging(true)
							}}
							onDragLeave={() => setDragging(false)}
							onDrop={(event) => {
								// Handled here so a second drop adds to the queue instead of
								// replacing what the input already holds.
								event.preventDefault()
								setDragging(false)
								add(event.dataTransfer.files)
							}}
						>
							<span className="dropIcon">
								<UploadGlyph />
							</span>
							<span className="dropText">
								<strong>
									{picked.length > 0 ? "Add more font files" : "Choose font files"}
								</strong>
								<span>
									.ttf .otf .ttc .woff .woff2 - drop or pick as many times as you
									like, they all stack up
								</span>
							</span>
							<input
								ref={inputRef}
								type="file"
								name="files"
								multiple
								accept=".ttf,.otf,.ttc,.woff,.woff2,font/*"
								onChange={(event) => {
									const chosen = Array.from(event.target.files ?? [])
									// Re-merge, because the input now holds only the new pick.
									const seen = new Set(picked.map(keyOf))
									const merged = [...picked]
									for (const file of chosen) {
										if (!isFontFileName(file.name)) continue
										if (seen.has(keyOf(file))) continue
										seen.add(keyOf(file))
										merged.push(file)
									}
									sync(merged)
								}}
							/>
						</label>

						{picked.length > 0 ? (
							<>
								<div className="fileChips">
									{picked.map((file) => (
										<span className="fileChip" key={keyOf(file)}>
											{file.name} <code>{sizeLabel(file.size)}</code>
											<button
												type="button"
												aria-label={`Remove ${file.name}`}
												title={`Remove ${file.name}`}
												onClick={() => remove(keyOf(file))}
											>
												&times;
											</button>
										</span>
									))}
								</div>
								<div className="fileTally">
									<span>
										{picked.length} {picked.length === 1 ? "file" : "files"} ready
										- {sizeLabel(totalBytes)} in total
									</span>
									<button
										type="button"
										className="fileClear"
										onClick={() => sync([])}
									>
										Clear all
									</button>
								</div>
							</>
						) : null}
					</div>

					<div className="orRule">or use a web source</div>

					<div className="addGrid">
						<label className="field">
							<span>URL (stylesheet or font file)</span>
							<input
								type="url"
								name="url"
								placeholder="https://fonts.googleapis.com/css2?family=..."
							/>
						</label>
						<label className="field">
							<span>CSS font-family (stylesheet links only)</span>
							<input
								type="text"
								name="cssFamily"
								placeholder="Fraunces"
								autoComplete="off"
							/>
						</label>
						<label className="field">
							<span>Source page</span>
							<input
								type="url"
								name="sourcePage"
								placeholder="https://fontshare.com/fonts/tanker"
							/>
						</label>
					</div>
				</section>

				<section className="addSection">
					<div className="addSectionHead">
						<span className="addStepDot">3</span>
						<h3>Notes for later</h3>
						<small>Optional</small>
					</div>
					<label className="field">
						<span>Notes</span>
						<textarea
							name="notes"
							placeholder="Where you plan to use it, pairing ideas, what you liked about it..."
						/>
					</label>
				</section>
			</div>

			<div className="addFoot">
				<button className="addSubmit" type="submit" disabled={pending}>
					<PlusGlyph />
					{pending ? "Saving..." : "Add to library"}
				</button>

				{state.message ? (
					<span className={state.ok ? "addStatus" : "addStatus bad"}>
						{state.message}
					</span>
				) : null}

				<p className="addFootNote">
					Weights and italics are detected from file names and can be corrected
					below. Keep each upload under about 4 MB.
				</p>
			</div>
		</form>
	)
}
