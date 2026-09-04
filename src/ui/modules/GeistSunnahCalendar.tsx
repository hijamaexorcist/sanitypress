'use client'

import { useEffect, useRef, useState } from 'react'
import {
	CalendarDays,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
} from 'lucide-react'
import { getHijriDate, isSunnahDay } from '@/lib/hijri'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function asLocalDate(value: string) {
	return new Date(`${value}T12:00:00`)
}

function toDateInputValue(date: Date) {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

export default function GeistSunnahCalendar({
	minDate,
	maxDate,
	selectedValue,
	onSelect,
}: {
	minDate: string
	maxDate: string
	selectedValue: string
	onSelect: (date: string) => void
}) {
	const firstAvailable = asLocalDate(minDate)
	firstAvailable.setHours(0, 0, 0, 0)
	const lastAvailable = asLocalDate(maxDate)
	lastAvailable.setHours(23, 59, 59, 999)
	const firstMonth = new Date(
		firstAvailable.getFullYear(),
		firstAvailable.getMonth(),
		1,
	)
	const lastMonth = new Date(
		lastAvailable.getFullYear(),
		lastAvailable.getMonth(),
		1,
	)
	const [visibleMonth, setVisibleMonth] = useState(firstMonth)
	const [isOpen, setIsOpen] = useState(false)
	const calendarRef = useRef<HTMLDivElement>(null)
	const year = visibleMonth.getFullYear()
	const month = visibleMonth.getMonth()
	const leadingDays = (new Date(year, month, 1).getDay() + 6) % 7
	const daysInMonth = new Date(year, month + 1, 0).getDate()
	const trailingDays = (7 - ((leadingDays + daysInMonth) % 7)) % 7
	const calendarDays = Array.from(
		{ length: leadingDays + daysInMonth + trailingDays },
		(_, index) => new Date(year, month, index - leadingDays + 1),
	)
	const monthStartHijri = getHijriDate(new Date(year, month, 1))
	const monthEndHijri = getHijriDate(new Date(year, month + 1, 0))
	const hijriRange =
		monthStartHijri.month === monthEndHijri.month
			? `${monthStartHijri.month} ${monthEndHijri.year} AH`
			: `${monthStartHijri.month} – ${monthEndHijri.month} ${monthEndHijri.year} AH`
	const selectedDate = selectedValue ? asLocalDate(selectedValue) : null
	const selectedHijri = selectedDate ? getHijriDate(selectedDate) : null
	const canGoBack = visibleMonth > firstMonth
	const canGoForward = visibleMonth < lastMonth

	useEffect(() => {
		function closeOnOutsideClick(event: MouseEvent) {
			if (
				calendarRef.current &&
				!calendarRef.current.contains(event.target as Node)
			) {
				setIsOpen(false)
			}
		}

		function closeOnEscape(event: KeyboardEvent) {
			if (event.key === 'Escape') setIsOpen(false)
		}

		document.addEventListener('mousedown', closeOnOutsideClick)
		document.addEventListener('keydown', closeOnEscape)

		return () => {
			document.removeEventListener('mousedown', closeOnOutsideClick)
			document.removeEventListener('keydown', closeOnEscape)
		}
	}, [])

	function changeMonth(offset: number) {
		setVisibleMonth(new Date(year, month + offset, 1))
	}

	return (
		<div className="clinic-shell relative overflow-visible" ref={calendarRef}>
			<div className="clinic-core relative p-4">
				<div
					aria-hidden="true"
					className="bg-clinic-sage/50 pointer-events-none absolute -top-16 -right-10 size-36 rounded-full blur-3xl"
				/>

				<div className="relative">
					<div className="flex items-center justify-between gap-4">
						<div>
							<p className="clinic-kicker">Plan around the lunar month</p>
							<h2 className="mt-1.5 font-serif text-2xl leading-none tracking-[-0.035em]">
								Sunnah days
							</h2>
						</div>
						<span
							aria-hidden="true"
							className="emoji-glyph bg-clinic-sage/70 ring-accent/10 grid size-8 shrink-0 place-items-center rounded-full text-sm shadow-[0_8px_20px_rgb(24_53_43_/_0.12)] ring-1"
						>
							💚
						</span>
					</div>

					<p className="text-ink/60 mt-3 text-xs leading-relaxed">
						💚 marks lunar days 13, 14, 15, 17, 19 and 21.
					</p>

					<button
						aria-expanded={isOpen}
						aria-haspopup="dialog"
						className="border-ink/10 bg-canvas/75 hover:border-ink/20 focus-visible:outline-clinic-clay mt-3 flex min-h-14 w-full items-center gap-3 rounded-xl border px-3 text-left shadow-[inset_0_1px_0_var(--clinic-highlight)] transition-[border-color,box-shadow,transform] hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2"
						onClick={() => setIsOpen((open) => !open)}
						type="button"
					>
						<CalendarDays
							aria-hidden="true"
							className="text-accent size-4 shrink-0"
						/>
						<span className="min-w-0 flex-1">
							<span className="block truncate text-sm font-semibold">
								{selectedDate
									? selectedDate.toLocaleDateString('en-US', {
											weekday: 'short',
											month: 'short',
											day: 'numeric',
										})
									: 'Choose preferred date'}
							</span>
							<span className="text-ink/45 mt-0.5 block truncate text-[0.65rem] font-medium">
								{selectedHijri
									? `${selectedHijri.day} ${selectedHijri.month} ${selectedHijri.year} AH`
									: 'Gregorian and Hijri dates together'}
							</span>
						</span>
						<ChevronDown
							aria-hidden="true"
							className={`text-ink/45 size-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
						/>
					</button>

					{isOpen && (
						<div
							aria-label="Choose appointment date"
							className="border-ink/10 bg-canvas absolute top-full right-0 left-0 z-40 mt-2 rounded-2xl border p-3 shadow-[0_24px_65px_var(--clinic-shadow)]"
							role="dialog"
						>
							<div className="mb-3 flex items-center justify-between gap-2">
								<div>
									<p className="text-sm font-semibold">
										{visibleMonth.toLocaleDateString('en-US', {
											month: 'long',
											year: 'numeric',
										})}
									</p>
									<p className="text-ink/40 mt-0.5 text-[0.58rem] font-semibold tracking-wide uppercase">
										{hijriRange}
									</p>
								</div>
								<div className="flex gap-0.5">
									<button
										aria-label="Show previous month"
										className="text-ink/55 hover:bg-clinic-sage/55 grid size-8 place-items-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-25"
										disabled={!canGoBack}
										onClick={() => changeMonth(-1)}
										type="button"
									>
										<ChevronLeft aria-hidden="true" className="size-4" />
									</button>
									<button
										aria-label="Show next month"
										className="text-ink/55 hover:bg-clinic-sage/55 grid size-8 place-items-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-25"
										disabled={!canGoForward}
										onClick={() => changeMonth(1)}
										type="button"
									>
										<ChevronRight aria-hidden="true" className="size-4" />
									</button>
								</div>
							</div>

							<div className="text-ink/40 mb-1.5 grid grid-cols-7 text-center text-[0.58rem] font-bold tracking-wider uppercase">
								{WEEKDAYS.map((weekday) => (
									<span className="py-1" key={weekday}>
										{weekday.slice(0, 1)}
									</span>
								))}
							</div>

							<div
								aria-label={`${visibleMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} appointment calendar`}
								className="grid grid-cols-7 gap-y-1"
								role="group"
							>
								{calendarDays.map((date) => {
									const value = toDateInputValue(date)
									const available =
										date >= firstAvailable && date <= lastAvailable
									const sunnahDay = isSunnahDay(date)
									const selected = selectedValue === value
									const currentMonth = date.getMonth() === month
									const hijri = getHijriDate(date)

									return (
										<button
											aria-label={`${date.toLocaleDateString('en-US', {
												weekday: 'long',
												month: 'long',
												day: 'numeric',
											})}, ${hijri.day} ${hijri.month}${sunnahDay ? ', Sunnah day' : ''}`}
											aria-pressed={selected}
											className={`relative mx-auto grid size-8 place-items-center rounded-lg border border-transparent text-xs font-medium transition ${
												selected
													? 'bg-accent text-canvas shadow-[0_6px_14px_rgb(24_53_43_/_0.2)]'
													: sunnahDay && available
														? 'bg-clinic-sage/70 text-ink hover:border-accent/30'
														: 'text-ink/70 hover:border-ink/20'
											} ${currentMonth ? '' : 'opacity-35'} disabled:cursor-not-allowed disabled:opacity-15`}
											disabled={!available}
											key={value}
											onClick={() => {
												onSelect(value)
												setIsOpen(false)
											}}
											type="button"
										>
											{sunnahDay && available && (
												<span
													aria-hidden="true"
													className="emoji-glyph absolute -top-0.5 -right-0.5 text-[0.46rem] leading-none"
												>
													💚
												</span>
											)}
											<span>{date.getDate()}</span>
										</button>
									)
								})}
							</div>

							<div className="border-ink/8 text-ink/50 mt-2 flex items-center gap-2 border-t pt-2 text-[0.65rem]">
								<span aria-hidden="true" className="emoji-glyph text-xs">
									💚
								</span>
								Commonly observed Sunnah date
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
