import Link from "next/link"
import { redirect } from "next/navigation"
import SignInButton from "@/components/SignInButton"
import { getCurrentUser } from "@/lib/supabaseServer"

export const dynamic = "force-dynamic"

export const metadata = {
	title: "Sign in",
	robots: { index: false, follow: false },
}

export default async function LoginPage({
	searchParams,
}: {
	searchParams: Promise<{ next?: string; error?: string }>
}) {
	const { next, error } = await searchParams
	const target = next && next.startsWith("/") ? next : "/"

	const user = await getCurrentUser()
	if (user) redirect(target)

	return (
		<main>
			<h1>Sign in</h1>
			<p className="lede">
				Google sign-in is used for favorites and for managing the library. Browsing
				and previewing fonts never requires an account.
			</p>
			{error ? <div className="notice error">{error}</div> : null}
			<div style={{ marginTop: 20 }}>
				<SignInButton next={target} />
			</div>
			<p className="meta" style={{ marginTop: 24 }}>
				<Link href="/">Back to the library</Link>
			</p>
		</main>
	)
}
