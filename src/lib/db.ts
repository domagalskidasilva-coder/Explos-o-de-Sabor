import { Pool } from "pg";
import { LOJA_INFO } from "@/src/data/loja";
import { PRODUTOS } from "@/src/data/produtos";
import { createDefaultWeeklySchedule } from "@/src/lib/store-schedule";

const connectionString = process.env.DATABASE_URL?.trim();
export const isDatabaseConfigured = Boolean(connectionString);

const globalForDb = globalThis as unknown as {
  pool?: Pool;
  initPromise?: Promise<void>;
};

function createMissingDatabasePool() {
  const message = "DATABASE_URL nao configurada. Defina em .env.local";

  return {
    query: async () => {
      throw new Error(message);
    },
    connect: async () => {
      throw new Error(message);
    },
  } as unknown as Pool;
}

export const pool =
  isDatabaseConfigured && connectionString
    ? (globalForDb.pool ??
      new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
        max: 10,
      }))
    : createMissingDatabasePool();

if (process.env.NODE_ENV !== "production" && isDatabaseConfigured) {
  globalForDb.pool = pool;
}

async function seedInitialData() {
  const defaultWeeklySchedule = createDefaultWeeklySchedule("08:00", "19:00");

  const productsCountResult = await pool.query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM products",
  );
  const productsCount = Number(productsCountResult.rows[0]?.count ?? 0);

  if (productsCount === 0) {
    for (const product of PRODUTOS) {
      await pool.query(
        `INSERT INTO products
          (id, nome, categoria, subcategoria, descricao_curta, preco_cents, imagem, disponivel, destaque, variacoes_json)
         VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          product.id,
          product.nome,
          product.categoria,
          product.subcategoria,
          product.descricaoCurta,
          Math.round(product.preco * 100),
          product.imagem,
          product.disponivel,
          Boolean(product.destaque),
          JSON.stringify(product.variacoes ?? []),
        ],
      );
    }
  }

  await pool.query(
    `INSERT INTO store_settings (id, service_days, opening_time, closing_time, weekly_schedule_json, is_closed, closure_reason, closure_start_date, closure_end_date)
     VALUES (1, 'Segunda, Terca, Quarta, Quinta, Sexta, Sabado', '08:00', '19:00', $1::jsonb, false, NULL, NULL, NULL)
     ON CONFLICT (id) DO NOTHING`,
    [JSON.stringify(defaultWeeklySchedule)],
  );

  await pool.query(
    `INSERT INTO coupons (code, discount_type, discount_value, active)
     VALUES ('BEMVINDO10', 'percent', 10, true)
     ON CONFLICT (code) DO NOTHING`,
  );
}

async function ensureDatabaseMigrations() {
  await pool.query(`
    ALTER TABLE products
    DROP CONSTRAINT IF EXISTS products_categoria_check;

    ALTER TABLE products
    ADD CONSTRAINT products_categoria_check
    CHECK (categoria IN ('doce', 'salgado', 'bebida'));

    ALTER TABLE store_settings
    ADD COLUMN IF NOT EXISTS service_days TEXT;

    ALTER TABLE store_settings
    ADD COLUMN IF NOT EXISTS closure_start_date DATE;

    ALTER TABLE store_settings
    ADD COLUMN IF NOT EXISTS closure_end_date DATE;

    ALTER TABLE store_settings
    ADD COLUMN IF NOT EXISTS weekly_schedule_json JSONB NOT NULL DEFAULT '[]'::jsonb;

    UPDATE store_settings
    SET service_days = 'Terca a quinta'
    WHERE service_days IS NULL OR BTRIM(service_days) = '';

    UPDATE store_settings
    SET weekly_schedule_json = '[]'::jsonb
    WHERE weekly_schedule_json IS NULL;

    ALTER TABLE store_settings
    ALTER COLUMN service_days SET DEFAULT 'Terca a quinta';

    ALTER TABLE store_settings
    ALTER COLUMN service_days SET NOT NULL;

    ALTER TABLE products
    ADD COLUMN IF NOT EXISTS variacoes_json JSONB NOT NULL DEFAULT '[]'::jsonb;

    ALTER TABLE order_items
    ADD COLUMN IF NOT EXISTS variation_id TEXT;

    ALTER TABLE order_items
    ADD COLUMN IF NOT EXISTS variation_name TEXT;
  `);
}

export async function initializeDatabase() {
  if (!isDatabaseConfigured) {
    return;
  }

  if (!globalForDb.initPromise) {
    globalForDb.initPromise = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          nome TEXT NOT NULL,
          categoria TEXT NOT NULL CHECK (categoria IN ('doce', 'salgado', 'bebida')),
          subcategoria TEXT NOT NULL,
          descricao_curta TEXT NOT NULL,
          preco_cents INTEGER NOT NULL CHECK (preco_cents >= 0),
          imagem TEXT NOT NULL,
          disponivel BOOLEAN NOT NULL DEFAULT true,
          destaque BOOLEAN NOT NULL DEFAULT false,
          variacoes_json JSONB NOT NULL DEFAULT '[]'::jsonb,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS coupons (
          id BIGSERIAL PRIMARY KEY,
          code TEXT NOT NULL UNIQUE,
          discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
          discount_value INTEGER NOT NULL CHECK (discount_value > 0),
          active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS store_settings (
          id INTEGER PRIMARY KEY,
          service_days TEXT NOT NULL DEFAULT 'Terca a quinta',
          opening_time TEXT NOT NULL,
          closing_time TEXT NOT NULL,
          weekly_schedule_json JSONB NOT NULL DEFAULT '[]'::jsonb,
          is_closed BOOLEAN NOT NULL DEFAULT false,
          closure_reason TEXT,
          closure_start_date DATE,
          closure_end_date DATE,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CHECK (id = 1)
        );

        CREATE TABLE IF NOT EXISTS orders (
          id BIGSERIAL PRIMARY KEY,
          customer_name TEXT NOT NULL,
          customer_address TEXT NOT NULL,
          payment_method TEXT NOT NULL,
          subtotal_cents INTEGER NOT NULL,
          discount_cents INTEGER NOT NULL DEFAULT 0,
          total_cents INTEGER NOT NULL,
          coupon_code TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS order_items (
          id BIGSERIAL PRIMARY KEY,
          order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
          product_id TEXT NOT NULL,
          product_name TEXT NOT NULL,
          variation_id TEXT,
          variation_name TEXT,
          quantity INTEGER NOT NULL CHECK (quantity > 0),
          unit_price_cents INTEGER NOT NULL,
          subtotal_cents INTEGER NOT NULL
        );
      `);

      await ensureDatabaseMigrations();
      await seedInitialData();

      const horario = LOJA_INFO.horario?.trim();
      if (horario && !/^todo:/i.test(horario)) {
        const match = horario.match(/(\d{1,2})h.*?(\d{1,2})h/i);
        if (match) {
          const openingTime = `${match[1].padStart(2, "0")}:00`;
          const closingTime = `${match[2].padStart(2, "0")}:00`;
          const weeklySchedule = createDefaultWeeklySchedule(
            openingTime,
            closingTime,
          );
          await pool.query(
            `UPDATE store_settings
             SET opening_time = $1,
                 closing_time = $2,
                 weekly_schedule_json = $3::jsonb,
                 updated_at = NOW()
             WHERE id = 1`,
            [openingTime, closingTime, JSON.stringify(weeklySchedule)],
          );
        }
      }
    })();
  }

  await globalForDb.initPromise;
  await ensureDatabaseMigrations();
}
