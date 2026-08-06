// Barrel del layer dati. Su D1 il `db` è per-richiesta: usare getDb(Astro.locals).
export { getDb, schema } from '../db/db-config';
export type { Db } from '../db/db-config';
export * from '../db/schema';
