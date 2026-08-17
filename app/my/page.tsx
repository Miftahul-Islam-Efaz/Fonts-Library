import Link from "next/link"
import { cookies } from "next/headers"
import FontHead from "@/components/FontHead"
import Specimen from "@/components/Specimen"
import ThemeControls from "@/components/ThemeControls"
import SignInButton from "@/components/SignInButton"
import { myFavoriteIds } from "@/lib/favorites"
import { listMyFonts } from "@/lib/fonts"
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
	title: "My space",
	description: "The fonts you added, public entries and private copies.",
	robots: { index: false, follow: false },
}

export default async function MySpacePage() {
	if (!isSupabaseConfigured) {
		return (
			<main>
				<h1>My space</h1>
				<div className="notice error">
					Add your Supabase keys to <code>.env.local</code> first.
				</div>
			</main>
		)
	}

	const user = await getCurrentUser()
	if (!user) {
		return (
			<main>
				<h1>My space</h1>
				<p className="lede">
					Sign in with Google to keep your own collection. Fonts you add live
					here, and the first copy of a family also joins the public library.
				</p>
				<SignInButton next="/my" />
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

	const [fonts, favorites] = await Promise.all([
		listMyFonts(user.id, "new"),
		myFavoriteIds(),
	])
	const publicCount = fonts.filter((font) => font.is_public).length
	const privateCount = fonts.length - publicCount

	return (
		<main>
			<FontHead fonts={fonts} />
			<h1>My space</h1>
			<p className="lede">
				{fonts.length === 0
					? "You have not added anything yet."
					: `${fonts.length} ${fonts.length === 1 ? "family" : "families"} · ${publicCount} in the public library · ${privateCount} private to you.`}{" "}
				<Link href="/manage">Add a font</Link>.
			</p>

			{privateCount > 0 ? (
				<div className="notice">
					A family marked private was already in the public library when you added
					it, so your copy is kept here for you only. Nobody else can see it.
				</div>
			) : null}

			{fonts.length > 0 ? (
				<>
					<ThemeControls theme={theme} align={align} size={size} />
					{fonts.map((font) => (
						<section key={font.id} style={{ marginTop: 8 }}>
							<p className="styleLabel">
								<span className={font.is_public ? "badge" : "badge file"}>
									{font.is_public ? "In public library" : "Private to you"}
								</span>
							</p>
							<Specimen
								font={font}
								isFavorite={favorites.has(font.id)}
								signedIn
							/>
						</section>
					))}
				</>
			) : null}
		</main>
	)
}
