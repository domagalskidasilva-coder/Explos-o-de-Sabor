import { randomUUID } from "node:crypto";
import { initializeDatabase, pool } from "@/src/lib/db";
import type { CartLine, PaymentMethod } from "@/src/types/cart";
import type { Product } from "@/src/types/product";

export interface Coupon {
  id: number;
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  active: boolean;
}

export interface StoreSettings {
  serviceDays: string;
  openingTime: string;
  closingTime: string;
  isClosed: boolean;
  closureReason: string | null;
  closureStartDate: string | null;
  closureEndDate: string | null;
  effectiveIsClosed: boolean;
  scheduledClosureActive: boolean;
}

export interface DashboardMetrics {
  totalRevenueCents: number;
  totalDiscountCents: number;
  totalOrders: number;
  avgTicketCents: number;
  availableProducts: number;
  unavailableProducts: number;
}

function getBrazilDateStamp(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(date);
}

function isScheduledClosureActive(
  startDate: string | null,
  endDate: string | null,
) {
  if (!startDate || !endDate) {
    return false;
  }

  const today = getBrazilDateStamp();
  return today >= startDate && today <= endDate;
}

function mapProduct(row: {
  id: string;
  nome: string;
  categoria: Product["categoria"];
  subcategoria: string;
  descricao_curta: string;
  preco_cents: number;
  imagem: string;
  disponivel: boolean;
  destaque: boolean;
}): Product {
  return {
    id: row.id,
    nome: row.nome,
    categoria: row.categoria,
    subcategoria: row.subcategoria,
    descricaoCurta: row.descricao_curta,
    preco: Number(row.preco_cents) / 100,
    imagem: row.imagem,
    disponivel: row.disponivel,
    destaque: row.destaque,
  };
}

export async function listProducts(options?: { onlyAvailable?: boolean }) {
  await initializeDatabase();

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (options?.onlyAvailable) {
    params.push(true);
    conditions.push(`disponivel = $${params.length}`);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await pool.query<{
    id: string;
    nome: string;
    categoria: Product["categoria"];
    subcategoria: string;
    descricao_curta: string;
    preco_cents: number;
    imagem: string;
    disponivel: boolean;
    destaque: boolean;
  }>(
    `SELECT id, nome, categoria, subcategoria, descricao_curta, preco_cents, imagem, disponivel, destaque
     FROM products
     ${whereClause}
     ORDER BY categoria, subcategoria, nome`,
    params,
  );

  return result.rows.map(mapProduct);
}

export async function listProductsByIds(ids: string[]) {
  await initializeDatabase();

  if (ids.length === 0) {
    return [] as Product[];
  }

  const result = await pool.query<{
    id: string;
    nome: string;
    categoria: Product["categoria"];
    subcategoria: string;
    descricao_curta: string;
    preco_cents: number;
    imagem: string;
    disponivel: boolean;
    destaque: boolean;
  }>(
    `SELECT id, nome, categoria, subcategoria, descricao_curta, preco_cents, imagem, disponivel, destaque
     FROM products
     WHERE id = ANY($1::text[])`,
    [ids],
  );

  return result.rows.map(mapProduct);
}

export async function createProduct(
  input: Omit<Product, "id"> & { id?: string },
) {
  await initializeDatabase();

  const id = input.id?.trim() || `prod-${randomUUID().slice(0, 8)}`;

  const result = await pool.query<{
    id: string;
    nome: string;
    categoria: Product["categoria"];
    subcategoria: string;
    descricao_curta: string;
    preco_cents: number;
    imagem: string;
    disponivel: boolean;
    destaque: boolean;
  }>(
    `INSERT INTO products
      (id, nome, categoria, subcategoria, descricao_curta, preco_cents, imagem, disponivel, destaque, updated_at)
     VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
     RETURNING id, nome, categoria, subcategoria, descricao_curta, preco_cents, imagem, disponivel, destaque`,
    [
      id,
      input.nome,
      input.categoria,
      input.subcategoria,
      input.descricaoCurta,
      Math.round(input.preco * 100),
      input.imagem,
      input.disponivel,
      Boolean(input.destaque),
    ],
  );

  return mapProduct(result.rows[0]);
}

export async function updateProduct(id: string, input: Omit<Product, "id">) {
  await initializeDatabase();

  const result = await pool.query<{
    id: string;
    nome: string;
    categoria: Product["categoria"];
    subcategoria: string;
    descricao_curta: string;
    preco_cents: number;
    imagem: string;
    disponivel: boolean;
    destaque: boolean;
  }>(
    `UPDATE products
     SET nome = $2,
         categoria = $3,
         subcategoria = $4,
         descricao_curta = $5,
         preco_cents = $6,
         imagem = $7,
         disponivel = $8,
         destaque = $9,
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, nome, categoria, subcategoria, descricao_curta, preco_cents, imagem, disponivel, destaque`,
    [
      id,
      input.nome,
      input.categoria,
      input.subcategoria,
      input.descricaoCurta,
      Math.round(input.preco * 100),
      input.imagem,
      input.disponivel,
      Boolean(input.destaque),
    ],
  );

  if (!result.rows[0]) {
    throw new Error("Produto nao encontrado.");
  }

  return mapProduct(result.rows[0]);
}

export async function deleteProduct(id: string) {
  await initializeDatabase();
  await pool.query("DELETE FROM products WHERE id = $1", [id]);
}

export async function listCoupons() {
  await initializeDatabase();

  const result = await pool.query<{
    id: number;
    code: string;
    discount_type: "percent" | "fixed";
    discount_value: number;
    active: boolean;
  }>(
    `SELECT id, code, discount_type, discount_value, active
     FROM coupons
     ORDER BY active DESC, code ASC`,
  );

  return result.rows.map(
    (row) =>
      ({
        id: row.id,
        code: row.code,
        discountType: row.discount_type,
        discountValue: Number(row.discount_value),
        active: row.active,
      }) satisfies Coupon,
  );
}

export async function createCoupon(input: {
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  active?: boolean;
}) {
  await initializeDatabase();

  const result = await pool.query<{
    id: number;
    code: string;
    discount_type: "percent" | "fixed";
    discount_value: number;
    active: boolean;
  }>(
    `INSERT INTO coupons (code, discount_type, discount_value, active, updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     RETURNING id, code, discount_type, discount_value, active`,
    [
      input.code.trim().toUpperCase(),
      input.discountType,
      input.discountValue,
      input.active ?? true,
    ],
  );

  const row = result.rows[0];
  return {
    id: row.id,
    code: row.code,
    discountType: row.discount_type,
    discountValue: Number(row.discount_value),
    active: row.active,
  } satisfies Coupon;
}

export async function updateCoupon(
  id: number,
  input: {
    code: string;
    discountType: "percent" | "fixed";
    discountValue: number;
    active: boolean;
  },
) {
  await initializeDatabase();

  const result = await pool.query<{
    id: number;
    code: string;
    discount_type: "percent" | "fixed";
    discount_value: number;
    active: boolean;
  }>(
    `UPDATE coupons
     SET code = $2,
         discount_type = $3,
         discount_value = $4,
         active = $5,
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, code, discount_type, discount_value, active`,
    [
      id,
      input.code.trim().toUpperCase(),
      input.discountType,
      input.discountValue,
      input.active,
    ],
  );

  if (!result.rows[0]) {
    throw new Error("Cupom nao encontrado.");
  }

  const row = result.rows[0];
  return {
    id: row.id,
    code: row.code,
    discountType: row.discount_type,
    discountValue: Number(row.discount_value),
    active: row.active,
  } satisfies Coupon;
}

export async function deleteCoupon(id: number) {
  await initializeDatabase();
  await pool.query("DELETE FROM coupons WHERE id = $1", [id]);
}

export async function getStoreSettings() {
  await initializeDatabase();

  const result = await pool.query<{
    service_days: string;
    opening_time: string;
    closing_time: string;
    is_closed: boolean;
    closure_reason: string | null;
    closure_start_date: string | null;
    closure_end_date: string | null;
  }>(
    `SELECT service_days, opening_time, closing_time, is_closed, closure_reason, closure_start_date::text, closure_end_date::text
     FROM store_settings
     WHERE id = 1`,
  );

  const row = result.rows[0];
  const scheduledClosureActive = isScheduledClosureActive(
    row.closure_start_date,
    row.closure_end_date,
  );

  return {
    serviceDays: row.service_days,
    openingTime: row.opening_time,
    closingTime: row.closing_time,
    isClosed: row.is_closed,
    closureReason: row.closure_reason,
    closureStartDate: row.closure_start_date,
    closureEndDate: row.closure_end_date,
    effectiveIsClosed: row.is_closed || scheduledClosureActive,
    scheduledClosureActive,
  } satisfies StoreSettings;
}

export async function updateStoreSettings(input: StoreSettings) {
  await initializeDatabase();
  await pool.query(
    `UPDATE store_settings
     SET service_days = $1,
         opening_time = $2,
         closing_time = $3,
         is_closed = $4,
         closure_reason = $5,
         closure_start_date = $6,
         closure_end_date = $7,
         updated_at = NOW()
     WHERE id = 1`,
    [
      input.serviceDays.trim(),
      input.openingTime,
      input.closingTime,
      input.isClosed,
      input.closureReason?.trim() || null,
      input.closureStartDate || null,
      input.closureEndDate || null,
    ],
  );
}

export async function getDashboardMetrics() {
  await initializeDatabase();

  const [ordersResult, productsResult] = await Promise.all([
    pool.query<{
      revenue: string;
      discount: string;
      total_orders: string;
      avg_ticket: string;
    }>(
      `SELECT
        COALESCE(SUM(total_cents), 0)::text AS revenue,
        COALESCE(SUM(discount_cents), 0)::text AS discount,
        COUNT(*)::text AS total_orders,
        COALESCE(AVG(total_cents), 0)::text AS avg_ticket
       FROM orders`,
    ),
    pool.query<{ available_products: string; unavailable_products: string }>(
      `SELECT
         COUNT(*) FILTER (WHERE disponivel = true)::text AS available_products,
         COUNT(*) FILTER (WHERE disponivel = false)::text AS unavailable_products
       FROM products`,
    ),
  ]);

  const orders = ordersResult.rows[0];
  const products = productsResult.rows[0];

  return {
    totalRevenueCents: Number(orders.revenue),
    totalDiscountCents: Number(orders.discount),
    totalOrders: Number(orders.total_orders),
    avgTicketCents: Math.round(Number(orders.avg_ticket)),
    availableProducts: Number(products.available_products),
    unavailableProducts: Number(products.unavailable_products),
  } satisfies DashboardMetrics;
}

export async function applyCoupon(code: string, subtotalCents: number) {
  await initializeDatabase();

  if (!code.trim()) {
    return { couponCode: null, discountCents: 0 };
  }

  const normalizedCode = code.trim().toUpperCase();
  const result = await pool.query<{
    code: string;
    discount_type: "percent" | "fixed";
    discount_value: number;
    active: boolean;
  }>(
    `SELECT code, discount_type, discount_value, active
     FROM coupons
     WHERE code = $1`,
    [normalizedCode],
  );

  const coupon = result.rows[0];

  if (!coupon || !coupon.active) {
    return { couponCode: null, discountCents: 0 };
  }

  const rawDiscount =
    coupon.discount_type === "percent"
      ? Math.round((subtotalCents * Number(coupon.discount_value)) / 100)
      : Number(coupon.discount_value);

  return {
    couponCode: coupon.code,
    discountCents: Math.min(subtotalCents, Math.max(0, rawDiscount)),
  };
}

export async function createOrder(input: {
  customerName: string;
  customerAddress: string;
  paymentMethod: PaymentMethod;
  lines: CartLine[];
  couponCode?: string;
}) {
  await initializeDatabase();

  const sanitizedLines = input.lines
    .map((line) => ({
      productId: line.productId,
      quantity: Math.max(0, Math.floor(line.quantity)),
    }))
    .filter((line) => line.quantity > 0);

  if (sanitizedLines.length === 0) {
    throw new Error("Carrinho vazio.");
  }

  const products = await listProductsByIds(
    sanitizedLines.map((line) => line.productId),
  );
  const productsById = new Map(
    products.map((product) => [product.id, product]),
  );

  const orderItems = sanitizedLines.flatMap((line) => {
    const product = productsById.get(line.productId);
    if (!product || !product.disponivel) {
      return [];
    }

    return [
      {
        productId: product.id,
        productName: product.nome,
        quantity: line.quantity,
        unitPriceCents: Math.round(product.preco * 100),
        subtotalCents: Math.round(product.preco * 100) * line.quantity,
        product,
      },
    ];
  });

  if (orderItems.length === 0) {
    throw new Error("Nenhum item valido para checkout.");
  }

  const subtotalCents = orderItems.reduce(
    (total, item) => total + item.subtotalCents,
    0,
  );
  const couponApplied = await applyCoupon(
    input.couponCode ?? "",
    subtotalCents,
  );
  const totalCents = Math.max(0, subtotalCents - couponApplied.discountCents);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const orderResult = await client.query<{ id: string }>(
      `INSERT INTO orders
        (customer_name, customer_address, payment_method, subtotal_cents, discount_cents, total_cents, coupon_code)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id::text AS id`,
      [
        input.customerName.trim(),
        input.customerAddress.trim(),
        input.paymentMethod,
        subtotalCents,
        couponApplied.discountCents,
        totalCents,
        couponApplied.couponCode,
      ],
    );

    const orderId = Number(orderResult.rows[0].id);

    for (const item of orderItems) {
      await client.query(
        `INSERT INTO order_items
          (order_id, product_id, product_name, quantity, unit_price_cents, subtotal_cents)
         VALUES
          ($1, $2, $3, $4, $5, $6)`,
        [
          orderId,
          item.productId,
          item.productName,
          item.quantity,
          item.unitPriceCents,
          item.subtotalCents,
        ],
      );
    }

    await client.query("COMMIT");

    return {
      orderId,
      items: orderItems.map((item) => ({
        productId: item.productId,
        product: item.product,
        quantity: item.quantity,
        subtotalCents: item.subtotalCents,
      })),
      subtotalCents,
      discountCents: couponApplied.discountCents,
      totalCents,
      couponCode: couponApplied.couponCode,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
