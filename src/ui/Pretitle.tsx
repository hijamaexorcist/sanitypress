import { cn } from '@/lib/utils'
import { stegaClean } from 'next-sanity'
import type { ReactNode } from 'react'

function cleanText(value: ReactNode) {
	return typeof value === 'string' ? stegaClean(value) : value
}

export default function Pretitle({
	className,
	children,
}: React.ComponentProps<'p'>) {
	if (!children) return null

	return (
		<p className={cn('technical text-ink/65', className)}>
			{cleanText(children)}
		</p>
	)
}
