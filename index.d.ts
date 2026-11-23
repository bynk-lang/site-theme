import type { StarlightPlugin } from "@astrojs/starlight/types";

export interface BynkSiteThemeOptions {
  /**
   * Make the header's cross-site links absolute, on this origin. Leave it
   * unset on bynk-lang.org itself; set it to `"https://bynk-lang.org"` for a
   * site built and previewed on its own, such as the blog.
   */
  origin?: string;
  /**
   * Where the wordmark links. Defaults to the site's own home page, and the
   * wordmark then shows the rest of the site's title ("Bynk Blog" → "Blog").
   * Set it to another site's home and the wordmark reads just "Bynk.".
   */
  titleHref?: string;
  /**
   * The licence line at the end of every page, as parts joined with " · ",
   * each linking to its licence file. The docs site and the blog license
   * differently, so each says its own.
   */
  licence?: { label: string; href?: string }[];
  /**
   * The pages whose footer carries the site map, by content entry id
   * (`"index"` for the home page). Defaults to none.
   */
  siteMap?: string[];
}

/** The Bynk site theme, as a Starlight plugin. */
export default function bynkSiteTheme(options?: BynkSiteThemeOptions): StarlightPlugin;

/** The Bynk TextMate grammar, ready for Shiki (`name: "bynk"`). */
export const bynkLanguage: Record<string, unknown>;

/** The search button's label, as injected for each English locale. */
export const SEARCH_LABEL: Record<string, Record<string, string>>;

/** The dark and light code themes, generated from the design system. */
export const codeThemes: Record<string, unknown>[];
