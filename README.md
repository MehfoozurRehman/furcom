# furcom

A small Hono server that serves HTML pages and JSON files from a folder, paired with an Expo app that is still the starter template.

**Status:** Prototype. The API tests one idea, serving templated pages and reading, writing and deleting JSON files from disk, and the site content is placeholder text. The Expo app has not been changed from the starter.

## The problem

The repo does not state what the product is for. What the code shows is a server that treats a folder on disk as a small website and data store: each page and JSON file under `api/site` becomes an HTTP route. A mobile client in `app/` is set up alongside it, but nothing in the code connects the two yet.

## What it does

- Serves HTML files from `api/site` at routes derived from their paths. For example, `site/about.html` is served at `/site/about`.
- Wraps each page in a shared `header.html` and `footer.html`, and applies a per-folder `layout.html` that places the page content at `{{slot}}`.
- Exposes each JSON file as a route with three methods: `GET` returns the file, `POST` merges the request body into it and writes it back, and `DELETE` removes it.
- Logs each request through Hono's logger middleware.
- The Expo app uses file-based routing (expo-router) with a root stack and a single placeholder screen.

## How it's built

- The API uses Hono with `@hono/node-server`, run directly with `tsx`. It is a TypeScript ES module project.
- Routes are not written by hand. At startup, `routes/site.ts` reads the `site` directory recursively and registers a handler for each file it finds, so adding a page or JSON file adds a route.
- Templating is plain string replacement of `{{header}}`, `{{footer}}` and `{{slot}}`. There is no template engine.
- The mobile app uses Expo SDK 52, React Native 0.76, React Navigation, and expo-router with typed routes. The new architecture is enabled in `app.json`.

## Running it locally

API (serves on port 3000):

```
cd api
npm install
npm run dev     # tsx watch index.ts
```

Then open `http://localhost:3000`.

Mobile app:

```
cd app
npm install
npm start       # expo start
```

## What's left

- Path handling is hardcoded for Windows. `routes/site.ts` builds paths with `"\\"`, so the server will not find its files on macOS or Linux.
- The `POST` and `DELETE` handlers for JSON files have no authentication, and anyone who can reach the server can overwrite or delete those files.
- The `POST` and `DELETE` handlers do not return a response.
- The port is fixed at 3000 in `index.ts` and does not read an environment variable.
- The Expo app is the unmodified starter. `app/app/index.tsx` still shows the placeholder text, and `app/README.md` is the create-expo-app template. The `reset-project` script that README describes is not in `package.json`.
- The Jest configuration is present, but there are no test files.
- The site content is placeholder text. The layout file, for example, renders the words "this is layout".
- The API README covers only the two commands and does not describe the routing or the site folder conventions.
