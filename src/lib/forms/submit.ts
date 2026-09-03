import 'server-only'

import { Resend } from 'resend'
import { z } from 'zod'

export type FormKind = 'appointment' | 'contact'

const baseSchema = z.object({
	name: z.string().trim().min(2).max(100),
	email: z.string().trim().email().max(254),
	gCaptchaResponse: z.string().max(4096).optional().default(''),
	website: z.string().max(200).optional().default(''),
})

const appointmentSchema = baseSchema.extend({
	phone: z.string().trim().min(7).max(30),
	service: z.string().trim().min(2).max(120),
	date: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/)
		.refine((value) => !Number.isNaN(Date.parse(`${value}T12:00:00Z`))),
	time: z.string().trim().min(2).max(40),
	additionalNotes: z.string().trim().max(1500).optional().default(''),
	preferredContact: z.enum(['email', 'phone']).default('email'),
	consent: z.literal(true),
})

const contactSchema = baseSchema.extend({
	reason: z.string().trim().min(2).max(100),
	message: z.string().trim().min(10).max(3000),
	consent: z.literal(true),
})

type AppointmentSubmission = z.infer<typeof appointmentSchema>
type ContactSubmission = z.infer<typeof contactSchema>
type Submission = AppointmentSubmission | ContactSubmission

const WINDOW_MS = 10 * 60 * 1000
const MAX_ATTEMPTS = 5
const attempts = new Map<string, number[]>()

export async function handleFormSubmission(request: Request, kind: FormKind) {
	if (!isSameOrigin(request)) {
		return Response.json(
			{ ok: false, message: 'Request origin was not accepted.' },
			{ status: 403 },
		)
	}

	const contentLength = Number(request.headers.get('content-length') || 0)
	if (contentLength > 20_000) {
		return Response.json(
			{ ok: false, message: 'Request is too large.' },
			{ status: 413 },
		)
	}

	const rateLimitKey = `${kind}:${getClientIp(request)}`
	if (!consumeAttempt(rateLimitKey)) {
		return Response.json(
			{
				ok: false,
				message: 'Too many attempts. Please wait a few minutes and try again.',
			},
			{ status: 429 },
		)
	}

	let payload: unknown
	try {
		payload = await request.json()
	} catch {
		return Response.json(
			{ ok: false, message: 'Invalid request.' },
			{ status: 400 },
		)
	}

	const parsed = (
		kind === 'appointment' ? appointmentSchema : contactSchema
	).safeParse(payload)
	if (!parsed.success) {
		return Response.json(
			{
				ok: false,
				message: 'Please check the information and try again.',
			},
			{ status: 422 },
		)
	}

	if (parsed.data.website) {
		return Response.json({ ok: true, reference: createReference(kind) })
	}

	if (!(await verifyRecaptcha(parsed.data.gCaptchaResponse))) {
		return Response.json(
			{
				ok: false,
				message: 'Spam verification failed. Please refresh and try again.',
			},
			{ status: 400 },
		)
	}

	if (!process.env.RESEND_API_KEY) {
		console.error(
			'Form delivery is unavailable: RESEND_API_KEY is not configured.',
		)
		return Response.json(
			{
				ok: false,
				message:
					'Online delivery is temporarily unavailable. Please contact the clinic directly.',
			},
			{ status: 503 },
		)
	}

	const reference = createReference(kind)
	try {
		const confirmationSent = await sendSubmissionEmails(
			kind,
			parsed.data,
			reference,
		)
		return Response.json({ ok: true, reference, confirmationSent })
	} catch (error) {
		console.error('Form delivery failed.', error)
		return Response.json(
			{
				ok: false,
				message:
					'We could not deliver your request. Please contact the clinic directly.',
			},
			{ status: 502 },
		)
	}
}

async function sendSubmissionEmails(
	kind: FormKind,
	submission: Submission,
	reference: string,
) {
	const resend = new Resend(process.env.RESEND_API_KEY)
	const from =
		process.env.RESEND_FROM_EMAIL || 'Hijama Exorcist <onboarding@resend.dev>'
	const clinicEmail =
		process.env.FORM_NOTIFICATION_EMAIL || 'thehijamaexorcist@gmail.com'
	const replyToClinic = process.env.RESEND_REPLY_TO_EMAIL || clinicEmail
	const appointment =
		kind === 'appointment' ? (submission as AppointmentSubmission) : undefined
	const contact =
		kind === 'contact' ? (submission as ContactSubmission) : undefined

	const clinicRows = appointment
		? [
				['Name', appointment.name],
				['Email', appointment.email],
				['Phone', appointment.phone],
				['Preferred contact', appointment.preferredContact],
				['Session', appointment.service],
				['Preferred date', formatDate(appointment.date)],
				['Preferred time', appointment.time],
				['Practical notes', appointment.additionalNotes || 'None provided'],
			]
		: [
				['Name', contact!.name],
				['Email', contact!.email],
				['Reason', contact!.reason],
				['Message', contact!.message],
			]

	const clinicDelivery = await resend.emails.send({
		from,
		to: clinicEmail,
		replyTo: submission.email,
		subject:
			kind === 'appointment'
				? `[${reference}] New appointment request`
				: `[${reference}] New clinic enquiry`,
		html: emailShell(
			kind === 'appointment'
				? 'New appointment request'
				: 'New private enquiry',
			`Reply to this email to respond directly to ${escapeHtml(submission.name)}.`,
			rowsHtml(clinicRows),
			reference,
		),
		text:
			clinicRows.map(([label, value]) => `${label}: ${value}`).join('\n') +
			`\n\nReference: ${reference}`,
	})

	if (clinicDelivery.error) throw new Error(clinicDelivery.error.message)

	const customerDetails = appointment
		? rowsHtml([
				['Session', appointment.service],
				['Preferred date', formatDate(appointment.date)],
				['Preferred time', appointment.time],
			])
		: `<p style="margin:0;color:#52605a;line-height:1.7">Your ${escapeHtml(contact!.reason.toLowerCase())} enquiry is now with the clinic.</p>`

	const confirmation = await resend.emails.send({
		from,
		to: submission.email,
		replyTo: replyToClinic,
		subject:
			kind === 'appointment'
				? `We received your appointment request · ${reference}`
				: `We received your message · ${reference}`,
		html: emailShell(
			`As-salāmu ʿalaykum, ${escapeHtml(submission.name)}`,
			kind === 'appointment'
				? 'Your request has been received. It is not confirmed yet—the clinic will reply personally with availability and next steps.'
				: 'Thank you for contacting Hijama Exorcist. The clinic will reply personally as soon as possible.',
			customerDetails,
			reference,
		),
		text:
			(kind === 'appointment'
				? 'Your appointment request has been received but is not confirmed yet. The clinic will reply with availability and next steps.'
				: 'Your message has been received. The clinic will reply as soon as possible.') +
			`\n\nReference: ${reference}`,
	})

	if (confirmation.error) {
		console.error('Customer confirmation email failed.', confirmation.error)
		return false
	}

	return true
}

function emailShell(
	title: string,
	intro: string,
	content: string,
	reference: string,
) {
	return `<!doctype html><html><body style="margin:0;background:#f4f2eb;font-family:Arial,sans-serif;color:#173c32"><div style="display:none;max-height:0;overflow:hidden">Reference ${escapeHtml(reference)}</div><div style="max-width:620px;margin:0 auto;padding:32px 16px"><div style="background:#173c32;border-radius:18px 18px 0 0;padding:24px 28px;color:#f8f5ed"><p style="margin:0 0 8px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#c9d6cf">Hijama Exorcist</p><h1 style="margin:0;font-family:Georgia,serif;font-size:28px;line-height:1.2">${title}</h1></div><div style="background:#fff;border:1px solid #d9ded8;border-top:0;border-radius:0 0 18px 18px;padding:28px"><p style="margin:0 0 24px;color:#52605a;line-height:1.7">${intro}</p>${content}<p style="margin:28px 0 0;padding-top:20px;border-top:1px solid #e3e7e2;color:#6b746f;font-size:13px">Reference: <strong>${escapeHtml(reference)}</strong><br>Reply to this email to continue the conversation.</p></div></div></body></html>`
}

function rowsHtml(rows: string[][]) {
	return `<table role="presentation" style="width:100%;border-collapse:collapse">${rows
		.map(
			([label, value]) =>
				`<tr><td style="padding:10px 12px 10px 0;border-top:1px solid #edf0ed;color:#6b746f;font-size:13px;vertical-align:top">${escapeHtml(label)}</td><td style="padding:10px 0;border-top:1px solid #edf0ed;color:#173c32;line-height:1.5">${escapeHtml(value)}</td></tr>`,
		)
		.join('')}</table>`
}

function escapeHtml(value: string) {
	return value.replace(/[&<>'"]/g, (character) => {
		const entities: Record<string, string> = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			"'": '&#39;',
			'"': '&quot;',
		}
		return entities[character]
	})
}

function createReference(kind: FormKind) {
	const prefix = kind === 'appointment' ? 'HX-A' : 'HX-C'
	const date = new Date().toISOString().slice(0, 10).replaceAll('-', '')
	return `${prefix}-${date}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`
}

function formatDate(value: string) {
	return new Date(`${value}T12:00:00Z`).toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		timeZone: 'UTC',
	})
}

function isSameOrigin(request: Request) {
	const origin = request.headers.get('origin')
	if (!origin) return true
	try {
		const requestHost =
			request.headers.get('x-forwarded-host') ||
			request.headers.get('host') ||
			new URL(request.url).host
		return new URL(origin).host === requestHost
	} catch {
		return false
	}
}

function getClientIp(request: Request) {
	return (
		request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
	)
}

function consumeAttempt(key: string) {
	const now = Date.now()
	const recent = (attempts.get(key) || []).filter(
		(timestamp) => now - timestamp < WINDOW_MS,
	)
	if (recent.length >= MAX_ATTEMPTS) return false
	recent.push(now)
	attempts.set(key, recent)
	return true
}

async function verifyRecaptcha(token: string) {
	const secret = process.env.RECAPTCHA_SECRET_KEY
	if (!secret) return true
	if (!token) return false

	try {
		const response = await fetch(
			'https://www.google.com/recaptcha/api/siteverify',
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: new URLSearchParams({ secret, response: token }),
				cache: 'no-store',
			},
		)
		const result = (await response.json()) as {
			success?: boolean
			score?: number
		}
		return (
			result.success === true &&
			(result.score === undefined || result.score >= 0.5)
		)
	} catch (error) {
		console.error('reCAPTCHA verification failed.', error)
		return false
	}
}
