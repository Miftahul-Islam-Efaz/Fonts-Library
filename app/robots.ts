import type { MetadataRoute } from "next"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

/** Every crawler and AI model is welcome, except the manage screen. */
export default function robots(): MetadataRoute.Robots {
	return {
		rules: [{ userAgent: "*", allow: "/", disallow: ["/manage"] }],
		sitemap: `${siteUrl}/sitemap.xml`,
		host: siteUrl,
	}
}
