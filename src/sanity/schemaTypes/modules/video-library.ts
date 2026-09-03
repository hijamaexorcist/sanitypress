import { defineArrayMember, defineField, defineType } from 'sanity'
import { VscPlayCircle } from 'react-icons/vsc'

const youtubePattern =
	/^https:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)[A-Za-z0-9_-]{6,}/

export default defineType({
	name: 'video-library',
	title: 'Video library',
	type: 'object',
	icon: VscPlayCircle,
	fields: [
		defineField({ name: 'pretitle', type: 'string' }),
		defineField({
			name: 'title',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({ name: 'description', type: 'text', rows: 3 }),
		defineField({
			name: 'videos',
			type: 'array',
			validation: (Rule) => Rule.required().min(1).max(6),
			of: [
				defineArrayMember({
					name: 'video',
					type: 'object',
					fields: [
						defineField({
							name: 'title',
							type: 'string',
							validation: (Rule) => Rule.required(),
						}),
						defineField({
							name: 'url',
							type: 'url',
							validation: (Rule) =>
								Rule.required().custom(
									(value) =>
										!value ||
										youtubePattern.test(value) ||
										'Enter a full YouTube URL.',
								),
						}),
						defineField({ name: 'description', type: 'text', rows: 2 }),
					],
					preview: { select: { title: 'title', subtitle: 'description' } },
				}),
			],
		}),
	],
	preview: { select: { title: 'title', subtitle: 'description' } },
})
