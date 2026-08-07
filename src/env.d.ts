/// <reference path="../.astro/types.d.ts" />
/// <reference types="@cloudflare/workers-types" />

// Binding Cloudflare disponibili in Astro.locals.runtime.env
interface Env {
  DB: import('@cloudflare/workers-types').D1Database;
  SESSION: import('@cloudflare/workers-types').KVNamespace;
  CACHE: import('@cloudflare/workers-types').KVNamespace;
  // Workers AI (binding "AI") — generatore Pagina Sacra via gateway verbum-lucis
  AI: import('@cloudflare/workers-types').Ai;

  // ─── Secret / vars (in .dev.vars per il locale, wrangler secret in prod) ───
  GEN_SECRET?: string;            // bearer che protegge /api/genera-pagina-sacra
  GEN_MODEL?: string;             // override modello (default: anthropic/claude-sonnet-4.6)
  AI_GATEWAY_NAME?: string;       // slug gateway (default: verbum-lucis)
  CF_AIG_TOKEN?: string;          // token gateway autenticato (serve al dev locale)
}

type CfRuntime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
  interface Locals extends CfRuntime {}
}
