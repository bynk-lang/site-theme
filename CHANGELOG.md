# Changelog

## 0.4.0

Accessibility and one header for both sites, from the site review.

- **The page footer leaves `<main>`.** The theme now overrides `PageFrame`, and every page ends with a top-level `<footer>` (the `contentinfo` landmark) after `<main>`: the site map, then the strip with the mark and the licence. Starlight's own footer (edit link, previous and next) stays in `<main>`. The theme no longer overrides `Footer`, and `components/Footer.astro` is gone.
- **The site map moves into that footer**, on the pages the new **`siteMap`** option names (`["index"]` for the home page). A site that placed `<SiteMapFooter />` in a page removes it and sets the option instead.
- **Search says where each result is from.** The theme overrides `PageTitle` to label each page with its part of the site (Book, Examples, Reference, Blog or Project, from the new `sectionFor` in `nav.js`): a result's title reads "Book · Refined types", and the part is a `section` filter in Pagefind, so a search can be narrowed to one part. A site with its own `PageTitle` renders the theme's inside it.
- **One header on every site.**
  - A feed (`rss`) social link is no longer shown in the header. The feed is still announced in the `<head>`; a site links it in its pages.
  - With `titleHref` set to another site's home, the wordmark reads just "Bynk." and is named "Bynk, home", since that is where it goes.
  - The Playground link says, to screen readers, that it goes to another site.

## 0.3.2

- The site map's Project column gains **Roadmap** (`/project/versioning-and-roadmap/`), and **Contributing** moves to `/project/contributing/`: both pages left the Book for the docs site's Project pages (bynk-lang/bynk#4082).

## 0.3.1

- The site map's **Learn Bynk** link goes to `/book/tutorials/first-program/`: the Learn Bynk chapter files lost their numbers (bynk-lang/bynk#4077), and the old URL now only redirects.

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
