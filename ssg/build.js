import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import App from "./App.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distPath = path.join(__dirname, "dist");

const shell = readFileSync(path.join(__dirname, "index.html"), "utf-8");

const app = renderToStaticMarkup(h(App));

const html = shell.replace("<!--Root-->", app);

// Create dist folder if it doesn't exist
if (!existsSync(distPath)) {
  mkdirSync(distPath);
} else {
  // Delete all files in dist folder if it exists
  const files = readdirSync(distPath);
  for (const file of files) {
    unlinkSync(path.join(distPath, file));
  }
}

writeFileSync(path.join(distPath, "index.html"), html);
