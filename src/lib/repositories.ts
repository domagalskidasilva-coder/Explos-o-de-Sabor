import { randomUUID } from "node:crypto";
import { LOJA_INFO } from "@/src/data/loja";
import { PRODUTOS } from "@/src/data/produtos";
import { initializeDatabase, isDatabaseConfigured, pool } from "@/src/lib/db";
import {
  createDefaultWeeklySchedule,
  formatWeeklyScheduleSummary,
  getCurrentWeekdayKey,
  isDayScheduleOpenNow,
  normalizeWeeklySchedule,
  type WeeklyScheduleDay,
} from "@/src/lib/store-schedule";
import type { CartLine, OrderType, PaymentMethod } from "@/src/types/cart";
import type { Product, ProductVariation } from "@/src/types/product";

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
  weeklySchedule: WeeklyScheduleDay[];
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

export type OrderStatus = "pending" | "accepted" | "rejected";

export interface OrderActionOutcome {
  orderId: number;
  status: OrderStatus;
  customerName: string;
  alreadyFinalized: boolean;
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
  variacoes_json: unknown;
}): Product {
  const parsedVariations = Array.isArray(row.variacoes_json)
    ? row.variacoes_json.flatMap((variation) => {
        if (
          !variation ||
          typeof variation !== "object" ||
          !("id" in variation) ||
          !("nome" in variation) ||
          !("preco" in variation) ||
          typeof variation.id !== "string" ||
          typeof variation.nome !== "string"
        ) {
          return [];
        }

        const price = Number(variation.preco);
        if (!Number.isFinite(price) || price < 0) {
          return [];
        }

        return [
          {
            id: variation.id,
            nome: variation.nome,
            preco: price,
          } satisfies ProductVariation,
        ];
      })
    : [];

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
    variacoes: parsedVariations,
  };
}

function getFallbackProducts(options?: { onlyAvailable?: boolean }) {
  const products = options?.onlyAvailable
    ? PRODUTOS.filter((product) => product.disponivel)
    : PRODUTOS;

  return [...products].sort((a, b) => {
    if (a.categoria !== b.categoria) {
      return a.categoria.localeCompare(b.categoria);
    }

    if (a.subcategoria !== b.subcategoria) {
      return a.subcategoria.localeCompare(b.subcategoria);
    }

    return a.nome.localeCompare(b.nome);
  });
}

function normalizeVariations(
  variations: ProductVariation[] | undefined,
): ProductVariation[] {
  if (!Array.isArray(variations)) {
    return [];
  }

  return variations.flatMap((variation, index) => {
    const nome = variation.nome?.trim();
    const preco = Number(variation.preco);

    if (!nome || !Number.isFinite(preco) || preco < 0) {
      return [];
    }

    return [
      {
        id: variation.id?.trim() || `var-${index + 1}`,
        nome,
        preco,
      } satisfies ProductVariation,
    ];
  });
}

function getProductUnitPriceCents(
  product: Product,
  variationId?: string | null,
) {
  const variation = variationId
    ? product.variacoes?.find((item) => item.id === variationId)
    : null;

  return {
    variation: variation ?? null,
    unitPriceCents: Math.round((variation?.preco ?? product.preco) * 100),
  };
}

function parseFallbackHours() {
  const horario = LOJA_INFO.horario?.trim() ?? "";
  const match = horario.match(/(\d{1,2})h.*?(\d{1,2})h/i);

  if (!match) {
    return { openingTime: "08:00", closingTime: "19:00" };
  }

  return {
    openingTime: `${match[1].padStart(2, "0")}:00`,
    closingTime: `${match[2].padStart(2, "0")}:00`,
  };
}

function getFallbackStoreSettings(): StoreSettings {
  const hours = parseFallbackHours();
  const weeklySchedule = createDefaultWeeklySchedule(
    hours.openingTime,
    hours.closingTime,
  );

  return {
    serviceDays: formatWeeklyScheduleSummary(weeklySchedule),
    openingTime: hours.openingTime,
    closingTime: hours.closingTime,
    weeklySchedule,
    isClosed: false,
    closureReason: null,
    closureStartDate: null,
    closureEndDate: null,
    effectiveIsClosed: false,
    scheduledClosureActive: false,
  };
}

function assertDatabaseConfigured() {
  if (!isDatabaseConfigured) {
    throw new Error("DATABASE_URL não configurada. Defina em .env.local");
  }
}

export async function listProducts(options?: { onlyAvailable?: boolean }) {
  if (!isDatabaseConfigured) {
    return getFallbackProducts(options);
  }

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
    variacoes_json: unknown;
  }>(
    `SELECT id, nome, categoria, subcategoria, descricao_curta, preco_cents, imagem, disponivel, destaque, variacoes_json
     FROM products
     ${whereClause}
     ORDER BY categoria, subcategoria, nome`,
    params,
  );

  return result.rows.map(mapProduct);
}

export async function listProductsByIds(ids: string[]) {
  if (!isDatabaseConfigured) {
    if (ids.length === 0) {
      return [] as Product[];
    }

    const idsSet = new Set(ids);
    return PRODUTOS.filter((product) => idsSet.has(product.id));
  }

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
    variacoes_json: unknown;
  }>(
    `SELECT id, nome, categoria, subcategoria, descricao_curta, preco_cents, imagem, disponivel, destaque, variacoes_json
     FROM products
     WHERE id = ANY($1::text[])`,
    [ids],
  );

  return result.rows.map(mapProduct);
}

export async function createProduct(
  input: Omit<Product, "id"> & { id?: string },
) {
  assertDatabaseConfigured();
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
    variacoes_json: unknown;
  }>(
    `INSERT INTO products
      (id, nome, categoria, subcategoria, descricao_curta, preco_cents, imagem, disponivel, destaque, variacoes_json, updated_at)
     VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
     RETURNING id, nome, categoria, subcategoria, descricao_curta, preco_cents, imagem, disponivel, destaque, variacoes_json`,
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
      JSON.stringify(normalizeVariations(input.variacoes)),
    ],
  );

  return mapProduct(result.rows[0]);
}

export async function updateProduct(id: string, input: Omit<Product, "id">) {
  assertDatabaseConfigured();
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
    variacoes_json: unknown;
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
         variacoes_json = $10,
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, nome, categoria, subcategoria, descricao_curta, preco_cents, imagem, disponivel, destaque, variacoes_json`,
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
      JSON.stringify(normalizeVariations(input.variacoes)),
    ],
  );

  if (!result.rows[0]) {
    throw new Error("Produto não encontrado.");
  }

  return mapProduct(result.rows[0]);
}

export async function deleteProduct(id: string) {
  assertDatabaseConfigured();
  await initializeDatabase();
  await pool.query("DELETE FROM products WHERE id = $1", [id]);
}

export async function listCoupons() {
  assertDatabaseConfigured();
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
  assertDatabaseConfigured();
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
  assertDatabaseConfigured();
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
    throw new Error("Cupom não encontrado.");
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
  assertDatabaseConfigured();
  await initializeDatabase();
  await pool.query("DELETE FROM coupons WHERE id = $1", [id]);
}

export async function getStoreSettings() {
  if (!isDatabaseConfigured) {
    return getFallbackStoreSettings();
  }

  await initializeDatabase();

  const result = await pool.query<{
    service_days: string;
    opening_time: string;
    closing_time: string;
    weekly_schedule_json: unknown;
    is_closed: boolean;
    closure_reason: string | null;
    closure_start_date: string | null;
    closure_end_date: string | null;
  }>(
    `SELECT service_days, opening_time, closing_time, weekly_schedule_json, is_closed, closure_reason, closure_start_date::text, closure_end_date::text
     FROM store_settings
     WHERE id = 1`,
  );

  const row = result.rows[0];
  const weeklySchedule = normalizeWeeklySchedule(
    row.weekly_schedule_json,
    row.opening_time,
    row.closing_time,
  );
  const currentDaySchedule = weeklySchedule.find(
    (day) => day.key === getCurrentWeekdayKey(),
  );
  const scheduledClosureActive = isScheduledClosureActive(
    row.closure_start_date,
    row.closure_end_date,
  );
  const scheduleClosed = !isDayScheduleOpenNow(currentDaySchedule);
  const serviceDays = formatWeeklyScheduleSummary(weeklySchedule);
  const openingTime = currentDaySchedule?.openingTime ?? row.opening_time;
  const closingTime = currentDaySchedule?.closingTime ?? row.closing_time;

  return {
    serviceDays,
    openingTime,
    closingTime,
    weeklySchedule,
    isClosed: row.is_closed,
    closureReason: row.closure_reason,
    closureStartDate: row.closure_start_date,
    closureEndDate: row.closure_end_date,
    effectiveIsClosed:
      row.is_closed || scheduledClosureActive || scheduleClosed,
    scheduledClosureActive,
  } satisfies StoreSettings;
}

export async function updateStoreSettings(input: StoreSettings) {
  assertDatabaseConfigured();
  await initializeDatabase();
  await pool.query(
    `UPDATE store_settings
     SET service_days = $1,
         opening_time = $2,
         closing_time = $3,
         weekly_schedule_json = $4::jsonb,
         is_closed = $5,
         closure_reason = $6,
         closure_start_date = $7,
         closure_end_date = $8,
         updated_at = NOW()
     WHERE id = 1`,
    [
      input.serviceDays.trim(),
      input.openingTime,
      input.closingTime,
      JSON.stringify(input.weeklySchedule),
      input.isClosed,
      input.closureReason?.trim() || null,
      input.closureStartDate || null,
      input.closureEndDate || null,
    ],
  );
}

export async function getDashboardMetrics() {
  assertDatabaseConfigured();
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
  if (!isDatabaseConfigured) {
    return { couponCode: null, discountCents: 0 };
  }

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
  customerPhone?: string;
  customerAddress: string;
  customerNeighborhood?: string;
  customerComplement?: string;
  orderType: OrderType;
  deliveryFeeCents?: number;
  paymentMethod: PaymentMethod;
  lines: CartLine[];
  couponCode?: string;
}) {
  const actionToken = randomUUID();
  const sanitizedLines = input.lines
    .map((line) => ({
      productId: line.productId,
      variationId: line.variationId?.trim() || null,
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

    if (
      line.variationId &&
      !product.variacoes?.some((variation) => variation.id === line.variationId)
    ) {
      return [];
    }

    const pricing = getProductUnitPriceCents(product, line.variationId);

    return [
      {
        productId: product.id,
        variationId: line.variationId,
        quantity: line.quantity,
        ...pricing,
        productName: product.nome,
        variationName: pricing.variation?.nome ?? null,
        subtotalCents: pricing.unitPriceCents * line.quantity,
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
  const deliveryFeeCents = Math.max(0, input.deliveryFeeCents ?? 0);
  const totalCents = Math.max(
    0,
    subtotalCents - couponApplied.discountCents + deliveryFeeCents,
  );

  if (!isDatabaseConfigured) {
    return {
      orderId: Date.now(),
      orderToken: null,
      status: "pending" as OrderStatus,
      createdAt: new Date().toISOString(),
      customerPhone: input.customerPhone?.trim() || null,
      customerNeighborhood: input.customerNeighborhood?.trim() || null,
      customerComplement: input.customerComplement?.trim() || null,
      orderType: input.orderType,
      deliveryFeeCents,
      items: orderItems.map((item) => ({
        productId: item.productId,
        variationId: item.variationId,
        lineId: `${item.productId}:${item.variationId ?? "padrao"}`,
        product: item.product,
        variationName: item.variationName,
        unitPriceCents: item.unitPriceCents,
        quantity: item.quantity,
        subtotalCents: item.subtotalCents,
      })),
      subtotalCents,
      discountCents: couponApplied.discountCents,
      totalCents,
      couponCode: couponApplied.couponCode,
    };
  }

  await initializeDatabase();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const orderResult = await client.query<{ id: string; created_at: string }>(
      `INSERT INTO orders
        (customer_name, customer_phone, customer_address, customer_neighborhood, customer_complement, order_type, delivery_fee_cents, payment_method, status, action_token, subtotal_cents, discount_cents, total_cents, coupon_code)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9, $10, $11, $12, $13)
       RETURNING id::text AS id, created_at::text`,
      [
        input.customerName.trim(),
        input.customerPhone?.trim() || null,
        input.customerAddress.trim(),
        input.customerNeighborhood?.trim() || null,
        input.customerComplement?.trim() || null,
        input.orderType,
        deliveryFeeCents,
        input.paymentMethod,
        actionToken,
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
          (order_id, product_id, product_name, variation_id, variation_name, quantity, unit_price_cents, subtotal_cents)
         VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          orderId,
          item.productId,
          item.productName,
          item.variationId,
          item.variationName,
          item.quantity,
          item.unitPriceCents,
          item.subtotalCents,
        ],
      );
    }

    await client.query("COMMIT");

    return {
      orderId,
      orderToken: actionToken,
      status: "pending" as OrderStatus,
      createdAt: orderResult.rows[0].created_at,
      customerPhone: input.customerPhone?.trim() || null,
      customerNeighborhood: input.customerNeighborhood?.trim() || null,
      customerComplement: input.customerComplement?.trim() || null,
      orderType: input.orderType,
      deliveryFeeCents,
      items: orderItems.map((item) => ({
        productId: item.productId,
        variationId: item.variationId,
        lineId: `${item.productId}:${item.variationId ?? "padrao"}`,
        product: item.product,
        variationName: item.variationName,
        unitPriceCents: item.unitPriceCents,
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

export async function applyPublicOrderAction(
  token: string,
  nextStatus: Extract<OrderStatus, "accepted" | "rejected">,
) {
  assertDatabaseConfigured();
  await initializeDatabase();

  const timestampColumn =
    nextStatus === "accepted" ? "accepted_at" : "rejected_at";

  const result = await pool.query<{
    id: string;
    previous_status: OrderStatus;
    status: OrderStatus;
    customer_name: string;
  }>(
    `WITH target AS (
       SELECT id, status, customer_name
       FROM orders
       WHERE action_token = $1
     ),
     updated AS (
       UPDATE orders
       SET status = CASE
             WHEN status = 'pending' THEN $2
             ELSE status
           END,
           ${timestampColumn} = CASE
             WHEN status = 'pending' THEN NOW()
             ELSE ${timestampColumn}
           END
       WHERE action_token = $1
       RETURNING id, status
     )
     SELECT updated.id::text AS id,
            target.status AS previous_status,
            updated.status,
            target.customer_name
     FROM updated
     JOIN target ON target.id = updated.id`,
    [token, nextStatus],
  );

  const row = result.rows[0];

  if (!row) {
    throw new Error("Pedido não encontrado ou link inválido.");
  }

  return {
    orderId: Number(row.id),
    status: row.status,
    customerName: row.customer_name,
    alreadyFinalized: row.previous_status !== "pending",
  } satisfies OrderActionOutcome;
}
