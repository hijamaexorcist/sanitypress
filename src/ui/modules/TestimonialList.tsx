import Pretitle from '@/ui/Pretitle'
import { PortableText, stegaClean } from 'next-sanity'
import { Img } from '@/ui/Img'
import { cn } from '@/lib/utils'

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

	return (
		<section className="section space-y-12">
			{(pretitle || intro) && (
				<header className="grid items-end gap-6 md:grid-cols-[minmax(0,0.75fr)_minmax(14rem,0.45fr)]">
					<div className="richtext max-w-2xl text-balance">
						<Pretitle className="clinic-kicker">{pretitle}</Pretitle>
						<PortableText value={intro} />
					</div>
					{(carousel || mobileCarousel) && (
						<p className="hidden text-right text-sm text-ink/55 md:block">
							Scroll to read more
						</p>
					)}
				</header>
			)}

			<div
				className={cn(
					carousel
						? 'grid auto-cols-[min(36rem,82vw)] grid-flow-col gap-5 overflow-x-auto pb-4 pr-6 [scroll-snap-type:x_mandatory] [&>*]:snap-center'
						: 'grid gap-5 md:grid-cols-2 xl:grid-cols-3',
					mobileCarousel &&
						'grid-cols-none max-md:auto-cols-[min(31rem,84vw)] max-md:grid-flow-col max-md:overflow-x-auto max-md:px-1 max-md:pb-4 max-md:[scroll-snap-type:x_mandatory] max-md:[&>*]:snap-center',
				)}
			>
				{testimonials?.map(
					(testimonial, index) =>
						testimonial && (
							<article
								className={cn(
									'clinic-shell h-full p-1.5 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1',
									!carousel && index === 0 && 'md:col-span-2 xl:col-span-2',
								)}
								key={testimonial._id || index}
							>
								<div
									className={cn(
										'clinic-core flex h-full flex-col p-7 md:p-8',
										!carousel && index === 0 && 'bg-clinic-sage/35 md:p-10',
									)}
								>
									<blockquote className="flex h-full flex-col">
										<span aria-hidden="true" className="font-serif text-6xl leading-none text-clinic-clay/70">
											“
										</span>
										<div
											className={cn(
												'richtext mt-4 text-balance text-lg leading-relaxed text-ink/85',
												!carousel && index === 0 && 'md:text-2xl',
											)}
										>
											<PortableText value={testimonial.content} />
										</div>

										{testimonial.author && (
											<footer className="mt-8 flex items-center gap-3 border-t border-ink/10 pt-5">
												<Img
													className="size-11 shrink-0 rounded-full object-cover ring-1 ring-ink/10"
													image={testimonial.author.image}
													width={88}
													alt={
														[testimonial.author.name, testimonial.author.title]
															.filter(Boolean)
															.join(', ') || 'Client'
													}
												/>
												<div className="min-w-0">
													<p className="font-semibold text-ink">{testimonial.author.name}</p>
													{testimonial.author.title && (
														<p className="mt-0.5 text-sm text-ink/60">{testimonial.author.title}</p>
													)}
												</div>
												{testimonial.source && (
													<a
														className="ml-auto grid size-10 shrink-0 place-items-center rounded-full bg-ink/5 text-sm text-ink/65 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:text-ink"
														href={testimonial.source}
														rel="noreferrer"
														target="_blank"
														title="Read the original review"
													>
														<span aria-hidden="true">↗</span>
														<span className="sr-only">Read the original review</span>
													</a>
												)}
											</footer>
										)}
									</blockquote>
								</div>
							</article>
						),
				)}
			</div>
		</section>
	)
}
