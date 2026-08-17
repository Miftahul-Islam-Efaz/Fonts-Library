import { faceLabel } from "@/lib/fontMeta"
import { listFonts } from "@/lib/fonts"
import { isSupabaseConfigured } from "@/lib/supabase"

export const dynamic = "force-dynamic"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ""

/** Plain-text listing: the simplest possible format for an AI model to read. */
export async function GET() {
	if (!isSupabaseConfigured) {
		return new Response("Supabase is not configured.\n", {
			status: 503,
			headers: { "Content-Type": "text/plain; charset=utf-8" },
		})
	}

	const fonts = await listFonts()
	const lines: string[] = [
		"# Fonts Library",
		`# ${fonts.length} families. Generated ${new Date().toISOString()}`,
		"",
	]

	for (const font of fonts) {
		lines.push(`## ${font.name}`)
		if (font.category) lines.push(`Category: ${font.category}`)
		lines.push(
			`Source: ${font.source_type === "file" ? "uploaded font files" : font.css_url || "remote font file"}`,
		)
		if (font.faces.length > 0) {
			lines.push(
				`Styles: ${font.faces
					.map((face) => face.label || faceLabel(face.weight, face.style))
					.join(", ")}`,
			)
		}
		if (font.notes) lines.push(`Notes: ${font.notes}`)
		if (font.license) lines.push(`License: ${font.license}`)
		if (font.source_page) lines.push(`Original source: ${font.source_page}`)
		lines.push(`Page: ${siteUrl}/fonts/${font.slug}`)
		lines.push("")
	}

	return new Response(lines.join("\n"), {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "public, max-age=0, s-maxage=60",
			"Access-Control-Allow-Origin": "*",
		},
	})
}
