## Scope and Rules
- Implement the provided animation for the intro text exactly as specified
- Keep class names, CSS values, and JavaScript logic character-for-character
- Do not refactor or optimize; use the exact hex codes and media queries

## Dependencies
- Confirm `gsap` and `lenis` are installed; if not, run `npm install gsap lenis`

## CSS Integration
- Create `src/styles/about-animation.css`
- Paste the CSS EXACTLY as provided (including the font `@import` line and media queries)
- Import this CSS where the section is rendered (or globally via `app/globals.css`)

## HTML Structure in React
- In `src/app/page.js`, add the EXACT markup for the section (converted only to `className` for React):
  - `<section class="about about-animation anime-text-container"> ... </section>`
  - Keep the nested `about-copy-container`, `about-animated-text`, and both `<p>` blocks exactly as provided
- Place this section in the “intro” area (replacing or immediately before the current intro paragraph) so it visually occupies the intro space

## JavaScript Initialization
- Create a client-side script file `public/anime-text.js` with the EXACT JS code provided
- Load it in `src/app/page.js` using Next.js `<Script>` (from `next/script`) so the DOMContentLoaded listener runs as-is and ScrollTrigger pins the section
  - Example: `<Script src="/anime-text.js" strategy="afterInteractive" />`

## Verification
- Start dev server and scroll the page:
  - Section pins and words fade/reveal with background highlight
  - Keywords show colored pills per classes: `vibrant|shape|interactive` → `#7a78ff`, `living|expression|storytelling` → `#fe6d38`, `clarity|intuitive|vision` → `#c6fe69`
  - Mobile media query applies smaller font and spacing

## Notes
- Only `class`→`className` is changed to satisfy React; all class strings and content remain EXACT
- The intro text block is replaced by the exact two `<p>` paragraphs from the spec for perfect fidelity

Please confirm to proceed. 