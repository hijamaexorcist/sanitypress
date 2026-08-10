import CTA from './CTA'
import { cn } from '@/lib/utils'

export default function CTAList({
	ctas,
	className,
	ctaClassName,
}: {
	ctas?: Sanity.CTA[]
	ctaClassName?: string
} & React.ComponentProps<'div'>) {
	if (!ctas?.length) return null

	return (
		<div className={cn('flex flex-wrap items-center gap-[.5em]', className)}>
			{ctas?.map((cta, key) => (
				<CTA className={cn('max-sm:w-full', ctaClassName)} {...cta} key={key} />
			))}
		</div>
	)
}
