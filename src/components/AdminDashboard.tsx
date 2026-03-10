"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency, formatCurrencyFromCents } from "@/src/lib/format";
import {
  formatWeeklyScheduleLines,
  formatWeeklyScheduleSummary,
  type WeeklyScheduleDay,
} from "@/src/lib/store-schedule";
import type { Product, ProductVariation } from "@/src/types/product";

type DiscountType = "percent" | "fixed";
type AdminSection = "visao-geral" | "produtos" | "cupons" | "loja";

interface Coupon {
  id: number;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  active: boolean;
}

interface DashboardMetrics {
  totalRevenueCents: number;
  totalDiscountCents: number;
  totalOrders: number;
  avgTicketCents: number;
  availableProducts: number;
  unavailableProducts: number;
}

interface StoreSettings {
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

const emptyProduct: Omit<Product, "id"> = {
  nome: "",
  categoria: "doce",
  subcategoria: "",
  descricaoCurta: "",
  preco: 0,
  imagem: "/images/produtos/kit-churros-coxinhas.png",
  disponivel: true,
  destaque: false,
  variacoes: [],
};

const emptyCoupon = {
  code: "",
  discountType: "percent" as DiscountType,
  discountValue: 10,
  active: true,
};

function updateWeeklyScheduleDay(
  schedule: WeeklyScheduleDay[],
  key: WeeklyScheduleDay["key"],
  updates: Partial<WeeklyScheduleDay>,
) {
  const nextSchedule = schedule.map((day) =>
    day.key === key ? { ...day, ...updates } : day,
  );

  const firstOpenDay = nextSchedule.find((day) => day.open) ?? nextSchedule[0]!;

  return {
    weeklySchedule: nextSchedule,
    serviceDays: formatWeeklyScheduleSummary(nextSchedule),
    openingTime: firstOpenDay.openingTime,
    closingTime: firstOpenDay.closingTime,
  };
}

const sections: Array<{
  id: AdminSection;
  label: string;
  description: string;
}> = [
  {
    id: "visao-geral",
    label: "Visão geral",
    description: "Lucro, pedidos e resumo operacional.",
  },
  {
    id: "produtos",
    label: "Produtos",
    description: "Cadastrar, editar e remover itens do site.",
  },
  {
    id: "cupons",
    label: "Cupons",
    description: "Controlar descontos e campanhas ativas.",
  },
  {
    id: "loja",
    label: "Loja",
    description: "Dias, horário e fechamento da operação.",
  },
];

function getSectionButtonClasses(active: boolean) {
  return active
    ? "border-espresso bg-[linear-gradient(135deg,rgba(70,10,31,0.98),rgba(110,18,45,0.94))] text-sugar shadow-[0_16px_28px_rgba(70,10,31,0.22)]"
    : "border-caramel/16 bg-white/78 text-espresso hover:border-caramel/34 hover:bg-white";
}

function formatBrazilianDecimalValue(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.max(0, value));
}

function parseBrazilianDecimalValue(value: string) {
  const cleaned = value.trim().replace(/[^\d,.]/g, "");

  if (!cleaned) {
    return 0;
  }

  let normalized = cleaned;

  if (cleaned.includes(",")) {
    const [integerPart, decimalPart = ""] = cleaned
      .replace(/\./g, "")
      .split(",");
    normalized = `${integerPart || "0"}.${decimalPart}`;
  } else if (cleaned.includes(".")) {
    const parts = cleaned.split(".");
    const decimalPart = parts[parts.length - 1] ?? "";
    const dotCount = (cleaned.match(/\./g) ?? []).length;

    if (dotCount > 1 || decimalPart.length === 3) {
      normalized = cleaned.replace(/\./g, "");
    } else {
      parts.pop();
      normalized = `${parts.join("") || "0"}.${decimalPart}`;
    }
  }

  const numericValue = Number(normalized);
  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return 0;
  }

  return numericValue;
}

function createEmptyVariation(index: number): ProductVariation {
  return {
    id: `var-${index + 1}`,
    nome: "",
    preco: 0,
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeSection, setActiveSection] =
    useState<AdminSection>("visao-geral");
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [productForm, setProductForm] =
    useState<Omit<Product, "id">>(emptyProduct);
  const [productPriceInput, setProductPriceInput] = useState("");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [couponForm, setCouponForm] = useState(emptyCoupon);
  const [editingCouponId, setEditingCouponId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }, [products]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [productsRes, couponsRes, dashboardRes, settingsRes] =
        await Promise.all([
          fetch("/api/admin/products"),
          fetch("/api/admin/coupons"),
          fetch("/api/admin/dashboard"),
          fetch("/api/admin/store-settings"),
        ]);

      if (
        productsRes.status === 401 ||
        couponsRes.status === 401 ||
        dashboardRes.status === 401 ||
        settingsRes.status === 401
      ) {
        router.replace("/admin/login");
        router.refresh();
        return;
      }

      const productsPayload = (await productsRes.json()) as {
        products?: Product[];
        error?: string;
      };
      const couponsPayload = (await couponsRes.json()) as {
        coupons?: Coupon[];
        error?: string;
      };
      const dashboardPayload = (await dashboardRes.json()) as {
        metrics?: DashboardMetrics;
        error?: string;
      };
      const settingsPayload = (await settingsRes.json()) as {
        settings?: StoreSettings;
        error?: string;
      };

      if (!productsRes.ok) {
        throw new Error(productsPayload.error ?? "Falha ao carregar produtos.");
      }
      if (!couponsRes.ok) {
        throw new Error(couponsPayload.error ?? "Falha ao carregar cupons.");
      }
      if (!dashboardRes.ok) {
        throw new Error(
          dashboardPayload.error ?? "Falha ao carregar dashboard.",
        );
      }
      if (!settingsRes.ok) {
        throw new Error(
          settingsPayload.error ?? "Falha ao carregar configurações.",
        );
      }

      setProducts(productsPayload.products ?? []);
      setCoupons(couponsPayload.coupons ?? []);
      setMetrics(dashboardPayload.metrics ?? null);
      setSettings(settingsPayload.settings ?? null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Falha ao carregar painel.",
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  function resetProductForm() {
    setEditingProductId(null);
    setProductForm(emptyProduct);
    setProductPriceInput("");
  }

  function resetCouponForm() {
    setEditingCouponId(null);
    setCouponForm(emptyCoupon);
  }

  function updateProductPriceInput(value: string) {
    const sanitized = value.replace(/[^\d,.]/g, "");
    setProductPriceInput(sanitized);
    setProductForm((current) => ({
      ...current,
      preco: parseBrazilianDecimalValue(sanitized),
    }));
  }

  function addProductVariation() {
    setProductForm((current) => ({
      ...current,
      variacoes: [
        ...(current.variacoes ?? []),
        createEmptyVariation((current.variacoes ?? []).length),
      ],
    }));
  }

  function updateProductVariation(
    index: number,
    field: keyof ProductVariation,
    value: string,
  ) {
    setProductForm((current) => ({
      ...current,
      variacoes: (current.variacoes ?? []).map((variation, variationIndex) => {
        if (variationIndex !== index) {
          return variation;
        }

        if (field === "preco") {
          return {
            ...variation,
            preco: parseBrazilianDecimalValue(value),
          };
        }

        return {
          ...variation,
          [field]: value,
        };
      }),
    }));
  }

  function removeProductVariation(index: number) {
    setProductForm((current) => ({
      ...current,
      variacoes: (current.variacoes ?? []).filter(
        (_, variationIndex) => variationIndex !== index,
      ),
    }));
  }

  async function uploadProductImage(file: File) {
    setUploadingImage(true);
    setError(null);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/admin/uploads", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as {
        imagePath?: string;
        error?: string;
      };

      if (!response.ok || !payload.imagePath) {
        throw new Error(payload.error ?? "Falha ao enviar imagem.");
      }

      setProductForm((current) => ({
        ...current,
        imagem: payload.imagePath!,
      }));
      setMessage("Imagem enviada com sucesso.");
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Falha ao enviar imagem.",
      );
    } finally {
      setUploadingImage(false);
    }
  }

  async function submitProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const endpoint = editingProductId
        ? `/api/admin/products/${editingProductId}`
        : "/api/admin/products";
      const method = editingProductId ? "PUT" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productForm),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Falha ao salvar produto.");
      }

      setMessage(editingProductId ? "Produto atualizado." : "Produto criado.");
      resetProductForm();
      await loadAll();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Falha ao salvar produto.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeProduct(id: string) {
    if (!window.confirm("Deseja excluir este produto?")) {
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Falha ao excluir produto.");
      }

      setMessage("Produto excluído.");
      if (editingProductId === id) {
        resetProductForm();
      }
      await loadAll();
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : "Falha ao excluir produto.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function submitCoupon(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const endpoint = editingCouponId
        ? `/api/admin/coupons/${editingCouponId}`
        : "/api/admin/coupons";
      const method = editingCouponId ? "PUT" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(couponForm),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Falha ao salvar cupom.");
      }

      setMessage(editingCouponId ? "Cupom atualizado." : "Cupom criado.");
      resetCouponForm();
      await loadAll();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Falha ao salvar cupom.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeCoupon(id: number) {
    if (!window.confirm("Deseja excluir este cupom?")) {
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Falha ao excluir cupom.");
      }

      setMessage("Cupom excluído.");
      if (editingCouponId === id) {
        resetCouponForm();
      }
      await loadAll();
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : "Falha ao excluir cupom.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!settings) {
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/store-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Falha ao salvar atendimento.");
      }

      setMessage("Configurações de atendimento salvas.");
      await loadAll();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Falha ao salvar atendimento.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  function renderOverviewSection() {
    return (
      <section className="space-y-6">
        <div className="panel p-5 sm:p-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-cocoa/82">
            Visão geral
          </p>
          <h2 className="mt-2 text-3xl text-espresso">
            Resumo rápido da operação
          </h2>
          <p className="mt-2 text-sm leading-7 text-espresso/76">
            Lucro, pedidos e volume de itens ativos em uma leitura curta.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="panel p-4">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-cocoa/80">
              Lucro total
            </p>
            <p className="mt-2 text-3xl font-extrabold text-espresso">
              {formatCurrencyFromCents(metrics?.totalRevenueCents ?? 0)}
            </p>
          </article>
          <article className="panel p-4">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-cocoa/80">
              Pedidos
            </p>
            <p className="mt-2 text-3xl font-extrabold text-espresso">
              {metrics?.totalOrders ?? 0}
            </p>
          </article>
          <article className="panel p-4">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-cocoa/80">
              Ticket médio
            </p>
            <p className="mt-2 text-3xl font-extrabold text-espresso">
              {formatCurrencyFromCents(metrics?.avgTicketCents ?? 0)}
            </p>
          </article>
          <article className="panel p-4">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-cocoa/80">
              Descontos
            </p>
            <p className="mt-2 text-3xl font-extrabold text-espresso">
              {formatCurrencyFromCents(metrics?.totalDiscountCents ?? 0)}
            </p>
          </article>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <article className="panel p-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-cocoa/82">
              Catálogo
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-caramel/20 bg-white/70 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-cocoa/76">
                  Produtos ativos
                </p>
                <p className="mt-2 text-3xl font-extrabold text-espresso">
                  {metrics?.availableProducts ?? 0}
                </p>
              </div>
              <div className="rounded-2xl border border-caramel/20 bg-white/70 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-cocoa/76">
                  Produtos pausados
                </p>
                <p className="mt-2 text-3xl font-extrabold text-espresso">
                  {metrics?.unavailableProducts ?? 0}
                </p>
              </div>
            </div>
          </article>

          <article className="panel p-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-cocoa/82">
              Loja
            </p>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-caramel/20 bg-white/70 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-cocoa/76">
                  Atendimento
                </p>
                <p className="mt-2 text-xl font-extrabold text-espresso">
                  {settings?.serviceDays ?? "Não configurado"}
                </p>
                {settings ? (
                  <div className="mt-2 space-y-1 text-sm leading-6 text-espresso/72">
                    {formatWeeklyScheduleLines(settings.weeklySchedule).map(
                      (line) => (
                        <p key={line}>{line}</p>
                      ),
                    )}
                  </div>
                ) : null}
              </div>
              <div className="rounded-2xl border border-caramel/20 bg-white/70 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-cocoa/76">
                  Status
                </p>
                <p className="mt-2 text-xl font-extrabold text-espresso">
                  {settings?.effectiveIsClosed
                    ? "Fechado temporariamente"
                    : "Aberto"}
                </p>
                {settings?.closureReason ? (
                  <p className="mt-2 text-sm leading-6 text-espresso/72">
                    {settings.closureReason}
                  </p>
                ) : null}
                {settings?.closureStartDate && settings?.closureEndDate ? (
                  <p className="mt-2 text-sm leading-6 text-espresso/72">
                    Programado de {settings.closureStartDate} até{" "}
                    {settings.closureEndDate}
                  </p>
                ) : null}
              </div>
            </div>
          </article>
        </div>
      </section>
    );
  }

  function renderProductsSection() {
    return (
      <section className="space-y-6">
        <div className="panel p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-cocoa/82">
                Produtos
              </p>
              <h2 className="mt-2 text-3xl text-espresso">
                Cardápio conectado ao site
              </h2>
            </div>
            <button
              type="button"
              onClick={resetProductForm}
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-caramel/28 bg-white/80 px-4 text-xs font-extrabold uppercase tracking-[0.09em] text-espresso"
            >
              Novo cadastro
            </button>
          </div>

          <form onSubmit={submitProduct} className="mt-5 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="rounded-xl border border-caramel/25 bg-sugar px-3 py-2"
                placeholder="Nome"
                value={productForm.nome}
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    nome: event.target.value,
                  }))
                }
              />
              <select
                className="rounded-xl border border-caramel/25 bg-sugar px-3 py-2"
                value={productForm.categoria}
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    categoria: event.target.value as Product["categoria"],
                  }))
                }
              >
                <option value="doce">Doce</option>
                <option value="salgado">Salgado</option>
                <option value="bebida">Bebida</option>
              </select>
            </div>
            <input
              className="w-full rounded-xl border border-caramel/25 bg-sugar px-3 py-2"
              placeholder="Subcategoria"
              value={productForm.subcategoria}
              onChange={(event) =>
                setProductForm((current) => ({
                  ...current,
                  subcategoria: event.target.value,
                }))
              }
            />
            <input
              className="w-full rounded-xl border border-caramel/25 bg-sugar px-3 py-2"
              placeholder="Descrição curta"
              value={productForm.descricaoCurta}
              onChange={(event) =>
                setProductForm((current) => ({
                  ...current,
                  descricaoCurta: event.target.value,
                }))
              }
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-cocoa/80">
                  Valor do produto
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  className="rounded-xl border border-caramel/25 bg-sugar px-3 py-2"
                  placeholder="Ex.: 40,00"
                  value={productPriceInput}
                  onChange={(event) =>
                    updateProductPriceInput(event.target.value)
                  }
                  onBlur={() =>
                    setProductPriceInput((current) =>
                      current
                        ? formatBrazilianDecimalValue(
                            parseBrazilianDecimalValue(current),
                          )
                        : "",
                    )
                  }
                />
                <p className="text-xs leading-5 text-espresso/72">
                  Digite no formato brasileiro. Ex.: `40,00`. Preview:{" "}
                  <strong>{formatCurrency(productForm.preco)}</strong>. Se o
                  produto tiver variações, esse valor fica como preço base.
                </p>
              </label>
              <div className="grid gap-2">
                <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-cocoa/80">
                  Imagem do produto
                </span>
                <label className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-caramel/25 bg-white/80 px-4 text-sm font-bold text-espresso transition hover:bg-oat">
                  {uploadingImage ? "Enviando imagem..." : "Fazer upload"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    disabled={uploadingImage}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        void uploadProductImage(file);
                      }
                      event.currentTarget.value = "";
                    }}
                  />
                </label>
                <input
                  className="rounded-xl border border-caramel/25 bg-sugar px-3 py-2"
                  placeholder="URL da imagem"
                  value={productForm.imagem}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      imagem: event.target.value,
                    }))
                  }
                />
                <p className="text-xs leading-5 text-espresso/72">
                  Upload aceita JPG, PNG e WEBP até 5 MB. Se quiser, ainda pode
                  colar a URL manualmente.
                </p>
              </div>
            </div>
            <div className="rounded-[1.4rem] border border-caramel/18 bg-white/66 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-cocoa/80">
                    Variações do produto
                  </p>
                  <p className="mt-1 text-xs leading-5 text-espresso/72">
                    Use para cadastrar sabores, tamanhos ou opções com nomes e
                    valores diferentes no mesmo produto.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addProductVariation}
                  className="inline-flex min-h-10 items-center justify-center rounded-xl border border-caramel/25 bg-white/80 px-4 text-xs font-extrabold uppercase tracking-[0.08em] text-espresso"
                >
                  Adicionar opção
                </button>
              </div>

              {productForm.variacoes?.length ? (
                <div className="mt-4 space-y-3">
                  {productForm.variacoes.map((variation, index) => (
                    <div
                      key={`${variation.id}-${index}`}
                      className="grid gap-3 rounded-[1.1rem] border border-caramel/16 bg-sugar/88 p-3 sm:grid-cols-[minmax(0,1fr)_12rem_auto]"
                    >
                      <input
                        className="rounded-xl border border-caramel/25 bg-white px-3 py-2"
                        placeholder="Nome da opção"
                        value={variation.nome}
                        onChange={(event) =>
                          updateProductVariation(
                            index,
                            "nome",
                            event.target.value,
                          )
                        }
                      />
                      <input
                        type="text"
                        inputMode="decimal"
                        className="rounded-xl border border-caramel/25 bg-white px-3 py-2"
                        placeholder="Ex.: 7,50"
                        value={formatBrazilianDecimalValue(variation.preco)}
                        onChange={(event) =>
                          updateProductVariation(
                            index,
                            "preco",
                            event.target.value,
                          )
                        }
                      />
                      <button
                        type="button"
                        onClick={() => removeProductVariation(index)}
                        className="inline-flex min-h-10 items-center justify-center rounded-xl border border-danger/25 bg-white px-3 text-xs font-extrabold uppercase tracking-[0.08em] text-danger"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm leading-6 text-espresso/70">
                  Sem variações cadastradas. O site usará apenas o preço base.
                </p>
              )}
            </div>
            <div className="overflow-hidden rounded-[1.4rem] border border-caramel/18 bg-white/66 p-3">
              <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-cocoa/80">
                Preview da imagem
              </p>
              <div className="mt-3 flex min-h-48 items-center justify-center rounded-[1.1rem] bg-oat/55 p-3">
                {productForm.imagem ? (
                  <Image
                    src={productForm.imagem}
                    alt="Preview da imagem do produto"
                    width={640}
                    height={384}
                    className="h-auto max-h-[26rem] w-full object-contain"
                  />
                ) : (
                  <p className="px-4 text-center text-sm leading-6 text-espresso/66">
                    Envie uma imagem ou preencha a URL para visualizar aqui.
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-espresso">
                <input
                  type="checkbox"
                  checked={productForm.disponivel}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      disponivel: event.target.checked,
                    }))
                  }
                />
                Disponível
              </label>
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-espresso">
                <input
                  type="checkbox"
                  checked={Boolean(productForm.destaque)}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      destaque: event.target.checked,
                    }))
                  }
                />
                Destaque
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={saving || uploadingImage}
                className="inline-flex min-h-10 items-center justify-center rounded-xl bg-espresso px-4 text-xs font-extrabold uppercase tracking-[0.09em] text-sugar"
              >
                {editingProductId ? "Salvar edição" : "Criar produto"}
              </button>
              {editingProductId ? (
                <button
                  type="button"
                  onClick={resetProductForm}
                  className="inline-flex min-h-10 items-center justify-center rounded-xl border border-caramel/30 bg-white/80 px-4 text-xs font-extrabold uppercase tracking-[0.09em] text-espresso"
                >
                  Cancelar
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="panel overflow-hidden p-0">
          <div className="border-b border-caramel/16 px-5 py-4">
            <h3 className="text-2xl text-espresso">Itens cadastrados</h3>
          </div>
          <div className="max-h-[32rem] overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/70 text-xs uppercase tracking-[0.08em] text-cocoa/80">
                <tr>
                  <th className="px-4 py-3">Produto</th>
                  <th className="px-4 py-3">Preço</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {sortedProducts.map((product) => (
                  <tr key={product.id} className="border-t border-caramel/16">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-espresso">
                        {product.nome}
                      </p>
                      <p className="text-xs text-espresso/70">
                        {product.subcategoria}
                      </p>
                      {product.variacoes?.length ? (
                        <p className="mt-1 text-xs text-espresso/70">
                          {product.variacoes
                            .map(
                              (variation) =>
                                `${variation.nome} (${formatCurrency(variation.preco)})`,
                            )
                            .join(" • ")}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 font-semibold text-espresso">
                      {product.variacoes?.length
                        ? `${product.variacoes.length} opções`
                        : formatCurrency(product.preco)}
                    </td>
                    <td className="px-4 py-3 text-xs font-bold uppercase tracking-[0.08em] text-cocoa">
                      {product.disponivel ? "Disponível" : "Indisponível"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="rounded-lg border border-caramel/30 px-2 py-1 text-xs font-bold text-espresso"
                          onClick={() => {
                            setEditingProductId(product.id);
                            setProductForm({
                              nome: product.nome,
                              categoria: product.categoria,
                              subcategoria: product.subcategoria,
                              descricaoCurta: product.descricaoCurta,
                              preco: product.preco,
                              imagem: product.imagem,
                              disponivel: product.disponivel,
                              destaque: Boolean(product.destaque),
                              variacoes: product.variacoes ?? [],
                            });
                            setProductPriceInput(
                              formatBrazilianDecimalValue(product.preco),
                            );
                            setActiveSection("produtos");
                          }}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border border-danger/30 px-2 py-1 text-xs font-bold text-danger"
                          onClick={() => void removeProduct(product.id)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
  }

  function renderCouponsSection() {
    return (
      <section className="space-y-6">
        <div className="panel p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-cocoa/82">
                Cupons
              </p>
              <h2 className="mt-2 text-3xl text-espresso">
                Descontos e campanhas
              </h2>
            </div>
            <button
              type="button"
              onClick={resetCouponForm}
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-caramel/28 bg-white/80 px-4 text-xs font-extrabold uppercase tracking-[0.09em] text-espresso"
            >
              Novo cupom
            </button>
          </div>

          <form onSubmit={submitCoupon} className="mt-4 space-y-3">
            <input
              className="w-full rounded-xl border border-caramel/25 bg-sugar px-3 py-2"
              placeholder="Código"
              value={couponForm.code}
              onChange={(event) =>
                setCouponForm((current) => ({
                  ...current,
                  code: event.target.value.toUpperCase(),
                }))
              }
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                className="rounded-xl border border-caramel/25 bg-sugar px-3 py-2"
                value={couponForm.discountType}
                onChange={(event) =>
                  setCouponForm((current) => ({
                    ...current,
                    discountType: event.target.value as DiscountType,
                  }))
                }
              >
                <option value="percent">Percentual (%)</option>
                <option value="fixed">Fixo (centavos)</option>
              </select>
              <input
                type="number"
                min={1}
                className="rounded-xl border border-caramel/25 bg-sugar px-3 py-2"
                value={couponForm.discountValue}
                onChange={(event) =>
                  setCouponForm((current) => ({
                    ...current,
                    discountValue: Number(event.target.value) || 1,
                  }))
                }
              />
            </div>
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-espresso">
              <input
                type="checkbox"
                checked={couponForm.active}
                onChange={(event) =>
                  setCouponForm((current) => ({
                    ...current,
                    active: event.target.checked,
                  }))
                }
              />
              Cupom ativo
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex min-h-10 items-center justify-center rounded-xl bg-espresso px-4 text-xs font-extrabold uppercase tracking-[0.09em] text-sugar"
              >
                {editingCouponId ? "Salvar cupom" : "Criar cupom"}
              </button>
              {editingCouponId ? (
                <button
                  type="button"
                  onClick={resetCouponForm}
                  className="inline-flex min-h-10 items-center justify-center rounded-xl border border-caramel/30 bg-white/80 px-4 text-xs font-extrabold uppercase tracking-[0.09em] text-espresso"
                >
                  Cancelar
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="grid gap-3">
          {coupons.map((coupon) => (
            <article key={coupon.id} className="panel p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-extrabold text-espresso">
                    {coupon.code}
                  </p>
                  <p className="mt-1 text-sm text-espresso/72">
                    {coupon.discountType === "percent"
                      ? `${coupon.discountValue}%`
                      : formatCurrencyFromCents(coupon.discountValue)}
                    {coupon.active ? " ativo" : " inativo"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-caramel/30 px-3 py-1.5 text-xs font-bold text-espresso"
                    onClick={() => {
                      setEditingCouponId(coupon.id);
                      setCouponForm({
                        code: coupon.code,
                        discountType: coupon.discountType,
                        discountValue: coupon.discountValue,
                        active: coupon.active,
                      });
                      setActiveSection("cupons");
                    }}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-danger/30 px-3 py-1.5 text-xs font-bold text-danger"
                    onClick={() => void removeCoupon(coupon.id)}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  function renderStoreSection() {
    return (
      <section className="space-y-6">
        <div className="panel p-5 sm:p-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-cocoa/82">
            Loja
          </p>
          <h2 className="mt-2 text-3xl text-espresso">
            Atendimento e disponibilidade
          </h2>
          <p className="mt-2 text-sm leading-7 text-espresso/76">
            Ajuste os dias, a abertura, o fechamento e bloqueie a loja quando
            necessário.
          </p>
        </div>

        {settings ? (
          <form onSubmit={saveSettings} className="panel space-y-4 p-5 sm:p-6">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-[0.08em] text-cocoa/82">
                Funcionamento por dia
              </label>
              <p className="mt-2 text-xs leading-5 text-espresso/70">
                Marque os dias em que a loja abre. Em cada dia ativo, defina o
                horário de abertura e fechamento.
              </p>
            </div>
            <div className="space-y-3 rounded-2xl border border-caramel/16 bg-white/60 p-4">
              {settings.weeklySchedule.map((day) => (
                <div
                  key={day.key}
                  className="grid gap-3 rounded-2xl border border-caramel/14 bg-sugar/72 p-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.8fr)] sm:items-center"
                >
                  <label className="inline-flex items-center gap-3 text-sm font-semibold text-espresso">
                    <input
                      type="checkbox"
                      checked={day.open}
                      onChange={(event) =>
                        setSettings((current) =>
                          current
                            ? {
                                ...current,
                                ...updateWeeklyScheduleDay(
                                  current.weeklySchedule,
                                  day.key,
                                  { open: event.target.checked },
                                ),
                              }
                            : current,
                        )
                      }
                    />
                    {day.label}
                  </label>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-[0.08em] text-cocoa/82">
                      Abertura
                    </label>
                    <input
                      type="time"
                      disabled={!day.open}
                      className="w-full rounded-xl border border-caramel/25 bg-sugar px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={day.openingTime}
                      onChange={(event) =>
                        setSettings((current) =>
                          current
                            ? {
                                ...current,
                                ...updateWeeklyScheduleDay(
                                  current.weeklySchedule,
                                  day.key,
                                  { openingTime: event.target.value },
                                ),
                              }
                            : current,
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-[0.08em] text-cocoa/82">
                      Fechamento
                    </label>
                    <input
                      type="time"
                      disabled={!day.open}
                      className="w-full rounded-xl border border-caramel/25 bg-sugar px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={day.closingTime}
                      onChange={(event) =>
                        setSettings((current) =>
                          current
                            ? {
                                ...current,
                                ...updateWeeklyScheduleDay(
                                  current.weeklySchedule,
                                  day.key,
                                  { closingTime: event.target.value },
                                ),
                              }
                            : current,
                        )
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs leading-5 text-espresso/70">
              Resumo automático: {settings.serviceDays}
            </p>
            <div className="space-y-4 rounded-2xl border border-caramel/16 bg-white/60 p-4">
              <label className="inline-flex items-center gap-3 text-sm font-semibold text-espresso">
                <input
                  type="checkbox"
                  checked={settings.isClosed}
                  onChange={(event) =>
                    setSettings((current) =>
                      current
                        ? {
                            ...current,
                            isClosed: event.target.checked,
                            closureReason: event.target.checked
                              ? current.closureReason
                              : current.closureReason,
                          }
                        : current,
                    )
                  }
                />
                Fechar estabelecimento agora
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-[0.08em] text-cocoa/82">
                    Fechado de
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-xl border border-caramel/25 bg-sugar px-3 py-2"
                    value={settings.closureStartDate ?? ""}
                    onChange={(event) =>
                      setSettings((current) =>
                        current
                          ? {
                              ...current,
                              closureStartDate: event.target.value || null,
                            }
                          : current,
                      )
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-[0.08em] text-cocoa/82">
                    Até
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-xl border border-caramel/25 bg-sugar px-3 py-2"
                    value={settings.closureEndDate ?? ""}
                    onChange={(event) =>
                      setSettings((current) =>
                        current
                          ? {
                              ...current,
                              closureEndDate: event.target.value || null,
                            }
                          : current,
                      )
                    }
                  />
                </div>
              </div>
              <p className="text-xs leading-5 text-espresso/70">
                Use esse intervalo para programar feriados, pausas ou eventos
                especiais sem precisar fechar manualmente no dia.
              </p>
            </div>
            {settings.isClosed ||
            settings.closureStartDate ||
            settings.closureEndDate ? (
              <textarea
                className="w-full rounded-xl border border-caramel/25 bg-sugar px-3 py-2"
                rows={4}
                placeholder="Motivo do fechamento ou observação"
                value={settings.closureReason ?? ""}
                onChange={(event) =>
                  setSettings((current) =>
                    current
                      ? { ...current, closureReason: event.target.value }
                      : current,
                  )
                }
              />
            ) : null}
            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex min-h-10 items-center justify-center rounded-xl bg-espresso px-4 text-xs font-extrabold uppercase tracking-[0.09em] text-sugar"
              >
                Salvar atendimento
              </button>
            </div>
          </form>
        ) : null}
      </section>
    );
  }

  function renderActiveSection() {
    if (activeSection === "produtos") {
      return renderProductsSection();
    }

    if (activeSection === "cupons") {
      return renderCouponsSection();
    }

    if (activeSection === "loja") {
      return renderStoreSection();
    }

    return renderOverviewSection();
  }

  if (loading && !metrics) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
        <section className="panel-soft p-6">
          <p className="text-sm text-espresso/80">
            Carregando painel administrativo...
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 lg:px-6 lg:py-10">
      <section className="panel-dark mb-6 overflow-hidden px-6 py-6 text-sugar sm:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="badge-flour">Painel administrativo</p>
            <h1 className="mt-4 text-4xl leading-tight text-sugar sm:text-5xl">
              Gestão interna da operação.
            </h1>
            <p className="mt-4 text-sm leading-8 text-sugar/74">
              Catálogo, cupons e disponibilidade da loja organizados em uma
              interface mais clara para leitura e ação rápida.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="surface-card-dark p-4">
              <p className="section-kicker text-biscuit/78">Produtos</p>
              <p className="mt-2 text-3xl font-extrabold text-sugar">
                {products.length}
              </p>
            </div>
            <div className="surface-card-dark p-4">
              <p className="section-kicker text-biscuit/78">Cupons</p>
              <p className="mt-2 text-3xl font-extrabold text-sugar">
                {coupons.length}
              </p>
            </div>
            <div className="surface-card-dark p-4">
              <p className="section-kicker text-biscuit/78">Loja</p>
              <p className="mt-2 text-xl font-extrabold text-sugar">
                {settings?.isClosed ? "Fechada" : "Aberta"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] xl:grid-cols-[20rem_minmax(0,1fr)]">
        <aside className="panel-soft h-fit p-4 sm:p-5 lg:sticky lg:top-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-cocoa/82">
            Painel admin
          </p>
          <h1 className="mt-2 text-3xl text-espresso">Explosão de Sabor</h1>
          <p className="mt-2 text-sm leading-7 text-espresso/76">
            Área interna da empresa com navegação separada por sessão.
          </p>

          <div className="mt-5 flex flex-col gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`rounded-2xl border px-4 py-3 text-left transition ${getSectionButtonClasses(
                  activeSection === section.id,
                )}`}
              >
                <p className="text-sm font-extrabold uppercase tracking-[0.08em]">
                  {section.label}
                </p>
                <p
                  className={`mt-1 text-xs leading-5 ${
                    activeSection === section.id
                      ? "text-sugar/82"
                      : "text-espresso/72"
                  }`}
                >
                  {section.description}
                </p>
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="panel-inset p-4">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-cocoa/76">
                Produtos
              </p>
              <p className="mt-2 text-3xl font-extrabold text-espresso">
                {products.length}
              </p>
            </div>
            <div className="panel-inset p-4">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-cocoa/76">
                Cupons
              </p>
              <p className="mt-2 text-3xl font-extrabold text-espresso">
                {coupons.length}
              </p>
            </div>
            <div className="panel-inset p-4">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-cocoa/76">
                Status
              </p>
              <p className="mt-2 text-xl font-extrabold text-espresso">
                {settings?.isClosed ? "Fechado" : "Aberto"}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-caramel/30 bg-white/80 px-4 text-xs font-extrabold uppercase tracking-[0.09em] text-espresso"
            >
              Ver site
            </Link>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-espresso px-4 text-xs font-extrabold uppercase tracking-[0.09em] text-sugar"
            >
              Sair
            </button>
          </div>
        </aside>

        <div className="space-y-5">
          {message ? (
            <p className="rounded-[1.1rem] border border-success/15 bg-success/10 px-4 py-3 text-sm font-semibold text-success">
              {message}
            </p>
          ) : null}
          {error ? (
            <p className="rounded-[1.1rem] border border-danger/15 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">
              {error}
            </p>
          ) : null}
          {renderActiveSection()}
        </div>
      </div>
    </main>
  );
}
