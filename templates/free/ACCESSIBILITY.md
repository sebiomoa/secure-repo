# Accessibility Policy

This repository must meet WCAG 2.1 Level AA standards. Treat accessibility requirements as **non-optional**.

## Agent Rules (MUST FOLLOW)

- **Semantic HTML first**
  - Use `<button>` for actions, `<a>` for navigation, `<nav>`, `<main>`, `<header>`, `<footer>`, `<section>`, `<article>` for structure.
  - Never use `<div>` or `<span>` for interactive elements. If it's clickable, it must be a `<button>` or `<a>`.
  - Use heading hierarchy (`h1` > `h2` > `h3`) — never skip levels.

- **All images must have alt text**
  - Informative images: describe the content (`alt="Bar chart showing 40% growth in Q3"`).
  - Decorative images: use empty alt (`alt=""`) or CSS background.
  - Never use `alt="image"`, `alt="photo"`, or `alt="icon"`.

- **All form inputs must have labels**
  - Use `<label htmlFor="id">` or `aria-label` / `aria-labelledby`.
  - Never use placeholder text as the only label.
  - Error messages must be associated with their input via `aria-describedby`.

- **Keyboard navigation is mandatory**
  - Every interactive element must be reachable and operable with keyboard only (Tab, Enter, Escape, Arrow keys).
  - Focus order must follow visual reading order.
  - Never remove `:focus` or `:focus-visible` outlines without providing a visible alternative.
  - Modal dialogs must trap focus and return focus on close.

- **Color is never the only indicator**
  - Error states, status indicators, and required fields must use text, icons, or patterns in addition to color.
  - Maintain minimum contrast ratios:
    - Normal text: 4.5:1 against background.
    - Large text (18px+ bold or 24px+): 3:1 against background.
    - UI components and icons: 3:1 against adjacent colors.

- **Font sizes and readability**
  - Minimum body text: 16px (1rem). Never go below 14px for any readable text.
  - Use relative units (`rem`, `em`) not fixed `px` for font sizes — allows user browser zoom and font size preferences.
  - Line height: minimum 1.5 for body text, 1.2 for headings.
  - Paragraph max-width: 65–75 characters for comfortable reading.
  - Never disable user text scaling — do not set `maximum-scale=1` in viewport meta.
  - Touch targets: minimum 44x44px for buttons and links on mobile.

- **ARIA usage**
  - Prefer native HTML elements over ARIA. ARIA is a last resort, not a first choice.
  - If you use ARIA: `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-live`, `aria-expanded`, `aria-hidden`.
  - Never use `aria-hidden="true"` on focusable elements.
  - Dynamic content updates must use `aria-live="polite"` or `aria-live="assertive"`.

- **Motion and animation**
  - Respect `prefers-reduced-motion`. Wrap animations in `@media (prefers-reduced-motion: no-preference)`.
  - Never auto-play video or audio without user consent.
  - Avoid flashing content (no more than 3 flashes per second).

## Required Checks Before Merge

- **Keyboard test**
  - Tab through every interactive element on the page.
  - Verify focus is visible, logical, and never trapped (except in modals).

- **Screen reader test**
  - Headings, landmarks, form labels, and alt text must be announced correctly.
  - Dynamic updates (toasts, errors, loading states) must be announced via `aria-live`.

- **Color contrast check**
  - Run a contrast checker on all text and interactive elements.
  - Verify no information is conveyed by color alone.

- **Zoom test**
  - Page must be usable at 200% browser zoom with no content loss or overlap.

## Patterns To Use

- **Skip navigation link**
  - Add a "Skip to main content" link as the first focusable element.
  - `<a href="#main" className="sr-only focus:not-sr-only">Skip to main content</a>`

- **Loading states**
  - Use `aria-busy="true"` on containers that are loading.
  - Announce completion with `aria-live="polite"`.

- **Error handling in forms**
  - Show error summary at the top of the form.
  - Link each error to its field with `aria-describedby`.
  - Move focus to the first error field or the error summary.

- **Icon buttons**
  - Every icon-only button must have `aria-label`.
  - Example: `<button aria-label="Close dialog"><XIcon /></button>`

- **Tables**
  - Use `<th scope="col">` for column headers and `<th scope="row">` for row headers.
  - Use `<caption>` to describe the table's purpose.

## Testing Tools

- axe DevTools (browser extension)
- Lighthouse accessibility audit
- VoiceOver (macOS) / NVDA (Windows) for screen reader testing
- `prefers-reduced-motion` emulation in DevTools
