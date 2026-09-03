import { clinicJsonLdScript, getClinicContact } from '@/lib/clinicContact'

export default async function ClinicJsonLd() {
	const contact = await getClinicContact()
	const json = clinicJsonLdScript(contact)
	if (!json) return null

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: json }}
		/>
	)
}
