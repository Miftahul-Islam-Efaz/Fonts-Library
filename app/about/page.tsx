import type { Metadata } from "next"
import Link from "next/link"
import BrandMark from "@/components/BrandMark"
import {
	AUTHOR,
	SITE_DESCRIPTION,
	SITE_NAME,
	SITE_URL,
	SOCIALS,
} from "@/lib/site"

export const metadata: Metadata = {
	title: "About Type Archive",
	description:
		"Why Type Archive exists, how the personal and community spaces work, and who builds it: Miftahul Islam Efaz, an entrepreneur, vibe-coder and AI orchestrator from Dhaka, Bangladesh.",
	alternates: { canonical: "/about" },
	openGraph: {
		title: "About Type Archive",
		description: SITE_DESCRIPTION,
		url: `${SITE_URL}/about`,
		type: "profile",
	},
}

/** JSON-LD for this page: an about page tied to the author entity. */
const aboutGraph = {
	"@context": "https://schema.org",
	"@type": "AboutPage",
	"@id": `${SITE_URL}/about`,
	url: `${SITE_URL}/about`,
	name: `About ${SITE_NAME}`,
	description: SITE_DESCRIPTION,
	isPartOf: { "@id": `${SITE_URL}/#website` },
	about: { "@id": `${SITE_URL}/#software` },
	mainEntity: {
		"@type": "Person",
		"@id": `${AUTHOR.site}#person`,
		name: AUTHOR.name,
		url: AUTHOR.site,
		jobTitle: AUTHOR.jobTitle,
		sameAs: SOCIALS.map((social) => social.url),
	},
}

export default function AboutPage() {
	return (
		<main>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutGraph) }}
			/>

			<p className="eyebrow">About</p>
			<h1>One home for every font you love</h1>

			<div className="aboutHero">
				<BrandMark size={64} />
				<p className="lede" style={{ margin: 0, flex: "1 1 320px" }}>
					Type Archive is a personal type library that doubles as a community
					one. Save fonts from anywhere - files from your disk or links from the
					web - and see every family previewed properly instead of buried in a
					downloads folder.
				</p>
			</div>

			<div className="prose">
				<h2>Why it exists</h2>
				<p>
					There is no shortage of font libraries on the internet. The problem is
					what happens after you find a typeface you love. It ends up in a zip
					file, a bookmark, a screenshot, or a folder you never open again. The
					fonts you actually chose - the ones that matter to your work - are never
					kept together in one organised place where you can see what they look
					like.
				</p>
				<p>
					This site fixes that. It is one place to collect fonts from everywhere:
					locally downloaded <code>.ttf</code>, <code>.otf</code>,{" "}
					<code>.woff</code> and <code>.woff2</code> files, or online sources like
					Google Fonts, Fontshare and Fontesk pasted in as a stylesheet link.
					Every family is stored with its weights and italics, its license, its
					original source page and your own notes, and every family is rendered
					live so you can judge it at a glance.
				</p>

				<h2>Personal space, community library</h2>
				<p>
					The goal is a library for each individual that adds up to a library for
					everyone. When you add a font, it is saved to your own space and it also
					appears in the public community library, so the collection grows for
					every visitor. If a family has already been added by someone else, your
					copy stays in your personal space instead of duplicating the public
					entry. You can edit and organise what you added; the public library is
					kept clean by the admin.
				</p>

				<h2>What you can do here</h2>
				<ul>
					<li>
						Add fonts by uploading files or pasting a link from any foundry.
					</li>
					<li>
						Preview each family in regular, bold, italic and bold italic, at any
						size, with your own sample text.
					</li>
					<li>Keep a private space and contribute to the public library.</li>
					<li>Mark favourites and get automatic font pairing suggestions.</li>
					<li>
						Switch between light and dark bases with colour themes, and read every
						page as server-rendered HTML - so search engines and AI models can read
						it too.
					</li>
				</ul>

				<h2>The developer</h2>
				<p>
					Type Archive is designed and built by{" "}
					<a href={AUTHOR.site} rel="me author" target="_blank">
						<strong>{AUTHOR.name}</strong>
					</a>
					, an entrepreneur, vibe-coder and AI orchestrator based in{" "}
					{AUTHOR.location}, working under the {AUTHOR.brand} name. He builds
					intelligent automated engines, bespoke n8n pipelines and modular backend
					infrastructures for clients internationally, across TypeScript, Node.js,
					Next.js, Supabase and Postgres, with a focus on AI-accelerated product
					delivery.
				</p>
				<p>
					His work spans creative frontend engineering, automated workflow systems
					and generative AI integrations, with client products ranging from resort
					and architecture studios to SaaS growth engines. He is a global winner of
					the LabLab.ai vibe-coding hackathon and Grand Champion for AI Workflows
					at the Impact Dhaka Festival. Type Archive is his own product, built to
					scratch a designer&apos;s itch: keep the fonts you love somewhere
					beautiful and organised.
				</p>

				<h3>Find him online</h3>
				<ul className="socialGrid">
					{SOCIALS.map((social) => (
						<li key={social.url}>
							<a
								className="socialCard"
								href={social.url}
								rel="me noopener"
								target="_blank"
							>
								<strong>{social.label}</strong>
								<span>{social.handle}</span>
							</a>
						</li>
					))}
				</ul>
				<p className="meta">
					Work enquiries and feedback about this site:{" "}
					<a href={`mailto:${AUTHOR.email}`}>{AUTHOR.email}</a>
				</p>

				<h2>Licensing and fair use</h2>
				<p>
					Type Archive stores what contributors add for previewing and
					reference. It does not claim ownership of any typeface. Always check the
					license on a family&apos;s original source page before using it
					commercially. If you are a foundry and want a family removed, email the
					address above and it will be taken down.
				</p>

				<p className="meta">
					See also the <Link href="/privacy">privacy policy</Link> or start
					browsing the <Link href="/">library</Link>.
				</p>
			</div>
		</main>
	)
}
