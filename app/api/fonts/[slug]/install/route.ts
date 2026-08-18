import { NextResponse } from "next/server"
import { cssFamily, faceUrl, getFontBySlug } from "@/lib/fonts"
import { cssFormat, faceLabel, fileExtension, slugify } from "@/lib/fontMeta"
import { isSupabaseConfigured } from "@/lib/supabase"
import type { FontFaceRecord, FontRecord } from "@/lib/types"

export const dynamic = "force-dynamic"

interface Downloadable {
	url: string
	fileName: string
	weight: number
	style: string
	format: string | null
}

/** Stable, predictable file names for the folder the script creates. */
export function downloadables(font: FontRecord): Downloadable[] {
	const used = new Set<string>()
	const list: Downloadable[] = []
	for (const face of font.faces as FontFaceRecord[]) {
		const url = faceUrl(face)
		if (!url) continue
		const extension = fileExtension(url) || "woff2"
		const base = slugify(
			`${font.name} ${face.label || faceLabel(face.weight, face.style)}`,
		)
		let fileName = `${base}.${extension}`
		let counter = 2
		while (used.has(fileName)) {
			fileName = `${base}-${counter}.${extension}`
			counter += 1
		}
		used.add(fileName)
		list.push({
			url,
			fileName,
			weight: face.weight,
			style: face.style,
			format: face.format ?? cssFormat(url),
		})
	}
	return list
}

function faceRules(family: string, files: Downloadable[]): string[] {
	return files.flatMap((file) => [
		"@font-face {",
		'  font-family: "' + family + '";',
		'  src: url("./' +
			file.fileName +
			'")' +
			(file.format ? ' format("' + file.format + '")' : "") +
			";",
		"  font-weight: " + file.weight + ";",
		"  font-style: " + file.style + ";",
		"  font-display: swap;",
		"}",
	])
}

/** POSIX shell installer: curl the files, write the CSS, print what to paste. */
function shScript(font: FontRecord, files: Downloadable[]): string {
	const family = cssFamily(font)
	const lines: string[] = [
		"#!/bin/sh",
		"# Type Archive installer for " + font.name,
		"# Usage: curl -fsSL <this url> | sh     (optionally: ... | sh -s ./public/fonts)",
		"set -e",
		'DEST="${1:-./fonts}"',
		'DIR="$DEST/' + font.slug + '"',
		'mkdir -p "$DIR"',
		'printf "Installing ' +
			font.name +
			" (" +
			files.length +
			' file(s)) into %s\\n" "$DIR"',
		"",
	]

	if (font.source_type === "link" && font.css_url) {
		lines.push(
			'cat > "$DIR/' + font.slug + '.css" <<\'CSS\'',
			'@import url("' + font.css_url + '");',
			"CSS",
			"",
			'printf "\\nDone. This family is hosted online, so only a CSS import was written.\\n"',
			'printf "Paste this in your HTML head instead if you prefer:\\n"',
			'printf \'  <link rel="stylesheet" href="' +
				font.css_url +
				'">\\n\'',
			'printf "CSS: font-family: \\"' + family + '\\", sans-serif;\\n"',
		)
		return lines.join("\n") + "\n"
	}

	for (const file of files) {
		lines.push(
			'printf "  %s\\n" "' + file.fileName + '"',
			'curl -fsSL "' + file.url + '" -o "$DIR/' + file.fileName + '"',
		)
	}

	lines.push(
		"",
		'cat > "$DIR/' + font.slug + '.css" <<\'CSS\'',
		...faceRules(family, files),
		"CSS",
		"",
		'printf "\\nDone. %s file(s) in %s\\n" "' +
			files.length +
			'" "$DIR"',
		'printf "Import it:\\n  @import url(\\"./' +
			font.slug +
			"/" +
			font.slug +
			'.css\\");\\n"',
		'printf "Then use:\\n  font-family: \\"' +
			family +
			'\\", system-ui, sans-serif;\\n"',
	)

	if (font.license) {
		lines.push('printf "License: ' + font.license.replace(/"/g, "'") + '\\n"')
	}

	return lines.join("\n") + "\n"
}

/** PowerShell installer for Windows, same behaviour as the sh version. */
function psScript(font: FontRecord, files: Downloadable[]): string {
	const family = cssFamily(font)
	const lines: string[] = [
		"# Type Archive installer for " + font.name,
		"# Usage: irm <this url>?shell=powershell | iex",
		"$ErrorActionPreference = 'Stop'",
		"$dest = if ($env:TYPE_ARCHIVE_DEST) { $env:TYPE_ARCHIVE_DEST } else { './fonts' }",
		"$dir = Join-Path $dest '" + font.slug + "'",
		"New-Item -ItemType Directory -Force -Path $dir | Out-Null",
		'Write-Host "Installing ' +
			font.name +
			" (" +
			files.length +
			' file(s)) into $dir"',
		"",
	]

	if (font.source_type === "link" && font.css_url) {
		lines.push(
			"@'",
			'@import url("' + font.css_url + '");',
			"'@ | Set-Content -Encoding UTF8 (Join-Path $dir '" +
				font.slug +
				".css')",
			"",
			"Write-Host ''",
			"Write-Host 'Done. This family is hosted online, so only a CSS import was written.'",
			'Write-Host \'Paste in your head: <link rel="stylesheet" href="' +
				font.css_url +
				'">\'',
		)
		return lines.join("\n") + "\n"
	}

	for (const file of files) {
		lines.push(
			"Write-Host '  " + file.fileName + "'",
			"Invoke-WebRequest -Uri '" +
				file.url +
				"' -OutFile (Join-Path $dir '" +
				file.fileName +
				"') -UseBasicParsing",
		)
	}

	lines.push(
		"",
		"@'",
		...faceRules(family, files),
		"'@ | Set-Content -Encoding UTF8 (Join-Path $dir '" + font.slug + ".css')",
		"",
		"Write-Host ''",
		"Write-Host 'Done. " + files.length + " file(s) in ' $dir",
		'Write-Host \'Import it:  @import url("./' +
			font.slug +
			"/" +
			font.slug +
			'.css");\'',
		"Write-Host 'Then use:   font-family: \"" +
			family +
			'", system-ui, sans-serif;\'',
	)

	return lines.join("\n") + "\n"
}

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ slug: string }> },
) {
	const { slug } = await params
	if (!isSupabaseConfigured) {
		return NextResponse.json({ error: "Library unavailable." }, { status: 503 })
	}

	const font = await getFontBySlug(slug)
	if (!font) {
		return new NextResponse("# Font not found: " + slug + "\n", {
			status: 404,
			headers: { "content-type": "text/plain; charset=utf-8" },
		})
	}

	const shell = new URL(request.url).searchParams.get("shell")
	const files = downloadables(font)
	const body =
		shell === "powershell" || shell === "ps"
			? psScript(font, files)
			: shScript(font, files)

	return new NextResponse(body, {
		headers: {
			"content-type": "text/plain; charset=utf-8",
			"cache-control": "public, max-age=300",
		},
	})
}
