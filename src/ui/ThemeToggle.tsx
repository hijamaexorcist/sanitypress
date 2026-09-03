'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect } from 'react'

const STORAGE_KEY = 'hijama-theme'

function syncTheme(theme: 'light' | 'dark') {
	document.documentElement.dataset.theme = theme
	document.documentElement.style.colorScheme = theme

	document
		.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
		.forEach((themeColor) => {
			themeColor.content = theme === 'dark' ? '#101b17' : '#f5f4ed'
		})
}

function applyTheme(theme: 'light' | 'dark') {
	syncTheme(theme)
	localStorage.setItem(STORAGE_KEY, theme)
}

export default function ThemeToggle() {
	useEffect(() => {
		const media = window.matchMedia('(prefers-color-scheme: dark)')
		const storedTheme = localStorage.getItem(STORAGE_KEY)
		syncTheme(
			storedTheme === 'dark' || (!storedTheme && media.matches) ? 'dark' : 'light',
		)
		const followSystemTheme = (event: MediaQueryListEvent) => {
			if (!localStorage.getItem(STORAGE_KEY)) {
				syncTheme(event.matches ? 'dark' : 'light')
			}
		}

		media.addEventListener('change', followSystemTheme)
		return () => media.removeEventListener('change', followSystemTheme)
	}, [])

	return (
		<button
			type="button"
			className="theme-toggle ring-ink/10 focus-visible:outline-clinic-clay relative grid size-11 shrink-0 place-items-center rounded-full ring-1 transition-[transform,background-color,box-shadow] duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2"
			aria-label="Switch between light and dark theme"
			title="Switch color theme"
			onClick={() => {
				const current = document.documentElement.dataset.theme
				applyTheme(current === 'dark' ? 'light' : 'dark')
			}}
		>
			<Sun
				className="theme-icon theme-icon-sun size-[1.15rem]"
				aria-hidden="true"
			/>
			<Moon
				className="theme-icon theme-icon-moon size-[1.05rem]"
				aria-hidden="true"
			/>
		</button>
	)
}
