# Review guidelines for the Bynk site theme

These are the maintainers' notes for reviewing a pull request here. The site
theme is one npm package, `@bynk-lang/site-theme`, that gives every Bynk
Starlight site the same brand: the design-system tokens, Starlight dressed in
them, the shared header, footer and site map, the fonts, and the Bynk grammar
and code themes. The docs site at bynk-lang.org and the blog both install it,
so a change here reaches every page of both, and a mistake can break a site
that didn't change.

Skip what CI already enforces: `npm run check` (the generated files are up to
date), `npm test` (tokens, contrast in both themes, the header, search
sections, the site map, the plugin), and the fixture site built from the
packed package.

## What matters most

- **What a site keeps.** The plugin adds to a site's configuration and never
  replaces what the site sets itself, as the README's "What the site keeps"
  lists: the theme's stylesheets go before the site's `customCss`; a
  component the site overrides stays the site's; a site's own UI strings, its
  `bynk` grammar and its Expressive Code settings win; `expressiveCode: false`
  stays off. Flag a change that overrides any of these, or adds a new
  override without the same care.
- **Consumers and versions.** The package is published from a tag, and the
  sites pin a version. A change a site must act on (an option renamed or
  removed, a component no longer overridden, a class or token renamed, markup
  a site's CSS might target) is breaking: while the version is 0.x, it's the
  next minor version, and the CHANGELOG says what a site must do. Flag a
  breaking change that's missing from the CHANGELOG or slipped into a patch.
- **What gets published.** Only the paths in `package.json`'s `files` and
  `exports` reach a site. Flag a new file a site needs that isn't in both.
- **Accessibility.** The shell is on every page of both sites:
  - landmarks stay right (the page's `<footer>` after `<main>`, one
    `<header>`);
  - every control works from the keyboard and has an accessible name,
    including the search shortcuts and the theme menu;
  - a link that leaves the site says so to screen readers;
  - text and focus rings keep their contrast in both themes, which the tests
    check for the tokens they know.
- **Both themes.** Every colour comes from a `--bynk-*` token, with a dark
  value on `:root` and a light one under `[data-theme="light"]`. Flag a
  hard-coded colour, or a rule that works in only one theme.

## Generated and copied files

- `styles/tokens.css` and `themes/bynk-*.json` are generated from
  `tokens/tokens.json` by `npm run generate`. A change belongs in the tokens or
  the generator, never in the generated files by hand.
- `tokens/tokens.json` is a copy of the Bynk Playground design system's tokens,
  and `grammars/bynk.tmLanguage.json` a copy of bynk-lang/vscode-bynk's
  grammar. A change to either should come from its source, and the pull
  request should say which version it copies.

## The shared navigation

`nav.js` holds the header's sections, the site map's links and `sectionFor`,
which labels search results. Both sites read it, so a link must exist on the
site it points to, and a page's section must match where it sits. Flag a link
to a page that has moved, or a section that no longer matches the header.

## Tests

- A change of behaviour comes with a test in `test/`, and a change to what a
  site sees is visible in the fixture site.
- Look for missing cases: a site that overrides the component being changed,
  a site with its own `customCss` or grammar, `origin` and `titleHref` set and
  unset, and the light theme.

## Documentation and style

- The README documents every option, what the shell shows and what a site
  keeps. A new or changed option updates its table, and every release has its
  CHANGELOG entry and `version`, as the README's "Releasing" describes.
- British English in comments, the README, the CHANGELOG and every string a
  reader sees ("colour", "behaviour", "licence" as a noun), except names an
  API fixes, such as CSS's `color`.
- Comments explain why, in plain sentences, and name the issue behind them.

## Severity here

- **Blocking:** a change that overrides what a site keeps, an accessibility
  regression in the shell, a breaking change without a new minor version and
  a CHANGELOG entry, a file a site needs that isn't published, or a generated
  file edited by hand.
- **Should fix:** a hard-coded colour or a rule for one theme only, a missing
  test, a stale link in `nav.js`, a copied file changed without its source, or
  the README out of step with the code.
- **Nit:** wording, naming and small style points. Keep these few.
