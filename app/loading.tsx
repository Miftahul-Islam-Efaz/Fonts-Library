/**
 * Shown the instant a navigation starts, so moving between sections feels
 * immediate even while the server renders the real page.
 */
export default function Loading() {
	return (
		<main aria-busy="true" aria-live="polite">
			<div className="skeletonBar" />
			{[0, 1, 2].map((index) => (
				<div className="skeletonRow" key={index}>
					<div className="skeletonLine short" />
					<div className="skeletonLine tall" />
				</div>
			))}
		</main>
	)
}
