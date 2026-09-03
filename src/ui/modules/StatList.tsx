import Pretitle from '@/ui/Pretitle'
import { PortableText, stegaClean } from 'next-sanity'

export default function StatList({
	pretitle,
	intro,
	stats,
	textAlign: ta = 'center',
}: Partial<{
	pretitle: string
	intro: any
	stats: Partial<{
		prefix: string
		value: string
		suffix: string
		text: string
	}>[]
	textAlign: React.CSSProperties['textAlign']
}>) {
	const textAlign = stegaClean(ta)

	return (
		<section className="section space-y-8 md:space-y-10" style={{ textAlign }}>
			{(pretitle || intro) && (
				<header className="richtext mx-auto max-w-2xl text-center text-balance">
					<Pretitle className="clinic-kicker">{pretitle}</Pretitle>
					<PortableText value={intro} />
				</header>
			)}

			<dl className="clinic-shell grid overflow-hidden p-1.5 sm:grid-cols-2 lg:grid-cols-4">
				{stats?.map(({ prefix, value, suffix, text }, key) => (
					<div
						className="clinic-core relative min-h-40 space-y-3 px-5 py-7 text-start after:absolute after:inset-y-6 after:right-0 after:hidden after:w-px after:bg-ink/8 sm:odd:after:block lg:not-last:after:block lg:odd:after:block"
						key={key}
					>
						<span className="font-serif text-sm text-clinic-clay/55">
							{String(key + 1).padStart(2, '0')}
						</span>
						<dt className="flex min-h-12 items-baseline gap-1 font-serif text-4xl leading-none tracking-[-0.035em] text-ink">
							{prefix && <span className="text-xl text-ink/45">{prefix}</span>}

							<span>{value}</span>

							{suffix && <span className="text-lg text-ink/45">{suffix}</span>}
						</dt>

						{text && (
							<dd className="max-w-[16rem] text-sm font-semibold text-balance text-ink/58">
								{text}
							</dd>
						)}
					</div>
				))}
			</dl>
		</section>
	)
}
