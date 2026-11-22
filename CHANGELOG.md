# Changelog

## 0.3.0

The site shell, as the site mockups draw it (bynk-lang/bynk#4025).

- **Header:**
  - The sections are Book, **Examples** (was By Example), Reference and Blog.
  - **Playground** leaves the sections for the right-hand group, as an external link with an ↗ mark.
  - Search sits on the right, after the sections. It is labelled **"Search docs and blog"**, and **`/`** opens it as well as Ctrl/⌘ K.
- **Footer:** every page ends with Starlight's footer and then a strip: the mark, "Bynk is pre-1.0 and evolving in small, spec-first increments." and the site's licence, from the new **`licence`** option.
- **Site map:** a new `SiteMapFooter.astro` component, with the home page's four columns: Learn, Examples, Reference and Project.
- **`nav.js`** exports `PLAYGROUND`, `SITE_MAP` and `siteMapFor`.

## 0.2.0

- The header's Reference link goes to `/reference/`, and Developer Docs leaves
  the header: bynk-lang.org now has one Reference surface, holding the
  language reference, the tooling (formerly Developer Docs), the diagnostics,
  the specification and the releases (bynk-lang/bynk#3935). The old paths
  redirect, so 0.1.0's links keep working.

## 0.1.0

The first release: the brand both Bynk sites carried as copies, as one
Starlight plugin.

- Design-system tokens as `--bynk-*` custom properties, dark and light,
  generated from the Bynk Playground design system.
- Starlight's colours, fonts and current-page, button, quotation and focus
  styles mapped onto the tokens. The indigo accent is retired: amber for the
  primary action and the current page, teal for links.
- The bento-blocks wordmark and the cross-site header navigation.
- Instrument Sans and JetBrains Mono.
- The Bynk grammar, and dark and light code themes from the design system's
  syntax colours.
- Follows the reader's light or dark setting.
