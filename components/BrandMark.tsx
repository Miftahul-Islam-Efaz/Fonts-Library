/**
 * The library mark, redrawn as inline SVG so it inherits the current tint
 * (`currentColor`) instead of being a fixed-colour bitmap. The PNG is still
 * used for the favicon and social previews.
 */
export default function BrandMark({ size = 44 }: { size?: number }) {
	return (
		<svg
			className="brandMark"
			width={size}
			height={size}
			viewBox="0 0 120 120"
			aria-hidden="true"
			focusable="false"
		>
			<g fill="currentColor">
				{/* Stem with the flagged top bar. */}
				<path d="M50.2 57.4c0-13.6 9.1-22.4 23.3-22.4H115c-7.2 5.6-8.9 10.6-6.6 17H74c-4.9 0-7.2 2.6-7.2 7.9v47.6c0 5.4 2 8.3 6.6 10.5H42.4c5.1-2.4 7.8-5.3 7.8-10.7V57.4z" />
				{/* Middle arm with a leaf terminal. */}
				<path d="M66.8 62.1h33.9c-3.4 7.4-9.9 12.1-19.4 14L66.8 79V62.1z" />
				{/* Fanned pages sweeping out of the stem. */}
				<path d="M66.8 82.6c6.6 7.4 14.3 13.9 23.1 19.4-9.4.6-17.1 4.3-23.1 11V82.6z" />
				<path d="M66.8 88.9c5.1 6.4 11 12 17.7 16.8-7.5.9-13.4 4.2-17.7 9.9V88.9z" />
				{/* Sparkle. */}
				<path d="M101.4 63.6c1.3 6.6 3.1 8.4 9.6 9.7-6.5 1.3-8.3 3.1-9.6 9.7-1.3-6.6-3.1-8.4-9.6-9.7 6.5-1.3 8.3-3.1 9.6-9.7z" />
			</g>
		</svg>
	)
}
