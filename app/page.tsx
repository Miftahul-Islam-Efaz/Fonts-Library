import Link from "next/link"
import { cookies } from "next/headers"
import BrandMark from "@/components/BrandMark"
import FontHead from "@/components/FontHead"
import FontRow from "@/components/FontRow"
import ThemeControls from "@/components/ThemeControls"
import { myFavoriteIds } from "@/lib/favorites"
import { listFonts } from "@/lib/fonts"
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site"
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
	title: "Fonts Library - every family, previewed",
	description:
		"Save fonts from anywhere into one organised library with live previews. Each family is server-rendered with its own specimen, style count and original source.",
	alternates: { canonical: "/" },
}

/**
 * Purpose block. Google's OAuth branding review checks that the home page
 * names the app, explains what it does, and says how Google sign-in is used.
 */
function Intro() {
	return (
		<section className="homeIntro" aria-label="About this app">
			<div className="homeIntroTop">
				<BrandMark size={52} />
				<div>
					<h1 className="homeTitle">{SITE_NAME}</h1>
					<p className="homeTagline">{SITE_TAGLINE}</p>
				</div>
			</div>

			<p className="homeLead">
				Fonts Library is a free web app for collecting typefaces. There are
				plenty of font catalogues, but the families you actually fall in love
				with end up scattered across zip files, bookmarks and download folders
				with no way to see them side by side. This is one place to keep them:
				upload font files from your computer or paste a stylesheet link from
				anywhere on the web, and every family gets an organised entry with a live
				preview you can type your own text into.
			</p>

			<ul className="homePoints">
				<li>
					<strong>Add from anywhere</strong>
					Upload .ttf, .otf, .woff or .woff2 files, or paste a Google Fonts or
					foundry stylesheet link.
				</li>
				<li>
					<strong>Real previews</strong>
					Every weight and italic rendered in the actual typeface, with your own
					sample text and adjustable size.
				</li>
				<li>
					<strong>Your space plus a shared one</strong>
					Fonts you add are saved to your personal space and also join this public
					community library.
				</li>
				<li>
					<strong>Favourites and pairings</strong>
					Like the families you keep coming back to and get suggested heading and
					body pairs.
				</li>
			</ul>

			<p className="homeSignIn">
				Browsing is open to everyone, no account needed. Signing in with Google
				is only used to know whose personal space and favourites are whose: the
				app receives your name, email address and profile picture, and nothing
				else from your Google account. See the{" "}
				<Link href="/privacy">privacy policy</Link> for details.
			</p>

			<div className="homeLinks">
				<Link className="homeLink" href="/about">
					About this project
				</Link>
				<Link className="homeLink" href="/privacy">
					Privacy policy
				</Link>
				<Link className="homeLink" href="/manage">
					Add a font
				</Link>
				<Link className="homeLink" href="/pairs">
					Suggested pairings
				</Link>
			</div>
		</section>
	)
}

export default async function HomePage({
	searchParams,
}: {
	searchParams: Promise<{ sort?: string }>
}) {
	if (!isSupabaseConfigured) {
		return (
			<main>
				<Intro />
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
			"A shared collection of typefaces with server-rendered specimens.",
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

			<Intro />

			<ThemeControls theme={theme} align={align} size={size} searchable />

			<div className="listBar">
				<span className="listCount" data-font-count="">
					{fonts.length}
				</span>
				<span>{fonts.length === 1 ? "family" : "families"} in the library</span>
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
			</div>

			{fonts.length === 0 ? (
				<div className="notice">
					No fonts yet. <Link href="/manage">Add your first family</Link> -
					upload .ttf, .otf, .woff or .woff2 files, or paste a stylesheet link.
				</div>
			) : (
				<section aria-label="Font families">
					{fonts.map((font) => (
						<FontRow
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
