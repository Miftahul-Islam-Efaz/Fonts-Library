import Link from "next/link"
import EditableSpecimen from "@/components/EditableSpecimen"
import FavoriteButton from "@/components/FavoriteButton"
import RowControls from "@/components/RowControls"
import { cssFamily, previewStyles } from "@/lib/fonts"
import type { FontRecord } from "@/lib/types"

interface Props {
	font: FontRecord
	as?: "h2" | "h3"
	isFavorite?: boolean
	signedIn?: boolean
	/** Optional extra label, e.g. "Private to you" in a personal space. */
	badge?: string
}

/**
 * One line of the library, in the style of a foundry specimen list: a thin meta
 * row with its own bold / italic, leading and size controls, the family name
 * set in the family itself, and a footer with its source.
 *
 * The specimen text is server-rendered, so crawlers read real text, and is
 * editable in place once the page hydrates.
 */
export default function FontRow({
	font,
	as = "h2",
	isFavorite = false,
	signedIn = false,
	badge,
}: Props) {
	const Heading = as
	const family = cssFamily(font)
	const styleCount =
		font.faces.length > 0 ? font.faces.length : previewStyles(font).length
	const likes = font.favorite_count ?? 0

	return (
		<article
			className="row"
			id={font.slug}
			data-font-row=""
			data-name={font.name.toLowerCase()}
			data-category={(font.category ?? "").toLowerCase()}
		>
			<div className="rowHead">
				<Heading className="rowName">
					<Link href={`/fonts/${font.slug}`}>{font.name}</Link>
				</Heading>
				<FavoriteButton
					fontId={font.id}
					slug={font.slug}
					fontName={font.name}
					isFavorite={isFavorite}
					signedIn={signedIn}
				/>

				<RowControls fontName={font.name} />

				<span className="rowHeadRight">
					<span>
						{styleCount} {styleCount === 1 ? "style" : "styles"}
					</span>
					<span>{font.category ?? "Uncategorised"}</span>
					<span>
						{font.source_type === "file" ? "Uploaded files" : "Web source"}
					</span>
				</span>
			</div>

			<EditableSpecimen
				className="rowSpecimen"
				family={family}
				defaultText={font.name}
			/>

			<div className="rowFoot">
				<span>{font.notes ? font.notes : font.license ?? "In the library"}</span>
				<span className="rowFootRight">
					<span className="rowEditHint">Click on text to edit</span>
					{badge ? <span className="badge">{badge}</span> : null}
					<span className="likeCount">
						{likes} {likes === 1 ? "like" : "likes"}
					</span>
					{font.added_by_name ? <span>Added by {font.added_by_name}</span> : null}
					<Link href={`/fonts/${font.slug}`}>View family</Link>
				</span>
			</div>
		</article>
	)
}
