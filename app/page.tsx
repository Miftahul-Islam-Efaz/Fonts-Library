import Link from "next/link"
import { cookies } from "next/headers"
import FontHead from "@/components/FontHead"
import FontRow from "@/components/FontRow"
import Hero, { type HeroStats } from "@/components/Hero"
import ThemeControls from "@/components/ThemeControls"
import {
	categoryFacets,
	categorySlug,
	filterByCategory,
} from "@/lib/category"
import { myFavoriteIds } from "@/lib/favorites"
import { listFonts } from "@/lib/fonts"
import { isSupabaseConfigured } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/supabaseServer"
import type { FontRecord } from "@/lib/types"
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
	title: "Type Archive - every family, previewed",
	description:
		"Save fonts from anywhere into one organised library with live previews. Each family is server-rendered with its own specimen, style count and original source.",
	alternates: { canonical: "/" },
}

/** Counts shown in the hero, derived from the same list the page renders. */
function heroStats(fonts: FontRecord[]): HeroStats {
	const people = new Set<string>()
	let styles = 0
	for (const font of fonts) {
		styles += font.faces.length
		const who = font.added_by ?? font.added_by_name
		if (who) people.add(who)
	}
	return {
		families: fonts.length,
		styles,
		contributors: people.size,
	}
}

/** Keeps the current category when a sort link is followed, and vice versa. */
function listHref(sort: string, category: string | null): string {
	const params = new URLSearchParams()
	if (sort !== DEFAULT_SORT) params.set("sort", sort)
	if (category) params.set("category", category)
	const query = params.toString()
	return query ? `/?${query}#library` : "/#library"
}

export default async function HomePage({
	searchParams,
}: {
	searchParams: Promise<{ sort?: string; category?: string }>
}) {
	if (!isSupabaseConfigured) {
		return (
			<main>
				<Hero stats={{ families: 0, styles: 0, contributors: 0 }} />
				<div className="notice error">
					<strong>Supabase is not connected yet.</strong> Copy{" "}
					<code>.env.example</code> to <code>.env.local</code> and fill in your
					project URL, anon key and service role key, then restart the dev server.
				</div>
			</main>
		)
	}

	const { sort: sortParam, category: categoryParam } = await searchParams
	const sort = isSort(sortParam) ? sortParam : DEFAULT_SORT

	const store = await cookies()
	const themeCookie = store.get(THEME_COOKIE)?.value
	const alignCookie = store.get(ALIGN_COOKIE)?.value
	const theme = isTheme(themeCookie) ? themeCookie : DEFAULT_THEME
	const align = isAlign(alignCookie) ? alignCookie : DEFAULT_ALIGN
	const size = store.has(SIZE_COOKIE)
		? clampSize(store.get(SIZE_COOKIE)?.value)
		: DEFAULT_SIZE

	const [allFonts, user, favorites] = await Promise.all([
		listFonts(sort),
		getCurrentUser(),
		myFavoriteIds(),
	])

	const facets = categoryFacets(allFonts)
	// Only honour a category that actually exists, so stale links stay usable.
	const requested = categoryParam ? categorySlug(categoryParam) : null
	const active = facets.some((facet) => facet.slug === requested)
		? requested
		: null
	const fonts = filterByCategory(allFonts, active)
	const activeLabel = facets.find((facet) => facet.slug === active)?.label

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "CollectionPage",
		name: activeLabel ? `Type Archive - ${activeLabel} fonts` : "Type Archive",
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
			<FontHead fonts={allFonts} />
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>

			<Hero stats={heroStats(allFonts)} />

			<ThemeControls theme={theme} align={align} size={size} searchable />

			{facets.length > 0 ? (
				<nav className="catBar" aria-label="Filter by category">
					<span className="catLabel">Category</span>
					<div className="catChips">
						<Link
							href={listHref(sort, null)}
							className="catChip"
							data-active={active === null ? "" : undefined}
							aria-current={active === null ? "true" : undefined}
						>
							All<span className="catCount">{allFonts.length}</span>
						</Link>
						{facets.map((facet) => (
							<Link
								key={facet.slug}
								href={listHref(sort, facet.slug)}
								className="catChip"
								data-active={active === facet.slug ? "" : undefined}
								aria-current={active === facet.slug ? "true" : undefined}
							>
								{facet.label}
								<span className="catCount">{facet.count}</span>
							</Link>
						))}
					</div>
				</nav>
			) : null}

			<div className="listBar" id="library">
				<span className="listCount" data-font-count="">
					{fonts.length}
				</span>
				<span>
					{fonts.length === 1 ? "family" : "families"}
					{activeLabel ? ` in ${activeLabel}` : " in the library"}
				</span>
				<nav className="sortBar" aria-label="Sort">
					<span>Sort by</span>
					{SORTS.map((option) => (
						<Link
							key={option.id}
							href={listHref(option.id, active)}
							aria-current={sort === option.id ? "true" : undefined}
						>
							{option.label}
						</Link>
					))}
				</nav>
			</div>

			{allFonts.length === 0 ? (
				<div className="notice">
					No fonts yet. <Link href="/manage">Add your first family</Link> -
					upload .ttf, .otf, .woff or .woff2 files, or paste a stylesheet link.
				</div>
			) : fonts.length === 0 ? (
				<div className="notice">
					Nothing in this category yet.{" "}
					<Link href={listHref(sort, null)}>Show every family</Link>.
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
