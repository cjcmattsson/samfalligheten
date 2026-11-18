// Packs the demo build into one HTML page that can be shared as a Claude artifact.
// Usage: npm run build:demo -- <output.html>
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const output = process.argv[2];
if (!output) {
  console.error("Usage: npm run build:demo -- <output.html>");
  process.exit(1);
}

const dir = "dist-demo";
const html = readFileSync(join(dir, "index.html"), "utf8");
const asset = (pattern) => readFileSync(join(dir, html.match(pattern)[1]), "utf8");
const css = asset(/href="\/?(assets\/[^"]+\.css)"/);
// Keeps the inlined bundle from ending its own script tag early.
const js = asset(/src="\/?(assets\/[^"]+\.js)"/).replace(/<\/script/gi, "<\\/script");
const head = html.match(/<head>([\s\S]*?)<\/head>/)[1];
const title = head.match(/<title>[\s\S]*?<\/title>/)[0];
const themeScript = head.match(/<script>[\s\S]*?<\/script>/)[0];

writeFileSync(
  output,
  `${title}\n${themeScript}\n<style>${css}</style>\n<div id="root"></div>\n<script type="module">${js}</script>\n`,
);
console.log(`Wrote ${output}`);
