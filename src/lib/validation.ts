import { z } from 'zod'

/** Shared validation for future appointment / contact API routes. */
export const appointmentRequestSchema = z.object({
	name: z.string().trim().min(2).max(120),
	email: z.string().trim().email().max(200),
	phone: z.string().trim().min(7).max(40),
	service: z.string().trim().min(1).max(120),
	date: z.string().trim().min(8).max(32),
	time: z.string().trim().min(1).max(32),
	additionalNotes: z.string().trim().max(2000).optional().default(''),
	gCaptchaResponse: z.string().optional(),
})

export type AppointmentRequest = z.infer<typeof appointmentRequestSchema>

export const contactRequestSchema = z.object({
	name: z.string().trim().min(2).max(120),
	email: z.string().trim().email().max(200),
	message: z.string().trim().min(5).max(4000),
	phone: z.string().trim().max(40).optional(),
})

export type ContactRequest = z.infer<typeof contactRequestSchema>
