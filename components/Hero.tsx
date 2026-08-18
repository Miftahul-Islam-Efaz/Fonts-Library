import Link from "next/link"
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site"

export type HeroStats = {
	/** Public families in the library. */
	families: number
	/** Individual styles across those families. */
	styles: number
	/** Distinct people who have contributed a family. */
	contributors: number
}

function Stat({ value, label }: { value: string; label: string }) {
	return (
		<div className="heroStat">
			<span className="heroStatValue">{value}</span>
			<span className="heroStatLabel">{label}</span>
		</div>
	)
}

/**
 * Home page hero.
 *
 * This is also what Google's OAuth branding review reads: the exact consent
 * screen app name as the page's only <h1>, a one-line description of what the
 * app is for, and a plain note about what Google sign-in is used for. All of it
 * is server-rendered text, never behind a dialog or a client-side transition.
 */
export default function Hero({ stats }: { stats: HeroStats }) {
	const families = stats.families.toLocaleString("en-US")
	const styles = stats.styles.toLocaleString("en-US")

	return (
		<section className="hero" aria-labelledby="hero-title">
			<div className="heroCopy">
				<p className="heroEyebrow">Free type library</p>

				<h1 className="heroTitle" id="hero-title">
					{SITE_NAME}
				</h1>

				<p className="heroTagline">{SITE_TAGLINE}</p>

				<p className="heroLead">
					The fonts you fall in love with end up scattered across downloads,
					bookmarks and half-remembered websites. {SITE_NAME} keeps them in one
					place: upload the files or paste a stylesheet link, and each family
					gets a proper entry with a live specimen you can type your own words
					into. Everything you add is saved to your personal space and joins the
					public library below.
				</p>

				<div className="heroActions">
					<a className="heroPrimary" href="#library">
						Browse the library
					</a>
					<Link className="heroSecondary" href="/manage">
						Add a font
					</Link>
					<Link className="heroTertiary" href="/pairs">
						Pair two families
					</Link>
				</div>

				<p className="heroFine">
					Browsing needs no account. Google sign-in only keeps your own space and
					favourites separate, and gives the app your name, email address and
					profile picture. <Link href="/about">About</Link>{" "}
					<span aria-hidden="true">·</span>{" "}
					<Link href="/privacy">Privacy policy</Link>
				</p>
			</div>

			<aside className="heroPanel" aria-label="Library at a glance">
				<div className="heroGlyph" aria-hidden="true">
					<span className="heroGlyphUpper">Aa</span>
					<span className="heroGlyphLower">Type</span>
				</div>

				<div className="heroStats">
					<Stat value={families} label={stats.families === 1 ? "family" : "families"} />
					<Stat value={styles} label={stats.styles === 1 ? "style" : "styles"} />
					<Stat
						value={stats.contributors.toLocaleString("en-US")}
						label={stats.contributors === 1 ? "contributor" : "contributors"}
					/>
				</div>

				<ul className="heroPoints">
					<li>Files or links, both organised the same way</li>
					<li>Live previews in regular, bold and italic</li>
					<li>Download, embed, or install from your terminal</li>
				</ul>
			</aside>
		</section>
	)
}
