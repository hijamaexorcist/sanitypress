'use client'

import { useState } from 'react'
import moduleProps from '@/lib/moduleProps'
import { getRecaptchaToken } from '@/lib/recaptcha'
import { getHijriDate, isSunnahDay } from '@/lib/hijri'

interface AppointmentFormModuleProps {
	title?: string
	description?: string
	endpoint?: string
	showRecaptcha?: boolean
	serviceTypes?: Array<{ name: string; duration: number; price?: string }>
	timeSlots?: string[]
	locationInfo?: { address?: string; mapUrl?: string }
	paymentInfo?: {
		depositRequired?: boolean
		depositAmount?: string
		paymentMethods?: Array<{
			method: string
			recipient: string
			details: string
		}>
	}
	prepInstructions?: {
		title?: string
		bringItems?: string[]
		wearItems?: string[]
		beforeSession?: string[]
		specialNotes?: string[]
	}
	messages?: { success?: string; error?: string }
	_key?: string
}

type BookingStatus = 'idle' | 'submitting' | 'success' | 'error'

function asLocalDate(value: string) {
	return new Date(`${value}T12:00:00`)
}

export default function AppointmentFormModule({
	title = 'Book your Hijama appointment',
	description = 'Choose a session that suits you. We will confirm your appointment and next steps personally.',
	endpoint,
	showRecaptcha,
	serviceTypes = [],
	timeSlots = [],
	locationInfo,
	paymentInfo,
	prepInstructions,
	messages = {},
	_key,
	...props
}: AppointmentFormModuleProps) {
	const today = new Date()
	today.setHours(0, 0, 0, 0)
	const tomorrow = new Date(today)
	tomorrow.setDate(tomorrow.getDate() + 1)
	const lastAvailableDate = new Date(today)
	lastAvailableDate.setDate(lastAvailableDate.getDate() + 30)
	const minDate = tomorrow.toISOString().split('T')[0]
	const maxDate = lastAvailableDate.toISOString().split('T')[0]
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		phone: '',
		service: serviceTypes[0]?.name || '',
		date: '',
		time: '',
		additionalNotes: '',
		preferredContact: 'email' as 'email' | 'phone',
		consent: false,
		website: '',
		gCaptchaResponse: '',
	})
	const [status, setStatus] = useState<BookingStatus>('idle')
	const [step, setStep] = useState<1 | 2>(1)
	const [reference, setReference] = useState('')
	const [confirmationSent, setConfirmationSent] = useState<boolean | null>(null)
	const [errorMessage, setErrorMessage] = useState('')
	const [showPreparation, setShowPreparation] = useState(false)
	const selectedDate = formData.date ? asLocalDate(formData.date) : undefined
	const hijriDate = selectedDate ? getHijriDate(selectedDate) : undefined
	const selectedDayIsSunnah = selectedDate ? isSunnahDay(selectedDate) : false
	const formEndpoint = endpoint || '/api/forms/appointment'

	function handleChange(
		event: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) {
		const { name, value } = event.target
		const nextValue =
			event.target instanceof HTMLInputElement &&
			event.target.type === 'checkbox'
				? event.target.checked
				: value
		setFormData((current) => ({ ...current, [name]: nextValue }))
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		if (!formData.date) {
			setErrorMessage('Choose a preferred date from the calendar.')
			setStatus('error')
			return
		}
		setStatus('submitting')
		setErrorMessage('')

		try {
			let submission = { ...formData }

			if (showRecaptcha && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
				submission = {
					...submission,
					gCaptchaResponse: await getRecaptchaToken(
						process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
						'submit',
					),
				}
			}

			const response = await fetch(formEndpoint, {
				method: 'POST',
				headers: {
					'Content-Type': formEndpoint.startsWith('/')
						? 'application/json'
						: 'text/plain;charset=utf-8',
				},
				body: JSON.stringify(submission),
			})

			const result = (await response.json()) as {
				message?: string
				reference?: string
				confirmationSent?: boolean
			}
			if (!response.ok)
				throw new Error(result.message || 'Appointment submission failed')

			setReference(result.reference || '')
			setConfirmationSent(result.confirmationSent ?? null)
			setStatus('success')
			setFormData({
				name: '',
				email: '',
				phone: '',
				service: serviceTypes[0]?.name || '',
				date: '',
				time: '',
				additionalNotes: '',
				preferredContact: 'email',
				consent: false,
				website: '',
				gCaptchaResponse: '',
			})
		} catch (error) {
			setErrorMessage(error instanceof Error ? error.message : '')
			setStatus('error')
		}
	}

	return (
		<section className="section" {...moduleProps({ _key, ...props })}>
			<div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)] lg:gap-20">
				<div className="space-y-10">
					<header className="max-w-2xl space-y-4">
						<p className="clinic-kicker">Appointments</p>
						<h1 className="h1 text-balance">{title}</h1>
						<p className="text-ink/70 max-w-xl text-lg leading-relaxed">
							{description}
						</p>
					</header>

					<div className="clinic-shell">
						{status === 'success' ? (
							<div className="clinic-core p-7 md:p-10" role="status">
								<div
									aria-hidden="true"
									className="bg-clinic-sage grid size-12 place-items-center rounded-full text-2xl"
								>
									✓
								</div>
								<p className="clinic-kicker mt-7">Request received</p>
								<h2 className="h3 mt-3">
									We will confirm availability personally
								</h2>
								<p className="text-ink/70 mt-4 max-w-xl leading-relaxed">
									{confirmationSent === false
										? 'Your request reached the clinic, but we could not send the acknowledgment email. Please save the reference below.'
										: messages?.success ||
											'Your request is with the clinic. It is not an appointment confirmation yet—watch for a reply with availability and next steps.'}
								</p>
								{reference && (
									<p className="clinic-note mt-6">
										<span className="font-semibold">Reference:</span>{' '}
										{reference}
									</p>
								)}
								<button
									className="link mt-7 font-semibold"
									onClick={() => {
										setStatus('idle')
										setStep(1)
										setConfirmationSent(null)
									}}
									type="button"
								>
									Send another request
								</button>
							</div>
						) : (
							<form
								className="clinic-core space-y-8 p-6 md:p-10"
								onSubmit={handleSubmit}
								aria-busy={status === 'submitting'}
							>
								<div aria-label={`Step ${step} of 2`} className="space-y-3">
									<div className="flex items-center justify-between text-sm font-semibold">
										<span>{step === 1 ? 'Your details' : 'Visit request'}</span>
										<span className="text-ink/55">Step {step} of 2</span>
									</div>
									<div className="bg-clinic-sage/45 h-1.5 overflow-hidden rounded-full">
										<div
											className="bg-ink h-full rounded-full transition-[width]"
											style={{ width: step === 1 ? '50%' : '100%' }}
										/>
									</div>
								</div>
								<input
									aria-hidden="true"
									autoComplete="off"
									className="absolute -left-[9999px]"
									name="website"
									onChange={handleChange}
									tabIndex={-1}
									value={formData.website}
								/>
								{step === 1 && (
									<fieldset className="space-y-5">
										<legend className="h4 mb-1">Your details</legend>
										<p className="text-ink/65 text-sm">
											We only use these details to confirm and prepare for your
											session.
										</p>
										<div className="grid gap-4 sm:grid-cols-2">
											<label className="space-y-2 text-sm font-medium">
												<span>Full name</span>
												<input
													autoComplete="name"
													className="clinic-input"
													name="name"
													onChange={handleChange}
													required
													value={formData.name}
												/>
											</label>
											<label className="space-y-2 text-sm font-medium">
												<span>Phone number</span>
												<input
													autoComplete="tel"
													className="clinic-input"
													name="phone"
													onChange={handleChange}
													required
													type="tel"
													value={formData.phone}
												/>
											</label>
										</div>
										<label className="block space-y-2 text-sm font-medium">
											<span>Email address</span>
											<input
												autoComplete="email"
												className="clinic-input"
												name="email"
												onChange={handleChange}
												required
												type="email"
												value={formData.email}
											/>
										</label>
										<fieldset className="space-y-3">
											<legend className="text-sm font-medium">
												How should we reply?
											</legend>
											<div className="grid gap-3 sm:grid-cols-2">
												{(['email', 'phone'] as const).map((method) => (
													<label
														className="clinic-note flex cursor-pointer items-center gap-3"
														key={method}
													>
														<input
															checked={formData.preferredContact === method}
															name="preferredContact"
															onChange={handleChange}
															type="radio"
															value={method}
														/>
														<span className="capitalize">{method}</span>
													</label>
												))}
											</div>
										</fieldset>
									</fieldset>
								)}

								{step === 2 && (
									<>
										<fieldset className="space-y-4">
											<legend className="h4 mb-1">Choose your treatment</legend>
							<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
												{serviceTypes.map((service) => {
													const selected = formData.service === service.name

													return (
														<label
															className={`relative flex min-h-36 cursor-pointer flex-col rounded-[1.4rem] border p-5 transition ${
																selected
																	? 'border-accent/25 bg-clinic-sage/70 shadow-[0_10px_28px_rgb(24_53_43_/_0.08)]'
																	: 'border-ink/8 bg-canvas/55 hover:border-accent/15 hover:bg-clinic-sage/35'
															}`}
															key={service.name}
														>
															<input
																checked={selected}
																className="sr-only"
																name="service"
																onChange={handleChange}
																type="radio"
																value={service.name}
															/>
									<span className="pr-7 text-sm leading-snug font-semibold text-balance">
																{service.name}
															</span>
															<span className="mt-2 text-xs font-medium text-ink/50">
																{service.duration} minutes
															</span>
															<span className="mt-auto pt-5 font-serif text-3xl leading-none text-ink">
																{service.price || 'Ask us'}
															</span>
															<span
																aria-hidden="true"
																className={`absolute top-4 right-4 grid size-5 place-items-center rounded-full border text-[0.65rem] ${
																	selected
																		? 'border-accent bg-accent text-canvas'
																		: 'border-ink/15 text-transparent'
																}`}
															>
																✓
															</span>
														</label>
													)
												})}
											</div>
										</fieldset>

										<fieldset className="space-y-4">
											<legend className="h4 mb-1">Choose your preferred date</legend>
											<p className="text-sm leading-relaxed text-ink/60">
												The calendar shows both systems together. Heart-marked dates are
												commonly observed Sunnah days.
											</p>
											<div className="max-w-xl">
												<SunnahCalendar
													maxDate={maxDate}
													minDate={minDate}
													onSelect={(date) =>
														setFormData((current) => ({ ...current, date }))
													}
													selectedValue={formData.date}
												/>
											</div>
										</fieldset>

										<fieldset className="space-y-5">
											<label className="block space-y-2 text-sm font-medium">
												<span>Preferred time</span>
												<select
													className="clinic-input"
													name="time"
													onChange={handleChange}
													required
													value={formData.time}
												>
													<option value="">Select a time</option>
													{timeSlots.map((slot) => (
														<option key={slot} value={slot}>
															{slot}
														</option>
													))}
												</select>
											</label>
											{hijriDate && (
												<div className="clinic-note grid gap-4 sm:grid-cols-2" role="status">
													<div>
														<p className="clinic-kicker">Gregorian date</p>
														<p className="mt-2 font-serif text-xl font-semibold">
															{selectedDate?.toLocaleDateString('en-US', {
																weekday: 'long',
																month: 'long',
																day: 'numeric',
																year: 'numeric',
															})}
														</p>
													</div>
													<div>
														<p className="clinic-kicker">Hijri date</p>
														<p className="mt-2 font-serif text-xl font-semibold">
													{hijriDate.day} {hijriDate.month} {hijriDate.year}{' '}
													AH
														</p>
													</div>
													<p className="text-ink/70 sm:col-span-2">
														{selectedDayIsSunnah
															? 'This is a Sunnah day for Hijama. We will still confirm suitability as part of your booking.'
															: 'This date is available to request. Heart-marked Sunnah dates are shown directly in the calendar.'}
													</p>
												</div>
											)}
										</fieldset>

										<fieldset className="space-y-3">
											<legend className="h4 mb-1">
												Anything we should know?
											</legend>
											<label className="block space-y-2 text-sm font-medium">
												<span className="text-ink/65">
													Accessibility needs or a practical request. Please do
													not send a detailed medical history here.
												</span>
												<textarea
													className="clinic-input min-h-32 resize-y"
													maxLength={1500}
													name="additionalNotes"
													onChange={handleChange}
													value={formData.additionalNotes}
												/>
											</label>
										</fieldset>
										<label className="clinic-note flex items-start gap-3 text-sm leading-relaxed">
											<input
												checked={formData.consent}
												className="mt-1"
												name="consent"
												onChange={handleChange}
												required
												type="checkbox"
											/>
											<span>
												I agree that the clinic may use these details to respond
												to this appointment request. This request is not
												confirmed until the clinic replies.
											</span>
										</label>
									</>
								)}

								{status === 'error' && (
									<p
										className="bg-clinic-clay/15 rounded-2xl p-5 text-sm leading-relaxed"
										role="alert"
									>
										{errorMessage ||
											messages?.error ||
											'We could not send your request. Please try again or contact the clinic directly.'}
									</p>
								)}

								{step === 1 ? (
									<button
										className="action group w-full justify-between"
										onClick={(event) => {
											if (event.currentTarget.form?.reportValidity()) setStep(2)
										}}
										type="button"
									>
										<span>Continue to visit details</span>
										<span aria-hidden="true">→</span>
									</button>
								) : (
									<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
										<button
											className="link min-h-12 px-3 font-semibold"
											onClick={() => setStep(1)}
											type="button"
										>
											← Back
										</button>
										<button
											className="action group justify-between sm:min-w-64"
											disabled={status === 'submitting'}
											type="submit"
										>
											<span>
												{status === 'submitting'
													? 'Sending your request…'
													: 'Request appointment'}
											</span>
											<span
												aria-hidden="true"
												className="bg-canvas/15 grid size-7 place-items-center rounded-full text-lg"
											>
												↗
											</span>
										</button>
									</div>
								)}
							</form>
						)}
					</div>
				</div>

				<aside className="space-y-5 lg:sticky lg:top-28">
					{step === 1 && (
						<SunnahCalendar
							maxDate={maxDate}
							minDate={minDate}
							onSelect={(date) =>
								setFormData((current) => ({ ...current, date }))
							}
							selectedValue={formData.date}
						/>
					)}

					{locationInfo && (
						<div className="clinic-shell">
							<div className="clinic-core p-6 md:p-7">
								<p className="clinic-kicker">Visit</p>
								<h2 className="h4 mt-3">Clinic location</h2>
								<p className="text-ink/70 mt-3 text-sm leading-relaxed whitespace-pre-line">
									{locationInfo.address}
								</p>
								{locationInfo.mapUrl && (
									<a
										className="link mt-4 inline-block text-sm font-semibold"
										href={locationInfo.mapUrl}
										rel="noreferrer"
										target="_blank"
									>
										Open directions <span aria-hidden="true">↗</span>
									</a>
								)}
							</div>
						</div>
					)}

					{paymentInfo && (
						<div className="clinic-shell">
							<div className="clinic-core p-6 md:p-7">
								<p className="clinic-kicker">Confirmation</p>
								<h2 className="h4 mt-3">Payment details</h2>
								{paymentInfo.depositRequired && (
									<p className="text-ink/70 mt-3 text-sm leading-relaxed">
										A deposit of{' '}
										<strong className="text-ink">
											{paymentInfo.depositAmount}
										</strong>{' '}
										confirms your appointment.
									</p>
								)}
								{paymentInfo.paymentMethods?.map((method) => (
									<div className="mt-4 text-sm" key={method.method}>
										<p className="font-semibold">{method.method}</p>
										<p className="text-ink/70 mt-1">{method.recipient}</p>
										<p className="text-ink/70">{method.details}</p>
									</div>
								))}
							</div>
						</div>
					)}

					{prepInstructions && (
						<div className="clinic-shell">
							<div className="clinic-core p-6 md:p-7">
								<button
									aria-expanded={showPreparation}
									className="flex w-full items-center justify-between gap-4 text-left"
									onClick={() => setShowPreparation((shown) => !shown)}
									type="button"
								>
									<span>
										<span className="clinic-kicker block">
											Before your visit
										</span>
										<span className="h4 mt-3 block">
											{prepInstructions.title || 'Preparation guidance'}
										</span>
									</span>
									<span aria-hidden="true" className="text-xl">
										{showPreparation ? '−' : '+'}
									</span>
								</button>
								{showPreparation && (
									<div className="text-ink/70 mt-5 space-y-5 text-sm leading-relaxed">
										{prepInstructions.bringItems?.length ? (
											<PreparationList
												title="Bring"
												values={prepInstructions.bringItems}
											/>
										) : null}
										{prepInstructions.wearItems?.length ? (
											<PreparationList
												title="Wear"
												values={prepInstructions.wearItems}
											/>
										) : null}
										{prepInstructions.beforeSession?.length ? (
											<PreparationList
												title="Before your session"
												values={prepInstructions.beforeSession}
											/>
										) : null}
										{prepInstructions.specialNotes?.length ? (
											<PreparationList
												title="Please note"
												values={prepInstructions.specialNotes}
											/>
										) : null}
									</div>
								)}
							</div>
						</div>
					)}
				</aside>
			</div>
		</section>
	)
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function toDateInputValue(date: Date) {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

function SunnahCalendar({
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
	const lastAvailable = asLocalDate(maxDate)
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
	const year = visibleMonth.getFullYear()
	const month = visibleMonth.getMonth()
	const leadingDays = new Date(year, month, 1).getDay()
	const daysInMonth = new Date(year, month + 1, 0).getDate()
	const calendarDays = [
		...Array.from<null>({ length: leadingDays }).fill(null),
		...Array.from({ length: daysInMonth }, (_, index) =>
			new Date(year, month, index + 1),
		),
	]
	const monthStartHijri = getHijriDate(new Date(year, month, 1))
	const monthEndHijri = getHijriDate(new Date(year, month + 1, 0))
	const hijriRange =
		monthStartHijri.month === monthEndHijri.month
			? `${monthStartHijri.month} ${monthEndHijri.year} AH`
			: `${monthStartHijri.month} – ${monthEndHijri.month} ${monthEndHijri.year} AH`
	const canGoBack = visibleMonth > firstMonth
	const canGoForward = visibleMonth < lastMonth

	function changeMonth(offset: number) {
		setVisibleMonth(new Date(year, month + offset, 1))
	}

	return (
		<div className="clinic-shell overflow-hidden">
			<div className="clinic-core relative overflow-hidden p-5 md:p-6">
				<div
					aria-hidden="true"
					className="pointer-events-none absolute -top-20 -right-16 size-52 rounded-full bg-clinic-sage/55 blur-3xl"
				/>

				<div className="relative">
					<div className="flex items-start justify-between gap-4">
						<div>
							<p className="clinic-kicker">Plan around the lunar month</p>
							<h2 className="mt-3 font-serif text-3xl leading-none tracking-[-0.035em]">
								Sunnah days
							</h2>
						</div>
						<span
							aria-hidden="true"
							className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-xl text-canvas shadow-[0_8px_24px_rgb(24_53_43_/_0.2)]"
						>
							♥
						</span>
					</div>

					<p className="mt-4 text-sm leading-relaxed text-ink/65">
						Green hearts mark the 13th, 14th, 15th, 17th, 19th and 21st of
						the lunar month. You may request any available day.
					</p>

					<div className="mt-6 rounded-[1.5rem] border border-ink/8 bg-canvas/70 p-3 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.8)]">
						<div className="flex items-center justify-between gap-3 px-1 pb-4">
							<button
								aria-label="Show previous month"
								className="grid size-9 place-items-center rounded-full text-lg text-ink/65 transition hover:bg-clinic-sage/60 disabled:cursor-not-allowed disabled:opacity-25"
								disabled={!canGoBack}
								onClick={() => changeMonth(-1)}
								type="button"
							>
								<span aria-hidden="true">←</span>
							</button>
							<div className="text-center">
								<p className="font-serif text-lg font-semibold">
									{visibleMonth.toLocaleDateString('en-US', {
										month: 'long',
										year: 'numeric',
									})}
								</p>
								<p className="mt-0.5 text-[0.65rem] font-semibold tracking-wide text-ink/45 uppercase">
									{hijriRange}
								</p>
							</div>
							<button
								aria-label="Show next month"
								className="grid size-9 place-items-center rounded-full text-lg text-ink/65 transition hover:bg-clinic-sage/60 disabled:cursor-not-allowed disabled:opacity-25"
								disabled={!canGoForward}
								onClick={() => changeMonth(1)}
								type="button"
							>
								<span aria-hidden="true">→</span>
							</button>
						</div>

						<div className="grid grid-cols-7 text-center text-[0.62rem] font-bold tracking-wider text-ink/40 uppercase">
							{WEEKDAYS.map((weekday) => (
								<span className="py-2" key={weekday}>
									{weekday.slice(0, 1)}
								</span>
							))}
						</div>

						<div
							aria-label={`${visibleMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} appointment calendar`}
							className="grid grid-cols-7 gap-1"
							role="group"
						>
							{calendarDays.map((date, index) => {
								if (!date)
									return <span aria-hidden="true" key={`empty-${index}`} />

								const value = toDateInputValue(date)
								const available = date >= firstAvailable && date <= lastAvailable
								const sunnahDay = isSunnahDay(date)
								const selected = selectedValue === value
								const hijri = getHijriDate(date)

								return (
									<button
										aria-label={`${date.toLocaleDateString('en-US', {
											weekday: 'long',
											month: 'long',
											day: 'numeric',
										})}, ${hijri.day} ${hijri.month}${sunnahDay ? ', Sunnah day' : ''}`}
										aria-pressed={selected}
										className={`relative grid aspect-square place-items-center rounded-xl text-xs font-semibold transition ${
											selected
												? 'bg-accent text-canvas shadow-[0_6px_14px_rgb(24_53_43_/_0.2)]'
												: sunnahDay && available
													? 'bg-clinic-sage/70 text-ink ring-1 ring-accent/15 hover:bg-clinic-sage'
													: 'text-ink/65 hover:bg-clinic-sage/45'
										} disabled:cursor-not-allowed disabled:opacity-20`}
										disabled={!available}
										key={value}
										onClick={() => onSelect(value)}
										type="button"
									>
										{sunnahDay && available && (
											<span
												aria-hidden="true"
												className={`absolute top-0.5 right-1 text-[0.48rem] ${selected ? 'text-clinic-sage' : 'text-accent'}`}
											>
												♥
											</span>
										)}
										<span>{date.getDate()}</span>
									</button>
								)
							})}
						</div>
					</div>

					<div className="mt-4 flex items-center justify-between gap-3 text-xs text-ink/55">
						<span className="inline-flex items-center gap-2">
							<span aria-hidden="true" className="text-accent">
								♥
							</span>
							Commonly observed Sunnah date
						</span>
						{selectedValue && (
							<span className="font-semibold text-accent">Selected</span>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

function PreparationList({
	title,
	values,
}: {
	title: string
	values: string[]
}) {
	return (
		<div>
			<h3 className="text-ink font-semibold">{title}</h3>
			<ul className="mt-2 list-disc space-y-1 pl-5">
				{values.map((value) => (
					<li key={value}>{value}</li>
				))}
			</ul>
		</div>
	)
}
