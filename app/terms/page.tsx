import type { Metadata } from "next"
import Link from "next/link"
import { AUTHOR, SITE_NAME, SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
	title: "Terms of service",
	description:
		"The terms for using Fonts Library: what the service is, what you may upload, font licensing responsibilities, account rules and how the library is moderated.",
	alternates: { canonical: "/terms" },
}

const UPDATED = "17 August 2026"

export default function TermsPage() {
	return (
		<main>
			<p className="eyebrow">Legal</p>
			<h1>Terms of service</h1>
			<p className="lede">
				Last updated {UPDATED}. By using {SITE_NAME} you agree to these terms.
				They are intentionally short and plain.
			</p>

			<div className="prose">
				<h2>The service</h2>
				<p>
					{SITE_NAME} ({SITE_URL}) is a free web app for collecting, organising
					and previewing typefaces. It is an independent project operated by{" "}
					{AUTHOR.name} ({AUTHOR.brand}), based in {AUTHOR.location}. You can
					browse the public library without an account. Signing in with Google
					gives you a personal space, favourites and the ability to add fonts.
				</p>

				<h2>Your account</h2>
				<p>
					Sign-in uses Google OAuth. You are responsible for activity under your
					account, and you must not attempt to access other people&apos;s personal
					spaces, administrator functions or the underlying database. You may stop
					using the service at any time and request deletion of your data as
					described in the <Link href="/privacy">privacy policy</Link>.
				</p>

				<h2>Fonts you add</h2>
				<p>
					You keep whatever rights you already hold in the material you upload.
					By adding a font you confirm that you are allowed to store and preview
					it, and you accept that its entry - the family name, category, notes,
					source link and preview - is also shown in the public community library.
					Font files and stylesheet links are hosted so that previews can be
					rendered.
				</p>
				<p>
					<strong>Licensing is your responsibility.</strong> Typefaces are
					software and most carry a licence that limits redistribution. Do not
					upload pirated, cracked or commercially licensed fonts you are not
					entitled to share. {SITE_NAME} is a personal organisation tool, not a
					font shop or a distribution channel, and no licence to any third-party
					typeface is granted to you by this site.
				</p>

				<h2>Acceptable use</h2>
				<p>Please do not:</p>
				<ul>
					<li>upload malware, or files that are not genuine font files;</li>
					<li>
						upload unlawful, hateful or infringing material, including artwork or
						sample text you have no right to use;
					</li>
					<li>
						scrape, overload or attack the service, or use it to build a competing
						bulk redistribution mirror;
					</li>
					<li>impersonate another person or contributor.</li>
				</ul>

				<h2>Moderation</h2>
				<p>
					Contributors can edit and remove the fonts they added. The
					administrator may remove any entry from the public library - for example
					a licence complaint, a duplicate or a broken upload - and may suspend
					access in cases of abuse. If you are a type designer or foundry and want
					something taken down, email{" "}
					<a href={`mailto:${AUTHOR.email}`}>{AUTHOR.email}</a> and it will be
					removed promptly.
				</p>

				<h2>Availability and liability</h2>
				<p>
					The service is provided free of charge, as is, without warranties of any
					kind. There is no guarantee of uptime, and features may change or be
					withdrawn. Keep your own copies of any font files that matter to you. To
					the fullest extent permitted by law, the operator is not liable for lost
					data, lost profits or any indirect damages arising from use of the site.
				</p>

				<h2>Changes</h2>
				<p>
					These terms may be updated as the app grows. The date at the top always
					shows the current version, and continued use after a change means you
					accept it.
				</p>

				<h2>Contact</h2>
				<p>
					Questions about these terms: <a href={`mailto:${AUTHOR.email}`}>{AUTHOR.email}</a>. More about
					the project and its developer is on the{" "}
					<Link href="/about">about page</Link>.
				</p>
			</div>
		</main>
	)
}
