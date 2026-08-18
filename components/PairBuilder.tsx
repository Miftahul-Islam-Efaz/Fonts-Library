"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

export interface PairOption {
	id: string
	slug: string
	name: string
	family: string
	category: string | null
}

const HEAD_TEXT = "Type that carries the page"
const BODY_TEXT =
	"A pairing works when the headline face brings the personality and the text face disappears into the reading. Judge the rhythm, the spacing and how the two hold together before you commit to them."

const WEIGHTS = [300, 400, 500, 600, 700, 800, 900]

/**
 * Hand-built pairing: pick any two families from the library, type your own
 * words, and read the result at real sizes. Everything is local state, so the
 * preview updates with no round trip.
 */
export default function PairBuilder({ fonts }: { fonts: PairOption[] }) {
	const [headId, setHeadId] = useState(fonts[0]?.id ?? "")
	const [bodyId, setBodyId] = useState(fonts[1]?.id ?? fonts[0]?.id ?? "")
	const [headText, setHeadText] = useState(HEAD_TEXT)
	const [bodyText, setBodyText] = useState(BODY_TEXT)
	const [headSize, setHeadSize] = useState(54)
	const [bodySize, setBodySize] = useState(17)
	const [headWeight, setHeadWeight] = useState(700)
	const [bodyWeight, setBodyWeight] = useState(400)
	const [headItalic, setHeadItalic] = useState(false)
	const [bodyItalic, setBodyItalic] = useState(false)
	const [leading, setLeading] = useState(160)
	const [copied, setCopied] = useState(false)

	const head = fonts.find((font) => font.id === headId) ?? fonts[0]
	const body = fonts.find((font) => font.id === bodyId) ?? fonts[0]

	const snippet = useMemo(() => {
		if (!head || !body) return ""
		return [
			":root {",
			`\t--font-heading: "${head.family}", system-ui, sans-serif;`,
			`\t--font-body: "${body.family}", system-ui, sans-serif;`,
			"}",
			"",
			"h1, h2, h3 {",
			"\tfont-family: var(--font-heading);",
			`\tfont-weight: ${headWeight};`,
			headItalic ? "\tfont-style: italic;" : null,
			"\tline-height: 1.1;",
			"}",
			"",
			"body {",
			"\tfont-family: var(--font-body);",
			`\tfont-weight: ${bodyWeight};`,
			bodyItalic ? "\tfont-style: italic;" : null,
			`\tfont-size: ${bodySize}px;`,
			`\tline-height: ${(leading / 100).toFixed(2)};`,
			"}",
		]
			.filter((line) => line !== null)
			.join("\n")
	}, [head, body, headWeight, bodyWeight, headItalic, bodyItalic, bodySize, leading])

	async function copySnippet() {
		try {
			await navigator.clipboard.writeText(snippet)
			setCopied(true)
			window.setTimeout(() => setCopied(false), 1800)
		} catch {
			setCopied(false)
		}
	}

	function swap() {
		setHeadId(bodyId)
		setBodyId(headId)
	}

	function reset() {
		setHeadText(HEAD_TEXT)
		setBodyText(BODY_TEXT)
		setHeadSize(54)
		setBodySize(17)
		setHeadWeight(700)
		setBodyWeight(400)
		setHeadItalic(false)
		setBodyItalic(false)
		setLeading(160)
	}

	if (fonts.length < 2 || !head || !body) {
		return (
			<div className="notice">
				Add at least two families and you can start pairing them by hand.{" "}
				<Link href="/manage">Add a font</Link>.
			</div>
		)
	}

	return (
		<section className="pairBuilder" aria-label="Build your own pairing">
			<div className="pairBuilderHead">
				<div>
					<p className="eyebrow">Build your own</p>
					<h2 className="pairBuilderTitle">Pair any two families</h2>
				</div>
				<div className="pairBuilderActions">
					<button type="button" className="pairSwap" onClick={swap}>
						Swap roles
					</button>
					<button type="button" className="pairReset" onClick={reset}>
						Reset
					</button>
				</div>
			</div>

			<div className="pairPickers">
				<div className="pairPicker">
					<label className="pairLabel" htmlFor="pair-heading">
						Headline font
					</label>
					<select
						id="pair-heading"
						value={head.id}
						onChange={(event) => setHeadId(event.target.value)}
					>
						{fonts.map((font) => (
							<option key={font.id} value={font.id}>
								{font.name}
								{font.category ? ` — ${font.category}` : ""}
							</option>
						))}
					</select>
					<div className="pairFields">
						<label className="pairField">
							<span>Size {headSize}px</span>
							<input
								type="range"
								min={24}
								max={120}
								value={headSize}
								onChange={(event) => setHeadSize(Number(event.target.value))}
							/>
						</label>
						<label className="pairField">
							<span>Weight</span>
							<select
								value={headWeight}
								onChange={(event) => setHeadWeight(Number(event.target.value))}
							>
								{WEIGHTS.map((weight) => (
									<option key={weight} value={weight}>
										{weight}
									</option>
								))}
							</select>
						</label>
						<button
							type="button"
							className="pairToggle"
							data-on={headItalic ? "true" : "false"}
							aria-pressed={headItalic}
							onClick={() => setHeadItalic((value) => !value)}
						>
							Italic
						</button>
					</div>
				</div>

				<div className="pairPicker">
					<label className="pairLabel" htmlFor="pair-body">
						Body font
					</label>
					<select
						id="pair-body"
						value={body.id}
						onChange={(event) => setBodyId(event.target.value)}
					>
						{fonts.map((font) => (
							<option key={font.id} value={font.id}>
								{font.name}
								{font.category ? ` — ${font.category}` : ""}
							</option>
						))}
					</select>
					<div className="pairFields">
						<label className="pairField">
							<span>Size {bodySize}px</span>
							<input
								type="range"
								min={12}
								max={28}
								value={bodySize}
								onChange={(event) => setBodySize(Number(event.target.value))}
							/>
						</label>
						<label className="pairField">
							<span>Leading {leading}%</span>
							<input
								type="range"
								min={110}
								max={220}
								value={leading}
								onChange={(event) => setLeading(Number(event.target.value))}
							/>
						</label>
						<label className="pairField">
							<span>Weight</span>
							<select
								value={bodyWeight}
								onChange={(event) => setBodyWeight(Number(event.target.value))}
							>
								{WEIGHTS.map((weight) => (
									<option key={weight} value={weight}>
										{weight}
									</option>
								))}
							</select>
						</label>
						<button
							type="button"
							className="pairToggle"
							data-on={bodyItalic ? "true" : "false"}
							aria-pressed={bodyItalic}
							onClick={() => setBodyItalic((value) => !value)}
						>
							Italic
						</button>
					</div>
				</div>
			</div>

			<div className="pairStage">
				<p className="pairRole">
					{head.name} headline · click the text to edit it
				</p>
				<div
					className="pairHeadline"
					contentEditable
					suppressContentEditableWarning
					role="textbox"
					aria-label="Headline preview text"
					onBlur={(event) =>
						setHeadText(event.currentTarget.textContent || HEAD_TEXT)
					}
					style={{
						fontFamily: `"${head.family}", var(--sys)`,
						fontSize: `${headSize}px`,
						fontWeight: headWeight,
						fontStyle: headItalic ? "italic" : "normal",
					}}
				>
					{headText}
				</div>

				<p className="pairRole">{body.name} body text</p>
				<div
					className="pairBody"
					contentEditable
					suppressContentEditableWarning
					role="textbox"
					aria-label="Body preview text"
					onBlur={(event) =>
						setBodyText(event.currentTarget.textContent || BODY_TEXT)
					}
					style={{
						fontFamily: `"${body.family}", var(--sys)`,
						fontSize: `${bodySize}px`,
						fontWeight: bodyWeight,
						fontStyle: bodyItalic ? "italic" : "normal",
						lineHeight: leading / 100,
					}}
				>
					{bodyText}
				</div>
			</div>

			<div className="pairFoot">
				<p className="pairFootLinks">
					<Link href={`/fonts/${head.slug}`}>{head.name}</Link>
					{" + "}
					<Link href={`/fonts/${body.slug}`}>{body.name}</Link>
				</p>
				<button type="button" className="pairCopy" onClick={copySnippet}>
					{copied ? "CSS copied" : "Copy pairing CSS"}
				</button>
			</div>

			<pre className="pairSnippet">
				<code>{snippet}</code>
			</pre>
		</section>
	)
}
