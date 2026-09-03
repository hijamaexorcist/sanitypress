'use client'
import { useState } from 'react'
import moduleProps from '@/lib/moduleProps'
import { getRecaptchaToken } from '@/lib/recaptcha'
import {
	Mail,
	Phone,
	MapPin,
	Instagram,
	Youtube,
	Linkedin,
	Twitter,
	Facebook,
	MessageSquare,
} from 'lucide-react'

// Social platform icon mapping
const socialIcons = {
	instagram: Instagram,
	youtube: Youtube,
	linkedin: Linkedin,
	twitter: Twitter,
	facebook: Facebook,
	tiktok: MessageSquare, // Using MessageSquare as placeholder for TikTok
}

interface ContactFormModuleProps {
	title?: string
	description?: string
	endpoint?: string
	showRecaptcha?: boolean
	reasonOptions?: string[]
	contactInfo?: {
		heading?: string
		email?: string
		phone?: string
		address?: string
	}
	socialLinks?: {
		heading?: string
		links?: Array<{
			platform: keyof typeof socialIcons
			url: string
			label?: string
		}>
	}
	messages?: {
		success?: string
		error?: string
		submitButton?: string
		submittingButton?: string
	}
	_key?: string
}

export default function ContactFormModule({
	title = 'Contact the clinic',
	description = 'Have a practical question before booking? Send a private enquiry and the clinic will respond as soon as possible.',
	endpoint,
	showRecaptcha,
	reasonOptions,
	contactInfo,
	socialLinks,
	messages = {
		success:
			'Your message has been sent. The clinic will get back to you soon.',
		error:
			'Your message could not be sent. Please try again or use the contact details on this page.',
		submitButton: 'Send message',
		submittingButton: 'Sending…',
	},
	_key,
	...props
}: ContactFormModuleProps) {
	const fallbackReasons = [
		'General enquiry',
		'Booking question',
		'Preparation question',
	]
	const reasons = reasonOptions?.length ? reasonOptions : fallbackReasons

	const [formData, setFormData] = useState({
		name: '',
		email: '',
		message: '',
		reason: reasons[0] || 'General Inquiry',
		gCaptchaResponse: '',
	})

	const [status, setStatus] = useState<
		'idle' | 'submitting' | 'success' | 'error'
	>('idle')

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => {
		const { name, value } = e.target
		setFormData((prev) => ({ ...prev, [name]: value }))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setStatus('submitting')

		try {
			let submitData = { ...formData }

			if (showRecaptcha && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
				try {
					const token = await getRecaptchaToken(
						process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
						'submit',
					)
					submitData.gCaptchaResponse = token
				} catch {
					throw new Error('reCAPTCHA verification failed')
				}
			}

			const res = await fetch(endpoint!, {
				method: 'POST',
				headers: { 'Content-Type': 'text/plain;charset=utf-8' },
				body: JSON.stringify(submitData),
			})

			if (!res.ok) throw new Error('Submission failed')

			setStatus('success')
			setFormData({
				name: '',
				email: '',
				message: '',
				reason: reasons[0] || 'General Inquiry',
				gCaptchaResponse: '',
			})

			// Reset status after 5 seconds
			setTimeout(() => setStatus('idle'), 5000)
		} catch (err) {
			console.error('Form submission error:', err)
			setStatus('error')
			setTimeout(() => setStatus('idle'), 5000)
		}
	}

	const inputClass =
		'clinic-input rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinic-clay'

	return (
		<section className="section" {...moduleProps({ _key, ...props })}>
			<div className="clinic-shell">
				<div className="clinic-core grid gap-10 p-6 md:p-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16 lg:p-14">
					<div className="space-y-9">
						<header className="space-y-4">
							<p className="clinic-kicker">Private enquiries</p>
							<h1 className="h2 text-ink">{title}</h1>
							<p className="text-clinic-stone max-w-prose text-lg leading-relaxed">
								{description}
							</p>
						</header>

						{contactInfo &&
							(contactInfo.email ||
								contactInfo.phone ||
								contactInfo.address) && (
								<div className="space-y-4">
									<h3 className="text-ink font-serif text-2xl">
										{contactInfo.heading || 'Contact details'}
									</h3>
									<div className="text-ink space-y-3">
										{contactInfo.email && (
											<a
												href={`mailto:${contactInfo.email}`}
												className="group focus-visible:outline-clinic-clay flex min-h-12 items-center gap-3 rounded-xl p-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
											>
												<span
													className="bg-clinic-sage flex size-10 shrink-0 items-center justify-center rounded-full"
													aria-hidden="true"
												>
													<Mail className="size-5" />
												</span>
												<span className="decoration-ink/25 group-hover:decoration-ink break-all underline underline-offset-4">
													{contactInfo.email}
												</span>
											</a>
										)}
										{contactInfo.phone && (
											<a
												href={`tel:${contactInfo.phone}`}
												className="group focus-visible:outline-clinic-clay flex min-h-12 items-center gap-3 rounded-xl p-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
											>
												<span
													className="bg-clinic-sage flex size-10 shrink-0 items-center justify-center rounded-full"
													aria-hidden="true"
												>
													<Phone className="size-5" />
												</span>
												<span className="decoration-ink/25 group-hover:decoration-ink underline underline-offset-4">
													{contactInfo.phone}
												</span>
											</a>
										)}
										{contactInfo.address && (
											<div className="text-clinic-stone flex items-start gap-3 p-2">
												<span
													className="bg-clinic-sage text-ink flex size-10 shrink-0 items-center justify-center rounded-full"
													aria-hidden="true"
												>
													<MapPin className="size-5" />
												</span>
												<span className="pt-2 whitespace-pre-line">
													{contactInfo.address}
												</span>
											</div>
										)}
									</div>
								</div>
							)}

						{socialLinks?.links && socialLinks.links.length > 0 && (
							<div className="space-y-4">
								<h3 className="text-ink font-serif text-2xl">
									{socialLinks.heading || 'Follow the clinic'}
								</h3>
								<div className="flex flex-wrap gap-3">
									{socialLinks.links.map((link) => {
										const Icon = socialIcons[link.platform] || MessageSquare
										return (
											<a
												key={`${link.platform}-${link.url}`}
												href={link.url}
												target="_blank"
												rel="noopener noreferrer"
												className="bg-clinic-mist text-ink hover:bg-clinic-sage focus-visible:outline-clinic-clay flex size-12 items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
												aria-label={
													link.label ||
													`Follow Hijama Exorcist on ${link.platform}`
												}
											>
												<Icon className="size-5" aria-hidden="true" />
											</a>
										)
									})}
								</div>
							</div>
						)}
					</div>

					<div className="bg-clinic-mist/80 rounded-[1.5rem] p-5 md:p-8">
						<form
							onSubmit={handleSubmit}
							className="space-y-6"
							aria-busy={status === 'submitting'}
						>
							<div className="grid gap-6 sm:grid-cols-2">
								<div className="space-y-2">
									<label
										htmlFor={`contact-name-${_key || 'form'}`}
										className="text-ink block font-semibold"
									>
										Name
									</label>
									<input
										id={`contact-name-${_key || 'form'}`}
										name="name"
										autoComplete="name"
										required
										className={inputClass}
										value={formData.name}
										onChange={handleChange}
									/>
								</div>
								<div className="space-y-2">
									<label
										htmlFor={`contact-email-${_key || 'form'}`}
										className="text-ink block font-semibold"
									>
										Email address
									</label>
									<input
										id={`contact-email-${_key || 'form'}`}
										name="email"
										type="email"
										inputMode="email"
										autoComplete="email"
										required
										className={inputClass}
										value={formData.email}
										onChange={handleChange}
									/>
								</div>
							</div>

							<div className="space-y-2">
								<label
									htmlFor={`contact-reason-${_key || 'form'}`}
									className="text-ink block font-semibold"
								>
									What can we help with?
								</label>
								<select
									id={`contact-reason-${_key || 'form'}`}
									name="reason"
									className={inputClass}
									value={formData.reason}
									onChange={handleChange}
								>
									{reasons.map((option) => (
										<option key={option} value={option}>
											{option}
										</option>
									))}
								</select>
							</div>

							<div className="space-y-2">
								<label
									htmlFor={`contact-message-${_key || 'form'}`}
									className="text-ink block font-semibold"
								>
									Message
								</label>
								<textarea
									id={`contact-message-${_key || 'form'}`}
									name="message"
									required
									className={`${inputClass} min-h-40 resize-y`}
									rows={6}
									value={formData.message}
									onChange={handleChange}
								/>
							</div>

							<div aria-live="polite" aria-atomic="true">
								{status === 'success' && (
									<p role="status" className="clinic-note text-ink">
										{messages.success}
									</p>
								)}
								{status === 'error' && (
									<p
										role="alert"
										className="border-clinic-clay/30 bg-clinic-clay/10 text-ink rounded-xl border p-4"
									>
										{messages.error}
									</p>
								)}
							</div>

							<button
								type="submit"
								className="action w-full sm:w-auto"
								disabled={status === 'submitting' || !endpoint}
							>
								{status === 'submitting'
									? messages.submittingButton
									: messages.submitButton}
							</button>
							{!endpoint && (
								<p className="text-clinic-stone text-sm leading-relaxed">
									Online enquiries are not available yet. Please use the contact
									details on this page.
								</p>
							)}
						</form>
					</div>
				</div>
			</div>
		</section>
	)
}
