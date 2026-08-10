'use client'

import { ComponentProps, useEffect, useRef } from 'react'
import moduleProps from '@/lib/moduleProps'

/**
 * @description If the code includes a <script> tag, ensure the script is re-run on each render
 */
export default function WithScript({
	code,
	className,
	...props
}: Sanity.CustomHTML['html'] & Sanity.Module & ComponentProps<'section'>) {
	const ref = useRef<HTMLElement>(null)
	const firstRender = useRef(true)

	useEffect(() => {
		if (!code) return

		if (firstRender.current) {
			firstRender.current = false
			return
		}

		const parsed = document.createRange().createContextualFragment(code)
		ref.current?.appendChild(parsed)
	}, [code])

	if (!code) return null

	return <section ref={ref} className={className} {...moduleProps(props)} />
}
