import type { NextConfig } from "next"

const nextConfig: NextConfig = {
	// Font uploads travel through server actions; Vercel allows ~4.5 MB per request.
	experimental: {
		serverActions: {
			bodySizeLimit: "4mb",
		},
	},
}

export default nextConfig
