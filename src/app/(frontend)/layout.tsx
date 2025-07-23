// import { GoogleTagManager } from '@next/third-parties/google'
import Root from '@/ui/Root'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import SkipToContent from '@/ui/SkipToContent'
import Announcement from '@/ui/Announcement'
import Header from '@/ui/header'
import Footer from '@/ui/footer'
import VisualEditingControls from '@/ui/VisualEditingControls'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import '@/styles/app.css'
import Script from 'next/script'

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

	return (
		<Root>
			{/* <GoogleTagManager gtmId="" /> */}
			<body className="bg-canvas text-ink antialiased">
				{/* ✅ Load reCAPTCHA V3 globally - only if site key exists */}
				{recaptchaSiteKey && (
					<Script
						src={`https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`}
						strategy="afterInteractive"
					/>
				)}
				<NuqsAdapter>
					<SkipToContent />
					<Announcement />
					<Header />
					<main id="main-content" role="main" tabIndex={-1}>
						{children}
					</main>
					<Footer />
					<VisualEditingControls />
				</NuqsAdapter>
				<Analytics />
				<SpeedInsights />
			</body>
		</Root>
	)
}