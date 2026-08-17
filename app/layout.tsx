import type { Metadata } from "next"
import Link from "next/link"
import { cookies } from "next/headers"
import { signOutAction } from "@/app/actions"
import { isAdminUser } from "@/lib/auth"
import { getCurrentUser } from "@/lib/supabaseServer"
import {
	ALIGN_COOKIE,
	DEFAULT_ALIGN,
	DEFAULT_SIZE,
	DEFAULT_THEME,
	SIZE_COOKIE,
	THEME_COOKIE,
	clampSize,
	isAlign,
	isTheme,
} from "@/lib/theme"
import "./globals.css"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

/** Brand mark, used for the header logo, the favicon and social previews. */
export const LOGO_URL =
	"https://mvajwthjkbwfrzuyvuxl.supabase.co/storage/v1/object/public/Logo/Fonts_library_faviconlogo.png"

export const metadata: Metadata = {
	metadataBase: new URL(siteUrl),
	title: {
		default: "Fonts Library - searchable type specimens",
		template: "%s - Fonts Library",
	},
	description:
		"A shared, server-rendered type library. Every font family is stored with its files or web source and previewed in regular, bold, italic and bold italic.",
	applicationName: "Fonts Library",
	robots: { index: true, follow: true },
	icons: {
		icon: [{ url: LOGO_URL, type: "image/png" }],
		shortcut: [LOGO_URL],
		apple: [LOGO_URL],
	},
	openGraph: {
		type: "website",
		title: "Fonts Library",
		description:
			"Server-rendered type specimens with live previews for every stored font family.",
		url: siteUrl,
		images: [LOGO_URL],
	},
}

export default async function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const store = await cookies()
	const themeCookie = store.get(THEME_COOKIE)?.value
	const alignCookie = store.get(ALIGN_COOKIE)?.value
	const theme = isTheme(themeCookie) ? themeCookie : DEFAULT_THEME
	const align = isAlign(alignCookie) ? alignCookie : DEFAULT_ALIGN
	const size = store.has(SIZE_COOKIE)
		? clampSize(store.get(SIZE_COOKIE)?.value)
		: DEFAULT_SIZE

	const user = await getCurrentUser()
	const isAdmin = isAdminUser(user)

	return (
		<html
			lang="en"
			data-theme={theme}
			data-align={align}
			style={{ "--specimen-size": `${size}px` } as React.CSSProperties}
		>
			<body>
				<div className="wrap">
					<header className="siteHeader">
						<Link href="/" className="brand">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								className="brandMark"
								src={LOGO_URL}
								alt=""
								width={30}
								height={30}
							/>
							<span className="brandName">Fonts Library</span>
						</Link>

						<nav className="navCells" aria-label="Main">
							<Link className="navCell" href="/">
								<span>Fonts</span>
								<small>Library</small>
							</Link>
							<Link className="navCell" href="/pairs">
								<span>Pairs</span>
								<small>Suggested</small>
							</Link>
							{user ? (
								<Link className="navCell" href="/my">
									<span>My space</span>
									<small>Yours</small>
								</Link>
							) : null}
							<Link className="navCell" href="/favorites">
								<span>Favorites</span>
								<small>Liked</small>
							</Link>
							<Link className="navCell" href="/manage">
								<span>{isAdmin ? "Manage" : "Add"}</span>
								<small>{isAdmin ? "Admin" : "A font"}</small>
							</Link>
						</nav>

						<div className="headStatus">
							{user ? (
								<span className="userChip">
									{user.avatar ? (
										/* eslint-disable-next-line @next/next/no-img-element */
										<img
											className="avatar"
											src={user.avatar}
											alt=""
											width={22}
											height={22}
										/>
									) : null}
									{user.name ?? user.email}
									<form action={signOutAction} className="inlineForm">
										<button type="submit" className="linkButton">
											Sign out
										</button>
									</form>
								</span>
							) : (
								<Link href="/login">Sign in with Google</Link>
							)}
						</div>
					</header>
					{children}
					<footer className="siteFooter">
						Fonts Library - server-rendered specimens. Check the license of each
						family at its original source before commercial use.{" "}
						<Link href="/api/fonts">JSON</Link> ·{" "}
						<Link href="/fonts.txt">Plain text</Link>
					</footer>
				</div>
			</body>
		</html>
	)
}
