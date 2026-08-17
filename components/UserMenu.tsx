"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { signOutAction } from "@/app/actions"

/**
 * Header profile control: an avatar pill that opens a small account card with
 * the signed-in address, shortcuts and the sign-out action.
 */
export default function UserMenu({
	name,
	email,
	avatar,
	isAdmin,
}: {
	name: string | null
	email: string
	avatar: string | null
	isAdmin: boolean
}) {
	const [open, setOpen] = useState(false)
	const wrapRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!open) return

		function onPointerDown(event: MouseEvent) {
			if (!wrapRef.current?.contains(event.target as Node)) setOpen(false)
		}
		function onKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") setOpen(false)
		}

		document.addEventListener("mousedown", onPointerDown)
		document.addEventListener("keydown", onKeyDown)
		return () => {
			document.removeEventListener("mousedown", onPointerDown)
			document.removeEventListener("keydown", onKeyDown)
		}
	}, [open])

	const display = name ?? email.split("@")[0]
	const initial = display.trim().charAt(0).toUpperCase() || "?"

	return (
		<div className="userMenu" ref={wrapRef}>
			<button
				type="button"
				className="userTrigger"
				aria-haspopup="menu"
				aria-expanded={open}
				onClick={() => setOpen((value) => !value)}
			>
				<span className="userAvatar">
					{avatar ? (
						/* eslint-disable-next-line @next/next/no-img-element */
						<img src={avatar} alt="" width={30} height={30} />
					) : (
						<span className="userInitial">{initial}</span>
					)}
				</span>
				<span className="userTriggerText">
					<span className="userName">{display}</span>
					<span className="userRole">{isAdmin ? "Admin" : "Member"}</span>
				</span>
				<svg
					className={open ? "userCaret open" : "userCaret"}
					viewBox="0 0 12 8"
					aria-hidden="true"
				>
					<path
						d="M1 1.5 6 6.5l5-5"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.6"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</button>

			{open ? (
				<div className="userPanel" role="menu">
					<div className="userPanelHead">
						<span className="userAvatar large">
							{avatar ? (
								/* eslint-disable-next-line @next/next/no-img-element */
								<img src={avatar} alt="" width={44} height={44} />
							) : (
								<span className="userInitial">{initial}</span>
							)}
						</span>
						<span className="userPanelWho">
							<strong>{display}</strong>
							<span className="userPanelEmail">{email}</span>
						</span>
					</div>

					<div className="userPanelLinks">
						<Link
							className="userPanelLink"
							href="/my"
							role="menuitem"
							onClick={() => setOpen(false)}
						>
							My space
						</Link>
						<Link
							className="userPanelLink"
							href="/favorites"
							role="menuitem"
							onClick={() => setOpen(false)}
						>
							Favorites
						</Link>
						<Link
							className="userPanelLink"
							href="/manage"
							role="menuitem"
							onClick={() => setOpen(false)}
						>
							{isAdmin ? "Manage library" : "Add a font"}
						</Link>
					</div>

					<form action={signOutAction} className="signOutForm">
						<button type="submit" className="signOutButton">
							<svg viewBox="0 0 20 20" aria-hidden="true">
								<path
									d="M12 3.5H7.5A2 2 0 0 0 5.5 5.5v9a2 2 0 0 0 2 2H12M10.5 10h6.5m0 0-2.4-2.4M17 10l-2.4 2.4"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
							Sign out
						</button>
					</form>
				</div>
			) : null}
		</div>
	)
}
