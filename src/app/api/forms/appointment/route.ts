import { handleFormSubmission } from '@/lib/forms/submit'

export async function POST(request: Request) {
	return handleFormSubmission(request, 'appointment')
}
