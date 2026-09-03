import moduleProps from '@/lib/moduleProps'
import Pretitle from '@/ui/Pretitle'
import { PortableText } from 'next-sanity'
import CTAList from '@/ui/CTAList'
import { cn, formatCurrency } from '@/lib/utils'

export default function PricingList({
	pretitle,
	intro,
	tiers,
	...props
}: Partial<{ pretitle: string; intro: any; tiers: Sanity.Pricing[] }> &
	Sanity.Module) {
	const count = tiers?.length ?? 0

	return (
		<section className="section space-y-10 md:space-y-12" {...moduleProps(props)}>
			{(pretitle || intro) && (
				<header className="grid items-end gap-5 md:grid-cols-[minmax(0,0.72fr)_minmax(20rem,0.48fr)] md:gap-12">
					<div className="richtext max-w-2xl text-balance">
						<Pretitle className="clinic-kicker">{pretitle}</Pretitle>
						<PortableText value={intro} />
					</div>
					<p className="max-w-md text-sm leading-relaxed text-ink/55 md:justify-self-end">
						Choose the amount of time that fits your visit. Suitability and the
						planned areas are discussed before the session begins.
					</p>
				</header>
			)}

			<div
				className={cn(
					'no-scrollbar grid items-stretch gap-4 md:gap-5',
					'max-md:full-bleed max-md:auto-cols-[min(20rem,84vw)] max-md:grid-flow-col max-md:overflow-x-auto max-md:px-4 max-md:pb-4',
					count <= 3
						? 'md:grid-cols-[repeat(var(--col,1),minmax(0,1fr))]'
						: 'md:grid-cols-2 xl:grid-cols-4',
				)}
				style={{ '--col': count } as React.CSSProperties}
			>
				{tiers?.map(
					(tier, index) =>
						!!tier && (
							<article
								className={cn(
									'clinic-shell h-full p-1.5',
									index === 1 && 'md:-translate-y-3',
								)}
								key={tier._id}
							>
								<div
									className={cn(
										'clinic-core flex h-full min-h-[31rem] flex-col overflow-hidden p-6 md:p-7',
										index === 1 && 'bg-clinic-sage/35',
									)}
								>
									<div className="flex items-center justify-between gap-4 border-b border-ink/8 pb-5">
										<span className="font-serif text-4xl leading-none text-clinic-clay/45">
											{String(index + 1).padStart(2, '0')}
										</span>
										{tier.highlight && (
											<span className="rounded-full bg-ink/5 px-3 py-1 text-xs font-semibold text-ink/60">
												{tier.highlight}
											</span>
										)}
									</div>

									<h3 className="mt-7 font-serif text-3xl leading-[1.02] tracking-[-0.035em]">
										{tier.title}
									</h3>

									{tier.price?.base !== undefined && (
										<div className="mt-5 flex flex-wrap items-end gap-x-2 border-b border-ink/8 pb-6">
											{!isNaN(tier.price.base) && (
												<b className="font-serif text-5xl leading-none font-normal tracking-[-0.05em]">
													{formatPrice(tier.price.base)}
												</b>
											)}
											{tier.price.suffix && (
												<span className="pb-1 text-sm text-ink/50">
													{tier.price.suffix}
												</span>
											)}
											{tier.price.strikethrough && (
												<s className="pb-1 text-sm font-semibold text-ink/40 decoration-clinic-clay">
													{formatPrice(tier.price.strikethrough)}
												</s>
											)}
										</div>
									)}

									<div className="richtext mt-6 text-sm leading-relaxed text-ink/70 marker:text-clinic-clay [&_ul]:space-y-3">
										<PortableText value={tier.content} />
									</div>
									<CTAList className="mt-auto grid pt-7" ctas={tier.ctas} />
								</div>
							</article>
						),
				)}
			</div>
		</section>
	)
}

function formatPrice(value: number) {
	if (value === 0) return 'Free'
	return formatCurrency(value).replace(/\.00$/, '')
}
