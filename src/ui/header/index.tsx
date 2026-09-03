import { getSite } from '@/sanity/lib/queries'
import Wrapper from './Wrapper'
import Link from 'next/link'
import { Img } from '@/ui/Img'
import Navigation from './Navigation'
import CTAList from '@/ui/CTAList'
import Toggle from './Toggle'
import { cn } from '@/lib/utils'
import css from './Header.module.css'

export default async function Header() {
	const { title, logo, ctas } = await getSite()

	const logoImage = logo?.image?.dark || logo?.image?.default

	return (
		<Wrapper className="sticky top-0 z-10 px-4 pt-4 md:px-8 md:pt-6">
			<div
				className={cn(
					css.header,
					'bg-canvas/92 ring-ink/8 mx-auto grid max-w-screen-xl items-center gap-x-6 rounded-full px-5 py-3 shadow-[0_16px_38px_rgb(35_51_43_/_0.08)] ring-1 backdrop-blur-lg md:px-7',
				)}
			>
				<div className="[grid-area:logo]">
					<Link
						className={cn(
							'inline-flex min-h-11 min-w-11 items-center font-serif text-2xl tracking-[-0.04em] md:text-3xl',
							logo?.image && 'max-w-3xs',
						)}
						href="/"
					>
						{logoImage ? (
							<Img
								className="inline-block max-h-[1.2em] w-auto"
								image={logoImage}
								alt={logo?.name || title}
							/>
						) : (
							<span>{title}</span>
						)}
					</Link>
				</div>

				<Navigation />

				<CTAList
					ctas={ctas}
					className="max-md:header-closed:hidden [grid-area:ctas] max-md:*:w-full md:ms-auto"
				/>

				<Toggle />
			</div>
		</Wrapper>
	)
}
