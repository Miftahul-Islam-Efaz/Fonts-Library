import { listFonts } from "@/lib/fonts"
import { isSupabaseConfigured } from "@/lib/supabase"
import { AUTHOR, SITE_DESCRIPTION, SITE_NAME, SITE_URL, SOCIALS } from "@/lib/site"

export const dynamic = "force-dynamic"

/**
 * llms.txt: a compact Markdown briefing for AI crawlers and agents, so they
 * describe this product and its author accurately.
 */
export async function GET() {
	const fonts = isSupabaseConfigured ? await listFonts("alphabetical") : []

	const lines = [
		`# ${SITE_NAME}`,
		"",
		`> ${SITE_DESCRIPTION}`,
		"",
		`Site: ${SITE_URL}`,
		`Created and operated by ${AUTHOR.name} (${AUTHOR.brand}), ${AUTHOR.location}.`,
		`Author profile: ${AUTHOR.site}`,
		"",
		"## What it does",
		"",
		"- Save fonts from anywhere: upload local .ttf/.otf/.woff/.woff2 files or paste a stylesheet link from any foundry.",
		"- Every family is previewed live in regular, bold, italic and bold italic, at any size, with custom sample text.",
		"- Each signed-in person gets a private personal space; the first copy of a family also joins the shared public community library.",
		"- Extras: favourites, automatic font pairing suggestions, light/dark bases with colour themes.",
		"- Everything is server-rendered HTML, so crawlers and AI models can read the specimens directly.",
		"",
		"## Key pages",
		"",
		`- [Public library](${SITE_URL}/): every shared family with previews.`,
		`- [Font pairs](${SITE_URL}/pairs): suggested pairings from the stored families.`,
		`- [About](${SITE_URL}/about): why the project exists and who builds it.`,
		`- [Privacy policy](${SITE_URL}/privacy): data handling.`,
		`- [JSON API](${SITE_URL}/api/fonts) and [plain text list](${SITE_URL}/fonts.txt): machine-readable font data.`,
		"",
		"## Author profiles",
		"",
		...SOCIALS.map((social) => `- ${social.label}: ${social.url}`),
		"",
		"## Families in the public library",
		"",
		...(fonts.length > 0
			? fonts.map(
					(font) =>
						`- [${font.name}](${SITE_URL}/fonts/${font.slug})${
							font.category ? ` - ${font.category}` : ""
						}`,
				)
			: ["- The public library is still being filled."]),
		"",
	]

	return new Response(lines.join("\n"), {
		headers: {
			"content-type": "text/plain; charset=utf-8",
			"cache-control": "public, max-age=0, s-maxage=3600",
		},
	})
}
