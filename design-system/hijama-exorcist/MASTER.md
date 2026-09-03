# Hijama Exorcist — Design System

**Direction:** Quiet clinical ritual, expanded into a content-rich editorial experience.
**Design dials:** Variance 7/10 · Motion 4/10 · Density 6/10

## Brand character

The interface should feel private, grounded, contemporary, and recognisably connected to the Islamic tradition of Hijama. It is neither a sterile hospital portal nor a generic wellness spa. Content, treatment imagery, and carefully sourced religious context provide the visual authority.

## Palette

| Role           | Value     | Use                                      |
| -------------- | --------- | ---------------------------------------- |
| Mineral canvas | `#f5f4ed` | Primary reading surface                  |
| Deep emerald   | `#18352b` | Anchor sections, footer, primary actions |
| Olive ink      | `#23332b` | Text and navigation                      |
| Eucalyptus     | `#dbe6d8` | Informational surfaces                   |
| Warm mist      | `#e9ede6` | Supporting surfaces                      |
| Muted clay     | `#b96e52` | Small editorial and tradition accents    |
| Soft stone     | `#6f786f` | Secondary text                           |

Avoid cyan, neon colour, generic startup gradients, and decorative Islamic motifs.

## Typography

- Display: DM Serif Display for page statements, quotations, and section titles.
- Body: Instrument Sans for navigation, long-form copy, forms, and metadata.
- Headlines are expressive but readable, with tight tracking and balanced wrapping.
- Body copy stays near 60–70 characters per line.

## Composition

- Alternate mineral reading sections with deep-emerald anchor sections.
- Use asymmetric image-and-copy layouts and one mixed-size editorial bento per long page.
- Prefer a few large, meaningful treatment images to many decorative cards.
- Use soft tactile depth: nested shells, fine rings, inset highlights, and low-opacity shadows.
- Maintain a consistent max-width and alignment grid while varying section rhythm.
- Every section must answer a real visitor question or support booking.

## Components

- Detached rounded clinic navigation with a persistent booking action.
- Image-led editorial hero with one primary and one quiet secondary action.
- Tradition quotation panel with an external source and explicit context.
- Education bento for preparation, expectations, safety, and aftercare.
- Privacy-enhanced YouTube gallery with reserved aspect ratio and no autoplay.
- Editorial article cards with strong imagery, summaries, and visible dates.
- Calm process rail and closing booking invitation.

## Interaction and accessibility

- Minimum target size: 44px; body text: 16px or larger.
- Focus indicators use clay against light and dark surfaces.
- Hover shifts by at most 2px and never changes layout.
- Motion is subtle opacity/translate only and respects `prefers-reduced-motion`.
- Asymmetric layouts collapse to one column below 768px.
- Iframes and images reserve their aspect ratio to avoid layout shift.
- Selection, form focus, empty states, and browser-native controls look intentional.

## Content rules

- Present Hijama as a traditional practice found in Prophetic tradition, not a guaranteed cure.
- Separate religious sources from clinical evidence.
- Link quotations to their source and identify the collection/reference.
- Never invent credentials, testimonials, prices, locations, or outcomes.
- Explain evidence limitations and material risks plainly.
- Use non-graphic images of cups, preparation, consultation, hands, and calm care settings.

## Avoid

- Nested card grids inside card grids.
- Fake statistics, testimonials, or credentials.
- “Detox,” fertility, hormonal, mental-health, or cure claims.
- Gradient text, decorative blur, meaningless section numbering, and tiny eyebrow overload.
- Autoplay video, motion-heavy carousels, or blood/incision close-ups.
