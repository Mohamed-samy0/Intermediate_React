const path = require("node:path");
const { readFileSync } = require("node:fs");
const Fastify = require("fastify");
const fastifyStaticPlugin = require("@fastify/static");
const React = require("react");
const { renderToPipeableStream } = require("react-server-dom-webpack/server");
const AppImport = require("../src/App.jsx");

const App = AppImport.default || AppImport;

const MANIFEST = readFileSync(
  path.resolve(__dirname, "../dist/react-client-manifest.json"),
  "utf-8",
);

const MODULE_MAP = JSON.parse(MANIFEST);
const PORT = process.env.PORT || 3000;

const fastify = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
    },
  },
});

fastify.register(fastifyStaticPlugin, {
  root: path.resolve(__dirname, "../dist"),
  prefix: "/assets/",
});

fastify.register(fastifyStaticPlugin, {
  root: path.resolve(__dirname, "../public"),
  decorateReply: false,
});

fastify.get("/", async function rootHandler(req, reply) {
  return reply.sendFile("index.html");
});

fastify.get("/react-flight", function reactFlightHandler(request, reply) {
  try {
    const stream = renderToPipeableStream(
      React.createElement(App),
      MODULE_MAP,
      {
        identifierPrefix: "flight-",
      },
    );

    reply.header("Content-Type", "application/octet-stream");
    return new Promise((resolve, reject) => {
      stream.pipe(reply.raw);
      reply.raw.on("finish", resolve);
      reply.raw.on("error", reject);
    });
  } catch (err) {
    request.log.error("react-flight err", err);
    throw err;
  }
});

module.exports = async function startServer() {
  try {
    await fastify.listen({ port: PORT });
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};
