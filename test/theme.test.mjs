// The theme's checks: the generated files are current, every colour the
// design system promises to be readable is readable in both themes, the
// header marks the right section, and the plugin leaves a site's own settings
// alone.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { outputs, loadTokens, valueIn } from "../scripts/generate.mjs";
import { navFor, sectionFor, siteMapFor, SITE_MAP, PLAYGROUND } from "../nav.js";
import bynkSiteTheme, { bynkLanguage, SEARCH_LABEL } from "../index.js";

test("generated files are up to date", () => {
  for (const [file, text] of Object.entries(outputs())) {
    const current = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    assert.equal(current, text, `${file} is stale: run npm run generate`);
  }
});

const tokens = loadTokens();
const THEMES = tokens.color.themes.map((t) => t.id);
const colour = (name, theme) => {
  const token = tokens.color.tokens.find((t) => t.name === name);
  assert.ok(token, `no token ${name}`);
  return valueIn(token, theme);
};

test("every colour token has a value in every theme", () => {
  for (const t of tokens.color.tokens) {
    for (const theme of THEMES) {
      assert.match(valueIn(t, theme) ?? "", /^#[0-9a-f]{6}$/i, `${t.name} in ${theme}`);
    }
  }
});

/** WCAG 2 contrast ratio between two #rrggbb colours. */
function contrast(a, b) {
  const lum = (hex) => {
    const [r, g, bl] = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const SURFACES = ["surface-ground", "surface-panel", "surface-raised"];

for (const theme of THEMES) {
  test(`text is readable on every surface (${theme})`, () => {
    const text = ["ink", "ink-muted", "accent", "brand-text", "danger"];
    for (const fg of text) {
      for (const bg of SURFACES) {
        const ratio = contrast(colour(fg, theme), colour(bg, theme));
        assert.ok(ratio >= 4.5, `${fg} on ${bg}: ${ratio.toFixed(2)}:1, needs 4.5:1`);
      }
    }
  });

  test(`code colours are readable on the code pane (${theme})`, () => {
    for (const t of tokens.color.tokens.filter((t) => t.name.startsWith("syn-"))) {
      const ratio = contrast(valueIn(t, theme), colour("surface-panel", theme));
      assert.ok(ratio >= 4.5, `${t.name}: ${ratio.toFixed(2)}:1, needs 4.5:1`);
    }
  });

  test(`controls and the brand fill meet their contrast (${theme})`, () => {
    for (const bg of SURFACES) {
      const ratio = contrast(colour("line-strong", theme), colour(bg, theme));
      assert.ok(ratio >= 3, `line-strong on ${bg}: ${ratio.toFixed(2)}:1, needs 3:1`);
    }
    const onBrand = contrast(colour("on-brand", theme), colour("brand", theme));
    assert.ok(onBrand >= 4.5, `on-brand on brand: ${onBrand.toFixed(2)}:1`);
  });
}

test("the header marks the longest matching section", () => {
  const current = (path) => navFor(path).find((l) => l.current)?.label;
  assert.equal(current("/book/tutorials/first-program/"), "Book");
  assert.equal(current("/reference/types/"), "Reference");
  assert.equal(current("/reference/tooling/bynk-cli/"), "Reference");
  assert.equal(current("/blog/posts/money/"), "Blog");
  assert.equal(current("/"), undefined);
});

test("the header lists the three documentation surfaces, then the blog", () => {
  assert.deepEqual(
    navFor("/").map((l) => l.label),
    ["Book", "Examples", "Reference", "Blog"],
  );
  assert.equal(navFor("/").find((l) => l.label === "Reference")?.href, "/reference/");
  assert.equal(navFor("/by-example/snippets/opaque-type/").find((l) => l.current)?.label, "Examples");
});

test("the playground stands apart from the sections, as an external link", () => {
  assert.equal(PLAYGROUND.href, "https://playground.bynk-lang.dev");
  assert.equal(PLAYGROUND.external, true);
  assert.ok(!navFor("/").some((l) => l.label === "Playground"));
});

test("an origin makes the header's and the site map's links absolute", () => {
  const links = navFor("/blog/", { origin: "https://bynk-lang.org/" });
  assert.equal(links.find((l) => l.label === "Book")?.href, "https://bynk-lang.org/book/");
  const map = siteMapFor({ origin: "https://bynk-lang.org" }).flatMap((c) => c.links);
  assert.equal(map.find((l) => l.label === "Changelog")?.href, "https://bynk-lang.org/reference/releases/");
  assert.equal(map.find((l) => l.label === "Playground")?.href, "https://playground.bynk-lang.dev");
});

test("the site map has the mockup's four columns, each link a site path or an external URL", () => {
  assert.deepEqual(
    SITE_MAP.map((c) => c.title),
    ["Learn", "Examples", "Reference", "Project"],
  );
  for (const c of SITE_MAP) {
    for (const l of c.links) {
      assert.ok(
        (l.path && /^\/[a-z0-9/#._-]*$/.test(l.path) && !l.href) || (l.href?.startsWith("https://") && l.external),
        `${c.title} › ${l.label}`,
      );
    }
  }
});

/** Run the plugin's setup hook against a config; return what it set. */
function setup(config, options) {
  let updated;
  bynkSiteTheme(options).hooks["config:setup"]({
    config,
    updateConfig: (c) => (updated = c),
    addIntegration: () => {},
  });
  return updated;
}

test("the plugin adds its styles ahead of the site's own", () => {
  const { customCss } = setup({ customCss: ["./src/site.css"] });
  assert.deepEqual(customCss, [
    "@bynk-lang/site-theme/styles/tokens.css",
    "@bynk-lang/site-theme/styles/starlight.css",
    "./src/site.css",
  ]);
});

test("a site's own component overrides win", () => {
  const { components } = setup({ components: { Header: "./src/Header.astro" } });
  assert.equal(components.Header, "./src/Header.astro");
  assert.equal(components.Head, "@bynk-lang/site-theme/components/Head.astro");
});

test("a site's own bynk grammar and code themes are kept", () => {
  const own = { name: "bynk", scopeName: "source.bynk" };
  const { expressiveCode } = setup({
    expressiveCode: { themes: ["github-dark"], shiki: { langs: [own] } },
  });
  assert.deepEqual(expressiveCode.themes, ["github-dark"]);
  assert.deepEqual(expressiveCode.shiki.langs, [own]);
});

test("the bynk grammar is added when the site has none", () => {
  const { expressiveCode } = setup({});
  assert.equal(expressiveCode.shiki.langs[0], bynkLanguage);
  assert.equal(expressiveCode.styleOverrides.frames.frameBoxShadowCssValue, "none");
});

test("expressiveCode: false stays off", () => {
  assert.equal(setup({ expressiveCode: false }).expressiveCode, false);
});

test("the theme frames the page, so its footer sits outside <main>, unless the site has its own", () => {
  const { components } = setup({});
  assert.equal(components.PageFrame, "@bynk-lang/site-theme/components/PageFrame.astro");
  assert.equal(components.Footer, undefined, "Starlight's own footer (edit link, pagination) stays in <main>");
  assert.equal(
    setup({ components: { PageFrame: "./src/PageFrame.astro" } }).components.PageFrame,
    "./src/PageFrame.astro",
  );
});

test("the theme labels each page's search result with its part of the site", () => {
  assert.equal(setup({}).components.PageTitle, "@bynk-lang/site-theme/components/PageTitle.astro");
  assert.equal(sectionFor("/book/tutorials/first-program/"), "Book");
  assert.equal(sectionFor("/by-example/snippets/opaque-type/"), "Examples");
  assert.equal(sectionFor("/reference/diagnostics/bynk.types.mismatch/"), "Reference");
  assert.equal(sectionFor("/blog/posts/money/"), "Blog");
  assert.equal(sectionFor("/project/contributing/"), "Project");
  assert.equal(sectionFor("/"), undefined);
});

test("the plugin passes the site map's pages to its components", () => {
  let config;
  bynkSiteTheme({ siteMap: ["index"] }).hooks["config:setup"]({
    config: {},
    updateConfig: () => {},
    addIntegration: (i) =>
      i.hooks["astro:config:setup"]({
        updateConfig: ({ vite }) => {
          const [plugin] = vite.plugins;
          const source = plugin.load(plugin.resolveId("virtual:bynk-site-theme/config"));
          config = JSON.parse(source.replace(/^export default |;$/g, ""));
        },
      }),
  });
  assert.deepEqual(config.siteMap, ["index"]);
  assert.equal(config.titleHref, null);
});

test("the search button says it covers both sites", () => {
  let injected;
  bynkSiteTheme().hooks["i18n:setup"]({ injectTranslations: (t) => (injected = t) });
  assert.equal(injected, SEARCH_LABEL);
  assert.equal(injected["en-GB"]["search.label"], "Search docs and blog");
  assert.equal(injected.en["search.label"], "Search docs and blog");
});

test("the Project column links the roadmap and contributing pages under /project/", () => {
  const project = SITE_MAP.find((c) => c.title === "Project");
  assert.deepEqual(
    project.links.map((l) => [l.label, l.path ?? l.href]),
    [
      ["Blog", "/blog/"],
      ["GitHub", "https://github.com/bynk-lang/bynk"],
      ["Changelog", "/reference/releases/"],
      ["Roadmap", "/project/versioning-and-roadmap/"],
      ["Contributing", "/project/contributing/"],
    ],
  );
});

test("the grammar highlights a field's `replaces` clause, and only there", async () => {
  const { readFile } = await import("node:fs/promises");
  const grammar = JSON.parse(await readFile(new URL("../grammars/bynk.tmLanguage.json", import.meta.url), "utf8"));
  const rules = [];
  const walk = (node) => {
    if (Array.isArray(node)) node.forEach(walk);
    else if (node && typeof node === "object") {
      if (typeof node.match === "string" && node.match.includes("replaces")) rules.push(new RegExp(node.match));
      Object.values(node).forEach(walk);
    }
  };
  walk(grammar);
  const highlighted = (line) => rules.some((re) => re.test(line));
  for (const line of [
    "\tdisplayName: String replaces name,",
    "\tage: Int replaces years = 18,",
    "\tnickname: Option[String] replaces handle",
    "\tstore seen: Cell[Int] replaces visited",
    "\tstore seen: Cell[Int] replaces visited // renamed in 0.9",
    "type P = { size: Int replaces width }",
    "agent Learner replaces Student {",
  ]) {
    assert.ok(highlighted(line), `expected \`replaces\` to be a keyword in: ${line}`);
  }
  for (const line of ["let replaces = 1", "fn replaces(x: Int) -> Int { x }", "replaces.count()"]) {
    assert.ok(!highlighted(line), `expected \`replaces\` to stay an identifier in: ${line}`);
  }
});
