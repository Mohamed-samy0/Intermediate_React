import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import { createElement as h } from "react";
import { renderToString } from "react-dom/server";
import App from "./src/App.js";
import { getShipment } from "./data/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "dist");

// The HTML template produced by `vite build` (has the placeholder + hashed script tag)
const template = readFileSync(path.join(distDir, "index.html"), "utf-8");
const shipmentCache = new Map();
const CACHE_TTL_MS = 30_000;
const CACHE_MAX_ITEMS = 100;

function escapeForScript(data) {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function renderHtmlPage({ shipment, userName = "Guest", message = null }) {
  const appHtml = shipment
    ? renderToString(h(App, { shipment, userName }))
    : renderToString(
        h(
          "div",
          null,
          h("h1", null, message || "Error"),
          h("p", null, `User: ${userName}`),
        ),
      );

  const payload = { shipment, userName, message };
  const serialized = escapeForScript(payload);

  return template
    .replace("<!--ssr-outlet-->", appHtml)
    .replace("</body>", `  <script>window.__INITIAL_DATA__ = ${serialized};</script>\n  </body>`);
}

async function getCachedShipment(trackingNumber) {
  const cached = shipmentCache.get(trackingNumber);

  if (!cached) {
    console.log("cache miss", trackingNumber);
    return null;
  }

  const age = Date.now() - cached.savedAt;
  if (age > CACHE_TTL_MS) {
    shipmentCache.delete(trackingNumber);
    console.log("cache expired", trackingNumber);
    return null;
  }

  shipmentCache.delete(trackingNumber);
  shipmentCache.set(trackingNumber, cached);
  console.log("cache hit", trackingNumber);
  return cached.shipment;
}

async function loadShipment(trackingNumber) {
  const cachedShipment = await getCachedShipment(trackingNumber);
  if (cachedShipment) {
    return cachedShipment;
  }

  const shipment = await getShipment(trackingNumber);
  shipmentCache.set(trackingNumber, { shipment, savedAt: Date.now() });

  if (shipmentCache.size > CACHE_MAX_ITEMS) {
    const oldestKey = shipmentCache.keys().next().value;
    shipmentCache.delete(oldestKey);
  }

  console.log("cache miss", trackingNumber);
  return shipment;
}

const app = Fastify({ logger: true });

// Serve the bundled client JS (/assets/...)
app.register(fastifyStatic, {
  root: path.join(distDir, "assets"),
  prefix: "/assets/",
});

app.get("/track/:trackingNumber", async (req, reply) => {
  const { trackingNumber } = req.params;
  const userName = String(req.headers["x-user"] ?? "Guest");

  if (!/^[A-Z]{3}-\d{4}$/.test(trackingNumber)) {
    const html = renderHtmlPage({
      userName,
      message: `Invalid tracking number format: ${trackingNumber}`,
    });
    return reply.status(400).type("text/html").send(html);
  }

  try {
    const shipment = await loadShipment(trackingNumber);

    if (!shipment) {
      const html = renderHtmlPage({
        userName,
        message: `Shipment not found: ${trackingNumber}`,
      });
      return reply.status(404).type("text/html").send(html);
    }

    const html = renderHtmlPage({ shipment, userName });
    return reply.type("text/html").send(html);
  } catch (error) {
    const html = renderHtmlPage({
      userName,
      message: "Internal server error",
    });

    return reply.status(500).type("text/html").send(html);
  }
});

app.get("/", async (req, reply) => {
  const userName = String(req.headers["x-user"] ?? "Guest");
  reply.type("text/html").send(`Hello ${userName}. Try /track/SWX-1001`);
});

app.listen({ port: 3000 }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
