import { stegaClean } from 'next-sanity'

export default function ({
	_type,
	options,
	_key,
	'data-sanity': dataSanity,
}: Partial<Sanity.Module> & { 'data-sanity'?: string }) {
	return {
		id: stegaClean(options?.uid) || 'module-' + _key,
		'data-module': _type,
		'data-sanity': dataSanity,
		hidden: options?.hidden,
	}
}
