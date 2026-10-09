import fastifyStatic from "@fastify/static";
import fastify from "fastify";
import { readFileSync } from "fs";
import path, { dirname } from "path";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { fileURLToPath } from "url";
import App from "./App.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const shell = readFileSync(path.join(__dirname, "dist", "index.html"), "utf-8");

const app = fastify();

app.register(fastifyStatic, {
  root: path.join(__dirname, "dist"),
  prefix: "/",
});

const parts = shell.split("<!-- Root -->");

app.get("/", async (req, reply) => {
  reply.raw.write(parts[0]);
  const reactApp = renderToString(createElement(App));
  reply.raw.write(reactApp);
  reply.raw.write(parts[1]);
  reply.raw.end();
});

app.listen({ port: 3000 });
