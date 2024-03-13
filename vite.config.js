// Copyright (c) 2024 anabrid GmbH
// Contact: https://www.anabrid.com/licensing/
// SPDX-License-Identifier: MIT OR GPL-2.0-or-later

import { defineConfig, loadEnv } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

/* Read this very code's version from package.json */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { execSync } from 'node:child_process'

import { marked } from 'marked';

// Read file to memory, path relative to repo root.
const slurp = (filename) => readFileSync(fileURLToPath(new URL(filename, import.meta.url)), 'utf8');

const pkg = JSON.parse(slurp("package.json"));
const githash = execSync("git rev-parse --short HEAD").toString().trimEnd();

// we use the environment variable access method from node.js and not
// from vite. Vite requires variables to be prepended with VITE_ and is weird.
const environ = process.env // loadEnv("production", process.cwd())
const env = (key, fallback_val) => key in environ ? environ[key] : fallback_val

const globals = {
  lucidac_gui_version: pkg.version,
  lucidac_gui_githash: githash,

  // headless builds are inteded to be servered without an endpoint in mind.
  // The opposite is a build intended to be served from a Teensy ("not headless").
  // An example for a headless build is the usage on some http://*.anabrid.dev/ server.
  headless_build: env("HEADLESS_BUILD", "false") === "true",
  
  // suitable endpoint URLs are either explicit, such as "http://192.168.1.123/api"
  // or using loopback magic such as "http://127.0.0.1:1234/api"
  // or are relative to where the SPA is hosted from, i.e. "/api"
  default_lucidac_endpoint: "http://192.168.150.113/api",

  // Used for instance in <title> elements
  application_name: "LUCIDAC-GUI",

  // Fully qualified application name including version
  application_name_and_version: `LUCIDAC-GUI/${pkg.version}+${githash}`,

  // Data source name for Senitry performance monitor
  senitry_dsn: "https://1945f70e4e7a79fda4bcc0b6e321d1c7@sentry.anabrid.dev/2"
}

// Just an easy compile-time text inserter.
const textfiles = {
  'README_HTML': marked.parse(slurp("README.md"))
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    {
      name: 'update-static-index-html-deployment-infos',
      transformIndexHtml: {
        enforce: 'pre',
        transform: (html) => {
          return html.replace(
            /CODE-NAME-AND-VERSION/,
            globals.application_name_and_version
          )
        }
      }
    }
  
  ],
  resolve: {
    alias: {
      '@': "/src",
    }
  },
  define: {
    globals,
    textfiles
  },
  base: './', // use relative paths
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        sourcemapBaseUrl: env("SOURCEMAP_BASE_URL", undefined)
      }
    }
  }
})
