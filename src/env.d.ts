/// <reference path="../.astro/types.d.ts" />
/// <reference types="@cloudflare/workers-types" />

// Binding Cloudflare disponibili in Astro.locals.runtime.env
interface Env {
  DB: import('@cloudflare/workers-types').D1Database;
  // KV, R2, AI aggiunti nelle fasi 1C/1D
}

type CfRuntime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
  interface Locals extends CfRuntime {}
}
