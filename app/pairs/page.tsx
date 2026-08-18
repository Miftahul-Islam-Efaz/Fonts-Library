import Link from "next/link"
import { cookies } from "next/headers"
import FontHead from "@/components/FontHead"
import PairBuilder, { type PairOption } from "@/components/PairBuilder"
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
	title: "Font pairings — build your own or use the suggestions",
	description:
		"Pair any two families from the library by hand with your own words, sizes and weights, or use pairings scored automatically on contrast, text comfort, weight range and likes.",
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

	// Only what the builder needs, so nothing heavy crosses to the client.
	const options: PairOption[] = fonts.map((font) => ({
		id: font.id,
		slug: font.slug,
		name: font.name,
		family: cssFamily(font),
		category: font.category,
	}))

	return (
		<main>
			<FontHead fonts={fonts} />

			<section style={{ marginTop: 24 }}>
				<h1>Pairings</h1>
				<p className="lede">
					Build a pairing yourself from any two families in the library, or scroll
					down for combinations scored automatically on contrast, how comfortable
					each face is in long text, its weight range and how many likes it has.
				</p>
			</section>

			<ThemeControls theme={theme} align={align} size={size} />

			<PairBuilder fonts={options} />

			<section aria-label="Recommended pairings" style={{ marginTop: 40 }}>
				<h2>Suggested for you</h2>
				<p className="meta">
					Add a category when you upload a font and these get sharper.
				</p>

				{pairs.length === 0 ? (
					<div className="notice">
						Add at least two families and pairings will appear here.{" "}
						<Link href="/manage">Add a font</Link>.
					</div>
				) : (
					pairs.map((pair) => (
						<article
							className="fontCard"
							key={`${pair.heading.id}-${pair.body.id}`}
						>
							<div className="cardTop">
								<h3>
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
								</h3>
								<span className="badge">
									{pair.headingClass} + {pair.bodyClass}
								</span>
								<span className="cardTopRight">
									<span className="likeCount">{pair.score} / 100</span>
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
					))
				)}
			</section>
		</main>
	)
}
