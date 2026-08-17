import Link from "next/link"
import FavoriteButton from "@/components/FavoriteButton"
import { cssFamily, faceUrl, previewStyles } from "@/lib/fonts"
import { DEFAULT_SAMPLE_TEXT, GLYPH_SAMPLE } from "@/lib/fontMeta"
import type { FontRecord } from "@/lib/types"

interface Props {
	font: FontRecord
	/** heading level so both the index and the detail page stay semantic */
	as?: "h2" | "h3"
	showGlyphs?: boolean
	sampleText?: string
	isFavorite?: boolean
	signedIn?: boolean
}

/**
 * Fully server-rendered specimen: real text, real font-family names, real links.
 * Works with JavaScript disabled and is readable by crawlers and AI models.
 */
export default function Specimen({
	font,
	as = "h2",
	showGlyphs = true,
	sampleText = DEFAULT_SAMPLE_TEXT,
	isFavorite = false,
	signedIn = false,
}: Props) {
	const Heading = as
	const family = cssFamily(font)
	const styles = previewStyles(font)
	const fileCount = font.faces.length
	const likes = font.favorite_count ?? 0

	return (
		<article className="fontCard" id={font.slug}>
			<div className="cardTop">
				<Heading>
					<Link href={`/fonts/${font.slug}`} style={{ color: "inherit" }}>
						{font.name}
					</Link>
				</Heading>
				{font.category ? <span className="badge">{font.category}</span> : null}
				<span className={font.source_type === "file" ? "badge file" : "badge"}>
					{font.source_type === "file" ? "Uploaded files" : "Web source"}
				</span>
				<span className="cardTopRight">
					<span className="likeCount">
						{likes} {likes === 1 ? "like" : "likes"}
					</span>
					<FavoriteButton
						fontId={font.id}
						slug={font.slug}
						fontName={font.name}
						isFavorite={isFavorite}
						signedIn={signedIn}
					/>
				</span>
			</div>

			<p className="meta">
				{fileCount > 0
					? `${fileCount} style ${fileCount === 1 ? "file" : "files"}`
					: "Loaded from a stylesheet"}
				{font.notes ? ` · ${font.notes}` : ""}
			</p>

			{styles.map((row) => (
				<div className="styleRow" key={`${row.weight}-${row.style}`}>
					<p className="styleLabel">
						<span>
							{row.label} · {row.weight} {row.style}
						</span>
						{row.real ? null : <span className="badge synth">Synthesized</span>}
					</p>
					<p
						className="specimen"
						data-specimen=""
						style={{
							fontFamily: `"${family}", var(--sys)`,
							fontWeight: row.weight,
							fontStyle: row.style,
						}}
					>
						{sampleText}
					</p>
				</div>
			))}

			{showGlyphs ? (
				<p className="glyphs" style={{ fontFamily: `"${family}", var(--sys)` }}>
					{GLYPH_SAMPLE}
				</p>
			) : null}

			{font.source_page || font.faces.some((face) => faceUrl(face)) ? (
				<p className="meta" style={{ marginTop: 16, marginBottom: 0 }}>
					{font.source_page ? (
						<a href={font.source_page} rel="noopener nofollow">
							Original source
						</a>
					) : null}
					{font.license ? ` · ${font.license}` : ""}
				</p>
			) : null}
		</article>
	)
}
