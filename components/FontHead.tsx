import { fontFaceCss, styleSheetUrls } from "@/lib/fonts"
import type { FontRecord } from "@/lib/types"

/**
 * Emits @font-face rules and foundry stylesheet links during server rendering,
 * so specimens are correct in the very first HTML response.
 */
export default function FontHead({ fonts }: { fonts: FontRecord[] }) {
	const css = fontFaceCss(fonts)
	const sheets = styleSheetUrls(fonts)

	return (
		<>
			{sheets.map((href) => (
				<link key={href} rel="stylesheet" href={href} />
			))}
			{css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null}
		</>
	)
}
