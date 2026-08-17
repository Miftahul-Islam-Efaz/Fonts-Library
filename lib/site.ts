/**
 * Single source of truth for site identity, author identity and SEO data.
 *
 * Entity SEO relies on stable @id anchors and a consistent sameAs set, so both
 * the metadata in the layout and the JSON-LD graph read from here.
 */

export const SITE_URL =
	process.env.NEXT_PUBLIC_SITE_URL ?? "https://fonts.miftahulislamefaz.xyz"

export const SITE_NAME = "Type Archive"

export const SITE_TAGLINE =
	"Free fonts for designers and developers, organised in your own space"

export const SITE_DESCRIPTION =
	"Type Archive is a free font library and personal type space for designers, developers and anyone who cares about type. Save high quality free fonts from anywhere - upload .ttf, .otf and .woff files or paste a stylesheet link - keep them organised in your own private space, preview every family in regular, bold and italic with your own text, and discover what the community has collected."

/** Short line used for social cards and AI summaries. */
export const SITE_SUMMARY =
	"A free font library where designers and developers collect, organise and preview high quality fonts in their own personal space."

export const LOGO_URL =
	"https://mvajwthjkbwfrzuyvuxl.supabase.co/storage/v1/object/public/Logo/Fonts_library_faviconlogo.png"

/** Wide social preview card, used for Open Graph, X, WhatsApp, Messenger etc. */
export const COVER_URL =
	"https://mvajwthjkbwfrzuyvuxl.supabase.co/storage/v1/object/public/Logo/cover.jpg"

export const COVER_WIDTH = 1200
export const COVER_HEIGHT = 630

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

/**
 * Search intent, roughly ordered from the strongest commercial terms to the
 * brand terms. Free, designer and developer intent leads, because that is what
 * the library is: free families, previewed in a personal space.
 */
export const KEYWORDS = [
	"free fonts",
	"free fonts for designers",
	"free fonts for developers",
	"free font library",
	"high quality free fonts",
	"personal font library",
	"font library online",
	"font manager",
	"font organiser",
	"save fonts online",
	"font preview tool",
	"type specimen tool",
	"test fonts with your own text",
	"ttf otf woff font manager",
	"upload font and preview",
	"web font preview",
	"font pairing tool",
	"typography library",
	"typeface collection",
	"fonts for web design",
	"fonts for UI design",
	"fonts for branding",
	"Type Archive",
	"Miftahul Islam Efaz",
	"Webigns",
]

/** Who the product is for. Reused in schema.org audience entries. */
export const AUDIENCES = [
	"Graphic designers",
	"Web designers",
	"UI and UX designers",
	"Web developers",
	"Brand and identity designers",
	"Typographers",
	"Students and hobbyists",
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
					"Free fonts",
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
				alternateName: "Type Archive by Miftahul Islam Efaz",
				description: SITE_DESCRIPTION,
				inLanguage: "en",
				image: COVER_URL,
				keywords: KEYWORDS.join(", "),
				isAccessibleForFree: true,
				publisher: { "@id": PERSON_ID },
				creator: { "@id": PERSON_ID },
				about: [
					{ "@type": "Thing", name: "Typography" },
					{ "@type": "Thing", name: "Free fonts" },
					{ "@type": "Thing", name: "Typeface previews" },
				],
				audience: AUDIENCES.map((audienceType) => ({
					"@type": "Audience",
					audienceType,
				})),
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
				applicationSubCategory: "Font library and type specimen tool",
				operatingSystem: "Any modern browser",
				browserRequirements: "Requires JavaScript for previews",
				description: SITE_DESCRIPTION,
				image: COVER_URL,
				screenshot: COVER_URL,
				keywords: KEYWORDS.join(", "),
				isAccessibleForFree: true,
				inLanguage: "en",
				audience: AUDIENCES.map((audienceType) => ({
					"@type": "Audience",
					audienceType,
				})),
				author: { "@id": PERSON_ID },
				creator: { "@id": PERSON_ID },
				isPartOf: { "@id": SITE_ID },
				featureList: [
					"Free to use, with every family free to collect",
					"Upload local font files or add web stylesheet links",
					"Live previews in regular, bold, italic and bold italic",
					"Type directly on any specimen to test your own words",
					"Adjustable specimen size, leading and alignment",
					"Private personal space plus a shared public library",
					"Favourites and automatic font pairing suggestions",
				],
				offers: {
					"@type": "Offer",
					price: "0",
					priceCurrency: "USD",
					availability: "https://schema.org/InStock",
				},
			},
		],
	}
}
