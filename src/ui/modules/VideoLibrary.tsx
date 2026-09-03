import moduleProps from '@/lib/moduleProps'
import { stegaClean } from 'next-sanity'
import { Play } from 'lucide-react'
import { Reveal, RevealItem, Stagger } from '@/ui/motion/Reveal'

function getYouTubeId(value?: string) {
	if (!value) return null
	try {
		const url = new URL(stegaClean(value))
		if (url.hostname === 'youtu.be')
			return url.pathname.split('/').filter(Boolean)[0] || null
		if (!url.hostname.endsWith('youtube.com')) return null
		return (
			url.searchParams.get('v') ||
			url.pathname.match(/^\/(?:shorts|embed)\/([A-Za-z0-9_-]+)/)?.[1] ||
			null
		)
	} catch {
		return null
	}
}

export default function VideoLibrary({
	pretitle,
	title,
	description,
	videos,
	...props
}: Sanity.VideoLibrary & Sanity.Module) {
	const validVideos = videos?.flatMap((video) => {
		const id = getYouTubeId(video.url)
		return id ? [{ ...video, id }] : []
	})
	if (!validVideos?.length) return null
	return (
		<section className="full-bleed bg-clinic-sage/42" {...moduleProps(props)}>
			<div className="section">
				<Reveal>
					<header className="grid gap-6 md:grid-cols-[minmax(0,0.8fr)_minmax(18rem,0.45fr)] md:items-end">
						<div>
							{pretitle && <p className="clinic-kicker">{pretitle}</p>}
							<h2 className="h2 mt-4 max-w-3xl text-balance">{title}</h2>
						</div>
						{description && (
							<p className="text-ink/68 max-w-lg leading-relaxed">
								{description}
							</p>
						)}
					</header>
				</Reveal>
				<Stagger
					className="mt-12 grid gap-6 md:grid-cols-2"
					delay={0.08}
					stagger={0.1}
				>
					{validVideos.map((video) => (
						<RevealItem key={video._key}>
							<article className="clinic-shell h-full p-1.5">
								<div className="clinic-core h-full overflow-hidden">
									<div className="bg-ink relative aspect-video">
										<iframe
											className="absolute inset-0 size-full"
											src={`https://www.youtube-nocookie.com/embed/${video.id}`}
											title={video.title}
											loading="lazy"
											allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share"
											referrerPolicy="strict-origin-when-cross-origin"
											allowFullScreen
										/>
									</div>
									<div className="p-6">
										<div className="text-clinic-clay flex items-center gap-3">
											<Play aria-hidden="true" className="size-4" />
											<span className="text-xs font-semibold tracking-[0.14em] uppercase">
												Watch
											</span>
										</div>
										<h3 className="h4 mt-4">{video.title}</h3>
										{video.description && (
											<p className="text-ink/65 mt-3 text-sm leading-relaxed">
												{video.description}
											</p>
										)}
									</div>
								</div>
							</article>
						</RevealItem>
					))}
				</Stagger>
			</div>
		</section>
	)
}
