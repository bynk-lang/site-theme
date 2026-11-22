// The theme's checks: the generated files are current, every colour the
// design system promises to be readable is readable in both themes, the
// header marks the right section, and the plugin leaves a site's own settings
// alone.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { outputs, loadTokens, valueIn } from "../scripts/generate.mjs";
import { navFor } from "../nav.js";
import bynkSiteTheme, { bynkLanguage } from "../index.js";

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
  assert.equal(current("/book/tutorials/01-first-program/"), "Book");
  assert.equal(current("/reference/types/"), "Reference");
  assert.equal(current("/reference/tooling/bynk-cli/"), "Reference");
  assert.equal(current("/blog/posts/money/"), "Blog");
  assert.equal(current("/"), undefined);
});

test("the header lists the three documentation surfaces, then the blog and playground", () => {
  assert.deepEqual(
    navFor("/").map((l) => l.label),
    ["Book", "By Example", "Reference", "Blog", "Playground"],
  );
  assert.equal(navFor("/").find((l) => l.label === "Reference")?.href, "/reference/");
});

test("an origin makes the header's links absolute", () => {
  const links = navFor("/blog/", { origin: "https://bynk-lang.org/" });
  assert.equal(links.find((l) => l.label === "Book")?.href, "https://bynk-lang.org/book/");
  assert.equal(links.find((l) => l.label === "Playground")?.href, "https://playground.bynk-lang.dev");
});

/** Run the plugin's setup hook against a config; return what it set. */
function setup(config) {
  let updated;
  bynkSiteTheme().hooks["config:setup"]({
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
