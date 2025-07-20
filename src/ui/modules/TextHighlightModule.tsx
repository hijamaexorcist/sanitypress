type Props = {
  pretitle?: string
  text: string
  alignment?: 'left' | 'center' | 'right'
}

export default function TextHighlightModule({ pretitle, text, alignment = 'center' }: Props) {
  return (
    <section className="py-12 px-6">
      <div className={`text-${alignment}`}>
        {pretitle && <p className="text-sm uppercase text-gray-500 mb-2">{pretitle}</p>}
				<blockquote
  className={`text-xl md:text-2xl italic font-semibold text-gray-800 max-w-3xl mx-auto text-${alignment}`}
>
  “{text}”
</blockquote>

      </div>
    </section>
  )
}
