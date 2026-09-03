import { BASE_URL } from '@/lib/env'

type Contact = NonNullable<Sanity.Site['contact']>

type MedicalBusinessArgs = {
	name: string
	description?: string
	contact?: Contact
	url?: string
	image?: string
	sameAs?: string[]
	rating?: { average: number; count: number }
	priceRange?: string
}

export function medicalBusinessJsonLd({
	name,
	description,
	contact,
	url = BASE_URL,
	image,
	sameAs = [],
	rating,
	priceRange,
}: MedicalBusinessArgs) {
	const city = contact?.city
	const country = contact?.countryCode || 'US'

	return {
		'@context': 'https://schema.org',
		'@type': ['MedicalBusiness', 'HealthAndBeautyBusiness'],
		name,
		url,
		...(description && { description }),
		...(image && { image }),
		...(contact?.phone && { telephone: contact.phone }),
		...(contact?.email && { email: contact.email }),
		...(priceRange && { priceRange }),
		...(city && {
			address: {
				'@type': 'PostalAddress',
				addressLocality: city,
				addressCountry: country,
			},
			areaServed: {
				'@type': 'City',
				name: city,
			},
		}),
		...(contact?.serviceArea && {
			serviceArea: {
				'@type': 'AdministrativeArea',
				name: contact.serviceArea,
			},
		}),
		...(rating &&
			rating.count > 0 && {
				aggregateRating: {
					'@type': 'AggregateRating',
					ratingValue: Number(rating.average.toFixed(1)),
					reviewCount: rating.count,
					bestRating: 5,
					worstRating: 1,
				},
			}),
		...(sameAs.length > 0 && { sameAs }),
	}
}

export function faqJsonLd(items: Array<{ question: string; answer: string }>) {
	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: items.map(({ question, answer }) => ({
			'@type': 'Question',
			name: question,
			acceptedAnswer: {
				'@type': 'Answer',
				text: answer,
			},
		})),
	}
}

export function toJsonLdScript(data: Record<string, unknown> | null | undefined) {
	if (!data) return null
	return JSON.stringify(data).replace(/</g, '\\u003c')
}
