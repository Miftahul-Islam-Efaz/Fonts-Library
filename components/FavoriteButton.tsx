"use client"

import Link from "next/link"
import { useActionState } from "react"
import { toggleFavoriteAction } from "@/app/actions"
import { emptyState } from "@/lib/actionState"

/**
 * The like count itself is server-rendered next to this button, so it stays
 * visible to crawlers even though the toggle needs JavaScript.
 */
export default function FavoriteButton({
	fontId,
	slug,
	fontName,
	isFavorite,
	signedIn,
}: {
	fontId: string
	slug: string
	fontName: string
	isFavorite: boolean
	signedIn: boolean
}) {
	const [state, formAction, pending] = useActionState(
		toggleFavoriteAction,
		emptyState,
	)

	if (!signedIn) {
		return (
			<Link
				className="likeButton"
				href={`/login?next=${encodeURIComponent(`/fonts/${slug}`)}`}
				title="Sign in with Google to save favorites"
			>
				<span aria-hidden="true">♡</span> Like
			</Link>
		)
	}

	return (
		<form action={formAction} className="likeForm">
			<input type="hidden" name="fontId" value={fontId} />
			<input type="hidden" name="slug" value={slug} />
			<button
				type="submit"
				className={isFavorite ? "likeButton liked" : "likeButton"}
				disabled={pending}
				aria-pressed={isFavorite}
				aria-label={
					isFavorite
						? `Remove ${fontName} from favorites`
						: `Add ${fontName} to favorites`
				}
			>
				<span aria-hidden="true">{isFavorite ? "♥" : "♡"}</span>{" "}
				{isFavorite ? "Favorited" : "Like"}
			</button>
			{state.message && !state.ok ? (
				<span style={{ fontSize: 12, color: "var(--warn-text)" }}>
					{state.message}
				</span>
			) : null}
		</form>
	)
}
