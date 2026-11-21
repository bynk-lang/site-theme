// @ts-check
//! Generate the theme's derived files from `tokens/tokens.json`, the Bynk
//! Playground design system's tokens:
//!
//!   styles/tokens.css       every token as a `--bynk-*` custom property, dark on
//!                           `:root`, light under `[data-theme="light"]`
//!   themes/bynk-dark.json   code-highlighting themes (VS Code format, which
//!   themes/bynk-light.json  Expressive Code reads) from the `syn-*` tokens
//!
//!   node scripts/generate.mjs           regenerate
//!   node scripts/generate.mjs --check   fail (non-zero) if a file is out of date
//!
//! The generated files are committed, so consumers import them with no build
//! step. CI runs `--check`, so a token edit that isn't regenerated fails.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(path.join(ROOT, p), "utf8");

/** @typedef {{ name: string, value: string | Record<string, string>, usage?: string }} Token */

export function loadTokens() {
  return JSON.parse(read("tokens/tokens.json"));
}

/** A token's value in one theme (a plain string applies to both). */
export function valueIn(/** @type {Token} */ token, /** @type {string} */ theme) {
  return typeof token.value === "string" ? token.value : token.value[theme];
}

const HEADER = (what) =>
  `/* GENERATED from tokens/tokens.json by scripts/generate.mjs: do not edit.\n * ${what} */\n`;

export function renderCss(tokens) {
  const colours = tokens.color.tokens;
  const shadows = tokens.shadow.tokens;
  const themed = [...colours, ...shadows];
  const decl = (theme) =>
    themed.map((t) => `  --bynk-${t.name}: ${valueIn(t, theme)};`).join("\n");

  const fonts = Object.entries(tokens.type.families).map(
    ([name, stack]) => `  --bynk-font-${name}: ${stack};`,
  );
  const styles = tokens.type.groups.flatMap((g) =>
    g.styles.flatMap((s) => [
      `  --bynk-text-${s.name}-size: ${s.fontSize};`,
      `  --bynk-text-${s.name}-line-height: ${s.lineHeight};`,
      `  --bynk-text-${s.name}-weight: ${s.fontWeight};`,
    ]),
  );
  const steps = [...tokens.spacing.tokens, ...tokens.radius.tokens].map(
    (t) => `  --bynk-${t.name}: ${t.value};`,
  );

  return (
    HEADER("Dark is the default; light applies under [data-theme=\"light\"], and to a page with no data-theme whose reader prefers light.") +
    `
:root {
  color-scheme: dark;
${decl("dark")}
${fonts.join("\n")}
${styles.join("\n")}
${steps.join("\n")}
}

:root[data-theme="light"] {
  color-scheme: light;
${decl("light")}
}

@media (prefers-color-scheme: light) {
  :root:not([data-theme]) {
    color-scheme: light;
${decl("light").replace(/^/gm, "  ")}
  }
}
`
  );
}

/** Scopes each `syn-*` token colours, in the Bynk grammar's names and the
 *  general names other languages' grammars use. */
const SCOPES = {
  "syn-keyword": ["keyword", "storage", "keyword.other.http-method"],
  "syn-type": ["entity.name.type", "support.type", "support.class", "entity.other.inherited-class"],
  "syn-string": ["string", "markup.inline.raw"],
  "syn-number": ["constant.numeric", "constant.language", "constant.character.escape"],
  "syn-comment": ["comment", "punctuation.definition.comment"],
  "syn-capability": ["entity.name.function.decorator", "support.function.predicate"],
};

export function renderCodeTheme(tokens, theme) {
  const byName = Object.fromEntries(tokens.color.tokens.map((t) => [t.name, valueIn(t, theme)]));
  return {
    $comment: "GENERATED from tokens/tokens.json by scripts/generate.mjs: do not edit.",
    name: `bynk-${theme}`,
    type: theme,
    colors: {
      "editor.background": byName["surface-panel"],
      "editor.foreground": byName["ink"],
      "editor.selectionBackground": byName["line"],
      "editorLineNumber.foreground": byName["line-strong"],
      "editorGroupHeader.tabsBackground": byName["surface-ground"],
      "tab.activeBackground": byName["surface-panel"],
      "tab.activeForeground": byName["ink"],
      "tab.inactiveForeground": byName["ink-muted"],
      "tab.activeBorderTop": byName["brand-text"],
      "titleBar.border": byName["line"],
      "terminal.background": byName["surface-panel"],
      "terminal.foreground": byName["ink"],
    },
    tokenColors: [
      { settings: { foreground: byName["ink"], background: byName["surface-panel"] } },
      ...Object.entries(SCOPES).map(([token, scope]) => ({
        name: token,
        scope,
        settings: { foreground: byName[token] },
      })),
      {
        name: "documentation comments",
        scope: ["comment.block.documentation", "comment.line.documentation"],
        settings: { fontStyle: "italic" },
      },
    ],
  };
}

export function outputs() {
  const tokens = loadTokens();
  return {
    "styles/tokens.css": renderCss(tokens),
    "themes/bynk-dark.json": JSON.stringify(renderCodeTheme(tokens, "dark"), null, 2) + "\n",
    "themes/bynk-light.json": JSON.stringify(renderCodeTheme(tokens, "light"), null, 2) + "\n",
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const check = process.argv.includes("--check");
  let stale = [];
  for (const [file, text] of Object.entries(outputs())) {
    const target = path.join(ROOT, file);
    let current = null;
    try {
      current = readFileSync(target, "utf8");
    } catch {}
    if (current === text) continue;
    if (check) stale.push(file);
    else {
      mkdirSync(path.dirname(target), { recursive: true });
      writeFileSync(target, text);
      console.log(`wrote ${file}`);
    }
  }
  if (stale.length) {
    console.error(`Out of date: ${stale.join(", ")}. Run: node scripts/generate.mjs`);
    process.exit(1);
  }
}
