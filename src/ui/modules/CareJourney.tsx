import moduleProps from '@/lib/moduleProps'
import CTA from '@/ui/CTA'

type CareJourneyItem = {
	title?: string
	description?: string
}

export default function CareJourney({
	pretitle,
	title,
	description,
	items,
	cta,
	...props
}: {
	pretitle?: string
	title?: string
	description?: string
	items?: CareJourneyItem[]
	cta?: Sanity.CTA
} &
	Sanity.Module) {
	return (
		<section className="section" {...moduleProps(props)} id="your-visit">
			<div className="grid items-end gap-8 md:grid-cols-[minmax(0,0.8fr)_minmax(16rem,0.45fr)]">
				<header className="max-w-2xl">
					{pretitle && <p className="clinic-kicker">{pretitle}</p>}
					{title && <h2 className="h2 mt-4 text-balance">{title}</h2>}
					{description && (
						<p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/70">
							{description}
						</p>
					)}
				</header>
				{cta && <CTA {...cta} className="action justify-between md:justify-self-end" />}
			</div>

			<ol className="mt-12 grid gap-5 md:grid-cols-3">
				{items?.map((item, index) => (
					<li className="clinic-shell p-1.5" key={`${item.title}-${index}`}>
						<div className="clinic-core h-full p-6 md:p-7">
							<span className="grid size-10 place-items-center rounded-full bg-clinic-sage text-sm font-semibold">
								{String(index + 1).padStart(2, '0')}
							</span>
							{item.title && <h3 className="h4 mt-7">{item.title}</h3>}
							{item.description && (
								<p className="mt-3 text-sm leading-relaxed text-ink/70">
									{item.description}
								</p>
							)}
						</div>
					</li>
				))}
			</ol>
		</section>
	)
}
