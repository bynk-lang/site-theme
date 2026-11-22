// @ts-check
// The cross-site navigation shown in every Bynk site's header: one list, so
// the docs site and the blog can no longer drift apart.
//
// Paths are site-root-relative on bynk-lang.org. A site served from elsewhere
// during development or preview (the blog's own Pages project) sets the
// plugin's `origin` option, and the links become absolute.

/** @typedef {{ label: string, path?: string, href?: string, external?: boolean }} NavLink */

/** @type {NavLink[]} */
export const NAV_LINKS = [
  { label: "Book", path: "/book/" },
  { label: "By Example", path: "/by-example/" },
  { label: "Reference", path: "/reference/" },
  { label: "Blog", path: "/blog/" },
  { label: "Playground", href: "https://playground.bynk-lang.dev", external: true },
];

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
    href: l.href ?? `${origin.replace(/\/$/, "")}${l.path}`,
    external: Boolean(l.external),
    current: l === current,
  }));
}
