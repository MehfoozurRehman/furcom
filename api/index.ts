import { Hono } from "hono";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import site from "./routes/site.js";

const app = new Hono();

app.use(logger());

app.route("/site", site);

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
