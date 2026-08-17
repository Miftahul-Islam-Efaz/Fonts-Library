"use client"

import Link from "next/link"
import { useActionState, useEffect, useState } from "react"
import { toggleFavoriteAction } from "@/app/actions"
import { emptyState } from "@/lib/actionState"

/**
 * The like count itself is server-rendered next to this button, so it stays
 * visible to crawlers even though the toggle needs JavaScript. The heart flips
 * optimistically on click and only reverts if the server rejects the change.
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
	const [liked, setLiked] = useState(isFavorite)

	// Keep in step with fresh server data, and roll back a failed toggle.
	useEffect(() => {
		setLiked(isFavorite)
	}, [isFavorite])

	useEffect(() => {
		if (state.message && !state.ok) setLiked(isFavorite)
	}, [state, isFavorite])

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
				className={`likeButton${liked ? " liked" : ""}${pending ? " busy" : ""}`}
				aria-pressed={liked}
				aria-label={
					liked
						? `Remove ${fontName} from favorites`
						: `Add ${fontName} to favorites`
				}
				onClick={() => setLiked((value) => !value)}
			>
				<span className="heart" aria-hidden="true">
					{liked ? "♥" : "♡"}
				</span>{" "}
				{liked ? "Favorited" : "Like"}
			</button>
			{state.message && !state.ok ? (
				<span style={{ fontSize: 12, color: "var(--warn-text)" }}>
					{state.message}
				</span>
			) : null}
		</form>
	)
}
