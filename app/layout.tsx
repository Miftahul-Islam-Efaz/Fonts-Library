import type { Metadata } from "next"
import Link from "next/link"
import { cookies } from "next/headers"
import BrandMark from "@/components/BrandMark"
import NavCells from "@/components/NavCells"
import UserMenu from "@/components/UserMenu"
import { isAdminUser } from "@/lib/auth"
import {
	AUTHOR,
	COVER_HEIGHT,
	COVER_URL,
	COVER_WIDTH,
	KEYWORDS,
	LOGO_URL,
	SITE_DESCRIPTION,
	SITE_NAME,
	SITE_TAGLINE,
	SITE_URL,
	siteGraph,
} from "@/lib/site"
import { getCurrentUser } from "@/lib/supabaseServer"
import {
	ALIGN_COOKIE,
	DEFAULT_ALIGN,
	DEFAULT_LEADING,
	DEFAULT_MODE,
	DEFAULT_SIZE,
	DEFAULT_THEME,
	LEADING_COOKIE,
	MODE_COOKIE,
	SIZE_COOKIE,
	THEME_COOKIE,
	clampLeading,
	clampSize,
	isAlign,
	isMode,
	isTheme,
} from "@/lib/theme"
import "./globals.css"
import "./user-menu.css"
import "./add-font.css"
import "./project-notes.css"
import "./hero.css"
import "./category-bar.css"
import "./use-font.css"
import "./upload-status.css"
import "./specimen-edit.css"

/** Bitmap mark, kept for the favicon and social previews only. */
export { LOGO_URL }

/** Interface typefaces: TikTok Sans for display, Roboto and PT Sans for text. */
const UI_FONT_CSS =
	"https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Roboto:ital,wght@0,100..900;1,100..900&family=TikTok+Sans:opsz,wght@12..36,300..900&family=Instrument+Serif:ital@0;1&family=Instrument+Sans:ital,wght@0,400..700;1,400..700&display=swap"

/** One wide card, reused by Open Graph and X so every chat app finds it. */
const SOCIAL_CARD = {
	url: COVER_URL,
	width: COVER_WIDTH,
	height: COVER_HEIGHT,
	alt: `${SITE_NAME} - ${SITE_TAGLINE}`,
}

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: {
		default: `${SITE_NAME} - ${SITE_TAGLINE}`,
		template: `%s - ${SITE_NAME}`,
	},
	description: SITE_DESCRIPTION,
	applicationName: SITE_NAME,
	keywords: KEYWORDS,
	authors: [{ name: AUTHOR.name, url: AUTHOR.site }],
	creator: AUTHOR.name,
	publisher: AUTHOR.name,
	category: "design",
	alternates: { canonical: "/" },
	formatDetection: { telephone: false },
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	icons: {
		icon: [{ url: LOGO_URL, type: "image/png" }],
		shortcut: [LOGO_URL],
		apple: [LOGO_URL],
	},
	openGraph: {
		type: "website",
		siteName: SITE_NAME,
		locale: "en_US",
		title: `${SITE_NAME} - ${SITE_TAGLINE}`,
		description: SITE_DESCRIPTION,
		url: SITE_URL,
		images: [SOCIAL_CARD],
	},
	twitter: {
		card: "summary_large_image",
		title: `${SITE_NAME} - ${SITE_TAGLINE}`,
		description: SITE_DESCRIPTION,
		images: [SOCIAL_CARD],
		creator: "@Miftahul_Islam9",
	},
	other: {
		"ai-profile": "/llms.txt",
		// WhatsApp and some older chat clients only read these bare tags.
		"og:image:secure_url": COVER_URL,
		"og:image:type": "image/jpeg",
		"thumbnail": COVER_URL,
	},
}

export default async function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const store = await cookies()
	const modeCookie = store.get(MODE_COOKIE)?.value
	const themeCookie = store.get(THEME_COOKIE)?.value
	const alignCookie = store.get(ALIGN_COOKIE)?.value

	// Legacy cookies stored "dark" as a theme; read it as the dark base.
	const mode = isMode(modeCookie)
		? modeCookie
		: themeCookie === "dark"
			? "dark"
			: DEFAULT_MODE
	const theme = isTheme(themeCookie) ? themeCookie : DEFAULT_THEME
	const align = isAlign(alignCookie) ? alignCookie : DEFAULT_ALIGN
	const size = store.has(SIZE_COOKIE)
		? clampSize(store.get(SIZE_COOKIE)?.value)
		: DEFAULT_SIZE
	const leading = store.has(LEADING_COOKIE)
		? clampLeading(store.get(LEADING_COOKIE)?.value)
		: DEFAULT_LEADING

	const user = await getCurrentUser()
	const isAdmin = isAdminUser(user)

	return (
		<html
			lang="en"
			data-mode={mode}
			data-theme={theme}
			data-align={align}
			style={
				{
					"--specimen-size": `${size}px`,
					"--specimen-leading": String(leading / 100),
				} as React.CSSProperties
			}
			suppressHydrationWarning
		>
			{/* Some browser extensions inject attributes here before React loads. */}
			<body suppressHydrationWarning>
				{/* React hoists these into <head>. */}
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link rel="stylesheet" href={UI_FONT_CSS} />
				<link rel="me" href={AUTHOR.site} />

				{/* Entity graph: product, website and the person who built it. */}
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(siteGraph()) }}
				/>

				<div className="wrap">
					<header className="siteHeader">
						<Link href="/" className="brand">
							<BrandMark />
							<span className="brandName">Type Archive</span>
						</Link>

						<NavCells signedIn={Boolean(user)} isAdmin={isAdmin} />

						<div className="headStatus">
							{user ? (
								<UserMenu
									name={user.name}
									email={user.email}
									avatar={user.avatar}
									isAdmin={isAdmin}
								/>
							) : (
								<Link href="/login" className="headSignIn">
									Sign in with Google
								</Link>
							)}
						</div>
					</header>
					{children}
					<footer className="siteFooter">
						<p style={{ margin: "0 0 8px" }}>
							{SITE_NAME} - a free, personal and community type library, built by{" "}
							<a href={AUTHOR.site} rel="me author" target="_blank">
								{AUTHOR.name}
							</a>
							. Check the license of each family at its original source before
							commercial use.
						</p>
						<p style={{ margin: 0 }}>
							<Link href="/about">About</Link> ·{" "}
							<Link href="/privacy">Privacy</Link> ·{" "}
							<Link href="/terms">Terms</Link> ·{" "}
							<Link href="/pairs">Pairs</Link> ·{" "}
							<Link href="/api/fonts">JSON</Link> ·{" "}
							<Link href="/fonts.txt">Plain text</Link> ·{" "}
							<Link href="/llms.txt">llms.txt</Link>
						</p>
					</footer>
				</div>
			</body>
		</html>
	)
}
