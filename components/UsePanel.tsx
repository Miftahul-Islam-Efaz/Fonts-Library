"use client"

import { useState } from "react"

export interface UseFace {
	label: string
	weight: number
	style: string
	url: string
	format: string | null
	fileName: string
}

export interface UsePanelData {
	name: string
	slug: string
	family: string
	sourceType: "file" | "link"
	cssUrl: string | null
	sourcePage: string | null
	license: string | null
	faces: UseFace[]
	/** Absolute /api/fonts/<slug>/install endpoint. */
	installUrl: string
}

type TabId = "download" | "embed" | "css" | "terminal"

const TABS: Array<{ id: TabId; label: string }> = [
	{ id: "download", label: "Download" },
	{ id: "embed", label: "HTML embed" },
	{ id: "css", label: "CSS" },
	{ id: "terminal", label: "Terminal" },
]

function CopyButton({ value, label }: { value: string; label?: string }) {
	const [copied, setCopied] = useState(false)
	return (
		<button
			type="button"
			className="useCopy"
			data-copied={copied ? "true" : "false"}
			onClick={async () => {
				try {
					await navigator.clipboard.writeText(value)
					setCopied(true)
					window.setTimeout(() => setCopied(false), 1800)
				} catch {
					setCopied(false)
				}
			}}
		>
			{copied ? "Copied" : (label ?? "Copy")}
		</button>
	)
}

function Block({ code, caption }: { code: string; caption?: string }) {
	return (
		<div className="useBlock">
			<div className="useBlockHead">
				<span className="useCaption">{caption}</span>
				<CopyButton value={code} />
			</div>
			<pre className="useCode">
				<code>{code}</code>
			</pre>
		</div>
	)
}

function sizeOf(face: UseFace) {
	return face.format ? face.format.toUpperCase() : "font file"
}

/**
 * Everything needed to actually use a family: download the files, drop in an
 * embed, copy the CSS, or install it from a terminal. The snippets differ for
 * a hosted stylesheet and for files stored in this library, because the usual
 * process for each is genuinely different.
 */
export default function UsePanel({ font }: { font: UsePanelData }) {
	const [tab, setTab] = useState<TabId>(
		font.sourceType === "link" ? "embed" : "download",
	)

	const isLink = font.sourceType === "link" && Boolean(font.cssUrl)

	const embedCode = isLink
		? [
				'<link rel="preconnect" href="' +
					new URL(font.cssUrl as string).origin +
					'" crossorigin>',
				'<link rel="stylesheet" href="' + font.cssUrl + '">',
				"",
				"<style>",
				"\t.headline { font-family: \"" + font.family + '", sans-serif; }',
				"</style>",
			].join("\n")
		: [
				"<style>",
				...font.faces.flatMap((face) => [
					"@font-face {",
					'\tfont-family: "' + font.family + '";',
					"\tsrc: url(\"" +
						face.url +
						'")' +
						(face.format ? ' format("' + face.format + '")' : "") +
						";",
					"\tfont-weight: " + face.weight + ";",
					"\tfont-style: " + face.style + ";",
					"\tfont-display: swap;",
					"}",
				]),
				"</style>",
			].join("\n")

	const cssCode = isLink
		? [
				"@import url(\"" + font.cssUrl + '");',
				"",
				"body {",
				'\tfont-family: "' + font.family + '", system-ui, sans-serif;',
				"}",
			].join("\n")
		: [
				"/* Self-hosted: files live in ./fonts/" + font.slug + "/ */",
				...font.faces.flatMap((face) => [
					"@font-face {",
					'\tfont-family: "' + font.family + '";',
					"\tsrc: url(\"/fonts/" +
						font.slug +
						"/" +
						face.fileName +
						'")' +
						(face.format ? ' format("' + face.format + '")' : "") +
						";",
					"\tfont-weight: " + face.weight + ";",
					"\tfont-style: " + face.style + ";",
					"\tfont-display: swap;",
					"}",
				]),
				"",
				"body {",
				'\tfont-family: "' + font.family + '", system-ui, sans-serif;',
				"}",
			].join("\n")

	const shCommand = "curl -fsSL " + font.installUrl + " | sh"
	const psCommand = "irm " + font.installUrl + "?shell=powershell | iex"

	return (
		<section className="usePanel" aria-label={"How to use " + font.name}>
			<div className="usePanelHead">
				<div>
					<p className="eyebrow">Use it</p>
					<h2 className="useTitle">Get {font.name} into your project</h2>
				</div>
				<div className="useTabs" role="tablist">
					{TABS.map((item) => (
						<button
							key={item.id}
							type="button"
							role="tab"
							aria-selected={tab === item.id}
							className="useTab"
							data-active={tab === item.id ? "true" : "false"}
							onClick={() => setTab(item.id)}
						>
							{item.label}
						</button>
					))}
				</div>
			</div>

			{tab === "download" ? (
				<div className="useBody">
					{font.faces.length === 0 ? (
						<p className="useNote">
							This family is loaded from a stylesheet, so there is no file to
							download. Use the HTML embed or CSS tab instead.
						</p>
					) : (
						<>
							<ul className="useFiles">
								{font.faces.map((face) => (
									<li className="useFile" key={face.url}>
										<span className="useFileName">{face.label}</span>
										<span className="useFileMeta">
											{face.weight} {face.style} · {sizeOf(face)}
										</span>
										<a className="useDownload" href={face.url} download>
											Download
										</a>
									</li>
								))}
							</ul>
							<p className="useNote">
								Files are served as WOFF2 where conversion was possible, so they
								drop straight into a website. Need every file at once? The
								Terminal tab pulls them all with one command.
								{font.license ? " License: " + font.license + "." : ""}
							</p>
						</>
					)}
				</div>
			) : null}

			{tab === "embed" ? (
				<div className="useBody">
					{isLink ? (
						<>
							<p className="useNote">
								This family is hosted online, so the usual process is a stylesheet
								link in your <code>&lt;head&gt;</code>. Nothing is copied onto your
								server.
							</p>
							<Block code={embedCode} caption="Paste inside <head>" />
							<Block
								code={font.cssUrl as string}
								caption="Stylesheet URL on its own"
							/>
						</>
					) : (
						<>
							<p className="useNote">
								Quickest path: point at the files already hosted here. Good for
								prototypes and CodePen. For production, download the files and
								serve them yourself.
							</p>
							<Block code={embedCode} caption="Paste inside <head>" />
						</>
					)}
				</div>
			) : null}

			{tab === "css" ? (
				<div className="useBody">
					<Block
						code={cssCode}
						caption={isLink ? "Import in your CSS" : "Self-hosted @font-face"}
					/>
					<Block
						code={'font-family: "' + font.family + '", system-ui, sans-serif;'}
						caption="Just the font-family value"
					/>
				</div>
			) : null}

			{tab === "terminal" ? (
				<div className="useBody">
					<p className="useNote">
						Run this in your project root. It downloads every style into{" "}
						<code>./fonts/{font.slug}/</code>, writes a ready{" "}
						<code>{font.slug}.css</code> next to them, and prints the import line
						to paste. Pass a different folder as an argument.
					</p>
					<Block code={shCommand} caption="macOS, Linux, WSL, Git Bash" />
					<Block code={psCommand} caption="Windows PowerShell" />
					<p className="useNote">
						Prefer to read before you run? Open{" "}
						<a href={font.installUrl} rel="noopener">
							the script
						</a>{" "}
						in a browser first — it is plain text and does nothing but fetch
						files into a folder you choose.
					</p>
				</div>
			) : null}
		</section>
	)
}
