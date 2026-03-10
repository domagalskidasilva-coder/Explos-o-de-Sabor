import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminRequest } from "@/src/lib/admin-auth";
import { getStoreSettings, updateStoreSettings } from "@/src/lib/repositories";
import {
  formatWeeklyScheduleSummary,
  type WeeklyScheduleDay,
} from "@/src/lib/store-schedule";

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
      { error: "Falha ao carregar configurações da loja." },
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
      weeklySchedule?: WeeklyScheduleDay[];
      isClosed?: boolean;
      closureReason?: string | null;
      closureStartDate?: string | null;
      closureEndDate?: string | null;
    };

    if (
      !Array.isArray(payload.weeklySchedule) ||
      payload.weeklySchedule.length !== 7
    ) {
      throw new Error("Informe a grade semanal completa da loja.");
    }

    const openDays = payload.weeklySchedule.filter((day) => day.open);

    if (openDays.length === 0) {
      throw new Error("Marque pelo menos um dia de funcionamento.");
    }

    for (const day of openDays) {
      if (!day.openingTime || !day.closingTime) {
        throw new Error(`Preencha abertura e fechamento para ${day.label}.`);
      }

      if (day.closingTime <= day.openingTime) {
        throw new Error(
          `O fechamento de ${day.label} precisa ser depois da abertura.`,
        );
      }
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
        "A data final do fechamento não pode ser anterior à data inicial.",
      );
    }

    const firstOpenDay = openDays[0]!;
    const serviceDays = formatWeeklyScheduleSummary(payload.weeklySchedule);

    await updateStoreSettings({
      serviceDays,
      openingTime: firstOpenDay.openingTime,
      closingTime: firstOpenDay.closingTime,
      weeklySchedule: payload.weeklySchedule,
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
      error instanceof Error ? error.message : "Falha ao salvar configurações.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
