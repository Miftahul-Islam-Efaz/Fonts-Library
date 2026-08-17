import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site"

/**
 * Every crawler and AI model is welcome on public pages. Personal and
 * authenticated screens are kept out of the index.
 */
export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: ["/manage", "/my", "/favorites", "/login", "/auth/"],
			},
		],
		sitemap: `${SITE_URL}/sitemap.xml`,
		host: SITE_URL,
	}
}
