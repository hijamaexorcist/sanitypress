import Link from 'next/link'
import resolveUrl from '@/lib/resolveUrl'
import { stegaClean } from 'next-sanity'
import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'

export default function CTA({
	_type,
	_key,
	link,
	style,
	className,
	children,
	...rest
}: Sanity.CTA & ComponentProps<'a'>) {
	const label = children || link?.label || link?.internal?.title || link?.external
	const isPrimary = stegaClean(style) === 'action'
	const props = {
		className:
			cn(
				stegaClean(style),
				isPrimary && 'group gap-3 justify-between',
				className,
			) || undefined,
		children: isPrimary ? (
			<>
				<span>{label}</span>
				<span
					aria-hidden="true"
					className="grid size-7 place-items-center rounded-full bg-canvas/15 text-lg transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-px"
				>
					↗
				</span>
			</>
		) : (
			label
		),
		...rest,
	}

	if (link?.type === 'internal' && link.internal)
		return (
			<Link
				href={resolveUrl(link.internal, {
					base: false,
					params: link.params,
				})}
				{...props}
			/>
		)

	if (link?.type === 'external' && link.external)
		return <a href={stegaClean(link.external)} {...props} />

	return <div {...(props as ComponentProps<'div'>)} />
}
