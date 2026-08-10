import { PortableText } from 'next-sanity'
import Pretitle from '@/ui/Pretitle'
import CTAList from '@/ui/CTAList'
import Asset from './Asset'
import CustomHTML from './CustomHTML'
import Reputation from '@/ui/Reputation'
import { cn } from '@/lib/utils'

export default function HeroSplit({
	pretitle,
	content,
	ctas,
	assets,
	assetOnRight,
	assetBelowContent,
}: Partial<{
	pretitle: string
	content: any
	ctas: Sanity.CTA[]
	assets: Array<Sanity.Img | Sanity.Code | Sanity.CustomHTML>
	assetOnRight: boolean
	assetBelowContent: boolean
}>) {
	const asset = assets?.[0]

	return (
		<section className="section grid min-h-[min(740px,calc(100dvh-var(--header-height)))] items-center gap-12 md:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.8fr)] md:gap-x-20">
			<figure
				className={cn(
					'clinic-shell overflow-hidden',
					asset?._type === 'img' && 'max-md:full-bleed',
					assetOnRight ? 'md:order-1' : 'order-first max-md:order-last',
					assetBelowContent && 'max-md:order-last',
				)}
			>
				<div className="clinic-core overflow-hidden [&_img]:aspect-[4/5] [&_img]:w-full [&_img]:object-cover">
					<Asset asset={asset} />
				</div>
			</figure>

			<div className="richtext headings:text-balance mx-auto w-full max-w-2xl">
				<Pretitle className="clinic-kicker">{pretitle}</Pretitle>
				<PortableText
					value={content}
					components={{
						types: {
							'custom-html': ({ value }) => <CustomHTML {...value} />,
							'reputation-block': ({ value }) => (
								<Reputation className="!mt-4" reputation={value.reputation} />
							),
						},
					}}
				/>
				<CTAList ctas={ctas} className="!mt-6" />
			</div>
		</section>
	)
}
