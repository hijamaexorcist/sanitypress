'use client'

import useLang from '@/lib/getLang'
import { useEffect } from 'react'

export default function LanguageSync() {
	const lang = useLang()

	useEffect(() => {
		document.documentElement.lang = lang
	}, [lang])

	return null
}
