'use client'

import { useEffect, useRef, useState, type ComponentProps } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import css from './InteractiveDetails.module.css'

/**
 * @param safeAreaOnHover - Adds a safe area around the details element to prevent it from closing when the mouse leaves the element
 * @param closeAfterNavigate - Closes the details element after a navigation event
 */
export default function InteractiveDetails({
	safeAreaOnHover,
	closeAfterNavigate,
	delay,
	className,
	children,
	...props
}: {
	safeAreaOnHover?: boolean
	closeAfterNavigate?: boolean
	delay?: number
} & ComponentProps<'details'>) {
	const [open, setOpen] = useState(false)
	const [hoverEnabled, setHoverEnabled] = useState(false)
	const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)
	const pathname = usePathname()

	useEffect(() => {
		setHoverEnabled(window.matchMedia('(hover: hover)').matches)
	}, [])

	useEffect(() => {
		if (closeAfterNavigate) setOpen(false)
	}, [closeAfterNavigate, pathname])

	useEffect(() => {
		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current)
		}
	}, [])

	return (
		<details
			{...props}
			className={cn(safeAreaOnHover && css.safearea, className)}
			open={open}
			onToggle={(event) => setOpen(event.currentTarget.open)}
			onMouseEnter={
				hoverEnabled
					? () => {
							if (delay) {
								timeoutRef.current = setTimeout(() => setOpen(true), delay)
							} else {
								setOpen(true)
							}
						}
					: undefined
			}
			onMouseLeave={
				hoverEnabled
					? () => {
							if (timeoutRef.current) clearTimeout(timeoutRef.current)
							setOpen(false)
						}
					: undefined
			}
		>
			{children}
		</details>
	)
}
