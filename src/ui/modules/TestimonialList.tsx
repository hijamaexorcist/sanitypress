import Pretitle from '@/ui/Pretitle'
import { PortableText, stegaClean } from 'next-sanity'
import { Reveal } from '@/ui/motion/Reveal'
import TestimonialCards from './TestimonialListCards'

export default function TestimonialList({
	pretitle,
	intro,
	testimonials,
	layout: requestedLayout,
	layoutMobile: requestedMobileLayout,
}: Partial<{
	pretitle: string
	intro: any
	testimonials: Sanity.Testimonial[]
	layout: 'grid' | 'carousel'
	layoutMobile: 'grid' | 'carousel'
}>) {
	const layout = stegaClean(requestedLayout)
	const mobileLayout = stegaClean(requestedMobileLayout)
	const carousel = layout === 'carousel'
	const mobileCarousel = mobileLayout === 'carousel'
	const items = (testimonials ?? []).filter(Boolean) as Sanity.Testimonial[]
	const showScrollHint = carousel || mobileCarousel

	return (
		<section className="section space-y-10 md:space-y-12">
			{(pretitle || intro) && (
				<Reveal>
					<header className="grid items-end gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:gap-8">
						<div className="richtext max-w-2xl text-balance">
							<Pretitle className="clinic-kicker">{pretitle}</Pretitle>
							<PortableText value={intro} />
						</div>
						{showScrollHint && items.length > 1 && (
							<p className="text-sm text-ink/50 md:text-right">
								<span className="md:hidden">Swipe for more</span>
								<span className="hidden md:inline">Scroll to read more</span>
							</p>
						)}
					</header>
				</Reveal>
			)}

			{items.length === 0 ? (
				<Reveal>
					<div className="clinic-shell p-1.5">
						<div className="clinic-core px-7 py-10 text-center md:px-10">
							<p className="font-serif text-2xl text-ink/80">
								Stories from patients will appear here.
							</p>
							<p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink/55">
								We’re gathering thoughtful notes from people we’ve cared for.
							</p>
						</div>
					</div>
				</Reveal>
			) : (
				<TestimonialCards
					testimonials={items}
					carousel={carousel}
					mobileCarousel={mobileCarousel}
				/>
			)}
		</section>
	)
}
