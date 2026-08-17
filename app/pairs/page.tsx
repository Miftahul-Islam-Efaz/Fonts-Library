import Link from "next/link"
import { cookies } from "next/headers"
import FontHead from "@/components/FontHead"
import ThemeControls from "@/components/ThemeControls"
import { cssFamily, listFonts } from "@/lib/fonts"
import { bestPairs } from "@/lib/pairing"
import { isSupabaseConfigured } from "@/lib/supabase"
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
	title: "Automatic font pairings",
	description:
		"Every family in the library scored against every other one, ranked by contrast, text comfort, weight range and likes, then previewed as a real headline and paragraph.",
}

const SAMPLE_HEADLINE = "Type that carries the page"
const SAMPLE_BODY =
	"A pairing works when the headline face brings personality and the text face disappears into the reading. This paragraph is set in the recommended body font so you can judge rhythm, spacing and how it holds up at small sizes before you commit to it."

export default async function PairsPage() {
	if (!isSupabaseConfigured) {
		return (
			<main>
				<h1>Pairings</h1>
				<div className="notice error">Supabase is not connected yet.</div>
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

	const fonts = await listFonts("alphabetical")
	const pairs = bestPairs(fonts, 12)

	return (
		<main>
			<FontHead fonts={fonts} />

			<section style={{ marginTop: 24 }}>
				<h1>Automatic pairings</h1>
				<p className="lede">
					Every family in your library is scored against every other one on
					contrast, how comfortable it is in long text, its weight range and how
					many likes it has. The strongest combinations are below, previewed as a
					real headline and paragraph. Add a category when you upload a font and
					the suggestions get sharper.
				</p>
			</section>

			<ThemeControls theme={theme} align={align} size={size} />

			{pairs.length === 0 ? (
				<div className="notice">
					Add at least two families and pairings will appear here.{" "}
					<Link href="/manage">Add a font</Link>.
				</div>
			) : (
				<section aria-label="Recommended pairings">
					{pairs.map((pair) => (
						<article
							className="fontCard"
							key={`${pair.heading.id}-${pair.body.id}`}
						>
							<div className="cardTop">
								<h2>
									<Link
										href={`/fonts/${pair.heading.slug}`}
										style={{ color: "inherit" }}
									>
										{pair.heading.name}
									</Link>
									{" + "}
									<Link
										href={`/fonts/${pair.body.slug}`}
										style={{ color: "inherit" }}
									>
										{pair.body.name}
									</Link>
								</h2>
								<span className="badge">{pair.headingClass} + {pair.bodyClass}</span>
								<span className="cardTopRight">
									<span className="likeCount">{pair.score} / 100</span>
								</span>
							</div>

							<p className="meta">{pair.reason}</p>

							<p
								className="specimen"
								style={{
									fontFamily: `"${cssFamily(pair.heading)}", var(--sys)`,
									fontWeight: 700,
								}}
							>
								{SAMPLE_HEADLINE}
							</p>
							<p
								style={{
									fontFamily: `"${cssFamily(pair.body)}", var(--sys)`,
									fontSize: 17,
									lineHeight: 1.6,
									maxWidth: "62ch",
									marginBottom: 0,
								}}
							>
								{SAMPLE_BODY}
							</p>
						</article>
					))}
				</section>
			)}
		</main>
	)
}
