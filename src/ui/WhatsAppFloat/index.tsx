import { getClinicContact } from '@/lib/clinicContact'
import WhatsAppFloatButton from './Button'

export default async function WhatsAppFloat() {
	const contact = await getClinicContact()

	if (!contact.whatsapp) return null

	return (
		<WhatsAppFloatButton
			phone={contact.whatsapp}
			message={contact.whatsappMessage}
			label={`Chat with ${contact.title} on WhatsApp`}
		/>
	)
}
