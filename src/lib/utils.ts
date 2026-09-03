import { twMerge } from 'tailwind-merge'
import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function count(
	arr: Array<any> | number,
	singular: string = 'item',
	plural?: string,
) {
	const num = typeof arr === 'number' ? arr : arr?.length || 0
	return `${num || 0} ${num === 1 ? singular : plural || singular + 's'}`
}

export function debounce<T extends (...args: any[]) => void>(
	func: T,
	delay: number = 1000, // 1 sec
): (...args: Parameters<T>) => void {
	let timeoutId: NodeJS.Timeout | null = null

	return function (this: any, ...args: Parameters<T>) {
		if (timeoutId) {
			clearTimeout(timeoutId)
		}

		timeoutId = setTimeout(() => {
			func.apply(this, args)
		}, delay)
	}
}

export const { format: formatCurrency } = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
})

export function slug(str: string) {
	return str
		.toLowerCase()
		.replace(/[\s\W]+/g, '-')
		.replace(/^-+/, '')
		.replace(/-+$/, '')
}

export function getBlockText(
	block?: {
		children?: {
			text: string
		}[]
	}[],
	lineBreakChar: string = '↵ ',
) {
	return (
		block?.reduce((a, c, i) => {
			const text = c.children?.flatMap((c) => c.text).join('') || ''
			return a + text + (i !== block.length - 1 ? lineBreakChar : '')
		}, '') || ''
	)
}

/** Build a WhatsApp click-to-chat URL with an optional prefilled message. */
export function waLink(phone: string, message?: string) {
	const sanitized = phone.replace(/\D/g, '')
	if (!sanitized) return undefined

	const base = `https://wa.me/${sanitized}`
	return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

/** Pull a WhatsApp number from a wa.me / WhatsApp URL when present. */
export function parseWhatsAppNumber(url?: string) {
	if (!url) return undefined
	const match = url.match(
		/(?:wa\.me\/|whatsapp\.com\/send\?phone=|api\.whatsapp\.com\/send\?phone=)(\d+)/i,
	)
	return match?.[1]
}
