import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export { schema };

/**
 * Restituisce l'istanza Drizzle legata al binding D1 della richiesta corrente.
 * Su Cloudflare i binding vivono in `Astro.locals.runtime.env` (in dev via platformProxy).
 *
 * Uso in una pagina .astro:
 *   import { getDb } from '../db';
 *   const db = getDb(Astro.locals);
 *   const santo = await db.query.saints.findFirst({ ... });
 */
export function getDb(locals: App.Locals) {
  const DB = locals?.runtime?.env?.DB;
  if (!DB) {
    throw new Error(
      'Binding D1 "DB" mancante in locals.runtime.env. ' +
      'Verifica wrangler.toml e platformProxy in astro.config.mjs.'
    );
  }
  return drizzle(DB, { schema });
}

export type Db = ReturnType<typeof getDb>;
