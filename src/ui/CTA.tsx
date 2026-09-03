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
	const label =
		children || link?.label || link?.internal?.title || link?.external
	const isPrimary = stegaClean(style) === 'action'
	const content = isPrimary ? (
		<>
			<span>{label}</span>
			<span
				aria-hidden="true"
				className="bg-canvas/15 grid size-7 place-items-center rounded-full text-lg transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-px"
			>
				↗
			</span>
		</>
	) : (
		label
	)
	const props = {
		className:
			cn(
				stegaClean(style),
				isPrimary && 'group gap-3 justify-between',
				className,
			) || undefined,
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
			>
				{content}
			</Link>
		)

	if (link?.type === 'external' && link.external)
		return (
			<a href={stegaClean(link.external)} {...props}>
				{content}
			</a>
		)

	return <div {...(props as ComponentProps<'div'>)}>{content}</div>
}
