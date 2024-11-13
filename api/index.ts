import { Hono } from "hono";
import fs from "fs/promises";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";

const app = new Hono();

app.use(logger());

const root = "./site";

const files = await fs.readdir(root, { recursive: true });

const header = await fs.readFile("./template/header.html", "utf-8");
const footer = await fs.readFile("./template/footer.html", "utf-8");

const folders: {
  name: string;
  layout: string;
  files: string[];
}[] = [
  {
    name: "",
    layout: "",
    files: [],
  },
];

for (const file of files) {
  const pathParts = file.split("\\");

  for (const part of pathParts) {
    const isFolder = !part.includes(".");

    if (isFolder) {
      const folderExists = folders.find((f) => f.name === part);
      if (!folderExists) {
        folders.push({
          name: part,
          layout: "",
          files: [],
        });
      }
    } else {
      const folderName = pathParts.length > 1 ? pathParts?.at(-2) : "";
      const folder = folders.find((f) => f.name === folderName) || folders[0];

      if (part.includes("layout")) {
        folder.layout = file;
      } else {
        folder.files.push(file);
      }
    }
  }
}

for (const folder of folders) {
  const hasLayout = folder.layout !== "";
  const layoutContent = hasLayout
    ? await fs.readFile(root + "\\" + folder.layout, "utf-8")
    : "";

  for (const file of folder.files) {
    const path = file
      .replaceAll(".html", "")
      .replaceAll(".json", "")
      .replaceAll("index", "")
      .replaceAll("\\", "/")
      .replaceAll("layout", "")
      .split("/")
      .filter(Boolean)
      .join("/");

    if (file.includes(".json")) {
      app.get(`/${path}`, async (c) => {
        const content = await fs.readFile(root + "\\" + file, "utf-8");

        return c.json(JSON.parse(content));
      });

      app.post(`/${path}`, async (c) => {
        const content = await fs.readFile(root + "\\" + file, "utf-8");
        const json = JSON.parse(content);

        const body = await c.req.json();

        const newJson = {
          ...json,
          ...body,
        };

        await fs.writeFile(
          root + "\\" + file,
          JSON.stringify(newJson, null, 2)
        );
      });

      app.delete(`/${path}`, async (c) => {
        await fs.unlink(root + "\\" + file);
      });
    }

    app.get(`/${path}`, async (c) => {
      const content = await fs.readFile(root + "\\" + file, "utf-8");

      const responseContentForFile = content
        .replace("{{header}}", header)
        .replace("{{footer}}", footer);

      const responseContent = hasLayout
        ? layoutContent
            .replace("{{header}}", header)
            .replace("{{footer}}", footer)
            .replace("{{slot}}", responseContentForFile)
        : content;
      return c.html(responseContent);
    });
  }
}

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
