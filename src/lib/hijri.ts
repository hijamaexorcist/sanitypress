/**
 * Hijri helpers via Intl + Umm al-Qura (matches Saudi published dates).
 * Prefer this over moment-hijri for smaller bundles and native calendar accuracy.
 */

const SUNNAH_DAYS = [13, 14, 15, 17, 19, 21] as const

const HIJRI_MONTHS_EN = [
	'Muharram',
	'Safar',
	'Rabi al-Awwal',
	'Rabi al-Thani',
	'Jumada al-Awwal',
	'Jumada al-Thani',
	'Rajab',
	'Shaban',
	'Ramadan',
	'Shawwal',
	'Dhul Qadah',
	'Dhul Hijjah',
] as const

function hijriParts(date: Date) {
	return new Intl.DateTimeFormat('en-SA-u-ca-islamic-umalqura', {
		day: 'numeric',
		month: 'numeric',
		year: 'numeric',
	}).formatToParts(date)
}

export function getHijriDay(date: Date): number {
	const day = hijriParts(date).find((part) => part.type === 'day')?.value
	return day ? Number(day) : NaN
}

export function getHijriMonthIndex(date: Date): number {
	const month = hijriParts(date).find((part) => part.type === 'month')?.value
	return month ? Number(month) - 1 : NaN
}

export function getHijriYear(date: Date): number {
	const year = hijriParts(date).find((part) => part.type === 'year')?.value
	return year ? Number(year) : NaN
}

export function getHijriDate(date: Date) {
	return {
		day: getHijriDay(date),
		month: HIJRI_MONTHS_EN[getHijriMonthIndex(date)] ?? '',
		year: getHijriYear(date),
	}
}

/** Recommended prophetic Hijama days in the lunar month. */
export function isSunnahDay(date: Date): boolean {
	return (SUNNAH_DAYS as readonly number[]).includes(getHijriDay(date))
}

export function getSunnahDaysForMonth(year: number, month: number) {
	const days: Date[] = []
	const current = new Date(year, month, 1)
	const lastDay = new Date(year, month + 1, 0)

	while (current <= lastDay) {
		if (isSunnahDay(current)) days.push(new Date(current))
		current.setDate(current.getDate() + 1)
	}

	return days
}

export function formatHijriDate(
	date: Date,
	locale: 'en' | 'ar' = 'en',
	options: Intl.DateTimeFormatOptions = {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	},
) {
	return new Intl.DateTimeFormat(
		locale === 'ar'
			? 'ar-SA-u-ca-islamic-umalqura'
			: 'en-SA-u-ca-islamic-umalqura',
		options,
	).format(date)
}
