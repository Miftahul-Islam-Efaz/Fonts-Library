import Link from "next/link"
import { cookies } from "next/headers"
import FontHead from "@/components/FontHead"
import Specimen from "@/components/Specimen"
import ThemeControls from "@/components/ThemeControls"
import { myFavoriteIds } from "@/lib/favorites"
import { listFonts } from "@/lib/fonts"
import { isSupabaseConfigured } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/supabaseServer"
import {
	ALIGN_COOKIE,
	DEFAULT_ALIGN,
	DEFAULT_SIZE,
	DEFAULT_SORT,
	DEFAULT_THEME,
	SIZE_COOKIE,
	SORTS,
	THEME_COOKIE,
	clampSize,
	isAlign,
	isSort,
	isTheme,
} from "@/lib/theme"

export const dynamic = "force-dynamic"

export const metadata = {
	title: "Fonts Library — every family, previewed",
	description:
		"Browse every font family in the library. Each entry is server-rendered with regular, bold, italic and bold italic specimens, style file counts and its original source.",
}

export default async function HomePage({
	searchParams,
}: {
	searchParams: Promise<{ sort?: string }>
}) {
	if (!isSupabaseConfigured) {
		return (
			<main>
				<h1>Fonts Library</h1>
				<div className="notice error">
					<strong>Supabase is not connected yet.</strong> Copy{" "}
					<code>.env.example</code> to <code>.env.local</code> and fill in your
					project URL, anon key and service role key, then restart the dev server.
				</div>
			</main>
		)
	}

	const { sort: sortParam } = await searchParams
	const sort = isSort(sortParam) ? sortParam : DEFAULT_SORT

	const store = await cookies()
	const themeCookie = store.get(THEME_COOKIE)?.value
	const alignCookie = store.get(ALIGN_COOKIE)?.value
	const theme = isTheme(themeCookie) ? themeCookie : DEFAULT_THEME
	const align = isAlign(alignCookie) ? alignCookie : DEFAULT_ALIGN
	const size = store.has(SIZE_COOKIE)
		? clampSize(store.get(SIZE_COOKIE)?.value)
		: DEFAULT_SIZE

	const [fonts, user, favorites] = await Promise.all([
		listFonts(sort),
		getCurrentUser(),
		myFavoriteIds(),
	])

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "CollectionPage",
		name: "Fonts Library",
		description:
			"A personal collection of typefaces with server-rendered specimens.",
		numberOfItems: fonts.length,
		hasPart: fonts.map((font) => ({
			"@type": "CreativeWork",
			name: font.name,
			genre: font.category ?? undefined,
			description: font.notes ?? undefined,
			url: `/fonts/${font.slug}`,
			interactionStatistic: {
				"@type": "InteractionCounter",
				interactionType: "https://schema.org/LikeAction",
				userInteractionCount: font.favorite_count ?? 0,
			},
		})),
	}

	return (
		<main>
			<FontHead fonts={fonts} />
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>

			<section style={{ marginTop: 24 }}>
				<h1>The library</h1>
				<p className="lede">
					{fonts.length} {fonts.length === 1 ? "family" : "families"} stored in
					Supabase. Every specimen below is rendered on the server, so the text is
					readable by search engines and AI models even before any script runs.{" "}
					<Link href="/manage">Add or remove fonts</Link>.
				</p>
			</section>

			<ThemeControls theme={theme} align={align} size={size} />

			<nav className="sortBar" aria-label="Sort">
				<span>Sort by</span>
				{SORTS.map((option) => (
					<Link
						key={option.id}
						href={`/?sort=${option.id}`}
						aria-current={sort === option.id ? "true" : undefined}
					>
						{option.label}
					</Link>
				))}
			</nav>

			{fonts.length === 0 ? (
				<div className="notice">
					No fonts yet. <Link href="/manage">Add your first family</Link> —
					upload .ttf, .otf, .woff or .woff2 files, or paste a stylesheet link.
				</div>
			) : (
				<section aria-label="Font families">
					{fonts.map((font) => (
						<Specimen
							key={font.id}
							font={font}
							isFavorite={favorites.has(font.id)}
							signedIn={Boolean(user)}
						/>
					))}
				</section>
			)}
		</main>
	)
}
