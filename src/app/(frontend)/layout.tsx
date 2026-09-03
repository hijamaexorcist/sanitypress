import Root from '@/ui/Root'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import SkipToContent from '@/ui/SkipToContent'
import Announcement from '@/ui/Announcement'
import Header from '@/ui/header'
import Footer from '@/ui/footer'
import WhatsAppFloat from '@/ui/WhatsAppFloat'
import ClinicJsonLd from '@/ui/ClinicJsonLd'
import VisualEditingControls from '@/ui/VisualEditingControls'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import '@/styles/app.css'
import Script from 'next/script'
import LanguageSync from '@/ui/LanguageSync'
import type { Viewport } from 'next'

export const viewport: Viewport = {
	themeColor: '#f5f4ed',
}

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

	return (
		<Root>
			{/* <GoogleTagManager gtmId="" /> */}
			<body className="bg-canvas text-ink antialiased" suppressHydrationWarning>
				<Script
					id="theme-preference"
					strategy="beforeInteractive"
					dangerouslySetInnerHTML={{
						__html: `(function(){try{var t=localStorage.getItem('hijama-theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);var v=d?'dark':'light';document.documentElement.dataset.theme=v;document.documentElement.style.colorScheme=v;var m=document.querySelector('meta[name="theme-color"]');if(m)m.content=d?'#101b17':'#f5f4ed'}catch(e){document.documentElement.dataset.theme='light'}})();`,
					}}
				/>
				<LanguageSync />
				{recaptchaSiteKey && (
					<Script
						src={`https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`}
						strategy="afterInteractive"
					/>
				)}
				<ClinicJsonLd />
				<NuqsAdapter>
					<SkipToContent />
					<Announcement />
					<Header />
					<main id="main-content" role="main" tabIndex={-1}>
						{children}
					</main>
					<Footer />
					<WhatsAppFloat />

					<VisualEditingControls />
				</NuqsAdapter>

				<Analytics />
				<SpeedInsights />
			</body>
		</Root>
	)
}
