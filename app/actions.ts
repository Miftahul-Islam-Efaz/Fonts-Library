"use server"

import { randomUUID } from "node:crypto"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { isAdminUser, requireAdmin, requireUser } from "@/lib/auth"
import type { ActionState } from "@/lib/actionState"
import { dedupeKey } from "@/lib/dedupe"
import {
	cssFormat,
	faceLabel,
	fileExtension,
	guessFaceMeta,
	isFontFileName,
	slugify,
} from "@/lib/fontMeta"
import { FONT_BUCKET, writeClient } from "@/lib/supabase"
import { authServerClient, getCurrentUser } from "@/lib/supabaseServer"
import type { FaceStyle } from "@/lib/types"

function text(formData: FormData, key: string): string {
	const value = formData.get(key)
	return typeof value === "string" ? value.trim() : ""
}

function fail(message: string): ActionState {
	return { ok: false, message }
}

function refresh(slug?: string) {
	revalidatePath("/")
	revalidatePath("/my")
	revalidatePath("/manage")
	revalidatePath("/favorites")
	revalidatePath("/pairs")
	revalidatePath("/api/fonts")
	if (slug) revalidatePath(`/fonts/${slug}`)
}

/** Contributors may edit their own entries; the admin may edit anything. */
async function requireEditor(fontId: string) {
	const user = await requireUser()
	if (isAdminUser(user)) return user
	const { data } = await writeClient()
		.from("fonts")
		.select("added_by")
		.eq("id", fontId)
		.maybeSingle()
	if (data && data.added_by && data.added_by !== user.id) {
		throw new Error("Only the admin can edit a font someone else added.")
	}
	return user
}

/**
 * Is this family already in the public library? The first copy of a family is
 * public; later copies live only in the space of whoever added them.
 */
async function publicSlotTaken(key: string, exceptId?: string) {
	let query = writeClient()
		.from("fonts")
		.select("id, name")
		.eq("dedupe_key", key)
		.eq("is_public", true)
	if (exceptId) query = query.neq("id", exceptId)
	const { data } = await query.maybeSingle()
	return data ? { id: data.id as string, name: data.name as string } : null
}

async function uniqueSlug(base: string): Promise<string> {
	const client = writeClient()
	const root = slugify(base)
	let candidate = root
	for (let i = 2; i < 50; i += 1) {
		const { data } = await client
			.from("fonts")
			.select("id")
			.eq("slug", candidate)
			.maybeSingle()
		if (!data) return candidate
		candidate = `${root}-${i}`
	}
	return `${root}-${Date.now()}`
}

async function uploadFace(
	slug: string,
	fontId: string,
	file: File,
): Promise<{ file_path: string; format: string | null }> {
	const client = writeClient()
	const extension = fileExtension(file.name) || "ttf"
	const path = `${slug}/${randomUUID()}.${extension}`
	const buffer = Buffer.from(await file.arrayBuffer())
	const { error } = await client.storage.from(FONT_BUCKET).upload(path, buffer, {
		contentType: file.type || `font/${extension}`,
		upsert: false,
	})
	if (error) {
		await client.from("fonts").delete().eq("id", fontId)
		throw new Error(`Upload failed for ${file.name}: ${error.message}`)
	}
	return { file_path: path, format: cssFormat(file.name) }
}

function filesFrom(formData: FormData): File[] {
	return formData
		.getAll("files")
		.filter((entry): entry is File => entry instanceof File && entry.size > 0)
}

/**
 * Files that the compress-font Edge Function already compressed and stored.
 * The browser sends only their storage paths, so nothing large travels through
 * this action and the request-size limit no longer caps how many styles a
 * family can have.
 */
type PreparedFace = { path: string; name: string; format: string | null }

function preparedFrom(formData: FormData): PreparedFace[] {
	const raw = text(formData, "prepared")
	if (!raw) return []
	try {
		const parsed = JSON.parse(raw)
		if (!Array.isArray(parsed)) return []
		return parsed
			.filter(
				(entry): entry is PreparedFace =>
					Boolean(entry) &&
					typeof entry.path === "string" &&
					entry.path.length > 0 &&
					typeof entry.name === "string",
			)
			.map((entry) => ({
				path: entry.path,
				name: entry.name,
				format: entry.format ?? cssFormat(entry.path),
			}))
	} catch {
		return []
	}
}

/** Turns a stored upload into a face row. */
function preparedRow(fontId: string, face: PreparedFace) {
	const meta = guessFaceMeta(face.name)
	return {
		font_id: fontId,
		label: meta.label,
		weight: meta.weight,
		style: meta.style,
		file_path: face.path,
		format: face.format ?? cssFormat(face.path),
	}
}

/** Add a family from uploaded files, a stylesheet link, or a direct font file URL. */
export async function addFontAction(
	_prev: ActionState,
	formData: FormData,
): Promise<ActionState> {
	try {
		const user = await requireUser()
		const client = writeClient()

		const files = filesFrom(formData)
		const prepared = preparedFrom(formData)
		const uploadCount = files.length + prepared.length
		const url = text(formData, "url")
		const name =
			text(formData, "name") || files[0]?.name || prepared[0]?.name || ""
		if (!name) return fail("Give the family a name.")
		if (uploadCount === 0 && !url) {
			return fail("Add at least one font file, or paste a font URL.")
		}

		const isDirectFile = Boolean(url) && isFontFileName(url)
		const sourceType = uploadCount > 0 ? "file" : "link"
		const slug = await uniqueSlug(name)
		const key = dedupeKey(name)

		// Already in my own space? Then there is nothing to add.
		const { data: mine } = await client
			.from("fonts")
			.select("id, slug")
			.eq("dedupe_key", key)
			.eq("added_by", user.id)
			.maybeSingle()
		if (mine) {
			return fail(
				`${name} is already in your space. Open it from My space to add more styles.`,
			)
		}

		const taken = await publicSlotTaken(key)
		const isPublic = !taken

		const { data: font, error } = await client
			.from("fonts")
			.insert({
				name,
				slug,
				category: text(formData, "category") || null,
				notes: text(formData, "notes") || null,
				source_type: sourceType,
				css_url: !isDirectFile && url ? url : null,
				css_family:
					!isDirectFile && url ? text(formData, "cssFamily") || name : null,
				source_page: text(formData, "sourcePage") || null,
				license: text(formData, "license") || null,
				added_by: user.id,
				added_by_name: user.name ?? user.email,
				dedupe_key: key,
				is_public: isPublic,
			})
			.select("id, slug")
			.single()
		if (error || !font) return fail(error?.message ?? "Could not save the font.")

		const faces: Array<Record<string, unknown>> = []

		for (const face of prepared) {
			faces.push(preparedRow(font.id, face))
		}

		for (const file of files) {
			const meta = guessFaceMeta(file.name)
			const uploaded = await uploadFace(slug, font.id, file)
			faces.push({
				font_id: font.id,
				label: meta.label,
				weight: meta.weight,
				style: meta.style,
				file_path: uploaded.file_path,
				format: uploaded.format,
			})
		}

		if (isDirectFile) {
			const meta = guessFaceMeta(url)
			faces.push({
				font_id: font.id,
				label: meta.label,
				weight: meta.weight,
				style: meta.style,
				file_url: url,
				format: cssFormat(url),
			})
		}

		if (faces.length > 0) {
			const { error: faceError } = await client.from("font_faces").insert(faces)
			if (faceError) return fail(faceError.message)
		}

		const styleCount = faces.length
		const styleNote =
			styleCount > 0
				? ` ${styleCount} ${styleCount === 1 ? "style is" : "styles are"} ready to preview.`
				: ""

		refresh(font.slug)
		return {
			ok: true,
			message: isPublic
				? `${name} added to the public library and to your space.${styleNote}`
				: `${taken?.name ?? name} is already in the public library, so this copy was saved to your space only.${styleNote}`,
		}
	} catch (error) {
		return fail(error instanceof Error ? error.message : "Something went wrong.")
	}
}

/** Rename or re-source an existing family, and optionally append more files. */
export async function updateFontAction(
	_prev: ActionState,
	formData: FormData,
): Promise<ActionState> {
	try {
		const id = text(formData, "id")
		if (!id) return fail("Missing font id.")
		await requireEditor(id)
		const client = writeClient()

		const name = text(formData, "name")
		if (!name) return fail("Name cannot be empty.")

		const url = text(formData, "url")
		const isDirectFile = Boolean(url) && isFontFileName(url)

		const { data: existing } = await client
			.from("fonts")
			.select("slug")
			.eq("id", id)
			.single()
		const slug = existing?.slug as string

		// Renaming can move a family into or out of the public slot.
		const key = dedupeKey(name)
		const taken = await publicSlotTaken(key, id)

		const { error } = await client
			.from("fonts")
			.update({
				name,
				category: text(formData, "category") || null,
				notes: text(formData, "notes") || null,
				css_url: !isDirectFile && url ? url : null,
				css_family:
					!isDirectFile && url ? text(formData, "cssFamily") || name : null,
				source_page: text(formData, "sourcePage") || null,
				license: text(formData, "license") || null,
				dedupe_key: key,
				is_public: !taken,
			})
			.eq("id", id)
		if (error) return fail(error.message)

		// Style edits on existing faces.
		for (const [formKey, value] of formData.entries()) {
			const match = formKey.match(/^face-(.+)-weight$/)
			if (!match || typeof value !== "string") continue
			const faceId = match[1]
			const weight = Number(value) || 400
			const style = (text(formData, `face-${faceId}-style`) ||
				"normal") as FaceStyle
			await client
				.from("font_faces")
				.update({ weight, style, label: faceLabel(weight, style) })
				.eq("id", faceId)
		}

		// Styles already compressed and stored by the Edge Function.
		for (const face of preparedFrom(formData)) {
			await client.from("font_faces").insert(preparedRow(id, face))
		}

		// Extra files appended to this family.
		for (const file of filesFrom(formData)) {
			const meta = guessFaceMeta(file.name)
			const uploaded = await uploadFace(slug, id, file)
			await client.from("font_faces").insert({
				font_id: id,
				label: meta.label,
				weight: meta.weight,
				style: meta.style,
				file_path: uploaded.file_path,
				format: uploaded.format,
			})
		}

		refresh(slug)
		return {
			ok: true,
			message: taken
				? `${name} updated. Another copy already holds the public slot, so this one stays in your space.`
				: `${name} updated.`,
		}
	} catch (error) {
		return fail(error instanceof Error ? error.message : "Something went wrong.")
	}
}

/** Removing a single style file is admin-only, like any other deletion. */
export async function deleteFaceAction(
	_prev: ActionState,
	formData: FormData,
): Promise<ActionState> {
	try {
		await requireAdmin()
		const client = writeClient()
		const id = text(formData, "faceId")
		if (!id) return fail("Missing style id.")

		const { data: face } = await client
			.from("font_faces")
			.select("file_path")
			.eq("id", id)
			.maybeSingle()
		if (face?.file_path) {
			await client.storage.from(FONT_BUCKET).remove([face.file_path as string])
		}
		const { error } = await client.from("font_faces").delete().eq("id", id)
		if (error) return fail(error.message)

		refresh(text(formData, "slug"))
		return { ok: true, message: "Style removed." }
	} catch (error) {
		return fail(error instanceof Error ? error.message : "Something went wrong.")
	}
}

/**
 * Deleting a whole family is admin-only. When a public entry goes away, the
 * oldest private copy of the same family is promoted into the public library so
 * the font is not lost to everyone else.
 */
export async function deleteFontAction(
	_prev: ActionState,
	formData: FormData,
): Promise<ActionState> {
	try {
		await requireAdmin()
		const client = writeClient()
		const id = text(formData, "id")
		if (!id) return fail("Missing font id.")

		const { data: target } = await client
			.from("fonts")
			.select("name, dedupe_key, is_public")
			.eq("id", id)
			.maybeSingle()

		const { data: faces } = await client
			.from("font_faces")
			.select("file_path")
			.eq("font_id", id)
		const paths = (faces ?? [])
			.map((face) => face.file_path as string | null)
			.filter((path): path is string => Boolean(path))
		if (paths.length > 0) {
			await client.storage.from(FONT_BUCKET).remove(paths)
		}

		const { error } = await client.from("fonts").delete().eq("id", id)
		if (error) return fail(error.message)

		let promoted: string | null = null
		if (target?.is_public && target.dedupe_key) {
			const { data: next } = await client
				.from("fonts")
				.select("id, added_by_name")
				.eq("dedupe_key", target.dedupe_key)
				.eq("is_public", false)
				.order("created_at", { ascending: true })
				.limit(1)
				.maybeSingle()
			if (next) {
				await client
					.from("fonts")
					.update({ is_public: true })
					.eq("id", next.id as string)
				promoted = (next.added_by_name as string | null) ?? "another member"
			}
		}

		refresh(text(formData, "slug"))
		return {
			ok: true,
			message: promoted
				? `Font deleted. The copy added by ${promoted} is now the public entry.`
				: "Font deleted.",
		}
	} catch (error) {
		return fail(error instanceof Error ? error.message : "Something went wrong.")
	}
}

/** Like or unlike a font as the signed-in Google user. */
export async function toggleFavoriteAction(
	_prev: ActionState,
	formData: FormData,
): Promise<ActionState> {
	try {
		const fontId = text(formData, "fontId")
		if (!fontId) return fail("Missing font id.")

		const client = await authServerClient()
		const user = await getCurrentUser()
		if (!user) return fail("Sign in with Google to save favorites.")

		const { data: existing } = await client
			.from("favorites")
			.select("font_id")
			.eq("font_id", fontId)
			.eq("user_id", user.id)
			.maybeSingle()

		if (existing) {
			const { error } = await client
				.from("favorites")
				.delete()
				.eq("font_id", fontId)
				.eq("user_id", user.id)
			if (error) return fail(error.message)
			refresh(text(formData, "slug"))
			return { ok: true, message: "Removed from favorites." }
		}

		const { error } = await client
			.from("favorites")
			.insert({ font_id: fontId, user_id: user.id })
		if (error) return fail(error.message)

		refresh(text(formData, "slug"))
		return { ok: true, message: "Saved to favorites." }
	} catch (error) {
		return fail(error instanceof Error ? error.message : "Something went wrong.")
	}
}

export async function signOutAction(): Promise<void> {
	const client = await authServerClient()
	await client.auth.signOut()
	revalidatePath("/")
	redirect("/")
}
