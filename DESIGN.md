# Hijama Clinic Design Direction

## Purpose

The website should help first-time visitors feel safe and informed while making regular Hijama clients feel immediately at home. It is a clinician-led health practice, not a software product, agency, or generic wellness brand. Booking is the primary conversion; educational content supports that decision.

## Design Character

**Quiet clinical ritual.** The experience combines the calm clarity of a considered clinic with the dignity and tradition of Hijama. It is measured rather than austere, warm without becoming spa-like, and contemporary without relying on SaaS conventions.

- **Tone:** grounded, private, reassuring, respectful, and practical.
- **Visual rhythm:** generous breathing space, editorial type hierarchy, asymmetrical image-and-copy compositions, and restrained information panels.
- **Avoid:** dashboards, metric grids, startup gradients, generic feature cards, oversized blog promotion, and decorative Islamic motifs.

## Design Tokens

The public interface will use a deliberately small palette and two type families.

| Token | Use |
| --- | --- |
| Mineral white | Primary background, calm and clinical rather than stark |
| Deep olive | Primary text, navigation, and calls to action |
| Eucalyptus | Secondary surfaces, clinician/process emphasis |
| Muted clay | Small editorial accents and Sunnah guidance |
| Soft charcoal | Supporting text and form labels |

- **Display type:** an expressive, highly readable serif for page titles and section statements.
- **Body type:** a humanist sans-serif for navigation, paragraphs, form controls, and metadata.
- **Shape:** softly squared, generous radii with a nested outer shell and inner content surface for important panels.
- **Motion:** gentle transform-and-opacity transitions using a spring-like cubic-bezier. Motion must respect reduced-motion preferences.

## Shared Components

1. **Clinic navigation** — a detached, compact navigation island with a persistent booking action. Mobile navigation becomes a focused full-screen menu.
2. **Primary action** — a deep-olive rounded button with a nested circular arrow control. Secondary actions stay text-led.
3. **Clinician profile** — portrait, name, credentials, and a concise approach statement. Portrait and copy are CMS replaceable, with an intentional image placeholder where unavailable.
4. **Treatment card** — image or treatment detail, brief indication, duration/price when supplied, and a booking link. These should not resemble pricing plans.
5. **Process rail** — three concise moments: consultation, treatment, aftercare. It answers first-time visitor questions without becoming a long explainer.
6. **Sunnah note** — a small contextual component for respectful hadith or Hijri guidance. It is secondary to clinical and consent information.
7. **Booking panel** — clear progressive sections, visible selected choices, accessible inputs, and a calm confirmation state.
8. **Article card** — quiet editorial support for blogs, subordinate to treatment and clinician content.

## Page Blueprint

### Home

The homepage carries the conversion journey.

1. **Hero:** clinician-led editorial split. The left introduces the care philosophy and offers one primary booking action. The right has a replaceable clinician or clinic image in a layered frame, with one short trust detail.
2. **Introduction:** a direct, brief explanation of Hijama and who the practice is for. No unsubstantiated health claims.
3. **Meet the clinician:** portrait, qualifications from Sanity, and an approachable short bio.
4. **Your session:** consultation, treatment, and aftercare as a calm three-step sequence.
5. **Treatments:** curated treatment choices that lead to booking instead of a feature grid.
6. **Sunnah guidance:** a modest, carefully worded bridge to booking dates and preparation.
7. **Closing booking invitation:** direct link to the booking page, with practical expectations rather than marketing language.

### Booking

Booking is the second-priority page and should feel simpler than a medical intake form.

1. Arrival statement with a clear promise: choose a treatment, date, and time; confirmation happens after the request.
2. Patient details using visible labels, useful input types, and accessible validation.
3. Session selection grouped around the appointment choice, not as a dense form wall.
4. Contextual Hijri date and Sunnah-day information after a date is selected.
5. Preparation, location, and deposit information presented as supporting, collapsible guidance.
6. Submission and error states that explain exactly what happens next.

### Treatment and Clinician Pages

Use a reading-first editorial layout: statement, relevant detail, supporting image, and a booking action. Reuse the clinician profile and treatment components so content is replaceable in Sanity.

### Contact

Keep contact functional and warm: location, practical contact options, and a short enquiry form. It should not compete with booking.

### Blog

Blog content remains available for education and search visibility. The archive uses an editorial list/card pattern, and post pages prioritise comfortable reading and a quiet appointment prompt near the end.

## Content and Safety Principles

- Use existing Sanity content and assets wherever they exist; all new visual assets must have replacement-friendly CMS fields or intentional placeholders.
- Mention the Sunnah in a respectful, supportive way. Do not turn every page into religious content or use it to imply medical efficacy.
- Do not add unsupported treatment outcomes, invented statistics, or testimonial claims.
- Make the clinician and the treatment process the strongest trust signals.

## Accessibility and Responsiveness

- Body text remains 16px or larger; actions and form controls meet 44px minimum targets.
- Every input has a persistent visible label and clear error messaging.
- All interactive elements receive visible keyboard focus and reduced-motion handling.
- Editorial/asymmetric layouts collapse to a single column below 768px; no overlapping content remains on mobile.
- Images provide meaningful alternative text; decorative visuals are excluded from screen readers.

## Implementation Sequence

1. Establish the shared public design tokens, typography, navigation, action styles, and image treatment.
2. Create a clinic-focused home composition and CMS-compatible modules.
3. Refactor the booking module into accessible, progressive sections while retaining its existing submission contract, Hijri calculations, reCAPTCHA support, and Sanity schema.
4. Apply the shared system to treatment, clinician, contact, and blog modules.
5. Validate mobile layout, keyboard interaction, reduced motion, type checking, linting, and production build.
