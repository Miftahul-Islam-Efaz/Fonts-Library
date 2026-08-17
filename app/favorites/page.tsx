import Link from "next/link"
import { cookies } from "next/headers"
import FontHead from "@/components/FontHead"
import SignInButton from "@/components/SignInButton"
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
	DEFAULT_THEME,
	SIZE_COOKIE,
	THEME_COOKIE,
	clampSize,
	isAlign,
	isTheme,
} from "@/lib/theme"

export const dynamic = "force-dynamic"

export const metadata = {
	title: "Favorites",
	description: "The font families you have liked.",
	robots: { index: false, follow: true },
}

export default async function FavoritesPage() {
	if (!isSupabaseConfigured) {
		return (
			<main>
				<h1>Favorites</h1>
				<div className="notice error">Supabase is not connected yet.</div>
			</main>
		)
	}

	const user = await getCurrentUser()
	if (!user) {
		return (
			<main>
				<h1>Favorites</h1>
				<p className="lede">
					Sign in with Google to keep a list of the families you love.
				</p>
				<SignInButton next="/favorites" />
			</main>
		)
	}

	const store = await cookies()
	const themeCookie = store.get(THEME_COOKIE)?.value
	const alignCookie = store.get(ALIGN_COOKIE)?.value
	const theme = isTheme(themeCookie) ? themeCookie : DEFAULT_THEME
	const align = isAlign(alignCookie) ? alignCookie : DEFAULT_ALIGN
	const size = store.has(SIZE_COOKIE)
		? clampSize(store.get(SIZE_COOKIE)?.value)
		: DEFAULT_SIZE

	const [all, favorites] = await Promise.all([
		listFonts("alphabetical"),
		myFavoriteIds(),
	])
	const fonts = all.filter((font) => favorites.has(font.id))

	return (
		<main>
			<FontHead fonts={fonts} />
			<section style={{ marginTop: 24 }}>
				<h1>Favorites</h1>
				<p className="lede">
					{fonts.length} {fonts.length === 1 ? "family" : "families"} saved to{" "}
					{user.email}. <Link href="/">Back to the library</Link>.
				</p>
			</section>

			<ThemeControls theme={theme} align={align} size={size} />

			{fonts.length === 0 ? (
				<div className="notice">
					Nothing liked yet. Tap the heart on any family in{" "}
					<Link href="/">the library</Link>.
				</div>
			) : (
				<section aria-label="Favorite families">
					{fonts.map((font) => (
						<Specimen key={font.id} font={font} isFavorite signedIn />
					))}
				</section>
			)}
		</main>
	)
}
