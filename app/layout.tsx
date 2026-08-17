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

export const metadata: Metadata = {
	metadataBase: new URL(siteUrl),
	title: {
		default: "Fonts Library — searchable type specimens",
		template: "%s — Fonts Library",
	},
	description:
		"A shared, server-rendered type library. Every font family is stored with its files or web source and previewed in regular, bold, italic and bold italic.",
	applicationName: "Fonts Library",
	robots: { index: true, follow: true },
	openGraph: {
		type: "website",
		title: "Fonts Library",
		description:
			"Server-rendered type specimens with live previews for every stored font family.",
		url: siteUrl,
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
						<div>
							<p className="eyebrow">Type library</p>
							<h1 style={{ fontSize: 22, margin: 0 }}>
								<Link href="/" style={{ border: 0, color: "inherit" }}>
									Fonts Library
								</Link>
							</h1>
						</div>
						<nav className="navLinks" aria-label="Main">
							<Link href="/">Library</Link>
							<Link href="/pairs">Pairings</Link>
							{user ? <Link href="/my">My space</Link> : null}
							<Link href="/favorites">Favorites</Link>
							<Link href="/manage">{isAdmin ? "Manage" : "Add a font"}</Link>
							<Link href="/api/fonts">JSON</Link>
							<Link href="/fonts.txt">Text</Link>
							{user ? (
								<span className="userChip">
									{user.avatar ? (
										/* eslint-disable-next-line @next/next/no-img-element */
										<img
											className="avatar"
											src={user.avatar}
											alt=""
											width={24}
											height={24}
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
								<Link href="/login">Sign in</Link>
							)}
						</nav>
					</header>
					{children}
					<footer className="siteFooter">
						Fonts Library — server-rendered specimens. Check the license of
						each family at its original source before commercial use.
					</footer>
				</div>
			</body>
		</html>
	)
}
