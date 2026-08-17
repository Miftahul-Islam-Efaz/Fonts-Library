export type FaceStyle = "normal" | "italic"

export type SourceType = "file" | "link"

/** One concrete style of a family, e.g. Bold Italic. */
export interface FontFaceRecord {
	id: string
	font_id: string
	label: string | null
	weight: number
	style: FaceStyle
	/** Storage object path when the file was uploaded. */
	file_path: string | null
	/** Direct URL to a remote font file. */
	file_url: string | null
	format: string | null
	created_at: string
}

export interface FontRecord {
	id: string
	name: string
	slug: string
	category: string | null
	notes: string | null
	source_type: SourceType
	/** Stylesheet URL, e.g. a Google Fonts css2 link. */
	css_url: string | null
	/** font-family name used inside that stylesheet. Defaults to name. */
	css_family: string | null
	/** Where the font came from, for credit and licensing. */
	source_page: string | null
	license: string | null
	/** Google account id of the contributor. */
	added_by: string | null
	/** Display name of the contributor, kept for credit. */
	added_by_name: string | null
	/** True when this row is the public library entry for the family. */
	is_public: boolean
	/** Normalised family name used to detect duplicates. */
	dedupe_key: string | null
	created_at: string
	faces: FontFaceRecord[]
	/** How many people have liked this family. */
	favorite_count?: number
}
