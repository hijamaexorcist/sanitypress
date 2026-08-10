import sanityStudioModule from '@sanity/eslint-config-studio'

const sanityStudio = sanityStudioModule.default ?? sanityStudioModule

export default [
	{
		ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'],
	},
	...sanityStudio,
]
