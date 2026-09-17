const { readFileSync, writeFileSync } = require("node:fs");

const file = process.argv[2];
if (!file) {
  process.exit(0);
}

const original = readFileSync(file, "utf8");
const stripped = original
  .replace(/^Co-authored-by:\s*Cursor\s*<cursoragent@cursor\.com>\s*$/gim, "")
  .replace(/^Made-with:\s*Cursor\s*$/gim, "")
  .replace(/^Made with Cursor\s*$/gim, "")
  .replace(/\n{3,}/g, "\n\n")
  .replace(/[ \t]+\n/g, "\n");

if (stripped !== original) {
  writeFileSync(file, stripped);
}
