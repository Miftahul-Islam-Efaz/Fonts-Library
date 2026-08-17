import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import FontHead from "@/components/FontHead"
import Specimen from "@/components/Specimen"
import ThemeControls from "@/components/ThemeControls"
import { faceLabel } from "@/lib/fontMeta"
import { myFavoriteIds } from "@/lib/favorites"
import { cssFamily, faceUrl, getFontBySlug, listFonts } from "@/lib/fonts"
import { pairsForFont } from "@/lib/pairing"
import { isSupabaseConfigured } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/supabaseServer"
import {
	ALIGN_COOKIE,
	DEFAULT_ALIGN,
	DEFAULT_SIZE,
	DEFAULT_THEME,
	SIZE_COOKIE,
	THEME_COOKIE,
	clampSize,
	isAlign,
	isTheme,
} from "@/lib/theme"

export const dynamic = "force-dynamic"

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>
}): Promise<Metadata> {
	const { slug } = await params
	if (!isSupabaseConfigured) return { title: "Font" }
	const font = await getFontBySlug(slug)
	if (!font) return { title: "Font not found" }
	const styles = font.faces.length
	return {
		title: font.name,
		description:
			font.notes ??
			`${font.name}${font.category ? ` — ${font.category}` : ""} specimen with ${styles || "multiple"} styles, previewed in regular, bold, italic and bold italic.`,
		alternates: { canonical: `/fonts/${font.slug}` },
		robots: font.is_public ? undefined : { index: false, follow: false },
	}
}

export default async function FontPage({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params
	if (!isSupabaseConfigured) notFound()

	const font = await getFontBySlug(slug)
	if (!font) notFound()

	const store = await cookies()
	const themeCookie = store.get(THEME_COOKIE)?.value
	const alignCookie = store.get(ALIGN_COOKIE)?.value
	const theme = isTheme(themeCookie) ? themeCookie : DEFAULT_THEME
	const align = isAlign(alignCookie) ? alignCookie : DEFAULT_ALIGN
	const size = store.has(SIZE_COOKIE)
		? clampSize(store.get(SIZE_COOKIE)?.value)
		: DEFAULT_SIZE

	const [user, favorites, publicFonts] = await Promise.all([
		getCurrentUser(),
		myFavoriteIds(),
		listFonts("alphabetical"),
	])

	// A private copy is not in the public list, so make sure its own files load.
	const fonts = publicFonts.some((item) => item.id === font.id)
		? publicFonts
		: [font, ...publicFonts]
	const pairs = pairsForFont(font, fonts, 4)

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "CreativeWork",
		name: font.name,
		genre: font.category ?? undefined,
		description: font.notes ?? undefined,
		license: font.license ?? undefined,
		url: `/fonts/${font.slug}`,
		interactionStatistic: {
			"@type": "InteractionCounter",
			interactionType: "https://schema.org/LikeAction",
			userInteractionCount: font.favorite_count ?? 0,
		},
	}

	return (
		<main>
			<FontHead fonts={fonts} />
			{font.is_public ? (
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				/>
			) : null}

			<p className="meta" style={{ marginTop: 24, marginBottom: 8 }}>
				<Link href={font.is_public ? "/" : "/my"}>
					{font.is_public ? "Library" : "My space"}
				</Link>{" "}
				/ {font.name}
			</p>
			<h1>{font.name}</h1>

			{!font.is_public ? (
				<div className="notice">
					This copy lives in your personal space only — the family was
					already in the public library when you added it.
				</div>
			) : null}

			<dl className="dl">
				<dt>Category</dt>
				<dd>{font.category ?? "Uncategorised"}</dd>
				<dt>Source</dt>
				<dd>
					{font.source_type === "file"
						? "Font files stored in this library"
						: "Loaded from a web stylesheet"}
					{font.source_page ? (
						<>
							{" · "}
							<a href={font.source_page} rel="noopener nofollow">
								original page
							</a>
						</>
					) : null}
				</dd>
				<dt>Styles</dt>
				<dd>
					{font.faces.length > 0
						? font.faces
								.map((face) => face.label || faceLabel(face.weight, face.style))
								.join(", ")
						: "Whatever the stylesheet provides"}
				</dd>
				<dt>Favorites</dt>
				<dd>{font.favorite_count ?? 0}</dd>
				{font.added_by_name ? (
					<>
						<dt>Added by</dt>
						<dd>{font.added_by_name}</dd>
					</>
				) : null}
				{font.license ? (
					<>
						<dt>License</dt>
						<dd>{font.license}</dd>
					</>
				) : null}
				{font.notes ? (
					<>
						<dt>Notes</dt>
						<dd>{font.notes}</dd>
					</>
				) : null}
			</dl>

			<ThemeControls theme={theme} align={align} size={size} />

			<Specimen
				font={font}
				as="h2"
				isFavorite={favorites.has(font.id)}
				signedIn={Boolean(user)}
			/>

			{pairs.length > 0 ? (
				<section style={{ marginTop: 32 }}>
					<h2>Pairs well with</h2>
					<p className="meta">
						Scored automatically against everything else in the library.{" "}
						<Link href="/pairs">See all pairings</Link>.
					</p>
					{pairs.map((pair) => (
						<div className="styleRow" key={`${pair.heading.id}-${pair.body.id}`}>
							<p className="styleLabel">
								<span>
									{pair.heading.name} headline + {pair.body.name} text ·{" "}
									{pair.score}/100
								</span>
							</p>
							<p
								style={{
									fontFamily: `"${cssFamily(pair.heading)}", var(--sys)`,
									fontWeight: 700,
									fontSize: 30,
									margin: "0 0 6px",
								}}
							>
								A headline in {pair.heading.name}
							</p>
							<p
								style={{
									fontFamily: `"${cssFamily(pair.body)}", var(--sys)`,
									fontSize: 16,
									lineHeight: 1.6,
									maxWidth: "62ch",
									margin: 0,
								}}
							>
								Body copy set in {pair.body.name}. {pair.reason}.
							</p>
						</div>
					))}
				</section>
			) : null}

			{font.faces.some((face) => faceUrl(face)) ? (
				<section style={{ marginTop: 32 }}>
					<h2>Files</h2>
					<ul>
						{font.faces.map((face) => {
							const url = faceUrl(face)
							if (!url) return null
							return (
								<li key={face.id}>
									<a href={url} download>
										{face.label || faceLabel(face.weight, face.style)}
									</a>{" "}
									<span className="meta">
										{face.weight} {face.style}
										{face.format ? ` · ${face.format}` : ""}
									</span>
								</li>
							)
						})}
					</ul>
				</section>
			) : null}
		</main>
	)
}
