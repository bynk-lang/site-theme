// @ts-check
// A small Starlight site that uses the theme, built in CI so a change that
// breaks a consuming site fails here first.
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import bynkSiteTheme from "@bynk-lang/site-theme";

export default defineConfig({
  integrations: [
    starlight({
      title: "Bynk",
      plugins: [
        bynkSiteTheme({
          licence: [
            { label: "Docs CC BY 4.0", href: "https://creativecommons.org/licenses/by/4.0/" },
            { label: "Bynk MIT or Apache-2.0" },
          ],
        }),
      ],
      social: [{ icon: "github", label: "GitHub", href: "https://github.com/bynk-lang/site-theme" }],
      sidebar: [
        { label: "Book", items: [{ label: "A chapter", link: "/book/chapter/" }] },
        { label: "Reference", items: [{ label: "Refined types", link: "/book/reference/refined-types/" }] },
      ],
    }),
  ],
});
