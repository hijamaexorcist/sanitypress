'use client'

import { useCallback, useEffect, useState } from 'react'

export default function Scheduler({
	start,
	end,
	children,
}: Partial<{
	start: string
	end: string
	children: React.ReactNode
}>) {
	const hasSchedule = !!start || !!end

	const checkActive = useCallback(() => {
		const now = new Date()
		return (!start || new Date(start) < now) && (!end || new Date(end) > now)
	}, [end, start])

	const [isActive, setIsActive] = useState(checkActive())

	useEffect(() => {
		if (!hasSchedule) return
		const interval = setInterval(() => setIsActive(checkActive()), 1000) // check every second
		return () => clearInterval(interval)
	}, [checkActive, hasSchedule])

	if (!hasSchedule) return children

	if (!isActive) return null

	return children
}
