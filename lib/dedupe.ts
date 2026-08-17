/**
 * Normalised key used to decide whether two people added "the same font".
 * "Mrs Sheppards", "mrs-sheppards" and "MrsSheppards.otf" all collapse to the
 * same key, so only the first copy reaches the public library.
 */
export function dedupeKey(name: string): string {
	return name
		.normalize("NFKD")
		.toLowerCase()
		.replace(/\.(ttf|otf|ttc|woff2?|eot)$/, "")
		.replace(/[^a-z0-9]+/g, "")
}
