// @ts-check
// The Bynk site theme, as a Starlight plugin.
//
//   import bynkSiteTheme from "@bynk-lang/site-theme";
//   starlight({ plugins: [bynkSiteTheme()] })
//
// It adds the token and Starlight stylesheets ahead of the site's own CSS,
// overrides Head, Header and SiteTitle, and gives Expressive Code the Bynk
// grammar and the two code themes. Anything the site sets itself wins: a
// component the site overrides stays the site's, a `bynk` grammar the site
// registers is kept, and explicit Expressive Code themes are not replaced.

import darkTheme from "./themes/bynk-dark.json" with { type: "json" };
import lightTheme from "./themes/bynk-light.json" with { type: "json" };
import bynkGrammar from "./grammars/bynk.tmLanguage.json" with { type: "json" };

const PKG = "@bynk-lang/site-theme";
const VIRTUAL = "virtual:bynk-site-theme/config";

/** The Bynk grammar as Shiki takes it. A tagged multi-line string (`"""sql`)
 *  embeds that language's grammar, so those load with it. */
export const bynkLanguage = {
  ...bynkGrammar,
  name: "bynk",
  embeddedLangsLazy: ["sql", "json", "html", "css", "javascript"],
};

export const codeThemes = [darkTheme, lightTheme];

/**
 * @param {import("./index").BynkSiteThemeOptions} [options]
 * @returns {import("@astrojs/starlight/types").StarlightPlugin}
 */
export default function bynkSiteTheme(options = {}) {
  const themeConfig = {
    origin: options.origin ?? "",
    titleHref: options.titleHref ?? null,
  };

  return {
    name: PKG,
    hooks: {
      "config:setup"({ config, updateConfig, addIntegration }) {
        const userEc = config.expressiveCode;
        /** @type {any} */
        let expressiveCode = userEc;
        if (userEc !== false) {
          const ec = typeof userEc === "object" ? userEc : {};
          const langs = ec.shiki?.langs ?? [];
          const hasBynk = langs.some((/** @type {any} */ l) => typeof l === "object" && l?.name === "bynk");
          expressiveCode = {
            ...ec,
            themes: ec.themes ?? codeThemes,
            // Panes are separated by hairlines, not shadows.
            styleOverrides: {
              borderRadius: "0.5rem",
              ...ec.styleOverrides,
              frames: { frameBoxShadowCssValue: "none", ...ec.styleOverrides?.frames },
            },
            shiki: { ...ec.shiki, langs: hasBynk ? langs : [...langs, bynkLanguage] },
          };
        }

        updateConfig({
          customCss: [`${PKG}/styles/tokens.css`, `${PKG}/styles/starlight.css`, ...(config.customCss ?? [])],
          components: {
            Head: `${PKG}/components/Head.astro`,
            Header: `${PKG}/components/Header.astro`,
            SiteTitle: `${PKG}/components/SiteTitle.astro`,
            ...config.components,
          },
          expressiveCode,
        });

        addIntegration({
          name: `${PKG}/config`,
          hooks: {
            "astro:config:setup"({ updateConfig: updateAstroConfig }) {
              updateAstroConfig({
                vite: {
                  plugins: [
                    {
                      name: `${PKG}/config`,
                      resolveId(id) {
                        return id === VIRTUAL ? `\0${VIRTUAL}` : undefined;
                      },
                      load(id) {
                        return id === `\0${VIRTUAL}`
                          ? `export default ${JSON.stringify(themeConfig)};`
                          : undefined;
                      },
                    },
                  ],
                },
              });
            },
          },
        });
      },
    },
  };
}
