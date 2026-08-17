/**
 * Single source of truth for site identity, author identity and SEO data.
 *
 * Entity SEO relies on stable @id anchors and a consistent sameAs set, so both
 * the metadata in the layout and the JSON-LD graph read from here.
 */

export const SITE_URL =
	process.env.NEXT_PUBLIC_SITE_URL ?? "https://fonts.miftahulislamefaz.xyz"

export const SITE_NAME = "Fonts Library"

export const SITE_TAGLINE = "Your fonts, organised and previewed in one place"

export const SITE_DESCRIPTION =
	"Fonts Library is a personal and community type library. Save fonts from anywhere - local .ttf and .otf files or web stylesheet links - keep them organised in your own space, and preview every family in regular, bold, italic and bold italic with your own text."

export const LOGO_URL =
	"https://mvajwthjkbwfrzuyvuxl.supabase.co/storage/v1/object/public/Logo/Fonts_library_faviconlogo.png"

/** Author and owner of the product. */
export const AUTHOR = {
	name: "Miftahul Islam Efaz",
	jobTitle: "Entrepreneur, Vibe-Coder & AI Orchestrator",
	brand: "Webigns",
	site: "https://www.miftahulislamefaz.xyz/",
	email: "webigns@gmail.com",
	location: "Dhaka, Bangladesh",
}

/** Verified profiles, used for rel="me" links and schema.org sameAs. */
export const SOCIALS = [
	{
		label: "Portfolio",
		handle: "miftahulislamefaz.xyz",
		url: "https://www.miftahulislamefaz.xyz/",
	},
	{
		label: "GitHub",
		handle: "Miftahul-Islam-Efaz",
		url: "https://github.com/Miftahul-Islam-Efaz",
	},
	{
		label: "LinkedIn",
		handle: "miftahul-islam-efaz",
		url: "https://www.linkedin.com/in/miftahul-islam-efaz-a91373284/",
	},
	{
		label: "X",
		handle: "@Miftahul_Islam9",
		url: "https://x.com/Miftahul_Islam9",
	},
	{
		label: "Instagram",
		handle: "@miftahul_islam_efaz",
		url: "https://www.instagram.com/miftahul_islam_efaz/",
	},
	{
		label: "Facebook",
		handle: "miftahul.islam.efaz",
		url: "https://www.facebook.com/miftahul.islam.efaz",
	},
]

export const KEYWORDS = [
	"fonts library",
	"font manager",
	"font collection",
	"type specimen",
	"font preview tool",
	"save fonts online",
	"ttf otf woff manager",
	"font pairing",
	"typography library",
	"Miftahul Islam Efaz",
	"Webigns",
]

const PERSON_ID = `${AUTHOR.site}#person`
const SITE_ID = `${SITE_URL}/#website`
const APP_ID = `${SITE_URL}/#software`

/**
 * One connected JSON-LD graph: the person who made it, the website itself and
 * the web application. Shared @id anchors let search engines and AI crawlers
 * tie the product to its author instead of treating them as strangers.
 */
export function siteGraph() {
	return {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "Person",
				"@id": PERSON_ID,
				name: AUTHOR.name,
				url: AUTHOR.site,
				jobTitle: AUTHOR.jobTitle,
				email: `mailto:${AUTHOR.email}`,
				address: {
					"@type": "PostalAddress",
					addressLocality: "Dhaka",
					addressCountry: "BD",
				},
				knowsAbout: [
					"Typography",
					"Web development",
					"Next.js",
					"Supabase",
					"AI workflow automation",
				],
				sameAs: SOCIALS.map((social) => social.url),
			},
			{
				"@type": "WebSite",
				"@id": SITE_ID,
				url: `${SITE_URL}/`,
				name: SITE_NAME,
				alternateName: "Fonts Library by Miftahul Islam Efaz",
				description: SITE_DESCRIPTION,
				inLanguage: "en",
				publisher: { "@id": PERSON_ID },
				creator: { "@id": PERSON_ID },
				potentialAction: {
					"@type": "SearchAction",
					target: {
						"@type": "EntryPoint",
						urlTemplate: `${SITE_URL}/?q={search_term_string}`,
					},
					"query-input": "required name=search_term_string",
				},
			},
			{
				"@type": "WebApplication",
				"@id": APP_ID,
				name: SITE_NAME,
				url: `${SITE_URL}/`,
				applicationCategory: "DesignApplication",
				operatingSystem: "Any modern browser",
				browserRequirements: "Requires JavaScript for previews",
				description: SITE_DESCRIPTION,
				image: LOGO_URL,
				author: { "@id": PERSON_ID },
				creator: { "@id": PERSON_ID },
				isPartOf: { "@id": SITE_ID },
				featureList: [
					"Upload local font files or add web stylesheet links",
					"Live previews in regular, bold, italic and bold italic",
					"Custom preview text and adjustable specimen size",
					"Private personal space plus a shared public library",
					"Favourites and automatic font pairing suggestions",
				],
				offers: {
					"@type": "Offer",
					price: "0",
					priceCurrency: "USD",
				},
			},
		],
	}
}
