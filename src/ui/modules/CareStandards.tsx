import moduleProps from '@/lib/moduleProps'

type CareStandard = {
	title?: string
	description?: string
}

export default function CareStandards({
	pretitle,
	title,
	description,
	standards,
	...props
}: {
	pretitle?: string
	title?: string
	description?: string
	standards?: CareStandard[]
} &
	Sanity.Module) {
	return (
		<section className="section">
			<div className="clinic-shell bg-clinic-sage/35 p-1.5" {...moduleProps(props)}>
				<div className="clinic-core grid gap-10 p-7 md:grid-cols-[minmax(0,0.72fr)_minmax(18rem,0.7fr)] md:p-12">
					<header className="max-w-xl">
						{pretitle && <p className="clinic-kicker">{pretitle}</p>}
						{title && <h2 className="h2 mt-4 text-balance">{title}</h2>}
						{description && (
							<p className="mt-5 text-lg leading-relaxed text-ink/70">{description}</p>
						)}
					</header>

					<ul className="space-y-5">
						{standards?.map((standard, index) => (
							<li className="border-b border-ink/10 pb-5" key={`${standard.title}-${index}`}>
								{standard.title && <h3 className="text-base font-semibold">{standard.title}</h3>}
								{standard.description && (
									<p className="mt-2 text-sm leading-relaxed text-ink/70">
										{standard.description}
									</p>
								)}
							</li>
						))}
					</ul>
				</div>
			</div>
		</section>
	)
}
