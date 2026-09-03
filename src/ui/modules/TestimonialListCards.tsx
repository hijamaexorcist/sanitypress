'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { PortableText } from 'next-sanity'
import { Img } from '@/ui/Img'
import { cn } from '@/lib/utils'
import { motionEase, RevealItem, Stagger } from '@/ui/motion/Reveal'

const ease = motionEase

function initialsFromName(name?: string) {
	if (!name) return '?'
	const parts = name.trim().split(/\s+/).slice(0, 2)
	return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?'
}

function AuthorAvatar({
	author,
}: {
	author: NonNullable<Sanity.Testimonial['author']>
}) {
	const alt =
		[author.name, author.title].filter(Boolean).join(', ') || 'Client'

	if (author.image?.asset) {
		return (
			<Img
				className="size-12 shrink-0 rounded-full object-cover ring-1 ring-ink/10"
				image={author.image}
				width={96}
				alt={alt}
			/>
		)
	}

	return (
		<span
			aria-hidden="true"
			className="grid size-12 shrink-0 place-items-center rounded-full bg-clinic-sage/80 font-serif text-lg text-ink/70 ring-1 ring-ink/10"
		>
			{initialsFromName(author.name)}
		</span>
	)
}

function TestimonialCard({
	testimonial,
	featured,
	reducedMotion,
}: {
	testimonial: Sanity.Testimonial
	featured?: boolean
	reducedMotion: boolean | null
}) {
	return (
		<RevealItem className={cn('h-full', featured && 'md:col-span-2 xl:col-span-2')}>
			<motion.article
				className="clinic-shell h-full p-1.5"
				whileHover={
					reducedMotion
						? undefined
						: {
								y: -5,
								transition: { duration: 0.35, ease },
							}
				}
			>
				<div
					className={cn(
						'clinic-core flex h-full flex-col p-6 md:p-8',
						featured && 'bg-clinic-sage/30 md:p-9',
					)}
				>
					<blockquote className="flex h-full flex-col">
						<span
							aria-hidden="true"
							className="font-serif text-3xl leading-none text-clinic-clay/55 select-none"
						>
							“
						</span>
						<div
							className={cn(
								'richtext mt-3 text-pretty text-base leading-[1.7] text-ink/85 md:text-lg',
								featured && 'md:text-xl md:leading-[1.65]',
							)}
						>
							<PortableText value={testimonial.content} />
						</div>

						{testimonial.author && (
							<footer className="mt-auto flex items-center gap-3.5 border-t border-ink/8 pt-5">
								<AuthorAvatar author={testimonial.author} />
								<div className="min-w-0 flex-1">
									<p className="truncate font-serif text-lg leading-tight text-ink">
										{testimonial.author.name}
									</p>
									{testimonial.author.title && (
										<p className="mt-1 truncate text-sm text-clinic-stone">
											{testimonial.author.title}
										</p>
									)}
								</div>
								{testimonial.source && (
									<a
										className="grid size-11 shrink-0 place-items-center rounded-full bg-ink/5 text-ink/60 transition-[background-color,color,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-clinic-sage/70 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinic-clay motion-safe:hover:-translate-y-0.5"
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
			</motion.article>
		</RevealItem>
	)
}

export default function TestimonialCards({
	testimonials,
	carousel,
	mobileCarousel,
}: {
	testimonials: Sanity.Testimonial[]
	carousel: boolean
	mobileCarousel: boolean
}) {
	const reducedMotion = useReducedMotion()
	const trackRef = useRef<HTMLDivElement>(null)
	const [canPrev, setCanPrev] = useState(false)
	const [canNext, setCanNext] = useState(false)
	const isCarouselLayout = carousel || mobileCarousel

	const updateScrollState = useCallback(() => {
		const el = trackRef.current
		if (!el) return
		const max = el.scrollWidth - el.clientWidth
		setCanPrev(el.scrollLeft > 4)
		setCanNext(el.scrollLeft < max - 4)
	}, [])

	const scrollByDir = useCallback(
		(dir: -1 | 1) => {
			const el = trackRef.current
			if (!el) return
			const amount = Math.min(el.clientWidth * 0.82, 420)
			el.scrollBy({
				left: dir * amount,
				behavior: reducedMotion ? 'auto' : 'smooth',
			})
		},
		[reducedMotion],
	)

	useEffect(() => {
		const el = trackRef.current
		if (!el || !isCarouselLayout) return

		updateScrollState()
		el.addEventListener('scroll', updateScrollState, { passive: true })
		const ro = new ResizeObserver(updateScrollState)
		ro.observe(el)

		el.setAttribute('role', 'region')
		el.setAttribute('aria-roledescription', 'carousel')
		el.setAttribute('aria-label', 'Patient testimonials')
		el.tabIndex = 0

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'ArrowRight') {
				e.preventDefault()
				scrollByDir(1)
			} else if (e.key === 'ArrowLeft') {
				e.preventDefault()
				scrollByDir(-1)
			}
		}
		el.addEventListener('keydown', onKeyDown)

		return () => {
			el.removeEventListener('scroll', updateScrollState)
			el.removeEventListener('keydown', onKeyDown)
			ro.disconnect()
		}
	}, [isCarouselLayout, updateScrollState, scrollByDir, testimonials.length])

	const showDesktopControls = carousel && testimonials.length > 1

	const trackClassName = cn(
		carousel
			? 'grid auto-cols-[min(22rem,78vw)] grid-flow-col gap-4 overflow-x-auto pb-3 pr-4 [-ms-overflow-style:none] [scrollbar-width:none] [scroll-snap-type:x_mandatory] [&::-webkit-scrollbar]:hidden md:auto-cols-[min(28rem,72vw)] md:gap-5 md:pr-6 [&_>_*]:snap-center'
			: 'grid gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-3',
		mobileCarousel &&
			'grid-cols-none max-md:auto-cols-[min(19.5rem,82vw)] max-md:grid-flow-col max-md:gap-4 max-md:overflow-x-auto max-md:px-0.5 max-md:pb-3 max-md:[-ms-overflow-style:none] max-md:[scrollbar-width:none] max-md:[scroll-snap-type:x_mandatory] max-md:[&::-webkit-scrollbar]:hidden max-md:[&_>_*]:snap-center',
	)

	return (
		<div className="relative">
			{showDesktopControls && (
				<div className="mb-4 flex items-center justify-end gap-2 max-md:hidden">
					<button
						type="button"
						aria-label="Previous testimonials"
						disabled={!canPrev}
						onClick={() => scrollByDir(-1)}
						className="grid size-10 place-items-center rounded-full bg-canvas text-ink/70 ring-1 ring-ink/10 transition-[opacity,background-color,color] duration-300 disabled:pointer-events-none disabled:opacity-35 hover:bg-clinic-sage/50 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinic-clay"
					>
						<span aria-hidden="true">←</span>
					</button>
					<button
						type="button"
						aria-label="Next testimonials"
						disabled={!canNext}
						onClick={() => scrollByDir(1)}
						className="grid size-10 place-items-center rounded-full bg-canvas text-ink/70 ring-1 ring-ink/10 transition-[opacity,background-color,color] duration-300 disabled:pointer-events-none disabled:opacity-35 hover:bg-clinic-sage/50 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinic-clay"
					>
						<span aria-hidden="true">→</span>
					</button>
				</div>
			)}

			<div className="relative">
				{isCarouselLayout && canPrev && (
					<div
						aria-hidden="true"
						className={cn(
							'pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-linear-to-r from-canvas to-transparent md:w-14',
							!carousel && 'max-md:block md:hidden',
							carousel && 'block',
						)}
					/>
				)}
				{isCarouselLayout && canNext && (
					<div
						aria-hidden="true"
						className={cn(
							'pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-linear-to-l from-canvas to-transparent md:w-14',
							!carousel && 'max-md:block md:hidden',
							carousel && 'block',
						)}
					/>
				)}

				<Stagger
					ref={trackRef}
					stagger={0.09}
					delay={0.06}
					className={cn(
						trackClassName,
						isCarouselLayout && 'outline-none',
					)}
				>
					{testimonials.map((testimonial, index) => (
						<TestimonialCard
							key={testimonial._id || index}
							testimonial={testimonial}
							featured={!carousel && index === 0}
							reducedMotion={reducedMotion}
						/>
					))}
				</Stagger>
			</div>
		</div>
	)
}
