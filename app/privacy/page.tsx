import type { Metadata } from "next"
import Link from "next/link"
import { AUTHOR, SITE_NAME, SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
	title: "Privacy policy",
	description:
		"How Type Archive handles your Google account data, the fonts you upload, cookies and analytics, and how to delete your data.",
	alternates: { canonical: "/privacy" },
}

const UPDATED = "17 August 2026"

export default function PrivacyPage() {
	return (
		<main>
			<p className="eyebrow">Legal</p>
			<h1>Privacy policy</h1>
			<p className="lede">
				Last updated {UPDATED}. This policy explains what {SITE_NAME} collects,
				why, and how to remove it. Plain language, no surprises.
			</p>

			<div className="prose">
				<h2>Who runs this site</h2>
				<p>
					{SITE_NAME} ({SITE_URL}) is an independent project operated by{" "}
					{AUTHOR.name} ({AUTHOR.brand}), based in {AUTHOR.location}. For any
					privacy question or request, email{" "}
					<a href={`mailto:${AUTHOR.email}`}>{AUTHOR.email}</a>.
				</p>

				<h2>What is collected</h2>
				<h3>If you never sign in</h3>
				<p>
					Nothing personal is collected. You can browse the public library, change
					themes and preview fonts anonymously. Your theme, alignment and preview
					size choices are stored in cookies on your own device so the site looks
					the same on your next visit, and your custom preview text is kept in
					your browser&apos;s local storage. None of it is sent anywhere or used to
					identify you.
				</p>

				<h3>If you sign in with Google</h3>
				<p>
					Sign-in uses Google OAuth through Supabase Auth. Only basic profile
					information is requested and stored: your name, email address, profile
					picture URL and a Supabase user ID. Your Google password is never seen
					or stored by this site, and no other Google data - no Drive, contacts,
					calendar or mail - is requested or accessed. A session cookie keeps you
					signed in.
				</p>
				<p>
					Your email address is used to identify your personal space, to show who
					contributed a font, and to check administrator rights. It is never sold,
					rented or shared with advertisers, and there is no marketing email list.
				</p>

				<h3>Content you add</h3>
				<p>
					Font files you upload, links you paste, family names, categories,
					licenses, source pages, notes and favourites are stored in the
					site&apos;s database and file storage. Fonts you add to the public
					library are visible to everyone, attributed to your display name. Fonts
					kept in your personal space are visible only to you and the site
					administrator.
				</p>

				<h2>Cookies</h2>
				<ul>
					<li>
						<strong>Authentication cookies</strong> set by Supabase, to keep your
						session active. Removed when you sign out.
					</li>
					<li>
						<strong>Preference cookies</strong> for the light or dark base, colour
						theme, text alignment and specimen size.
					</li>
				</ul>
				<p>
					There are no advertising cookies, no third-party trackers and no
					cross-site profiling. You can clear cookies at any time in your browser;
					the site keeps working with default settings.
				</p>

				<h2>Service providers</h2>
				<ul>
					<li>
						<strong>Supabase</strong> - authentication, database and font file
						storage.
					</li>
					<li>
						<strong>Vercel</strong> - hosting and delivery, including standard
						server logs such as IP address and user agent, kept for security and
						debugging.
					</li>
					<li>
						<strong>Google</strong> - OAuth sign-in, and Google Fonts for the
						interface typefaces.
					</li>
				</ul>
				<p>
					When a font is added as an external stylesheet link, your browser loads
					that file directly from the foundry or CDN that hosts it, so that
					provider may see the request.
				</p>

				<h2>How long data is kept</h2>
				<p>
					Account details and the fonts you added are kept until you ask for them
					to be deleted. Server logs are kept only as long as the hosting provider
					retains them.
				</p>

				<h2>Your rights</h2>
				<p>
					You can ask for a copy of your data, correction of anything inaccurate,
					or complete deletion of your account and everything you uploaded. Email{" "}
					<a href={`mailto:${AUTHOR.email}`}>{AUTHOR.email}</a> and it will be
					handled within 30 days. Deleting your account removes your profile, your
					private fonts and your favourites.
				</p>

				<h2>Children</h2>
				<p>
					This site is not directed at children under 13 and does not knowingly
					collect their data.
				</p>

				<h2>Security</h2>
				<p>
					Traffic is served over HTTPS, sign-in is delegated to Google, and
					database access is protected by row level security so people can only
					read and change what they are allowed to. No system is perfect, so
					please report anything suspicious to the email above.
				</p>

				<h2>Font licensing</h2>
				<p>
					Typefaces stored here remain the property of their designers and
					foundries. Check the license on each family&apos;s source page before
					commercial use. Rights holders can request removal at any time by
					emailing the address above.
				</p>

				<h2>Changes</h2>
				<p>
					If this policy changes, the date at the top is updated. Significant
					changes will be noted on the site.
				</p>

				<p className="meta">
					More about the project and its developer on the{" "}
					<Link href="/about">about page</Link>.
				</p>
			</div>
		</main>
	)
}
