"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

/**
 * Header navigation. Client-side only so the current section can be filled in
 * solid, the way a foundry site marks its active tab.
 */
export default function NavCells({
	signedIn,
	isAdmin,
}: {
	signedIn: boolean
	isAdmin: boolean
}) {
	const pathname = usePathname() ?? "/"

	const items = [
		{
			href: "/",
			label: "Fonts",
			caption: "Library",
			active: pathname === "/" || pathname.startsWith("/fonts"),
		},
		{
			href: "/pairs",
			label: "Pairs",
			caption: "Suggested",
			active: pathname.startsWith("/pairs"),
		},
		...(signedIn
			? [
					{
						href: "/my",
						label: "My space",
						caption: "Yours",
						active: pathname.startsWith("/my"),
					},
				]
			: []),
		{
			href: "/favorites",
			label: "Favorites",
			caption: "Liked",
			active: pathname.startsWith("/favorites"),
		},
		{
			href: "/manage",
			label: isAdmin ? "Manage" : "Add",
			caption: isAdmin ? "Admin" : "A font",
			active: pathname.startsWith("/manage"),
		},
	]

	return (
		<nav className="navCells" aria-label="Main">
			{items.map((item) => (
				<Link
					key={item.href}
					className="navCell"
					href={item.href}
					prefetch
					aria-current={item.active ? "page" : undefined}
				>
					<span>{item.label}</span>
					<small>{item.caption}</small>
				</Link>
			))}
		</nav>
	)
}
