import { getSite } from '@/sanity/lib/queries'
import CTA from '@/ui/CTA'
import { stegaClean } from 'next-sanity'

export default async function Menu() {
	const { footerMenu } = await getSite()

	return (
		<nav className="flex flex-wrap items-start gap-x-12 gap-y-6 max-sm:flex-col">
			{footerMenu?.items?.map((item, key) => {
				switch (item._type) {
					case 'link':
						return (
							<CTA
								className="hover:link inline-flex min-h-11 items-center"
								link={item}
								key={key}
							/>
						)

					case 'link.list':
						return (
							<div className="space-y-2 text-start" key={key}>
								<div className="technical text-footer-ink/50 text-xs">
									<CTA link={item.link}>
										{stegaClean(item.link?.label) || item.link?.internal?.title}
									</CTA>
								</div>

								<ul>
									{item.links?.map((link, key) => (
										<li key={key}>
											<CTA
												className="inline-flex min-h-11 items-center hover:underline"
												link={link}
											/>
										</li>
									))}
								</ul>
							</div>
						)

					default:
						return null
				}
			})}
		</nav>
	)
}
