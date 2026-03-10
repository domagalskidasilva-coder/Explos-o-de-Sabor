import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminRequest } from "@/src/lib/admin-auth";
import { getStoreSettings, updateStoreSettings } from "@/src/lib/repositories";

export async function GET(request: Request) {
  try {
    const unauthorized = await requireAdminRequest(request);
    if (unauthorized) {
      return unauthorized;
    }

    const settings = await getStoreSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("GET /api/admin/store-settings error", error);
    return NextResponse.json(
      { error: "Falha ao carregar configuracoes da loja." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const unauthorized = await requireAdminRequest(request);
    if (unauthorized) {
      return unauthorized;
    }

    const payload = (await request.json()) as {
      serviceDays?: string;
      openingTime?: string;
      closingTime?: string;
      isClosed?: boolean;
      closureReason?: string | null;
      closureStartDate?: string | null;
      closureEndDate?: string | null;
    };

    if (!payload.serviceDays?.trim()) {
      throw new Error("Informe os dias de atendimento da loja.");
    }

    if (!payload.openingTime || !payload.closingTime) {
      throw new Error("Horario de abertura e fechamento sao obrigatorios.");
    }

    if (
      (payload.closureStartDate && !payload.closureEndDate) ||
      (!payload.closureStartDate && payload.closureEndDate)
    ) {
      throw new Error(
        "Informe a data inicial e a data final do fechamento programado.",
      );
    }

    if (
      payload.closureStartDate &&
      payload.closureEndDate &&
      payload.closureEndDate < payload.closureStartDate
    ) {
      throw new Error(
        "A data final do fechamento nao pode ser anterior a data inicial.",
      );
    }

    await updateStoreSettings({
      serviceDays: payload.serviceDays.trim(),
      openingTime: payload.openingTime,
      closingTime: payload.closingTime,
      isClosed: Boolean(payload.isClosed),
      closureReason: payload.closureReason ?? null,
      closureStartDate: payload.closureStartDate ?? null,
      closureEndDate: payload.closureEndDate ?? null,
      effectiveIsClosed: false,
      scheduledClosureActive: false,
    });

    revalidatePath("/");
    revalidatePath("/cardapio");

    const settings = await getStoreSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao salvar configuracoes.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
