# Bynk site theme

The Bynk brand for [Starlight](https://starlight.astro.build) sites, as one
package: the docs site at [bynk-lang.org](https://bynk-lang.org) and the
[blog](https://github.com/bynk-lang/blog) both use it, so they can no longer
drift apart.

It brings:

- **Design-system tokens.** Every colour, type, spacing, radius and shadow token
  of the Bynk Playground design system, as `--bynk-*` custom properties, in a
  dark and a light theme.
- **Starlight, dressed in them.** Starlight's colours, fonts and a few
  components (the current page, the primary button, quotations, focus rings)
  mapped onto the tokens.
- **The header and wordmark.** The bento-blocks mark with "Bynk." and the
  cross-site navigation, with the current section marked.
- **Fonts.** Instrument Sans for the interface, JetBrains Mono (with
  ligatures) for code.
- **Code.** The Bynk TextMate grammar, and dark and light code themes built
  from the design system's syntax colours.

The site follows the reader's light or dark setting. Starlight's theme menu
overrides it and remembers the choice.

## Install

The package is published to GitHub Packages, which needs a token even to
read. Tell npm where `@bynk-lang` packages live, in the site's `.npmrc`:

```ini
@bynk-lang:registry=https://npm.pkg.github.com
```

On your own machine, add a token with the `read:packages` scope to your
user-level `~/.npmrc` (never the project's):

```ini
//npm.pkg.github.com/:_authToken=YOUR_TOKEN
```

In GitHub Actions, give the job `packages: read` and pass the workflow's
token:

```yaml
permissions:
  contents: read
  packages: read
steps:
  - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v6
    with:
      node-version: 22
      registry-url: https://npm.pkg.github.com
      scope: "@bynk-lang"
  - run: npm ci
    env:
      NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

A repository outside the `bynk-lang` organisation also needs read access to
the package, granted in the package's settings on GitHub.

Then:

```bash
npm install @bynk-lang/site-theme
```

## Use

Add the plugin to Starlight:

```js
// astro.config.mjs
import starlight from "@astrojs/starlight";
import bynkSiteTheme from "@bynk-lang/site-theme";

export default defineConfig({
  integrations: [
    starlight({
      title: "Bynk",
      plugins: [bynkSiteTheme()],
    }),
  ],
});
```

A site built and previewed on its own, like the blog, makes the header's links
absolute:

```js
plugins: [bynkSiteTheme({ origin: "https://bynk-lang.org" })],
```

| Option | Default | What it does |
|---|---|---|
| `origin` | none | Prefixes the header's cross-site links, so they work from another host |
| `titleHref` | the site's home | Where the wordmark links |

### What the site keeps

The plugin adds to a site's configuration and never replaces what the site
sets itself:

- The theme's stylesheets go **before** the site's `customCss`, so a site's own
  rules win.
- A component the site overrides (`Header`, `Head`, `SiteTitle`) stays the
  site's.
- A `bynk` grammar the site registers is used instead of the theme's.
- Expressive Code `themes` and `styleOverrides` the site sets are kept.
- `expressiveCode: false` stays off.

A site that used to carry its own copies of the brand (`brand.css`,
`Head.astro`, `Header.astro`, the grammar) deletes them when it adopts the
theme.

### Using the tokens

Every token is a custom property, for a site's own components:

```css
.callout {
  background: var(--bynk-surface-panel);
  border: 1px solid var(--bynk-line);
  border-radius: var(--bynk-radius-md);
  color: var(--bynk-ink);
}
```

The rules of the system, briefly: one loud colour (`--bynk-brand`, amber)
fills only the primary action, and as text (`--bynk-brand-text`) marks the
current page. `--bynk-accent` (teal) is for links and success. `--bynk-danger`
always comes with a word or a cross. Panes are separated by 1px hairlines
(`--bynk-line`), not shadows; only floating layers use `--bynk-shadow-pop`.

## Where the tokens come from

`tokens/tokens.json` is a copy of the Bynk Playground design system's
tokens. Everything else is generated from it:

- `styles/tokens.css`
- `themes/bynk-dark.json`, `themes/bynk-light.json`

To take a change from the design system, replace `tokens/tokens.json`, then:

```bash
npm run generate
```

`grammars/bynk.tmLanguage.json` is a copy of the VS Code extension's grammar
([bynk-lang/vscode-bynk](https://github.com/bynk-lang/vscode-bynk),
`syntaxes/bynk.tmLanguage.json`). Refresh it when the grammar changes.

## Development

```bash
npm run check    # the generated files are up to date
npm test         # tokens, contrast in both themes, the header, the plugin
```

`fixture/` is a small Starlight site that uses the theme. CI packs the theme
and installs the tarball there, so the build tests what is actually
published. To do the same locally:

```bash
cd fixture
npm ci
(cd .. && npm pack --pack-destination fixture)
npm install --no-save ./bynk-lang-site-theme-*.tgz
npm run dev
```

## Releasing

1. Update `version` in `package.json` and add the release to `CHANGELOG.md`.
2. Merge to `main`.
3. Tag it: `git tag v0.1.0 && git push origin v0.1.0`.

The tag runs the publish workflow, which checks the tag matches the version,
runs the checks and publishes to GitHub Packages.

## Licence

Dual-licensed under [MIT](LICENSE-MIT) or [Apache-2.0](LICENSE-APACHE), at
your option, as Bynk is.
