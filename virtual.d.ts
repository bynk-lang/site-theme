declare module "virtual:bynk-site-theme/config" {
  const config: {
    /** Prefix for the header's cross-site links; empty on bynk-lang.org. */
    origin: string;
    /** Where the wordmark links; null for the site's own home page. */
    titleHref: string | null;
    /** The licence line's parts; empty for none. */
    licence: { label: string; href?: string }[];
  };
  export default config;
}
