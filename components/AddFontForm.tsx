"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { addFontAction } from "@/app/actions"
import { emptyState } from "@/lib/actionState"
import { isFontFileName } from "@/lib/fontMeta"
import { prepareFace, savedPercent, sizeLabel } from "@/lib/uploadFont"

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

function TickGlyph() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path
				d="M4 12.5l5 5L20 6.5"
				fill="none"
				stroke="currentColor"
				strokeWidth="2.4"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

type Entry = {
	key: string
	file: File
	status: "uploading" | "ready" | "failed"
	/** Filled in once Supabase has compressed and stored the file. */
	path?: string
	format?: string | null
	before: number
	after: number
	converted?: boolean
	note?: string
}

function keyOf(file: File) {
	return `${file.name}:${file.size}`
}

/** Three-step panel for adding a family from local files or a web link. */
export default function AddFontForm() {
	const [state, formAction, pending] = useActionState(addFontAction, emptyState)
	const [queue, setQueue] = useState<Entry[]>([])
	const [dragging, setDragging] = useState(false)
	const inputRef = useRef<HTMLInputElement>(null)

	const uploading = queue.some((entry) => entry.status === "uploading")
	const ready = queue.filter((entry) => entry.status === "ready")
	const busy = uploading || pending

	function patch(key: string, changes: Partial<Entry>) {
		setQueue((current) =>
			current.map((entry) =>
				entry.key === key ? { ...entry, ...changes } : entry,
			),
		)
	}

	/** Sends one file to the Edge Function, which compresses and stores it. */
	async function send(entry: Entry) {
		patch(entry.key, { status: "uploading", note: undefined })
		try {
			const face = await prepareFace(entry.file)
			patch(entry.key, {
				status: "ready",
				path: face.path,
				format: face.format,
				before: face.before,
				after: face.after,
				converted: face.converted,
				note: face.note,
			})
		} catch (error) {
			patch(entry.key, {
				status: "failed",
				note: error instanceof Error ? error.message : "Upload failed",
			})
		}
	}

	/**
	 * Files are collected here rather than left in the input, so a second drop or
	 * a second trip through the file dialog adds to the list instead of replacing
	 * everything that was picked before.
	 */
	async function add(incoming: FileList | File[] | null) {
		const fresh = Array.from(incoming ?? []).filter((file) =>
			isFontFileName(file.name),
		)
		if (fresh.length === 0) return

		const seen = new Set(queue.map((entry) => entry.key))
		const added: Entry[] = []
		for (const file of fresh) {
			const key = keyOf(file)
			if (seen.has(key)) continue
			seen.add(key)
			added.push({
				key,
				file,
				status: "uploading",
				before: file.size,
				after: file.size,
			})
		}
		if (added.length === 0) return

		setQueue((current) => [...current, ...added])
		// Free the input so picking the same file again still fires a change event.
		if (inputRef.current) inputRef.current.value = ""

		// One at a time keeps the connection and the log readable.
		for (const entry of added) await send(entry)
	}

	function remove(key: string) {
		setQueue((current) => current.filter((entry) => entry.key !== key))
	}

	function clearAll() {
		setQueue([])
	}

	// The transfer happens in this tab, so warn before it is thrown away.
	useEffect(() => {
		if (!busy) return
		function hold(event: BeforeUnloadEvent) {
			event.preventDefault()
			event.returnValue = ""
		}
		window.addEventListener("beforeunload", hold)
		return () => window.removeEventListener("beforeunload", hold)
	}, [busy])

	// Clear the queue once the family is saved.
	useEffect(() => {
		if (state.ok) setQueue([])
	}, [state])

	const before = ready.reduce((sum, entry) => sum + entry.before, 0)
	const after = ready.reduce((sum, entry) => sum + entry.after, 0)
	const saved = savedPercent(before, after)
	const doneCount = queue.filter((entry) => entry.status !== "uploading").length

	return (
		<form action={formAction} className="addPanel">
			<input
				type="hidden"
				name="prepared"
				value={JSON.stringify(
					ready.map((entry) => ({
						path: entry.path,
						name: entry.file.name,
						format: entry.format ?? null,
					})),
				)}
			/>

			<div className="addPanelHead">
				<div>
					<span className="addEyebrow">Add a font</span>
					<h2 className="addTitle">Bring a family into the library</h2>
					<p className="addHint">
						Upload the files you downloaded, or paste a stylesheet link. Every
						.ttf and .otf is compressed to WOFF2 on Supabase as it arrives, so
						storage stays small and previews load fast.
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

			{state.message ? (
				<div
					className={state.ok ? "addBanner good" : "addBanner bad"}
					role="status"
					aria-live="polite"
				>
					<span className="addBannerIcon">
						{state.ok ? <TickGlyph /> : "!"}
					</span>
					<span>
						<strong>{state.ok ? "Saved to the library" : "Not saved"}</strong>
						<span>{state.message}</span>
					</span>
				</div>
			) : null}

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
								event.preventDefault()
								setDragging(false)
								void add(event.dataTransfer.files)
							}}
						>
							<span className="dropIcon">
								<UploadGlyph />
							</span>
							<span className="dropText">
								<strong>
									{queue.length > 0 ? "Add more font files" : "Choose font files"}
								</strong>
								<span>
									.ttf .otf .ttc .woff .woff2 - drop or pick as many times as you
									like, every batch stacks up
								</span>
							</span>
							<input
								ref={inputRef}
								type="file"
								multiple
								accept=".ttf,.otf,.ttc,.woff,.woff2,font/*"
								onChange={(event) => void add(event.target.files)}
							/>
						</label>

						{queue.length > 0 ? (
							<>
								<div className="fileChips">
									{queue.map((entry) => (
										<span
											className="fileChip"
											key={entry.key}
											data-status={entry.status}
										>
											{entry.file.name}{" "}
											{entry.status === "uploading" ? (
												<code>compressing on Supabase...</code>
											) : entry.status === "failed" ? (
												<code>{entry.note ?? "failed"}</code>
											) : entry.converted ? (
												<code>
													WOFF2 {sizeLabel(entry.after)} -{" "}
													{savedPercent(entry.before, entry.after)}% smaller
												</code>
											) : (
												<code>
													{sizeLabel(entry.after)}
													{entry.note ? ` - ${entry.note}` : ""}
												</code>
											)}
											{entry.status === "failed" ? (
												<button type="button" onClick={() => void send(entry)}>
													Retry
												</button>
											) : null}
											<button
												type="button"
												aria-label={`Remove ${entry.file.name}`}
												title={`Remove ${entry.file.name}`}
												onClick={() => remove(entry.key)}
											>
												&times;
											</button>
										</span>
									))}
								</div>

								<div className="fileTally" aria-live="polite">
									<span>
										{uploading
											? `Uploading and compressing ${doneCount + 1} of ${queue.length} - keep this tab open`
											: `${ready.length} ${ready.length === 1 ? "file" : "files"} stored - ${sizeLabel(after)}${saved > 0 ? `, ${saved}% smaller than the ${sizeLabel(before)} you picked` : ""}`}
									</span>
									<button
										type="button"
										className="fileClear"
										onClick={clearAll}
										disabled={uploading}
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
				<button className="addSubmit" type="submit" disabled={busy}>
					<PlusGlyph />
					{pending
						? "Saving..."
						: uploading
							? "Compressing..."
							: "Add to library"}
				</button>

				<p className="addFootNote">
					Files go straight to Supabase, get compressed there and are stored
					before you press Add, so large families are no longer limited by the
					form. Keep the tab open until each file reads as stored - closing it
					mid-upload cancels that file. Weights and italics are read from file
					names and can be corrected below.
				</p>
			</div>
		</form>
	)
}
