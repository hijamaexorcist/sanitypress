import { defineField, defineType } from 'sanity'
import { VscBook } from 'react-icons/vsc'

export default defineType({
	name: 'tradition-guidance',
	title: 'Tradition guidance',
	type: 'object',
	icon: VscBook,
	fields: [
		defineField({ name: 'pretitle', type: 'string' }),
		defineField({
			name: 'title',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'quote',
			type: 'text',
			rows: 4,
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'reference',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'sourceUrl',
			type: 'url',
			validation: (Rule) => Rule.required().uri({ scheme: ['https'] }),
		}),
		defineField({ name: 'context', type: 'text', rows: 4 }),
		defineField({ name: 'quranNote', type: 'text', rows: 4 }),
		defineField({
			name: 'quranUrl',
			type: 'url',
			validation: (Rule) => Rule.uri({ scheme: ['https'] }),
		}),
	],
	preview: { select: { title: 'title', subtitle: 'reference' } },
})
