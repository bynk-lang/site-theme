import type { StarlightPlugin } from "@astrojs/starlight/types";

export interface BynkSiteThemeOptions {
  /**
   * Make the header's cross-site links absolute, on this origin. Leave it
   * unset on bynk-lang.org itself; set it to `"https://bynk-lang.org"` for a
   * site built and previewed on its own, such as the blog.
   */
  origin?: string;
  /**
   * Where the wordmark links. Defaults to the site's own home page.
   */
  titleHref?: string;
}

/** The Bynk site theme, as a Starlight plugin. */
export default function bynkSiteTheme(options?: BynkSiteThemeOptions): StarlightPlugin;

/** The Bynk TextMate grammar, ready for Shiki (`name: "bynk"`). */
export const bynkLanguage: Record<string, unknown>;

/** The dark and light code themes, generated from the design system. */
export const codeThemes: Record<string, unknown>[];
