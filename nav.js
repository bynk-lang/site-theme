// @ts-check
// The cross-site navigation every Bynk site shows: the header's sections and
// the home page's site map. One list, so the docs site and the blog can no
// longer drift apart.
//
// Paths are site-root-relative on bynk-lang.org. A site served from elsewhere
// during development or preview (the blog's own Pages project) sets the
// plugin's `origin` option, and the links become absolute.

/** @typedef {{ label: string, path?: string, href?: string, external?: boolean }} NavLink */

/** The header's sections, in order. */
/** @type {NavLink[]} */
export const NAV_LINKS = [
  { label: "Book", path: "/book/" },
  { label: "Examples", path: "/by-example/" },
  { label: "Reference", path: "/reference/" },
  { label: "Blog", path: "/blog/" },
];

/** The playground: another site, not a section, so it sits apart from the
 *  sections, with an external-link mark. */
export const PLAYGROUND = { label: "Playground", href: "https://playground.bynk-lang.dev", external: true };

/** The site map's columns, as the home page's footer shows them. */
/** @type {{ title: string, links: NavLink[] }[]} */
export const SITE_MAP = [
  {
    title: "Learn",
    links: [
      { label: "Getting started", path: "/book/introduction/what-is-bynk/" },
      { label: "Learn Bynk", path: "/book/tutorials/first-program/" },
      { label: "Guides", path: "/book/guides/" },
      { label: "Coming from TypeScript", path: "/book/introduction/coming-from-typescript/" },
    ],
  },
  {
    title: "Examples",
    links: [
      { label: "Snippets", path: "/by-example/#snippets" },
      { label: "Projects", path: "/by-example/#projects" },
      PLAYGROUND,
    ],
  },
  {
    title: "Reference",
    links: [
      { label: "Language", path: "/reference/" },
      { label: "Tooling and CLI", path: "/reference/tooling/" },
      { label: "Diagnostics", path: "/reference/diagnostics/" },
      { label: "Specification", path: "/reference/spec/" },
    ],
  },
  {
    title: "Project",
    links: [
      { label: "Blog", path: "/blog/" },
      { label: "GitHub", href: "https://github.com/bynk-lang/bynk", external: true },
      { label: "Changelog", path: "/reference/releases/" },
      { label: "Roadmap", path: "/project/versioning-and-roadmap/" },
      { label: "Contributing", path: "/project/contributing/" },
    ],
  },
];

/** A link's href, absolute on `origin` when one is given. */
const hrefOf = (/** @type {NavLink} */ l, /** @type {string} */ origin) =>
  l.href ?? `${origin.replace(/\/$/, "")}${l.path}`;

/**
 * The header's links for a page, each with its href and whether it marks the
 * current section: the link whose path is the longest prefix of the page's
 * path, so a page under /blog/posts/ marks Blog, and /reference/ marks
 * Reference.
 *
 * @param {string} pathname the page's path, including any base (`/blog/...`)
 * @param {{ origin?: string }} [options]
 */
export function navFor(pathname, { origin = "" } = {}) {
  const current = NAV_LINKS.filter((l) => l.path && pathname.startsWith(l.path)).reduce(
    (best, l) => (!best || (l.path?.length ?? 0) > (best.path?.length ?? 0) ? l : best),
    /** @type {NavLink | undefined} */ (undefined),
  );
  return NAV_LINKS.map((l) => ({
    label: l.label,
    href: hrefOf(l, origin),
    external: Boolean(l.external),
    current: l === current,
  }));
}

/**
 * The site map's columns with each link's href.
 *
 * @param {{ origin?: string }} [options]
 */
export function siteMapFor({ origin = "" } = {}) {
  return SITE_MAP.map((c) => ({
    title: c.title,
    links: c.links.map((l) => ({ label: l.label, href: hrefOf(l, origin), external: Boolean(l.external) })),
  }));
}
